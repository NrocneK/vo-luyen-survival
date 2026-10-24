import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { PauseMenu } from '../src/ui/PauseMenu';
import { augments } from '../src/data/augments';
import { startingSkill } from '../src/domain/profile';
import type { AugmentId } from '../src/shared/augments';
import type { EnemyState } from '../src/shared/models';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { RunEngine } from '../src/game/systems/RunEngine';
import '../src/ui/styles.css';

// Chỉ dùng tại QA dev: thẻ được rút/chọn bằng luật thật; không thêm nút gian lận vào production.
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const select = document.getElementById('augment') as HTMLSelectElement;
const status = document.getElementById('audit-status')!;
let frameAudit = false;
for (const def of Object.values(augments)) select.add(new Option(def.name, def.id));
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  return state.mode === 'menu' ? null : (
    <>
      <GameHud state={state} bridge={bridge} />
      <RunOverlays state={state} bridge={bridge} />
      {state.mode === 'paused' && !frameAudit && <PauseMenu bridge={bridge} />}
    </>
  );
}
const root = createRoot(document.getElementById('audit-hud')!);
root.render(<Hud />);
bridge.subscribe(() => {
  const state = bridge.getSnapshot();
  if (state.status === 'ready' && state.mode === 'menu') status.textContent = 'Sẵn sàng';
});
function scene() {
  return game.scene.getScene('forest') as ForestScene;
}
function engine() {
  return Reflect.get(scene(), 'engine') as RunEngine | null;
}
function publish(run: RunEngine) {
  bridge.update({
    mode: run.mode,
    run: run.view(),
    cards: [...run.choices],
    position: { ...run.position },
  });
  (Reflect.get(scene(), 'renderRun') as (dt: number) => void).call(scene(), 0);
}
function fixture(): RunEngine | null {
  if (bridge.getSnapshot().status !== 'ready') return null;
  frameAudit = false;
  if (engine()) {
    engine()!.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  const def = augments[select.value as AugmentId];
  const profile = structuredClone(bridge.getSnapshot().profile);
  profile.realm = 46;
  profile.equipped.weapon = def.skill === 'nguyen-khi-tram' ? 'thiet-kiem' : 'dong-quyen-sao';
  profile.selectedSkills = ['duong-viem-chuong', 'viem-hoan', 'loi-lien', 'cuong-the'];
  profile.activePet = null;
  profile.settings.sound = profile.settings.music = false;
  bridge.update({ profile, weapon: def.skill === 'nguyen-khi-tram' ? 'sword' : 'fists' });
  bridge.dispatch({ type: 'stage', id: 'hac-phong-son' });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom: 1 });
  const run = engine()!;
  run.skills[def.skill] = 2;
  run.stats.hp = run.hp = 10000;
  run.stats.damage = 100;
  run.stats.crit = 0;
  run.stats.regen = 1000;
  run.time = 5;
  run.enemies = Array.from(
    { length: 10 },
    (_, index): EnemyState => ({
      id: 10000 + index,
      type: 'hac-lang',
      x: 1.6 + (index % 5) * 0.9,
      y: index < 5 ? 0 : 1.2,
      hp: 100000,
      maxHp: 100000,
      radius: 0.2,
      speed: 0,
      damage: 0,
      facing: 'W',
      combo: 0,
      attack: 0,
      attackTime: 0,
      attackDuration: 0.8,
      impactAt: 0.4,
      impacted: false,
      cooldown: 10000,
      target: { x: 0, y: 0 },
      dead: false,
      deathTime: 0,
      hitTime: 0,
    }),
  );
  for (let attempt = 0; attempt < 100; attempt++) {
    run.xp = run.nextXp;
    run.tick(0.001, { x: 0, y: 0 });
    if (run.choices.some((card) => card.augment === def.id)) break;
    const fallback =
      run.choices.find((card) => card.kind === 'stat') ?? run.choices.find((card) => !card.augment);
    if (!fallback || !run.choose(fallback.id)) throw new Error('Không chuẩn bị được bộ thẻ QA');
  }
  if (!run.choices.some((card) => card.augment === def.id))
    throw new Error('Không rút được biến chiêu QA');
  publish(run);
  status.textContent = `Bộ thẻ thật · ${def.name}`;
  return run;
}
document.getElementById('draft')!.onclick = fixture;
document.getElementById('combat')!.onclick = () => {
  const run = fixture();
  if (!run) return;
  run.choose(`augment:${select.value}`);
  publish(run);
  status.textContent = `Chiến đấu · ${augments[select.value as AugmentId].name}`;
};
document.getElementById('frame')!.onclick = () => {
  const run = fixture();
  if (!run) return;
  const id = select.value as AugmentId,
    def = augments[id];
  run.choose(`augment:${id}`);
  run.skills = { [startingSkill(run.profile)]: 2, [def.skill]: 2 };
  if (!['cuong-quyen', 'nguyen-khi-tram'].includes(def.skill)) {
    run.playerAttack = 1;
    run.playerAttackDuration = 10000;
  }
  const times: Record<AugmentId, number> = {
    'quyen-lien-kich': 0.52,
    'quyen-bang-son': 0.62,
    'kiem-hoi-phong': 1.6,
    'kiem-tan-anh': 0.5,
    'chuong-tam-hoa': 1.4,
    'chuong-luu-hoa': 1.7,
    'hoan-quang-vuc': 2.08,
    'hoan-liet-diem': 0.6,
    'loi-song-lien': 1.6,
    'loi-tap-kich': 1.7,
  };
  for (let left = times[id]; left > 1e-7; left -= 1 / 120)
    run.tick(Math.min(left, 1 / 120), { x: 0, y: 0 });
  run.pause();
  frameAudit = true;
  publish(run);
  status.textContent = `${def.name} · ${run.projectiles.length} đạn · ${run.combatZones.length} vùng đốt · ${run.visuals.filter((event) => event.kind === 'ring' || event.kind === 'lightning').length} vòng/tia`;
};
document.getElementById('level')!.onclick = () => {
  const run = engine();
  if (!run) return;
  run.resume();
  run.xp = run.nextXp;
  run.tick(0.001, { x: 0, y: 0 });
  publish(run);
};
document.getElementById('pause')!.onclick = () => {
  const run = engine();
  if (run) {
    run.pause();
    publish(run);
  }
};
let disposed = false;
function dispose() {
  if (disposed) return;
  disposed = true;
  root.unmount();
  bridge.dispose();
  game.destroy(true);
}
window.addEventListener('pagehide', dispose);
if (import.meta.hot) import.meta.hot.dispose(dispose);

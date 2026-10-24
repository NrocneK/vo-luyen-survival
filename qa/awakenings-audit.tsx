import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { PauseMenu } from '../src/ui/PauseMenu';
import { awakenings, type AttackSkillId } from '../src/data/awakenings';
import { skills } from '../src/data/skills';
import { augments } from '../src/data/augments';
import type { AugmentId } from '../src/shared/augments';
import type { EnemyState } from '../src/shared/models';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { RunEngine } from '../src/game/systems/RunEngine';
import '../src/ui/styles.css';

// Dùng scene/thẻ/HUD thật trên origin QA riêng; fixture không đi vào bundle production.
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const select = document.getElementById('skill') as HTMLSelectElement;
const branch = document.getElementById('branch') as HTMLSelectElement;
const status = document.getElementById('audit-status')!;
let frameAudit = false;
for (const def of Object.values(awakenings))
  select.add(new Option(skills[def.skill].name, def.skill));
function branches() {
  branch.replaceChildren(new Option('Cơ bản', ''));
  for (const def of Object.values(augments).filter((a) => a.skill === select.value))
    branch.add(new Option(def.name, def.id));
}
select.onchange = branches;
branches();
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
bridge.subscribe(() => {
  if (bridge.getSnapshot().status === 'ready' && bridge.getSnapshot().mode === 'menu')
    status.textContent = 'Sẵn sàng';
});
bridge.onCommand((command) => {
  if (command.type !== 'card') return;
  // Scene đăng ký sau lúc nạp asset: đợi toàn bộ listener chọn thẻ xong mới chụp trạng thái.
  queueMicrotask(() => {
    const run = engine();
    if (!run || run.mode !== 'playing') return;
    frameAudit = true;
    run.pause();
    publish(run);
    status.textContent = `${run.notice} · giữ ${run.augments.length} biến chiêu`;
  });
});
function advance(run: RunEngine, seconds: number) {
  run.resume();
  for (let left = seconds; left > 1e-7 && run.mode === 'playing'; left -= 1 / 120)
    run.tick(Math.min(left, 1 / 120), { x: 0, y: 0 });
}
function fixture(support = true) {
  if (bridge.getSnapshot().status !== 'ready') return null;
  frameAudit = false;
  if (engine()) {
    engine()!.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  const def = awakenings[select.value as AttackSkillId];
  const profile = structuredClone(bridge.getSnapshot().profile);
  profile.realm = 46;
  profile.activePet = null;
  profile.equipped.weapon = def.skill === 'nguyen-khi-tram' ? 'thiet-kiem' : 'dong-quyen-sao';
  profile.selectedSkills = [
    def.support,
    ...(['cuong-quyen', 'nguyen-khi-tram'].includes(def.skill) ? [] : [def.skill]),
  ];
  profile.settings.sound = profile.settings.music = false;
  bridge.update({ profile, weapon: def.skill === 'nguyen-khi-tram' ? 'sword' : 'fists' });
  bridge.dispatch({ type: 'stage', id: 'hac-phong-son' });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom: 1 });
  const run = engine()!;
  run.skills = { [def.skill]: 5, ...(support ? { [def.support]: 1 } : {}) };
  run.augments = branch.value ? [branch.value as AugmentId] : [];
  run.stats.damage = 100;
  run.stats.crit = 0;
  run.stats.hp = run.hp = 10000;
  run.stats.regen = 1000;
  run.enemies = Array.from(
    { length: 12 },
    (_, i): EnemyState => ({
      id: 10000 + i,
      type: 'hac-lang',
      x: 2 + (i % 4) * 0.8,
      y: (Math.floor(i / 4) - 1) * 0.8,
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
  if (!['cuong-quyen', 'nguyen-khi-tram'].includes(def.skill)) {
    run.playerAttack = 1;
    run.playerAttackDuration = 10000;
  }
  run.xp = run.nextXp;
  run.tick(0.001, { x: 0, y: 0 });
  publish(run);
  status.textContent = `${skills[def.skill].name} bậc 5 · ${support ? 'hỗ trợ bậc 1' : 'hỗ trợ chưa kích hoạt'}`;
  return run;
}
document.getElementById('draft')!.onclick = () => fixture();
document.getElementById('missing')!.onclick = () => fixture(false);
document.getElementById('frame')!.onclick = () => {
  const run = engine();
  if (!run) return;
  if (run.mode === 'levelup' && !run.choose(`awaken:${select.value}`)) return;
  frameAudit = true;
  const seconds =
    select.value === 'loi-lien'
      ? 1.55
      : select.value === 'viem-hoan'
        ? 0.55
        : select.value === 'duong-viem-chuong'
          ? 1.42
          : 0.58;
  advance(run, seconds);
  run.pause();
  publish(run);
  status.textContent = `${awakenings[select.value as AttackSkillId].name} · bậc ${run.skills[select.value]} · ${run.projectiles.length} đạn · ${run.visuals.filter((v) => ['fireburst', 'ring', 'lightning'].includes(v.kind)).length} vụ nổ/vòng/tia · ${run.combatZones.length} vùng đốt`;
};
document.getElementById('step')!.onclick = () => {
  const run = engine();
  if (run) {
    frameAudit = true;
    advance(run, 0.1);
    run.pause();
    publish(run);
  }
};
document.getElementById('pause')!.onclick = () => {
  const run = engine();
  if (run) {
    frameAudit = false;
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

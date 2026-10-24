import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { GameHud } from '../src/ui/GameHud';
import { flameRingRadius } from '../src/data/skillEffects';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { RunEngine } from '../src/game/systems/RunEngine';
import type { EnemyState } from '../src/shared/models';
import type { AugmentId } from '../src/shared/augments';
import '../src/ui/styles.css';

// Trang QA dùng engine/renderer thật; chỉ fixture đứng yên và thao tác tiến thời gian nằm ngoài game.
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const skill = document.getElementById('skill') as HTMLSelectElement;
const rank = document.getElementById('rank') as HTMLSelectElement;
const branch = document.getElementById('branch') as HTMLSelectElement;
const report = document.getElementById('report')!;
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  return state.mode === 'menu' ? null : <GameHud state={state} bridge={bridge} />;
}
const root = createRoot(document.getElementById('hud')!);
root.render(<Hud />);
function scene() {
  return game.scene.getScene('forest') as ForestScene;
}
function engine() {
  return Reflect.get(scene(), 'engine') as RunEngine | null;
}
bridge.subscribe(() => {
  if (bridge.getSnapshot().status === 'ready' && bridge.getSnapshot().mode === 'menu')
    report.textContent = 'Sẵn sàng';
});
function publish(run: RunEngine) {
  run.pause();
  bridge.update({ mode: run.mode, run: run.view(), position: { ...run.position }, cards: [] });
  (Reflect.get(scene(), 'renderRun') as (dt: number) => void).call(scene(), 0);
  const counts = run.enemies
    .slice(0, 8)
    .map((enemy) => (10000 - enemy.hp).toFixed(1))
    .join('/');
  report.textContent =
    skill.value === 'viem-hoan'
      ? `R ${run.flameRadius().toFixed(2)} · DPS ${run.flameDps().toFixed(1)} · Mất HP: ${counts}`
      : `${run.projectiles[0]?.returning ? 'Chiều về' : 'Chiều đi'} · Xuyên ${run.projectiles[0]?.hits.length ?? 0} địch · Mất HP: ${counts}`;
}
function advance(run: RunEngine, seconds: number) {
  run.resume();
  for (let left = seconds; left > 1e-7 && run.mode === 'playing'; left -= 1 / 120)
    run.tick(Math.min(left, 1 / 120), { x: 0, y: 0 });
}
function fixture(seconds: number) {
  if (bridge.getSnapshot().status !== 'ready') return;
  if (engine()) {
    engine()!.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  const profile = structuredClone(bridge.getSnapshot().profile);
  profile.realm = 46;
  profile.activePet = null;
  profile.equipped.weapon = skill.value === 'nguyen-khi-tram' ? 'thiet-kiem' : 'dong-quyen-sao';
  profile.selectedSkills = ['viem-hoan'];
  profile.settings.music = profile.settings.sound = false;
  bridge.update({ profile, weapon: skill.value === 'nguyen-khi-tram' ? 'sword' : 'fists' });
  bridge.dispatch({ type: 'stage', id: 'hac-phong-son' });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom: 1 });
  const run = engine()!;
  run.skills = { [skill.value]: Number(rank.value) };
  run.stats.damage = 100;
  run.stats.crit = 0;
  run.stats.regen = 1000;
  run.stats.hp = run.hp = 10000;
  run.augments =
    skill.value === 'nguyen-khi-tram'
      ? ['kiem-hoi-phong']
      : Number(rank.value) >= 2 && branch.value
        ? [branch.value as AugmentId]
        : [];
  run.enemies = Array.from(
    { length: 8 },
    (_, index): EnemyState => ({
      id: 10000 + index,
      type: 'hac-lang',
      x: skill.value === 'nguyen-khi-tram' ? 1 + index * 0.75 : ((index % 4) + 1) * 1.2,
      y: skill.value === 'nguyen-khi-tram' ? 0 : index < 4 ? 0 : -1.5,
      hp: 10000,
      maxHp: 10000,
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
  if (skill.value === 'viem-hoan') {
    run.playerAttack = 1;
    run.playerAttackDuration = 10000;
  } else {
    for (let i = 0; i < 100 && !run.projectiles.length; i++) advance(run, 1 / 120);
    run.playerAttackDuration = 10000;
  }
  advance(run, seconds);
  publish(run);
}
document.getElementById('out')!.onclick = () => {
  skill.value = 'nguyen-khi-tram';
  rank.value = '2';
  fixture(0.75);
};
document.getElementById('back')!.onclick = () => {
  skill.value = 'nguyen-khi-tram';
  rank.value = '2';
  fixture(1.55);
};
document.getElementById('early')!.onclick = () => {
  skill.value = 'viem-hoan';
  fixture(0.08);
};
document.getElementById('mid')!.onclick = () => {
  skill.value = 'viem-hoan';
  fixture(0.6);
};
document.getElementById('edge')!.onclick = () => {
  skill.value = 'viem-hoan';
  fixture(1.08);
};
document.getElementById('step')!.onclick = () => {
  const run = engine();
  if (run) {
    advance(run, 0.1);
    publish(run);
  }
};
document.getElementById('play')!.onclick = () => {
  const run = engine();
  if (!run) return;
  if (run.mode === 'playing') publish(run);
  else {
    run.resume();
    bridge.update({ mode: 'playing' });
  }
};
report.setAttribute(
  'title',
  `Bán kính cơ bản: ${[1, 2, 3, 5, 6].map((rank) => flameRingRadius(rank)).join(' / ')}`,
);
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

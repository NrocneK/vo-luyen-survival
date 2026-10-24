import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { GameHud } from '../src/ui/GameHud';
import { newProfile } from '../src/domain/profile';
import { stages, stageById, projectionForStage } from '../src/data/stages';
import { stageMechanics, mechanicRules } from '../src/data/stageMechanics';
import { project } from '../src/game/math/worldPhysics';
import { enemies } from '../src/data/enemies';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { RunEngine } from '../src/game/systems/RunEngine';
import type { EnemyState } from '../src/shared/models';
import '../src/ui/styles.css';

// Fixture chỉ tồn tại ở trang QA dev. Giao diện, renderer và luật đều nhập từ bản game.
const bridge = new GameBridge();
const profile = newProfile();
profile.realm = 46;
profile.settings.sound = profile.settings.music = false;
bridge.update({ profile });
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const select = document.getElementById('stage') as HTMLSelectElement;
const status = document.getElementById('audit-status')!;
for (const stage of stages) select.add(new Option(stage.name, stage.id));
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  return state.mode === 'menu' ? null : <GameHud state={state} bridge={bridge} />;
}
const root = createRoot(document.getElementById('audit-hud')!);
root.render(<Hud />);
bridge.subscribe(() => {
  if (bridge.getSnapshot().status === 'ready' && bridge.getSnapshot().mode === 'menu')
    status.textContent = 'Sẵn sàng';
});
function scene(): ForestScene {
  return game.scene.getScene('forest') as ForestScene;
}
function engine(): RunEngine | null {
  return Reflect.get(scene(), 'engine') as RunEngine | null;
}
function publish(run: RunEngine) {
  run.pause();
  (Reflect.get(scene(), 'renderRun') as (dt: number) => void).call(scene(), 0);
  const p = project(run.position, projectionForStage(run.stage));
  scene().cameras.main.centerOn(p.x, p.y);
  bridge.update({ mode: run.mode, run: run.view(), position: { ...run.position } });
  const view = run.mechanics.view();
  status.textContent = `${run.stage.name} · ${view?.label ?? 'Boss'} · ${run.time.toFixed(1)}s · ${run.mechanics.zones.length} vùng`;
}
function ticks(run: RunEngine, seconds: number) {
  run.resume();
  for (let left = seconds; left > 1e-6; left -= 1 / 60) {
    run.tick(Math.min(1 / 60, left), { x: 0, y: 0 });
    if (run.mode === 'levelup') run.choose(run.choices[0].id);
  }
}
function start(time: number): RunEngine | null {
  if (bridge.getSnapshot().status !== 'ready') return null;
  if (engine()) {
    engine()!.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  bridge.dispatch({ type: 'stage', id: select.value });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom: 0.75 });
  const run = engine()!;
  run.stats.damage = 0;
  run.stats.hp = run.hp = 10000;
  run.stats.regen = 1000;
  run.stats.crit = 0;
  run.profile.activePet = null;
  run.profile.settings.sound = false;
  const type = Object.keys(stageById(select.value).spawnWaves[0].weights)[0];
  run.enemies = Array.from({ length: 12 }, (_, index): EnemyState => {
    const a = (index * Math.PI) / 6,
      d = 3.5 + (index % 3);
    return {
      id: 10000 + index,
      type,
      x: Math.cos(a) * d,
      y: Math.sin(a) * d,
      hp: 10000,
      maxHp: 10000,
      radius: enemies[type].radius,
      speed: 0,
      damage: 0,
      facing: 'S',
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
    };
  });
  run.time = stageMechanics[select.value].start - 0.02;
  ticks(run, 0.05);
  ticks(run, Math.max(0, time - run.time));
  if (run.mechanics.leaderId) {
    const leader = run.enemies.find((unit) => unit.id === run.mechanics.leaderId)!;
    run.position = { x: leader.x + 2, y: leader.y + 1 };
  }
  publish(run);
  return run;
}
document.getElementById('warning')!.onclick = () => start(stageMechanics[select.value].start + 0.8);
document.getElementById('active')!.onclick = () => {
  const config = stageMechanics[select.value];
  start(config.start + config.warning + 1.1);
};
document.getElementById('rune')!.onclick = () => {
  if (select.value !== stages[1].id) select.value = stages[1].id;
  const run = start(stageMechanics[select.value].start + 0.1)!;
  const rune = run.mechanics.zones.find((zone) => zone.kind === 'rune')!;
  run.position = { x: rune.x, y: rune.y };
  ticks(run, mechanicRules.runeCharge + 0.1);
  publish(run);
};
document.getElementById('storm')!.onclick = () => {
  select.value = stages[5].id;
  const config = stageMechanics[select.value];
  start(config.start + config.warning + config.active + 1.2);
};
document.getElementById('counter')!.onclick = () => {
  select.value = stages[5].id;
  const config = stageMechanics[select.value];
  start(config.start + config.warning + config.active + mechanicRules.siegeStorm + 1);
};
document.getElementById('boss')!.onclick = () => {
  const config = stageMechanics[select.value];
  const run = start(config.start + 1)!;
  run.time = run.stage.duration - 0.02;
  ticks(run, 0.05);
  publish(run);
};
document.getElementById('live')!.onclick = () => {
  const run = engine();
  if (!run) return;
  if (run.mode === 'playing') publish(run);
  else {
    run.resume();
    bridge.update({ mode: 'playing' });
  }
};
let disposed = false;
const dispose = () => {
  if (disposed) return;
  disposed = true;
  root.unmount();
  bridge.dispose();
  game.destroy(true);
};
window.addEventListener('pagehide', dispose);
if (import.meta.hot) import.meta.hot.dispose(dispose);

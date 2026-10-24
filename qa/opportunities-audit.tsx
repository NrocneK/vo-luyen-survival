import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { RunEngine } from '../src/game/systems/RunEngine';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { PauseMenu } from '../src/ui/PauseMenu';
import { stages } from '../src/data/stages';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import '../src/ui/styles.css';

// Scene/thẻ/tương tác E thật; QA chủ động tiến thời gian để chụp từng trạng thái trên origin riêng.
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const select = document.getElementById('stage') as HTMLSelectElement,
  kind = document.getElementById('kind') as HTMLSelectElement,
  status = document.getElementById('audit-status')!;
stages.forEach((s) => select.add(new Option(s.name, s.id)));
function scene() {
  return game.scene.getScene('forest') as ForestScene;
}
function engine() {
  return Reflect.get(scene(), 'engine') as RunEngine | null;
}
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  return state.mode === 'menu' ? null : (
    <>
      <GameHud state={state} bridge={bridge} />
      <RunOverlays state={state} bridge={bridge} />
      {state.mode === 'paused' && <PauseMenu bridge={bridge} />}
    </>
  );
}
const root = createRoot(document.getElementById('audit-hud')!);
root.render(<Hud />);
let simulationTick: RunEngine['tick'] | null = null;
function publish() {
  const run = engine();
  if (!run) return;
  bridge.update({
    mode: run.mode,
    run: run.view(),
    cards: [...run.choices],
    position: { ...run.position },
  });
  (Reflect.get(scene(), 'renderRun') as (dt: number) => void).call(scene(), 0);
  status.textContent = `${run.opportunities.active?.phase ?? 'đã dọn'} · ${run.enemies.filter((e) => e.opportunityId !== undefined).length} hộ vệ · ${run.opportunities.completed} nhận · ${run.opportunities.missed} bỏ lỡ · ${run.loot.stone} linh thạch tạm giữ`;
}
bridge.subscribe(() => {
  if (bridge.getSnapshot().status === 'ready' && bridge.getSnapshot().mode === 'menu')
    status.textContent = 'Sẵn sàng';
});
bridge.onCommand(() => queueMicrotask(publish));
function advance(seconds: number) {
  const run = engine();
  if (!run) return;
  for (let left = seconds; left > 1e-7 && run.mode === 'playing'; left -= 1 / 60)
    simulationTick?.(Math.min(left, 1 / 60), { x: 0, y: 0 });
  publish();
}
document.getElementById('fixture')!.onclick = () => {
  if (bridge.getSnapshot().status !== 'ready') return;
  if (engine()) {
    engine()!.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  const profile = structuredClone(bridge.getSnapshot().profile);
  profile.realm = 46;
  profile.activePet = null;
  profile.selectedSkills = [];
  profile.settings.sound = profile.settings.music = false;
  bridge.update({ profile });
  bridge.dispatch({ type: 'stage', id: select.value });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom: 1 });
  const stage = { ...stages.find((s) => s.id === select.value)!, elites: [], eliteTimes: [] };
  let run: RunEngine | null = null;
  for (let seed = 1; seed < 100; seed++) {
    const candidate = new RunEngine(profile, [], seed, stage);
    if (candidate.opportunities.schedule[0].kind === kind.value) {
      run = candidate;
      break;
    }
  }
  if (!run) throw new Error('Không tìm được seed QA');
  Reflect.set(scene(), 'engine', run);
  Reflect.set(run, 'spawnCooldown', Infinity);
  // Render/input vẫn chạy, luật chiến đấu chỉ tiến bằng hàm tick gốc ở các nút QA.
  simulationTick = run.tick.bind(run);
  run.tick = () => {};
  run.stats.damage = 0;
  run.stats.crit = 0;
  run.stats.regen = 0;
  run.stats.hp = 1000;
  run.hp = 400;
  run.time = run.opportunities.schedule[0].at;
  advance(0.01);
};
document.getElementById('travel')!.onclick = () => {
  const run = engine(),
    a = run?.opportunities.active;
  if (!run || !a) return;
  run.position = { x: a.x, y: a.y };
  publish();
};
document.getElementById('kill')!.onclick = () => {
  const run = engine();
  if (!run) return;
  for (const e of run.enemies.filter((e) => e.opportunityId !== undefined)) {
    e.speed = 0;
    e.spawnGrace = 0;
    run.projectiles.push({
      x: e.x,
      y: e.y,
      id: 90000 + e.id,
      velocity: { x: 0, y: 0 },
      damage: 1e9,
      radius: 1,
      life: Infinity,
      enemy: false,
      effect: 'qi-punch',
      pierce: 0,
      hits: [],
    });
  }
  advance(0.1);
};
document.getElementById('step')!.onclick = () => advance(5);
document.getElementById('expire')!.onclick = () => {
  const a = engine()?.opportunities.active;
  if (a) advance(Math.max(0.1, a.deadline - engine()!.time + 0.1));
};
document.getElementById('result')!.onclick = () => {
  const run = engine();
  if (!run) return;
  run.abandon();
  publish();
  bridge.finish(run.result!);
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

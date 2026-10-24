import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { RunEngine } from '../src/game/systems/RunEngine';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { ChapterEnding } from '../src/ui/ChapterEnding';
import { Lobby } from '../src/ui/Lobby';
import { newProfile } from '../src/domain/profile';
import { stages } from '../src/data/stages';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { EnemyState, Projectile } from '../src/shared/models';
import '../src/ui/styles.css';

// Kiểm tra UI/bridge/engine thật trên origin riêng, không dùng bản lưu đang chơi.
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
const status = document.getElementById('audit-status')!;
const choice = document.getElementById('fixture-kind') as HTMLSelectElement;
const scene = () => game.scene.getScene('forest') as ForestScene;
const currentEngine = () => Reflect.get(scene(), 'engine') as RunEngine | null;
const still = { x: 0, y: 0 };
let tick: RunEngine['tick'] | null = null;
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  return (
    <>
      <div
        className="game-interface"
        inert={state.chapterEndingOpen}
        aria-hidden={state.chapterEndingOpen || undefined}
      >
        {state.mode === 'menu' ? (
          <Lobby state={state} bridge={bridge} />
        ) : (
          <GameHud state={state} bridge={bridge} />
        )}
        {!state.chapterEndingOpen && <RunOverlays state={state} bridge={bridge} />}
      </div>
      {state.chapterEndingOpen && <ChapterEnding state={state} bridge={bridge} />}
    </>
  );
}
const root = createRoot(document.getElementById('audit-hud')!);
root.render(<Hud />);
bridge.subscribe(() => {
  const state = bridge.getSnapshot();
  if (state.status === 'ready')
    status.textContent = `${state.mode} · cảnh giới ${state.profile.realm} · ${state.chapterEndingOpen ? 'kết chương' : 'bình thường'}`;
});
function target(id: number, x: number, type = 'hac-lang', hp = 10000): EnemyState {
  return {
    id,
    x,
    y: 0,
    type,
    hp,
    maxHp: hp,
    radius: 0.2,
    speed: 0,
    damage: 80,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0.8,
    impactAt: 0.4,
    impacted: false,
    cooldown: 10000,
    target: { ...still },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}
function shot(overrides: Partial<Projectile>): Projectile {
  return {
    id: 90000,
    x: 0,
    y: 0,
    velocity: still,
    damage: 100,
    radius: 0.2,
    life: Infinity,
    enemy: false,
    effect: 'qi-punch',
    pierce: 0,
    hits: [],
    skillId: 'cuong-quyen',
    rank: 6,
    ...overrides,
  };
}
function advance(run: RunEngine, seconds: number) {
  for (let left = seconds; left > 1e-7 && run.mode === 'playing'; left -= 1 / 120)
    tick?.(Math.min(left, 1 / 120), still);
}
function publish(run: RunEngine) {
  bridge.update({
    mode: run.mode,
    run: run.view(),
    cards: [...run.choices],
    position: { ...run.position },
  });
  if (run.result) bridge.finish(run.result);
}
function reset() {
  const old = currentEngine();
  if (old) {
    old.abandon();
    bridge.update({ mode: 'result', chapterEndingOpen: false });
    bridge.dispatch({ type: 'leave' });
  }
  const profile = newProfile();
  profile.realm = choice.value === 'late' ? 45 : 46;
  profile.cultivation = 11500;
  profile.settings.music = profile.settings.sound = false;
  for (const stage of stages) {
    if (stage.stageIndex === 5 && !['late', 'saved'].includes(choice.value)) continue;
    profile.stageProgress[stage.id] = { wins: 1, bestTime: 600, bestKills: 500 };
  }
  profile.wins = profile.runs = Object.keys(profile.stageProgress).length;
  profile.selectedSkills = ['duong-viem-chuong', 'viem-hoan', 'hoa-linh', 'loi-lien', 'loi-tam'];
  profile.pets['thanh-dieu'] = { level: 3, evolved: true };
  profile.activePet = 'thanh-dieu';
  bridge.update({
    mode: 'menu',
    profile,
    result: null,
    chapterEndingOpen: false,
    lobbyArea: 'courtyard',
  });
  bridge.persist();
  if (['late', 'saved'].includes(choice.value)) {
    bridge.dispatch({ type: 'travel', area: choice.value === 'late' ? 'cultivate' : 'courtyard' });
    return null;
  }
  bridge.dispatch({ type: 'stage', id: stages[5].id });
  bridge.dispatch({ type: 'start' });
  const run = new RunEngine(profile, [], 72, {
    ...stages[5],
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  tick = run.tick.bind(run);
  run.tick = () => {};
  Reflect.set(scene(), 'engine', run);
  run.stats.damage = 100;
  run.stats.crit = run.stats.regen = run.stats.armor = 0;
  return run;
}
document.getElementById('fixture')!.onclick = () => {
  if (bridge.getSnapshot().status !== 'ready') return;
  const run = reset();
  if (!run) return;
  const kind = choice.value;
  if (['mixed', 'retreat'].includes(kind)) {
    run.skills = {
      'cuong-quyen': 5,
      'nguyen-khi-tram': 5,
      'duong-viem-chuong': 5,
      'viem-hoan': 5,
      'loi-lien': 5,
    };
    run.augments = [
      'quyen-lien-kich',
      'kiem-hoi-phong',
      'chuong-luu-hoa',
      'hoan-liet-diem',
      'loi-tap-kich',
    ];
    run.enemies = [target(1, 1), target(2, 2), target(3, 3)];
    run.projectiles.push(
      shot({
        velocity: { x: 6, y: 0 },
        effect: 'sword-slash',
        skillId: 'nguyen-khi-tram',
        rank: 5,
        returnTravel: 0,
        pierce: Infinity,
      }),
    );
    advance(run, 2);
    for (const id of Object.keys(run.skills)) run.skills[id] = 6;
    advance(run, 2);
    run.time = 612;
    if (kind === 'retreat') run.abandon();
    else {
      run.enemies = [target(99, 0, run.stage.bossId, 75)];
      run.projectiles = [shot({ damage: 1000 })];
      advance(run, 0.01);
    }
  } else {
    run.profile.activePet = null;
    run.skills = {};
    run.playerAttack = 1;
    run.playerAttackDuration = 10000;
    Reflect.set(run, 'playerImpacted', true);
    run.hp = 25;
    run.time = 150;
    if (kind === 'melee') {
      const enemy = target(7, 0.4, 'ma-kiem');
      enemy.cooldown = 0;
      run.enemies = [enemy];
      advance(run, 0.6);
    } else if (kind === 'projectile') {
      const enemy = target(33, 3, 'ma-tu');
      enemy.cooldown = 0;
      run.enemies = [enemy];
      advance(run, 0.6);
      run.enemies = [];
      advance(run, 2);
    } else {
      const hazard = kind as 'poison' | 'fire' | 'dark';
      run.mechanics.zones.push({
        id: 99,
        x: 0,
        y: 0,
        kind: hazard,
        radius: 3,
        elapsed: 1,
        warning: 0,
        duration: 20,
        velocity: still,
        direction: { x: 1, y: 0 },
        halfLength: 8,
        gapOffset: 6,
        gapHalfWidth: 1,
        hitIn: 0,
        triggered: false,
        charge: 0,
        charged: false,
      });
      run.hp = 1;
      advance(run, 0.01);
    }
  }
  publish(run);
};
document.getElementById('save-fixture')!.onclick = () => {
  if (bridge.getSnapshot().mode !== 'menu') return;
  bridge.persist();
  location.reload();
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

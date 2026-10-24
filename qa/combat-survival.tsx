import { useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { PauseMenu } from '../src/ui/PauseMenu';
import { Lobby } from '../src/ui/Lobby';
import { TestTools } from '../src/ui/TestTools';
import { newProfile } from '../src/domain/profile';
import { equipment } from '../src/data/equipment';
import { allStages, stageById, stages } from '../src/data/stages';
import { enemies } from '../src/data/enemies';
import { eligibleCards } from '../src/data/skills';
import type { RunEngine } from '../src/game/systems/RunEngine';
import type { EnemyState } from '../src/shared/models';
import '../src/ui/styles.css';
import '../src/ui/world-two.css';
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  const [tools, setTools] = useState(false);
  document.getElementById('battle-audit')!.className = `game-shell mode-${state.mode}`;
  return (
    <>
      <div className="game-interface">
        {state.mode === 'menu' ? (
          <Lobby state={state} bridge={bridge} />
        ) : (
          <GameHud state={state} bridge={bridge} />
        )}
        {state.mode === 'paused' && !tools && <PauseMenu bridge={bridge} />}
        {['levelup', 'result'].includes(state.mode) && !tools && (
          <RunOverlays state={state} bridge={bridge} />
        )}
        <TestTools
          state={state}
          bridge={bridge}
          open={tools}
          onToggle={() => {
            if (!tools && state.mode === 'playing') bridge.dispatch({ type: 'pause' });
            setTools(!tools);
          }}
        />
      </div>
    </>
  );
}
const root = createRoot(document.getElementById('battle-hud')!);
root.render(<Hud />);
const scene = () => game.scene.getScene('forest');
const engine = () => Reflect.get(scene(), 'engine') as RunEngine | null;
const publish = () => {
  Reflect.apply(Reflect.get(scene(), 'sync'), scene(), []);
};
let tick: RunEngine['tick'] | null = null;
function dummy(id: number, x: number, y: number, type = 'hac-lang'): EnemyState {
  return {
    id,
    x,
    y,
    type,
    hp: 5000,
    maxHp: 5000,
    radius: 0.3,
    speed: 0,
    damage: 20,
    facing: 'SW',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0.8,
    impactAt: 0.4,
    impacted: false,
    cooldown: 999,
    target: { x: 0, y: 0 },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}
async function start(world = 1) {
  const old = engine();
  if (old) {
    old.abandon();
    publish();
    bridge.dispatch({ type: 'leave' });
  }
  const p = newProfile();
  p.realm = world === 1 ? 46 : 52;
  p.settings.music = p.settings.sound = false;
  p.cultivation = 100000;
  p.pills['hoi-nguyen-dan'] = 3;
  p.relicUnlocked = true;
  p.selectedStageId = world === 1 ? 'hac-phong-son' : 'thanh-dia-bi-vay';
  p.selectedSkills =
    world === 1
      ? ['duong-viem-chuong', 'viem-hoan', 'hoa-linh', 'loi-lien', 'loi-tam']
      : ['diet-hon-kim-quang', 'gia-thien-thu', 'kim-long-hien-hoa', 'nhap-ma', 'phong-loi-vu-duc'];
  for (const item of Object.values(equipment)) p.equipment[item.id] = 0;
  p.equipped = {
    weapon: 'huyen-thiet-quyen-sao',
    head: 'huyen-quang-quan',
    body: 'thanh-nguyen-chien-y',
    hands: 'kim-cuong-ho-uyen',
    feet: 'ngu-phong-ngoa',
    jewel: 'thanh-tam-ngoc-boi',
    relic: 'thanh-chu-ngoc-an',
  };
  if (world === 1) {
    for (const slot of Object.keys(p.equipped) as (keyof typeof p.equipped)[])
      p.equipped[slot] = null;
    for (const item of Object.values(equipment))
      if ((item.requiredRealm ?? 0) <= p.realm) p.equipped[item.slot] = item.id;
    p.equipped.weapon = 'huyen-thiet-quyen-sao';
  }
  if (world === 2)
    for (const s of allStages) {
      if (s.id === p.selectedStageId) break;
      p.stageProgress[s.id] = { wins: 1, bestTime: 200, bestKills: 100 };
    }
  p.pets = { 'thanh-dieu': { level: 3, evolved: true } };
  p.activePet = 'thanh-dieu';
  bridge.update({
    profile: p,
    stageId: p.selectedStageId,
    weapon: 'fists',
    mode: 'menu',
    result: null,
    chapterEndingOpen: false,
    storyOpen: false,
    toast: '',
  });
  bridge.dispatch({ type: 'start' });
  for (let i = 0; i < 400 && !engine(); i++)
    await new Promise((resolve) => setTimeout(resolve, 30));
  const run = engine()!;
  if (!run) throw Error('Khong khoi tao luot');
  tick = run.tick.bind(run);
  run.tick = () => {};
  run.level = 14;
  run.time = world === 1 ? 215 : 126;
  run.xp = run.nextXp * 0.64;
  run.hp = run.currentStats().hp * 0.72;
  run.kills = 173;
  const names =
    world === 1
      ? ['hac-lang', 'thiet-nha-tru', 'doc-thiem']
      : ['kiem-khach-trung-do', 'thong-huyen-vo-gia-9', 'ho-ve-trung-do'];
  run.enemies = Array.from({ length: 14 }, (_, i) =>
    dummy(
      i + 500,
      Math.cos(i * 0.91) * (3 + i * 0.12),
      Math.sin(i * 0.91) * (3 + i * 0.12),
      names[i % 3],
    ),
  );
  run.skills =
    world === 1
      ? { 'cuong-quyen': 4, 'duong-viem-chuong': 5, 'viem-hoan': 3, 'hoa-linh': 1, 'loi-lien': 2 }
      : {
          'cuong-quyen': 4,
          'diet-hon-kim-quang': 5,
          'gia-thien-thu': 3,
          'kim-long-hien-hoa': 2,
          'nhap-ma': 1,
          'phong-loi-vu-duc': 3,
        };
  run.augments = world === 1 ? ['chuong-luu-hoa', 'hoan-liet-diem'] : ['quang-pha-hon', 'long-du'];
  run.notice = '';
  publish();
  return run.view();
}
function levelup(kind = 'mixed') {
  const run = engine()!;
  run.mode = 'levelup';
  run.rerollsRemaining = 1;
  const main = bridge.getSnapshot().profile.selectedSkills;
  const pool = eligibleCards(['cuong-quyen', ...main], run.skills, run.augments);
  run.choices =
    kind === 'stat'
      ? pool.filter((card) => card.kind === 'stat').slice(0, 3)
      : [
          pool.find((card) => card.kind === 'awaken'),
          pool.find((card) => card.kind === 'augment'),
          pool.find((card) => card.kind === 'skill'),
        ].filter((card): card is NonNullable<typeof card> => !!card);
  if (run.choices.length < 3)
    run.choices.push(
      ...pool.filter((card) => card.kind === 'stat').slice(0, 3 - run.choices.length),
    );
  publish();
  return run.choices;
}
function boss() {
  const run = engine()!,
    boss = dummy(999, 4, 1, run.stage.bossId);
  boss.maxHp = 50000;
  boss.hp = 31640;
  boss.radius = 0.65;
  run.enemies.push(boss);
  Reflect.set(run, 'bossSpawned', true);
  publish();
}
function result(outcome: 'victory' | 'defeat' | 'retreat' | 'mission-failed' = 'victory') {
  const run = engine()!;
  run.mode = 'playing';
  run.time = 612.4;
  run.kills = 638;
  run.level = 22;
  const main = run.stage.chapter === 2 ? 'diet-hon-kim-quang' : 'duong-viem-chuong';
  run.statistics.dealt({ id: main, rank: 5 }, 50000, 18640);
  run.statistics.dealt({ id: main, rank: 6 }, 50000, 45680);
  run.statistics.dealt({ id: 'cuong-quyen', rank: 4 }, 50000, 12750);
  run.statistics.dealt({ id: 'pet-thanh-dieu', rank: 3 }, 20000, 3980);
  run.skills[main] = 6;
  run.statistics.received(609, 180, 116, { kind: 'hazard', hazard: 'fire' });
  if (outcome === 'defeat')
    run.statistics.received(612, 116, 0, {
      kind: 'enemy',
      enemyType: run.stage.bossId,
      attack: 3,
      delivery: 'fan',
      effect: 'fire-palm',
    });
  run.loot = {
    stone: 900,
    cultivation: 18000,
    resources: { 'linh-thao': 12, 'yeu-dan': 5, 'thiet-khoang': 8, 'linh-tai-thong-huyen': 6 },
    equipment: ['ngoc-lien-bi-bao'],
    blueprints: ['liet-duong-kiem'],
  };
  run.finish(
    outcome === 'victory',
    outcome === 'victory'
      ? 'Đã hoàn thành mục tiêu và đánh bại thủ lĩnh.'
      : outcome === 'retreat'
        ? 'Chủ động rút khỏi chiến trường.'
        : outcome === 'mission-failed'
          ? 'Mục tiêu bảo vệ bị phá hủy.'
          : 'Sinh lực cạn kiệt.',
    outcome,
  );
  publish();
  bridge.update({ chapterEndingOpen: false });
  return bridge.getSnapshot().result;
}
function advance(seconds: number) {
  const run = engine()!;
  for (let left = seconds; left > 1e-7 && run.mode === 'playing'; left -= 1 / 120)
    tick?.(Math.min(left, 1 / 120), { x: 0, y: 0 });
  publish();
}
function opportunity() {
  const run = engine()!;
  Reflect.set(run.opportunities, 'active', {
    id: 99,
    kind: 'cache',
    phase: 'claimable',
    x: 0,
    y: 0,
    deadline: run.time + 60,
    progress: 1,
    guards: [],
    reward: {
      loot: { stone: 30, cultivation: 20, resources: {}, equipment: [], blueprints: [] },
      xp: 0,
      heal: 0,
    },
    message: '',
  });
  publish();
}
Object.assign(window, {
  battleQA: {
    bridge,
    game,
    engine,
    start,
    publish,
    levelup,
    boss,
    result,
    advance,
    opportunity,
    stages,
    stageById,
    enemies,
  },
});
function dispose() {
  root.unmount();
  bridge.dispose();
  game.destroy(true);
}
window.addEventListener('pagehide', dispose);
if (import.meta.hot) import.meta.hot.dispose(dispose);

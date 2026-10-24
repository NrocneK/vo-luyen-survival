import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { newProfile } from '../src/domain/profile';
import { allStages, stages } from '../src/data/stages';
import { worldTwoStages } from '../src/data/worldTwoStages';
import { equipment } from '../src/data/equipment';
import { Lobby } from '../src/ui/Lobby';
import { GameHud } from '../src/ui/GameHud';
import { RunOverlays } from '../src/ui/RunOverlays';
import { ChapterEnding } from '../src/ui/ChapterEnding';
import { StoryEvent } from '../src/ui/StoryEvent';
import type { RunEngine } from '../src/game/systems/RunEngine';
import type { EnemyState } from '../src/shared/models';
import { weaponFromEquipment } from '../src/shared/models';
import '../src/ui/styles.css';
import '../src/ui/world-two.css';
const bridge = new GameBridge();
bridge.testSettings({ enabled: true, timeScale: 1, damageMultiplier: 1 });
const game = createGame(document.getElementById('game-canvas')!, bridge);
function Hud() {
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  document.getElementById('audit')!.className = `game-shell mode-${state.mode}`;
  return (
    <>
      <div className="game-interface" inert={!!state.chapterEndingOpen || !!state.storyOpen}>
        {state.mode === 'menu' ? (
          <Lobby state={state} bridge={bridge} />
        ) : (
          <GameHud state={state} bridge={bridge} />
        )}
        <RunOverlays state={state} bridge={bridge} />
      </div>
      {state.chapterEndingOpen && <ChapterEnding state={state} bridge={bridge} />}{' '}
      {state.storyOpen && <StoryEvent state={state} bridge={bridge} />}
    </>
  );
}
createRoot(document.getElementById('audit-hud')!).render(<Hud />);
const engine = () => Reflect.get(game.scene.getScene('forest'), 'engine') as RunEngine | null;
let original: RunEngine['tick'] | null = null;
function setup(index = 0, start = false, seen = true) {
  if (engine()) {
    bridge.update({ mode: 'result', chapterEndingOpen: false, storyOpen: false });
    bridge.dispatch({ type: 'leave' });
  }
  const p = newProfile();
  const currentWeapon = bridge.getSnapshot().profile.equipped.weapon;
  if (currentWeapon) {
    p.equipped.weapon = currentWeapon;
    p.equipment[currentWeapon] = 0;
  }
  p.realm = 52;
  p.relicUnlocked = true;
  p.cultivation = 1200000;
  p.stone = 100000;
  p.alchemyXp = 100;
  p.permanentPills = 5;
  p.settings.music = false;
  p.settings.sound = false;
  for (const stage of allStages)
    if (stage.id !== worldTwoStages[index].id)
      p.stageProgress[stage.id] = { wins: 1, bestTime: 120, bestKills: 40 };
  for (const id of Object.keys(p.resources) as (keyof typeof p.resources)[]) p.resources[id] = 1000;
  p.blueprints = Object.values(equipment)
    .filter((item) => item.special)
    .map((item) => item.id);
  for (const id of p.blueprints) p.equipment[id] = 0;
  p.pets = { 'linh-ho': { level: 10, evolved: true }, 'thanh-dieu': { level: 10, evolved: true } };
  p.activePet = 'thanh-dieu';
  p.selectedSkills = [
    'diet-hon-kim-quang',
    'gia-thien-thu',
    'kim-long-hien-hoa',
    'nhap-ma',
    'phong-loi-vu-duc',
  ];
  p.selectedStageId = worldTwoStages[index].id;
  p.storySeen = seen ? ['ma-do'] : [];
  p.runs = p.wins = Object.keys(p.stageProgress).length;
  bridge.update({
    mode: 'menu',
    profile: p,
    weapon: weaponFromEquipment(p.equipped.weapon),
    stageId: p.selectedStageId,
    chapterEndingOpen: false,
    storyOpen: false,
    result: null,
  });
  if (start) {
    bridge.dispatch({ type: 'start' });
    const run = engine();
    if (run) {
      run.invulnerability = 100000;
      original = run.tick.bind(run);
    }
  }
  return bridge.getSnapshot().mode;
}
function freeze() {
  const run = engine();
  if (run) {
    original = run.tick.bind(run);
    run.tick = () => {};
    run.invulnerability = 0;
  }
}
function advance(seconds: number) {
  const run = engine();
  if (!run || !original) return;
  for (let left = seconds; left > 1e-7; left -= 1 / 120) {
    if (run.mode === 'levelup') run.choose(run.choices[0].id);
    original(Math.min(left, 1 / 120), { x: 0, y: 0 });
  }
  bridge.update({ run: run.view(), mode: run.mode, cards: run.choices });
}
function cast(kind = 0) {
  setup(13, true);
  const run = engine()!;
  freeze();
  run.skills['diet-hon-kim-quang'] = 6;
  run.skills['gia-thien-thu'] = 6;
  run.skills['kim-long-hien-hoa'] = 6;
  run.skills['nhap-ma'] = 5;
  run.skills['phong-loi-vu-duc'] = 5;
  run.augments = kind
    ? ['quang-pha-hon', 'thu-diep-chuong', 'long-tuc']
    : ['quang-tan', 'thu-tran-dia', 'long-du'];
  const sample: EnemyState = {
    id: 10000,
    x: 3,
    y: 0,
    type: worldTwoStages[13].bossId,
    hp: 1e7,
    maxHp: 1e7,
    radius: 0.3,
    speed: 0,
    damage: 1,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 1,
    impactAt: 0.5,
    impacted: false,
    cooldown: 999,
    target: { x: 0, y: 0 },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
  run.enemies = [
    sample,
    ...Array.from({ length: 5 }, (_, i) => ({
      ...sample,
      id: 10001 + i,
      type: 'thong-huyen-vo-gia-13',
      x: 2 + i * 0.6,
      y: (i - 2) * 0.55,
    })),
  ];
  advance(kind ? 0.7 : 0.55);
  return run.view();
}
function prepareEffect(skill: string, augment = '', facing: RunEngine['facing'] = 'S') {
  setup(7, true);
  const run = engine()!;
  freeze();
  Reflect.set(run, 'mission', null);
  Reflect.set(run, 'stage', {
    ...run.stage,
    maxEnemies: 0,
    eliteTimes: [],
    elites: [],
    duration: 999999,
  });
  for (const id of Object.keys(run.skills)) delete run.skills[id];
  run.skills[skill] = 5;
  run.augments = augment ? [augment as RunEngine['augments'][number]] : [];
  run.advanced.clear();
  run.time = 0;
  run.position = { x: 0, y: 0 };
  run.facing = facing;
  run.stats.crit = 0;
  run.invulnerability = 0;
  const sample: EnemyState = {
    id: 20001,
    x: skill === 'diet-hon-kim-quang' ? 10 : 3,
    y: 0,
    type: 'thong-huyen-vo-gia-13',
    hp: 1e9,
    maxHp: 1e9,
    radius: 0.3,
    speed: 0,
    damage: 0,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 1,
    impactAt: 0.5,
    impacted: false,
    cooldown: 99999,
    target: { x: 0, y: 0 },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
  run.enemies = skill === 'nhap-ma' || skill === 'phong-loi-vu-duc' ? [] : [sample];
  run.profile.activePet = null;
  advance(0.01);
  return run.view();
}
Object.assign(window, {
  worldTwoQA: {
    bridge,
    game,
    engine,
    setup,
    freeze,
    advance,
    cast,
    prepareEffect,
    stages: worldTwoStages,
    legacy: stages,
  },
});
// Trang xem riêng trên cổng dev riêng; tiến trình trong game vẫn dùng profile test.
if (new URLSearchParams(location.search).has('vfxPreview')) {
  let selected = ['kim-long-hien-hoa', 'long-du'];
  const panel = document.createElement('aside');
  panel.id = 'vfx-preview-controls';
  panel.innerHTML =
    '<strong>VÕ LUYỆN · 2.1.0</strong><p>WASD di chuyển · Space lướt</p><div class="vfx-buttons"></div><div class="vfx-tools"><button data-action="replay">↻ Phát lại</button><button data-action="pause">Tạm dừng</button></div><label>Thu phóng <input aria-label="Thu phóng" type="range" min="0.5" max="2.5" step="0.1" value="1.5"></label><p><a href="./hero-equipment.html" style="color:#dfbf7b">Xem và phối trang bị nhân vật ↗</a></p>';
  const style = document.createElement('style');
  style.textContent =
    '#vfx-preview-controls{position:fixed;left:18px;top:110px;z-index:20000;width:230px;padding:16px;background:#102424ed;border:1px solid #587373;border-radius:10px;color:#ece2c9;font:13px/1.5 system-ui}#vfx-preview-controls strong{letter-spacing:.1em;color:#e5bd78}#vfx-preview-controls p{margin:5px 0 12px;color:#b6c9c5}#vfx-preview-controls button{border:1px solid #526b68;background:#19342f;color:#ddd8c8;border-radius:5px;padding:8px;cursor:pointer}#vfx-preview-controls button.active{background:#5a4a28;border-color:#c9a05c}#vfx-preview-controls .vfx-buttons{display:grid;grid-template-columns:1fr 1fr;gap:6px}#vfx-preview-controls .vfx-tools{display:flex;gap:6px;margin:12px 0}#vfx-preview-controls label{display:grid;gap:5px}';
  document.head.append(style);
  document.body.append(panel);
  const play = () => {
    prepareEffect(selected[0], selected[1]);
    const run = engine()!;
    if (selected[0] === 'combined') {
      delete run.skills.combined;
      Object.assign(run.skills, {
        'kim-long-hien-hoa': 6,
        'gia-thien-thu': 6,
        'diet-hon-kim-quang': 6,
        'nhap-ma': 5,
        'phong-loi-vu-duc': 5,
      });
      run.augments = ['long-du', 'thu-tran-dia', 'quang-pha-hon'];
      run.advanced.clear();
      run.enemies[0].x = 4;
    }
    run.tick = original!;
    run.mode = 'playing';
    bridge.dispatch({ type: 'zoom', zoom: Number(panel.querySelector('input')!.value) });
    panel.querySelector('[data-action="pause"]')!.textContent = 'Tạm dừng';
  };
  for (const [name, id, augment] of [
    ['Du Long', 'kim-long-hien-hoa', 'long-du'],
    ['Già Thiên Thủ', 'gia-thien-thu', ''],
    ['Vũ Dực', 'phong-loi-vu-duc', ''],
    ['Nhập Ma', 'nhap-ma', ''],
    ['Kim Quang', 'diet-hon-kim-quang', ''],
    ['Phối hợp', 'combined', ''],
  ]) {
    const button = document.createElement('button');
    button.textContent = name;
    button.onclick = () => {
      selected = [id, augment];
      panel.querySelectorAll('.vfx-buttons button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      play();
    };
    panel.querySelector('.vfx-buttons')!.append(button);
  }
  panel.querySelector<HTMLButtonElement>('[data-action="replay"]')!.onclick = play;
  panel.querySelector<HTMLButtonElement>('[data-action="pause"]')!.onclick = () => {
    const run = engine();
    if (!run) return;
    if (run.mode === 'paused') bridge.dispatch({ type: 'resume' });
    else bridge.dispatch({ type: 'pause' });
    panel.querySelector('[data-action="pause"]')!.textContent =
      run.mode === 'paused' ? 'Tiếp tục' : 'Tạm dừng';
  };
  panel.querySelector<HTMLInputElement>('input')!.oninput = (e) =>
    bridge.dispatch({ type: 'zoom', zoom: Number((e.target as HTMLInputElement).value) });
  const ready = setInterval(() => {
    if (bridge.getSnapshot().status === 'ready') {
      clearInterval(ready);
      play();
      panel.querySelector('button')!.classList.add('active');
    }
  }, 100);
}

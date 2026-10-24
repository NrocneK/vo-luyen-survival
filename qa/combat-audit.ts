import { GameBridge } from '../src/app/GameBridge';
import { createGame } from '../src/game/createGame';
import { newProfile } from '../src/domain/profile';
import { stages, stageById } from '../src/data/stages';
import { enemies } from '../src/data/enemies';
import type { ForestScene } from '../src/game/scenes/ForestScene';
import type { RunEngine } from '../src/game/systems/RunEngine';
import type { EnemyState } from '../src/shared/models';

// Chỉ trang QA có fixture này. Bản build game không nhập file và không cung cấp đường truy cập engine.
const bridge = new GameBridge();
const profile = newProfile();
profile.realm = 46;
profile.selectedSkills = ['viem-hoan', 'loi-lien', 'hoa-linh', 'loi-tam'];
profile.settings.music = false;
profile.settings.sound = false;
bridge.update({ profile });
bridge.testSettings({ enabled: true });
const game = createGame(document.getElementById('game')!, bridge);
const select = document.getElementById('stage') as HTMLSelectElement;
const status = document.getElementById('status')!;
let zoom = 0.5,
  speed = 1;
for (const stage of stages) select.add(new Option(stage.name, stage.id));
select.value = stages[4].id;
bridge.subscribe(() => {
  if (bridge.getSnapshot().status === 'ready' && bridge.getSnapshot().mode === 'menu')
    status.textContent =
      'Sẵn sàng. Khung mẫu lấy từ sự kiện sát thương thật, không ghép ảnh minh họa.';
});

function start(): { scene: ForestScene; run: RunEngine } | null {
  if (bridge.getSnapshot().status !== 'ready') return null;
  const scene = game.scene.getScene('forest') as ForestScene;
  const previous = Reflect.get(scene, 'engine') as RunEngine | null;
  if (previous) {
    previous.abandon();
    bridge.update({ mode: 'result' });
    bridge.dispatch({ type: 'leave' });
  }
  bridge.dispatch({ type: 'stage', id: select.value });
  bridge.dispatch({ type: 'start' });
  bridge.dispatch({ type: 'zoom', zoom });
  const run = Reflect.get(scene, 'engine') as RunEngine;
  run.skills = { 'cuong-quyen': 1, 'viem-hoan': 6, 'loi-lien': 6, 'hoa-linh': 1, 'loi-tam': 1 };
  run.stats.damage = 2;
  run.stats.regen = 200;
  run.bonus.armor = 1000;
  run.setPresentationTimeScale(speed);
  bridge.testSettings({ timeScale: speed });
  const pool = Object.keys(stageById(select.value).spawnWaves.at(-1)!.weights);
  run.enemies = Array.from({ length: 14 }, (_, index): EnemyState => {
    const type = pool[index % pool.length],
      definition = enemies[type];
    const angle = (index * Math.PI * 2) / 14,
      radius = 2.1 + (index % 3) * 1.2;
    return {
      id: 10000 + index,
      type,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      hp: 100000,
      maxHp: 100000,
      radius: definition.radius,
      speed: 0,
      damage: 0,
      facing: 'S',
      combo: 0,
      attack: 0,
      attackTime: 0,
      attackDuration: 0.6,
      impactAt: 0.3,
      impacted: false,
      cooldown: 10000,
      target: { x: 0, y: 0 },
      dead: false,
      deathTime: 0,
      hitTime: 0,
    };
  });
  return { scene, run };
}

document.getElementById('frame')!.onclick = () => {
  const setup = start();
  if (!setup) return;
  const { run, scene } = setup;
  let captured = false;
  for (let step = 0; step < 1200; step++) {
    run.tick(1 / 60, { x: 0, y: 0 });
    if (run.mode === 'levelup') run.choose(run.choices[0].id);
    const ring = run.visuals.find((event) => event.kind === 'ring' && event.life > 0.3);
    const chain = run.visuals.find((event) => event.kind === 'lightning' && event.life > 0.3);
    if (ring && chain) {
      captured = true;
      // Giữ một khung sau chớp trúng đòn để đọc được cả sprite và đường nối còn đang sống.
      for (let settle = 0; settle < 12; settle++) run.tick(1 / 60, { x: 0, y: 0 });
      break;
    }
  }
  run.pause();
  (Reflect.get(scene, 'renderRun') as (dt: number) => void).call(scene, 0);
  status.textContent = `${captured ? 'ĐẠT' : 'LỖI'} · camera ${zoom}× · x${speed} · ${run.visuals.filter((event) => event.kind === 'ring').length} vòng lửa · ${run.visuals.filter((event) => event.kind === 'lightning').length} chuỗi sét · thời gian ${run.time.toFixed(2)}s · đã giữ khung để soi`;
};
document.getElementById('live')!.onclick = () => {
  start();
  status.textContent =
    'Đang chạy engine/renderer thật; kẻ địch fixture đứng yên để quan sát đường nối và vùng sát thương.';
};
document.getElementById('zoom')!.onclick = (event) => {
  zoom = zoom === 0.5 ? 1 : 0.5;
  (event.currentTarget as HTMLButtonElement).textContent = `Camera ${zoom}×`;
  bridge.dispatch({ type: 'zoom', zoom });
  const scene = game.scene.getScene('forest');
  if (Reflect.get(scene, 'engine'))
    (Reflect.get(scene, 'renderRun') as (dt: number) => void).call(scene, 0);
};
document.getElementById('speed')!.onclick = (event) => {
  speed = speed === 1 ? 8 : 1;
  (event.currentTarget as HTMLButtonElement).textContent = `Thời gian x${speed === 1 ? 8 : 1}`;
  bridge.testSettings({ timeScale: speed });
};
window.addEventListener('pagehide', () => {
  bridge.dispose();
  game.destroy(true);
});

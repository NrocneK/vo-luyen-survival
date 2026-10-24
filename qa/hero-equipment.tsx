import Phaser from 'phaser';
import { hero, type HeroMode, type HeroClip } from '../src/data/hero';
import { equipment, slotNames } from '../src/data/equipment';
import { newProfile } from '../src/domain/profile';
import { PlayerView } from '../src/game/entities/PlayerView';
import { assetUrl } from '../src/data/assets';
import { project } from '../src/game/math/worldPhysics';
import type { Direction } from '../src/shared/types';
import type { Slot } from '../src/shared/models';

const profile = newProfile();
profile.relicUnlocked = true;
let mode: HeroMode = 'unarmed',
  clip = 'idle',
  direction: Direction = 'S',
  phase = 0,
  paused = false;
let view: PlayerView, scene: Phaser.Scene;
let ground: Phaser.GameObjects.Graphics;
let travelTime = 0;
let modeRequest = 0;
const input = <T extends HTMLElement>(id: string) => document.getElementById(id)! as T;
const directions: Direction[] = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
class Review extends Phaser.Scene {
  preload() {
    for (const t of hero.textures.filter((t) => t.mode === mode))
      this.load.atlas(t.key, assetUrl(t.file), assetUrl(t.atlas));
  }
  create() {
    scene = this;
    this.cameras.main.roundPixels = false;
    ground = this.add.graphics().setDepth(-10);
    ground.lineStyle(1, 0x49614f, 0.35);
    for (let i = -20; i <= 20; i++) {
      for (const [a, b] of [
        [
          { x: i, y: -20 },
          { x: i, y: 20 },
        ],
        [
          { x: -20, y: i },
          { x: 20, y: i },
        ],
      ]) {
        const p = project(a, { origin: { x: 850, y: 650 }, pixelsPerUnit: 110 }),
          q = project(b, { origin: { x: 850, y: 650 }, pixelsPerUnit: 110 });
        ground.lineBetween(p.x, p.y, q.x, q.y);
      }
    }
    view = new PlayerView(this, 'duong-khai', { origin: { x: 800, y: 600 }, pixelsPerUnit: 100 });
    this.add
      .text(850, 90, 'DƯƠNG KHAI', { fontFamily: 'serif', fontSize: '26px', color: '#dfbb7a' })
      .setOrigin(0.5);
    this.add
      .text(850, 760, `${hero.pixelArt ? 'Pixel art' : 'Rig 3D'} · Tám hướng · Bảy ô trang bị`, {
        fontSize: '15px',
        color: '#9db39f',
      })
      .setOrigin(0.5);
    input('status').textContent = 'Sẵn sàng';
    draw();
  }
  update(_time: number, delta: number) {
    if (!view) return;
    if (!paused) {
      const data = hero.animations[mode][clip];
      travelTime += Math.min(delta / 1000, 0.1) * Number(input<HTMLInputElement>('speed').value);
      phase +=
        (Math.min(delta / 1000, 0.1) * Number(input<HTMLInputElement>('speed').value)) /
        data.durationSeconds;
      phase = data.loop ? phase % 1 : Math.min(0.999999, phase);
      input<HTMLInputElement>('phase').value = String(phase);
    }
    draw();
  }
}
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  width: 1440,
  height: 900,
  backgroundColor: '#263c30',
  scene: Review,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
function draw() {
  if (Reflect.get(view, 'mode') !== mode) return;
  view.setEquipment(profile);
  const data: HeroClip = hero.animations[mode][clip];
  Reflect.set(view, 'clip', data);
  Reflect.set(view, 'facing', direction);
  Reflect.set(view, 'frame', Math.min(data.count - 1, Math.floor(phase * data.count)));
  Reflect.set(view, 'scale', hero.pixelArt ? 2.2 : 1.1);
  Reflect.get(view, 'applyPose').call(view, 850, 650, 650);
  // Nền chạy ngược hướng đi; các đường lặp theo hai vector của lưới isometric.
  const locomotion = data.locomotion;
  if (locomotion) {
    const angle =
      ({ S: 45, SW: 0, W: 315, NW: 270, N: 225, NE: 180, E: 135, SE: 90 }[direction] * Math.PI) /
      180;
    const distance = travelTime * locomotion.worldSpeed;
    const offset = project(
      { x: -((Math.sin(angle) * distance) % 1), y: -((-Math.cos(angle) * distance) % 1) },
      { origin: { x: 0, y: 0 }, pixelsPerUnit: 110 },
    );
    ground.setPosition(offset.x, offset.y);
  } else ground.setPosition(0, 0);
}
async function setMode(value: HeroMode) {
  const request = ++modeRequest;
  input('status').textContent = 'Đang đổi vũ khí…';
  view.setActor(value === 'sword' ? 'duong-khai-kiem' : 'duong-khai');
  await view.ready();
  if (request !== modeRequest) return;
  mode = value;
  if (!hero.animations[mode][clip]) clip = 'idle';
  input<HTMLSelectElement>('mode').value = mode;
  refreshClips();
  input('status').textContent = 'Sẵn sàng';
  draw();
}
function refreshClips() {
  const select = input<HTMLSelectElement>('clip');
  select.innerHTML = '';
  for (const [id, label] of [
    ['idle', 'Đứng / thủ'],
    ['walk', 'Đi'],
    ['run', 'Chạy'],
    ['attack-1', 'Đòn 1'],
    ['attack-2', 'Đòn 2'],
    ['attack-3', 'Đòn 3'],
    ['hurt', 'Trúng đòn'],
    ['death', 'Ngã'],
  ]) {
    select.add(new Option(label, id));
  }
  select.value = clip;
}
refreshClips();
for (const d of directions) input<HTMLSelectElement>('direction').add(new Option(d, d));
for (const slot of Object.keys(slotNames) as Slot[]) {
  const label = document.createElement('label');
  label.textContent = slotNames[slot];
  const select = document.createElement('select');
  select.dataset.slot = slot;
  select.add(new Option('Không', ''));
  for (const item of Object.values(equipment).filter((i) => i.slot === slot))
    select.add(new Option(item.name, item.id));
  select.value = profile.equipped[slot] ?? '';
  select.onchange = () => {
    profile.equipped[slot] = select.value || null;
    if (slot === 'weapon' && select.value)
      void setMode(select.value.includes('kiem') ? 'sword' : 'unarmed');
    draw();
  };
  label.append(select);
  input('equipment').append(label);
}
function preset(name: string) {
  const ids =
    name === 'plain'
      ? ['dong-quyen-sao', 'vo-phuc', 'ngoc-gioi']
      : name === 'world2'
        ? [
            'liet-duong-quyen-sao',
            'thanh-minh-quan',
            'huyen-linh-chien-y',
            'ho-mach-uyen',
            'truy-phong-ngoa',
            'ngung-than-boi',
            'ma-than-ho-an',
          ]
        : [
            'thanh-nguyen-quyen-sao',
            'huyen-quang-quan',
            'thanh-nguyen-chien-y',
            'kim-cuong-ho-uyen',
            'ngu-phong-ngoa',
            'thanh-tam-ngoc-boi',
            'thanh-chu-ngoc-an',
          ];
  for (const slot of Object.keys(slotNames) as Slot[]) profile.equipped[slot] = null;
  for (let id of ids) {
    if (equipment[id].slot === 'weapon' && mode === 'sword')
      id =
        name === 'plain'
          ? 'thiet-kiem'
          : name === 'world2'
            ? 'xich-duong-kiem'
            : 'huyen-duong-thanh-kiem';
    profile.equipped[equipment[id].slot] = id;
  }
  document
    .querySelectorAll<HTMLSelectElement>('[data-slot]')
    .forEach((s) => (s.value = profile.equipped[s.dataset.slot as Slot] ?? ''));
  if (view) draw();
}
document
  .querySelectorAll<HTMLButtonElement>('[data-preset]')
  .forEach((b) => (b.onclick = () => preset(b.dataset.preset!)));
input<HTMLSelectElement>('mode').onchange = () =>
  void setMode(input<HTMLSelectElement>('mode').value as HeroMode);
input<HTMLSelectElement>('clip').onchange = () => {
  clip = input<HTMLSelectElement>('clip').value;
  phase = 0;
};
input<HTMLSelectElement>('direction').onchange = () =>
  (direction = input<HTMLSelectElement>('direction').value as Direction);
input<HTMLButtonElement>('pause').onclick = () => {
  paused = !paused;
  input('pause').textContent = paused ? 'Phát' : 'Tạm dừng';
};
input<HTMLButtonElement>('step').onclick = () => {
  paused = true;
  phase = Math.min(0.99999, phase + 1 / hero.animations[mode][clip].count);
  draw();
};
input<HTMLInputElement>('phase').oninput = () => {
  paused = true;
  phase = Number(input<HTMLInputElement>('phase').value);
  draw();
};
Object.assign(window, {
  heroQA: {
    game,
    profile,
    hero,
    setMode,
    preset,
    scene: () => scene,
    view: () => view,
    pose: (c: string, d: Direction, p: number) => {
      paused = true;
      clip = c;
      direction = d;
      phase = p;
      travelTime = p * hero.animations[mode][clip].durationSeconds;
      draw();
    },
    state: () => ({ mode, clip, direction, phase, paused }),
  },
});

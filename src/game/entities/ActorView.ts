import Phaser from 'phaser';
import { actorAsset } from '../../data/assets';
import { project } from '../math/worldPhysics';
import type { Projection } from '../math/worldPhysics';
import type { Point, Direction } from '../../shared/types';

export class ActorView {
  readonly sprite: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  private bar: Phaser.GameObjects.Graphics;
  private actor: ReturnType<typeof actorAsset>;
  private walkPhase = 0;
  private idlePhase = 0;
  private last: Point | null = null;
  private visualScale = 1;
  private facing: Direction = 'S';
  constructor(
    scene: Phaser.Scene,
    id: string,
    private projection: Projection,
  ) {
    this.actor = actorAsset(id);
    this.shadow = scene.add.ellipse(0, 0, 22, 8, 0x020d0c, 0.38);
    this.sprite = scene.add.sprite(0, 0, id, 'idle-S-00');
    this.bar = scene.add.graphics();
    this.setActor(id);
  }
  setActor(id: string): void {
    if (this.actor.id === id && this.sprite.texture.key === id) {
      this.resize();
      return;
    }
    this.actor = actorAsset(id);
    this.sprite.setTexture(id, 'idle-S-00');
    this.resize();
    this.last = null;
  }
  setProjection(projection: Projection): void {
    this.projection = projection;
    this.resize();
    this.last = null;
  }
  private resize(): void {
    this.sprite
      .setOrigin(...this.actor.origin)
      .setScale(
        (this.visualScale * this.projection.pixelsPerUnit) /
          (this.actor.size / this.actor.camera.orthoScale),
      );
  }
  setVisualScale(scale: number): this {
    this.visualScale = scale;
    this.resize();
    return this;
  }
  render(
    point: Point,
    facing: Direction,
    dt: number,
    attack = 0,
    attackTime = 0,
    attackDuration = 0.58,
    deathTime = -1,
    hp = 1,
    maxHp = 1,
    elite = false,
    hit = false,
  ): void {
    this.facing = facing;
    const travel = this.last ? Math.hypot(point.x - this.last.x, point.y - this.last.y) : 0;
    this.last = { ...point };
    this.idlePhase += dt;
    // Pha chân tiến theo quãng đường thật; đứng trước vật cản thì không chạy chân tại chỗ.
    this.walkPhase += travel / (this.actor.walk.worldSpeed * this.actor.walk.cycleSeconds);
    // Boss biến thể có thể dùng bốn cơ chế với actor ba clip; chọn clip có thật.
    const visualAttack =
      attack && !this.actor.animations[`attack-${attack}-${facing}`]
        ? ((attack - 1) % this.actor.attacks.length) + 1
        : attack;
    const state =
      deathTime >= 0
        ? 'death'
        : visualAttack
          ? `attack-${visualAttack}`
          : travel > 0.00005
            ? 'walk'
            : 'idle';
    const animation = this.actor.animations[`${state}-${facing}`];
    const phase =
      deathTime >= 0
        ? Math.min(0.999, deathTime / 0.83)
        : attack
          ? Math.min(0.999, attackTime / attackDuration)
          : state === 'walk'
            ? this.walkPhase % 1
            : this.idlePhase % 1;
    if (animation)
      this.sprite.setFrame(animation.frames[Math.floor(phase * animation.frames.length)]);
    const screen = project(point, this.projection);
    this.sprite.setPosition(screen.x, screen.y).setDepth(screen.y);
    this.sprite.setAlpha(deathTime >= 0 ? Math.max(0, 1 - Math.max(0, deathTime - 0.7) / 0.4) : 1);
    if (hit) this.sprite.setTintFill(0xf9dac0);
    else this.sprite.clearTint();
    this.shadow
      .setPosition(screen.x, screen.y + 1)
      .setDepth(screen.y - 0.1)
      .setAlpha(deathTime >= 0 ? 0 : 0.35);
    this.bar.clear().setDepth(screen.y + 0.2);
    if (deathTime < 0 && maxHp > 1 && (hp < maxHp || elite)) {
      const width = elite ? 40 : 24,
        y = screen.y - this.sprite.displayHeight * 0.64;
      this.bar.fillStyle(0x081813, 0.8).fillRect(screen.x - width / 2, y, width, 3);
      this.bar
        .fillStyle(elite ? 0xd4ac63 : 0xb87763)
        .fillRect(screen.x - width / 2, y, width * Math.max(0, hp / maxHp), 3);
    }
  }
  /** Điểm gắn theo khung gốc chưa trim: bả vai ở y≈49/128, không lấy tọa độ chân. */
  get renderedFacing(): Direction {
    return this.facing;
  }
  attachment(kind: 'back' | 'chest' | 'head'): Point {
    const lateral: Record<Direction, number> = {
      S: 0,
      N: 0,
      E: -0.025,
      W: 0.025,
      SE: -0.018,
      SW: 0.018,
      NE: -0.018,
      NW: 0.018,
    };
    const y = kind === 'head' ? 0.29 : kind === 'back' ? 0.39 : 0.43;
    return {
      x:
        this.sprite.x +
        (0.5 + lateral[this.facing] - this.sprite.originX) * this.actor.size * this.sprite.scaleX,
      y: this.sprite.y + (y - this.sprite.originY) * this.actor.size * this.sprite.scaleY,
    };
  }
  lobby(x: number, y: number, dt: number): void {
    this.idlePhase += dt;
    const frames = this.actor.animations['idle-S'].frames;
    this.sprite
      .setFrame(frames[Math.floor(this.idlePhase * 8) % frames.length])
      .setPosition(x, y)
      .setDepth(1000)
      .setScale(1.65)
      .setAlpha(1)
      .clearTint();
    this.shadow.setPosition(x, y).setDepth(999).setScale(2).setAlpha(0.4);
    this.bar.clear();
  }
  resetScale(): void {
    this.resize();
    this.shadow.setScale(1);
    this.last = null;
  }
  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
    this.bar.destroy();
  }
}

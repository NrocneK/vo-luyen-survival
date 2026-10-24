import Phaser from 'phaser';
import { hero, type HeroClip, type HeroMode, type HeroAttachment } from '../../data/hero';
import { assetUrl } from '../../data/assets';
import { equippedLooks, attackPosePhase, type EquipmentLook } from '../../data/equipmentAppearance';
import { project, type Projection } from '../math/worldPhysics';
import type { Point, Direction } from '../../shared/types';
import type { Profile } from '../../shared/models';

/** Bộ nhân vật Thông Huyền v9: thân và trang bị dùng chung pose/neo từ rig. */
export class PlayerView {
  readonly sprite: Phaser.GameObjects.Sprite;
  private pieces: Phaser.GameObjects.Image[] = [];
  private shadow: Phaser.GameObjects.Ellipse;
  private relicLight: Phaser.GameObjects.Graphics;
  private mode: HeroMode;
  private requestedMode: HeroMode;
  private loading: Promise<void> | null = null;
  private facing: Direction = 'S';
  private clip: HeroClip;
  private frame = 0;
  private looks: EquipmentLook[] = [];
  private equipmentKey = '';
  private last: Point | null = null;
  private walkPhase = 0;
  private runPhase = 0;
  private idleTime = 0;
  private heldAttack = 0;
  private heldTime = 0;
  private scale = 1;
  private hit = false;
  private statusTint: number | null = null;
  constructor(
    private scene: Phaser.Scene,
    id: string,
    private projection: Projection,
  ) {
    this.mode = this.requestedMode = id === 'duong-khai-kiem' ? 'sword' : 'unarmed';
    this.clip = hero.animations[this.mode].idle;
    const ref = this.clip.directions.S.base[0],
      texture = hero.textures[hero.frames[ref]];
    this.sprite = scene.add.sprite(0, 0, texture.key, String(ref));

    this.shadow = scene.add.ellipse(0, 0, 52, 21, 0x020d0c, 1);
    this.relicLight = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.filterTextures();
    this.resetScale();
  }
  private filterTextures(): void {
    for (const t of hero.textures)
      if (this.scene.textures.exists(t.key))
        this.scene.textures.get(t.key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
  get appearanceReady(): boolean {
    return this.mode === this.requestedMode && !this.loading;
  }
  setActor(id: string): void {
    const mode = id === 'duong-khai-kiem' ? 'sword' : 'unarmed';
    this.requestedMode = mode;
    if (this.mode === mode || this.loading) return;
    void this.ready().catch((error: unknown) => this.scene.events.emit('hero-load-error', error));
  }
  /** Chỉ giữ atlas của bộ quyền hoặc kiếm đang dùng để giới hạn bộ nhớ GPU. */
  async ready(): Promise<void> {
    if (this.loading) {
      await this.loading;
      if (this.mode !== this.requestedMode) await this.ready();
      return;
    }
    if (this.mode === this.requestedMode) return;
    const mode = this.requestedMode;
    this.loading = new Promise<void>((resolve, reject) => {
      const textures = hero.textures.filter(
        (t) => t.mode === mode && !this.scene.textures.exists(t.key),
      );
      const finish = () => {
        this.scene.load.off('loaderror', fail);
        const old = this.mode;
        this.mode = mode;
        this.clip = hero.animations[mode].idle;
        this.frame = 0;
        this.pieces.forEach((p) => p.destroy());
        this.pieces = [];
        this.filterTextures();
        this.applyPose(this.sprite.x, this.sprite.y, this.sprite.depth);
        for (const t of hero.textures)
          if (t.mode === old && this.scene.textures.exists(t.key))
            this.scene.textures.remove(t.key);
        this.last = null;
        this.heldAttack = 0;
        resolve();
      };
      const fail = (file: Phaser.Loader.File) => {
        if (!textures.some((t) => t.key === file.key)) return;
        this.scene.load.off('complete', finish);
        this.scene.load.off('loaderror', fail);
        reject(new Error('Không tải được ngoại quan nhân vật. Hãy tải lại trang.'));
      };
      if (!textures.length) {
        finish();
        return;
      }
      this.scene.load.on('loaderror', fail);
      this.scene.load.once('complete', finish);
      for (const t of textures) this.scene.load.atlas(t.key, assetUrl(t.file), assetUrl(t.atlas));
      if (!this.scene.load.isLoading()) this.scene.load.start();
    });
    try {
      await this.loading;
    } finally {
      this.loading = null;
    }
    if (this.mode !== this.requestedMode) await this.ready();
  }
  setEquipment(profile: Profile): void {
    const key = JSON.stringify([profile.equipped, profile.relicUnlocked]);
    if (key === this.equipmentKey) return;
    this.equipmentKey = key;
    this.looks = equippedLooks(profile);
  }
  setProjection(projection: Projection): void {
    this.projection = projection;
    this.resetScale();
  }
  resetScale(): void {
    this.scale = this.projection.pixelsPerUnit / hero.pixelsPerUnit;
    this.last = null;
    this.heldAttack = 0;
  }
  endCombat(): void {
    this.heldAttack = 0;
    this.hit = false;
    this.setStatusTint(null);
  }
  get renderedFacing(): Direction {
    return this.facing;
  }
  setStatusTint(color: number | null): void {
    this.statusTint = color;
    this.applyTint();
  }
  private applyTint(): void {
    const sprites = [this.sprite, ...this.pieces.filter((p) => p.visible)];
    for (const p of sprites) {
      const base = p.getData('appearanceTint') as number | undefined;
      if (this.hit) p.setTintFill(0xf9dac0);
      else if (this.statusTint !== null) {
        const tint = this.statusTint;
        const multiply =
          base === undefined
            ? tint
            : (Math.round((((base >> 16) & 255) * ((tint >> 16) & 255)) / 255) << 16) |
              (Math.round((((base >> 8) & 255) * ((tint >> 8) & 255)) / 255) << 8) |
              Math.round(((base & 255) * (tint & 255)) / 255);
        p.setTint(multiply);
      } else if (base !== undefined) p.setTint(base);
      else p.clearTint();
    }
  }
  attachment(kind: HeroAttachment): Point {
    const point = this.clip.directions[this.facing].attachments[kind][this.frame];
    return {
      x: this.sprite.x + (point[0] - this.clip.anchor[0] * this.clip.frameSize) * this.scale,
      y: this.sprite.y + (point[1] - this.clip.anchor[1] * this.clip.frameSize) * this.scale,
    };
  }
  private applyPose(x: number, y: number, depth: number): void {
    const pose = this.clip.directions[this.facing],
      ref = pose.base[this.frame];
    this.sprite
      .setTexture(hero.textures[hero.frames[ref]].key, String(ref))
      .setOrigin(...this.clip.anchor)
      .setPosition(x, y)
      .setScale(this.scale)
      .setDepth(depth)
      .setAlpha(1);
    const refs: { id: number; tint?: number; relic?: boolean }[] = [];
    for (const look of this.looks) {
      if (look.slot === 'body' && look.id !== 'vo-phuc')
        for (const id of pose.layers.cloth?.[this.frame] ?? [])
          refs.push({ id, tint: look.clothTint });
      for (const id of pose.layers[`${look.tier}-${look.slot}`]?.[this.frame] ?? [])
        refs.push({ id, relic: look.slot === 'relic' });
    }
    refs.forEach(({ id, tint }, i) => {
      let piece = this.pieces[i];
      if (!piece) {
        piece = this.scene.add.image(0, 0, hero.textures[hero.frames[id]].key, String(id));

        this.pieces.push(piece);
      }
      piece
        .setTexture(hero.textures[hero.frames[id]].key, String(id))
        .setOrigin(...this.clip.anchor)
        .setPosition(x, y)
        .setScale(this.scale)
        .setDepth(depth + 0.00001 * (i + 1))
        .setVisible(true);
      piece.setData('appearanceTint', tint);
    });
    for (let i = refs.length; i < this.pieces.length; i++) this.pieces[i].setVisible(false);
    this.relicLight.clear().setDepth(depth + 0.001);
    const relic = refs.flatMap((ref, i) => (ref.relic ? [this.pieces[i].frame] : []));
    if (relic.length) {
      const left = Math.min(...relic.map((r) => r.x)),
        right = Math.max(...relic.map((r) => r.x + r.width)),
        top = Math.min(...relic.map((r) => r.y)),
        bottom = Math.max(...relic.map((r) => r.y + r.height)),
        cx = x + ((left + right) / 2 - this.clip.anchor[0] * this.clip.frameSize) * this.scale,
        cy = y + ((top + bottom) / 2 - this.clip.anchor[1] * this.clip.frameSize) * this.scale,
        radius = Math.max(4, (bottom - top) * this.scale * 0.65),
        phase = this.idleTime * 2 + this.frame / this.clip.count;
      // Ấn hộ thể nổi cạnh hông: luồng sáng mảnh cho thấy đây là bí bảo, không phải mảnh giáp rời.
      this.relicLight.fillStyle(0x97d5e7, 0.055).fillEllipse(cx, cy, radius * 1.7, radius * 2.2);
      for (let i = 0; i < 3; i++) {
        const a = phase + (i * Math.PI * 2) / 3;
        this.relicLight
          .fillStyle(i % 2 ? 0xffdf8c : 0x9adfe7, 0.6)
          .fillCircle(
            cx + Math.cos(a) * radius * 0.8,
            cy + Math.sin(a) * radius,
            Math.max(0.55, this.scale * 0.9),
          );
      }
    }
    this.applyTint();
    const s = pose.shadows[this.frame];
    if (s)
      this.shadow
        .setPosition(x + s.center[0] * this.scale, y + s.center[1] * this.scale)
        .setSize(s.radii[0] * 2, s.radii[1] * 2)
        .setScale(this.scale)
        .setRotation(s.angle)
        .setAlpha(s.alpha)
        .setDepth(depth - 0.01);
  }
  render(
    point: Point,
    facing: Direction,
    dt: number,
    attack = 0,
    attackTime = 0,
    attackDuration = 0.58,
    deathTime = -1,
    _hp = 1,
    _maxHp = 1,
    _elite = false,
    hit = false,
  ): void {
    this.facing = facing;
    this.hit = hit;
    const distance = this.last ? Math.hypot(point.x - this.last.x, point.y - this.last.y) : 0;
    this.last = { ...point };
    this.idleTime += dt;
    const clips = hero.animations[this.mode],
      walk = clips.walk.locomotion!,
      run = clips.run.locomotion!;
    this.walkPhase += distance / (walk.worldSpeed * walk.cycleSeconds);
    this.runPhase += distance / (run.worldSpeed * run.cycleSeconds);
    if (attack) {
      this.heldAttack = attack;
      this.heldTime = 0;
    } else this.heldTime += dt;
    const hold =
      this.mode === 'sword' &&
      this.heldAttack > 0 &&
      this.heldTime < (this.heldAttack === 3 ? 0.38 : 1.05) &&
      distance < 0.00005;
    const moving = distance > 0.00005,
      running = moving && dt > 0 && distance / dt > 1.3;
    const name =
      deathTime >= 0
        ? 'death'
        : attack
          ? `attack-${attack}`
          : moving
            ? running
              ? 'run'
              : 'walk'
            : hold
              ? `attack-${this.heldAttack}`
              : 'idle';
    this.clip = clips[name] ?? clips.idle;
    const phase =
      deathTime >= 0
        ? deathTime / this.clip.durationSeconds
        : attack
          ? attackPosePhase(attackTime / attackDuration, this.clip.impactPhase)
          : hold
            ? 0.99999
            : moving
              ? (running ? this.runPhase : this.walkPhase) % 1
              : (this.idleTime / this.clip.durationSeconds) % 1;
    this.frame = Math.min(this.clip.count - 1, Math.floor(Math.max(0, phase) * this.clip.count));
    const screen = project(point, this.projection);
    this.applyPose(screen.x, screen.y, screen.y);
  }
  lobby(x: number, y: number, dt: number, facing: Direction = 'S', scale = 0.72): void {
    this.facing = facing;
    this.hit = false;
    this.statusTint = null;
    this.idleTime += dt;
    this.clip = hero.animations[this.mode].idle;
    this.frame = Math.floor(((this.idleTime / this.clip.durationSeconds) % 1) * this.clip.count);
    this.scale = scale * (hero.lobbyScale ?? 1);
    this.applyPose(x, y, 1000);
  }
  destroy(): void {
    this.sprite.destroy();
    this.pieces.forEach((p) => p.destroy());
    this.shadow.destroy();
    this.relicLight.destroy();
  }
}

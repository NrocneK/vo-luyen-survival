import Phaser from 'phaser';
import { GameBridge } from '../../app/GameBridge';
import { areaAt, stage, forestLayout, forestProjection, forestTrails } from '../../data/stages';
import { lobbyAreas } from '../../data/lobby';
import { weapons } from '../../data/weapons';
import { enemies } from '../../data/enemies';
import { mapObstacles } from '../../data/mapCollisions';
import { ActorView } from '../entities/ActorView';
import { RunEngine } from '../systems/RunEngine';
import { inputToWorld, project } from '../math/worldPhysics';
import type { Projection } from '../math/worldPhysics';
import type { GameCommand } from '../../shared/types';

export class ForestScene extends Phaser.Scene {
  private player!: ActorView;
  private courtyard!: Phaser.GameObjects.Image;
  private map: (
    | Phaser.GameObjects.Image
    | Phaser.GameObjects.TileSprite
    | Phaser.GameObjects.Graphics
  )[] = [];
  private foliage: Phaser.GameObjects.Image[] = [];
  private controls!: Record<string, Phaser.Input.Keyboard.Key>;
  private engine: RunEngine | null = null;
  private actorViews = new Map<number, ActorView>();
  private pet: ActorView | null = null;
  private dropViews = new Map<number, Phaser.GameObjects.Image>();
  private bullets = new Map<number, Phaser.GameObjects.Image>();
  private effects = new Map<number, Phaser.GameObjects.Image | Phaser.GameObjects.Text>();
  private warnings!: Phaser.GameObjects.Graphics;
  private publishIn = 0;
  private lastMode = 'menu';
  private projection: Projection = forestProjection;
  constructor(private bridge: GameBridge) {
    super('forest');
  }
  create(): void {
    this.createGround();
    for (const prop of forestLayout.props) {
      const point = project({ x: prop.world[0], y: prop.world[1] }, this.projection);
      const image = this.add
        .image(point.x, point.y, stage.propsId, prop.frame)
        .setOrigin(...prop.origin)
        .setScale(prop.scale)
        .setDepth(point.y);
      this.map.push(image);
      if (prop.frame.startsWith('cay-') || ['mieu-da', 'cot-da'].includes(prop.frame))
        this.foliage.push(image);
    }
    this.courtyard = this.add.image(0, 0, 'cultivation-courtyard').setOrigin(0.5).setDepth(-1000);
    this.player = new ActorView(
      this,
      weapons[this.bridge.getSnapshot().weapon].actorId,
      this.projection,
    );
    this.controls = this.input.keyboard!.addKeys(
      {
        up: 'UP',
        down: 'DOWN',
        left: 'LEFT',
        right: 'RIGHT',
        w: 'W',
        a: 'A',
        s: 'S',
        d: 'D',
        q: 'Q',
        dash: 'SPACE',
      },
      false,
    ) as typeof this.controls;
    // Bắt ngay keydown để thao tác bấm nhanh không bị mất giữa hai frame.
    this.controls.q.on('down', () => this.bridge.dispatch({ type: 'potion' }));
    this.controls.dash.on('down', () => this.bridge.dispatch({ type: 'dash' }));
    this.warnings = this.add.graphics().setDepth(-900);
    this.showLobby();
    const unsubscribe = this.bridge.onCommand((command) => this.command(command));
    const onBlur = () => {
      this.input.keyboard?.resetKeys();
      this.engine?.pause();
      this.sync();
    };
    const resize = () => {
      if (this.bridge.getSnapshot().mode === 'menu') this.showLobby(false);
    };
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.game.events.on(Phaser.Core.Events.HIDDEN, onBlur);
    this.scale.on(Phaser.Scale.Events.RESIZE, resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe();
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
      this.game.events.off(Phaser.Core.Events.HIDDEN, onBlur);
      this.scale.off(Phaser.Scale.Events.RESIZE, resize);
    });
    this.bridge.update({ status: 'ready', progress: 1 });
  }
  private createGround(): void {
    const [width, height] = forestLayout.dimensions;
    // TileSprite trải cùng một ô nền: map lớn không cần texture hàng chục megapixel.
    this.map.push(
      this.add
        .tileSprite(0, 0, width, height, stage.groundId)
        .setOrigin(0)
        .setTileScale(1, 1 / Math.sqrt(3))
        .setDepth(-2000),
    );
    const paths = this.add.graphics().setDepth(-1990);
    for (const trail of forestTrails) {
      const points = trail.map((point) => project(point, this.projection));
      paths.lineStyle(58, 0x716447, 0.1).strokePoints(points);
      paths.lineStyle(30, 0x9c8961, 0.1).strokePoints(points);
    }
    this.map.push(paths);
    const { minX, minY, maxX, maxY } = stage.bounds;
    const left = project({ x: minX, y: minY }, this.projection);
    const bottom = project({ x: maxX, y: minY }, this.projection);
    const right = project({ x: maxX, y: maxY }, this.projection);
    const top = project({ x: minX, y: maxY }, this.projection);
    const rim = this.add.graphics().setDepth(-1980).fillStyle(0x081a13, 0.72);
    for (const polygon of [
      [{ x: 0, y: 0 }, { x: top.x, y: 0 }, top, left, { x: 0, y: left.y }],
      [{ x: top.x, y: 0 }, { x: width, y: 0 }, { x: width, y: right.y }, right, top],
      [
        { x: width, y: right.y },
        { x: width, y: height },
        { x: bottom.x, y: height },
        bottom,
        right,
      ],
      [{ x: bottom.x, y: height }, { x: 0, y: height }, { x: 0, y: left.y }, left, bottom],
    ])
      rim.fillPoints(polygon, true);
    rim.lineStyle(42, 0x173424, 0.35).strokePoints([left, bottom, right, top], true);
    rim.lineStyle(8, 0x537052, 0.16).strokePoints([left, bottom, right, top], true);
    this.map.push(rim);
  }
  private showLobby(animate = true): void {
    this.cameras.main.stopFollow().removeBounds().setZoom(1).setScroll(0, 0);
    this.map.forEach((image) => image.setVisible(false));
    this.courtyard
      .setVisible(true)
      .setTexture(lobbyAreas[this.bridge.getSnapshot().lobbyArea].background);
    const factor = Math.max(
      this.scale.width / this.courtyard.width,
      this.scale.height / this.courtyard.height,
    );
    this.courtyard
      .setPosition(this.scale.width * 0.5, this.scale.height * 0.5)
      .setScale(factor)
      .setAlpha(animate ? 0 : 0.95);
    this.tweens.killTweensOf(this.courtyard);
    if (animate) this.tweens.add({ targets: this.courtyard, alpha: 0.95, duration: 220 });
    this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
    this.input.keyboard?.removeCapture([
      'UP',
      'DOWN',
      'LEFT',
      'RIGHT',
      'W',
      'A',
      'S',
      'D',
      'Q',
      'SPACE',
    ]);
  }
  private clearRun(): void {
    this.actorViews.forEach((view) => view.destroy());
    this.actorViews.clear();
    for (const collection of [this.dropViews, this.bullets, this.effects]) {
      collection.forEach((view) => view.destroy());
      collection.clear();
    }
    this.pet?.destroy();
    this.pet = null;
    this.warnings.clear();
    this.engine = null;
  }
  private command(command: GameCommand): void {
    switch (command.type) {
      case 'travel':
        if (this.bridge.getSnapshot().mode === 'menu') this.showLobby();
        break;
      case 'start':
        if (this.bridge.getSnapshot().mode !== 'menu') return;
        this.clearRun();
        this.engine = new RunEngine(
          structuredClone(this.bridge.getSnapshot().profile),
          mapObstacles(),
        );
        this.courtyard.setVisible(false);
        this.map.forEach((image) => image.setVisible(true).setAlpha(1));
        this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
        this.player.resetScale();
        this.player.render(this.engine.position, 'S', 0);
        this.cameras.main
          .setBounds(0, 0, ...forestLayout.dimensions)
          .setZoom(stage.cameraZoom)
          .centerOn(this.player.sprite.x, this.player.sprite.y)
          .startFollow(this.player.sprite, true, 0.1, 0.1);
        this.input.keyboard?.resetKeys();
        this.input.keyboard?.addCapture([
          'UP',
          'DOWN',
          'LEFT',
          'RIGHT',
          'W',
          'A',
          'S',
          'D',
          'Q',
          'SPACE',
        ]);
        this.bridge.update({
          mode: 'playing',
          zoom: stage.cameraZoom,
          result: null,
          cards: [],
          toast: '',
        });
        this.sync();
        break;
      case 'pause':
        this.engine?.pause();
        this.sync();
        break;
      case 'resume':
        this.engine?.resume();
        this.sync();
        break;
      case 'leave':
        if (this.engine && this.engine.mode !== 'result') {
          this.engine.abandon();
          this.sync();
        } else {
          this.clearRun();
          this.bridge.update({
            mode: 'menu',
            lobbyArea: 'courtyard',
            cards: [],
            result: null,
            toast: '',
          });
          this.showLobby();
        }
        break;
      case 'card':
        this.engine?.choose(command.id);
        this.sync();
        break;
      case 'potion':
        if (this.engine?.potion()) this.bridge.consumePotion();
        this.sync();
        break;
      case 'dash':
        this.engine?.dash();
        break;
      case 'weapon':
        break;
      case 'zoom': {
        const zoom = Phaser.Math.Clamp(command.zoom, 1.5, 3);
        this.cameras.main.setZoom(zoom);
        this.bridge.update({ zoom });
        break;
      }
    }
  }
  update(_time: number, delta: number): void {
    if (!this.player) return;
    const dt = Math.min(delta / 1000, 0.1);
    if (!this.engine) {
      const snapshot = this.bridge.getSnapshot();
      const profile = snapshot.profile;
      const [x, y] = lobbyAreas[snapshot.lobbyArea].hero;
      this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
      this.player.lobby(this.scale.width * x, this.scale.height * y, dt);
      const id = profile.activePet,
        pet = id ? profile.pets[id] : null;
      if (id && pet) {
        const actor = pet.evolved ? `${id}-tien-hoa` : id;
        this.pet ??= new ActorView(this, actor, this.projection);
        this.pet.setActor(actor);
        this.pet.lobby(this.scale.width * x + 75, this.scale.height * y + 12, dt);
        this.pet.sprite.setScale(1.15);
      } else if (this.pet) {
        this.pet.destroy();
        this.pet = null;
      }
      return;
    }
    const engine = this.engine;
    const horizontal =
      Number(this.controls.right.isDown || this.controls.d.isDown) -
      Number(this.controls.left.isDown || this.controls.a.isDown);
    const vertical =
      Number(this.controls.down.isDown || this.controls.s.isDown) -
      Number(this.controls.up.isDown || this.controls.w.isDown);
    engine.tick(dt, inputToWorld(horizontal, vertical));
    if (engine.mode === 'playing') this.renderRun(dt);
    else if (engine.mode !== this.lastMode) this.renderRun(0);
    if (engine.mode !== this.lastMode) {
      this.input.keyboard?.resetKeys();
      this.cameras.main.stopFollow();
      if (engine.mode === 'playing')
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
      this.sync();
    }
    this.publishIn -= dt;
    if (this.publishIn <= 0) {
      this.sync();
      this.publishIn = 0.1;
    }
    // Giới hạn âm va chạm khi nhiều đạn chạm cùng frame để không tạo hàng trăm oscillator.
    for (const sound of [...new Set(engine.sounds.splice(0))]) this.bridge.audio.play(sound);
  }
  private renderRun(dt: number): void {
    const engine = this.engine!;
    this.player.render(
      engine.position,
      engine.playerAttack ? engine.playerAttackFacing : engine.facing,
      dt,
      engine.playerAttack,
      engine.playerAttackElapsed,
      engine.playerAttackDuration,
      engine.mode === 'result' && !engine.result?.won ? 0.8 : -1,
      1,
      1,
      false,
      engine.invulnerability > 0 && engine.dashTime <= 0,
    );
    const livingIds = new Set(engine.enemies.map((enemy) => enemy.id));
    for (const [id, view] of this.actorViews)
      if (!livingIds.has(id)) {
        view.destroy();
        this.actorViews.delete(id);
      }
    for (const enemy of engine.enemies) {
      if (!this.actorViews.has(enemy.id))
        this.actorViews.set(
          enemy.id,
          new ActorView(this, enemies[enemy.type].actor, this.projection),
        );
      this.actorViews
        .get(enemy.id)!
        .render(
          enemy,
          enemy.facing,
          dt,
          enemy.attack,
          enemy.attackTime,
          enemy.attackDuration,
          enemy.dead ? enemy.deathTime : -1,
          enemy.hp,
          enemy.maxHp,
          enemies[enemy.type].elite,
          enemy.hitTime > 0,
        );
    }
    const petId = engine.petActor();
    if (petId && !this.pet) this.pet = new ActorView(this, petId, this.projection);
    this.pet?.render(
      engine.petPosition,
      engine.petFacing,
      dt,
      engine.petAttack,
      engine.petAttackElapsed,
    );
    this.renderDrops();
    this.renderBullets();
    this.renderEffects();
    for (const image of this.foliage) {
      const sprite = this.player.sprite,
        covers = image.depth > sprite.depth && image.getBounds().contains(sprite.x, sprite.y - 32);
      image.setAlpha(Phaser.Math.Linear(image.alpha, covers ? 0.42 : 1, Math.min(1, dt * 7)));
    }
  }
  private renderDrops(): void {
    const drops = this.engine!.drops,
      ids = new Set(drops.map((drop) => drop.id));
    for (const [id, image] of this.dropViews)
      if (!ids.has(id)) {
        image.destroy();
        this.dropViews.delete(id);
      }
    for (const drop of drops) {
      const frame =
        drop.kind === 'xp'
          ? drop.value > 8
            ? 'xp-lon'
            : 'xp-nho'
          : drop.kind === 'stone'
            ? 'linh-thach'
            : drop.kind === 'heal'
              ? 'hoi-nguyen-dan'
              : drop.kind;
      if (!this.dropViews.has(drop.id))
        this.dropViews.set(
          drop.id,
          this.add.image(0, 0, 'items', frame).setScale(drop.kind === 'xp' ? 0.19 : 0.27),
        );
      const p = project(drop, this.projection);
      this.dropViews
        .get(drop.id)!
        .setPosition(p.x, p.y - 3)
        .setDepth(p.y + 0.2);
    }
  }
  private texture(effect: string): string {
    return ['dragon-fist', 'sword-storm', 'wind-feather', 'spirit-bolt'].includes(effect)
      ? 'awakened-effects'
      : ['hit-spark', 'healing', 'level-up', 'boss-warning'].includes(effect)
        ? 'support-effects'
        : 'combat-effects';
  }
  private renderBullets(): void {
    const bullets = this.engine!.projectiles,
      ids = new Set(bullets.map((bullet) => bullet.id));
    for (const [id, image] of this.bullets)
      if (!ids.has(id)) {
        image.destroy();
        this.bullets.delete(id);
      }
    for (const bullet of bullets) {
      if (!this.bullets.has(bullet.id))
        this.bullets.set(
          bullet.id,
          this.add.image(0, 0, this.texture(bullet.effect), `${bullet.effect}-0`),
        );
      const p = project(bullet, this.projection),
        towards = project(
          { x: bullet.x + bullet.velocity.x, y: bullet.y + bullet.velocity.y },
          this.projection,
        );
      this.bullets
        .get(bullet.id)!
        .setPosition(p.x, p.y - 16)
        .setDepth(p.y + 1)
        .setScale(bullet.enemy ? 0.38 : 0.47)
        .setRotation(Math.atan2(towards.y - p.y, towards.x - p.x))
        .setFrame(`${bullet.effect}-${Math.floor(this.engine!.time * 12) % 4}`);
    }
  }
  private renderEffects(): void {
    const engine = this.engine!,
      ids = new Set(engine.visuals.map((effect) => effect.id));
    for (const [id, view] of this.effects)
      if (!ids.has(id)) {
        view.destroy();
        this.effects.delete(id);
      }
    this.warnings.clear();
    for (const effect of engine.visuals) {
      const p = project(effect, this.projection);
      if (effect.kind === 'warning') {
        const rx = effect.radius * this.projection.pixelsPerUnit,
          ry = rx / Math.sqrt(3);
        this.warnings
          .fillStyle(0xd65943, 0.12 + (1 - effect.life / effect.total) * 0.18)
          .fillEllipse(p.x, p.y, rx * 2, ry * 2);
        this.warnings.lineStyle(1.5, 0xff9875, 0.9).strokeEllipse(p.x, p.y, rx * 2, ry * 2);
        continue;
      }
      if (effect.kind === 'number' && engine.profile.settings.reducedEffects) continue;
      if (!this.effects.has(effect.id))
        this.effects.set(
          effect.id,
          effect.kind === 'number'
            ? this.add
                .text(0, 0, String(effect.value), {
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: effect.effect === 'critical' ? '14px' : '11px',
                  color:
                    effect.effect === 'hurt'
                      ? '#ff846f'
                      : effect.effect === 'critical'
                        ? '#ffdb8a'
                        : '#f3ebcf',
                  stroke: '#14241e',
                  strokeThickness: 3,
                })
                .setOrigin(0.5)
            : this.add.image(0, 0, this.texture(effect.effect), `${effect.effect}-0`),
        );
      const view = this.effects.get(effect.id)!;
      view
        .setPosition(
          p.x,
          p.y - 26 - (effect.kind === 'number' ? (1 - effect.life / effect.total) * 22 : 0),
        )
        .setDepth(p.y + 100)
        .setAlpha(Math.min(1, effect.life * 4));
      if (view instanceof Phaser.GameObjects.Image)
        view
          .setScale(Math.max(0.5, effect.radius * 0.55))
          .setFrame(
            `${effect.effect}-${Math.min(3, Math.floor((1 - effect.life / effect.total) * 4))}`,
          );
    }
  }
  private sync(): void {
    if (!this.engine) return;
    const engine = this.engine;
    if (this.lastMode !== engine.mode) {
      this.input.keyboard?.resetKeys();
      this.cameras.main.stopFollow();
      const captures = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D', 'Q', 'SPACE'];
      if (engine.mode === 'playing') {
        this.input.keyboard?.addCapture(captures);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
      } else this.input.keyboard?.removeCapture(captures);
    }
    this.lastMode = engine.mode;
    this.bridge.update({
      mode: engine.mode,
      position: { ...engine.position },
      direction: engine.facing,
      distance: engine.distance,
      area: areaAt(engine.position),
      run: engine.view(),
      cards: [...engine.choices],
    });
    if (engine.result) this.bridge.finish(engine.result);
  }
}

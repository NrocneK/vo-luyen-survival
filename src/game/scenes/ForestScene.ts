import Phaser from 'phaser';
import { GameBridge } from '../../app/GameBridge';
import {
  areaAt,
  stageById,
  layoutForStage,
  projectionForStage,
  trailsForStage,
  forestProjection,
} from '../../data/stages';
import type { StageDef } from '../../data/stages';
import { stageUnlocked } from '../../data/campaign';
import { clampZoom } from '../../data/camera';
import { lobbyAreas, lobbyComposition } from '../../data/lobby';
import { weapons } from '../../data/weapons';
import { enemies } from '../../data/enemies';
import { mapObstacles } from '../../data/mapCollisions';
import { ActorView } from '../entities/ActorView';
import { PlayerView } from '../entities/PlayerView';
import { hero } from '../../data/hero';
import {
  drawChainLightning,
  drawFlameRing,
  drawHeatWave,
  drawSolarBurst,
} from '../entities/SkillEffects';
import { StageMechanicEffects } from '../entities/StageMechanicEffects';
import { OpportunityEffects } from '../entities/OpportunityEffects';
import { TechniqueEffects } from '../entities/TechniqueEffects';
import { RunEngine } from '../systems/RunEngine';
import { advanceSimulation } from '../systems/advanceSimulation';
import { inputToWorld, project } from '../math/worldPhysics';
import { cameraFootprint } from '../math/cameraFootprint';
import type { Projection } from '../math/worldPhysics';
import type { GameCommand } from '../../shared/types';

export class ForestScene extends Phaser.Scene {
  private player!: ActorView | PlayerView;
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
  private skillEffects = new Map<number, Phaser.GameObjects.Graphics>();
  private flameAura!: Phaser.GameObjects.Graphics;
  private burnGround!: Phaser.GameObjects.Graphics;
  private stageEffects!: StageMechanicEffects;
  private opportunityEffects!: OpportunityEffects;
  private techniqueEffects!: TechniqueEffects;
  private warnings!: Phaser.GameObjects.Graphics;
  private publishIn = 0;
  private lastMode = 'menu';
  private resultElapsed = 0;
  private startPending = false;
  private projection: Projection = forestProjection;
  constructor(private bridge: GameBridge) {
    super('forest');
  }
  create(): void {
    this.createMap(stageById(this.bridge.getSnapshot().stageId));
    this.courtyard = this.add.image(0, 0, 'cultivation-courtyard').setOrigin(0.5).setDepth(-1000);
    this.cameras.main.roundPixels = false;
    const HeroView = hero.status === 'validated' ? PlayerView : ActorView;
    this.player = new HeroView(
      this,
      weapons[this.bridge.getSnapshot().weapon].actorId,
      this.projection,
    );
    this.events.on('hero-load-error', (error: Error) =>
      this.bridge.update({ status: 'error', error: error.message }),
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
        interact: 'E',
        dash: 'SPACE',
      },
      false,
    ) as typeof this.controls;
    // Bắt ngay keydown để thao tác bấm nhanh không bị mất giữa hai frame.
    this.controls.q.on('down', () => this.bridge.dispatch({ type: 'potion' }));
    this.controls.interact.on('down', () => this.bridge.dispatch({ type: 'interact' }));
    this.controls.dash.on('down', (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent) => {
      if (!event.repeat) this.bridge.dispatch({ type: 'dash' });
    });
    this.warnings = this.add.graphics().setDepth(-900);
    this.flameAura = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.burnGround = this.add.graphics().setDepth(-800);
    this.stageEffects = new StageMechanicEffects(this);
    this.opportunityEffects = new OpportunityEffects(this);
    this.techniqueEffects = new TechniqueEffects(this, this.player);
    this.showLobby();
    const unsubscribe = this.bridge.onCommand((command) => this.command(command));
    const onBlur = () => {
      this.input.keyboard?.resetKeys();
      this.engine?.pause();
      this.sync();
    };
    const resize = () => {
      if (this.bridge.getSnapshot().mode === 'menu') this.showLobby(false);
      else if (this.engine)
        this.cameras.main
          .setViewport(0, 0, this.scale.width, this.scale.height)
          .centerOn(this.player.sprite.x, this.player.sprite.y);
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
  private createMap(stage: StageDef): void {
    this.map.forEach((object) => object.destroy());
    this.map = [];
    this.foliage = [];
    this.projection = projectionForStage(stage);
    const layout = layoutForStage(stage);
    this.createGround(stage);
    for (const prop of layout.props) {
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
  }
  private createGround(stage: StageDef): void {
    const [width, height] = layoutForStage(stage).dimensions;
    let ground = stage.groundId;
    if (stage.groundStyle) {
      const style = stage.groundStyle;
      ground = `ground-${stage.id}`;
      if (!this.textures.exists(ground)) {
        const tile = this.add.graphics();
        tile.fillStyle(style.color).fillRect(0, 0, 128, 128);
        if (style.pattern === 'stone') {
          tile.lineStyle(1, style.line, 0.25);
          for (let row = 0; row < 4; row++) {
            const y = row * 32;
            tile.lineBetween(0, y, 128, y);
            for (let col = -1; col < 3; col++) {
              const x = col * 64 + (row % 2) * 32;
              tile.lineBetween(x, y, x, y + 32);
            }
          }
        } else if (style.pattern === 'ice') {
          tile.lineStyle(1, style.line, 0.25);
          for (let i = 0; i < 4; i++) {
            const x = i * 32;
            tile
              .lineBetween(x, 0, x + 25, 45)
              .lineBetween(x + 25, 45, x + 10, 85)
              .lineBetween(x + 10, 85, x + 32, 128);
          }
        } else if (style.pattern === 'sand') {
          tile.lineStyle(1, style.line, 0.18);
          for (let y = 9; y < 128; y += 16) tile.lineBetween(0, y, 128, y + 7);
        }
        for (let i = 0; i < 100; i++) {
          const x = (i * 47 + 13) % 128,
            y = (i * 71 + 23) % 128;
          tile
            .fillStyle(style.line, 0.08 + (i % 3) * 0.025)
            .fillCircle(x, y, style.pattern === 'soil' ? 2 : 1);
        }
        tile.generateTexture(ground, 128, 128);
        tile.destroy();
      }
    }
    // TileSprite trải cùng một ô nền: map lớn không cần texture hàng chục megapixel.
    this.map.push(
      this.add
        .tileSprite(0, 0, width, height, ground)
        .setOrigin(0)
        .setTileScale(1, 1 / Math.sqrt(3))
        .setTint(stage.groundStyle ? 0xffffff : stage.tint)
        .setDepth(-2000),
    );
    const paths = this.add.graphics().setDepth(-1990);
    for (const trail of trailsForStage(stage)) {
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
    // Mốc địa hình và pháp trận nằm trên mặt đất, không tạo thêm chướng ngại vô hình.
    const markers = this.add.graphics().setDepth(-1970);
    for (const landmark of stage.landmarks) {
      const p = project(landmark.position, this.projection);
      markers.lineStyle(1.5, stage.accent, 0.3).strokeEllipse(p.x, p.y, 140, 140 / Math.sqrt(3));
    }
    this.map.push(markers);
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
      'E',
      'SPACE',
    ]);
  }
  private clearRun(): void {
    this.actorViews.forEach((view) => view.destroy());
    this.actorViews.clear();
    for (const collection of [this.dropViews, this.bullets, this.effects, this.skillEffects]) {
      collection.forEach((view) => view.destroy());
      collection.clear();
    }
    this.pet?.destroy();
    this.pet = null;
    this.warnings.clear();
    this.flameAura.clear();
    this.burnGround.clear();
    this.stageEffects.clear();
    this.opportunityEffects.clear();
    this.techniqueEffects.clear();
    this.engine = null;
  }
  private command(command: GameCommand): void {
    switch (command.type) {
      case 'travel':
        if (this.bridge.getSnapshot().mode === 'menu') this.showLobby();
        break;
      case 'start':
        if (this.bridge.getSnapshot().mode !== 'menu') return;
        this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
        if (this.player instanceof PlayerView && !this.player.appearanceReady) {
          if (this.startPending) return;
          this.startPending = true;
          void this.player
            .ready()
            .then(() => {
              this.startPending = false;
              this.command(command);
            })
            .catch((error: Error) => {
              this.startPending = false;
              this.bridge.update({ status: 'error', error: error.message });
            });
          return;
        }
        if (
          !this.bridge.getSnapshot().test.enabled &&
          !stageUnlocked(this.bridge.getSnapshot().profile, this.bridge.getSnapshot().stageId)
        )
          return;
        this.clearRun();
        this.resultElapsed = 0;
        const stage = stageById(this.bridge.getSnapshot().stageId);
        this.createMap(stage);
        this.player.setProjection(this.projection);
        this.engine = new RunEngine(
          structuredClone(this.bridge.getSnapshot().profile),
          mapObstacles(stage),
          undefined,
          stage,
        );
        this.courtyard.setVisible(false);
        this.map.forEach((image) => image.setVisible(true).setAlpha(1));
        this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
        this.player.resetScale();
        this.player.render(this.engine.position, 'S', 0);
        this.cameras.main
          .setBounds(0, 0, ...layoutForStage(stage).dimensions)
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
          'E',
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
      case 'reroll':
        this.engine?.reroll();
        this.sync();
        break;
      case 'interact':
        this.engine?.interact();
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
        const zoom = clampZoom(command.zoom);
        this.cameras.main.setZoom(zoom);
        this.bridge.update({ zoom });
        if (this.engine) this.renderRun(0);
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
      const { x, y, scale } = lobbyComposition(
        this.scale.width,
        this.scale.height,
        snapshot.lobbyStation ?? 'home',
        snapshot.lobbyPanelOpen ?? true,
      );
      this.player.setActor(weapons[this.bridge.getSnapshot().weapon].actorId);
      if (this.player instanceof PlayerView) this.player.setEquipment(profile);
      if (this.player instanceof PlayerView)
        this.player.lobby(
          this.scale.width * x,
          this.scale.height * y,
          dt,
          snapshot.lobbyFacing ?? 'S',
          scale,
        );
      else this.player.lobby(this.scale.width * x, this.scale.height * y, dt);
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
    const testing = this.bridge.getSnapshot().test;
    engine.setDamageMultiplier(testing.enabled ? testing.damageMultiplier : 1);
    engine.setPresentationTimeScale(testing.enabled ? testing.timeScale : 1);
    this.updateSpawnView();
    if (testing.enabled && testing.unlimitedResources) engine.pills = 3;
    const simulationSeconds = advanceSimulation(
      engine,
      dt,
      testing.enabled ? testing.timeScale : 1,
      inputToWorld(horizontal, vertical),
    );
    if (engine.mode === 'result' && this.lastMode !== 'result' && this.player instanceof PlayerView)
      this.player.endCombat();
    if (engine.mode === 'playing') this.renderRun(simulationSeconds);
    else if (engine.mode !== this.lastMode) this.renderRun(0);
    if (engine.mode === 'result') {
      if (engine.result?.outcome === 'defeat') {
        this.resultElapsed += dt;
        this.player.render(engine.position, engine.facing, 0, 0, 0, 0.58, this.resultElapsed);
      }
      this.techniqueEffects.render(engine, this.projection, this.time.now / 1000, 0);
    }
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
    if (this.player instanceof PlayerView) this.player.setEquipment(engine.profile);
    this.player.render(
      engine.position,
      engine.playerAttack && engine.mode !== 'result' ? engine.playerAttackFacing : engine.facing,
      dt,
      engine.mode === 'result' ? 0 : engine.playerAttack,
      engine.playerAttackElapsed,
      engine.playerAttackDuration,
      engine.mode === 'result' && engine.result?.outcome === 'defeat' ? this.resultElapsed : -1,
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
          new ActorView(this, enemies[enemy.type].actor, this.projection).setVisualScale(
            enemies[enemy.type].visualScale ?? 1,
          ),
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
          enemies[enemy.type].elite || !!enemy.commander,
          enemy.hitTime > 0,
        );
      const tint = enemies[enemy.type].tint;
      if (tint && enemy.hitTime <= 0) this.actorViews.get(enemy.id)!.sprite.setTint(tint);
      if (enemy.spawnGrace && !enemy.dead)
        this.actorViews
          .get(enemy.id)!
          .sprite.setAlpha(Math.max(0.15, 1 - enemy.spawnGrace / (enemy.spawnTime || 0.85)));
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
    this.stageEffects.render(engine, this.projection, this.time.now / 1000);
    this.opportunityEffects.render(engine, this.projection, this.time.now / 1000);
    this.techniqueEffects.render(engine, this.projection, this.time.now / 1000, dt);
    for (const image of this.foliage) {
      const sprite = this.player.sprite,
        covers = image.depth > sprite.depth && image.getBounds().contains(sprite.x, sprite.y - 32);
      image.setAlpha(Phaser.Math.Linear(image.alpha, covers ? 0.42 : 1, Math.min(1, dt * 7)));
    }
  }
  private updateSpawnView(): void {
    const camera = this.cameras.main;
    // Camera cố định không xoay. Tính từ zoom hiện tại để không dùng worldView cũ ngay sau bấm zoom.
    this.engine?.setSpawnView({
      corners: cameraFootprint(
        {
          scrollX: camera.clampX(camera.scrollX),
          scrollY: camera.clampY(camera.scrollY),
          width: camera.width,
          height: camera.height,
          zoom: camera.zoom,
        },
        this.projection,
      ),
      padding: 0.85,
    });
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
        .setScale(
          bullet.enemy
            ? 0.38
            : bullet.skillId === 'duong-viem-chuong' && (bullet.rank ?? 0) >= 6
              ? 0.65
              : bullet.knockback
                ? 0.7
                : 0.47,
        )
        .setTint(
          bullet.skillId === 'duong-viem-chuong' && (bullet.rank ?? 0) >= 6
            ? 0xffe5a8
            : bullet.returning
              ? 0x88e6ff
              : 0xffffff,
        )
        .setBlendMode(
          bullet.skillId === 'duong-viem-chuong' && (bullet.rank ?? 0) >= 6
            ? Phaser.BlendModes.ADD
            : Phaser.BlendModes.NORMAL,
        )
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
    for (const [id, view] of this.skillEffects)
      if (!ids.has(id)) {
        view.destroy();
        this.skillEffects.delete(id);
      }
    const rank = engine.skills['viem-hoan'] ?? 0,
      phase = this.time.now / 1000,
      reduced = engine.profile.settings.reducedEffects,
      zoom = this.cameras.main.zoom;
    this.flameAura.clear();
    this.burnGround.clear();
    for (const zone of engine.combatZones) {
      const p = project(zone, this.projection),
        rx = zone.radius * this.projection.pixelsPerUnit;
      this.burnGround
        .fillStyle(0xe55825, 0.13 + Math.sin(phase * 8) * 0.025)
        .fillEllipse(p.x, p.y, rx * 2, (rx * 2) / Math.sqrt(3));
      drawFlameRing(
        this.burnGround,
        zone,
        zone.radius,
        this.projection,
        phase,
        Math.min(0.8, zone.remaining),
        false,
        reduced,
        zoom,
      );
    }
    if (rank && engine.mode !== 'result') {
      const center = project(engine.position, this.projection),
        rx = engine.flameRadius() * this.projection.pixelsPerUnit;
      const intense = engine.augments.includes('hoan-liet-diem');
      this.flameAura
        .setDepth(center.y - 0.3)
        .fillStyle(intense ? 0xff492b : 0xf27b35, 0.065)
        .fillEllipse(center.x, center.y, rx * 2, (rx * 2) / Math.sqrt(3));
      drawFlameRing(
        this.flameAura,
        engine.position,
        engine.flameRadius(),
        this.projection,
        phase,
        0.65 + Math.sin(phase * 3) * 0.04,
        rank === 6,
        reduced,
        zoom,
        intense,
      );
    }
    this.warnings.clear();
    for (const effect of engine.visuals) {
      const point = effect.followPlayer ? engine.position : effect;
      const p = project(point, this.projection);
      if (effect.kind === 'ring' || effect.kind === 'lightning' || effect.kind === 'fireburst') {
        if (!this.skillEffects.has(effect.id))
          this.skillEffects.set(effect.id, this.add.graphics().setBlendMode(Phaser.BlendModes.ADD));
        const view = this.skillEffects.get(effect.id)!;
        view.clear().setDepth(effect.effect === 'heat-wave' ? p.y - 0.2 : p.y + 110);
        if (effect.kind === 'fireburst')
          drawSolarBurst(
            view,
            effect,
            effect.radius,
            this.projection,
            1 - effect.life / effect.total,
            reduced,
            zoom,
          );
        else if (effect.kind === 'ring') {
          const progress = 1 - effect.life / effect.total;
          if (effect.effect === 'heat-wave')
            drawHeatWave(
              view,
              point,
              effect.followPlayer ? engine.flameRadius() : effect.radius,
              this.projection,
              progress,
              rank >= 6,
              engine.augments.includes('hoan-liet-diem'),
              reduced,
              zoom,
            );
          else
            drawFlameRing(
              view,
              effect,
              effect.radius * Math.min(1, 0.78 + progress * 1.1),
              this.projection,
              phase * 2,
              Math.min(1, effect.life / 0.25),
              effect.awakened ?? false,
              reduced,
              zoom,
            );
        } else drawChainLightning(view, effect, this.projection, reduced, zoom);
        continue;
      }
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
      stageId: engine.stage.id,
      area: areaAt(engine.position, engine.stage),
      run: engine.view(),
      cards: [...engine.choices],
    });
    if (engine.result) this.bridge.finish(engine.result);
  }
}

import Phaser from 'phaser';
import type { RunEngine } from '../systems/RunEngine';
import { project, type Projection, facingFromVelocity } from '../math/worldPhysics';
import { techniqueOutline, type TechniqueArea } from '../math/techniqueGeometry';
import type { Point } from '../../shared/types';
import { ActorView } from './ActorView';
import { TechniqueSkillEffects, type TechniqueActor } from './TechniqueSkillEffects';

/** Vùng cảnh báo, đường rồng và nhiệm vụ đều vẽ từ hình học dùng để tính trúng đòn. */
export class TechniqueEffects {
  private ground: Phaser.GameObjects.Graphics;
  private light: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private companion: ActorView | null = null;
  private lastCompanion: Point | null = null;
  private skills: TechniqueSkillEffects;
  constructor(
    private scene: Phaser.Scene,
    player: TechniqueActor,
  ) {
    this.skills = new TechniqueSkillEffects(scene, player);
    this.ground = scene.add.graphics().setDepth(-690);
    this.light = scene.add.graphics().setDepth(10000).setBlendMode(Phaser.BlendModes.ADD);
  }
  clear(): void {
    this.ground.clear();
    this.light.clear();
    this.labels.forEach((label) => label.setVisible(false));
    this.companion?.destroy();
    this.companion = null;
    this.lastCompanion = null;
    this.skills.clear();
  }
  private polygon(
    area: TechniqueArea,
    projection: Projection,
    color: number,
    alpha: number,
    width = 2,
    fill = 0.08,
  ): void {
    const points = techniqueOutline(area).map((p) => project(p, projection));
    this.ground
      .fillStyle(color, fill * alpha)
      .fillPoints(points, true)
      .lineStyle(width / this.scene.cameras.main.zoom, color, alpha)
      .strokePoints(points, true);
  }
  render(engine: RunEngine, projection: Projection, realTime: number, dt: number): void {
    this.ground.clear();
    this.light.clear();
    this.labels.forEach((label) => label.setVisible(false));
    let labelIndex = 0;
    const zoom = this.scene.cameras.main.zoom;
    const text = (point: Point, content: string, color = '#e5d7a4') => {
      let label = this.labels[labelIndex++];
      if (!label) {
        label = this.scene.add
          .text(0, 0, '', {
            fontFamily: 'Be Vietnam Pro',
            fontSize: '11px',
            color,
            stroke: '#10201c',
            strokeThickness: 4,
            align: 'center',
          })
          .setOrigin(0.5)
          .setDepth(100020);
        this.labels.push(label);
      }
      const p = project(point, projection);
      label
        .setPosition(p.x, p.y - 40 / zoom)
        .setText(content)
        .setColor(color)
        .setScale(1 / zoom)
        .setVisible(true);
    };
    const disc = (point: Point, radius: number): TechniqueArea => ({
      ...point,
      shape: 'disc',
      angle: 0,
      radius,
      length: 0,
      width: 0,
      spread: 0,
    });
    const result = engine.mode === 'result';
    this.skills.render(engine, projection, realTime);
    const mission = engine.mission;
    if (!mission || result) {
      this.companion?.destroy();
      this.companion = null;
      this.lastCompanion = null;
      return;
    }
    for (const hazard of mission.hazards)
      this.polygon(
        hazard.area,
        projection,
        hazard.kind === 'ice'
          ? 0x96dfff
          : hazard.kind === 'bone'
            ? 0xdfcbb0
            : hazard.kind === 'soul'
              ? 0x77e8df
              : 0xc392ed,
        hazard.warning > 0 ? 0.45 : Math.min(0.9, hazard.remaining),
        hazard.warning > 0 ? 1.5 : 3,
        hazard.warning > 0 ? 0.08 : 0.28,
      );
    for (const node of mission.nodes) {
      if (
        ['defend', 'release'].includes(mission.stage.mission!.kind) &&
        node !== mission.nodes.find((n) => !n.completed)
      )
        continue;
      const color = node.completed ? 0x7bb89b : 0xd8d099;
      this.polygon(disc(node, 1.5), projection, color, node.completed ? 0.25 : 0.65, 1.5, 0.13);
      if (!node.completed) {
        const p = project(node, projection);
        this.light
          .fillStyle(color, 0.8)
          .fillTriangle(p.x, p.y - 14, p.x - 5, p.y - 24, p.x + 5, p.y - 24);
        text(
          node,
          `${node.name}\n${node.progress > 0 ? Math.floor(node.progress * 100) + '%' : '◇'}`,
        );
      }
    }
    if (mission.stage.mission!.kind === 'final' && mission.phase === 2 && !mission.bloodStoneUsed) {
      this.polygon(disc({ x: 0, y: 0 }, 1.5), projection, 0xed8a9b, 0.9, 3, 0.2);
      text({ x: 0, y: 0 }, 'E · Huyết Tinh Thạch', '#ffc6cf');
    }
    if (mission.stage.mission!.kind === 'purify' && mission.phase === 2) {
      this.polygon(disc({ x: 0, y: 0 }, 1.5), projection, 0xffd96d, 0.7);
      text({ x: 0, y: 0 }, 'E · Thần hồn hỏa');
    }
    const unit = mission.protected;
    if (unit) {
      this.polygon(disc(unit, 0.8), projection, 0x96e6cd, 0.85, 2, 0.16);
      if (mission.stage.mission!.kind === 'escort') {
        this.companion ??= new ActorView(this.scene, 'thong-huyen-nu-tu', projection);
        const facing = this.lastCompanion
          ? facingFromVelocity(
              { x: unit.x - this.lastCompanion.x, y: unit.y - this.lastCompanion.y },
              'S',
            )
          : 'S';
        this.companion.render(unit, facing, dt, 0, 0, 0.58, -1, unit.hp, unit.maxHp);
        this.lastCompanion = { x: unit.x, y: unit.y };
      } else {
        const p = project(unit, projection);
        this.light
          .lineStyle(2, 0x9debd7, 0.9)
          .strokeTriangle(p.x, p.y - 46, p.x - 14, p.y - 12, p.x + 14, p.y - 12)
          .lineBetween(p.x, p.y - 46, p.x, p.y + 6);
      }
      text(unit, `${unit.name}\n${Math.ceil(unit.hp)} / ${unit.maxHp}`, '#b2f3d6');
    }
  }
}

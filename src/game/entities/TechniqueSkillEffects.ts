import Phaser from 'phaser';
import type { RunEngine } from '../systems/RunEngine';
import type { ActorView } from './ActorView';
import { project, type Projection } from '../math/worldPhysics';
import { techniqueOutline, type TechniqueArea } from '../math/techniqueGeometry';
import {
  dragonSpine,
  projectVfx,
  v3,
  mesh3,
  noise,
  smooth01,
  clamp01,
  palmRestOutline,
  handToWorld,
  handBones,
  type Vec3,
} from '../math/vfxGeometry';
import {
  buildDragon,
  buildHand,
  buildWings,
  handHeight,
  wingPose,
  type WingPose,
} from '../math/vfxModels';
import { ProjectedVfx, VfxParticles } from './ProjectedVfx';
export type TechniqueActor = Pick<ActorView, 'sprite' | 'attachment' | 'renderedFacing'> & {
  setStatusTint?: (color: number | null) => void;
};

/** Hiệu ứng dựng từ khối/khớp/dải khí/hạt, cùng phép chiếu 3D với mặt đất isometric. */
export class TechniqueSkillEffects {
  private glow: Phaser.GameObjects.Graphics;
  private ground: Phaser.GameObjects.Graphics;
  private shadow: Phaser.GameObjects.Graphics;
  private mesh: ProjectedVfx;
  private particles: VfxParticles;
  private endAt = new Map<number, number>();
  wingVisible = false;
  maVisible = false;
  lastWings: WingPose[] = [];
  lastDragonSpines: Vec3[][] = [];
  constructor(
    scene: Phaser.Scene,
    private player: TechniqueActor,
  ) {
    this.glow = scene.add.graphics().setDepth(10000).setBlendMode(Phaser.BlendModes.ADD);
    this.ground = scene.add.graphics().setDepth(-692);
    this.shadow = scene.add.graphics().setDepth(-694);
    this.mesh = new ProjectedVfx(scene);
    this.particles = new VfxParticles(scene);
  }
  clear(): void {
    this.glow.clear();
    this.ground.clear();
    this.shadow.clear();
    this.mesh.clear();
    this.particles.clear();
    this.endAt.clear();
    this.wingVisible = this.maVisible = false;
    this.lastWings = [];
    this.lastDragonSpines = [];
    if (this.player.setStatusTint) this.player.setStatusTint(null);
    else this.player.sprite.clearTint();
  }
  private outline(
    area: TechniqueArea,
    projection: Projection,
    color: number,
    alpha: number,
    fill = 0.08,
  ): void {
    const points = techniqueOutline(area).map((p) => project(p, projection));
    this.ground
      .fillStyle(color, fill * alpha)
      .fillPoints(points, true)
      .lineStyle(1.2, color, alpha)
      .strokePoints(points, true);
  }
  private beam(
    area: TechniqueArea,
    projection: Projection,
    alpha: number,
    phase: number,
    warning = false,
    color = 0xffba38,
  ) {
    const p = project(area, projection),
      q = project(
        {
          x: area.x + Math.cos(area.angle) * area.length,
          y: area.y + Math.sin(area.angle) * area.length,
        },
        projection,
      );
    const h = projection.pixelsPerUnit * 1.35,
      dx = q.x - p.x,
      dy = q.y - p.y;
    const normal = project(
      {
        x: area.x - (Math.sin(area.angle) * area.width) / 2,
        y: area.y + (Math.cos(area.angle) * area.width) / 2,
      },
      projection,
    );
    const length = Math.hypot(dx, dy),
      nx = -dy / Math.max(1, length),
      ny = dx / Math.max(1, length);
    const width = Math.max(5, 2 * Math.abs((normal.x - p.x) * nx + (normal.y - p.y) * ny));
    if (warning) {
      this.glow.lineStyle(1.3, 0xffd993, 0.45).lineBetween(p.x, p.y - h, q.x, q.y - h);
      this.glow.lineStyle(2, 0xffecb1, 0.75).strokeCircle(p.x, p.y - h, 4 + phase * 8);
      return;
    }
    for (const [factor, c, a] of [
      [2.4, color, 0.07],
      [1.5, color, 0.17],
      [1, 0xffcb4e, 0.48],
      [0.5, 0xffed9e, 0.8],
      [0.16, 0xffffff, 1],
    ])
      this.glow
        .lineStyle(Math.max(1, width * factor), c, a * alpha)
        .lineBetween(p.x, p.y - h, q.x, q.y - h);
    for (let i = 0; i < 14; i++) {
      const t = (i / 14 + phase * 0.9) % 1,
        side = Math.sin(i * 12.3 + phase * 35) * width * 0.8;
      this.glow
        .fillStyle(i % 2 ? 0xffefb1 : 0xffa82e, alpha * 0.8)
        .fillCircle(p.x + dx * t + nx * side, p.y - h + dy * t + ny * side, 1.5 + (i % 3));
    }
    this.glow.fillStyle(0xffdc72, 0.2 * alpha).fillCircle(p.x, p.y - h, 22);
    this.glow.fillStyle(0xffffff, 0.95 * alpha).fillEllipse(p.x, p.y - h, 10, 18);
    this.glow.lineStyle(2, 0xfff0b5, 0.7 * alpha).strokeEllipse(q.x, q.y - h, 9, width * 1.4);
  }

  render(engine: RunEngine, projection: Projection, realTime: number): void {
    this.player.setStatusTint?.(null);
    this.glow.clear();
    this.ground.clear();
    this.shadow.clear();
    this.mesh.begin();
    this.particles.begin();
    this.wingVisible = this.maVisible = false;
    this.lastWings = [];
    this.lastDragonSpines = [];
    const unit = projection.pixelsPerUnit,
      time = engine.time,
      result = engine.mode === 'result',
      live = new Set<number>();
    for (const effect of engine.advanced.visuals) {
      live.add(effect.id);
      let remaining = effect.remaining;
      if (result) {
        if (effect.warning) continue;
        if (!this.endAt.has(effect.id)) this.endAt.set(effect.id, realTime + remaining);
        remaining = this.endAt.get(effect.id)! - realTime;
        if (remaining <= 0) continue;
      }
      const phase = 1 - clamp01(remaining / effect.total),
        age = phase * effect.total;
      if (effect.effect === 'palm') {
        if (effect.warning) {
          const formed = smooth01(phase / 0.48),
            height = handHeight(phase);
          this.mesh.submit(
            buildHand(effect, effect.radius, phase, age, true, 0.12 + 0.73 * formed),
          );
          const heart = handToWorld(v3(0, 0.28, 0.15), effect, effect.radius);
          heart.z += height;
          this.particles.draw(
            `palm-core-${effect.id}`,
            heart,
            projection,
            effect.radius * 0.7,
            0xffbd54,
            0.25 * formed,
            true,
            10000,
          );
          for (let k = 0; k < 5; k++)
            for (let i = 0; i < 3; i++) {
              const bone = handBones[k],
                t = (i + 0.4) / 3;
              const point = handToWorld(
                v3(
                  bone.a.x + (bone.b.x - bone.a.x) * t,
                  bone.a.y + (bone.b.y - bone.a.y) * t,
                  0.12,
                ),
                effect,
                effect.radius,
              );
              point.z += height;
              this.particles.draw(
                `palm-flow-${effect.id}-${k}-${i}`,
                point,
                projection,
                bone.radius * effect.radius * 3,
                0xffce71,
                formed * 0.12 * (0.8 + 0.2 * Math.sin(age * 16 - i - k)),
                true,
                10000,
              );
            }
          const points = techniqueOutline(effect).map((p) => project(p, projection));
          this.shadow
            .fillStyle(0x1c0e12, 0.04 + 0.13 * (1 - height / 4.6))
            .fillPoints(points, true);
          this.outline(effect, projection, 0xd0a060, 0.18 + 0.4 * formed, 0.025);
          if (phase > 0.58) {
            const drop = smooth01((phase - 0.58) / 0.42);
            for (let i = 0; i < 12; i++) {
              const edge = palmRestOutline[Math.floor((i * palmRestOutline.length) / 12)];
              const point = handToWorld(v3(edge[0], edge[1], 0), effect, effect.radius);
              const a = projectVfx({ ...point, z: height + 0.1 }, unit, projection.origin);
              const b = projectVfx({ ...point, z: height + drop * 1.8 }, unit, projection.origin);
              this.glow.lineStyle(1 + drop, 0xffd994, drop * 0.22).lineBetween(a.x, a.y, b.x, b.y);
            }
          }
          // Hạt lực tụ vào một bàn tay nằm ngang ở độ cao thật, không phóng to ảnh hướng camera.
          for (let i = 0; i < 26; i++) {
            const a = noise(i + effect.id) * Math.PI * 2,
              travel = (phase * 2 + noise(i * 3)) % 1;
            const r = effect.radius * (1.3 - 0.8 * travel),
              z = height + 0.2 + (0.8 - travel) * 1.4;
            this.particles.draw(
              `gather-${effect.id}-${i}`,
              v3(effect.x + Math.cos(a) * r, effect.y + Math.sin(a) * r, z),
              projection,
              0.06 + 0.08 * noise(i),
              i % 4 ? 0xffd478 : 0xb6e9ff,
              Math.sin(travel * Math.PI) * formed * 0.8,
              true,
              10000,
            );
          }
        } else {
          const flash = Math.max(0, 1 - age / 0.24),
            fade = Math.min(1, remaining / 0.7);
          if (age < 0.18)
            this.mesh.submit(
              buildHand(effect, effect.radius, 1, age, false, (1 - age / 0.18) * 0.7),
            );
          this.outline(
            effect,
            projection,
            flash > 0 ? 0xffdd89 : 0x92551d,
            (0.6 + 0.3 * flash) * fade,
            0.16,
          );
          const points = techniqueOutline(effect).map((p) => project(p, projection));
          this.ground.fillStyle(0x2e1d13, 0.28 * fade * (1 - flash)).fillPoints(points, true);
          // Nứt và bụi tỏa từ biên năm ngón, giữ chưởng ấn làm dấu mặt đất.
          for (let i = 0; i < 22; i++) {
            const edge = palmRestOutline[Math.floor((i * palmRestOutline.length) / 22)],
              start = handToWorld(v3(edge[0], edge[1], 0), effect, effect.radius);
            const dx = start.x - effect.x,
              dy = start.y - effect.y,
              travel = Math.min(age, 0.7),
              s = 0.25 + noise(i) * 0.6;
            const point = v3(
              start.x + dx * travel * s,
              start.y + dy * travel * s,
              Math.max(0, (1.6 + noise(i)) * travel - 3.4 * travel * travel),
            );
            this.particles.draw(
              `dust-${effect.id}-${i}`,
              point,
              projection,
              (0.08 + age * 0.25) * (i % 3 === 0 ? 2 : 1),
              i % 3 ? 0xffc05a : 0x392723,
              Math.max(0, 1 - age / (i % 3 ? 0.65 : 1.1)) * 0.65,
              i % 3 !== 0,
            );
            if (age < 0.8) {
              const a = project(start, projection),
                b = project({ x: start.x + dx * 0.28 * s, y: start.y + dy * 0.28 * s }, projection);
              this.ground
                .lineStyle(1, 0x65401d, (1 - age / 0.8) * 0.5)
                .lineBetween(a.x, a.y, b.x, b.y);
            }
          }
        }
      } else if (effect.effect === 'soul' && effect.shape === 'beam') {
        this.beam(
          effect,
          projection,
          effect.warning ? 0.6 : Math.min(1, remaining / 0.2),
          phase,
          effect.warning,
        );
      } else if (effect.warning) {
        for (let i = 0; i < 12; i++) {
          const u = i / 11,
            a = u * Math.PI * 3 + phase * 6,
            r = 0.45 * (1 - u * 0.5);
          this.particles.draw(
            `summon-${effect.id}-${i}`,
            v3(effect.x + Math.cos(a) * r, effect.y + Math.sin(a) * r, 0.4 + u),
            projection,
            0.15,
            0xbbe9f4,
            Math.sin(u * Math.PI) * phase * 0.6,
          );
        }
      } else {
        for (let i = 0; i < 12; i++) {
          const a = noise(i + effect.id) * Math.PI * 2,
            r = phase * (0.5 + noise(i * 2));
          this.particles.draw(
            `impact-${effect.id}-${i}`,
            v3(
              effect.x + Math.cos(a) * r,
              effect.y + Math.sin(a) * r,
              0.8 + phase * (noise(i * 3) - 0.2),
            ),
            projection,
            0.045 + noise(i) * 0.07,
            effect.effect === 'lightning' ? 0x98efff : 0xffd488,
            (1 - phase) * 0.8,
          );
        }
      }
    }
    for (const id of this.endAt.keys()) if (!live.has(id)) this.endAt.delete(id);
    if (!result) {
      for (const zone of engine.advanced.zones) {
        if (zone.kind === 'slow') {
          this.outline(zone.area, projection, 0x815465, 0.48, 0.06);
          continue;
        }
        if (zone.kind === 'beam') {
          this.beam(zone.area, projection, 0.85, ((time - zone.started) * 2) % 1, false, 0xff9340);
          const d = {
            position: zone.area,
            heading: zone.area.angle,
            bodyLength: 1.5,
            trail: [
              zone.area,
              ...Array.from({ length: 12 }, (_, i) => ({
                x: zone.area.x - Math.cos(zone.area.angle) * (i + 1) * 0.13,
                y: zone.area.y - Math.sin(zone.area.angle) * (i + 1) * 0.13,
              })),
            ],
          };
          const spine = dragonSpine(d, 1, time, 14).map((p) => ({ ...p, z: p.z + 0.38 }));
          this.mesh.submit(buildDragon(spine, time, 0.75, 0.82, zone.rank === 6));
          continue;
        }
        const d = zone.dragon!,
          age = time - zone.started,
          fade = smooth01(age / 0.38) * Math.min(1, (zone.end - time) / 0.45);
        const spine = dragonSpine(d, age, time);
        this.lastDragonSpines.push(spine);
        this.mesh.submit(buildDragon(spine, time, zone.area.width, fade, zone.rank === 6));
        for (let i = 0; i < spine.length; i += 3) {
          const u = i / (spine.length - 1);
          this.particles.draw(
            `dragon-haze-${zone.id}-${i}`,
            spine[i],
            projection,
            zone.area.width * (0.6 - 0.35 * u),
            i % 2 ? 0x99f4ff : 0xffdf9c,
            fade * (1 - u) * 0.18,
          );
        }
        const head = spine[0];
        this.particles.draw(`headlight-${zone.id}`, head, projection, 0.7, 0xffd775, fade * 0.2);
        for (let i = 0; i < 64; i++) {
          const t = (age * 0.55 + noise(i + zone.id)) % 1,
            index = Math.min(spine.length - 1, Math.floor(t * (spine.length - 1))),
            p = spine[index],
            swirl = time * 3.2 + noise(i) * 12,
            r = 0.12 + t * 0.36;
          this.particles.draw(
            `wake-${zone.id}-${i}`,
            v3(
              p.x + Math.cos(swirl) * r,
              p.y + Math.sin(swirl) * r,
              p.z + Math.sin(swirl * 0.8) * r,
            ),
            projection,
            0.025 + noise(i * 3) * 0.09,
            i % 3 ? 0xf9edd1 : 0x91efff,
            Math.sin(t * Math.PI) * fade * 0.7,
          );
        }
      }
      for (const [id] of engine.advanced.marks) {
        const e = engine.enemies.find((e) => e.id === id && !e.dead);
        if (!e) continue;
        const p = projectVfx(v3(e.x, e.y, 1.8), unit, projection.origin);
        this.glow
          .lineStyle(1.5, 0xffd86d, 0.85)
          .strokeTriangle(p.x, p.y - 7, p.x - 6, p.y + 4, p.x + 6, p.y + 4)
          .lineBetween(p.x, p.y - 10, p.x, p.y + 8);
      }
      if (engine.skills['phong-loi-vu-duc']) {
        this.wingVisible = true;
        const back = this.player.attachment('back'),
          foot = project(engine.position, projection),
          dx = (back.x - foot.x) / (unit * Math.SQRT2),
          height = (foot.y - back.y) / (unit * Math.sqrt(2 / 3));
        const root = v3(engine.position.x + dx, engine.position.y + dx, height);
        const directions = ['SW', 'S', 'SE', 'E', 'NE', 'N', 'NW', 'W'],
          angle = (directions.indexOf(this.player.renderedFacing) * Math.PI) / 4;
        const forward = { x: Math.sin(angle), y: -Math.cos(angle) },
          dash = engine.dashTime > 0;
        this.lastWings = wingPose(root, forward, time, dash);
        this.mesh.submit(buildWings(root, forward, time, dash));
        for (const pose of this.lastWings)
          this.particles.draw(
            `wing-root-${pose.sign}`,
            pose.root,
            projection,
            0.28,
            pose.sign < 0 ? 0x94eaff : 0xc2b1ff,
            0.55,
          );
      }
      if (engine.advanced.maActive(time)) {
        this.maVisible = true;
        const elapsed = engine.advanced.maElapsed(time),
          chest = this.player.attachment('chest'),
          head = this.player.attachment('head');
        if (engine.invulnerability <= 0 || engine.dashTime > 0) {
          if (this.player.setStatusTint) this.player.setStatusTint(0xa6657e);
          else this.player.sprite.setTint(0xc58d99, 0xb96c87, 0x684457, 0x674157);
        }
        // Khói đen đỏ có tuổi, độ nổi và nhiễu xoáy; không tạo các mảng lửa hồng bám trên đầu.
        for (let i = 0; i < 46; i++) {
          const phase = (elapsed * 0.72 + noise(i) * 3) % 1,
            a = noise(i * 4) * Math.PI * 2 + time * 0.65 + phase * 1.4,
            r = 0.22 + phase * 0.38;
          this.particles.draw(
            `ma-smoke-${i}`,
            v3(
              engine.position.x + Math.cos(a) * r,
              engine.position.y + Math.sin(a) * r,
              0.08 + phase * 2.4,
            ),
            projection,
            0.35 + phase * 0.85,
            0x23101f,
            Math.pow(1 - phase, 1.3) * 0.22,
            false,
          );
        }
        for (let i = 0; i < 22; i++) {
          const phase = (elapsed * 0.9 + noise(i + 91) * 2) % 1,
            a = noise(i * 2) * Math.PI * 2 + phase * 3,
            r = 0.25 + 0.13 * Math.sin(phase * 6 + i);
          const p = v3(
            engine.position.x + Math.cos(a) * r,
            engine.position.y + Math.sin(a) * r,
            0.05 + phase * 2.4,
          );
          this.particles.draw(
            `ma-ember-${i}`,
            p,
            projection,
            0.025 + noise(i) * 0.045,
            i % 4 ? 0xd72d35 : 0xff9b60,
            Math.sin(phase * Math.PI) * 0.85,
          );
        }
        const m = mesh3();
        for (let k = 0; k < 3; k++) {
          const points = Array.from({ length: 24 }, (_, i) => {
            const u = i / 23,
              a = time * 2.4 - u * 7 + (k * Math.PI * 2) / 3,
              r = 0.35 + 0.12 * Math.sin(u * 4 + time);
            return v3(
              engine.position.x + Math.cos(a) * r,
              engine.position.y + Math.sin(a) * r,
              0.05 + u * 2.25,
            );
          });
          m.strokes.push(
            { points, width: 0.14, color: 0x8b142b, alpha: 0.1 },
            { points, width: 0.022, color: 0xe04446, alpha: 0.26 },
          );
        }
        this.mesh.submit(m);
        this.particles.draw(
          'ma-core',
          v3(engine.position.x, engine.position.y, 0.7),
          projection,
          1.4,
          0xa61b2b,
          0.15,
        );
        for (let i = 0; i < 12; i++) {
          const phase = (elapsed * 0.7 + noise(i + 151)) % 1,
            a = time * 1.8 + phase * 4 + i;
          this.particles.draw(
            `ma-haze-${i}`,
            v3(
              engine.position.x + Math.cos(a) * 0.35,
              engine.position.y + Math.sin(a) * 0.35,
              0.15 + phase * 1.9,
            ),
            projection,
            0.28,
            0xb52239,
            Math.sin(phase * Math.PI) * 0.2,
          );
        }
        if (elapsed < 0.4)
          for (let i = 0; i < 20; i++) {
            const a = (i * Math.PI * 2) / 20,
              r = elapsed * (1.5 + noise(i) * 2);
            this.particles.draw(
              `ma-burst-${i}`,
              v3(
                engine.position.x + Math.cos(a) * r,
                engine.position.y + Math.sin(a) * r,
                elapsed * (2 + noise(i)),
              ),
              projection,
              0.13,
              0xd34145,
              (1 - elapsed / 0.4) * 0.7,
            );
          }
        this.glow
          .lineStyle(1.3, 0xe36564, 0.75)
          .lineBetween(chest.x - 3, chest.y - 5, chest.x + 1, chest.y + 3)
          .lineBetween(chest.x + 1, chest.y + 3, chest.x + 4, chest.y - 2);
        if (!this.player.renderedFacing.startsWith('N'))
          this.glow
            .fillStyle(0xff956d, 0.95)
            .fillRect(head.x - 4, head.y + 2, 3, 1.5)
            .fillRect(head.x + 2, head.y + 2, 3, 1.5);
      }
    }
    this.mesh.render(projection, time);
    this.particles.end();
  }
  get triangleCount(): number {
    return this.mesh.triangleCount;
  }
}

import Phaser from 'phaser';
import type { RunEngine } from '../systems/RunEngine';
import type { Projection } from '../math/worldPhysics';
import { project } from '../math/worldPhysics';
import { fireSegments } from '../math/stageZones';
import type { Point } from '../../shared/types';
import type { StageZone } from '../../shared/stageMechanics';
import { mechanicRules } from '../../data/stageMechanics';

/** Hình cảnh báo luôn lấy hình học từ chính zone sát thương; không tạo vật cản mới. */
export class StageMechanicEffects {
  private ground: Phaser.GameObjects.Graphics;
  private markers: Phaser.GameObjects.Graphics;
  private labels = new Map<number, Phaser.GameObjects.Text>();
  constructor(private scene: Phaser.Scene) {
    this.ground = scene.add.graphics().setDepth(-880);
    this.markers = scene.add.graphics().setDepth(100000);
  }
  clear(): void {
    this.ground.clear();
    this.markers.clear();
    this.labels.forEach((label) => label.destroy());
    this.labels.clear();
  }
  render(engine: RunEngine, projection: Projection, realSeconds: number): void {
    this.ground.clear();
    this.markers.clear();
    const zones = engine.mechanics.zones,
      ids = new Set(zones.map((zone) => zone.id)),
      zoom = this.scene.cameras.main.zoom,
      reduced = engine.profile.settings.reducedEffects;
    for (const [id, label] of this.labels)
      if (!ids.has(id)) {
        label.destroy();
        this.labels.delete(id);
      }
    for (const zone of zones) {
      const warning = zone.elapsed < zone.warning;
      if (zone.kind === 'fire') this.fire(zone, projection, warning, zoom, realSeconds);
      else this.circle(zone, projection, warning, zoom, realSeconds, reduced);
      this.label(zone, projection, warning, zoom);
    }
    const mechanics = engine.mechanics;
    if (mechanics.wardRemaining > 0) {
      const p = project(engine.position, projection),
        r = projection.pixelsPerUnit * 0.65;
      this.markers
        .lineStyle(2 / zoom, 0x8ce9ff, 0.75)
        .strokeEllipse(p.x, p.y - 16, r * 1.4, r * 2.1);
    }
    if (mechanics.phase === 'boss') return;
    for (const enemy of engine.enemies) {
      if (enemy.dead) continue;
      const p = project(enemy, projection);
      if (enemy.commander) {
        this.ring(enemy, mechanicRules.squadRadius, projection, 0x72bde1, 0.3, zoom, true);
        const y = p.y - 70;
        this.markers
          .lineStyle(2 / zoom, 0xffdd79, 1)
          .lineBetween(p.x + 8 / zoom, y + 6 / zoom, p.x + 8 / zoom, y - 25 / zoom);
        this.markers
          .fillStyle(0xffd16c, 0.95)
          .fillTriangle(
            p.x + 8 / zoom,
            y - 25 / zoom,
            p.x + 29 / zoom,
            y - 19 / zoom,
            p.x + 8 / zoom,
            y - 12 / zoom,
          )
          .lineStyle(1.2 / zoom, 0x173127, 1)
          .strokePoints(
            [
              { x: p.x + 8 / zoom, y: y - 25 / zoom },
              { x: p.x + 29 / zoom, y: y - 19 / zoom },
              { x: p.x + 8 / zoom, y: y - 12 / zoom },
            ],
            true,
          );
      } else if (engine.squadProtected(enemy))
        this.ring(enemy, enemy.radius + 0.16, projection, 0x99dbff, 0.7, zoom);
      if (mechanics.definition?.kind === 'hunt' && mechanics.phase === 'active') {
        const toward = project(engine.position, projection),
          length = Math.hypot(toward.x - p.x, toward.y - p.y) || 1;
        const dx = (toward.x - p.x) / length,
          dy = (toward.y - p.y) / length;
        this.ground.lineStyle(1.5 / zoom, 0xf5be75, 0.6);
        for (let index = -1; index <= 1; index++)
          this.ground.lineBetween(
            p.x - dy * index * 3 - dx * 7,
            p.y + dx * index * 3 - dy * 7,
            p.x - dy * index * 3 - dx * 18,
            p.y + dx * index * 3 - dy * 18,
          );
      }
    }
  }
  private ring(
    point: Point,
    radius: number,
    projection: Projection,
    color: number,
    alpha: number,
    zoom: number,
    dashed = false,
  ): void {
    const center = project(point, projection),
      rx = radius * projection.pixelsPerUnit,
      ry = rx / Math.sqrt(3);
    this.ground.lineStyle(1.5 / zoom, color, alpha);
    if (!dashed) {
      this.ground.strokeEllipse(center.x, center.y, rx * 2, ry * 2);
      return;
    }
    for (let segment = 0; segment < 28; segment++) {
      const a = (segment / 28) * Math.PI * 2,
        b = ((segment + 0.6) / 28) * Math.PI * 2;
      this.ground.lineBetween(
        center.x + Math.cos(a) * rx,
        center.y + Math.sin(a) * ry,
        center.x + Math.cos(b) * rx,
        center.y + Math.sin(b) * ry,
      );
    }
  }
  private circle(
    zone: StageZone,
    projection: Projection,
    warning: boolean,
    zoom: number,
    time: number,
    reduced: boolean,
  ): void {
    const p = project(zone, projection),
      rx = zone.radius * projection.pixelsPerUnit,
      ry = rx / Math.sqrt(3),
      color = zone.kind === 'rune' ? 0x6edbff : zone.kind === 'poison' ? 0x91d35d : 0xc587ff;
    this.ground
      .fillStyle(color, warning ? 0.06 : zone.kind === 'rune' ? 0.1 : 0.19)
      .fillEllipse(p.x, p.y, rx * 2, ry * 2);
    this.ring(zone, zone.radius, projection, color, warning ? 0.7 : 0.95, zoom, warning);
    if (warning) {
      const charge = Math.max(0.05, zone.elapsed / zone.warning);
      this.ring(zone, zone.radius * charge, projection, color, 0.45, zoom);
    } else if (zone.kind === 'rune') {
      const sides = 6;
      const corners = Array.from({ length: sides }, (_, index) => ({
        x: p.x + Math.cos((index * Math.PI * 2) / sides) * rx * 0.75,
        y: p.y + Math.sin((index * Math.PI * 2) / sides) * ry * 0.75,
      }));
      this.ground.lineStyle(1.1 / zoom, color, 0.8).strokePoints(corners, true);
      for (let index = 0; index < 3; index++)
        this.ground.lineBetween(
          corners[index].x,
          corners[index].y,
          corners[index + 3].x,
          corners[index + 3].y,
        );
      this.ground
        .fillStyle(zone.charged ? 0xd9fcff : color, 0.3)
        .fillEllipse(
          p.x,
          p.y,
          (rx * zone.charge) / mechanicRules.runeCharge,
          (ry * zone.charge) / mechanicRules.runeCharge,
        );
    } else if (zone.kind === 'poison') {
      for (let index = 0; index < (reduced ? 5 : 12); index++) {
        const a = index * 2.4,
          r = 0.35 + (index % 3) * 0.17;
        const drift = Math.sin(time * 1.5 + index) * ry * 0.12;
        this.ground
          .fillStyle(0x6cb95a, 0.12)
          .fillEllipse(
            p.x + Math.cos(a) * rx * r,
            p.y + Math.sin(a) * ry * r + drift,
            rx * 0.65,
            ry * 0.75,
          );
      }
    } else {
      this.ground.lineStyle(2 / zoom, 0xe7c2ff, 0.9);
      for (let index = 0; index < 5; index++) {
        const angle = (index * Math.PI * 2) / 5;
        this.ground.lineBetween(
          p.x,
          p.y,
          p.x + Math.cos(angle) * rx * 0.9,
          p.y + Math.sin(angle) * ry * 0.9,
        );
      }
    }
    // Dấu chữ thập/cánh sao phân biệt vùng gây hại với vòng lửa của người chơi.
    if (zone.kind !== 'rune' && warning) {
      this.ground
        .lineStyle(2 / zoom, color, 0.9)
        .lineBetween(p.x - 5, p.y - 3, p.x + 5, p.y + 3)
        .lineBetween(p.x - 5, p.y + 3, p.x + 5, p.y - 3);
    }
  }
  private fire(
    zone: StageZone,
    projection: Projection,
    warning: boolean,
    zoom: number,
    time: number,
  ): void {
    const normal = { x: -zone.direction.y, y: zone.direction.x };
    for (const [from, to] of fireSegments(zone)) {
      const polygon = [
        { x: from.x + normal.x * zone.radius, y: from.y + normal.y * zone.radius },
        { x: to.x + normal.x * zone.radius, y: to.y + normal.y * zone.radius },
        { x: to.x - normal.x * zone.radius, y: to.y - normal.y * zone.radius },
        { x: from.x - normal.x * zone.radius, y: from.y - normal.y * zone.radius },
      ].map((point) => project(point, projection));
      this.ground
        .fillStyle(warning ? 0xf2ad65 : 0xf9702b, warning ? 0.1 : 0.4)
        .fillPoints(polygon, true);
      this.ground
        .lineStyle(1.8 / zoom, warning ? 0xf2b971 : 0xffd373, 0.9)
        .strokePoints(polygon, true);
      const a = project(from, projection),
        b = project(to, projection),
        count = Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 13);
      for (let index = 0; index <= count; index++) {
        const t = index / Math.max(1, count),
          x = a.x + (b.x - a.x) * t,
          y = a.y + (b.y - a.y) * t;
        if (warning)
          this.ground.lineStyle(1 / zoom, 0xe9a76a, 0.5).lineBetween(x - 3, y - 3, x + 3, y + 3);
        else {
          const height = 9 + (Math.sin(time * 8 + index) + 1) * 5;
          this.ground.fillStyle(0xff9d32, 0.85).fillTriangle(x - 4, y, x + 4, y, x + 2, y - height);
        }
      }
    }
    const gap = {
      x: zone.x + zone.direction.x * zone.gapOffset,
      y: zone.y + zone.direction.y * zone.gapOffset,
    };
    const length = Math.hypot(zone.velocity.x, zone.velocity.y) || 1;
    const swept = [
      {
        x: gap.x - zone.direction.x * zone.gapHalfWidth,
        y: gap.y - zone.direction.y * zone.gapHalfWidth,
      },
      {
        x: gap.x + zone.direction.x * zone.gapHalfWidth,
        y: gap.y + zone.direction.y * zone.gapHalfWidth,
      },
      {
        x: gap.x + zone.direction.x * zone.gapHalfWidth + zone.velocity.x * 4,
        y: gap.y + zone.direction.y * zone.gapHalfWidth + zone.velocity.y * 4,
      },
      {
        x: gap.x - zone.direction.x * zone.gapHalfWidth + zone.velocity.x * 4,
        y: gap.y - zone.direction.y * zone.gapHalfWidth + zone.velocity.y * 4,
      },
    ].map((point) => project(point, projection));
    this.ground
      .fillStyle(0x6ddbd0, 0.06)
      .fillPoints(swept, true)
      .lineStyle(1.5 / zoom, 0x85e5cf, 0.8)
      .strokePoints(swept, true);
    const arrow = project(gap, projection),
      towards = project(
        { x: gap.x + zone.velocity.x / length, y: gap.y + zone.velocity.y / length },
        projection,
      );
    const angle = Math.atan2(towards.y - arrow.y, towards.x - arrow.x);
    this.ground
      .lineStyle(2 / zoom, 0xb9ffe0, 1)
      .lineBetween(
        arrow.x - Math.cos(angle - 0.6) * 10,
        arrow.y - Math.sin(angle - 0.6) * 10,
        arrow.x,
        arrow.y,
      )
      .lineBetween(
        arrow.x,
        arrow.y,
        arrow.x - Math.cos(angle + 0.6) * 10,
        arrow.y - Math.sin(angle + 0.6) * 10,
      );
  }
  private label(zone: StageZone, projection: Projection, warning: boolean, zoom: number): void {
    const text =
      zone.kind === 'rune'
        ? zone.charged
          ? 'LINH HỘ'
          : `TỤ LINH ${Math.floor((zone.charge / mechanicRules.runeCharge) * 100)}%`
        : warning
          ? `${zone.kind === 'fire' ? 'HỎA TRIỀU' : zone.kind === 'poison' ? 'ĐỘC CHƯỚNG' : 'HẮC ẤN'} · ${Math.ceil(zone.warning - zone.elapsed)}s`
          : '';
    if (!text) {
      this.labels.get(zone.id)?.setVisible(false);
      return;
    }
    if (!this.labels.has(zone.id))
      this.labels.set(
        zone.id,
        this.scene.add
          .text(0, 0, '', {
            fontFamily: 'Be Vietnam Pro',
            fontSize: '10px',
            color: '#e8f6e4',
            stroke: '#10221e',
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(100010),
      );
    const p = project(zone, projection);
    this.labels
      .get(zone.id)!
      .setVisible(true)
      .setText(text)
      .setScale(1 / zoom)
      .setPosition(p.x, p.y - (zone.radius * projection.pixelsPerUnit) / Math.sqrt(3) - 15 / zoom);
  }
}

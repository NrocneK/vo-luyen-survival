import Phaser from 'phaser';
import type { Projection } from '../math/worldPhysics';
import {
  projectVfx,
  cameraNormal,
  dot3,
  type Face3,
  type Vec3,
  type VfxMesh,
} from '../math/vfxGeometry';
import { spiritSurface } from '../math/vfxMaterial';

/** Lưới chỉ định hình vỏ linh lực trong suốt; ánh sáng cộng màu, không phủ vật liệu đặc lên sân. */
export class ProjectedVfx {
  private faces: Face3[] = [];
  private strokes: VfxMesh['strokes'] = [];
  private layers = new Map<number, Phaser.GameObjects.Graphics>();
  private glow: Phaser.GameObjects.Graphics;
  private mist: VfxParticles;
  constructor(private scene: Phaser.Scene) {
    this.glow = scene.add.graphics().setDepth(10001).setBlendMode(Phaser.BlendModes.ADD);
    this.mist = new VfxParticles(scene);
  }
  begin(): void {
    this.faces.length = 0;
    this.strokes.length = 0;
    this.glow.clear();
    this.mist.begin();
    for (const layer of this.layers.values()) layer.clear();
  }
  submit(mesh: VfxMesh): void {
    this.faces.push(...mesh.faces);
    this.strokes.push(...mesh.strokes);
  }
  clear(): void {
    this.begin();
    for (const layer of this.layers.values()) layer.destroy();
    this.layers.clear();
    this.mist.clear();
  }
  render(projection: Projection, time: number): void {
    const groups = new Map<number, Face3[]>();
    for (const f of this.faces) {
      if (f.alpha < 0.004 || dot3(f.normal, cameraNormal) < -0.025) continue;
      const groundY =
        projection.origin.y +
        (((f.a.x + f.b.x + f.c.x - f.a.y - f.b.y - f.c.y) / 3) * projection.pixelsPerUnit) /
          Math.sqrt(6);
      const key = Math.floor(groundY / 5) * 5 + (f.layer ?? 0),
        row = groups.get(key) ?? [];
      row.push(f);
      groups.set(key, row);
    }
    for (const [key, faces] of groups) {
      let layer = this.layers.get(key);
      if (!layer) {
        layer = this.scene.add
          .graphics()
          .setDepth(key + 0.02)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.layers.set(key, layer);
      }
      const depth = (f: Face3) =>
        f.a.x - f.a.y + f.a.z + f.b.x - f.b.y + f.b.z + f.c.x - f.c.y + f.c.z;
      faces.sort((a, b) => depth(a) - depth(b));
      for (const f of faces) {
        const a = projectVfx(f.a, projection.pixelsPerUnit, projection.origin),
          b = projectVfx(f.b, projection.pixelsPerUnit, projection.origin),
          c = projectVfx(f.c, projection.pixelsPerUnit, projection.origin);
        const material = spiritSurface(f, time);
        layer.fillStyle(material.color, material.alpha).fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);
      }
    }
    for (const key of this.layers.keys())
      if (!groups.has(key)) {
        this.layers.get(key)!.destroy();
        this.layers.delete(key);
      }
    for (const [lineIndex, line] of this.strokes.entries()) {
      const points = line.points.map((p) =>
        projectVfx(p, projection.pixelsPerUnit, projection.origin),
      );
      const width = Math.max(0.55, line.width * projection.pixelsPerUnit);
      // Các đoạn riêng tránh miter kéo thành quạt khi sống lưng đổi chiều.
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1],
          b = points[i];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 0.2) continue;
        if (line.soft) {
          const taper = line.taper
            ? Math.pow(Math.sin((Math.PI * (i - 0.5)) / (line.points.length - 1)), 0.65)
            : 1;
          this.mist.streak(
            `mist-${lineIndex}-${i}`,
            line.points[i - 1],
            line.points[i],
            projection,
            line.width * taper,
            line.color,
            line.alpha,
            line.layer ?? 0,
          );
          continue;
        }
        if (width > 1.3)
          for (const [size, alpha] of [
            [3.4, 0.025],
            [2.1, 0.07],
          ])
            this.glow
              .lineStyle(width * size, line.color, line.alpha * alpha)
              .lineBetween(a.x, a.y, b.x, b.y);
        this.glow.lineStyle(width, line.color, line.alpha).lineBetween(a.x, a.y, b.x, b.y);
      }
    }
    this.mist.end();
  }
  get triangleCount(): number {
    return this.faces.length;
  }
}

/** Hạt chỉ dùng một kernel ánh sáng mềm do mã tạo; chuyển động/tuổi/độ sâu là trạng thái hiệu ứng. */
export class VfxParticles {
  private pool = new Map<string, Phaser.GameObjects.Image>();
  private used = new Set<string>();
  constructor(private scene: Phaser.Scene) {
    if (!scene.textures.exists('vfx-soft-kernel')) {
      const texture = scene.textures.createCanvas('vfx-soft-kernel', 64, 64)!;
      const ctx = texture.context,
        gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,.85)');
      gradient.addColorStop(0.55, 'rgba(255,255,255,.24)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      texture.refresh();
      texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
  begin(): void {
    this.used.clear();
  }
  draw(
    id: string,
    p: Vec3,
    projection: Projection,
    size: number,
    color: number,
    alpha: number,
    add = true,
    offset = 0,
  ): void {
    if (alpha <= 0.002) return;
    this.used.add(id);
    let image = this.pool.get(id);
    if (!image) {
      image = this.scene.add.image(0, 0, 'vfx-soft-kernel');
      this.pool.set(id, image);
    }
    const screen = projectVfx(p, projection.pixelsPerUnit, projection.origin);
    const depth =
      projection.origin.y + ((p.x - p.y) * projection.pixelsPerUnit) / Math.sqrt(6) + offset;
    image
      .setPosition(screen.x, screen.y)
      .setRotation(0)
      .setDisplaySize(size * projection.pixelsPerUnit, size * projection.pixelsPerUnit)
      .setTint(color)
      .setAlpha(alpha)
      .setDepth(depth)
      .setBlendMode(add ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
  }
  /** Hạt kéo theo tiếp tuyến từng đoạn, làm dải linh lực mềm có lõi/biên suy giảm thật. */
  streak(
    id: string,
    a: Vec3,
    b: Vec3,
    projection: Projection,
    width: number,
    color: number,
    alpha: number,
    layer = 0,
  ): void {
    const p = projectVfx(a, projection.pixelsPerUnit, projection.origin),
      q = projectVfx(b, projection.pixelsPerUnit, projection.origin);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
    const distance = Math.hypot(q.x - p.x, q.y - p.y);
    this.draw(
      id,
      mid,
      projection,
      width,
      color,
      alpha * Math.min(1, distance / (width * projection.pixelsPerUnit * 2.2)),
      true,
      layer,
    );
    const sprite = this.pool.get(id);
    if (sprite)
      sprite
        .setDisplaySize(
          Math.hypot(q.x - p.x, q.y - p.y) + width * projection.pixelsPerUnit * 2,
          width * projection.pixelsPerUnit * 2,
        )
        .setRotation(Math.atan2(q.y - p.y, q.x - p.x));
  }
  end(): void {
    for (const [id, p] of this.pool)
      if (!this.used.has(id)) {
        p.destroy();
        this.pool.delete(id);
      }
  }
  clear(): void {
    for (const p of this.pool.values()) p.destroy();
    this.pool.clear();
    this.used.clear();
  }
}

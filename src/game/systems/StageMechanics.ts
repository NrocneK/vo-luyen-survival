import { stageMechanics, mechanicRules as rules } from '../../data/stageMechanics.ts';
import type { StageMechanicDef } from '../../data/stageMechanics.ts';
import type { CircleObstacle, Point, WorldBounds } from '../../shared/types';
import type { EnemyState } from '../../shared/models';
import type { MechanicPhase, StageMechanicView, StageZone } from '../../shared/stageMechanics';
import { insideStageZone } from '../math/stageZones.ts';

export interface MechanicContext {
  time: number;
  position: Point;
  radius: number;
  enemies: readonly EnemyState[];
  obstacles: readonly CircleObstacle[];
}
export type MechanicEvent =
  | { type: 'damage'; fraction: number; hazard: 'poison' | 'fire' | 'dark' }
  | { type: 'squad' }
  | { type: 'cue'; text: string; sound: string; duration?: number };

/** Luật cơ chế màn chạy thuần TypeScript; không phụ thuộc FPS, React hoặc tài nguyên ảnh. */
export class StageMechanics {
  readonly definition: StageMechanicDef | null;
  zones: StageZone[] = [];
  phase: MechanicPhase = 'rest';
  wardRemaining = 0;
  leaderId: number | null = null;
  enemySpeed = 1;
  enemyVulnerability = 1;
  private nextAt: number;
  private sequence = 0;
  private phaseRemaining = 0;
  private label = '';
  private hint = '';
  private phaseKey = '';
  private squadReadyAt: number | null = null;
  private squadRequested = false;
  private squadBrokenUntil = 0;
  private nextDarkAt = 0;
  private target: Point | null = null;
  private progress = 0;
  private events: MechanicEvent[] = [];
  private duration: number;
  private bounds: WorldBounds;
  private random: () => number;
  constructor(stageId: string, duration: number, bounds: WorldBounds, random: () => number) {
    this.duration = duration;
    this.bounds = bounds;
    this.random = random;
    this.definition = stageMechanics[stageId] ?? null;
    this.nextAt = this.definition?.start ?? Infinity;
  }
  clear(): void {
    this.zones = [];
    this.leaderId = null;
    this.wardRemaining = 0;
    this.enemySpeed = this.enemyVulnerability = 1;
    this.target = null;
    this.phase = 'boss';
  }
  view(): StageMechanicView | null {
    if (!this.definition || this.phase === 'boss') return null;
    return {
      kind: this.definition.kind,
      name: this.definition.name,
      phase: this.phase,
      label: this.label || 'Đang tiến vào chiến trường',
      hint: this.hint || this.definition.description,
      remaining: Math.max(0, this.phaseRemaining),
      progress: this.progress,
      target: this.target ? { ...this.target } : null,
      wardRemaining: this.wardRemaining,
    };
  }
  registerSquad(leader: EnemyState | null, time: number): void {
    this.leaderId = leader?.id ?? null;
    this.squadRequested = false;
    this.squadReadyAt = null;
    this.nextAt = time + (leader ? this.definition!.interval : 5);
  }
  tick(dt: number, context: MechanicContext): MechanicEvent[] {
    this.events = [];
    if (!this.definition || context.time >= this.duration || this.phase === 'boss') {
      this.clear();
      return this.events;
    }
    this.enemySpeed = this.enemyVulnerability = 1;
    this.target = null;
    this.progress = 0;
    this.wardRemaining = Math.max(0, this.wardRemaining - dt);
    const config = this.definition;
    switch (config.kind) {
      case 'hunt':
        this.hunt(context);
        break;
      case 'rune':
      case 'poison':
      case 'fire':
        this.environment(context);
        break;
      case 'squad':
        this.squad(context);
        break;
      case 'siege':
        this.siege(context);
        break;
    }
    this.updateZones(dt, context);
    if (config.kind === 'rune') {
      const rune = this.zones.find((zone) => zone.kind === 'rune');
      if (this.wardRemaining > 0)
        this.setPhase(
          'counter',
          'Linh hộ đang bảo vệ',
          'Giảm 30% sát thương nhận khi lớp Linh hộ còn hiệu lực.',
          this.wardRemaining,
        );
      else if (rune) {
        this.target = { x: rune.x, y: rune.y };
        this.progress = Math.min(1, rune.charge / rules.runeCharge);
        this.setPhase(
          'active',
          'Đứng trong trận để tụ linh',
          'Giữ vị trí 3 giây để nhận Linh hộ trong 10 giây.',
          config.active - rune.elapsed,
        );
      }
    }
    return this.events;
  }
  private setPhase(
    phase: MechanicPhase,
    label: string,
    hint: string,
    remaining: number,
    sound?: string,
  ): void {
    const key = `${phase}:${label}`;
    if (key !== this.phaseKey && sound)
      this.events.push({
        type: 'cue',
        text: label,
        sound,
        duration: Math.min(4, Math.max(0.1, remaining)),
      });
    this.phaseKey = key;
    this.phase = phase;
    this.label = label;
    this.hint = hint;
    this.phaseRemaining = Math.max(0, remaining);
  }
  private rest(time: number): void {
    this.setPhase('rest', 'Đợt tiếp theo', this.definition!.description, this.nextAt - time);
  }
  private hunt(context: MechanicContext): void {
    const config = this.definition!;
    if (context.time < config.start) {
      this.rest(context.time);
      return;
    }
    const cycle = Math.floor((context.time - config.start) / config.interval);
    const age = context.time - config.start - cycle * config.interval;
    this.nextAt = config.start + (cycle + 1) * config.interval;
    if (age < config.warning)
      this.setPhase(
        'warning',
        'Tiếng gầm gọi bầy',
        'Thú triều sắp tới. Giữ một lối thoát.',
        config.warning - age,
        'boss-roar',
      );
    else if (age < config.warning + config.active) {
      this.enemySpeed = rules.huntSpeed;
      this.setPhase(
        'active',
        'Thú triều đang truy đuổi',
        'Bầy thú tăng 25% tốc chạy. Di chuyển vòng và lướt qua chỗ hở.',
        config.warning + config.active - age,
      );
    } else this.rest(context.time);
  }
  private nearby(
    context: MechanicContext,
    range: number,
    radius: number,
    angle = this.random() * Math.PI * 2,
  ): Point {
    for (let attempt = 0; attempt < 24; attempt++) {
      const a = angle + attempt * 0.71;
      const p = {
        x: Math.max(
          this.bounds.minX + radius,
          Math.min(this.bounds.maxX - radius, context.position.x + Math.cos(a) * range),
        ),
        y: Math.max(
          this.bounds.minY + radius,
          Math.min(this.bounds.maxY - radius, context.position.y + Math.sin(a) * range),
        ),
      };
      if (
        context.obstacles.every(
          (obstacle) => Math.hypot(p.x - obstacle.x, p.y - obstacle.y) > radius + obstacle.radius,
        )
      )
        return p;
    }
    return { ...context.position };
  }
  private zone(
    kind: StageZone['kind'],
    point: Point,
    radius: number,
    warning: number,
    duration: number,
  ): StageZone {
    const zone: StageZone = {
      ...point,
      id: ++this.sequence,
      kind,
      radius,
      warning,
      duration,
      elapsed: 0,
      velocity: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      halfLength: 0,
      gapOffset: 0,
      gapHalfWidth: 0,
      hitIn: 0,
      triggered: false,
      charge: 0,
      charged: false,
    };
    this.zones.push(zone);
    return zone;
  }
  private environment(context: MechanicContext): void {
    const config = this.definition!;
    if (context.time >= this.nextAt) {
      this.nextAt = context.time + config.interval;
      if (config.kind === 'rune') {
        this.zone(
          'rune',
          this.nearby(context, 3.2, rules.runeRadius),
          rules.runeRadius,
          0,
          config.active,
        );
        this.events.push({
          type: 'cue',
          text: 'Linh trận mở: đến vòng xanh để tụ linh.',
          sound: 'level',
        });
      } else if (config.kind === 'poison') {
        const p = this.nearby(context, 3.7, rules.poisonRadius);
        const zone = this.zone('poison', p, rules.poisonRadius, config.warning, config.active);
        const length = Math.hypot(context.position.x - p.x, context.position.y - p.y) || 1;
        zone.velocity = {
          x: ((context.position.x - p.x) / length) * rules.poisonSpeed,
          y: ((context.position.y - p.y) / length) * rules.poisonSpeed,
        };
      } else {
        const angle = (Math.floor(this.random() * 8) * Math.PI) / 4;
        const p = this.nearby(context, 4, 0.8, angle);
        const length = Math.hypot(context.position.x - p.x, context.position.y - p.y) || 1;
        const normal = {
          x: (context.position.x - p.x) / length,
          y: (context.position.y - p.y) / length,
        };
        const zone = this.zone('fire', p, rules.fireWidth, config.warning, config.active);
        zone.velocity = { x: normal.x * rules.fireSpeed, y: normal.y * rules.fireSpeed };
        zone.direction = { x: -normal.y, y: normal.x };
        zone.halfLength = rules.fireHalfLength;
        zone.gapHalfWidth = rules.fireGapHalfWidth;
        zone.gapOffset =
          [2.4, -2.4, 0].find((offset) => {
            const p = {
              x: context.position.x + zone.direction.x * offset,
              y: context.position.y + zone.direction.y * offset,
            };
            return (
              p.x > this.bounds.minX + 0.5 &&
              p.x < this.bounds.maxX - 0.5 &&
              p.y > this.bounds.minY + 0.5 &&
              p.y < this.bounds.maxY - 0.5
            );
          }) ?? 0;
      }
    }
    const warning = this.zones.find((zone) => zone.elapsed < zone.warning);
    const active = this.zones.find((zone) => zone.elapsed >= zone.warning);
    if (warning)
      this.setPhase(
        'warning',
        config.kind === 'fire' ? 'Hỏa triều sắp quét qua' : 'Độc chướng đang tụ',
        config.description,
        warning.warning - warning.elapsed,
        config.kind === 'fire' ? 'cast-fire' : 'enemy-arrow',
      );
    else if (active)
      this.setPhase(
        'active',
        config.kind === 'fire'
          ? 'Tìm khe trống trong hỏa triều'
          : config.kind === 'poison'
            ? 'Độc chướng đang trôi'
            : 'Linh trận đang mở',
        config.description,
        active.warning + active.duration - active.elapsed,
      );
    else this.rest(context.time);
  }
  private squad(context: MechanicContext): void {
    const leader = context.enemies.find((enemy) => enemy.id === this.leaderId && !enemy.dead);
    if (leader) {
      this.target = { x: leader.x, y: leader.y };
      this.progress = Math.max(0, leader.hp / leader.maxHp);
      this.setPhase(
        'active',
        'Hạ đội trưởng có cờ vàng',
        'Đội trưởng che chở đồng đội trong 5 đơn vị. Áp sát hoặc vòng qua tuyến hộ vệ.',
        0,
      );
      return;
    }
    if (this.leaderId !== null) {
      this.leaderId = null;
      this.squadBrokenUntil = context.time + 5;
      this.events.push({
        type: 'cue',
        text: 'Hộ trận tan vỡ! Đội quân mất che chở.',
        sound: 'level',
      });
    }
    if (context.time < this.squadBrokenUntil) {
      this.setPhase(
        'counter',
        'Hộ trận đã tan vỡ',
        'Đồng đội của đội trưởng đã mất lớp giảm sát thương.',
        this.squadBrokenUntil - context.time,
      );
      return;
    }
    if (context.time >= this.nextAt && this.squadReadyAt === null)
      this.squadReadyAt = context.time + this.definition!.warning;
    if (this.squadReadyAt !== null) {
      this.setPhase(
        'warning',
        'Tổ đội thế gia đang tiến vào',
        'Hộ vệ dẫn đường, kiếm khách xung kích, pháp tu yểm trợ. Tìm cờ vàng.',
        this.squadReadyAt - context.time,
        'enemy-blade',
      );
      if (context.time >= this.squadReadyAt && !this.squadRequested) {
        this.squadRequested = true;
        this.events.push({ type: 'squad' });
      }
    } else this.rest(context.time);
  }
  private siege(context: MechanicContext): void {
    const config = this.definition!;
    if (context.time < config.start) {
      this.rest(context.time);
      return;
    }
    const cycle = Math.floor((context.time - config.start) / config.interval);
    const age = context.time - config.start - cycle * config.interval;
    this.nextAt = config.start + (cycle + 1) * config.interval;
    const assaultEnd = config.warning + config.active;
    const stormEnd = assaultEnd + rules.siegeStorm;
    const counterEnd = stormEnd + rules.siegeCounter;
    if (age < config.warning)
      this.setPhase(
        'warning',
        'Hắc Triều chuẩn bị công kích',
        'Chuẩn bị giữ đường rút: xung kích → hắc ấn → phản công.',
        config.warning - age,
        'boss-roar',
      );
    else if (age < assaultEnd) {
      this.enemySpeed = rules.siegeSpeed;
      this.setPhase(
        'active',
        'Đợt 1 · Xung kích',
        'Địch tăng 15% tốc chạy. Giữ khoảng cách với ma vệ.',
        assaultEnd - age,
      );
    } else if (age < stormEnd) {
      this.setPhase(
        'active',
        'Đợt 2 · Hắc ấn truy kích',
        'Hắc ấn khóa vị trí cũ. Rời vòng tím trước khi ấn nổ.',
        stormEnd - age,
        'cast-chain-lightning',
      );
      if (
        context.time >= this.nextDarkAt &&
        stormEnd - age > rules.darkWarning + rules.darkDuration
      ) {
        this.nextDarkAt = context.time + rules.darkInterval;
        this.zone(
          'dark',
          context.position,
          rules.darkRadius,
          rules.darkWarning,
          rules.darkDuration,
        );
        this.zone(
          'dark',
          this.nearby(context, 3.8, rules.darkRadius),
          rules.darkRadius,
          rules.darkWarning,
          rules.darkDuration,
        );
      }
    } else if (age < counterEnd) {
      this.enemyVulnerability = rules.siegeVulnerability;
      this.setPhase(
        'counter',
        'Đợt 3 · Cửa sổ phản công',
        'Hắc Triều lộ sơ hở: địch nhận thêm 30% sát thương.',
        counterEnd - age,
        'level',
      );
    } else this.rest(context.time);
  }
  private updateZones(dt: number, context: MechanicContext): void {
    for (const zone of this.zones) {
      const before = zone.elapsed;
      zone.elapsed += dt;
      const end = zone.warning + zone.duration;
      const activeDt =
        Math.max(0, Math.min(end, zone.elapsed) - zone.warning) -
        Math.max(0, Math.min(end, before) - zone.warning);
      if (activeDt <= 0) continue;
      zone.x = Math.max(
        this.bounds.minX + zone.radius,
        Math.min(this.bounds.maxX - zone.radius, zone.x + zone.velocity.x * activeDt),
      );
      zone.y = Math.max(
        this.bounds.minY + zone.radius,
        Math.min(this.bounds.maxY - zone.radius, zone.y + zone.velocity.y * activeDt),
      );
      if (zone.kind === 'rune') {
        if (zone.charged) continue;
        const inside =
          Math.hypot(context.position.x - zone.x, context.position.y - zone.y) <=
          zone.radius - context.radius;
        zone.charge = Math.max(
          0,
          Math.min(rules.runeCharge, zone.charge + (inside ? dt : -dt * 0.5)),
        );
        if (zone.charge >= rules.runeCharge - 1e-6) {
          zone.charged = true;
          zone.elapsed = zone.warning + zone.duration - 1.5;
          this.wardRemaining = rules.wardDuration;
          this.events.push({
            type: 'cue',
            text: 'Linh hộ thành hình: giảm 30% sát thương nhận trong 10 giây.',
            sound: 'level',
          });
        }
        continue;
      }
      zone.hitIn = Math.max(0, zone.hitIn - activeDt);
      if (zone.kind === 'dark' && zone.triggered) continue;
      if (insideStageZone(zone, context.position, context.radius) && zone.hitIn <= 0)
        this.events.push({
          type: 'damage',
          hazard: zone.kind,
          fraction:
            zone.kind === 'poison'
              ? rules.poisonDamage
              : zone.kind === 'fire'
                ? rules.fireDamage
                : rules.darkDamage,
        });
      if (zone.kind === 'dark') zone.triggered = true;
      else if (zone.hitIn <= 0)
        zone.hitIn = zone.kind === 'poison' ? rules.poisonHitEvery : rules.fireHitEvery;
    }
    this.zones = this.zones.filter((zone) => zone.elapsed < zone.warning + zone.duration);
  }
}

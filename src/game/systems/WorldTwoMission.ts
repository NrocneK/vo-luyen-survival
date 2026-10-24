import type { StageDef } from '../../data/stages';
import type { EnemyState } from '../../shared/models';
import type { Point } from '../../shared/types';
import type { MissionNode, MissionView } from '../../shared/worldTwo';
import type { IncomingSource } from '../../shared/combatSummary';
import { enemies as definitions } from '../../data/enemies.ts';
import type { EnemyDef } from '../../data/enemies';
import { techniqueHit, type TechniqueArea } from '../math/techniqueGeometry.ts';

export interface MissionContext {
  time: number;
  position: Point;
  enemies: EnemyState[];
  active: () => boolean;
  spawn: (type: string, point?: Point) => EnemyState | null;
  say: (text: string) => void;
  hurt: (damage: number, source: IncomingSource) => void;
  heal: (fraction: number) => void;
  fail: () => void;
}
export interface MissionHazard {
  id: number;
  area: TechniqueArea;
  kind: 'ice' | 'soul' | 'bone' | 'demon';
  warning: number;
  remaining: number;
  damage: number;
  hit: boolean;
}
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const positions = [
  { x: -8, y: -5 },
  { x: 8, y: -5 },
  { x: 0, y: 9 },
  { x: 0, y: -12 },
];
const route = [
  { x: -10, y: 10 },
  { x: 0, y: 0 },
  { x: 9, y: -9 },
  { x: 18, y: -18 },
  { x: 22, y: -22 },
];

/** Mục tiêu/chặng nhiệm vụ là nguồn duy nhất của tiến trình, HUD và hình học trong màn mới. */
export class WorldTwoMission {
  readonly stage: StageDef;
  readonly nodes: MissionNode[];
  readonly hazards: MissionHazard[] = [];
  readonly nodeActors = new Map<number, number>();
  protected: MissionView['protected'];
  phase = 1;
  checkpoint = 0;
  bossReady = false;
  completed = false;
  bloodStoneUsed = false;
  private activated = new Set<number>();
  private waveIds: number[] = [];
  private wave = -1;
  private started = false;
  private fighting = false;
  private phaseAt = 0;
  private nextHazard = 4;
  private routeIndex = 1;
  private protectedHitAt = -1;
  private abilityReady = 0;
  private flameUntil = 0;
  private healedTree = false;
  private sequence = 0;
  private ctx: MissionContext | null = null;
  constructor(stage: StageDef) {
    this.stage = stage;
    const def = stage.mission!;
    this.nodes = Array.from({ length: def.targets }, (_, i) => ({
      ...positions[i % 4],
      id: i,
      name: this.nodeName(i),
      progress: 0,
      completed: false,
    }));
    if (def.kind === 'escort')
      this.nodes.forEach((node, i) =>
        Object.assign(node, route[i + 1], { name: `Lối di tích ${i + 1}` }),
      );
    if (def.kind === 'defend' || def.kind === 'release')
      this.nodes.forEach((node) => {
        node.x = 0;
        node.y = 0;
      });
    if (def.kind === 'prison')
      this.nodes.push({ x: 0, y: -11, id: 3, name: 'Thần Thụ', progress: 0, completed: false });
    this.protected = def.protectedName
      ? {
          x: def.kind === 'escort' ? -10 : 0,
          y: def.kind === 'escort' ? 10 : 0,
          name: def.protectedName,
          hp: def.protectedHp!,
          maxHp: def.protectedHp!,
        }
      : null;
    this.bossReady = def.kind === 'duel' || def.kind === 'final';
  }
  private nodeName(index: number): string {
    const k = this.stage.mission!.kind;
    const label =
      k === 'rescue'
        ? 'Đồng môn bị khống chế'
        : k === 'breakout'
          ? 'Phong ấn Cổ Ma'
          : k === 'purify'
            ? 'Ổ trùng'
            : k === 'capture'
              ? 'Điểm linh khí'
              : k === 'trial'
                ? 'Mắt băng trận'
                : k === 'prison'
                  ? 'Nhóm tù nhân'
                  : k === 'tomb'
                    ? 'Thần kỹ khảo nghiệm'
                    : k === 'defend'
                      ? 'Đợt vây hãm'
                      : k === 'release'
                        ? 'Mạch giải phong'
                        : k === 'formation'
                          ? 'Nút Thông Huyền Trụ'
                          : 'Điểm quân xâm nhập';
    return `${label} ${index + 1}`;
  }
  get objectiveProgress(): number {
    return this.nodes.length
      ? this.nodes.reduce((n, node) => n + (node.completed ? 1 : node.progress), 0) /
          this.nodes.length
      : this.bossReady
        ? 1
        : 0;
  }
  isNode(id: number): boolean {
    return [...this.nodeActors.values()].includes(id);
  }
  targetFor(enemy: EnemyState, player: Point): Point {
    return this.protected && enemy.id % 3 === 0 && distance(enemy, this.protected) < 10
      ? this.protected
      : player;
  }
  damageProtected(damage: number, point: Point, radius: number, time: number): void {
    const unit = this.protected;
    if (!unit || distance(unit, point) > radius + 0.4 || time - this.protectedHitAt < 0.4) return;
    this.protectedHitAt = time;
    unit.hp = Math.max(0, unit.hp - damage);
    if (unit.hp <= 0) this.ctx?.fail();
  }
  damageLimit(enemy: EnemyState, amount: number): number {
    if (enemy.type !== this.stage.bossId) return amount;
    if (this.stage.mission!.kind === 'escort') return 0;
    if (this.stage.mission!.kind === 'final') {
      const floor =
        this.phase === 1 ? 0.67 : this.phase === 2 ? (this.bloodStoneUsed ? 0.33 : 0.34) : 0;
      if (floor) return Math.max(0, Math.min(amount, enemy.hp - enemy.maxHp * floor));
    } else if (this.phase === 1) return Math.max(0, Math.min(amount, enemy.hp - enemy.maxHp * 0.5));
    return amount;
  }
  vulnerability(time: number): number {
    const kind = this.stage.mission!.kind;
    if (kind === 'breakout' && this.phase === 2 && (time - this.phaseAt) % 7 < 2) return 1.3;
    if (kind === 'purify' && time < this.flameUntil) return 1.35;
    if (kind === 'invasion' && this.phase === 2 && (time - this.phaseAt) % 8 < 2.5) return 1.3;
    if (kind === 'final' && this.phase === 3 && (time - this.phaseAt) % 8 < 3) return 1.25;
    return 1;
  }
  bossPattern(base: NonNullable<EnemyDef['pattern']>): NonNullable<EnemyDef['pattern']> {
    return this.phase >= 2
      ? this.stage.mission!.kind === 'duel'
        ? 'abyss'
        : this.stage.mission!.kind === 'trial' || this.stage.mission!.kind === 'invasion'
          ? 'fire'
          : this.phase >= 3
            ? 'abyss'
            : base === 'poison'
              ? 'abyss'
              : base === 'sword'
                ? 'fire'
                : 'sword'
      : base;
  }
  private specialAction(position: Point): string {
    if (!this.fighting || distance(position, { x: 0, y: 0 }) > 1.5) return '';
    if (this.stage.mission!.kind === 'final' && this.phase === 2 && !this.bloodStoneUsed)
      return 'Dùng Huyết Tinh Thạch';
    if (
      this.stage.mission!.kind === 'purify' &&
      this.phase >= 2 &&
      (this.ctx?.time ?? 0) >= this.abilityReady
    )
      return 'Dẫn thần hồn hỏa';
    return '';
  }
  interact(position: Point): boolean {
    const ctx = this.ctx;
    if (!ctx || !ctx.active()) return false;
    const special = this.specialAction(position);
    if (special) {
      if (this.stage.mission!.kind === 'final') {
        this.bloodStoneUsed = true;
        ctx.say('Huyết Tinh Thạch chặn hấp thu huyết nhục! Tiếp tục phản công.');
      } else {
        this.flameUntil = ctx.time + 5;
        this.abilityReady = ctx.time + 8;
        ctx.say('Thần hồn hỏa áp chế đàn trùng trong 5 giây!');
      }
      return true;
    }
    if (['formation', 'defend', 'release', 'capture'].includes(this.stage.mission!.kind))
      return false;
    const node = this.nodes.find(
      (n) => !n.completed && distance(n, position) <= 1.5 && !this.activated.has(n.id),
    );
    if (!node) return false;
    if (
      this.stage.mission!.kind === 'prison' &&
      node.id === 3 &&
      this.nodes.slice(0, 3).some((n) => !n.completed)
    )
      return false;
    this.activated.add(node.id);
    if (
      this.stage.mission!.kind === 'invasion' ||
      this.stage.mission!.kind === 'rescue' ||
      this.stage.mission!.kind === 'breakout'
    ) {
      for (let i = 0; i < 3; i++)
        ctx.spawn(`thong-huyen-vo-gia-${this.stage.stageIndex}`, {
          x: node.x + Math.cos(i * 2.1) * 3,
          y: node.y + Math.sin(i * 2.1) * 3,
        });
    }
    ctx.say(`${node.name}: giữ vị trí trong vùng sáng.`);
    return true;
  }
  tick(dt: number, ctx: MissionContext): void {
    this.ctx = ctx;
    const def = this.stage.mission!,
      kind = def.kind;
    if (!this.started) {
      this.started = true;
      if (kind === 'formation')
        for (const node of this.nodes) {
          const enemy = ctx.spawn('thong-huyen-nut-tran', node);
          if (enemy) this.nodeActors.set(node.id, enemy.id);
        }
    }
    if (kind === 'formation')
      for (const node of this.nodes) {
        const enemy = ctx.enemies.find((e) => e.id === this.nodeActors.get(node.id));
        node.progress = enemy ? 1 - Math.max(0, enemy.hp) / enemy.maxHp : node.progress;
        if (enemy?.dead || (this.nodeActors.has(node.id) && !enemy)) {
          node.completed = true;
          node.progress = 1;
        }
      }
    else if (kind === 'defend' || kind === 'release') {
      const index = this.nodes.findIndex((n) => !n.completed);
      if (index >= 0) {
        const node = this.nodes[index];
        if (index !== this.wave) {
          this.wave = index;
          this.waveIds = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const enemy = ctx.spawn(`thong-huyen-vo-gia-${this.stage.stageIndex}`, {
              x: Math.cos(angle) * 8,
              y: Math.sin(angle) * 8,
            });
            if (enemy) this.waveIds.push(enemy.id);
          }
          const elite = ctx.spawn(`thong-huyen-tinh-anh-${this.stage.stageIndex}`, { x: 9, y: 1 });
          if (elite) this.waveIds.push(elite.id);
          ctx.say(`${node.name}: bảo vệ ${this.protected?.name}.`);
        }
        if (kind === 'defend' || distance(ctx.position, this.protected ?? { x: 0, y: 0 }) <= 3)
          node.progress = Math.min(0.99, node.progress + dt / def.charge);
        if (
          node.progress >= 0.99 &&
          !this.waveIds.some((id) => ctx.enemies.some((e) => e.id === id && !e.dead))
        ) {
          node.completed = true;
          node.progress = 1;
        }
      }
    } else if (kind !== 'duel' && kind !== 'final')
      for (const node of this.nodes) {
        if (node.completed) continue;
        if (kind === 'capture') {
          node.x = positions[node.id].x + Math.sin(ctx.time * 0.23 + node.id) * 2;
          node.y = positions[node.id].y + Math.cos(ctx.time * 0.23 + node.id) * 2;
        }
        if (kind === 'prison' && node.id === 3 && this.nodes.slice(0, 3).some((n) => !n.completed))
          continue;
        const active = kind === 'capture' || this.activated.has(node.id);
        const contested =
          ['capture', 'invasion', 'rescue', 'breakout'].includes(kind) &&
          ctx.enemies.some((e) => !e.dead && distance(e, node) < 2.5);
        if (active && distance(ctx.position, node) <= 2.8 && !contested)
          node.progress = Math.min(
            1,
            node.progress + dt / (kind === 'prison' && node.id === 3 ? 1 : def.charge),
          );
        if (node.progress >= 1) {
          node.completed = true;
          ctx.say(`${node.name} hoàn tất.`);
          if (kind === 'prison' && node.id === 3 && !this.healedTree) {
            this.healedTree = true;
            ctx.heal(0.25);
            ctx.say('Thần Thụ tiếp sức. Phá vòng truy đuổi để rời Dương tộc.');
          }
        }
      }
    if (kind === 'escort' && this.protected) {
      const unit = this.protected;
      const gate = this.nodes[this.routeIndex - 1];
      const destination = route[this.routeIndex];
      if (destination && distance(ctx.position, unit) <= 6 && (gate?.completed || !gate)) {
        const d = distance(unit, destination);
        if (d < 0.12) this.routeIndex++;
        else {
          const step = Math.min(d, dt * 1.2);
          unit.x += ((destination.x - unit.x) / d) * step;
          unit.y += ((destination.y - unit.y) / d) * step;
        }
      }
      if (this.routeIndex >= route.length) {
        this.completed = true;
        ctx.say('An Linh Nhi đã thoát khỏi di tích!');
      }
      this.bossReady = this.nodes.some((n) => n.completed);
    } else if (this.nodes.length && this.nodes.every((n) => n.completed)) {
      this.bossReady = true;
      if (kind === 'release') this.protected = null;
    }
    this.checkpoint = Math.max(
      this.checkpoint,
      Math.min(3, this.nodes.filter((n) => n.completed).length),
    );
    const boss = ctx.enemies.find((e) => e.type === this.stage.bossId && !e.dead);
    if (boss) {
      if (!this.fighting) {
        this.fighting = true;
        this.phaseAt = ctx.time;
        ctx.say(`${definitions[boss.type].name} · Pha 1/${def.bossPhases}`);
      }
      const fraction = boss.hp / boss.maxHp;
      const phase =
        kind === 'escort'
          ? this.nodes.filter((n) => n.completed).length >= 2
            ? 2
            : 1
          : def.bossPhases === 3
            ? fraction <= 0.33 && this.bloodStoneUsed
              ? 3
              : fraction <= 0.67
                ? 2
                : 1
            : fraction <= 0.5
              ? 2
              : 1;
      if (phase > this.phase) {
        this.phase = phase;
        this.phaseAt = ctx.time;
        ctx.say(
          `${definitions[boss.type].name} · Pha ${phase}/${def.bossPhases}${kind === 'final' && phase === 2 ? ' — về tâm trận dùng Huyết Tinh Thạch!' : kind === 'invasion' ? ' — Long Hoàng ứng hiện, phản công trong khe băng!' : ''}`,
        );
      }
      if (kind === 'duel' || kind === 'final')
        this.checkpoint = Math.max(
          this.checkpoint,
          fraction <= 0.25 ? 3 : fraction <= 0.5 ? 2 : fraction <= 0.75 ? 1 : 0,
        );
    }
    if (
      (kind === 'trial' ||
        kind === 'tomb' ||
        kind === 'formation' ||
        (this.fighting && this.phase >= 2 && kind !== 'duel')) &&
      ctx.time >= this.nextHazard
    ) {
      this.nextHazard = ctx.time + (kind === 'final' ? 5 : 7);
      const beam = kind === 'formation',
        angle = (ctx.time * 0.7) % (Math.PI * 2);
      const area: TechniqueArea = {
        x: beam ? 0 : ctx.position.x,
        y: beam ? 0 : ctx.position.y,
        shape: beam ? 'beam' : 'disc',
        angle,
        radius: beam ? 0 : 1.8,
        length: beam ? 12 : 0,
        width: beam ? 1.3 : 0,
        spread: 0,
      };
      this.hazards.push({
        id: ++this.sequence,
        area,
        kind:
          kind === 'trial' || kind === 'invasion'
            ? 'ice'
            : kind === 'final'
              ? 'bone'
              : kind === 'formation'
                ? 'soul'
                : 'demon',
        warning: 0.9,
        remaining: 1.8,
        damage: definitions[this.stage.bossId].damage * 0.7,
        hit: false,
      });
      if (kind === 'final' && this.phase === 2 && !this.bloodStoneUsed && boss)
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * 0.02);
    }
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hazard = this.hazards[i];
      hazard.warning -= dt;
      if (hazard.warning <= 0) {
        hazard.remaining -= dt;
        if (!hazard.hit) {
          hazard.hit = true;
          if (techniqueHit(hazard.area, ctx.position, 0.21))
            ctx.hurt(hazard.damage, { kind: 'hazard', hazard: hazard.kind });
          if (this.protected && techniqueHit(hazard.area, this.protected, 0.4))
            this.damageProtected(hazard.damage, this.protected, 0, ctx.time);
          if (!ctx.active()) return;
        }
      }
      if (hazard.remaining <= 0) this.hazards.splice(i, 1);
    }
  }
  bossDefeated(): boolean {
    if (this.stage.mission!.kind === 'escort') return false;
    this.completed = true;
    return true;
  }
  victoryMessage(): string {
    const kind = this.stage.mission!.kind;
    return kind === 'trial'
      ? 'Thiên Nguyệt thu thế. Đã vượt khảo nghiệm Băng Tông.'
      : kind === 'tomb'
        ? 'Tàn ảnh thu thần kỹ. Đã lĩnh ngộ truyền thừa Thánh Lăng.'
        : kind === 'defend'
          ? 'Trương Ngạo rút lui. Tâm hộ trận vẫn vững.'
          : kind === 'escort'
            ? 'An Linh Nhi thoát khỏi Nam Thánh Cô. Di tích đã ở lại phía sau.'
            : kind === 'final'
              ? 'Liên quân phá cốt trận. Thủ lĩnh Cốt tộc đã bị đánh bại.'
              : 'Đã hoàn thành nhiệm vụ và vượt ải.';
  }
  view(position: Point): MissionView {
    const special = this.specialAction(position),
      node = this.nodes.find(
        (n) => !n.completed && distance(n, position) <= 1.5 && !this.activated.has(n.id),
      );
    const kind = this.stage.mission!.kind;
    const boss = this.ctx?.enemies.find((e) => e.type === this.stage.bossId && !e.dead);
    const progress = this.completed
      ? 1
      : ['duel', 'final'].includes(kind)
        ? boss
          ? 1 - boss.hp / boss.maxHp
          : 0
        : this.objectiveProgress;
    return {
      title: this.stage.name,
      hint:
        this.phase === 2 && kind === 'final' && !this.bloodStoneUsed
          ? 'Về tâm trận (0,0), bấm E dùng Huyết Tinh Thạch để chặn hấp thu.'
          : kind === 'purify' && this.fighting && this.phase >= 2
            ? 'Thần hồn hỏa ở tâm trận: bấm E để áp chế đàn trùng.'
            : kind === 'escort'
              ? 'Mở các lối, ở cách An Linh Nhi tối đa 6 đơn vị để dẫn nàng tới cửa thoát.'
              : this.fighting
                ? `Giao tranh pha ${this.phase}/${this.stage.mission!.bossPhases}`
                : kind === 'release'
                  ? 'Ở trong vòng 3 đơn vị quanh điểm giải phong để dẫn trận; diệt từng đợt xâm nhập.'
                  : kind === 'defend'
                    ? 'Bảo vệ tâm hộ trận và quét sạch từng đợt vây hãm.'
                    : kind === 'capture'
                      ? 'Giữ các điểm linh khí di chuyển; đẩy đối thủ ra khỏi vùng để tiếp tục thu.'
                      : kind === 'formation'
                        ? 'Phá bốn nút trụ, né luồng quá tải rồi đối mặt tâm trận.'
                        : 'Đến các dấu nhiệm vụ, bấm E rồi giữ vùng sáng; quét hộ vệ đang tranh chấp.',
      progress,
      nodes: this.nodes.map((n) => ({ ...n })),
      phase: this.phase,
      checkpoint: this.checkpoint,
      protected: this.protected ? { ...this.protected } : null,
      interactable:
        !!special || (!!node && !['formation', 'defend', 'release', 'capture'].includes(kind)),
      action: special || (node ? `Tương tác: ${node.name}` : ''),
      bloodStoneUsed: this.bloodStoneUsed,
    };
  }
  clear(): void {
    this.hazards.length = 0;
    this.ctx = null;
  }
}

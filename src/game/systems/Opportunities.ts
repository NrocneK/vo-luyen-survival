import {
  opportunityDefinitions as definitions,
  opportunityRules as rules,
  opportunityStages,
  opportunityReward,
  opportunityRewardText,
} from '../../data/opportunities.ts';
import type {
  OpportunityKind,
  OpportunityState,
  OpportunityReward,
  OpportunityView,
} from '../../shared/opportunities';
import type { Point, CircleObstacle } from '../../shared/types';
import type { EnemyState } from '../../shared/models';
import type { StageDef } from '../../data/stages';

export interface OpportunityContext {
  time: number;
  position: Point;
  enemies: readonly EnemyState[];
  progress?: number;
}
export type OpportunityEvent =
  | { type: 'spawn'; encounter: OpportunityState }
  | { type: 'cleanup'; id: number; guards: number[] }
  | { type: 'reward'; reward: OpportunityReward; name: string }
  | { type: 'cue'; text: string; sound: string };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Cơ duyên dùng RNG riêng, giới hạn bốn lần/lượt; không ghi Profile hoặc tự nhận thưởng. */
export class Opportunities {
  active: OpportunityState | null = null;
  completed = 0;
  missed = 0;
  readonly schedule: { at: number; kind: OpportunityKind }[];
  private next = 0;
  private sequence = 0;
  readonly stage: StageDef;
  private obstacles: readonly CircleObstacle[];
  private random: () => number;
  constructor(stage: StageDef, obstacles: readonly CircleObstacle[], random: () => number) {
    this.stage = stage;
    this.obstacles = obstacles;
    this.random = random;
    const kinds: OpportunityKind[] = ['cache', 'herb', 'elite', 'trial'];
    for (let i = kinds.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
    }
    this.schedule =
      opportunityStages[stage.id] && stage.maxEnemies > 0
        ? rules.timings.map((fraction, i) => ({
            at: (fraction + (random() - 0.5) * 2 * rules.jitter) * stage.duration,
            kind: kinds[i],
          }))
        : [];
  }
  view(context: OpportunityContext): OpportunityView | null {
    const a = this.active;
    if (!a) return null;
    const def = definitions[a.kind],
      d = distance(context.position, a);
    return {
      id: a.id,
      x: a.x,
      y: a.y,
      kind: a.kind,
      phase: a.phase,
      name: def.name,
      hint: a.message || def.hint,
      reward: opportunityRewardText(a.reward),
      remaining: Math.max(0, a.deadline - context.time),
      progress:
        a.kind === 'trial'
          ? a.progress / rules.trialCharge
          : a.guards.length
            ? 1 -
              a.guards.filter((id) => context.enemies.some((e) => e.id === id && !e.dead)).length /
                a.guards.length
            : 0,
      enemies: a.guards.filter((id) => context.enemies.some((e) => e.id === id && !e.dead)).length,
      distance: d,
      interactable: (a.phase === 'offered' || a.phase === 'claimable') && d <= rules.interactRadius,
      action: a.phase === 'claimable' ? 'Nhận chiến lợi phẩm' : def.action,
    };
  }
  tick(dt: number, context: OpportunityContext): OpportunityEvent[] {
    const scheduleTime = context.progress ?? context.time;
    if (scheduleTime >= this.stage.duration) return this.clear();
    const a = this.active;
    if (!a) {
      const next = this.schedule[this.next];
      if (!next || scheduleTime < next.at || scheduleTime > this.stage.duration - 35) return [];
      const point = this.place(context.position);
      if (!point) return [];
      this.next++;
      this.active = {
        ...point,
        id: ++this.sequence,
        kind: next.kind,
        phase: 'offered',
        deadline: context.time + rules.offerDuration,
        progress: 0,
        guards: [],
        reward: opportunityReward(next.kind, this.stage, this.random),
        message: '',
      };
      return [
        {
          type: 'cue',
          text: `Cơ duyên xuất hiện: ${definitions[next.kind].name} · xem dấu ✦ trên bản đồ nhỏ`,
          sound: 'ui',
        },
      ];
    }
    if (a.phase === 'completed' || a.phase === 'expired') {
      if (context.time >= a.deadline) this.active = null;
      return [];
    }
    if (context.time >= a.deadline) {
      a.phase = 'expired';
      a.message = 'Cơ duyên đã khép lại · không mất tài nguyên.';
      a.deadline = context.time + rules.resultDuration;
      this.missed++;
      return [{ type: 'cleanup', id: a.id, guards: [...a.guards] }];
    }
    if (a.phase === 'active') {
      if (a.kind === 'trial')
        a.progress = Math.max(
          0,
          Math.min(
            rules.trialCharge,
            a.progress + (distance(context.position, a) <= rules.trialRadius ? dt : -dt * 0.5),
          ),
        );
      const done =
        a.kind === 'trial'
          ? a.progress >= rules.trialCharge - 1e-7
          : a.guards.length > 0 &&
            a.guards.every((id) => !context.enemies.some((e) => e.id === id && !e.dead));
      if (done) {
        a.phase = 'claimable';
        a.deadline = context.time + rules.claimDuration;
        a.message = 'Đã hoàn thành · trở lại dấu cơ duyên, bấm E nhận thưởng.';
        return [
          { type: 'cleanup', id: a.id, guards: [...a.guards] },
          {
            type: 'cue',
            text: 'Cơ duyên hoàn thành · quay lại nhận chiến lợi phẩm',
            sound: 'level',
          },
        ];
      }
    }
    return [];
  }
  interact(context: OpportunityContext): OpportunityEvent[] {
    const a = this.active;
    if (
      !a ||
      context.time >= a.deadline ||
      !this.view(context)?.interactable ||
      context.time >= this.stage.duration
    )
      return [];
    if (a.phase === 'claimable' || a.kind === 'herb') {
      a.phase = 'completed';
      a.deadline = context.time + rules.resultDuration;
      a.message = 'Đã nhận · chiến lợi phẩm tạm giữ đến cuối lượt.';
      this.completed++;
      return [
        { type: 'reward', reward: structuredClone(a.reward), name: definitions[a.kind].name },
      ];
    }
    return [{ type: 'spawn', encounter: a }];
  }
  registerGuards(ids: number[], time: number): void {
    const a = this.active;
    if (!a || a.phase !== 'offered') return;
    if (!ids.length) {
      a.message = 'Chưa đủ khoảng trống để mở cơ duyên. Di chuyển bớt địch rồi thử lại.';
      return;
    }
    a.guards = [...ids];
    a.phase = 'active';
    a.deadline = time + (a.kind === 'trial' ? rules.trialDuration : rules.combatDuration);
    a.message = '';
  }
  clear(): OpportunityEvent[] {
    const a = this.active;
    this.active = null;
    this.next = this.schedule.length;
    if (a && a.phase !== 'completed' && a.phase !== 'expired') this.missed++;
    return a ? [{ type: 'cleanup', id: a.id, guards: [...a.guards] }] : [];
  }
  private place(player: Point): Point | null {
    const b = this.stage.bounds,
      margin = 4;
    for (let i = 0; i < 48; i++) {
      const angle = this.random() * Math.PI * 2,
        r = 6 + this.random() * 2;
      const p = {
        x: Math.max(b.minX + margin, Math.min(b.maxX - margin, player.x + Math.cos(angle) * r)),
        y: Math.max(b.minY + margin, Math.min(b.maxY - margin, player.y + Math.sin(angle) * r)),
      };
      if (
        distance(p, player) >= 4 &&
        this.obstacles.every((o) => distance(p, o) > o.radius + margin)
      )
        return p;
    }
    return null;
  }
}

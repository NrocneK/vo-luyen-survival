import type {
  CombatSummary,
  DamageOrigin,
  DamageRow,
  IncomingSource,
  ReceivedHit,
} from '../../shared/combatSummary';

/** Chỉ ghi nhận HP thực mất; không gieo RNG, không tham gia tính sát thương. */
export class RunStatistics {
  private rows = new Map<string, DamageRow>();
  private damageTaken = 0;
  private recentHits: ReceivedHit[] = [];
  private lethalHit: ReceivedHit | null = null;

  dealt(origin: DamageOrigin, hpBefore: number, amount: number): void {
    const damage = Math.max(0, Math.min(hpBefore, amount));
    if (!Number.isFinite(damage) || damage <= 0) return;
    const rank = origin.rank ?? 1;
    const awakened = !origin.id.startsWith('pet-') && rank >= 6;
    const key = `${origin.id}:${awakened ? 'awakened' : 'base'}`;
    const row = this.rows.get(key) ?? { id: origin.id, rank, awakened, damage: 0, kills: 0 };
    row.rank = Math.max(row.rank, rank);
    row.damage += damage;
    if (amount >= hpBefore) row.kills++;
    this.rows.set(key, row);
  }

  received(time: number, hpBefore: number, hpAfter: number, source: IncomingSource): void {
    const damage = hpBefore - hpAfter;
    if (!Number.isFinite(damage) || damage <= 0) return;
    const hit: ReceivedHit = { time, damage, hpBefore, hpAfter, source: { ...source } };
    this.damageTaken += damage;
    this.recentHits = this.recentHits.filter((entry) => time - entry.time <= 6);
    this.recentHits.push(hit);
    this.recentHits = this.recentHits.slice(-6);
    if (hpAfter <= 0) this.lethalHit = hit;
  }

  snapshot(time: number): CombatSummary {
    const copyHit = (hit: ReceivedHit) =>
      Object.freeze({ ...hit, source: Object.freeze({ ...hit.source }) });
    const sources = [...this.rows.values()]
      .sort((a, b) => b.damage - a.damage || a.id.localeCompare(b.id))
      .map((row) => Object.freeze({ ...row }));
    return Object.freeze({
      damageDealt: sources.reduce((sum, row) => sum + row.damage, 0),
      damageTaken: this.damageTaken,
      sources: Object.freeze(sources),
      recentHits: Object.freeze(this.recentHits.filter((hit) => time - hit.time <= 6).map(copyHit)),
      lethalHit: this.lethalHit ? copyHit(this.lethalHit) : null,
    });
  }
}

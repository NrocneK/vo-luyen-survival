export interface DamageOrigin {
  id: string;
  rank?: number;
}

export type IncomingSource =
  | {
      kind: 'enemy';
      enemyType: string;
      attack: number;
      delivery: 'melee' | 'charge' | 'fan' | 'ring';
      effect: string;
    }
  | { kind: 'hazard'; hazard: 'poison' | 'fire' | 'dark' | 'ice' | 'soul' | 'bone' | 'demon' }
  | { kind: 'unknown' };

export interface DamageRow {
  id: string;
  rank: number;
  awakened: boolean;
  damage: number;
  kills: number;
}

export interface ReceivedHit {
  time: number;
  damage: number;
  hpBefore: number;
  hpAfter: number;
  source: IncomingSource;
}

export interface CombatSummary {
  readonly damageDealt: number;
  readonly damageTaken: number;
  readonly sources: readonly Readonly<DamageRow>[];
  readonly recentHits: readonly Readonly<ReceivedHit>[];
  readonly lethalHit: Readonly<ReceivedHit> | null;
}

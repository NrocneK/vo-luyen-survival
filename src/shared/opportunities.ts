import type { Point } from './types';
import type { Loot } from './models';

export type OpportunityKind = 'cache' | 'herb' | 'elite' | 'trial';
export type OpportunityPhase = 'offered' | 'active' | 'claimable' | 'completed' | 'expired';
export interface OpportunityReward {
  loot: Loot;
  xp: number;
  heal: number;
}
export interface OpportunityState extends Point {
  id: number;
  kind: OpportunityKind;
  phase: OpportunityPhase;
  deadline: number;
  progress: number;
  guards: number[];
  reward: OpportunityReward;
  message: string;
}
export interface OpportunityView extends Point {
  id: number;
  kind: OpportunityKind;
  phase: OpportunityPhase;
  name: string;
  hint: string;
  reward: string;
  remaining: number;
  progress: number;
  enemies: number;
  distance: number;
  interactable: boolean;
  action: string;
}

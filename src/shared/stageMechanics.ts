import type { Point } from './types';

export type StageMechanicKind = 'hunt' | 'rune' | 'poison' | 'fire' | 'squad' | 'siege';
export type MechanicPhase = 'rest' | 'warning' | 'active' | 'counter' | 'boss';

export interface StageZone extends Point {
  id: number;
  kind: 'rune' | 'poison' | 'fire' | 'dark';
  radius: number;
  elapsed: number;
  warning: number;
  duration: number;
  velocity: Point;
  direction: Point;
  halfLength: number;
  gapOffset: number;
  gapHalfWidth: number;
  hitIn: number;
  triggered: boolean;
  charge: number;
  charged: boolean;
}

export interface StageMechanicView {
  kind: StageMechanicKind;
  name: string;
  phase: MechanicPhase;
  label: string;
  hint: string;
  remaining: number;
  progress: number;
  target: Point | null;
  wardRemaining: number;
}

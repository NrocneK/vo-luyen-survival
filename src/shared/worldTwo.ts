import type { Point } from './types';

export type MissionKind =
  | 'rescue'
  | 'breakout'
  | 'purify'
  | 'capture'
  | 'trial'
  | 'escort'
  | 'prison'
  | 'duel'
  | 'tomb'
  | 'defend'
  | 'invasion'
  | 'release'
  | 'formation'
  | 'final';
export interface WorldTwoMissionDef {
  kind: MissionKind;
  targets: number;
  charge: number;
  bossPhases: number;
  protectedName?: string;
  protectedHp?: number;
}
export interface MissionNode extends Point {
  id: number;
  name: string;
  progress: number;
  completed: boolean;
}
export interface MissionView {
  title: string;
  hint: string;
  progress: number;
  nodes: MissionNode[];
  phase: number;
  checkpoint: number;
  protected: ({ name: string; hp: number; maxHp: number } & Point) | null;
  interactable: boolean;
  action: string;
  bloodStoneUsed: boolean;
}

import source from './hero.generated.json';
import type { Direction } from '../shared/types';

export type HeroMode = 'unarmed' | 'sword';
export type HeroAttachment = 'back' | 'chest' | 'head';
export interface HeroDirection {
  base: number[];
  layers: Record<string, number[][]>;
  attachments: Record<HeroAttachment, [number, number][]>;
  shadows: { center: [number, number]; radii: [number, number]; angle: number; alpha: number }[];
}
export interface HeroClip {
  frameSize: number;
  anchor: [number, number];
  count: number;
  durationSeconds: number;
  loop: boolean;
  impactPhase: number | null;
  locomotion: { cycleSeconds: number; worldSpeed: number } | null;
  directions: Record<Direction, HeroDirection>;
}
export interface HeroCatalogue {
  version: number;
  status: string;
  style?: 'pixel';
  pixelArt?: boolean;
  lobbyScale?: number;
  portrait?: string;
  equipmentIds?: string[];
  pixelsPerUnit: number;
  textures: { key: string; mode: HeroMode; file: string; atlas: string; size: [number, number] }[];
  frames: number[];
  animations: Record<HeroMode, Record<string, HeroClip>>;
}
export const hero = source as unknown as HeroCatalogue;

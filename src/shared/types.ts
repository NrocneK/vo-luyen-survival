export interface Point {
  x: number;
  y: number;
}
export type Direction = 'S' | 'SW' | 'W' | 'NW' | 'N' | 'NE' | 'E' | 'SE';
export type WeaponId = 'fists' | 'sword';
import type { Profile, RunView, Card, RunResult } from './models';
export type GameMode = 'menu' | 'playing' | 'paused' | 'levelup' | 'result';
export type LobbyArea = 'courtyard' | 'alchemy' | 'forge' | 'cultivate' | 'pets';
export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
export interface CircleObstacle extends Point {
  radius: number;
}
export interface AnimationData {
  frames: string[];
  frameRate: number;
  repeat: number;
}
export interface ActorAsset {
  id: string;
  name: string;
  size: number;
  origin: [number, number];
  atlas: string;
  atlasData: string;
  animations: Record<string, AnimationData>;
  walk: { worldSpeed: number; cycleSeconds: number; frames: number };
  camera: { orthoScale: number };
  attacks: { id: string; impactFrame: number; frameRate: number }[];
}
export interface MapProp {
  frame: string;
  world: [number, number];
  scale: number;
  origin: [number, number];
  collision: { shape: 'circle'; radiusWorld: number } | null;
}
export interface SceneLayout {
  dimensions: [number, number];
  pixelsPerWorldUnit: number;
  screenOrigin: [number, number];
  worldBounds: WorldBounds;
  playerSpawn: [number, number];
  props: MapProp[];
}
export interface SharedAsset {
  id: string;
  file: string;
  atlas?: string;
  type: string;
}
export interface AssetCatalogue {
  version: number;
  actors: ActorAsset[];
  sharedAssets: SharedAsset[];
  sceneLayout: SceneLayout;
}

export interface GameSnapshot {
  mode: GameMode;
  lobbyArea: LobbyArea;
  status: 'loading' | 'ready' | 'error';
  progress: number;
  weapon: WeaponId;
  position: Point;
  direction: Direction;
  area: string;
  distance: number;
  zoom: number;
  error: string | null;
  profile: Profile;
  run: RunView;
  cards: Card[];
  result: RunResult | null;
  toast: string;
  idleGained: number;
  saveOk: boolean;
}
export type GameCommand =
  | { type: 'travel'; area: LobbyArea }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'leave' }
  | { type: 'weapon'; weapon: WeaponId }
  | { type: 'card'; id: string }
  | { type: 'potion' }
  | { type: 'dash' }
  | { type: 'zoom'; zoom: number };

import type { Point, WeaponId, Direction } from './types';
import type { StageMechanicView } from './stageMechanics';
import type { AugmentId } from './augments';
import type { OpportunityView } from './opportunities';
import type { CombatSummary, IncomingSource } from './combatSummary';
import type { MissionView } from './worldTwo';

export type Resource =
  | 'linh-thao'
  | 'thiet-khoang'
  | 'da-thu'
  | 'yeu-dan'
  | 'thuc-an-sung-vat'
  | 'tinh-thach-tien-hoa'
  | 'hat-sen-dot-pha'
  | 'trung-linh-ho'
  | 'trung-thanh-dieu'
  | 'linh-tai-thong-huyen';
export type PillId = 'tu-vi-dan' | 'cuong-the-dan' | 'hoi-nguyen-dan';
export type Slot = 'weapon' | 'head' | 'body' | 'hands' | 'feet' | 'jewel' | 'relic';
export interface Stats {
  hp: number;
  damage: number;
  speed: number;
  armor: number;
  crit: number;
  pickup: number;
  regen: number;
  haste: number;
}
export interface Profile {
  version: 3;
  stone: number;
  cultivation: number;
  realm: number;
  permanentPills: number;
  worldTwoPills: number;
  relicUnlocked: boolean;
  storySeen: string[];
  resources: Record<Resource, number>;
  pills: Record<PillId, number>;
  equipment: Record<string, number>;
  equipped: Record<Slot, string | null>;
  blueprints: string[];
  pets: Record<string, { level: number; evolved: boolean }>;
  activePet: string | null;
  selectedSkills: string[];
  alchemyXp: number;
  forgeXp: number;
  wins: number;
  runs: number;
  stageProgress: Record<string, { wins: number; bestTime: number; bestKills: number }>;
  selectedStageId: string;
  lastIdleAt: number;
  totalIdle: number;
  settings: { music: boolean; sound: boolean; reducedEffects: boolean };
}
export interface Cost {
  stone?: number;
  resources?: Partial<Record<Resource, number>>;
}
export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  kind: 'attack' | 'support';
  realm: number;
  requiredStageId?: string;
  description: string;
  linked?: string;
  awakened?: string;
  effect: string;
}
export interface Card {
  id: string;
  kind: 'skill' | 'awaken' | 'stat' | 'augment';
  augment?: AugmentId;
  skill?: string;
  stat?: keyof Stats;
  name: string;
  description: string;
  icon: string;
}
export interface Loot {
  stone: number;
  cultivation: number;
  resources: Partial<Record<Resource, number>>;
  equipment: string[];
  blueprints: string[];
}
export interface RunResult {
  stageId: string;
  won: boolean;
  time: number;
  kills: number;
  level: number;
  rewards: Loot;
  raw: Loot;
  seed: number;
  reason: string;
  firstClearRewards?: Loot;
  newStageUnlocked?: string;
  settled?: boolean;
  opportunities?: { completed: number; missed: number };
  outcome?: 'victory' | 'defeat' | 'retreat' | 'mission-failed';
  combat?: CombatSummary;
}
export interface EnemyState extends Point {
  id: number;
  type: string;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  damage: number;
  facing: Direction;
  combo: number;
  attack: number;
  attackTime: number;
  attackDuration: number;
  impactAt: number;
  impacted: boolean;
  cooldown: number;
  target: Point;
  dead: boolean;
  deathTime: number;
  hitTime: number;
  /** Thời gian hiện hình: quái tại biên đang thấy phải báo trước, chưa được xuất đòn. */
  spawnGrace?: number;
  spawnTime?: number;
  squadId?: number;
  commander?: boolean;
  opportunityId?: number;
}
export interface Drop extends Point {
  id: number;
  kind: 'xp' | 'heal' | 'stone' | Resource;
  value: number;
}
export interface Projectile extends Point {
  id: number;
  velocity: Point;
  damage: number;
  radius: number;
  life: number;
  enemy: boolean;
  effect: string;
  pierce: number;
  hits: number[];
  skillId?: string;
  rank?: number;
  exploded?: boolean;
  sourceRank?: number;
  knockback?: number;
  burn?: boolean;
  returning?: boolean;
  returnTravel?: number;
  sourceEnemyId?: number;
  incomingSource?: IncomingSource;
}
export interface CombatZone extends Point {
  id: number;
  radius: number;
  remaining: number;
  tickIn: number;
  damage: number;
  skillId?: string;
  rank?: number;
}
export interface VisualEvent extends Point {
  id: number;
  kind: 'effect' | 'number' | 'warning' | 'ring' | 'lightning' | 'fireburst';
  effect: string;
  value?: number;
  life: number;
  total: number;
  radius: number;
  /** Đường nối thật của Lôi Liên, gồm điểm phát và các mục tiêu đã trúng theo thứ tự. */
  points?: Point[];
  awakened?: boolean;
  followPlayer?: boolean;
  intense?: boolean;
  opportunityId?: number;
}
export interface RunView {
  time: number;
  hp: number;
  maxHp: number;
  xp: number;
  nextXp: number;
  level: number;
  kills: number;
  enemies: number;
  skills: Record<string, number>;
  pills: number;
  potionCooldown: number;
  dashCooldown: number;
  dashCharges?: number;
  dashMaxCharges?: number;
  burst?: { active: boolean; remaining: number } | null;
  mission?: MissionView | null;
  boss: { hp: number; maxHp: number; name: string } | null;
  notice: string;
  seed: number;
  mechanic: StageMechanicView | null;
  augments: AugmentId[];
  rerollsRemaining: number;
  opportunity: OpportunityView | null;
  opportunitiesCompleted: number;
}
export const EMPTY_RUN: RunView = {
  time: 0,
  hp: 100,
  maxHp: 100,
  xp: 0,
  nextXp: 12,
  level: 1,
  kills: 0,
  enemies: 0,
  skills: {},
  pills: 0,
  potionCooldown: 0,
  dashCooldown: 0,
  boss: null,
  notice: '',
  seed: 0,
  mechanic: null,
  augments: [],
  rerollsRemaining: 1,
  opportunity: null,
  opportunitiesCompleted: 0,
};
export function weaponFromEquipment(id: string | null): WeaponId {
  return id?.includes('kiem') ? 'sword' : 'fists';
}

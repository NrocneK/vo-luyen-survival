import type { Point, WeaponId, Direction } from './types';

export type Resource =
  | 'linh-thao'
  | 'thiet-khoang'
  | 'da-thu'
  | 'yeu-dan'
  | 'thuc-an-sung-vat'
  | 'tinh-thach-tien-hoa'
  | 'hat-sen-dot-pha'
  | 'trung-linh-ho'
  | 'trung-thanh-dieu';
export type PillId = 'tu-vi-dan' | 'cuong-the-dan' | 'hoi-nguyen-dan';
export type Slot = 'weapon' | 'armor' | 'jewel' | 'relic';
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
  version: 1;
  stone: number;
  cultivation: number;
  realm: number;
  permanentPills: number;
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
  description: string;
  linked?: string;
  awakened?: string;
  effect: string;
}
export interface Card {
  id: string;
  kind: 'skill' | 'awaken' | 'stat';
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
  won: boolean;
  time: number;
  kills: number;
  level: number;
  rewards: Loot;
  raw: Loot;
  seed: number;
  reason: string;
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
}
export interface VisualEvent extends Point {
  id: number;
  kind: 'effect' | 'number' | 'warning';
  effect: string;
  value?: number;
  life: number;
  total: number;
  radius: number;
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
  boss: { hp: number; maxHp: number; name: string } | null;
  notice: string;
  seed: number;
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
};
export function weaponFromEquipment(id: string | null): WeaponId {
  return id?.includes('kiem') ? 'sword' : 'fists';
}

export interface EnemyDef {
  id: string;
  name: string;
  actor: string;
  hp: number;
  damage: number;
  speed: number;
  radius: number;
  xp: number;
  behavior: 'melee' | 'charge' | 'ranged' | 'boss';
  elite: boolean;
}
export const enemies: Record<string, EnemyDef> = {
  'hac-lang': {
    id: 'hac-lang',
    name: 'Hắc Lang',
    actor: 'hac-lang',
    hp: 22,
    damage: 8,
    speed: 0.95,
    radius: 0.32,
    xp: 3,
    behavior: 'melee',
    elite: false,
  },
  'thiet-nha-tru': {
    id: 'thiet-nha-tru',
    name: 'Thiết Nha Trư',
    actor: 'thiet-nha-tru',
    hp: 45,
    damage: 13,
    speed: 0.7,
    radius: 0.38,
    xp: 5,
    behavior: 'charge',
    elite: false,
  },
  'doc-thiem': {
    id: 'doc-thiem',
    name: 'Độc Thiềm',
    actor: 'doc-thiem',
    hp: 32,
    damage: 9,
    speed: 0.65,
    radius: 0.3,
    xp: 4,
    behavior: 'ranged',
    elite: false,
  },
  'hac-lang-tinh-anh': {
    id: 'hac-lang-tinh-anh',
    name: 'Hắc Lang Tinh Anh',
    actor: 'hac-lang-tinh-anh',
    hp: 500,
    damage: 18,
    speed: 1.12,
    radius: 0.48,
    xp: 45,
    behavior: 'melee',
    elite: true,
  },
  'thiet-nha-tru-tinh-anh': {
    id: 'thiet-nha-tru-tinh-anh',
    name: 'Thiết Nha Trư Tinh Anh',
    actor: 'thiet-nha-tru-tinh-anh',
    hp: 850,
    damage: 24,
    speed: 0.82,
    radius: 0.52,
    xp: 60,
    behavior: 'charge',
    elite: true,
  },
  'hac-phong-lang-vuong': {
    id: 'hac-phong-lang-vuong',
    name: 'Hắc Phong Lang Vương',
    actor: 'hac-phong-lang-vuong',
    hp: 10500,
    damage: 38,
    speed: 0.95,
    radius: 0.65,
    xp: 100,
    behavior: 'boss',
    elite: true,
  },
};

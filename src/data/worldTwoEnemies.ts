import type { EnemyDef } from './enemies';

const bosses: [string, string, string, number, number, EnemyDef['pattern']][] = [
  ['mi-yeu', 'Mị Yêu', 'mi-yeu', 35000, 100, 'poison'],
  ['chu-kien', 'Chử Kiến', 'ma-chu-trung-do', 42000, 105, 'abyss'],
  ['phe-hon-trung-chu', 'Phệ Hồn Trùng hợp nhất', 'phe-hon-trung', 45000, 110, 'poison'],
  ['ma-hoa-doi-thu', 'Thủ lĩnh tranh đoạt Ma Hoa', 'trung-do-kiem-khach', 50000, 120, 'sword'],
  ['thien-nguyet', 'Thiên Nguyệt', 'thong-huyen-nu-tu', 55000, 130, 'sword'],
  ['nam-thanh-co', 'Nam Thánh Cô', 'thong-huyen-nu-tu', 80000, 140, 'abyss'],
  ['duong-toc-thu-linh', 'Thủ lĩnh truy đuổi Dương tộc', 'trung-do-kiem-tran', 60000, 145, 'sword'],
  ['dich-kieu', 'Địch Kiêu', 'ma-ve-trung-do', 75000, 160, 'sword'],
  ['thanh-chu-tan-anh', 'Tàn ảnh Thánh chủ', 'trung-do-kiem-tran', 75000, 175, 'sword'],
  ['truong-ngao-vay', 'Trương Ngạo', 'trung-do-kiem-khach', 90000, 190, 'sword'],
  [
    'xam-luoc-tong-chu',
    'Tông chủ xâm lược Long Phượng Phủ',
    'trung-do-phap-tu',
    110000,
    210,
    'fire',
  ],
  ['truong-ngao-truy-kich', 'Trương Ngạo · Truy kích', 'trung-do-kiem-khach', 120000, 230, 'abyss'],
  ['thong-huyen-tru-tran', 'Trận đồ Thông Huyền Trụ', 'thong-huyen-tru', 130000, 250, 'fire'],
  ['cot-toc-thu-linh', 'Thủ lĩnh Cốt tộc', 'cot-toc-thu-linh', 180000, 290, 'abyss'],
];
export const worldTwoEnemies: Record<string, EnemyDef> = {};
worldTwoEnemies['thong-huyen-nut-tran'] = {
  id: 'thong-huyen-nut-tran',
  name: 'Nút trận Thông Huyền Trụ',
  actor: 'thong-huyen-tru',
  hp: 8000,
  damage: 90,
  speed: 0,
  radius: 0.5,
  xp: 25,
  behavior: 'ranged',
  elite: false,
  projectileEffect: 'spirit-bolt',
  visualScale: 0.7,
};
for (let i = 0; i < 14; i++) {
  const swarm = i === 2,
    bones = i === 13;
  const common = swarm ? 'phe-hon-trung' : bones ? 'cot-toc-thu-linh' : 'trung-do-ho-ve';
  const ranged = swarm ? 'phe-hon-trung' : bones ? 'cot-toc-thu-linh' : 'trung-do-phap-tu';
  const faction = [
    'Ảo ảnh khống chế',
    'Ma vệ Cổ Ma',
    'Phệ Hồn Trùng',
    'Võ giả tranh cơ duyên',
    'Đệ tử Băng Tông',
    'Ảo vệ di tích',
    'Võ giả Dương tộc',
    'Ma vệ Sa Thành',
    'Tàn ảnh Thánh Lăng',
    'Võ giả vây thánh địa',
    'Quân xâm lược',
    'Quân truy kích',
    'Huyễn tượng trận đồ',
    'Chiến binh Cốt tộc',
  ][i];
  for (const [suffix, actor, behavior] of [
    ['vo-gia', common, 'melee'],
    ['phap-tu', ranged, 'ranged'],
    ['tinh-anh', bones ? common : 'trung-do-kiem-tran', 'charge'],
  ] as const) {
    const elite = suffix === 'tinh-anh';
    const id = `thong-huyen-${suffix}-${i}`;
    worldTwoEnemies[id] = {
      id,
      name: elite ? `${faction} · Tinh anh` : faction,
      actor,
      hp: elite ? 3500 + i * 550 : 350 + i * 90,
      damage: elite ? 110 + i * 12 : 85 + i * 9,
      speed: elite ? 1.1 : behavior === 'ranged' ? 0.85 : 1.05,
      radius: elite ? 0.4 : 0.28,
      xp: elite ? 70 + i * 4 : 5 + Math.floor(i / 3),
      behavior,
      elite,
      actorAttackCount: 3,
      projectileEffect: i === 4 || i === 10 ? 'wind-feather' : 'spirit-bolt',
      tint: i === 4 ? 0xc2e5ff : undefined,
      visualScale: swarm ? 0.6 : 1,
    };
  }
  const [id, name, actor, hp, damage, pattern] = bosses[i];
  worldTwoEnemies[id] = {
    id,
    name,
    actor,
    hp,
    damage,
    pattern,
    speed: i === 12 ? 0 : i === 5 ? 0.95 : 1.05,
    radius: i === 12 ? 0.8 : 0.55,
    xp: 120,
    behavior: 'boss',
    elite: true,
    actorAttackCount: 3,
    projectileEffect: i === 4 || i === 10 ? 'wind-feather' : 'spirit-bolt',
    summons: i === 7 ? [] : [`thong-huyen-vo-gia-${i}`, `thong-huyen-phap-tu-${i}`],
    visualScale: i === 2 ? 1.2 : i === 13 ? 1.25 : 1.1,
  };
}

import type { Point, WorldBounds, SceneLayout, MapProp } from '../shared/types';
import type { Loot } from '../shared/models';
import { cameraSettings } from './camera.ts';
import { worldTwoStages } from './worldTwoStages.ts';
import type { WorldTwoMissionDef } from '../shared/worldTwo';

export interface StageDef {
  id: string;
  stageIndex: number;
  name: string;
  world: string;
  chapter?: 1 | 2;
  mission?: WorldTwoMissionDef;
  description: string;
  objective: string;
  groundId: string;
  groundStyle?: { color: number; line: number; pattern: 'stone' | 'sand' | 'ice' | 'soil' };
  propsId: string;
  bounds: WorldBounds;
  moveSpeed: number;
  playerRadius: number;
  cameraZoom: number;
  duration: number;
  eliteTimes: number[];
  elites: { at: number; id: string }[];
  maxEnemies: number;
  landmarks: { id: string; name: string; position: Point; radius: number }[];
  requiredRealm: number;
  prerequisite: string | null;
  bossId: string;
  tint: number;
  accent: number;
  enemyScale: number;
  rewards: Loot;
  firstClear: Loot;
  spawnWaves: { from: number; weights: Record<string, number> }[];
}

const loot = (
  cultivation: number,
  stone: number,
  resources: Loot['resources'] = {},
  equipment: string[] = [],
  blueprints: string[] = [],
): Loot => ({ cultivation, stone, resources, equipment, blueprints });

export const stage: StageDef = {
  id: 'hac-phong-son',
  stageIndex: 0,
  name: 'Hắc Phong Sơn',
  world: 'Trung Đô',
  description:
    'Rừng núi phía sau Lăng Tiêu Các. Giữa lối mòn và phế tích, hành trình lịch luyện bắt đầu.',
  objective: 'Sống sót 10 phút rồi tiêu diệt Hắc Phong Lang Vương.',
  groundId: 'forest-floor-tile',
  propsId: 'hac-phong-son-props',
  // Gần 10 lần diện tích cũ, giữ nguyên tỉ lệ nhân vật và tốc độ di chuyển.
  bounds: { minX: -32, maxX: 32, minY: -32, maxY: 32 } satisfies WorldBounds,
  moveSpeed: 2.4,
  playerRadius: 0.21,
  cameraZoom: cameraSettings.defaultZoom,
  duration: 600,
  eliteTimes: [180, 360],
  elites: [
    { at: 180, id: 'hac-lang-tinh-anh' },
    { at: 360, id: 'thiet-nha-tru-tinh-anh' },
  ],
  maxEnemies: 100,
  requiredRealm: 0,
  prerequisite: null,
  bossId: 'hac-phong-lang-vuong',
  tint: 0xffffff,
  accent: 0x537052,
  enemyScale: 1,
  rewards: loot(
    500,
    150,
    { 'hat-sen-dot-pha': 1, 'trung-thanh-dieu': 1, 'tinh-thach-tien-hoa': 2 },
    [],
    ['liet-duong-kiem', 'ngoc-lien-bi-bao'],
  ),
  firstClear: loot(2600, 120, { 'linh-thao': 12, 'thiet-khoang': 12, 'da-thu': 8 }),
  spawnWaves: [
    { from: 0, weights: { 'hac-lang': 1 } },
    { from: 25, weights: { 'hac-lang': 72, 'thiet-nha-tru': 28 } },
    { from: 55, weights: { 'hac-lang': 55, 'thiet-nha-tru': 21, 'doc-thiem': 24 } },
  ],
  landmarks: [
    { id: 'mieu-co', name: 'Miếu cổ', position: { x: -25, y: 26 }, radius: 5 },
    { id: 'thung-lung', name: 'Thung lũng', position: { x: 15, y: 12 }, radius: 7 },
    { id: 'rung-truc', name: 'Rừng trúc', position: { x: 25, y: -26 }, radius: 5 },
  ],
};

/** Sáu mốc được tuyển chọn cho thế giới Trung Đô, không chép toàn bộ hành trình truyện. */
export const stages: StageDef[] = [
  stage,
  {
    ...stage,
    id: 'truyen-thua-dong-thien',
    stageIndex: 1,
    name: 'Truyền Thừa Động Thiên',
    description:
      'Cổ trận mở lối vào động thiên. Khôi lỗi và kiếm linh canh giữ cơ duyên bên trong.',
    objective: 'Giữ vững linh đài 9 phút, phá hủy Cổ Trận Thủ Vệ.',
    requiredRealm: 10,
    prerequisite: stage.id,
    duration: 540,
    eliteTimes: [150, 330],
    elites: [
      { at: 150, id: 'khoi-loi-tinh-anh' },
      { at: 330, id: 'kiem-linh-tinh-anh' },
    ],
    bossId: 'co-tran-thu-ve',
    tint: 0xa9cad7,
    accent: 0x76b5d6,
    enemyScale: 2.1,
    rewards: loot(2600, 350, {
      'hat-sen-dot-pha': 1,
      'linh-thao': 16,
      'thiet-khoang': 22,
      'yeu-dan': 5,
      'tinh-thach-tien-hoa': 2,
    }),
    firstClear: loot(
      5200,
      240,
      { 'hat-sen-dot-pha': 1, 'trung-linh-ho': 1 },
      ['ngoc-gioi'],
      ['liet-duong-kiem'],
    ),
    landmarks: [
      { id: 'linh-dai', name: 'Linh đài trung tâm', position: { x: 0, y: 0 }, radius: 7 },
      { id: 'co-mon', name: 'Cổ môn', position: { x: -24, y: 22 }, radius: 6 },
      { id: 'thach-tran', name: 'Thạch trận', position: { x: 24, y: -23 }, radius: 6 },
    ],
    spawnWaves: [
      { from: 0, weights: { 'linh-tran-khoi-loi': 50, 'kiem-linh': 50 } },
      {
        from: 90,
        weights: { 'linh-tran-khoi-loi': 40, 'kiem-linh': 40, 'phap-anh-linh-tran': 20 },
      },
      {
        from: 300,
        weights: { 'linh-tran-khoi-loi': 45, 'kiem-linh': 35, 'phap-anh-linh-tran': 20 },
      },
    ],
  },
  {
    ...stage,
    id: 'cuu-am-son-coc',
    stageIndex: 2,
    name: 'Cửu Âm Sơn Cốc',
    description:
      'Âm khí hội tụ thành độc chướng. Linh thú cuồng loạn và tà tu phục kích con đường xuống đáy cốc.',
    objective: 'Vượt qua 9 phút độc chướng, hạ Cửu Âm Độc Chủ.',
    requiredRealm: 19,
    prerequisite: 'truyen-thua-dong-thien',
    duration: 540,
    eliteTimes: [150, 330],
    elites: [
      { at: 150, id: 'doc-thiem-tinh-anh' },
      { at: 330, id: 'hac-lang-tinh-anh' },
    ],
    bossId: 'cuu-am-doc-chu',
    tint: 0x91b2ab,
    accent: 0x70c49d,
    enemyScale: 3.7,
    rewards: loot(5500, 550, {
      'hat-sen-dot-pha': 1,
      'linh-thao': 32,
      'yeu-dan': 8,
      'thuc-an-sung-vat': 10,
      'tinh-thach-tien-hoa': 3,
    }),
    firstClear: loot(
      10000,
      400,
      { 'hat-sen-dot-pha': 1, 'trung-thanh-dieu': 1 },
      ['huyen-giap'],
      ['ngoc-lien-bi-bao', 'chan-duong-kiem'],
    ),
    landmarks: [
      { id: 'am-tuyen', name: 'Âm tuyền', position: { x: 0, y: 0 }, radius: 8 },
      { id: 'doc-lam', name: 'Độc lâm', position: { x: -25, y: -20 }, radius: 6 },
      { id: 'day-coc', name: 'Đáy cốc', position: { x: 24, y: 23 }, radius: 6 },
    ],
    spawnWaves: [
      { from: 0, weights: { 'hac-lang': 55, 'doc-thiem': 45 } },
      { from: 90, weights: { 'hac-lang': 25, 'ta-tu-doc-coc': 25, 'doc-thiem': 50 } },
      { from: 300, weights: { 'hac-lang': 20, 'ta-tu-doc-coc': 30, 'doc-thiem': 50 } },
    ],
  },
  {
    ...stage,
    id: 'ly-dia',
    stageIndex: 3,
    name: 'Ly Địa',
    description:
      'Vùng đất phong ấn tràn hỏa khí. Bầy yêu thú giữ lối ra giữa những đợt linh triều.',
    objective: 'Cầm cự 10 phút và đánh bại Xích Diễm Thú Vương.',
    requiredRealm: 28,
    prerequisite: 'cuu-am-son-coc',
    duration: 600,
    eliteTimes: [180, 390],
    elites: [
      { at: 180, id: 'thiet-nha-tru-tinh-anh' },
      { at: 390, id: 'doc-thiem-tinh-anh' },
    ],
    bossId: 'xich-diem-thu-vuong',
    tint: 0xe8af8b,
    accent: 0xe39b5b,
    enemyScale: 5.8,
    rewards: loot(10000, 800, {
      'hat-sen-dot-pha': 1,
      'thiet-khoang': 35,
      'da-thu': 24,
      'yeu-dan': 12,
      'tinh-thach-tien-hoa': 3,
    }),
    firstClear: loot(
      19000,
      650,
      { 'hat-sen-dot-pha': 1, 'thiet-khoang': 25 },
      ['huyen-thiet-quyen-sao'],
      ['truyen-thua-bi-bao'],
    ),
    landmarks: [
      { id: 'phong-an', name: 'Phong ấn cổ', position: { x: 0, y: 0 }, radius: 8 },
      { id: 'viem-nham', name: 'Viêm nham', position: { x: -24, y: 24 }, radius: 6 },
      { id: 'loi-ra', name: 'Lối ra Ly Địa', position: { x: 25, y: -24 }, radius: 6 },
    ],
    spawnWaves: [
      { from: 0, weights: { 'hac-lang': 45, 'thiet-nha-tru': 55 } },
      { from: 90, weights: { 'hac-lang': 25, 'thiet-nha-tru': 45, 'diem-linh': 30 } },
      { from: 330, weights: { 'thiet-nha-tru': 60, 'diem-linh': 40 } },
    ],
  },
  {
    ...stage,
    id: 'trung-do-doat-dich',
    stageIndex: 4,
    name: 'Trung Đô · Đoạt Đích',
    description:
      'Hộ vệ thế gia, kiếm khách và pháp tu tiến công từng đợt trong cuộc tranh đoạt tại Trung Đô.',
    objective: 'Giữ tuyến 10 phút, thắng Kiếm Trận Hộ Vệ.',
    requiredRealm: 37,
    prerequisite: 'ly-dia',
    duration: 600,
    eliteTimes: [180, 390],
    elites: [
      { at: 180, id: 'kiem-khach-tinh-anh' },
      { at: 390, id: 'ho-ve-tinh-anh' },
    ],
    bossId: 'kiem-tran-ho-ve',
    tint: 0xc8c5af,
    accent: 0xc1ac79,
    enemyScale: 8.5,
    rewards: loot(18000, 1200, {
      'hat-sen-dot-pha': 1,
      'linh-thao': 32,
      'thiet-khoang': 40,
      'da-thu': 28,
      'yeu-dan': 16,
      'tinh-thach-tien-hoa': 4,
    }),
    firstClear: loot(32000, 950, { 'hat-sen-dot-pha': 1, 'thuc-an-sung-vat': 15 }, [
      'ngoc-lien-bi-bao',
    ]),
    landmarks: [
      { id: 'dau-truong', name: 'Đấu trường', position: { x: 0, y: 0 }, radius: 8 },
      { id: 'ta-mon', name: 'Tả môn', position: { x: -24, y: 23 }, radius: 6 },
      { id: 'huu-mon', name: 'Hữu môn', position: { x: 24, y: -23 }, radius: 6 },
    ],
    spawnWaves: [
      {
        from: 0,
        weights: { 'ho-ve-trung-do': 45, 'kiem-khach-trung-do': 40, 'phap-tu-trung-do': 15 },
      },
      {
        from: 180,
        weights: { 'ho-ve-trung-do': 35, 'kiem-khach-trung-do': 35, 'phap-tu-trung-do': 30 },
      },
      {
        from: 390,
        weights: { 'ho-ve-trung-do': 30, 'kiem-khach-trung-do': 35, 'phap-tu-trung-do': 35 },
      },
    ],
  },
  {
    ...stage,
    id: 'trung-do-hao-kiep',
    stageIndex: 5,
    name: 'Trung Đô · Hạo Kiếp',
    description:
      'Chiến tuyến cuối của Trung Đô. Ma vệ, ma kiếm sĩ và ma tu Hắc Triều tràn qua tuyến phong ấn.',
    objective:
      'Sống sót 12 phút, tiêu diệt Hắc Triều Thống Lĩnh. Đạt Thần Du đỉnh phong để hoàn thành thế giới.',
    requiredRealm: 43,
    prerequisite: 'trung-do-doat-dich',
    duration: 720,
    eliteTimes: [210, 450],
    elites: [
      { at: 210, id: 'ma-tu-tinh-anh' },
      { at: 450, id: 'ma-ve-tinh-anh' },
    ],
    bossId: 'hac-trieu-thong-linh',
    tint: 0xa69ac4,
    accent: 0xc18fe5,
    enemyScale: 11,
    rewards: loot(30000, 1800, {
      'hat-sen-dot-pha': 2,
      'linh-thao': 40,
      'thiet-khoang': 50,
      'da-thu': 35,
      'yeu-dan': 22,
      'tinh-thach-tien-hoa': 5,
    }),
    firstClear: loot(0, 1500, { 'hat-sen-dot-pha': 2, 'thuc-an-sung-vat': 20 }, [
      'liet-duong-kiem',
      'ngoc-lien-bi-bao',
    ]),
    landmarks: [
      { id: 'chien-tuyen', name: 'Chiến tuyến trung tâm', position: { x: 0, y: 0 }, radius: 8 },
      { id: 'hac-mon', name: 'Hắc môn', position: { x: -25, y: 24 }, radius: 6 },
      { id: 'tuyen-phong', name: 'Tuyến phong ấn', position: { x: 24, y: -25 }, radius: 6 },
    ],
    spawnWaves: [
      { from: 0, weights: { 'ma-ve': 40, 'ma-kiem': 40, 'ma-tu': 20 } },
      { from: 210, weights: { 'ma-ve': 35, 'ma-kiem': 35, 'ma-tu': 30 } },
      { from: 450, weights: { 'ma-ve': 35, 'ma-kiem': 25, 'ma-tu': 40 } },
    ],
  },
];

export const allStages: StageDef[] = [...stages, ...worldTwoStages];
export function stageById(id: string): StageDef {
  return allStages.find((item) => item.id === id) ?? stage;
}

const prop = (frame: string, x: number, y: number, scale: number, solid = false): MapProp => ({
  frame,
  world: [x, y],
  scale,
  origin: [0.5, 0.953125],
  collision: solid ? { shape: 'circle', radiusWorld: 0.5 } : null,
});

/** Renderer, va chạm và minimap cùng đọc bố cục này, không còn dùng layout nhỏ của asset v3. */
export const forestLayout: SceneLayout = {
  dimensions: [3584, 2304],
  pixelsPerWorldUnit: 33.10344827586207,
  screenOrigin: [1792, 1152],
  worldBounds: stage.bounds,
  playerSpawn: [0, 0],
  props: [
    // Cây ở ngoài ranh giới là cảnh nền; không tạo vật cản ẩn trong sân đấu.
    prop('cay-thong', -33, -24, 1.05),
    prop('cay-la-rong', -33, 14, 1.1),
    prop('cay-thong', 33, -18, 1),
    prop('cay-la-rong', 33, 22, 1.1),
    prop('cay-thong', -20, 33, 1.05),
    prop('cay-la-rong', 17, 33, 1.1),
    prop('cay-thong', -19, -33, 1),
    prop('cay-la-rong', 21, -33, 1.1),
    // Chỉ giữ hai vật thể chắn ở điểm mốc xa; trung tâm và lối mòn hoàn toàn thoáng.
    prop('mieu-da', -25, 26, 0.82, true),
    prop('bui-truc', 25, -26, 0.9, true),
    prop('duong-xi', 14, 14, 0.55),
    prop('nam-do', -16, -12, 0.55),
  ],
};
export const forestProjection = {
  origin: { x: forestLayout.screenOrigin[0], y: forestLayout.screenOrigin[1] },
  pixelsPerUnit: forestLayout.pixelsPerWorldUnit,
};

export const forestTrails: Point[][] = [
  [
    { x: -32, y: -16 },
    { x: -20, y: -10 },
    { x: -8, y: -3 },
    { x: 0, y: 0 },
    { x: 15, y: 9 },
    { x: 32, y: 19 },
  ],
  [
    { x: -25, y: 27 },
    { x: -20, y: 17 },
    { x: -10, y: 9 },
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 25, y: -27 },
  ],
];

export function layoutForStage(definition: StageDef): SceneLayout {
  if (definition.stageIndex === 0) return forestLayout;
  const frames = [
    ['cot-da', 'mieu-da'],
    ['bui-truc', 'cay-kho'],
    ['mieu-da', 'cot-da'],
    ['cot-da', 'mieu-da'],
    ['cay-kho', 'cot-da'],
  ][(definition.stageIndex - 1 + 5) % 5];
  // Chỉ hai vật cản ở rìa mốc. Toàn bộ sân giữa dành cho di chuyển và né đòn.
  return {
    ...forestLayout,
    worldBounds: definition.bounds,
    props: [
      ...forestLayout.props.filter(
        (item) => item.frame.startsWith('cay-') && Math.abs(item.world[0]) >= 33,
      ),
      prop(frames[0], -25, 25, 0.8, true),
      prop(frames[1], 25, -25, 0.8, true),
      prop('duong-xi', -18, -20, 0.45),
      prop('nam-do', 19, 20, 0.45),
    ],
  };
}

export function projectionForStage(definition: StageDef) {
  const layout = layoutForStage(definition);
  return {
    origin: { x: layout.screenOrigin[0], y: layout.screenOrigin[1] },
    pixelsPerUnit: layout.pixelsPerWorldUnit,
  };
}

export function trailsForStage(definition: StageDef): Point[][] {
  if (definition.stageIndex === 0) return forestTrails;
  if (definition.stageIndex % 2 === 1)
    return [
      [
        { x: -32, y: 0 },
        { x: -16, y: 0 },
        { x: 0, y: 0 },
        { x: 16, y: 0 },
        { x: 32, y: 0 },
      ],
      [
        { x: 0, y: -32 },
        { x: 0, y: -16 },
        { x: 0, y: 0 },
        { x: 0, y: 16 },
        { x: 0, y: 32 },
      ],
      [
        { x: -20, y: -20 },
        { x: -20, y: 20 },
        { x: 20, y: 20 },
        { x: 20, y: -20 },
        { x: -20, y: -20 },
      ],
    ];
  return [
    [
      { x: -32, y: -20 },
      { x: -18, y: -6 },
      { x: 0, y: 0 },
      { x: 18, y: 6 },
      { x: 32, y: 20 },
    ],
    [
      { x: -24, y: 26 },
      { x: -12, y: 10 },
      { x: 0, y: 0 },
      { x: 12, y: -10 },
      { x: 24, y: -26 },
    ],
  ];
}

export function areaAt(point: Point, definition: StageDef = stage): string {
  return (
    definition.landmarks.find(
      (area) => Math.hypot(point.x - area.position.x, point.y - area.position.y) <= area.radius,
    )?.name ?? (definition.stageIndex === 0 ? 'Lối mòn trong rừng' : definition.name)
  );
}

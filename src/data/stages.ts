import type { Point, WorldBounds, SceneLayout, MapProp } from '../shared/types';

export const stage = {
  id: 'hac-phong-son',
  name: 'Hắc Phong Sơn',
  world: 'Trung Đô',
  description:
    'Rừng núi phía sau Lăng Tiêu Các. Giữa lối mòn và phế tích, hành trình lịch luyện bắt đầu.',
  groundId: 'forest-floor-tile',
  propsId: 'hac-phong-son-props',
  // Gần 10 lần diện tích cũ, giữ nguyên tỉ lệ nhân vật và tốc độ di chuyển.
  bounds: { minX: -32, maxX: 32, minY: -32, maxY: 32 } satisfies WorldBounds,
  moveSpeed: 2.4,
  playerRadius: 0.21,
  cameraZoom: 2,
  duration: 600,
  eliteTimes: [180, 360],
  maxEnemies: 100,
  landmarks: [
    { id: 'mieu-co', name: 'Miếu cổ', position: { x: -25, y: 26 }, radius: 5 },
    { id: 'thung-lung', name: 'Thung lũng', position: { x: 15, y: 12 }, radius: 7 },
    { id: 'rung-truc', name: 'Rừng trúc', position: { x: 25, y: -26 }, radius: 5 },
  ],
};

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

export function areaAt(point: Point): string {
  return (
    stage.landmarks.find(
      (area) => Math.hypot(point.x - area.position.x, point.y - area.position.y) <= area.radius,
    )?.name ?? 'Lối mòn trong rừng'
  );
}

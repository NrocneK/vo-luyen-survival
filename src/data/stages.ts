import type { Point, WorldBounds } from '../shared/types';

export const stage = {
  id: 'hac-phong-son',
  name: 'Hắc Phong Sơn',
  world: 'Trung Đô',
  description:
    'Rừng núi phía sau Lăng Tiêu Các. Giữa lối mòn và phế tích, hành trình lịch luyện bắt đầu.',
  groundId: 'hac-phong-son-ground',
  propsId: 'hac-phong-son-props',
  // Ranh giới nằm trong hàng cây để người chơi không bước khỏi nền đấu trường.
  bounds: { minX: -10.2, maxX: 10.2, minY: -10.2, maxY: 10.2 } satisfies WorldBounds,
  moveSpeed: 2.4,
  playerRadius: 0.21,
  cameraZoom: 2,
  duration: 600,
  eliteTimes: [180, 360],
  maxEnemies: 100,
  landmarks: [
    { id: 'mieu-co', name: 'Miếu cổ', position: { x: -8, y: 8 }, radius: 3 },
    { id: 'bai-da', name: 'Bãi đá', position: { x: -4, y: 2 }, radius: 2.3 },
    { id: 'rung-truc', name: 'Rừng trúc', position: { x: 7, y: -8 }, radius: 3 },
  ],
};

export function areaAt(point: Point): string {
  return (
    stage.landmarks.find(
      (area) => Math.hypot(point.x - area.position.x, point.y - area.position.y) <= area.radius,
    )?.name ?? 'Lối mòn trong rừng'
  );
}

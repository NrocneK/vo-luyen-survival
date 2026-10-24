import type { Point } from '../../shared/types';
import { unproject, type Projection } from './worldPhysics.ts';

interface FixedCamera {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
  zoom: number;
}

/** Cùng phép đổi của camera isometric cố định, có đệm để đầu/vũ khí không bật ra trong hình. */
export function cameraFootprint(camera: FixedCamera, projection: Projection): Point[] {
  const centerX = camera.scrollX + camera.width / 2,
    centerY = camera.scrollY + camera.height / 2,
    halfWidth = camera.width / camera.zoom / 2 + 64,
    halfHeight = camera.height / camera.zoom / 2 + 64;
  return [
    { x: centerX - halfWidth, y: centerY - halfHeight },
    { x: centerX + halfWidth, y: centerY - halfHeight },
    { x: centerX + halfWidth, y: centerY + halfHeight },
    { x: centerX - halfWidth, y: centerY + halfHeight },
  ].map((point) => unproject(point, projection));
}

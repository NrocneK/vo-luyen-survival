import { project, unproject } from './worldPhysics.ts';
import type { CircleObstacle, SceneLayout } from '../../shared/types';
// Điểm và bán kính pixel ở vùng chân của mỗi hình, trước khi áp dụng scale của prop.
const footprints: Record<string, [number, number, number][]> = {
  'da-lon': [
    [0, -17, 25],
    [-17, -7, 17],
    [19, -7, 17],
  ],
  'da-nho': [
    [0, -11, 19],
    [-15, -4, 12],
    [17, -3, 12],
  ],
  'da-nhon': [
    [0, -10, 14],
    [0, -33, 11],
  ],
  'than-cay': [
    [-29, -13, 15],
    [-12, -12, 15],
    [7, -11, 15],
    [26, -10, 14],
  ],
  'goc-cay': [[0, -11, 21]],
  're-cay': [
    [-20, -9, 15],
    [0, -10, 17],
    [20, -8, 14],
  ],
  'tuong-vo': [
    [-18, -12, 14],
    [0, -12, 14],
    [18, -12, 14],
  ],
  'mieu-da': [
    [-22, -18, 18],
    [0, -20, 22],
    [22, -18, 18],
  ],
  'cot-da': [[0, -10, 13]],
  'den-da': [[0, -10, 13]],
  'cay-kho': [[0, -10, 16]],
  'bui-truc': [[0, -10, 16]],
};
export function buildMapObstacles(layout: SceneLayout): CircleObstacle[] {
  const projection = {
    origin: { x: layout.screenOrigin[0], y: layout.screenOrigin[1] },
    pixelsPerUnit: layout.pixelsPerWorldUnit,
  };
  return layout.props.flatMap((prop) => {
    if (!prop.collision) return [];
    const foot = project({ x: prop.world[0], y: prop.world[1] }, projection);
    const pieces = footprints[prop.frame] ?? [[0, -7, 16]];
    return pieces.map(([x, y, radius]) => ({
      ...unproject({ x: foot.x + x * prop.scale, y: foot.y + y * prop.scale }, projection),
      radius: (radius * prop.scale) / (projection.pixelsPerUnit / Math.sqrt(2)),
    }));
  });
}

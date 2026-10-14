import { forestLayout } from './stages.ts';
import { buildMapObstacles } from '../game/math/mapGeometry.ts';
export const mapObstacles = () => buildMapObstacles(forestLayout);

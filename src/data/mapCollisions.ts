import { assets } from './assets';
import { buildMapObstacles } from '../game/math/mapGeometry';
export const mapObstacles = () => buildMapObstacles(assets.sceneLayout);

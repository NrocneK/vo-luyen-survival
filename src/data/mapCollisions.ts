import { stage, layoutForStage } from './stages.ts';
import type { StageDef } from './stages.ts';
import { buildMapObstacles } from '../game/math/mapGeometry.ts';
export const mapObstacles = (selected: StageDef = stage) =>
  buildMapObstacles(layoutForStage(selected));

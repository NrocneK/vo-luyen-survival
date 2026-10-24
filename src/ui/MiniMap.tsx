import { stageById, layoutForStage, projectionForStage, trailsForStage } from '../data/stages';
import { project } from '../game/math/worldPhysics';
import type { Point } from '../shared/types';
import type { OpportunityView } from '../shared/opportunities';
import type { MissionView } from '../shared/worldTwo';

export function MiniMap({
  position,
  stageId,
  target,
  opportunity,
  mission,
}: {
  position: Point;
  stageId: string;
  target?: Point | null;
  opportunity?: OpportunityView | null;
  mission?: MissionView | null;
}) {
  const stage = stageById(stageId);
  const layout = layoutForStage(stage);
  const projection = projectionForStage(stage);
  const player = project(position, projection);
  const objective = target ? project(target, projection) : null;
  const chance =
    opportunity && !['completed', 'expired'].includes(opportunity.phase)
      ? project(opportunity, projection)
      : null;
  const bounds = stage.bounds;
  const corners = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ]
    .map((point) => {
      const p = project(point, projection);
      return `${p.x},${p.y}`;
    })
    .join(' ');
  return (
    <svg
      className="mini-map"
      viewBox={`0 0 ${layout.dimensions.join(' ')}`}
      role="img"
      aria-label={`Bản đồ nhỏ ${stage.name} với vị trí Dương Khai`}
    >
      <polygon points={corners} fill="#274536" stroke="#9eab82" strokeWidth="14" opacity="0.85" />
      {trailsForStage(stage).map((trail, index) => (
        <polyline
          key={index}
          points={trail
            .map((point) => {
              const p = project(point, projection);
              return `${p.x},${p.y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#8e8960"
          strokeWidth="28"
          strokeLinejoin="round"
          opacity=".6"
        />
      ))}
      {stage.landmarks.map((landmark) => {
        const p = project(landmark.position, projection);
        return (
          <g key={landmark.id}>
            <circle cx={p.x} cy={p.y} r="35" fill="#8aa499" />
            <title>{landmark.name}</title>
          </g>
        );
      })}
      <circle cx={player.x} cy={player.y} r="92" fill="#efcc86" opacity="0.14" />
      {mission?.nodes
        .filter((node) => !node.completed)
        .map((node) => {
          const p = project(node, projection);
          return (
            <g key={node.id}>
              <title>{node.name}</title>
              <circle cx={p.x} cy={p.y} r="55" fill="#bce4be" stroke="#153c32" strokeWidth="12" />
            </g>
          );
        })}
      {mission?.protected &&
        (() => {
          const p = project(mission.protected, projection);
          return (
            <g>
              <title>{mission.protected.name}</title>
              <rect
                x={p.x - 50}
                y={p.y - 50}
                width="100"
                height="100"
                fill="#9be8dd"
                stroke="#153c32"
                strokeWidth="12"
              />
            </g>
          );
        })()}
      {objective && (
        <g aria-label="Mục tiêu cơ chế màn">
          <circle cx={objective.x} cy={objective.y} r="105" fill="#76dfdf" opacity=".3" />
          <path
            d={`M ${objective.x} ${objective.y - 68} l 56 68 l -56 68 l -56 -68 Z`}
            fill="#ffe1a1"
            stroke="#112e2a"
            strokeWidth="12"
          />
        </g>
      )}
      {chance && (
        <g aria-label={`Cơ duyên ${opportunity!.name}`}>
          <title>{opportunity!.name}</title>
          <circle cx={chance.x} cy={chance.y} r="120" fill="#d5a9fa" opacity=".3" />
          <path
            d={`M ${chance.x} ${chance.y - 85} l 22 62 l 63 23 l -63 23 l -22 62 l -22 -62 l -63 -23 l 63 -23 Z`}
            fill="#e9beff"
            stroke="#261b37"
            strokeWidth="13"
          />
        </g>
      )}
      <circle cx={player.x} cy={player.y} r="40" fill="#f6d58d" stroke="#172e28" strokeWidth="15" />
    </svg>
  );
}

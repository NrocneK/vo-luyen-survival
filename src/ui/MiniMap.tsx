import { stage, forestLayout, forestProjection, forestTrails } from '../data/stages';
import { project } from '../game/math/worldPhysics';
import type { Point } from '../shared/types';

export function MiniMap({ position }: { position: Point }) {
  const projection = forestProjection;
  const player = project(position, projection);
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
      viewBox={`0 0 ${forestLayout.dimensions.join(' ')}`}
      role="img"
      aria-label="Bản đồ nhỏ Hắc Phong Sơn với vị trí Dương Khai"
    >
      <polygon points={corners} fill="#274536" stroke="#9eab82" strokeWidth="14" opacity="0.85" />
      {forestTrails.map((trail, index) => (
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
      <circle cx={player.x} cy={player.y} r="40" fill="#f6d58d" stroke="#172e28" strokeWidth="15" />
    </svg>
  );
}

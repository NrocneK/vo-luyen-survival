import { assets, assetUrl, sharedAsset } from '../data/assets';
import { stage } from '../data/stages';
import { project } from '../game/math/worldPhysics';
import type { Point } from '../shared/types';

export function MiniMap({ position }: { position: Point }) {
  const projection = {
    origin: { x: assets.sceneLayout.screenOrigin[0], y: assets.sceneLayout.screenOrigin[1] },
    pixelsPerUnit: assets.sceneLayout.pixelsPerWorldUnit,
  };
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
      viewBox="0 0 1280 896"
      role="img"
      aria-label="Bản đồ nhỏ Hắc Phong Sơn với vị trí Dương Khai"
    >
      <image
        href={assetUrl(sharedAsset(stage.groundId).file)}
        width="1280"
        height="896"
        opacity="0.7"
      />
      <polygon points={corners} fill="none" stroke="#9eab82" strokeWidth="7" opacity="0.7" />
      {stage.landmarks.map((landmark) => {
        const p = project(landmark.position, projection);
        return (
          <g key={landmark.id}>
            <circle cx={p.x} cy={p.y} r="16" fill="#8aa499" />
            <title>{landmark.name}</title>
          </g>
        );
      })}
      <circle cx={player.x} cy={player.y} r="47" fill="#efcc86" opacity="0.14" />
      <circle cx={player.x} cy={player.y} r="18" fill="#f6d58d" stroke="#172e28" strokeWidth="9" />
    </svg>
  );
}

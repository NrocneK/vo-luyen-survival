import { assetUrl } from '../data/assets';
import { resourceNames, equipment } from '../data/equipment';
import type { Cost, Resource } from '../shared/models';
import { worldTwoIconFile } from '../data/worldTwoIcons';
export function Icon({
  id,
  category = 'items',
  size = 42,
}: {
  id: string;
  category?: 'items' | 'equipment' | 'skills';
  size?: number;
}) {
  if (id === 'linh-tai-thong-huyen')
    return (
      <svg className="asset-icon" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 3 40 14 36 34 24 45 9 33 7 14Z"
          fill="#18444c"
          stroke="#8ee5da"
          strokeWidth="2"
        />
        <path d="M24 3 29 17 24 45 17 20Z" fill="#80dfd6" />
        <path d="m7 14 22 3 11-3-16 13Z" fill="#c2fff0" opacity=".7" />
      </svg>
    );
  const iconId = category === 'equipment' ? (equipment[id]?.icon ?? id) : id;
  const file =
    worldTwoIconFile(id, category) ??
    worldTwoIconFile(iconId, category) ??
    `assets/v3/${category}/${category}/${iconId}.png`;
  return <img className="asset-icon" src={assetUrl(file)} alt="" width={size} height={size} />;
}
export function CostLabel({ cost }: { cost: Cost }) {
  return (
    <span className="cost-label">
      {cost.stone ? `${cost.stone} linh thạch` : ''}
      {Object.entries(cost.resources ?? {})
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => ` · ${amount} ${resourceNames[id as Resource]}`)
        .join('')}
    </span>
  );
}

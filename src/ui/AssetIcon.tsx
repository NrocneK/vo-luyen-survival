import { assetUrl } from '../data/assets';
import { resourceNames } from '../data/equipment';
import type { Cost, Resource } from '../shared/models';
export function Icon({
  id,
  category = 'items',
  size = 42,
}: {
  id: string;
  category?: 'items' | 'equipment' | 'skills';
  size?: number;
}) {
  return (
    <img
      className="asset-icon"
      src={assetUrl(`assets/v3/${category}/${category}/${id}.png`)}
      alt=""
      width={size}
      height={size}
    />
  );
}
export function CostLabel({ cost }: { cost: Cost }) {
  return (
    <span className="cost-label">
      {cost.stone ? `${cost.stone} linh thạch` : ''}
      {Object.entries(cost.resources ?? {})
        .map(([id, amount]) => ` · ${amount} ${resourceNames[id as Resource]}`)
        .join('')}
    </span>
  );
}

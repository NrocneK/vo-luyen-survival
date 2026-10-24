import { equipment, resourceNames } from '../data/equipment';
import type { Loot, Resource } from '../shared/models';
import { Icon } from './AssetIcon';

/** Một cách hiển thị thưởng chung cho lịch luyện và tổng kết, tránh lệch tên vật phẩm. */
export function LootSummary({ loot, compact = false }: { loot: Loot; compact?: boolean }) {
  return (
    <div className={compact ? 'loot-summary compact' : 'loot-summary'}>
      <div className="reward-grid">
        {loot.stone > 0 && (
          <div>
            <Icon id="linh-thach" size={28} />
            <span>Linh thạch</span>
            <strong>+{loot.stone.toLocaleString('vi-VN')}</strong>
          </div>
        )}
        {loot.cultivation > 0 && (
          <div>
            <Icon id="tu-vi-dan" size={28} />
            <span>Tu vi</span>
            <strong>
              +{loot.cultivation.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
            </strong>
          </div>
        )}
        {Object.entries(loot.resources)
          .filter(([, amount]) => amount > 0)
          .map(([id, amount]) => (
            <div key={id}>
              <Icon id={id} size={28} />
              <span>{resourceNames[id as Resource]}</span>
              <strong>+{amount}</strong>
            </div>
          ))}
      </div>
      {loot.equipment.length > 0 && (
        <p>
          Trang bị: {loot.equipment.map((id) => equipment[id]?.name ?? id).join(' · ')}. Món đã sở
          hữu đổi thành 25 linh thạch.
        </p>
      )}
      {loot.blueprints.length > 0 && (
        <p>Bản vẽ: {loot.blueprints.map((id) => equipment[id]?.name ?? id).join(' · ')}</p>
      )}
    </div>
  );
}

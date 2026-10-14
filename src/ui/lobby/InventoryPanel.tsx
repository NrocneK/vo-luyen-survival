import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { equipment, resourceNames, slotNames } from '../../data/equipment';
import { canPay, upgradeCost } from '../../domain/profile';
import type { Resource, Slot } from '../../shared/models';
import { Icon, CostLabel } from '../AssetIcon';
export function InventoryPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;

  return (
    <>
      <div className="equip-slots">
        {(Object.keys(slotNames) as Slot[]).map((slot) => (
          <div key={slot}>
            <small>{slotNames[slot]}</small>
            {profile.equipped[slot] ? (
              <>
                <Icon id={profile.equipped[slot]!} category="equipment" />
                <span>{equipment[profile.equipped[slot]!].name}</span>
              </>
            ) : (
              <span className="empty-slot">Chưa trang bị</span>
            )}
          </div>
        ))}
      </div>
      <h3 className="section-label">Trang bị sở hữu</h3>
      {Object.entries(profile.equipment).map(([id, level]) => (
        <article className="craft-card" key={id}>
          <div className="item-row">
            <Icon id={id} category="equipment" />
            <div>
              <h3>
                {equipment[id].name} +{level}
              </h3>
              <small>
                {Object.entries(equipment[id].stats)
                  .map(
                    ([stat, value]) =>
                      `${({ hp: 'Máu', damage: 'Công', armor: 'Giáp', crit: 'Chí mạng', pickup: 'Hút XP', regen: 'Hồi máu' } as Record<string, string>)[stat]} +${(value * (1 + level * 0.2) * (stat === 'crit' ? 100 : 1)).toFixed(1)}${stat === 'crit' ? '%' : ''}`,
                  )
                  .join(' · ')}
              </small>
            </div>
          </div>
          <div className="card-actions">
            <button
              disabled={profile.equipped[equipment[id].slot] === id}
              onClick={() => bridge.act('equip', id)}
            >
              {profile.equipped[equipment[id].slot] === id ? 'Đang trang bị' : 'Trang bị'}
            </button>
            <button
              disabled={level >= 5 || !canPay(profile, upgradeCost(level))}
              onClick={() => bridge.act('upgrade', id)}
            >
              Cường hóa +{Math.min(5, level + 1)}
            </button>
          </div>
          {level < 5 && <CostLabel cost={upgradeCost(level)} />}
        </article>
      ))}
      <h3 className="section-label">Túi nguyên liệu</h3>
      <div className="material-grid">
        {Object.entries(resourceNames).map(([id, name]) => (
          <div key={id}>
            <Icon id={id} size={32} />
            <span>{name}</span>
            <strong>{profile.resources[id as Resource]}</strong>
          </div>
        ))}
      </div>
      <h3 className="section-label">Bản vẽ</h3>
      <p>
        {profile.blueprints.length
          ? profile.blueprints.map((id) => equipment[id].name).join(' · ')
          : 'Tinh anh và boss giữ bản vẽ đặc biệt.'}
      </p>
    </>
  );
}

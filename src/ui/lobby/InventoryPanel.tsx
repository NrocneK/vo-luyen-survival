import { useEffect, useState } from 'react';
import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { equipment, resourceNames, slotNames } from '../../data/equipment';
import { canPay, upgradeCost } from '../../domain/profile';
import type { Resource, Slot } from '../../shared/models';
import { Icon } from '../AssetIcon';
import { ItemFace, SlotFilter, StatBadges, MaterialCost, compactAmount } from './SurvivalUI';
export function InventoryPanel({
  state,
  bridge,
  filter,
  onFilter,
}: {
  state: GameSnapshot;
  bridge: GameBridge;
  filter: Slot | null;
  onFilter: (slot: Slot | null) => void;
}) {
  const profile = state.profile;
  const entries = Object.keys(profile.equipment).filter(
    (id) => !filter || equipment[id].slot === filter,
  );
  const [selection, setSelection] = useState('');
  const equippedForFilter = filter ? profile.equipped[filter] : null;
  useEffect(() => {
    setSelection(equippedForFilter ?? '');
  }, [filter, equippedForFilter]);
  const id = entries.includes(selection) ? selection : entries[0];
  const item = equipment[id],
    level = profile.equipment[id] ?? 0;
  const equipped = !!item && profile.equipped[item.slot] === id;
  return (
    <>
      <SlotFilter value={filter} onChange={onFilter} />
      <div className="collection-heading">
        <h3>Kho trang bị</h3>
        <span>{entries.length} món</span>
      </div>
      <div className="inventory-layout">
        <div className="bag-grid" aria-label="Trang bị sở hữu">
          {entries.map((key) => (
            <button
              key={key}
              data-item-id={key}
              className={`bag-tile ${id === key ? 'selected' : ''}`}
              aria-pressed={id === key}
              title={equipment[key].name}
              onClick={() => setSelection(key)}
            >
              <ItemFace id={key} level={profile.equipment[key]} />
              <span>{equipment[key].name}</span>
              {profile.equipped[equipment[key].slot] === key && (
                <b className="tile-mark" aria-label="Đang trang bị">
                  ✓
                </b>
              )}
            </button>
          ))}
          {!entries.length && <div className="collection-empty">Chưa có trang bị ở ô này.</div>}
        </div>
        {item && (
          <article className="item-inspector" data-item-id={id}>
            <ItemFace id={id} size={96} level={level} />
            <small>{slotNames[item.slot]}</small>
            <h3>
              {item.name} +{level}
            </h3>
            <StatBadges stats={item.stats} multiplier={1 + level * 0.2} />
            <button
              className="primary-button"
              disabled={
                equipped ||
                profile.realm < (item.requiredRealm ?? 0) ||
                (item.slot === 'relic' && !profile.relicUnlocked)
              }
              onClick={() => bridge.act('equip', id)}
            >
              {equipped
                ? 'Đang trang bị'
                : item.slot === 'relic' && !profile.relicUnlocked
                  ? 'Ô bí bảo chưa mở'
                  : 'Trang bị'}
            </button>
            {equipped && item.slot !== 'weapon' && (
              <button onClick={() => bridge.act('unequip', id)}>Tháo trang bị</button>
            )}
            {level < 5 ? (
              <>
                <MaterialCost cost={upgradeCost(level, id)} profile={profile} />
                <button
                  disabled={!canPay(profile, upgradeCost(level, id))}
                  onClick={() => bridge.act('upgrade', id)}
                >
                  Cường hóa +{level + 1}
                </button>
              </>
            ) : (
              <span className="maxed-label">Cường hóa tối đa</span>
            )}
            <details>
              <summary>Chi tiết trang bị</summary>
              <p>{item.description}</p>
            </details>
          </article>
        )}
      </div>
      <details className="collection-details">
        <summary>
          Nguyên liệu{' '}
          <span>{Object.values(profile.resources).filter((n) => n > 0).length} loại</span>
        </summary>
        <div className="material-grid">
          {Object.entries(resourceNames).map(([key, name]) => (
            <div key={key} title={name}>
              <Icon id={key} size={36} />
              <span>{name}</span>
              <strong>{compactAmount(profile.resources[key as Resource])}</strong>
            </div>
          ))}
        </div>
      </details>
      <details className="collection-details">
        <summary>
          Bản vẽ <span>{profile.blueprints.length}</span>
        </summary>
        <div className="blueprint-grid">
          {profile.blueprints.map((key) => (
            <div key={key} title={equipment[key].name}>
              <ItemFace id={key} size={44} />
              <span>{equipment[key].name}</span>
            </div>
          ))}
        </div>
        {!profile.blueprints.length && <p>Nhận bản vẽ từ tinh anh và boss.</p>}
      </details>
    </>
  );
}

import { useState } from 'react';
import type { GameSnapshot } from '../../shared/types';
import type { Slot } from '../../shared/models';
import { GameBridge } from '../../app/GameBridge';
import { equipment, slotNames } from '../../data/equipment';
import { canPay } from '../../domain/profile';
import { realms } from '../../data/realms';
import { Icon } from '../AssetIcon';
import { ItemFace, SlotFilter, StatBadges, MaterialCost, GameGlyph } from './SurvivalUI';
export function ForgePanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;
  const [filter, setFilter] = useState<Slot | null>(null),
    [selection, setSelection] = useState('');
  const entries = Object.values(equipment).filter((item) => !filter || item.slot === filter);
  const item = entries.find((entry) => entry.id === selection) ?? entries[0];
  const owned = item.id in profile.equipment;
  const reason =
    profile.realm < (item.requiredRealm ?? 0)
      ? `Cần ${realms[item.requiredRealm!].name}`
      : item.special && !profile.blueprints.includes(item.id)
        ? 'Chưa có bản vẽ'
        : '';
  return (
    <>
      <div className="profession-banner">
        <Icon id="de-luyen-khi" category="equipment" size={58} />
        <div>
          <strong>Luyện khí sư</strong>
          <small>{profile.forgeXp} lần chế tạo / cường hóa</small>
        </div>
      </div>
      <SlotFilter value={filter} onChange={setFilter} />
      <div className="inventory-layout forge-layout">
        <div className="bag-grid" aria-label="Công thức trang bị">
          {entries.map((entry) => (
            <button
              key={entry.id}
              data-item-id={entry.id}
              className={`bag-tile ${entry.id === item.id ? 'selected' : ''}`}
              aria-pressed={entry.id === item.id}
              title={entry.name}
              onClick={() => setSelection(entry.id)}
            >
              <ItemFace id={entry.id} />
              <span>{entry.name}</span>
              {entry.id in profile.equipment ? (
                <b className="tile-mark">✓</b>
              ) : (
                (profile.realm < (entry.requiredRealm ?? 0) ||
                  (entry.special && !profile.blueprints.includes(entry.id))) && (
                  <span className="tile-lock">
                    <GameGlyph name="lock" size={14} />
                  </span>
                )
              )}
            </button>
          ))}
        </div>
        <article className="item-inspector" data-item-id={item.id}>
          <ItemFace id={item.id} size={96} />
          <small>
            {slotNames[item.slot]} · {item.special ? 'Cần bản vẽ' : 'Phổ thông'}
          </small>
          <h3>{item.name}</h3>
          <StatBadges stats={item.stats} />
          <MaterialCost cost={item.cost} profile={profile} />
          {reason && !owned && <p className="unlock-condition">{reason}</p>}
          <button
            className="primary-button"
            disabled={owned || !!reason || !canPay(profile, item.cost)}
            onClick={() => bridge.act('forge', item.id)}
          >
            {owned ? 'Đã sở hữu' : 'Chế tạo'}
          </button>
          <details>
            <summary>Chi tiết trang bị</summary>
            <p>{item.description}</p>
            {item.requiredRealm !== undefined && <p>{realms[item.requiredRealm].name}</p>}
          </details>
        </article>
      </div>
    </>
  );
}

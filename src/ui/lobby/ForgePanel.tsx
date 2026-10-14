import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { equipment, slotNames } from '../../data/equipment';
import { canPay } from '../../domain/profile';
import { Icon, CostLabel } from '../AssetIcon';
export function ForgePanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;

  return (
    <>
      <div className="profession-label">
        <Icon id="de-luyen-khi" category="equipment" size={58} />
        <div>
          <strong>Luyện khí sư</strong>
          <small>{profile.forgeXp} lần chế tạo/cường hóa</small>
        </div>
      </div>
      {Object.values(equipment).map((item) => (
        <article className={`craft-card ${item.special ? 'special' : ''}`} key={item.id}>
          <div className="item-row">
            <Icon id={item.id} category="equipment" />
            <div>
              <h3>{item.name}</h3>
              <small>
                {item.special ? 'Đặc biệt · cần bản vẽ' : 'Phổ thông'} · {slotNames[item.slot]}
              </small>
            </div>
          </div>
          <p>{item.description}</p>
          <CostLabel cost={item.cost} />
          <button
            disabled={
              item.id in profile.equipment ||
              (item.special && !profile.blueprints.includes(item.id)) ||
              !canPay(profile, item.cost)
            }
            onClick={() => bridge.act('forge', item.id)}
          >
            {item.id in profile.equipment
              ? 'Đã sở hữu'
              : item.special && !profile.blueprints.includes(item.id)
                ? 'Chưa có bản vẽ'
                : 'Chế tạo'}
          </button>
        </article>
      ))}
    </>
  );
}

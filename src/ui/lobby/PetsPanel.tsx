import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { pets } from '../../data/pets';
import { canPay } from '../../domain/profile';
import { Icon, CostLabel } from '../AssetIcon';
export function PetsPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;

  return (
    <>
      <p>Mọi linh thú đã mở đều cộng nội tại. Chỉ một con được chọn đồng hành chiến đấu.</p>
      {Object.values(pets).map((definition) => {
        const pet = profile.pets[definition.id];
        return (
          <article className="craft-card pet-card" key={definition.id}>
            <div className="item-row">
              <Icon id={definition.egg} size={55} />
              <div>
                <h3>{pet?.evolved ? definition.evolvedName : definition.name}</h3>
                <small>
                  {pet
                    ? `Bậc ${pet.level}/5 ${pet.evolved ? '· Đã tiến hóa' : ''}`
                    : 'Chưa mở · trứng nhận từ tinh anh/boss'}
                </small>
              </div>
            </div>
            <p>{definition.description}</p>
            {!pet ? (
              <>
                <CostLabel cost={definition.cost} />
                <button
                  disabled={!canPay(profile, definition.cost)}
                  onClick={() => bridge.act('unlockPet', definition.id)}
                >
                  Ấp trứng
                </button>
              </>
            ) : (
              <>
                <div className="card-actions">
                  <button
                    onClick={() =>
                      bridge.act(
                        'activePet',
                        profile.activePet === definition.id ? '' : definition.id,
                      )
                    }
                  >
                    {profile.activePet === definition.id
                      ? 'Đang đồng hành · Cho nghỉ'
                      : 'Chọn đồng hành'}
                  </button>
                  <button
                    disabled={
                      pet.level >= 5 ||
                      !canPay(profile, {
                        stone: 20 * pet.level,
                        resources: { 'thuc-an-sung-vat': pet.level + 1 },
                      })
                    }
                    onClick={() => bridge.act('feedPet', definition.id)}
                  >
                    Nuôi dưỡng
                  </button>
                </div>
                <small>
                  Nuôi: {pet.level * 20} linh thạch · {pet.level + 1} thức ăn
                </small>
                <button
                  disabled={
                    pet.evolved ||
                    pet.level < 3 ||
                    !canPay(profile, {
                      stone: 180,
                      resources: { 'tinh-thach-tien-hoa': 2, 'yeu-dan': 4 },
                    })
                  }
                  onClick={() => bridge.act('evolvePet', definition.id)}
                >
                  {pet.evolved ? 'Đã tiến hóa' : 'Tiến hóa · cần bậc 3'}
                </button>
                <CostLabel
                  cost={{ stone: 180, resources: { 'tinh-thach-tien-hoa': 2, 'yeu-dan': 4 } }}
                />
              </>
            )}
          </article>
        );
      })}
    </>
  );
}

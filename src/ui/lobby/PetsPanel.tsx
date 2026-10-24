import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { pets } from '../../data/pets';
import { canPay } from '../../domain/profile';
import { petRealmCap, petFeedCost, worldTwoPetPassive } from '../../data/worldTwoEconomy';
import { ActorPortrait, MaterialCost, StatBadges } from './SurvivalUI';
const evolutionCost = { stone: 180, resources: { 'tinh-thach-tien-hoa': 2, 'yeu-dan': 4 } };
export function PetsPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;
  return (
    <>
      <p className="compact-help">
        Nội tại của mọi linh thú đã mở đều có hiệu lực. Chọn một linh thú đồng hành chiến đấu.
      </p>
      <div className="pet-grid">
        {Object.values(pets).map((definition) => {
          const pet = profile.pets[definition.id],
            active = profile.activePet === definition.id;
          const passive = pet
            ? pet.level > 5
              ? worldTwoPetPassive(definition.id, pet.level)
              : Object.fromEntries(
                  Object.entries(definition.passive).map(([key, value]) => [
                    key,
                    value * pet.level,
                  ]),
                )
            : {};
          const name = pet?.evolved ? definition.evolvedName : definition.name;
          return (
            <article
              className={`survival-pet ${active ? 'active' : ''}`}
              key={definition.id}
              data-pet-id={definition.id}
            >
              <div className="companion-art">
                <ActorPortrait
                  id={pet?.evolved ? definition.evolvedActor : definition.actor}
                  label={name}
                />
                {active && <span>✓ Đồng hành</span>}
                {!pet && <span>Chưa ấp</span>}
              </div>
              <h3>{name}</h3>
              <small>
                {pet
                  ? `Bậc ${pet.level}/${petRealmCap(profile.realm)}${pet.evolved ? ' · Đã tiến hóa' : ''}`
                  : 'Trứng nhận từ tinh anh / boss'}
              </small>
              <progress
                value={pet?.level ?? 0}
                max={petRealmCap(profile.realm)}
                aria-label={`Bậc ${name}`}
              />
              {pet ? (
                <>
                  <StatBadges stats={passive} multiplier={pet.evolved ? 2 : 1} />
                  <button
                    className={active ? 'active-companion' : 'primary-button'}
                    onClick={() => bridge.act('activePet', active ? '' : definition.id)}
                  >
                    {active ? 'Cho nghỉ' : 'Chọn đồng hành'}
                  </button>
                  <MaterialCost cost={petFeedCost(pet.level)} profile={profile} />
                  <button
                    disabled={
                      pet.level >= petRealmCap(profile.realm) ||
                      !canPay(profile, petFeedCost(pet.level))
                    }
                    onClick={() => bridge.act('feedPet', definition.id)}
                  >
                    {pet.level >= petRealmCap(profile.realm)
                      ? 'Đạt trần nuôi hiện tại'
                      : 'Nuôi dưỡng'}
                  </button>
                  {!pet.evolved && (
                    <>
                      <MaterialCost cost={evolutionCost} profile={profile} />
                      <button
                        disabled={pet.level < 3 || !canPay(profile, evolutionCost)}
                        onClick={() => bridge.act('evolvePet', definition.id)}
                      >
                        Tiến hóa · bậc 3
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <MaterialCost cost={definition.cost} profile={profile} />
                  <button
                    className="primary-button"
                    disabled={!canPay(profile, definition.cost)}
                    onClick={() => bridge.act('unlockPet', definition.id)}
                  >
                    Ấp trứng
                  </button>
                </>
              )}
              <details>
                <summary>Đặc tính</summary>
                <p>{definition.description}</p>
                <p>Trần nuôi tăng theo cảnh giới, tối đa bậc 10.</p>
              </details>
            </article>
          );
        })}
      </div>
    </>
  );
}

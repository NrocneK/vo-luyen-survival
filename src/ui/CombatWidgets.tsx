import type { Card, Loot, Resource } from '../shared/models';
import type { GameSnapshot } from '../shared/types';
import { skills } from '../data/skills';
import { awakeningFor } from '../data/awakenings';
import { augments } from '../data/augments';
import { equipment, resourceNames } from '../data/equipment';
import { startingSkill } from '../domain/profile';
import { Icon } from './AssetIcon';
import { GameGlyph, compactAmount } from './lobby/SurvivalUI';

export function RunLoadout({ state }: { state: GameSnapshot }) {
  return (
    <div className="battle-loadout" aria-label="Bộ kỹ năng trong lượt">
      {[startingSkill(state.profile), ...state.profile.selectedSkills].map((id) => {
        const rank = state.run.skills[id] ?? 0,
          def = skills[id],
          awakening = rank >= 6 ? awakeningFor(id) : undefined;
        return (
          <span
            key={id}
            className={rank >= 6 ? 'awakened' : rank === 0 ? 'unlearned' : ''}
            title={`${awakening?.name ?? def.name} · ${rank ? `bậc ${rank}` : 'chưa kích hoạt'}`}
          >
            <Icon id={awakening?.icon ?? def.icon} category="skills" size={37} />
            <b>{rank >= 6 ? '✦' : rank || '—'}</b>
          </span>
        );
      })}
    </div>
  );
}
export function UpgradeProgress({ card, state }: { card: Card; state: GameSnapshot }) {
  const id = card.augment ? augments[card.augment].skill : card.skill;
  const current = id ? (state.run.skills[id] ?? 0) : 0;
  if (card.kind === 'stat')
    return (
      <span className="upgrade-rank stat">
        <GameGlyph name={card.stat ?? 'armor'} size={17} /> Chỉ số trong lượt
      </span>
    );
  if (card.kind === 'augment')
    return (
      <span className="upgrade-rank">
        <GameGlyph name="forge" size={17} /> Biến chiêu · giữ bậc {current}
      </span>
    );
  return (
    <span
      className={`upgrade-rank ${card.kind === 'awaken' ? 'awakens' : ''}`}
      data-current-rank={current}
      data-next-rank={card.kind === 'awaken' ? 6 : current + 1}
    >
      {current === 0 ? (
        'KÍCH HOẠT MỚI'
      ) : (
        <>
          BẬC <b>{current}</b>
          <span>→</span>
          <b>{card.kind === 'awaken' ? '6 ✦' : current + 1}</b>
        </>
      )}
    </span>
  );
}
export function RewardTiles({ loot }: { loot: Loot }) {
  const materials = [
    { id: 'linh-thach', name: 'Linh thạch', amount: loot.stone },
    { id: 'tu-vi-dan', name: 'Tu vi', amount: loot.cultivation },
    ...Object.entries(loot.resources).map(([id, amount]) => ({
      id,
      name: resourceNames[id as Resource],
      amount,
    })),
  ].filter((row) => row.amount > 0);
  return (
    <div className="battle-rewards" role="list" aria-label="Chiến lợi phẩm đã nhận">
      {materials.map((row) => (
        <div
          className="battle-reward"
          key={row.id}
          role="listitem"
          data-loot-id={row.id}
          title={`${row.name}: +${row.amount.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}`}
        >
          <Icon id={row.id} size={43} />
          <strong>+{compactAmount(row.amount)}</strong>
          <span>{row.name}</span>
        </div>
      ))}
      {loot.equipment.map((id, index) => (
        <div
          className="battle-reward item"
          key={`equipment-${id}-${index}`}
          role="listitem"
          data-loot-id={id}
        >
          <Icon id={id} category="equipment" size={48} />
          <strong>{equipment[id]?.name ?? id}</strong>
          <span>Trang bị</span>
        </div>
      ))}
      {loot.blueprints.map((id, index) => (
        <div
          className="battle-reward blueprint"
          key={`blueprint-${id}-${index}`}
          role="listitem"
          data-loot-id={`blueprint-${id}`}
        >
          <Icon id={id} category="equipment" size={48} />
          <strong>{equipment[id]?.name ?? id}</strong>
          <span>
            <GameGlyph name="forge" size={12} /> Bản vẽ
          </span>
        </div>
      ))}
      {!materials.length && !loot.equipment.length && !loot.blueprints.length && (
        <p className="empty-rewards">Chưa nhận chiến lợi phẩm trong lượt này.</p>
      )}
      {loot.equipment.length > 0 && (
        <small className="reward-conversion">
          Trang bị đã sở hữu được đổi thành 25 linh thạch / món.
        </small>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { recipes, pillName } from '../../data/recipes';
import { maxBrew, pillCultivation, permanentPillRemaining } from '../../domain/profile';
import { Icon } from '../AssetIcon';
import { MaterialCost, compactAmount } from './SurvivalUI';
export function AlchemyPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;
  const [quantity, setQuantity] = useState<number | 'max'>(1);
  return (
    <>
      <div className="profession-banner">
        <Icon id="dan-lo" category="equipment" size={58} />
        <div>
          <strong>Đan sư bậc {profile.alchemyXp >= 4 ? 'II' : 'I'}</strong>
          <small>{profile.alchemyXp} viên đã luyện</small>
          <progress
            value={Math.min(4, profile.alchemyXp)}
            max={4}
            aria-label="Tiến độ đan sư bậc II"
          />
        </div>
      </div>
      <div className="batch-choices" aria-label="Số lượng luyện đan">
        {([1, 5, 10, 'max'] as const).map((count) => (
          <button
            key={count}
            aria-pressed={quantity === count}
            className={quantity === count ? 'selected' : ''}
            onClick={() => setQuantity(count)}
          >
            {count === 'max' ? 'Tối đa' : `×${count}`}
          </button>
        ))}
      </div>
      <div className="potion-grid">
        {recipes.map((recipe) => {
          const available = maxBrew(profile, recipe.id),
            count = quantity === 'max' ? available : quantity;
          const cost = {
            stone: (recipe.cost.stone ?? 0) * count,
            resources: Object.fromEntries(
              Object.entries(recipe.cost.resources ?? {}).map(([key, value]) => [
                key,
                value * count,
              ]),
            ),
          };
          const potency =
            recipe.id === 'tu-vi-dan'
              ? `+${compactAmount(pillCultivation(profile))} tu vi`
              : recipe.id === 'hoi-nguyen-dan'
                ? `Hồi ${profile.realm >= 47 ? 60 : 45}% HP`
                : profile.permanentPills < 5
                  ? '+8 HP · +1 công'
                  : '+30 HP · +4 công';
          return (
            <article className="potion-card" key={recipe.id} data-pill-id={recipe.id}>
              <div className="potion-art">
                <Icon id={recipe.id} size={86} />
                <span>×{profile.pills[recipe.id]}</span>
              </div>
              <h3>{pillName(profile.realm, recipe.id)}</h3>
              <strong className="potion-power">{potency}</strong>
              <small>
                {recipe.id === 'cuong-the-dan'
                  ? `Còn ${permanentPillRemaining(profile)} suất`
                  : recipe.id === 'hoi-nguyen-dan'
                    ? 'Mang tối đa 3 viên / lượt'
                    : 'Tích trữ cả tu vi dư'}
              </small>
              <MaterialCost cost={cost} profile={profile} />
              <small>Đủ nguyên liệu: {available} viên</small>
              <button
                className="primary-button"
                disabled={count < 1 || count > available}
                onClick={() => bridge.act('brew', recipe.id, quantity)}
              >
                {profile.alchemyXp < recipe.xp ? 'Cần đan sư bậc II' : `Luyện ${count} viên`}
              </button>
              {recipe.id !== 'hoi-nguyen-dan' && (
                <button
                  disabled={
                    !profile.pills[recipe.id] ||
                    (recipe.id === 'cuong-the-dan' && permanentPillRemaining(profile) <= 0)
                  }
                  onClick={() => bridge.act('pill', recipe.id)}
                >
                  Dùng đan
                </button>
              )}
            </article>
          );
        })}
      </div>
      <details className="collection-details">
        <summary>Hiệu lực & điều kiện</summary>
        <p>
          Đan sư bậc II mở sau 4 viên. Tu vi dư được giữ lại; đột phá thực hiện thủ công khi đủ điều
          kiện. Đan hồi phục có hồi chiêu 20 giây; đan chưa dùng được giữ lại.
        </p>
        <p>
          Đan nền: {profile.permanentPills}/5 · Tẩy Tủy: {profile.worldTwoPills}/5. Suất Tẩy Tủy mở
          từ Siêu Phàm sau khi dùng hết suất nền.
        </p>
      </details>
    </>
  );
}

import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { recipes } from '../../data/recipes';
import { canPay } from '../../domain/profile';
import { Icon, CostLabel } from '../AssetIcon';
export function AlchemyPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;

  return (
    <>
      <div className="profession-label">
        <Icon id="dan-lo" category="equipment" size={58} />
        <div>
          <strong>Đan sư {profile.alchemyXp >= 4 ? 'bậc II' : 'bậc I'}</strong>
          <small>Đã luyện {profile.alchemyXp} viên · bậc II sau 4 viên</small>
        </div>
      </div>
      {recipes.map((recipe) => (
        <article className="craft-card" key={recipe.id}>
          <div className="item-row">
            <Icon id={recipe.id} />
            <div>
              <h3>{recipe.name}</h3>
              <small>Trong kho: {profile.pills[recipe.id]}</small>
            </div>
          </div>
          <p>{recipe.description}</p>
          <CostLabel cost={recipe.cost} />
          <div className="card-actions">
            <button
              disabled={profile.alchemyXp < recipe.xp || !canPay(profile, recipe.cost)}
              onClick={() => bridge.act('brew', recipe.id)}
            >
              {profile.alchemyXp < recipe.xp ? 'Cần đan sư bậc II' : 'Luyện 1 viên'}
            </button>
            {recipe.id !== 'hoi-nguyen-dan' && (
              <button
                disabled={
                  !profile.pills[recipe.id] ||
                  (recipe.id === 'cuong-the-dan' && profile.permanentPills >= 5)
                }
                onClick={() => bridge.act('pill', recipe.id)}
              >
                Dùng đan
              </button>
            )}
          </div>
        </article>
      ))}
      <p className="help-note">
        Cường Thể Đan đã dùng: {profile.permanentPills}/5. Hồi Nguyên Đan chưa dùng trong màn sẽ
        được giữ lại.
      </p>
    </>
  );
}

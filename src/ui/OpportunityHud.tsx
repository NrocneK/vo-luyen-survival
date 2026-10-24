import type { OpportunityView } from '../shared/opportunities';
import { GameBridge } from '../app/GameBridge';
import './opportunities.css';
import { opportunityRules } from '../data/opportunities';

export function OpportunityHud({
  opportunity: item,
  bridge,
  playing,
}: {
  opportunity: OpportunityView | null;
  bridge: GameBridge;
  playing: boolean;
}) {
  if (!item) return null;
  const resolved = item.phase === 'completed' || item.phase === 'expired';
  return (
    <aside className={`opportunity-hud phase-${item.phase}`} aria-label="Cơ duyên tùy chọn">
      <div className="opportunity-heading">
        <span>✦ CƠ DUYÊN · TÙY CHỌN</span>
        <output aria-label="Thời gian cơ duyên">
          {Math.ceil(Math.max(0, item.remaining - 1e-6))}s
        </output>
      </div>
      <strong>{item.name}</strong>
      <p>{item.hint}</p>
      {item.phase === 'active' && (
        <>
          <div
            className="opportunity-progress"
            role="progressbar"
            aria-label={item.kind === 'trial' ? 'Tiến độ tụ linh' : 'Hộ vệ đã hạ'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(item.progress * 100)}
          >
            <i style={{ width: `${item.progress * 100}%` }} />
          </div>
          <small>
            {item.kind === 'trial'
              ? `Tụ linh ${Math.floor(item.progress * opportunityRules.trialCharge + 1e-6)}/${opportunityRules.trialCharge} giây`
              : `Còn ${item.enemies} hộ vệ`}
          </small>
        </>
      )}
      {!resolved && (
        <>
          <details>
            <summary>Chiến lợi phẩm</summary>
            <p>{item.reward}</p>
            <small>
              XP/hồi máu dùng ngay. Thưởng khác tạm giữ; thắng nhận 100%, thua/rút lui nhận 30% theo
              luật vật phẩm.
            </small>
          </details>
          {item.phase !== 'active' && (
            <button
              disabled={!playing || !item.interactable}
              onClick={() => bridge.dispatch({ type: 'interact' })}
            >
              {item.interactable ? (
                <>
                  <kbd>E</kbd> {item.action}
                </>
              ) : (
                `✦ Cách ${item.distance.toFixed(1)} · xem bản đồ nhỏ`
              )}
            </button>
          )}
        </>
      )}
    </aside>
  );
}

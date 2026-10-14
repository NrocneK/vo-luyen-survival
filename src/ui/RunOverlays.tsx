import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '../shared/types';
import { GameBridge } from '../app/GameBridge';
import { resourceNames, equipment } from '../data/equipment';
import { Icon } from './AssetIcon';
import type { Resource } from '../shared/models';

export function clock(time: number): string {
  return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
}
export function RunOverlays({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [state.mode, state.run.level]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (state.mode === 'levelup' && /^[123]$/.test(event.key) && !event.repeat) {
        const card = state.cards[Number(event.key) - 1];
        if (card) bridge.dispatch({ type: 'card', id: card.id });
      }
      if (event.key === 'Tab') {
        const buttons = panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) return;
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.mode, state.cards, bridge]);
  if (state.mode === 'levelup')
    return (
      <div className="modal-backdrop">
        <div
          className="upgrade-panel"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
        >
          <span className="overline">LỊCH LUYỆN · CẤP {state.run.level}</span>
          <h2 id="upgrade-title">Lĩnh ngộ</h2>
          <p>Thời gian đã dừng. Chọn một trong ba cơ duyên.</p>
          <div className="upgrade-cards">
            {state.cards.map((card, index) => (
              <button
                key={card.id}
                className={`upgrade-card ${card.kind}`}
                onClick={() => bridge.dispatch({ type: 'card', id: card.id })}
              >
                <span className="card-type">
                  {card.kind === 'awaken'
                    ? 'THỨC TỈNH'
                    : card.kind === 'skill'
                      ? 'KỸ NĂNG'
                      : 'CƯỜNG HÓA'}
                </span>
                <Icon id={card.icon} category="skills" size={82} />
                <h3>{card.name}</h3>
                <p>{card.description}</p>
                <span className="card-key">
                  Chọn <kbd>{index + 1}</kbd>
                </span>
              </button>
            ))}
          </div>
          <small>Chỉ hiệu lực trong lượt này · hỗ trợ tối đa bậc 5</small>
        </div>
      </div>
    );
  const result = state.result;
  if (state.mode !== 'result' || !result) return null;
  return (
    <div className="modal-backdrop">
      <div
        className={`result-panel ${result.won ? 'victory' : ''}`}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <span className="overline">
          HẮC PHONG SƠN · {result.won ? 'ĐÃ VƯỢT QUA' : 'KẾT THÚC LỊCH LUYỆN'}
        </span>
        <h2 id="result-title">{result.won ? 'Khải hoàn' : 'Chờ ngày tái chiến'}</h2>
        <p>{result.reason}</p>
        <div className="run-summary">
          <span>
            <strong>{clock(result.time)}</strong>Thời gian
          </span>
          <span>
            <strong>{result.kills}</strong>Quái bị hạ
          </span>
          <span>
            <strong>{result.level}</strong>Cấp trong màn
          </span>
        </div>
        <h3>Phần thưởng đã nhận · {result.won ? '100%' : '30%'}</h3>
        <div className="reward-grid">
          <div>
            <Icon id="linh-thach" size={32} />
            <span>Linh thạch</span>
            <strong>+{result.rewards.stone}</strong>
          </div>
          <div>
            <Icon id="tu-vi-dan" size={32} />
            <span>Tu vi</span>
            <strong>+{result.rewards.cultivation.toFixed(1)}</strong>
          </div>
          {Object.entries(result.rewards.resources)
            .filter(([, amount]) => amount > 0)
            .map(([id, amount]) => (
              <div key={id}>
                <Icon id={id} size={32} />
                <span>{resourceNames[id as Resource]}</span>
                <strong>+{amount}</strong>
              </div>
            ))}
        </div>
        {result.rewards.equipment.length > 0 && (
          <p>
            Trang bị: {result.rewards.equipment.map((id) => equipment[id].name).join(' · ')}. Món đã
            có được đổi thành 25 linh thạch.
          </p>
        )}
        {result.rewards.blueprints.length > 0 && (
          <p>Bản vẽ: {result.rewards.blueprints.map((id) => equipment[id].name).join(' · ')}</p>
        )}
        <p className="help-note">
          Tiến trình đã lưu. XP, bậc kỹ năng và thẻ cường hóa trong lượt được đặt lại.
        </p>
        <button className="primary-button" onClick={() => bridge.dispatch({ type: 'leave' })}>
          Trở về Lăng Tiêu Các <span>↗</span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '../shared/types';
import type { GameBridge } from '../app/GameBridge';
import { damageMultipliers, timeScales } from '../data/testing';
import './test-tools.css';

export function TestTools({
  state,
  bridge,
  open,
  onToggle,
}: {
  state: GameSnapshot;
  bridge: GameBridge;
  open: boolean;
  onToggle: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);
  const inLobby = state.mode === 'menu';
  const disabled = !state.test.enabled;
  return (
    <aside className={`test-tools ${open ? 'is-open' : ''}`} aria-label="Hỗ trợ test">
      <button
        className={`test-tools-toggle ${state.test.enabled ? 'is-enabled' : ''}`}
        aria-expanded={open}
        aria-controls="test-tools-panel"
        onClick={onToggle}
      >
        <span aria-hidden="true">⚒</span> Hỗ trợ test
        {state.test.enabled && <small>TEST · ×{state.test.timeScale}</small>}
      </button>
      {open && (
        <section
          id="test-tools-panel"
          className="test-tools-panel"
          aria-labelledby="test-tools-title"
        >
          <header>
            <div>
              <span className="overline">CÔNG CỤ KIỂM THỬ</span>
              <h2 id="test-tools-title">Thử nhanh thế giới</h2>
            </div>
            <button ref={closeButton} aria-label="Đóng hỗ trợ test" onClick={onToggle}>
              ×
            </button>
          </header>
          <p className="test-isolation">Tiến trình test riêng</p>
          <p>Tiến trình chính được giữ lại. Tắt chế độ test tại lobby để trở về nhân vật thật.</p>
          <div className="test-action-grid">
            <button
              disabled={!state.profile.settings.sound}
              onClick={() => {
                bridge.activateAudio();
                bridge.audio.play('attack-fist');
              }}
            >
              Thử tiếng quyền
            </button>
            <button
              disabled={!state.profile.settings.sound}
              onClick={() => {
                bridge.activateAudio();
                bridge.audio.play('attack-sword');
              }}
            >
              Thử tiếng kiếm
            </button>
          </div>
          {!state.profile.settings.sound && (
            <small>Hiệu ứng âm thanh đang tắt trong Thiết lập.</small>
          )}
          <label className="test-setting-row">
            <span>Bật chế độ test</span>
            <input
              type="checkbox"
              checked={state.test.enabled}
              disabled={!inLobby}
              onChange={(event) => bridge.testSettings({ enabled: event.target.checked })}
            />
          </label>
          {!inLobby && (
            <small>Bật / tắt và cấp vật phẩm tại lobby. Hệ số đổi được ngay trong màn.</small>
          )}
          {state.mode === 'paused' && <small>Đang tạm dừng để chỉnh công cụ test.</small>}
          {state.mode === 'levelup' && (
            <small>Đang chờ chọn thẻ. Đóng bảng này để tiếp tục lĩnh ngộ.</small>
          )}
          <fieldset disabled={disabled}>
            <legend>Vượt ải</legend>
            <span className="test-field-label">Tốc độ thời gian trong màn</span>
            <div className="test-choice-row" role="group" aria-label="Tốc độ test">
              {timeScales.map((value) => (
                <button
                  key={value}
                  aria-pressed={state.test.timeScale === value}
                  onClick={() => bridge.testSettings({ timeScale: value })}
                >
                  ×{value}
                </button>
              ))}
            </div>
            <span className="test-field-label">Sát thương nhân vật và linh thú</span>
            <div className="test-choice-row" role="group" aria-label="Hệ số sát thương test">
              {damageMultipliers.map((value) => (
                <button
                  key={value}
                  aria-pressed={state.test.damageMultiplier === value}
                  onClick={() => bridge.testSettings({ damageMultiplier: value })}
                >
                  ×{value}
                </button>
              ))}
            </div>
            <label className="test-setting-row">
              <span>Không giới hạn tài nguyên</span>
              <input
                type="checkbox"
                checked={state.test.unlimitedResources}
                onChange={(event) =>
                  bridge.testSettings({ unlimitedResources: event.target.checked })
                }
              />
            </label>
            <small>
              Linh thạch, nguyên liệu và đan dược tự bù về 1.000.000 sau khi sử dụng. Hồi đan vẫn có
              thời gian chờ.
            </small>
          </fieldset>
          <fieldset disabled={disabled || !inLobby}>
            <legend>Chuẩn bị nhân vật</legend>
            <div className="test-action-grid">
              <button onClick={() => bridge.testAction('cultivation', 10_000)}>
                +10.000 tu vi
              </button>
              <button onClick={() => bridge.testAction('cultivation', 100_000)}>
                +100.000 tu vi
              </button>
              <button className="test-wide" onClick={() => bridge.testAction('realm')}>
                Đạt Thần Du đỉnh phong tầng 10
              </button>
              <button className="test-wide" onClick={() => bridge.testAction('gear')}>
                Cấp toàn bộ trang bị +5, bản vẽ và linh thú
              </button>
            </div>
            <small>Tu vi được cộng trực tiếp. Trang bị vừa cấp vẫn cần chọn mặc tại kho đồ.</small>
          </fieldset>
          <p className="test-tools-note">
            Mọi màn được mở khi bật test; không tự ghi thành tích thắng màn.
          </p>
          <button className="test-close" onClick={onToggle}>
            {inLobby ? 'Đóng công cụ test' : 'Trở lại màn chơi'}
          </button>
        </section>
      )}
    </aside>
  );
}

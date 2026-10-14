import { HomePanel } from './lobby/HomePanel';
import { CultivationPanel } from './lobby/CultivationPanel';
import { AlchemyPanel } from './lobby/AlchemyPanel';
import { ForgePanel } from './lobby/ForgePanel';
import { InventoryPanel } from './lobby/InventoryPanel';
import { PetsPanel } from './lobby/PetsPanel';
import { ExpeditionPanel } from './lobby/ExpeditionPanel';
import { useState, useRef } from 'react';
import { GameBridge } from '../app/GameBridge';
import { Icon } from './AssetIcon';
import { realms } from '../data/realms';
import { lobbyAreas, lobbyDoors } from '../data/lobby';
import type { GameSnapshot, LobbyArea } from '../shared/types';

const stations = [
  { id: 'home', name: 'Sân trung tâm', symbol: '⌂', subtitle: 'Nơi tâm an định' },
  { id: 'cultivate', name: 'Tu luyện', symbol: '◉', subtitle: 'Hấp thụ linh khí · Đột phá' },
  { id: 'alchemy', name: 'Luyện đan', symbol: '♨', subtitle: 'Đan lô · Dược liệu' },
  { id: 'forge', name: 'Luyện khí', symbol: '⚒', subtitle: 'Chế tạo · Bản vẽ' },
  { id: 'inventory', name: 'Trang bị', symbol: '◇', subtitle: 'Kho đồ · Cường hóa' },
  { id: 'pets', name: 'Linh thú', symbol: '✧', subtitle: 'Nuôi dưỡng · Tiến hóa' },
  { id: 'expedition', name: 'Lịch luyện', symbol: '↗', subtitle: 'Bộ kỹ năng · Hắc Phong Sơn' },
  { id: 'settings', name: 'Thiết lập', symbol: '⚙', subtitle: 'Âm thanh · Tiến trình' },
];
export function Lobby({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const [station, setStation] = useState('home');
  const [confirmImport, setConfirmImport] = useState<File | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const profile = state.profile,
    realm = realms[profile.realm];
  const current = stations.find((item) => item.id === station)!;
  const area = lobbyAreas[state.lobbyArea];
  const selectStation = (id: string) => {
    setStation(id);
    const destination: LobbyArea = ['alchemy', 'forge', 'cultivate', 'pets'].includes(id)
      ? (id as LobbyArea)
      : 'courtyard';
    if (destination !== state.lobbyArea) bridge.dispatch({ type: 'travel', area: destination });
    bridge.activateAudio();
    bridge.audio.play('ui');
    bridge.toast('');
  };
  return (
    <section className="lobby" data-area={state.lobbyArea} aria-label="Lobby Lăng Tiêu Các">
      <div className="lobby-shade" />
      <header className="lobby-header">
        <div className="lobby-brand">
          <span className="seal">武</span>
          <div>
            <strong>Võ Luyện</strong>
            <small>TRUNG ĐÔ · LĂNG TIÊU CÁC</small>
          </div>
        </div>
        <div className="resource-header">
          <span>
            <Icon id="linh-thach" size={30} />
            <strong>{Math.floor(profile.stone)}</strong>
            <small>Linh thạch</small>
          </span>
          <span>
            <Icon id="tu-vi-dan" size={30} />
            <strong>{profile.cultivation.toFixed(1)}</strong>
            <small>Tu vi</small>
          </span>
          <span className="save-indicator">● {state.saveOk ? 'Đã tự lưu' : 'Chưa lưu được'}</span>
        </div>
      </header>
      <nav className="station-nav" aria-label="Các khu tại Lăng Tiêu Các">
        {stations.map((item) => (
          <button
            key={item.id}
            className={station === item.id ? 'active' : ''}
            aria-pressed={station === item.id}
            onClick={() => selectStation(item.id)}
          >
            <span>{item.symbol}</span>
            <strong>{item.name}</strong>
          </button>
        ))}
      </nav>
      <div className="lobby-location" key={state.lobbyArea} aria-live="polite">
        <span className="overline">LĂNG TIÊU CÁC</span>
        <h2>{area.name}</h2>
        <small>{area.description}</small>
      </div>
      <div className="courtyard-caption">
        <span className="overline">ĐỆ TỬ LĂNG TIÊU CÁC</span>
        <h1>Dương Khai</h1>
        <span>{realm.name}</span>
        <div className="realm-line" />
      </div>
      <div className="lobby-routes" aria-label="Lối đi giữa các khu">
        {state.lobbyArea === 'courtyard' ? (
          lobbyDoors.map((door) => (
            <button
              key={door.area}
              className={`room-door door-${door.area}`}
              onClick={() => selectStation(door.area)}
              aria-label={`Đi đến ${lobbyAreas[door.area].name}`}
            >
              <span className="door-arrow">{door.symbol}</span>
              <span>
                <strong>{lobbyAreas[door.area].name}</strong>
                <small>{door.direction}</small>
              </span>
            </button>
          ))
        ) : (
          <button className="room-door door-return" onClick={() => selectStation('home')}>
            <span className="door-arrow">←</span>
            <span>
              <strong>Về sân trung tâm</strong>
              <small>Lăng Tiêu Các</small>
            </span>
          </button>
        )}
      </div>
      <aside className="station-panel" aria-label={`Khu ${current.name}`}>
        <header>
          <span className="overline">{current.subtitle}</span>
          <h2>{current.name}</h2>
          <span className="panel-rule" />
        </header>
        <div className="station-body" data-station={station}>
          {station === 'home' && <HomePanel state={state} onStation={selectStation} />}
          {station === 'cultivate' && <CultivationPanel state={state} bridge={bridge} />}
          {station === 'alchemy' && <AlchemyPanel state={state} bridge={bridge} />}
          {station === 'forge' && <ForgePanel state={state} bridge={bridge} />}
          {station === 'inventory' && <InventoryPanel state={state} bridge={bridge} />}
          {station === 'pets' && <PetsPanel state={state} bridge={bridge} />}
          {station === 'expedition' && <ExpeditionPanel state={state} bridge={bridge} />}
          {station === 'settings' && (
            <>
              <h3 className="section-label">Âm thanh & hiển thị</h3>
              {(['music', 'sound', 'reducedEffects'] as const).map((key) => (
                <label className="setting-row" key={key}>
                  <span>
                    {key === 'music'
                      ? 'Nhạc nền'
                      : key === 'sound'
                        ? 'Hiệu ứng âm thanh'
                        : 'Giảm số nổi sát thương'}
                  </span>
                  <input
                    type="checkbox"
                    checked={profile.settings[key]}
                    onChange={(event) => bridge.setting(key, event.target.checked)}
                  />
                </label>
              ))}
              <h3 className="section-label">Tiến trình cá nhân</h3>
              <p>
                Tự lưu cảnh giới, tài nguyên, trang bị và linh thú. Lượt chiến đấu bắt đầu lại khi
                tải trang.
              </p>
              <button className="secondary-button" onClick={() => bridge.export()}>
                Xuất file tiến trình
              </button>
              <button className="secondary-button" onClick={() => importInput.current?.click()}>
                Nhập file tiến trình
              </button>
              <input
                ref={importInput}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setConfirmImport(file);
                  event.target.value = '';
                }}
              />
              {!state.saveOk && (
                <p role="alert">
                  Trình duyệt không cho ghi dữ liệu. Hãy xuất file tiến trình để giữ lại.
                </p>
              )}
              <div className="lobby-note">
                Hắc Phong Sơn là màn survival được thiết kế cho game; các đợt quái không chuyển
                nguyên xi một trận chiến trong truyện.
              </div>
            </>
          )}
        </div>
        {station === 'expedition' && (
          <div className="station-action">
            <button
              id="start-game"
              className="primary-button"
              disabled={state.status !== 'ready'}
              onClick={() => bridge.dispatch({ type: 'start' })}
            >
              {state.status === 'loading'
                ? `Đang tải · ${Math.round(state.progress * 100)}%`
                : 'Vào Hắc Phong Sơn'}
              <span>↗</span>
            </button>
          </div>
        )}
      </aside>
      <footer className="lobby-footer">
        <span>HẮC PHONG SƠN · CHƯƠNG KHỞI ĐẦU</span>
        <span>VÕ LUYỆN 1.1</span>
      </footer>
      {state.status === 'loading' && (
        <div className="asset-loading">
          <span>Chuẩn bị động phủ · {Math.round(state.progress * 100)}%</span>
          <progress value={state.progress} max="1" />
        </div>
      )}
      {state.error && (
        <div className="toast error" role="alert">
          {state.error}
          <button onClick={() => window.location.reload()}>Tải lại</button>
        </div>
      )}
      {state.toast && (
        <div className="toast" role="status">
          {state.toast}
          <button aria-label="Đóng thông báo" onClick={() => bridge.toast('')}>
            ×
          </button>
        </div>
      )}
      {confirmImport && (
        <div className="modal-backdrop">
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Xác nhận nhập tiến trình"
          >
            <h2>Nhập tiến trình</h2>
            <p>
              File {confirmImport.name} sẽ thay tiến trình hiện tại. Bạn có thể xuất bản hiện tại
              trước khi nhập.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                void bridge.import(confirmImport);
                setConfirmImport(null);
              }}
            >
              Nhập file này
            </button>
            <button className="secondary-button" onClick={() => setConfirmImport(null)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

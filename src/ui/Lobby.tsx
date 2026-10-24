import { HomePanel } from './lobby/HomePanel';
import { CultivationPanel } from './lobby/CultivationPanel';
import { AlchemyPanel } from './lobby/AlchemyPanel';
import { ForgePanel } from './lobby/ForgePanel';
import { InventoryPanel } from './lobby/InventoryPanel';
import { PetsPanel } from './lobby/PetsPanel';
import { ExpeditionPanel } from './lobby/ExpeditionPanel';
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { GameBridge } from '../app/GameBridge';
import { Icon } from './AssetIcon';
import { GameGlyph, ItemFace, compactAmount } from './lobby/SurvivalUI';
import { realms } from '../data/realms';
import { equipment, slotNames } from '../data/equipment';
import { permanentStats } from '../domain/profile';
import { stageById } from '../data/stages';
import { stageUnlocked, hubName, currentWorld } from '../data/campaign';
import { lobbyAreas, lobbyComposition } from '../data/lobby';
import type { GameSnapshot, LobbyArea, Direction } from '../shared/types';
import type { Slot } from '../shared/models';
import './lobby-survival.css';

const stations = [
  { id: 'home', name: 'Căn cứ', glyph: 'home', subtitle: 'Hành trình' },
  { id: 'inventory', name: 'Trang bị', glyph: 'inventory', subtitle: 'Kho đồ · Cường hóa' },
  { id: 'cultivate', name: 'Tu luyện', glyph: 'cultivate', subtitle: 'Cảnh giới · Võ học' },
  { id: 'alchemy', name: 'Luyện đan', glyph: 'alchemy', subtitle: 'Đan dược' },
  { id: 'forge', name: 'Luyện khí', glyph: 'forge', subtitle: 'Chế tạo trang bị' },
  { id: 'pets', name: 'Linh thú', glyph: 'pets', subtitle: 'Đồng hành' },
  { id: 'expedition', name: 'Lịch luyện', glyph: 'expedition', subtitle: 'Chọn màn · Chuẩn bị' },
  { id: 'settings', name: 'Thiết lập', glyph: 'settings', subtitle: 'Âm thanh · Tiến trình' },
];
const directions: Direction[] = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
export function Lobby({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const station = state.lobbyStation ?? 'home';
  const [slotFilter, setSlotFilter] = useState<Slot | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: Math.max(480, window.innerHeight),
  });
  const [confirmImport, setConfirmImport] = useState<File | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const resize = () =>
      setViewport({ width: window.innerWidth, height: Math.max(480, window.innerHeight) });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const profile = state.profile,
    realm = realms[profile.realm],
    base = hubName(profile);
  const current = stations.find((s) => s.id === station)!;
  const selectedStage = stageById(state.stageId);
  const panelOpen = state.lobbyPanelOpen ?? true;
  const layout = lobbyComposition(viewport.width, viewport.height, station, panelOpen);
  const stats = permanentStats(profile);
  const selectStation = (id: string) => {
    bridge.update({ lobbyStation: id, lobbyPanelOpen: true });
    const destination: LobbyArea = ['alchemy', 'forge', 'cultivate', 'pets'].includes(id)
      ? (id as LobbyArea)
      : 'courtyard';
    if (destination !== state.lobbyArea) bridge.dispatch({ type: 'travel', area: destination });
    bridge.activateAudio();
    bridge.audio.play('ui');
    bridge.toast('');
  };
  const rotate = (step: number) => {
    const i = directions.indexOf(state.lobbyFacing ?? 'S');
    bridge.update({ lobbyFacing: directions[(i + step + 8) % 8] });
  };
  const inspectSlot = (slot: Slot) => {
    setSlotFilter(slot);
    selectStation('inventory');
  };
  const style = {
    '--hero-x': `${layout.x * 100}%`,
    '--hero-y': `${layout.y * 100}%`,
    '--identity-y': `${layout.identityY}px`,
    '--gear-y': `${layout.gearY}px`,
    '--panel-y': `${layout.panelY}px`,
  } as CSSProperties;
  return (
    <section
      className="lobby survival-lobby"
      data-area={state.lobbyArea}
      data-world={currentWorld(profile)}
      data-station={station}
      data-panel={panelOpen ? 'open' : 'closed'}
      data-expanded={panelExpanded}
      style={style}
      aria-label={`Căn cứ ${base}`}
    >
      <div className="lobby-shade" />
      <header className="lobby-header">
        <div className="lobby-brand">
          <span className="seal">武</span>
          <div>
            <strong>Võ Luyện</strong>
            <small>{base}</small>
          </div>
        </div>
        <div className="resource-header">
          <span title={`${Math.floor(profile.stone).toLocaleString('vi-VN')} linh thạch`}>
            <Icon id="linh-thach" size={32} />
            <strong>{compactAmount(Math.floor(profile.stone))}</strong>
            <small>Linh thạch</small>
          </span>
          <span title={`${profile.cultivation.toLocaleString('vi-VN')} tu vi`}>
            <Icon id="tu-vi-dan" size={32} />
            <strong>{compactAmount(profile.cultivation)}</strong>
            <small>Tu vi</small>
          </span>
          {currentWorld(profile) === 2 && (
            <span title="Linh Tài Thông Huyền">
              <Icon id="linh-tai-thong-huyen" size={30} />
              <strong>{compactAmount(profile.resources['linh-tai-thong-huyen'])}</strong>
            </span>
          )}
          <span
            className="save-indicator"
            title={state.saveOk ? 'Tiến trình đã tự lưu' : 'Chưa lưu được'}
          >
            ●
          </span>
        </div>
      </header>
      <div className="hub-heading">
        <span className="overline">
          {currentWorld(profile) === 1 ? 'TRUNG ĐÔ' : 'THÔNG HUYỀN ĐẠI LỤC'}
        </span>
        <span>{lobbyAreas[state.lobbyArea].name}</span>
      </div>
      <div className="hero-identity">
        <span className="overline">
          {currentWorld(profile) === 1
            ? 'ĐỆ TỬ LĂNG TIÊU CÁC'
            : profile.stageProgress['thanh-lang']?.wins
              ? 'THÁNH CHỦ CỬU THIÊN'
              : 'HÀNH GIẢ THÔNG HUYỀN'}
        </span>
        <h1>Dương Khai</h1>
        <span className="hero-realm">{realm.name}</span>
      </div>
      <div className="hero-turn" aria-label="Xoay nhân vật">
        <button aria-label="Xoay nhân vật sang trái" onClick={() => rotate(-1)}>
          ‹
        </button>
        <GameGlyph name="rotate" size={18} />
        <button aria-label="Xoay nhân vật sang phải" onClick={() => rotate(1)}>
          ›
        </button>
      </div>
      {(station === 'home' || station === 'inventory') && (
        <div className="hero-equipment" aria-label="Bảy ô trang bị">
          {(Object.keys(slotNames) as Slot[]).map((slot, i) => {
            const id = profile.equipped[slot];
            const locked = slot === 'relic' && !profile.relicUnlocked;
            return (
              <button
                key={slot}
                className={`hero-slot hero-slot-${i}`}
                title={`${slotNames[slot]} · ${id ? equipment[id].name : locked ? 'Mở sau Hắc Phong Sơn' : 'Chưa trang bị'}`}
                aria-label={`Xem ô ${slotNames[slot]}`}
                onClick={() => inspectSlot(slot)}
              >
                <ItemFace
                  id={id}
                  empty={slot}
                  size={49}
                  level={id ? profile.equipment[id] : undefined}
                />
                {locked && (
                  <span className="slot-lock">
                    <GameGlyph name="lock" size={15} />
                  </span>
                )}
                <small>{slotNames[slot]}</small>
              </button>
            );
          })}
        </div>
      )}
      {station === 'home' && (
        <div className="hero-stat-card" aria-label="Chỉ số nhân vật">
          <span className="overline">THUỘC TÍNH</span>
          {[
            ['hp', 'Sinh lực', Math.round(stats.hp)],
            ['damage', 'Công kích', stats.damage.toFixed(1)],
            ['armor', 'Giáp', stats.armor.toFixed(1)],
            ['crit', 'Chí mạng', `${Math.round(stats.crit * 100)}%`],
          ].map(([key, label, value]) => (
            <div key={key}>
              <GameGlyph name={String(key)} size={25} />
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
          <span className="hero-stat-footer">
            {profile.wins} chiến thắng <i>·</i> {profile.runs} lượt
          </span>
        </div>
      )}
      {!panelOpen && (
        <button className="reopen-panel" onClick={() => bridge.update({ lobbyPanelOpen: true })}>
          <GameGlyph name={current.glyph} />
          {current.name} <span>›</span>
        </button>
      )}
      {panelOpen && (
        <aside
          className="station-panel survival-panel"
          data-station={station}
          aria-label={`Khu ${current.name}`}
        >
          <header>
            <GameGlyph name={current.glyph} size={32} />
            <div>
              <span className="overline">{current.subtitle}</span>
              <h2>{current.name}</h2>
            </div>
            <button
              className="panel-expand"
              aria-label={panelExpanded ? 'Thu chiều cao bảng chức năng' : 'Mở rộng bảng chức năng'}
              aria-pressed={panelExpanded}
              onClick={() => setPanelExpanded(!panelExpanded)}
            >
              {panelExpanded ? '↙' : '↗'}
            </button>
            <button
              className="panel-minimize"
              aria-label="Thu gọn bảng chức năng"
              onClick={() => bridge.update({ lobbyPanelOpen: false })}
            >
              −
            </button>
          </header>
          <div className="station-body" data-station={station}>
            {station === 'home' && (
              <HomePanel state={state} bridge={bridge} onStation={selectStation} />
            )}
            {station === 'inventory' && (
              <InventoryPanel
                state={state}
                bridge={bridge}
                filter={slotFilter}
                onFilter={setSlotFilter}
              />
            )}
            {station === 'cultivate' && <CultivationPanel state={state} bridge={bridge} />}
            {station === 'alchemy' && <AlchemyPanel state={state} bridge={bridge} />}
            {station === 'forge' && <ForgePanel state={state} bridge={bridge} />}
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
                      onChange={(e) => bridge.setting(key, e.target.checked)}
                    />
                  </label>
                ))}
                <h3 className="section-label">Tiến trình</h3>
                <div className="settings-actions">
                  <button className="secondary-button" onClick={() => bridge.export()}>
                    Xuất file tiến trình
                  </button>
                  <button className="secondary-button" onClick={() => importInput.current?.click()}>
                    Nhập file tiến trình
                  </button>
                </div>
                <input
                  ref={importInput}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setConfirmImport(file);
                    e.target.value = '';
                  }}
                />
                <p className="help-note">
                  Tự lưu trên trình duyệt này. Xuất file để chuyển thiết bị.
                </p>
                {!state.saveOk && (
                  <p role="alert">Chưa ghi được dữ liệu. Hãy xuất file tiến trình.</p>
                )}
              </>
            )}
          </div>
          {station === 'expedition' && (
            <div className="station-action">
              <button
                id="start-game"
                className="primary-button"
                disabled={
                  state.status !== 'ready' ||
                  (!state.test.enabled && !stageUnlocked(profile, selectedStage.id))
                }
                onClick={() => bridge.dispatch({ type: 'start' })}
              >
                {state.status === 'loading'
                  ? `Đang tải · ${Math.round(state.progress * 100)}%`
                  : state.test.enabled || stageUnlocked(profile, selectedStage.id)
                    ? `Vào ${selectedStage.name}`
                    : 'Chưa đủ điều kiện lịch luyện'}
                <span>⚔</span>
              </button>
            </div>
          )}
        </aside>
      )}
      <nav className="station-nav survival-nav" aria-label={`Các khu tại ${base}`}>
        {stations.map((item) => (
          <button
            key={item.id}
            className={station === item.id ? 'active' : ''}
            aria-pressed={station === item.id}
            onClick={() => selectStation(item.id)}
          >
            <GameGlyph name={item.glyph} size={29} />
            <strong>{item.name}</strong>
            <span className="nav-active-mark" />
          </button>
        ))}
      </nav>
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

import { GameBridge } from '../app/GameBridge';
import { stage } from '../data/stages';
import { skills } from '../data/skills';
import { equipment } from '../data/equipment';
import { startingSkill } from '../domain/profile';
import { MiniMap } from './MiniMap';
import { Icon } from './AssetIcon';
import { clock } from './RunOverlays';
import type { GameSnapshot } from '../shared/types';

export function GameHud({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const run = state.run,
    prepared = [startingSkill(state.profile), ...state.profile.selectedSkills];
  return (
    <>
      <header className="game-hud">
        <div className="location-plaque">
          <span className="seal">武</span>
          <div>
            <small>TRUNG ĐÔ · LỊCH LUYỆN</small>
            <h1>{stage.name}</h1>
          </div>
        </div>
        <div className="run-clock">
          <strong aria-label="Thời gian trong màn">{clock(run.time)}</strong>
          <span>{run.time >= stage.duration ? 'TIÊU DIỆT LANG VƯƠNG' : 'BOSS SAU 10:00'}</span>
        </div>
        <button
          className="pause-button"
          disabled={state.mode !== 'playing'}
          onClick={() => bridge.dispatch({ type: 'pause' })}
          aria-label="Tạm dừng trò chơi"
        >
          Ⅱ <kbd>ESC</kbd>
        </button>
      </header>
      <div className="xp-track">
        <div style={{ width: `${Math.min(100, (run.xp / run.nextXp) * 100)}%` }} />
        <span>
          Cấp {run.level} · XP {Math.floor(run.xp)}/{run.nextXp}
        </span>
      </div>
      {run.boss && (
        <div className="boss-hud">
          <span>{run.boss.name}</span>
          <div>
            <i style={{ width: `${Math.max(0, (run.boss.hp / run.boss.maxHp) * 100)}%` }} />
          </div>
          <small>
            {Math.ceil(run.boss.hp)} / {Math.ceil(run.boss.maxHp)}
          </small>
        </div>
      )}
      {run.notice && (
        <div className="run-notice" role="status">
          {run.notice}
        </div>
      )}
      <aside className="map-panel">
        <div className="map-heading">
          <span>{state.area}</span>
          <span>B</span>
        </div>
        <MiniMap position={state.position} />
        <div className="map-coordinates">
          <output aria-label="Vị trí nhân vật">
            {state.position.x.toFixed(2)} / {state.position.y.toFixed(2)}
          </output>
          <span>{state.direction}</span>
        </div>
        <div className="zoom-controls">
          <button
            aria-label="Thu nhỏ bản đồ"
            disabled={state.zoom <= 1.5}
            onClick={() => bridge.dispatch({ type: 'zoom', zoom: state.zoom - 0.5 })}
          >
            −
          </button>
          <output aria-label="Độ phóng đại">{state.zoom.toFixed(1)}×</output>
          <button
            aria-label="Phóng lớn bản đồ"
            disabled={state.zoom >= 3}
            onClick={() => bridge.dispatch({ type: 'zoom', zoom: state.zoom + 0.5 })}
          >
            +
          </button>
        </div>
      </aside>
      <footer className="combat-hud">
        <div className="player-status">
          <div>
            <strong>Dương Khai</strong>
            <small>{equipment[state.profile.equipped.weapon!].name}</small>
          </div>
          <div className="health-track">
            <i style={{ width: `${Math.max(0, (run.hp / run.maxHp) * 100)}%` }} />
            <output aria-label="Sinh lực">
              {Math.ceil(run.hp)} / {Math.ceil(run.maxHp)}
            </output>
          </div>
          <small>
            {run.kills} quái bị hạ · {run.enemies} đang truy đuổi
          </small>
        </div>
        <div className="skill-bar">
          {prepared.map((id) => {
            const rank = run.skills[id] ?? 0,
              skill = skills[id];
            return (
              <div
                key={id}
                className={`skill-slot ${rank === 0 ? 'locked' : ''} ${rank === 6 ? 'awakened' : ''}`}
                title={`${skill.name} · ${rank ? `Bậc ${rank}` : 'Chờ thẻ kích hoạt'}`}
              >
                <Icon
                  category="skills"
                  id={
                    rank === 6
                      ? id === 'cuong-quyen'
                        ? 'long-viem-quyen'
                        : 'kiem-khi-phong-bao'
                      : skill.icon
                  }
                  size={40}
                />
                <span>{rank === 6 ? '✦' : rank === 0 ? '◇' : '•'.repeat(rank)}</span>
              </div>
            );
          })}
        </div>
        <div className="consumables">
          <button
            aria-label="Dùng Hồi Nguyên Đan"
            disabled={
              state.mode !== 'playing' ||
              run.pills < 1 ||
              run.potionCooldown > 0 ||
              run.hp >= run.maxHp
            }
            onClick={() => bridge.dispatch({ type: 'potion' })}
          >
            <Icon id="hoi-nguyen-dan" size={32} />
            <span>
              <kbd>Q</kbd>{' '}
              {run.potionCooldown > 0 ? `${Math.ceil(run.potionCooldown)}s` : `×${run.pills}`}
            </span>
          </button>
          <button
            aria-label="Lướt né"
            disabled={state.mode !== 'playing' || run.dashCooldown > 0}
            onClick={() => bridge.dispatch({ type: 'dash' })}
          >
            <span className="dash-symbol">➶</span>
            <span>
              <kbd>SPACE</kbd> {run.dashCooldown > 0 ? `${run.dashCooldown.toFixed(1)}s` : 'Lướt'}
            </span>
          </button>
        </div>
      </footer>
    </>
  );
}

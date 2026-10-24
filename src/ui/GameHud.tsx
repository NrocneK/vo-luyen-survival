import { useState } from 'react';
import { GameBridge } from '../app/GameBridge';
import { stageById } from '../data/stages';
import { skills } from '../data/skills';
import { equipment } from '../data/equipment';
import { cameraSettings } from '../data/camera';
import { timeScales } from '../data/testing';
import { startingSkill } from '../domain/profile';
import { MiniMap } from './MiniMap';
import { StageMechanicHud } from './StageMechanicHud';
import { Icon } from './AssetIcon';
import { clock } from './RunOverlays';
import type { GameSnapshot } from '../shared/types';
import { augments } from '../data/augments';
import { awakeningFor } from '../data/awakenings';
import { OpportunityHud } from './OpportunityHud';
import { MissionHud } from './MissionHud';
import { pillName } from '../data/recipes';
import { GameGlyph } from './lobby/SurvivalUI';
import './awakenings.css';
import './augments.css';
import './combat-survival.css';

export function GameHud({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const run = state.run,
    prepared = [startingSkill(state.profile), ...state.profile.selectedSkills];
  const stage = stageById(state.stageId);
  const [mapOpen, setMapOpen] = useState(true),
    [inspected, setInspected] = useState<string | null>(null);
  const selected = inspected && skills[inspected],
    selectedRank = inspected ? (run.skills[inspected] ?? 0) : 0;
  const branch = inspected
    ? run.augments.map((id) => augments[id]).find((def) => def.skill === inspected)
    : undefined;
  const awakened = inspected && selectedRank >= 6 ? awakeningFor(inspected) : undefined;
  const hp = Math.max(0, Math.min(100, (run.hp / Math.max(1, run.maxHp)) * 100));
  const xp = Math.max(0, Math.min(100, (run.xp / Math.max(1, run.nextXp)) * 100));
  const charges = run.dashCharges ?? (run.dashCooldown > 0 ? 0 : 1);
  return (
    <section
      className="survival-combat-ui"
      aria-label="Giao diện chiến đấu"
      data-boss={!!run.boss}
      inert={state.mode !== 'playing'}
    >
      <header className="game-hud" data-chapter={stage.chapter ?? 1}>
        <div className="location-plaque">
          <GameGlyph name="expedition" size={26} />
          <div>
            <small>
              {stage.chapter === 2 ? 'THÔNG HUYỀN' : 'TRUNG ĐÔ'} · MÀN{' '}
              {String(stage.stageIndex + 1).padStart(2, '0')}/{stage.chapter === 2 ? '14' : '06'}
            </small>
            <h1>{stage.name}</h1>
          </div>
        </div>
        <div className="run-clock">
          <GameGlyph name="timer" size={21} />
          <strong aria-label="Thời gian trong màn">{clock(run.time)}</strong>
          <span>
            {run.mission
              ? `PHA ${run.mission.phase} · ${Math.floor(run.mission.progress * 100)}%`
              : run.time >= stage.duration
                ? 'BOSS XUẤT HIỆN'
                : `BOSS · ${clock(Math.ceil(Math.max(0, stage.duration - run.time)))}`}
          </span>
          {state.test.enabled && (
            <button
              className="test-speed-cycle"
              aria-label={`Tốc độ vượt ải x${state.test.timeScale}`}
              title="Đổi tốc độ vượt ải"
              onClick={() =>
                bridge.testSettings({
                  timeScale:
                    timeScales[(timeScales.indexOf(state.test.timeScale) + 1) % timeScales.length],
                })
              }
            >
              ×{state.test.timeScale}
            </button>
          )}
        </div>
        <div className="run-header-actions">
          <span className="run-kills" title={`${run.enemies} kẻ địch đang truy đuổi`}>
            <GameGlyph name="damage" size={19} />
            <b>{run.kills}</b>
            <small>Hạ địch</small>
          </span>
          <button
            className="pause-button"
            disabled={state.mode !== 'playing'}
            onClick={() => bridge.dispatch({ type: 'pause' })}
            aria-label="Tạm dừng trò chơi"
          >
            <GameGlyph name="pause" size={22} />
            <kbd>ESC</kbd>
          </button>
        </div>
      </header>
      <div
        className="xp-track"
        role="progressbar"
        aria-label="Kinh nghiệm trong màn"
        aria-valuemin={0}
        aria-valuemax={run.nextXp}
        aria-valuenow={Math.min(run.xp, run.nextXp)}
      >
        <div style={{ width: `${xp}%` }} />
        <span>
          <b>CẤP {run.level}</b>
          <small>
            XP {Math.floor(run.xp)} / {run.nextXp}
          </small>
        </span>
      </div>
      {run.boss && (
        <div className="boss-hud">
          <div className="boss-name">
            <GameGlyph name="damage" size={19} />
            <span>{run.boss.name}</span>
            <small>
              {Math.ceil(run.boss.hp)} / {Math.ceil(run.boss.maxHp)}
            </small>
          </div>
          <div
            className="boss-health-track"
            role="progressbar"
            aria-label="Sinh lực boss"
            aria-valuemin={0}
            aria-valuemax={run.boss.maxHp}
            aria-valuenow={Math.max(0, run.boss.hp)}
          >
            <i
              style={{
                width: `${Math.max(0, (run.boss.hp / Math.max(1, run.boss.maxHp)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
      {run.notice && (
        <div className="run-notice" role="status">
          {run.notice}
        </div>
      )}
      <div className="run-objectives">
        <MissionHud mission={run.mission} bridge={bridge} playing={state.mode === 'playing'} />
        <StageMechanicHud mechanic={run.mechanic} />
        <OpportunityHud
          opportunity={run.opportunity}
          bridge={bridge}
          playing={state.mode === 'playing'}
        />
      </div>
      <aside className={`map-panel ${mapOpen ? '' : 'is-collapsed'}`}>
        <button
          className="map-heading"
          aria-label={mapOpen ? 'Thu gọn bản đồ nhỏ' : 'Mở bản đồ nhỏ'}
          aria-expanded={mapOpen}
          onClick={() => setMapOpen(!mapOpen)}
        >
          <GameGlyph name="map" size={17} />
          <span>{state.area}</span>
          <b>{mapOpen ? '−' : '+'}</b>
        </button>
        {mapOpen && (
          <>
            <MiniMap
              position={state.position}
              stageId={stage.id}
              target={run.mechanic?.target}
              opportunity={run.opportunity}
              mission={run.mission}
            />
            <div className="map-coordinates">
              <output aria-label="Vị trí nhân vật">
                {state.position.x.toFixed(2)} / {state.position.y.toFixed(2)}
              </output>
              <span>{state.direction}</span>
            </div>
          </>
        )}
        <div className="zoom-controls">
          <button
            aria-label="Thu nhỏ bản đồ"
            disabled={state.zoom <= cameraSettings.minZoom}
            onClick={() =>
              bridge.dispatch({ type: 'zoom', zoom: state.zoom - cameraSettings.step })
            }
          >
            −
          </button>
          <output aria-label="Độ phóng đại">{Number(state.zoom.toFixed(2))}×</output>
          <button
            aria-label="Phóng lớn bản đồ"
            disabled={state.zoom >= cameraSettings.maxZoom}
            onClick={() =>
              bridge.dispatch({ type: 'zoom', zoom: state.zoom + cameraSettings.step })
            }
          >
            +
          </button>
        </div>
      </aside>
      <footer className="combat-hud">
        <div className="player-status" data-low={hp <= 25}>
          <div className="player-status-name">
            <span className="player-sigil">
              <GameGlyph name="hp" size={23} />
            </span>
            <div>
              <strong>Dương Khai</strong>
              <small>{equipment[state.profile.equipped.weapon ?? '']?.name ?? 'Quyền pháp'}</small>
            </div>
            <b>
              {Math.round(hp)}
              <small>%</small>
            </b>
          </div>
          <div className="health-track">
            <i style={{ width: `${hp}%` }} />
            <output aria-label="Sinh lực">
              {Math.ceil(run.hp)} / {Math.ceil(run.maxHp)}
            </output>
          </div>
          {run.burst ? (
            <div className={`burst-status ${run.burst.active ? 'active' : ''}`}>
              <Icon id="nhap-ma" category="skills" size={20} />
              <span>
                Nhập Ma ·{' '}
                {run.burst.active ? 'Bộc phát' : run.burst.remaining > 0 ? 'Hồi phục' : 'Sẵn sàng'}
              </span>
              <b>{run.burst.remaining.toFixed(1)}s</b>
            </div>
          ) : (
            <small className="player-status-hint">
              <GameGlyph name="armor" size={13} /> {run.kills} hạ địch · {run.enemies} địch truy
              đuổi
            </small>
          )}
        </div>
        <div className="skill-dock">
          <span className="skill-dock-label">VÕ HỌC TRONG LƯỢT</span>
          <div className="skill-bar">
            {prepared.map((id) => {
              const rank = run.skills[id] ?? 0,
                skill = skills[id],
                augment = run.augments.map((key) => augments[key]).find((def) => def.skill === id),
                awakening = rank >= 6 ? awakeningFor(id) : undefined;
              return (
                <button
                  key={id}
                  className={`skill-slot ${rank === 0 ? 'locked' : ''} ${rank >= 6 ? 'awakened' : ''} ${augment ? 'augmented' : ''}`}
                  data-skill-id={id}
                  aria-label={`Xem ${awakening?.name ?? skill.name} · ${rank ? `bậc ${rank}` : 'chờ kích hoạt'}`}
                  aria-pressed={inspected === id}
                  title={`${awakening?.name ?? skill.name}${augment ? ` · ${augment.name}` : ''}`}
                  onClick={() => setInspected(inspected === id ? null : id)}
                >
                  <Icon category="skills" id={awakening?.icon ?? skill.icon} size={43} />
                  <span className="skill-rank">
                    {rank >= 6
                      ? '✦'
                      : rank === 0
                        ? 'CHỜ'
                        : Array.from({ length: 5 }, (_, i) => (
                            <i key={i} className={i < rank ? 'filled' : ''} />
                          ))}
                  </span>
                  {augment && (
                    <b className="augment-marker" aria-label={`Biến chiêu ${augment.name}`}>
                      ◆
                    </b>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="consumables">
          <button
            data-action="potion"
            aria-label={`Dùng ${pillName(state.profile.realm, 'hoi-nguyen-dan')}`}
            disabled={
              state.mode !== 'playing' ||
              run.pills < 1 ||
              run.potionCooldown > 0 ||
              run.hp >= run.maxHp
            }
            onClick={() => bridge.dispatch({ type: 'potion' })}
            data-cooling={run.potionCooldown > 0}
          >
            <kbd>Q</kbd>
            <Icon id="hoi-nguyen-dan" size={39} />
            <b>{run.potionCooldown > 0 ? `${Math.ceil(run.potionCooldown)}s` : `×${run.pills}`}</b>
            <small>Hồi phục</small>
          </button>
          <button
            data-action="dash"
            aria-label="Lướt né"
            disabled={state.mode !== 'playing' || charges <= 0}
            onClick={() => bridge.dispatch({ type: 'dash' })}
            data-cooling={charges <= 0}
          >
            <kbd>SPACE</kbd>
            <GameGlyph name="dash" size={35} />
            <b>
              {charges > 0
                ? run.dashMaxCharges === 2
                  ? `${charges}/2`
                  : 'Sẵn sàng'
                : `${run.dashCooldown.toFixed(1)}s`}
            </b>
            <small>
              Lướt né
              {charges > 0 && run.dashCooldown > 0 ? ` · ${run.dashCooldown.toFixed(1)}s` : ''}
            </small>
          </button>
        </div>
      </footer>
      {selected && (
        <div className="battle-skill-popover" role="status">
          <Icon id={awakened?.icon ?? selected.icon} category="skills" size={49} />
          <div>
            <strong>{awakened?.name ?? selected.name}</strong>
            <small>
              {selectedRank >= 6
                ? 'Thức tỉnh · bậc 6'
                : selectedRank
                  ? `Bậc ${selectedRank}`
                  : 'Chờ chọn thẻ kích hoạt'}
            </small>
            <p>{awakened?.identity ?? selected.description}</p>
            {branch && (
              <p className="branch-description">
                ◆ {branch.name} · {branch.description}
              </p>
            )}
          </div>
          <button aria-label="Đóng chi tiết kỹ năng" onClick={() => setInspected(null)}>
            <GameGlyph name="close" size={17} />
          </button>
        </div>
      )}
    </section>
  );
}

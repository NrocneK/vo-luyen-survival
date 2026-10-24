import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '../shared/types';
import { GameBridge } from '../app/GameBridge';
import { stageById } from '../data/stages';
import { worldProgress, hubName } from '../data/campaign';
import { Icon } from './AssetIcon';
import { RunBuild } from './RunBuild';
import { augments } from '../data/augments';
import { skills } from '../data/skills';
import { startingSkill } from '../domain/profile';
import { AwakeningGuide } from './AwakeningGuide';
import { CombatReport } from './CombatReport';
import { endingFor } from '../data/chapterEnding';
import { GameGlyph, compactAmount } from './lobby/SurvivalUI';
import { RunLoadout, UpgradeProgress, RewardTiles } from './CombatWidgets';
import './augments.css';
import './combat-survival.css';

export function clock(time: number): string {
  return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
}
export function RunOverlays({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.mode === 'result') panel.current?.focus({ preventScroll: true });
    else
      panel.current
        ?.querySelector<HTMLButtonElement>('.upgrade-card')
        ?.focus({ preventScroll: true });
  }, [state.mode, state.run.level, state.run.rerollsRemaining]);
  useEffect(() => {
    if (!['levelup', 'result'].includes(state.mode)) return;
    const onKey = (event: KeyboardEvent) => {
      if (state.chapterEndingOpen || state.storyOpen) return;
      const editing =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName));
      if (
        state.mode === 'levelup' &&
        !editing &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.repeat
      ) {
        if (/^[123]$/.test(event.key)) {
          const card = state.cards[Number(event.key) - 1];
          if (card) {
            event.preventDefault();
            bridge.dispatch({ type: 'card', id: card.id });
          }
        } else if (event.code === 'KeyR') {
          event.preventDefault();
          bridge.dispatch({ type: 'reroll' });
        }
      }
      if (event.key === 'Tab') {
        const controls = [
          ...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), summary') ?? []),
        ].filter((el) => el.getClientRects().length);
        if (!controls.length) return;
        const first = controls[0],
          last = controls.at(-1)!;
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
  }, [state.mode, state.cards, state.chapterEndingOpen, state.storyOpen, bridge]);
  if (state.mode === 'levelup')
    return (
      <div className="modal-backdrop survival-overlay" data-overlay="levelup">
        <div
          className="upgrade-panel survival-upgrade"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
        >
          <header className="upgrade-heading">
            <div className="upgrade-level">
              <GameGlyph name="level" size={25} />
              <b>{state.run.level}</b>
            </div>
            <div>
              <span className="overline">ĐỘT PHÁ TRONG TRẬN</span>
              <h2 id="upgrade-title">Lĩnh ngộ</h2>
              <p>Chọn một nâng cấp cho lượt này.</p>
            </div>
            <span className="time-stopped">
              <GameGlyph name="pause" size={13} /> Thời gian đã dừng
            </span>
          </header>
          <div className="upgrade-scroll">
            <div className="upgrade-cards">
              {state.cards.map((card, index) => (
                <button
                  key={card.id}
                  data-card-id={card.id}
                  className={`upgrade-card ${card.kind}`}
                  onClick={() => bridge.dispatch({ type: 'card', id: card.id })}
                >
                  <span className="card-type">
                    {card.kind === 'awaken'
                      ? 'THỨC TỈNH'
                      : card.kind === 'augment'
                        ? 'BIẾN CHIÊU'
                        : card.kind === 'skill'
                          ? 'VÕ HỌC'
                          : 'THUỘC TÍNH'}
                  </span>
                  <span className="card-art">
                    <Icon id={card.icon} category="skills" size={91} />
                    <i />
                  </span>
                  <div className="card-content">
                    <UpgradeProgress card={card} state={state} />
                    <h3>{card.name}</h3>
                    {card.kind === 'awaken' && card.skill && (
                      <span className="card-skill-name">
                        {skills[card.skill].name} bậc 5 + {skills[skills[card.skill].linked!].name}{' '}
                        từ bậc 1
                      </span>
                    )}
                    {card.augment && (
                      <span className="card-skill-name">
                        {skills[augments[card.augment].skill].name} · chọn một nhánh
                      </span>
                    )}
                    <p>{card.description}</p>
                  </div>
                  <span className="card-key">
                    Chọn nâng cấp <kbd>{index + 1}</kbd>
                  </span>
                </button>
              ))}
            </div>
            <div className="upgrade-current">
              <span>ĐANG TU LUYỆN</span>
              <RunLoadout state={state} />
              <small>Hỗ trợ tối đa bậc 5 · tấn công có thể thức tỉnh bậc 6</small>
            </div>
            <div className="upgrade-guides">
              <RunBuild chosen={state.run.augments} />
              <AwakeningGuide
                prepared={[startingSkill(state.profile), ...state.profile.selectedSkills]}
                ranks={state.run.skills}
              />
            </div>
          </div>
          <footer className="upgrade-actions">
            <div className="reroll-copy">
              <GameGlyph name="rotate" size={23} />
              <span>
                <strong>
                  {state.run.rerollsRemaining > 0 ? 'Một lần đổi miễn phí' : 'Đã dùng lượt đổi thẻ'}
                </strong>
                <small role="status">
                  {state.run.rerollsRemaining > 0
                    ? 'Áp dụng cho cả lượt chơi'
                    : 'Tiếp tục bằng một thẻ phía trên'}
                </small>
              </span>
            </div>
            <button
              className="reroll-button"
              disabled={state.run.rerollsRemaining < 1}
              onClick={() => bridge.dispatch({ type: 'reroll' })}
            >
              {state.run.rerollsRemaining > 0 ? 'Đổi ba thẻ' : 'Hết lượt đổi'}
              <kbd>R</kbd>
            </button>
          </footer>
        </div>
      </div>
    );
  const result = state.result;
  if (state.mode !== 'result' || !result) return null;
  const stage = stageById(result.stageId),
    world = stage.chapter === 2 ? 2 : 1,
    progress = worldProgress(state.profile, world),
    ending = endingFor(world);
  const outcome = result.won
    ? 'victory'
    : result.outcome === 'retreat'
      ? 'retreat'
      : result.outcome === 'mission-failed'
        ? 'mission-failed'
        : 'defeat';
  return (
    <div className="modal-backdrop survival-overlay" data-overlay="result">
      <div
        className={`result-panel survival-result ${result.won ? 'victory' : ''}`}
        data-outcome={outcome}
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <header className="result-heading">
          <div className="outcome-emblem">
            <GameGlyph
              name={result.won ? 'trophy' : outcome === 'retreat' ? 'expedition' : 'armor'}
              size={43}
            />
          </div>
          <div>
            <span className="overline">{stage.name}</span>
            <h2 id="result-title">
              {result.won
                ? 'Khải hoàn'
                : outcome === 'retreat'
                  ? 'Chủ động rút lui'
                  : outcome === 'mission-failed'
                    ? 'Nhiệm vụ thất bại'
                    : 'Chờ ngày tái chiến'}
            </h2>
            <p>{result.reason}</p>
          </div>
          <span className="outcome-label">
            {result.won ? 'CHIẾN THẮNG' : outcome === 'retreat' ? 'RÚT LUI' : 'THẤT BẠI'}
          </span>
        </header>
        <div className="result-scroll">
          <div className="run-summary">
            {[
              ['timer', clock(result.time), 'Thời gian'],
              ['damage', result.kills.toLocaleString('vi-VN'), 'Hạ địch'],
              ['level', String(result.level), 'Cấp trong màn'],
              ['crit', compactAmount(result.combat?.damageDealt ?? 0), 'Sát thương'],
            ].map(([glyph, value, label]) => (
              <span
                key={label}
                title={
                  label === 'Sát thương'
                    ? result.combat?.damageDealt.toLocaleString('vi-VN')
                    : undefined
                }
              >
                <GameGlyph name={glyph} size={23} />
                <strong>{value}</strong>
                <small>{label}</small>
              </span>
            ))}
          </div>
          <div className="result-columns">
            <section className="result-loot">
              <div className="result-section-heading">
                <GameGlyph name="inventory" size={23} />
                <h3>Chiến lợi phẩm</h3>
                <span>{result.won ? '100%' : '30%'} đã nhận</span>
              </div>
              {result.opportunities && (
                <div className="opportunity-result">
                  <span>
                    <b>{result.opportunities.completed}</b> cơ duyên đã nhận
                  </span>
                  <small>{result.opportunities.missed} bỏ lỡ / chưa nhận</small>
                </div>
              )}
              <RewardTiles loot={result.rewards} />
              {result.firstClearRewards && (
                <details className="first-clear-rewards">
                  <summary>Thưởng vượt lần đầu · đã cộng vào tổng</summary>
                  <RewardTiles loot={result.firstClearRewards} />
                </details>
              )}
              {result.newStageUnlocked && (
                <div className="milestone-unlocked">
                  <GameGlyph name="expedition" size={25} />
                  <div>
                    <span className="overline">MỐC MỚI ĐÃ MỞ</span>
                    <strong>{stageById(result.newStageUnlocked).name}</strong>
                  </div>
                </div>
              )}
              {result.won && progress.completed && (
                <div className="world-complete">
                  <span className="overline">PHẦN {world} HOÀN THÀNH</span>
                  <h3>{ending.title}</h3>
                  <button
                    className="secondary-button"
                    onClick={() => bridge.dispatch({ type: 'chapter-ending', open: true, world })}
                  >
                    Xem kết chương {world === 1 ? 'Trung Đô' : 'Thông Huyền'}
                  </button>
                </div>
              )}
              {result.won && progress.cleared === progress.total && !progress.completed && (
                <p className="completion-reminder">
                  {world === 1
                    ? 'Đã vượt sáu mốc. Đạt Thần Du đỉnh phong tầng 10 để hoàn thành Trung Đô.'
                    : 'Đã vượt mười bốn mốc. Đạt Nhập Thánh tam tầng đỉnh phong để hoàn thành Thông Huyền.'}
                </p>
              )}
              <div className="result-loadout">
                <h3>Võ học đã mang theo</h3>
                <RunLoadout state={state} />
                <RunBuild chosen={state.run.augments} />
                <small>XP và bậc kỹ năng trong lượt được đặt lại.</small>
              </div>
            </section>
            <CombatReport state={state} />
          </div>
        </div>
        <footer className="result-footer">
          <span className={`result-save ${state.saveOk ? '' : 'error'}`}>
            <GameGlyph name={state.saveOk ? 'check' : 'inventory'} size={18} />
            {state.saveOk
              ? state.test.enabled
                ? 'Đã lưu tiến trình test'
                : 'Đã lưu tiến trình'
              : 'Chưa ghi được tiến trình'}
          </span>
          <button className="primary-button" onClick={() => bridge.dispatch({ type: 'leave' })}>
            Trở về {hubName(state.profile)}
            <GameGlyph name="home" size={19} />
          </button>
        </footer>
      </div>
    </div>
  );
}

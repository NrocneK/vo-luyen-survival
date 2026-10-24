import { useEffect, useRef } from 'react';
import { GameBridge } from '../app/GameBridge';
import { stageById } from '../data/stages';
import { RunBuild } from './RunBuild';
import { AwakeningGuide } from './AwakeningGuide';
import { startingSkill } from '../domain/profile';
import { GameGlyph } from './lobby/SurvivalUI';
import { RunLoadout } from './CombatWidgets';
import { clock } from './RunOverlays';
import './combat-survival.css';

export function PauseMenu({ bridge }: { bridge: GameBridge }) {
  const panel = useRef<HTMLDivElement>(null),
    state = bridge.getSnapshot(),
    stage = stageById(state.stageId);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = [
        ...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),summary') ?? []),
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
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div className="pause-backdrop survival-overlay" data-overlay="pause">
      <div
        className="pause-panel survival-pause"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <span className="pause-emblem">
          <GameGlyph name="pause" size={32} />
        </span>
        <span className="overline">{stage.name}</span>
        <h2 id="pause-title">Tạm dừng</h2>
        <div className="pause-stats">
          <span>
            <GameGlyph name="timer" size={19} />
            {clock(state.run.time)}
          </span>
          <span>
            <GameGlyph name="damage" size={19} />
            {state.run.kills} hạ địch
          </span>
          <span>
            <GameGlyph name="level" size={19} />
            Cấp {state.run.level}
          </span>
        </div>
        <RunLoadout state={state} />
        <button className="primary-button" onClick={() => bridge.dispatch({ type: 'resume' })}>
          <GameGlyph name="play" size={19} />
          Tiếp tục<kbd>ESC</kbd>
        </button>
        <button
          className="secondary-button retreat-button"
          onClick={() => bridge.dispatch({ type: 'leave' })}
        >
          <GameGlyph name="expedition" size={18} />
          Rút lui<span>Nhận 30% thưởng</span>
        </button>
        <RunBuild chosen={state.run.augments} compact />
        <AwakeningGuide
          prepared={[startingSkill(state.profile), ...state.profile.selectedSkills]}
          ranks={state.run.skills}
        />
        <small className="pause-controls">
          <span>
            <kbd>Q</kbd> Dùng đan
          </span>
          <span>
            <kbd>SPACE</kbd> Lướt né
          </span>
          <span>
            <kbd>E</kbd> Tương tác
          </span>
        </small>
      </div>
    </div>
  );
}

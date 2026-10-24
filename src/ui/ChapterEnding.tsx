import { useEffect, useRef } from 'react';
import { GameBridge } from '../app/GameBridge';
import type { GameSnapshot } from '../shared/types';
import { endingFor } from '../data/chapterEnding';
import { allStages } from '../data/stages';
import { worldProgress, currentWorld, hubName } from '../data/campaign';
import './chapter-ending.css';

export function ChapterEnding({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const world = state.chapterEndingWorld ?? currentWorld(state.profile);
  const chapterEnding = endingFor(world);
  const stages = allStages.filter((stage) => (stage.chapter ?? 1) === world);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        bridge.dispatch({ type: 'chapter-ending', open: false });
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        panel.current?.querySelector('button')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [bridge]);
  if (!state.chapterEndingOpen || !worldProgress(state.profile, world).completed) return null;
  return (
    <div className="modal-backdrop chapter-backdrop">
      <div
        className="chapter-ending"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-title"
        aria-describedby="chapter-subtitle"
      >
        <div className="chapter-sky" aria-hidden="true">
          <span className="chapter-moon" />
          <span className="chapter-mountain far" />
          <span className="chapter-mountain near" />
          <span className="chapter-seal">道</span>
        </div>
        <div className="chapter-content">
          <span className="overline">{chapterEnding.chapter} · HOÀN THÀNH</span>
          <h2 id="chapter-title">{chapterEnding.title}</h2>
          <p className="chapter-subtitle" id="chapter-subtitle">
            {chapterEnding.subtitle}
          </p>
          <div className="chapter-story">
            {chapterEnding.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="chapter-milestones" aria-label={`${stages.length} mốc đã vượt qua`}>
            {stages.map((stage) => (
              <span key={stage.id}>
                <i aria-hidden="true">✓</i>
                {stage.name}
              </span>
            ))}
          </div>
          <p className="chapter-realm">
            {world === 1 ? 'Thần Du đỉnh phong · tầng 10' : 'Nhập Thánh tam tầng đỉnh phong'}
          </p>
          <p className="chapter-keepsake">{chapterEnding.keepsake}</p>
          <p className="chapter-next">{chapterEnding.next}</p>
          {state.test.enabled && (
            <p className="chapter-test">Tiến trình test · không ảnh hưởng bản lưu chính</p>
          )}
          <button
            className="primary-button"
            onClick={() => bridge.dispatch({ type: 'chapter-ending', open: false })}
          >
            {state.mode === 'result' ? 'Xem tổng kết trận' : `Trở về ${hubName(state.profile)}`}{' '}
            <span>↗</span>
          </button>
          <small className="chapter-replay-hint">
            Có thể xem lại kết chương tại sân trung tâm.
          </small>
        </div>
      </div>
    </div>
  );
}

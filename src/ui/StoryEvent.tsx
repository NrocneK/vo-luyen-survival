import { useEffect, useRef, useState } from 'react';
import type { GameSnapshot } from '../shared/types';
import type { GameBridge } from '../app/GameBridge';
import { maDoStory } from '../data/worldTwoStory';
export function StoryEvent({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const [page, setPage] = useState(0),
    [choice, setChoice] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        bridge.dispatch({ type: 'story', open: false });
      }
      if (e.key === 'Tab') {
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [],
        );
        if (!buttons.length) return;
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
        e.preventDefault();
        buttons[(at + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      if (previous?.isConnected) previous.focus();
    };
  }, [bridge]);
  if (!state.storyOpen) return null;
  const entry = maDoStory.pages[page],
    choices = 'choices' in entry ? entry.choices : undefined;
  return (
    <div className="modal-backdrop chapter-backdrop">
      <div
        className="chapter-ending story-dialog"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-title"
        tabIndex={-1}
      >
        <div className="chapter-content">
          <span className="overline">
            HỒI ỨC · {page + 1}/{maDoStory.pages.length}
          </span>
          <h2 id="story-title">{maDoStory.title}</h2>
          <h3>{entry.title}</h3>
          <p className="story-prose">{entry.text}</p>
          {choices && (
            <div className="story-choices">
              {choices.map((item, i) => (
                <button
                  key={item.label}
                  aria-pressed={choice === i}
                  className={choice === i ? 'selected' : ''}
                  onClick={() => setChoice(i)}
                >
                  {item.label}
                </button>
              ))}
              {choice !== null && <p>{choices[choice].text}</p>}
            </div>
          )}
          <div className="card-actions">
            <button
              className="primary-button"
              disabled={!!choices && choice === null}
              onClick={() =>
                page < maDoStory.pages.length - 1
                  ? setPage(page + 1)
                  : bridge.dispatch({ type: 'story', open: false })
              }
            >
              {page === maDoStory.pages.length - 1 ? 'Khép lại hồi ức' : 'Tiếp tục'} →
            </button>
            <button
              className="secondary-button"
              onClick={() => bridge.dispatch({ type: 'story', open: false })}
            >
              Bỏ qua
            </button>
          </div>
          <small>Có thể xem lại Ma Đô tại sân trung tâm.</small>
        </div>
      </div>
    </div>
  );
}

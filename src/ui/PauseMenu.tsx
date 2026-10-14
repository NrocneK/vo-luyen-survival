import { useEffect, useRef } from 'react';
import { GameBridge } from '../app/GameBridge';

export function PauseMenu({ bridge }: { bridge: GameBridge }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const buttons = panel.current?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !buttons?.length) return;
      const first = buttons[0],
        last = buttons[buttons.length - 1];
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
    <div className="pause-backdrop">
      <div
        className="pause-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <span className="overline">HẮC PHONG SƠN</span>
        <h2 id="pause-title">Tạm dừng</h2>
        <p>Đường lịch luyện còn ở phía trước.</p>
        <button className="primary-button" onClick={() => bridge.dispatch({ type: 'resume' })}>
          Tiếp tục<span aria-hidden="true">↗</span>
        </button>
        <button className="secondary-button" onClick={() => bridge.dispatch({ type: 'leave' })}>
          Rút lui · nhận 30% thưởng
        </button>
        <small>
          <kbd>ESC</kbd> tiếp tục · <kbd>Q</kbd> dùng đan · <kbd>SPACE</kbd> lướt
        </small>
      </div>
    </div>
  );
}

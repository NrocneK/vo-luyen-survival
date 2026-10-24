import { useEffect, useState, useSyncExternalStore, useRef, useCallback } from 'react';
import { GameBridge } from './GameBridge';
import { GameCanvas } from './GameCanvas';
import { Lobby } from '../ui/Lobby';
import { RunOverlays } from '../ui/RunOverlays';
import { GameHud } from '../ui/GameHud';
import { PauseMenu } from '../ui/PauseMenu';
import { TestTools } from '../ui/TestTools';
import { ChapterEnding } from '../ui/ChapterEnding';
import { StoryEvent } from '../ui/StoryEvent';
import '../ui/world-two.css';

export function App() {
  const [bridge] = useState(() => new GameBridge());
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  const [testToolsOpen, setTestToolsOpen] = useState(false);
  const testToolsPaused = useRef(false);
  const toggleTestTools = useCallback(() => {
    if (testToolsOpen) {
      setTestToolsOpen(false);
      if (testToolsPaused.current && bridge.getSnapshot().mode === 'paused')
        bridge.dispatch({ type: 'resume' });
      testToolsPaused.current = false;
    } else {
      testToolsPaused.current = bridge.getSnapshot().mode === 'playing';
      if (testToolsPaused.current) bridge.dispatch({ type: 'pause' });
      setTestToolsOpen(true);
    }
  }, [bridge, testToolsOpen]);
  useEffect(() => {
    // Bảng không chặn thao tác lobby; nếu bấm vào ải, thu bảng để lấy lại điều khiển.
    if (state.mode === 'playing' && testToolsOpen) {
      setTestToolsOpen(false);
      testToolsPaused.current = false;
    }
  }, [state.mode, testToolsOpen]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const mode = bridge.getSnapshot().mode;
      if (event.key === 'Escape' && !event.repeat && testToolsOpen) {
        event.preventDefault();
        toggleTestTools();
        return;
      }
      if (event.key === 'Escape' && !event.repeat && (mode === 'playing' || mode === 'paused')) {
        event.preventDefault();
        bridge.dispatch({ type: mode === 'playing' ? 'pause' : 'resume' });
      }
      // Phaser tự bắt phím di chuyển. preventDefault ở React trước Phaser sẽ làm mất keydown.
    };
    window.addEventListener('keydown', keyboard);
    return () => {
      window.removeEventListener('keydown', keyboard);
    };
  }, [bridge, testToolsOpen, toggleTestTools]);
  useEffect(() => () => bridge.dispose(), [bridge]);
  useEffect(() => {
    if (state.mode === 'playing')
      document.getElementById('game-canvas')?.focus({ preventScroll: true });
  }, [state.mode]);
  return (
    <main className={`game-shell mode-${state.mode}`}>
      <GameCanvas bridge={bridge} />
      <div className="screen-vignette" aria-hidden="true" />
      <div
        className="game-interface"
        inert={state.chapterEndingOpen || state.storyOpen}
        aria-hidden={state.chapterEndingOpen || state.storyOpen || undefined}
      >
        {state.mode === 'menu' ? (
          <Lobby state={state} bridge={bridge} />
        ) : (
          <GameHud state={state} bridge={bridge} />
        )}
        {state.mode === 'paused' && !testToolsOpen && <PauseMenu bridge={bridge} />}
        {(state.mode === 'levelup' || state.mode === 'result') &&
          !testToolsOpen &&
          !state.chapterEndingOpen && <RunOverlays state={state} bridge={bridge} />}
        <TestTools state={state} bridge={bridge} open={testToolsOpen} onToggle={toggleTestTools} />
      </div>
      {state.chapterEndingOpen && <ChapterEnding state={state} bridge={bridge} />}
      {state.storyOpen && <StoryEvent state={state} bridge={bridge} />}
    </main>
  );
}

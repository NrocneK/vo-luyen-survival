import { useEffect, useState, useSyncExternalStore } from 'react';
import { GameBridge } from './GameBridge';
import { GameCanvas } from './GameCanvas';
import { Lobby } from '../ui/Lobby';
import { RunOverlays } from '../ui/RunOverlays';
import { GameHud } from '../ui/GameHud';
import { PauseMenu } from '../ui/PauseMenu';

export function App() {
  const [bridge] = useState(() => new GameBridge());
  const state = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const mode = bridge.getSnapshot().mode;
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
  }, [bridge]);
  useEffect(() => () => bridge.dispose(), [bridge]);
  useEffect(() => {
    if (state.mode === 'playing')
      document.getElementById('game-canvas')?.focus({ preventScroll: true });
  }, [state.mode]);
  return (
    <main className={`game-shell mode-${state.mode}`}>
      <GameCanvas bridge={bridge} />
      <div className="screen-vignette" aria-hidden="true" />
      {state.mode === 'menu' ? (
        <Lobby state={state} bridge={bridge} />
      ) : (
        <GameHud state={state} bridge={bridge} />
      )}
      {state.mode === 'paused' && <PauseMenu bridge={bridge} />}
      {(state.mode === 'levelup' || state.mode === 'result') && (
        <RunOverlays state={state} bridge={bridge} />
      )}
    </main>
  );
}

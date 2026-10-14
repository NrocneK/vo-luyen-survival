import { useEffect, useRef } from 'react';
import { GameBridge } from './GameBridge';
import type Phaser from 'phaser';

export function GameCanvas({ bridge }: { bridge: GameBridge }) {
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!parent.current) return;
    let game: Phaser.Game | undefined;
    let cancelled = false;
    // Tách engine khỏi bundle giao diện để menu hiển thị trước khi Phaser tải xong.
    void import('../game/createGame')
      .then(({ createGame }) => {
        if (!cancelled && parent.current) game = createGame(parent.current, bridge);
      })
      .catch(() => {
        if (!cancelled)
          bridge.update({
            mode: 'menu',
            status: 'error',
            error: 'Không tải được game. Hãy tải lại trang.',
          });
      });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [bridge]);
  return (
    <div
      id="game-canvas"
      className="game-canvas"
      ref={parent}
      tabIndex={0}
      role="region"
      aria-label="Hắc Phong Sơn — dùng WASD hoặc phím mũi tên để di chuyển"
      onPointerDown={() => parent.current?.focus({ preventScroll: true })}
    />
  );
}

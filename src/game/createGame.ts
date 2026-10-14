import Phaser from 'phaser';
import { GameBridge } from '../app/GameBridge';
import { BootScene } from './scenes/BootScene';
import { ForestScene } from './scenes/ForestScene';

export function createGame(parent: HTMLElement, bridge: GameBridge): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0a1715',
    width: parent.clientWidth,
    height: parent.clientHeight,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { keyboard: true, mouse: true, touch: false },
    scene: [new BootScene(bridge), new ForestScene(bridge)],
    render: { powerPreference: 'high-performance' },
    fps: { target: 60 },
  });
}

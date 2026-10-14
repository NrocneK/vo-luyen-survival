import Phaser from 'phaser';
import { GameBridge } from '../../app/GameBridge';
import { assets, assetUrl } from '../../data/assets';

export class BootScene extends Phaser.Scene {
  private failed = false;
  constructor(private bridge: GameBridge) {
    super('boot');
  }
  preload(): void {
    this.load.on('progress', (progress: number) => this.bridge.update({ progress }));
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.failed = true;
      this.bridge.update({
        status: 'error',
        error: `Không tải được ${file.key}. Hãy tải lại trang.`,
      });
    });
    for (const actor of assets.actors) {
      this.load.atlas(actor.id, assetUrl(actor.atlas), assetUrl(actor.atlasData));
    }
    for (const shared of assets.sharedAssets) {
      if (shared.atlas) this.load.atlas(shared.id, assetUrl(shared.file), assetUrl(shared.atlas));
      else this.load.image(shared.id, assetUrl(shared.file));
    }
  }
  create(): void {
    if (this.failed) return;
    for (const actor of assets.actors) {
      for (const [name, animation] of Object.entries(actor.animations)) {
        this.anims.create({
          key: `${actor.id}:${name}`,
          frames: animation.frames.map((frame) => ({ key: actor.id, frame })),
          frameRate: animation.frameRate,
          repeat: animation.repeat,
        });
      }
    }
    this.scene.start('forest');
  }
}

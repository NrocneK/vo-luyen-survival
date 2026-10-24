import Phaser from 'phaser';
import { GameBridge } from '../../app/GameBridge';
import { assets, assetUrl } from '../../data/assets';
import { hero } from '../../data/hero';

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
      if (hero.status === 'validated' && ['duong-khai', 'duong-khai-kiem'].includes(actor.id))
        continue;
      this.load.atlas(actor.id, assetUrl(actor.atlas), assetUrl(actor.atlasData));
    }
    if (hero.status === 'validated') {
      const mode = this.bridge.getSnapshot().weapon === 'sword' ? 'sword' : 'unarmed';
      for (const texture of hero.textures.filter((t) => t.mode === mode))
        this.load.atlas(texture.key, assetUrl(texture.file), assetUrl(texture.atlas));
    }
    for (const shared of assets.sharedAssets) {
      if (shared.atlas) this.load.atlas(shared.id, assetUrl(shared.file), assetUrl(shared.atlas));
      else this.load.image(shared.id, assetUrl(shared.file));
    }
  }
  create(): void {
    if (this.failed) return;
    for (const actor of assets.actors) {
      if (hero.status === 'validated' && ['duong-khai', 'duong-khai-kiem'].includes(actor.id))
        continue;
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

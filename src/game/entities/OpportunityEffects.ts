import Phaser from 'phaser';
import { project, type Projection } from '../math/worldPhysics';
import type { RunEngine } from '../systems/RunEngine';
import { opportunityDefinitions, opportunityRules } from '../../data/opportunities';

/** Dấu cơ duyên dùng tọa độ/vùng tương tác thật; không tạo chướng ngại vật vô hình. */
export class OpportunityEffects {
  private ground: Phaser.GameObjects.Graphics;
  private object: Phaser.GameObjects.Graphics;
  private herb: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    this.ground = scene.add.graphics().setDepth(-750);
    this.object = scene.add.graphics();
    this.herb = scene.add.image(0, 0, 'items', 'linh-thao').setScale(0.45);
    this.label = scene.add
      .text(0, 0, '', {
        fontFamily: 'Be Vietnam Pro',
        fontSize: '10px',
        color: '#f5e1b7',
        stroke: '#172b22',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100010);
    this.clear();
  }
  clear(): void {
    this.ground.clear();
    this.object.clear();
    this.herb.setVisible(false);
    this.label.setVisible(false);
  }
  render(engine: RunEngine, projection: Projection, time: number): void {
    this.clear();
    const a = engine.opportunities.active;
    if (!a || ['completed', 'expired'].includes(a.phase) || engine.mode === 'result') return;
    const p = project(a, projection),
      color = opportunityDefinitions[a.kind].color,
      zoom = this.ground.scene.cameras.main.zoom;
    const radius =
      a.kind === 'trial' && a.phase === 'active'
        ? opportunityRules.trialRadius
        : opportunityRules.interactRadius;
    const rx = radius * projection.pixelsPerUnit,
      ry = rx / Math.sqrt(3);
    this.ground
      .fillStyle(color, 0.07)
      .fillEllipse(p.x, p.y, rx * 2, ry * 2)
      .lineStyle(1.5 / zoom, color, 0.8)
      .strokeEllipse(p.x, p.y, rx * 2, ry * 2);
    if (a.kind === 'trial') {
      this.ground.lineStyle(1 / zoom, color, 0.7);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        this.ground.lineBetween(
          p.x + Math.cos(angle) * rx * 0.6,
          p.y + Math.sin(angle) * ry * 0.6,
          p.x + Math.cos(angle + (Math.PI * 2) / 3) * rx * 0.6,
          p.y + Math.sin(angle + (Math.PI * 2) / 3) * ry * 0.6,
        );
      }
      this.ground
        .fillStyle(color, 0.22)
        .fillEllipse(
          p.x,
          p.y,
          (rx * 2 * a.progress) / opportunityRules.trialCharge,
          (ry * 2 * a.progress) / opportunityRules.trialCharge,
        );
    } else if (a.kind === 'herb')
      this.herb
        .setVisible(true)
        .setPosition(p.x, p.y - 18)
        .setDepth(p.y + 0.5);
    else if (a.kind === 'cache') {
      this.object
        .setDepth(p.y + 0.5)
        .fillStyle(0x332d22, 0.95)
        .fillEllipse(p.x, p.y + 6, 53, 17);
      this.object
        .fillStyle(0x89633b, 1)
        .fillRoundedRect(p.x - 23, p.y - 24, 46, 29, 3)
        .lineStyle(2, 0xe3c888, 1)
        .strokeRoundedRect(p.x - 23, p.y - 24, 46, 29, 3);
      this.object
        .fillStyle(0xb58a48, 1)
        .fillRect(p.x - 23, p.y - 24, 46, 10)
        .lineStyle(2, 0xe3c888, 1)
        .lineBetween(p.x - 23, p.y - 13, p.x + 23, p.y - 13);
      this.object
        .fillStyle(a.phase === 'claimable' ? 0xd9ffc0 : 0xefd790, 1)
        .fillRect(p.x - 4, p.y - 16, 8, 12)
        .lineStyle(2, 0xe3c888, 1)
        .lineBetween(p.x - 13, p.y - 24, p.x - 13, p.y + 4)
        .lineBetween(p.x + 13, p.y - 24, p.x + 13, p.y + 4);
    } else {
      this.object
        .setDepth(p.y + 0.5)
        .lineStyle(3, color, 1)
        .lineBetween(p.x, p.y + 3, p.x, p.y - 43)
        .fillStyle(0xbab1c9, 1)
        .fillTriangle(p.x - 6, p.y - 29, p.x + 6, p.y - 29, p.x, p.y - 57)
        .lineStyle(3, 0xf0cf91, 1)
        .lineBetween(p.x - 12, p.y - 24, p.x + 12, p.y - 24);
    }
    const pulse = engine.profile.settings.reducedEffects ? 0.6 : 0.55 + 0.2 * Math.sin(time * 3);
    this.object
      .setDepth(p.y + 0.7)
      .lineStyle(2 / zoom, color, pulse)
      .lineBetween(p.x, p.y - 65, p.x, p.y - 56)
      .lineBetween(p.x - 4, p.y - 60, p.x + 4, p.y - 60);
    const view = engine.opportunities.view({
      time: engine.time,
      position: engine.position,
      enemies: engine.enemies,
    })!;
    this.label
      .setVisible(true)
      .setScale(1 / zoom)
      .setPosition(p.x, p.y - 82 / zoom)
      .setText(
        `${opportunityDefinitions[a.kind].name}\n${a.phase === 'active' ? (a.kind === 'trial' ? `TỤ LINH ${Math.floor(view.progress * 100)}%` : `CÒN ${view.enemies} HỘ VỆ`) : view.interactable ? `E · ${view.action}` : a.phase === 'claimable' ? 'ĐÃ MỞ · TRỞ LẠI NHẬN THƯỞNG' : '✦ CƠ DUYÊN'}`,
      );
  }
}

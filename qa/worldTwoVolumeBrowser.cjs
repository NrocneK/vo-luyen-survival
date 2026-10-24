const {
  chromium,
} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'),
  assert = require('node:assert/strict');
const out = 'art/world-two-vfx-v5/qa';
const capture = !process.argv.includes('--no-capture');
async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }),
    errors = [],
    missing = [],
    checks = [];
  const addCheck = checks.push.bind(checks);
  checks.push = (...items) => { console.log('QA', ...items); return addCheck(...items); };
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  fs.mkdirSync(out, { recursive: true });
  try {
    await page.goto('http://127.0.0.1:5176/qa/world-two-effects.html');
    await page.waitForFunction(
      () => window.worldTwoQA?.bridge.getSnapshot().status === 'ready',
      null,
      { timeout: 60000 },
    );
    await page.evaluate(() => worldTwoQA.game.loop.sleep());
    const frame = async (dt = 0) =>
      page.evaluate((dt) => {
        if (dt) worldTwoQA.advance(dt);
        worldTwoQA.game.step(performance.now(), 16.667);
        const s = worldTwoQA.game.scene.getScene('forest'),
          e = worldTwoQA.engine(),
          fx = s.techniqueEffects.skills;
        return {
          time: e.time,
          faces: fx.triangleCount,
          spines: fx.lastDragonSpines,
          ma: fx.maVisible,
          wing: fx.wingVisible,
        };
      }, dt);
    for (const [name, skill, aug, duration] of [
      ['dragon', 'kim-long-hien-hoa', 'long-du', 5.6],
      ['palm', 'gia-thien-thu', '', 1.9],
      ['wings', 'phong-loi-vu-duc', '', 1.8],
      ['ma', 'nhap-ma', '', 2],
    ]) {
      await page.evaluate(
        ([id, aug]) => {
          worldTwoQA.prepareEffect(id, aug);
          worldTwoQA.game.scene.getScene('forest').cameras.main.setZoom(1.5);
        },
        [skill, aug],
      );
      fs.mkdirSync(`${out}/${name}`, { recursive: true });
      const stats = [];
      for (let i = 0; i < Math.ceil(duration * 12); i++) {
        stats.push(await frame(i ? 1 / 12 : 0));
        if (capture)
          await page.screenshot({
            path: `${out}/${name}/${String(i).padStart(3, '0')}.png`,
            clip: { x: 300, y: 130, width: 1000, height: 600 },
          });
      }
      if (name === 'dragon') {
        const spines = stats.filter((s) => s.spines.length).map((s) => s.spines[0]);
        assert.ok(spines.length > 40);
        const headings = spines.map((p) => Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x));
        assert.ok(
          Math.max(...headings) - Math.min(...headings) > 3,
          'Rồng phải ngoặt qua nhiều hướng',
        );
      }
      checks.push(`${name}: chuỗi 12 khung/giây trong Phaser thật`);
      console.log(checks.at(-1));
    }
    const anchors = [];
    for (const facing of ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']) {
      await page.evaluate((f) => worldTwoQA.prepareEffect('phong-loi-vu-duc', '', f), facing);
      await frame(0.35);
      const a = await page.evaluate(() => {
        const s = worldTwoQA.game.scene.getScene('forest'),
          p = s.player.sprite,
          f = p.frame.data.spriteSourceSize,
          fx = s.techniqueEffects.skills;
        const expected = s.player.attachment('back'),
          unit = s.projection.pixelsPerUnit,
          o = s.projection.origin;
        return {
          facing: s.player.renderedFacing,
          expected,
          root: fx.lastWings.map((w) => ({
            x: o.x + ((w.root.x + w.root.y) * unit) / Math.SQRT2,
            y:
              o.y +
              ((w.root.x - w.root.y) * unit) / Math.sqrt(6) -
              w.root.z * unit * Math.sqrt(2 / 3),
          })),
          foot: p.y,
          top: p.y + (f.y - p.originY * p.frame.realHeight) * p.scaleY,
          height: f.h * p.scaleY,
        };
      });
      assert.equal(a.facing, facing);
      assert.equal(a.root.length, 2);
      assert.ok(
        a.expected.y > a.top + a.height * 0.1 && a.expected.y < a.top + a.height * 0.55,
        JSON.stringify(a),
      );
      for (const r of a.root)
        assert.ok(Math.hypot(r.x - a.expected.x, r.y - a.expected.y) < 5, JSON.stringify(a));
      anchors.push(a);
      if (capture)
        await page.screenshot({
          path: `${out}/wing-${facing}.png`,
          clip: { x: 300, y: 130, width: 1000, height: 600 },
        });
    }
    checks.push('Gốc cánh khớp bả vai ở cả tám hướng');
    const blending = await page.evaluate(() => {
      const fx = worldTwoQA.game.scene.getScene('forest').techniqueEffects.skills;
      return {
        modes: [...fx.mesh.layers.values()].map((g) => g.blendMode),
        softParticles: fx.mesh.mist.pool.size,
      };
    });
    assert.ok(blending.modes.length > 0 && blending.modes.every((m) => m === 1));
    assert.ok(blending.softParticles > 20);
    checks.push('Vỏ linh lực cộng sáng và dải hạt mềm, không phủ vật liệu đặc');
    await page.evaluate(() => worldTwoQA.engine().dash());
    await frame(0.1);
    if (capture)
      await page.screenshot({
        path: `${out}/wing-dash.png`,
        clip: { x: 300, y: 130, width: 1000, height: 600 },
      });
    for (const zoom of [0.5, 1, 2, 3]) {
      await page.evaluate(
        (z) => { worldTwoQA.game.scene.getScene('forest').cameras.main.setZoom(z); },
        zoom,
      );
      await frame();
      if (capture && zoom <= 1) await page.screenshot({ path: `${out}/zoom-${zoom}.png` });
    }
    await page.evaluate(() => {
      worldTwoQA.prepareEffect('kim-long-hien-hoa', 'long-du');
      worldTwoQA.game.scene.getScene('forest').cameras.main.setZoom(1.5);
    });
    await frame(1.2);
    const before = await page.evaluate(() => {
      worldTwoQA.engine().pause();
      return {
        time: worldTwoQA.engine().time,
        zones: JSON.stringify(worldTwoQA.engine().advanced.zones),
      };
    });
    await frame(0.8);
    const after = await page.evaluate(() => ({
      time: worldTwoQA.engine().time,
      zones: JSON.stringify(worldTwoQA.engine().advanced.zones),
    }));
    assert.deepEqual(after, before);
    checks.push('Pause đóng băng đường thân và thời gian chiến đấu');
    await page.evaluate(() => worldTwoQA.prepareEffect('nhap-ma'));
    assert.ok((await frame(0.8)).ma);
    assert.equal((await frame(5)).ma, false);
    assert.equal(
      await page.evaluate(() => worldTwoQA.game.scene.getScene('forest').player.sprite.isTinted),
      false,
    );
    checks.push('Nhập Ma hiện đúng pha rồi tắt');
    for (const aug of ['thu-diep-chuong', 'thu-tran-dia']) {
      await page.evaluate((a) => worldTwoQA.prepareEffect('gia-thien-thu', a), aug);
      await frame(0.95);
    }
    for (const aug of ['quang-tan', 'quang-pha-hon']) {
      await page.evaluate((a) => worldTwoQA.prepareEffect('diet-hon-kim-quang', a), aug);
      await frame(0.25);
    }
    await page.evaluate(() => worldTwoQA.prepareEffect('kim-long-hien-hoa', 'long-tuc'));
    assert.ok((await frame(0.7)).faces > 0);
    checks.push('Biến chiêu chưởng/tia và Long Tức vẫn dựng hình');
    await page.evaluate(() => {
      worldTwoQA.prepareEffect('kim-long-hien-hoa', 'long-du');
      const e = worldTwoQA.engine();
      Object.assign(e.skills, {
        'kim-long-hien-hoa': 6,
        'gia-thien-thu': 6,
        'diet-hon-kim-quang': 6,
        'nhap-ma': 5,
        'phong-loi-vu-duc': 5,
      });
      e.augments = ['long-du', 'thu-tran-dia', 'quang-tan'];
      e.advanced.clear();
    });
    await frame(0.6);
    const cpu = await page.evaluate(() => {
      const samples = [];
      for (let i = 0; i < 60; i++) {
        worldTwoQA.advance(1 / 60);
        const start = performance.now();
        worldTwoQA.game.step(performance.now(), 16.667);
        samples.push(performance.now() - start);
      }
      samples.sort((a, b) => a - b);
      return {
        median: samples[30],
        p95: samples[57],
        max: samples[59],
        faces: worldTwoQA.game.scene.getScene('forest').techniqueEffects.skills.triangleCount,
      };
    });
    await page.screenshot({ path: `${out}/combined.png` });
    console.log('CPU (Chrome headless/SwiftShader)', cpu);
    assert.ok(cpu.median < 40, JSON.stringify(cpu));
    await page.evaluate(() => worldTwoQA.engine().abandon());
    await frame();
    const cleaned = await page.evaluate(() => {
      const e = worldTwoQA.engine(),
        fx = worldTwoQA.game.scene.getScene('forest').techniqueEffects.skills;
      return {
        zones: e.advanced.zones.length,
        wing: fx.wingVisible,
        ma: fx.maVisible,
        spines: fx.lastDragonSpines.length,
      };
    });
    assert.deepEqual(cleaned, { zones: 0, wing: false, ma: false, spines: 0 });
    checks.push('Kết quả dọn rồng, cánh và ma khí');
    await page.goto('http://127.0.0.1:5176/qa/world-two-effects.html?vfxPreview=1');
    await page.waitForSelector('#vfx-preview-controls button.active', { timeout: 60000 });
    for (const name of ['Già Thiên Thủ', 'Vũ Dực', 'Nhập Ma', 'Kim Quang', 'Phối hợp', 'Du Long']) {
      await page.getByRole('button', { name, exact: true }).click();
      console.log(
        'Trang trực tiếp',
        name,
        await page.evaluate(() => ({
          mode: worldTwoQA.engine()?.mode,
          time: worldTwoQA.engine()?.time,
        })),
      );
      await page.waitForFunction(() => worldTwoQA.engine()?.time > 0.12);
      assert.equal(await page.evaluate(() => worldTwoQA.engine().mode), 'playing');
    }
    await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
    await page.waitForFunction(() => worldTwoQA.engine().mode === 'paused');
    await page.waitForTimeout(100);
    const pausedImage = await page.locator('canvas').screenshot();
    await page.waitForTimeout(250);
    assert.ok(
      pausedImage.equals(await page.locator('canvas').screenshot()),
      'Canvas phải đứng yên khi tạm dừng',
    );
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await page.waitForFunction(() => worldTwoQA.game.scene.getScene('forest').lastMode === 'playing');
    const pos = await page.evaluate(() => ({ ...worldTwoQA.engine().position }));
    await page.keyboard.down('KeyD');
    await page.waitForFunction((pos) => {
      const moved = worldTwoQA.engine().position;
      return Math.hypot(moved.x - pos.x, moved.y - pos.y) > 0.15;
    }, pos, {timeout:10000});
    await page.keyboard.up('KeyD');
    const moved = await page.evaluate(() => ({ ...worldTwoQA.engine().position }));
    assert.ok(Math.hypot(moved.x - pos.x, moved.y - pos.y) > 0.1);
    await page.locator('#vfx-preview-controls input').fill('1.7');
    await page.waitForFunction(
      () => Math.abs(worldTwoQA.game.scene.getScene('forest').cameras.main.zoom - 1.7) < 0.01,
    );
    await page.screenshot({ path: `${out}/live-controls.png` });
    checks.push('Trang xem trực tiếp: sáu môn/phối hợp, pause canvas, WASD và thu phóng hoạt động');
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    const report = {
      version: '2.1.0',
      date: new Date().toISOString(),
      checks,
      anchors,
      cpu,
      errors,
      missing,
    };
    fs.writeFileSync('qa/world-two-v5-browser-qa.json', JSON.stringify(report, null, 2) + '\n');
    console.log('Đạt', checks.length, 'nhóm kiểm tra');
  } catch (e) {
    console.log(
      'Lỗi trang',
      errors,
      missing,
      await page.evaluate(() => ({
        text: document.body.innerText.slice(-1400),
        time: window.worldTwoQA?.engine()?.time,
        mode: window.worldTwoQA?.engine()?.mode,
      })),
    );
    await page.screenshot({ path: `${out}/failure.png` });
    throw e;
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

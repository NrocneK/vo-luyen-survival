const {
  chromium,
} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs');
async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }),
      page = await context.newPage(),
      errors = [],
      missing = [],
      textures = new Set(),
      heroTextures = new Set();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400) missing.push(r.url());
      if (r.url().includes('/assets/v8/')) textures.add(new URL(r.url()).pathname);
      if (r.url().includes('/assets/v9/hero/') && r.url().endsWith('.png')) heroTextures.add(new URL(r.url()).pathname);
    });
    await page.goto('http://127.0.0.1:5176/qa/world-two-effects.html');
    await page.waitForFunction(
      () => window.worldTwoQA?.bridge.getSnapshot().status === 'ready',
      null,
      { timeout: 60000 },
    );
    const profile = await page.evaluate(() => {
      worldTwoQA.setup(7);
      const p = structuredClone(worldTwoQA.bridge.getSnapshot().profile);
      p.activePet = null;
      p.selectedSkills = [
        'phong-loi-vu-duc',
        'kim-long-hien-hoa',
        'gia-thien-thu',
        'nhap-ma',
        'diet-hon-kim-quang',
      ];
      return p;
    });
    await page.addInitScript((p) => {
      if (location.port === '4173') localStorage.setItem('vo-luyen.profile.v1', JSON.stringify(p));
    }, profile);
    await page.goto('http://127.0.0.1:4173/');
    await page.waitForSelector('.lobby', { timeout: 60000 });
    await page.locator('.station-nav button').filter({ hasText: 'Lịch luyện' }).click();
    await page.locator('.stage-choice').nth(7).click();
    await page.getByRole('button', { name: /Vào Sa Thành/ }).click();
    await page.waitForSelector('.mission-hud', { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'art/world-two-vfx-v5/qa/production.png' });
    assert.equal(textures.size, 0);
    assert.ok(heroTextures.size >= 3);
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    const report = {
      version: '2.1.0',
      date: new Date().toISOString(),
      textures: [...textures],
      heroTextures: [...heroTextures],
      errors,
      missing,
      checks: [
        'Production khởi động và vào Sa Thành',
        'Production không yêu cầu PNG hiệu ứng v8 đã bị bác',
        'Production tải đủ atlas Dương Khai v9',
        'Không lỗi JavaScript/HTTP',
      ],
    };
    fs.writeFileSync(
      'qa/world-two-v5-production-qa.json',
      JSON.stringify(report, null, 2) + '\n',
    );
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

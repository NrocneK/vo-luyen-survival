/* QA bản build khôi phục, dùng browser profile tạm và tiến trình test riêng. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.QA_URL || 'http://127.0.0.1:4181';
const output = 'qa/screenshots/thong-huyen-restore';
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const errors = [],
    missing = [],
    checks = [],
    pixelRequests = [];
  try {
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport: size });
      const page = await context.newPage(),
        loaded = new Set();
      page.setDefaultTimeout(120000);
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('request', (r) => {
        if (/\/v(?:10|11)\//.test(r.url())) pixelRequests.push(r.url());
      });
      page.on('response', (r) => {
        if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) missing.push(r.url());
        if (r.url().includes('hero-v9-')) loaded.add(r.url().split('/').pop());
      });
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.survival-lobby');
      await page.waitForFunction(() => !document.querySelector('.asset-loading'));
      await page.screenshot({ path: `${output}/lobby-${size.width}.png` });
      await page.getByRole('button', { name: /Hỗ trợ test/ }).click();
      await page.getByRole('checkbox', { name: 'Bật chế độ test', exact: true }).check();
      const mainSave = await page.evaluate(() => localStorage.getItem('vo-luyen.profile.v1'));
      await page
        .getByRole('button', { name: 'Đạt Thần Du đỉnh phong tầng 10', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Cấp toàn bộ trang bị +5, bản vẽ và linh thú', exact: true })
        .click();
      await page.getByRole('button', { name: 'Đóng hỗ trợ test', exact: true }).click();
      await page.locator('.station-nav button').filter({ hasText: 'Trang bị' }).click();
      for (const id of [
        'huyen-duong-thanh-kiem',
        'huyen-quang-quan',
        'thanh-nguyen-chien-y',
        'kim-cuong-ho-uyen',
        'ngu-phong-ngoa',
        'thanh-tam-ngoc-boi',
        'thanh-chu-ngoc-an',
      ]) {
        await page.locator(`.bag-tile[data-item-id="${id}"]`).click();
        await page
          .locator('.item-inspector')
          .getByRole('button', { name: 'Trang bị', exact: true })
          .click();
      }
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem('vo-luyen.profile.test.v1')).equipped.relic ===
          'thanh-chu-ngoc-an',
      );
      if (![...loaded].some((x) => x.startsWith('hero-v9-sword-')))
        await page.waitForResponse((r) => r.url().includes('hero-v9-sword-') && r.status() === 200);
      await page.screenshot({ path: `${output}/equipped-${size.width}.png` });
      await page.locator('.station-nav button').filter({ hasText: 'Lịch luyện' }).click();
      await page.getByRole('button', { name: 'Thông Huyền Đại Lục', exact: true }).click();
      assert.equal(await page.locator('.stage-choice').count(), 14);
      await page.locator('[data-stage-id="sa-thanh"]').click();
      await page.locator('#start-game').click();
      await page.waitForSelector('.survival-combat-ui');
      await page.keyboard.down('d');
      await page.waitForTimeout(450);
      await page.keyboard.up('d');
      await page.keyboard.press('Escape');
      await page.waitForSelector('.survival-pause');
      await page.screenshot({ path: `${output}/combat-${size.width}.png` });
      assert.ok([...loaded].some((x) => x.startsWith('hero-v9-unarmed-')));
      assert.ok([...loaded].some((x) => x.startsWith('hero-v9-sword-')));
      await page.locator('.retreat-button').click();
      await page.waitForSelector('.survival-result');
      assert.equal(await page.locator('.survival-result').getAttribute('data-outcome'), 'retreat');
      await page.locator('.result-footer .primary-button').click();
      await page.waitForSelector('.survival-lobby');
      await page.locator('.station-nav button').filter({ hasText: 'Căn cứ' }).click();
      assert.equal(await page.locator('.hero-slot').count(), 7);
      assert.equal(await page.locator('.station-nav button').count(), 8);
      assert.equal(
        await page.evaluate(() => localStorage.getItem('vo-luyen.profile.v1')),
        mainSave,
      );
      checks.push({
        size,
        loaded: [...loaded],
        result:
          'Lobby → mặc bảy món → 14 màn Thông Huyền → Sa Thành/di chuyển/pause → rút lui → căn cứ; giữ save chính',
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  assert.deepEqual(pixelRequests, []);
  fs.writeFileSync(
    'qa/thong-huyen-restore-qa.json',
    JSON.stringify(
      { version: '2.3.1', status: 'passed', checks, errors, missing, pixelRequests },
      null,
      2,
    ) + '\n',
  );
  console.log('Đạt QA bản khôi phục ở', checks.length, 'kích thước.');
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

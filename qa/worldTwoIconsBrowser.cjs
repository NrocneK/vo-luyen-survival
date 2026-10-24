const {
  chromium,
} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }),
      page = await context.newPage();
    const errors = [],
      missing = [],
      loaded = new Set(),
      checks = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) missing.push(response.url());
      if (response.ok() && response.url().includes('/assets/v7/icons/'))
        loaded.add(new URL(response.url()).pathname);
    });
    fs.mkdirSync('qa/screenshots/world-two-icons', { recursive: true });
    const shot = async (name) =>
      page.screenshot({ path: `qa/screenshots/world-two-icons/${name}.png` });
    const inspect = async (count) => {
      await page.waitForFunction(
        (expected) =>
          Array.from(document.querySelectorAll('img[src*="/assets/v7/icons/"]')).filter(
            (img) => img.complete && img.naturalWidth === 256,
          ).length >= expected,
        count,
      );
    };
    await page.goto('http://127.0.0.1:5173/qa/world-two-audit.html');
    await page.waitForFunction(() => window.worldTwoQA?.bridge.getSnapshot().status === 'ready', {
      timeout: 60000,
    });
    await page.evaluate(() => window.worldTwoQA.setup(8));
    await page.locator('.station-nav button').filter({ hasText: 'Luyện khí' }).click();
    await inspect(16);
    assert.equal(
      await page.locator('.craft-card img[src*="/assets/v7/icons/equipment/"]').count(),
      16,
    );
    checks.push('16 công thức trang bị dùng đúng 16 ảnh mới');
    await page
      .locator('.craft-card')
      .filter({ hasText: 'Liệt Dương Quyền Sáo' })
      .scrollIntoViewIfNeeded();
    await shot('forge-sieu-pham');
    await page
      .locator('.craft-card')
      .filter({ hasText: 'Thánh Nguyên Quyền Sáo' })
      .scrollIntoViewIfNeeded();
    await shot('forge-nhap-thanh');
    await page.evaluate(() => {
      const q = window.worldTwoQA;
      for (const id of [
        'huyen-duong-thanh-kiem',
        'huyen-quang-quan',
        'thanh-nguyen-chien-y',
        'kim-cuong-ho-uyen',
        'ngu-phong-ngoa',
        'thanh-tam-ngoc-boi',
        'thanh-chu-ngoc-an',
      ])
        q.bridge.act('equip', id);
    });
    await page.locator('.station-nav button').filter({ hasText: 'Trang bị' }).click();
    await inspect(7);
    assert.equal(await page.locator('.equip-slots img[src*="/assets/v7/icons/"]').count(), 7);
    await shot('inventory-seven');
    checks.push('Bảy ô được trang bị và hiện đủ hình dáng riêng');
    const productionFixture = await page.evaluate(
      () => window.worldTwoQA.bridge.getSnapshot().profile,
    );
    await page.locator('.station-nav button').filter({ hasText: 'Tu luyện' }).click();
    await inspect(5);
    for (const id of [
      'diet-hon-kim-quang',
      'gia-thien-thu',
      'kim-long-hien-hoa',
      'nhap-ma',
      'phong-loi-vu-duc',
    ])
      assert.ok(await page.locator(`img[src$="/${id}.png"]`).count());
    await page.locator('img[src$="/diet-hon-kim-quang.png"]').scrollIntoViewIfNeeded();
    await shot('cultivation-skills');
    checks.push('Năm môn mới trong chuẩn bị kỹ năng');
    async function cards(kind, offset = 0) {
      await page.evaluate(
        async ({ kind, offset }) => {
          const q = window.worldTwoQA;
          q.setup(13, true);
          q.freeze();
          const run = q.engine();
          const module = await import('/src/data/skills.ts');
          const ids = [
            'diet-hon-kim-quang',
            'gia-thien-thu',
            'kim-long-hien-hoa',
            'nhap-ma',
            'phong-loi-vu-duc',
          ];
          run.skills = Object.fromEntries(
            ids.map((id) => [
              id,
              id === 'nhap-ma' || id === 'phong-loi-vu-duc' ? 1 : kind === 'awaken' ? 5 : 2,
            ]),
          );
          run.choices = module
            .eligibleCards(ids, run.skills)
            .filter((card) => card.kind === kind)
            .slice(offset, offset + 3);
          run.mode = 'levelup';
          q.bridge.update({ mode: run.mode, run: run.view(), cards: run.choices });
        },
        { kind, offset },
      );
      await inspect(3);
      assert.equal(await page.locator('.upgrade-card img[src*="/assets/v7/icons/"]').count(), 3);
    }
    await cards('awaken');
    await shot('awakening-cards');
    checks.push('Ba thẻ thức tỉnh có ảnh khác chiêu gốc');
    await cards('augment');
    await shot('augment-cards-one');
    await cards('augment', 3);
    await shot('augment-cards-two');
    checks.push('Sáu biến chiêu có ảnh riêng trên thẻ thật');
    await page.evaluate(() => window.worldTwoQA.cast(0));
    await inspect(5);
    assert.equal(await page.locator('.skill-slot img[src*="/assets/v7/icons/"]').count(), 5);
    await shot('combat-hud');
    checks.push('HUD dùng đúng ảnh thức tỉnh và hỗ trợ mới');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await shot('mobile-hud');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    checks.push('HUD 390px không tràn');
    await page.addInitScript((profile) => {
      if (location.port === '4173')
        localStorage.setItem('vo-luyen.profile.v1', JSON.stringify(profile));
    }, productionFixture);
    await page.goto('http://127.0.0.1:4173/');
    await page.waitForSelector('.lobby', { timeout: 60000 });
    await page.waitForSelector('.asset-loading', { state: 'hidden', timeout: 60000 });
    await page.locator('.station-nav button').filter({ hasText: 'Trang bị' }).click();
    await inspect(7);
    assert.equal(await page.locator('.equip-slots img[src*="/assets/v7/icons/"]').count(), 7);
    await shot('production-inventory');
    checks.push('Production đóng gói đúng bộ v7 và giữ trang bị khi tải');
    assert.equal(loaded.size, 30);
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    fs.writeFileSync(
      'qa/world-two-icons-browser-qa.json',
      JSON.stringify(
        { date: new Date().toISOString(), checks, uniqueIconsLoaded: loaded.size, errors, missing },
        null,
        2,
      ),
    );
    console.log(JSON.stringify({ checks: checks.length, icons: loaded.size, errors, missing }));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

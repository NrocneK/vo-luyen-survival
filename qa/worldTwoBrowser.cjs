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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [],
    missing = [],
    checks = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) missing.push(response.url());
  });
  fs.mkdirSync('qa/screenshots/world-two', { recursive: true });
  const shot = async (name) => page.screenshot({ path: `qa/screenshots/world-two/${name}.png` });
  await page.goto('http://127.0.0.1:5173/qa/world-two-audit.html');
  await page.waitForFunction(() => window.worldTwoQA?.bridge.getSnapshot().status === 'ready', {
    timeout: 60000,
  });
  await page.evaluate(() => window.worldTwoQA.setup(2));
  await page.waitForTimeout(250);
  assert.ok((await page.locator('body').innerText()).includes('LĂNG TIÊU TÔNG'));
  checks.push('Căn cứ đầu Phần 2');
  await shot('base-lang-tieu');
  await page.evaluate(() => window.worldTwoQA.setup(8));
  await page.waitForTimeout(150);
  assert.ok(
    (await page.locator('body').innerText()).includes('CỬU THIÊN THÁNH ĐỊA'),
    (await page.locator('body').innerText()).slice(0, 1200),
  );
  checks.push('Căn cứ Cửu Thiên');
  await page.locator('.station-nav button').filter({ hasText: 'Trang bị' }).click();
  assert.equal(await page.locator('.equip-slots > div').count(), 7);
  await shot('equipment-seven');
  checks.push('Bảy ô trang bị');
  await page.locator('.station-nav button').filter({ hasText: 'Luyện đan' }).click();
  await page.locator('.batch-choices button').filter({ hasText: /^5$/ }).click();
  const pills = await page.evaluate(
    () => window.worldTwoQA.bridge.getSnapshot().profile.pills['tu-vi-dan'],
  );
  await page
    .locator('.craft-card')
    .filter({ hasText: 'Ngưng Nguyên' })
    .getByRole('button', { name: 'Luyện 5 viên', exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => window.worldTwoQA.bridge.getSnapshot().profile.pills['tu-vi-dan']),
    pills + 5,
  );
  await shot('alchemy-batch');
  checks.push('Luyện năm viên thật qua bridge');
  await page.locator('.station-nav button').filter({ hasText: 'Lịch luyện' }).click();
  assert.equal(await page.locator('.stage-choice').count(), 14);
  await shot('campaign-fourteen');
  checks.push('Danh sách đủ 14 màn');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  await shot('mobile-campaign');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  checks.push('Không tràn chiều ngang ở 390px');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.worldTwoQA.setup(13, true, false));
  await page.getByRole('dialog', { name: 'Ma Đô' }).waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await shot('ma-do-story');
  await page.getByRole('button', { name: 'Bỏ qua', exact: true }).click();
  await page.waitForFunction(() => window.worldTwoQA.bridge.getSnapshot().mode === 'playing');
  assert.ok(
    await page.evaluate(() =>
      window.worldTwoQA.bridge.getSnapshot().profile.storySeen.includes('ma-do'),
    ),
  );
  checks.push('Ma Đô trước trận cuối, bỏ qua rồi vào trận');
  for (let i = 0; i < 14; i++) {
    await page.evaluate((index) => {
      window.worldTwoQA.setup(index, true);
      window.worldTwoQA.freeze();
    }, i);
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => window.worldTwoQA.bridge.getSnapshot().mode), 'playing');
    await shot(`stage-${String(i + 1).padStart(2, '0')}`);
  }
  checks.push('Phaser dựng đủ 14 màn, HUD/nhiệm vụ/actor');
  await page.evaluate(() => window.worldTwoQA.cast(0));
  await page.waitForTimeout(100);
  await shot('skills-dragon-palm');
  await page.evaluate(() => window.worldTwoQA.cast(1));
  await page.waitForTimeout(100);
  await shot('skills-breath-echo');
  checks.push('Hai bộ biến chiêu mới');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  await shot('mobile-combat');
  await page.setViewportSize({ width: 1440, height: 900 });
  const first = await page.evaluate(() => {
    const q = window.worldTwoQA;
    q.setup(9, true);
    q.freeze();
    q.advance(0.01);
    const run = q.engine();
    run.mission.damageProtected(10000000, { x: 0, y: 0 }, 2, 1);
    q.bridge.update({ mode: run.mode, run: run.view() });
    q.bridge.finish(run.result);
    return { outcome: run.result.outcome, hp: run.hp };
  });
  assert.equal(first.outcome, 'mission-failed');
  assert.ok(first.hp > 0);
  await page.getByRole('heading', { name: 'Nhiệm vụ thất bại' }).waitFor();
  await shot('mission-failed');
  checks.push('Thất bại nhiệm vụ khi nhân vật còn sống');
  await page.evaluate(() => {
    const q = window.worldTwoQA;
    q.setup(13, true);
    q.freeze();
    q.advance(0.01);
    const run = q.engine(),
      boss = run.enemies.find((e) => e.type === run.stage.bossId);
    const hit = () => run.damageEnemy(boss, 1e9, false, false, { id: 'cuong-quyen', rank: 5 });
    hit();
    q.advance(0.05);
    run.position = { x: 0, y: 0 };
    run.interact();
    hit();
    q.advance(0.05);
    hit();
    q.bridge.update({ mode: run.mode, run: run.view() });
    q.bridge.finish(run.result);
  });
  await page.locator('.chapter-ending').waitFor();
  await page.waitForTimeout(500);
  assert.ok((await page.locator('.chapter-ending').innerText()).includes('Nhập Thánh'));
  await shot('ending-two');
  checks.push('Kết chương Phần 2 mở đúng khi hoàn thành');
  await page.reload();
  await page.waitForFunction(() => window.worldTwoQA?.bridge.getSnapshot().status === 'ready', {
    timeout: 60000,
  });
  assert.equal(
    await page.evaluate(() => window.worldTwoQA.bridge.getSnapshot().chapterEndingOpen),
    false,
  );
  assert.equal(await page.evaluate(() => window.worldTwoQA.bridge.getSnapshot().profile.realm), 52);
  assert.ok(
    await page.evaluate(
      () => window.worldTwoQA.bridge.getSnapshot().profile.stageProgress['dai-chien-cot-toc'].wins,
    ),
  );
  checks.push('Lưu/tải Phần 2 không tự phát lại kết chương');
  const productionFixture = await page.evaluate(
    () => window.worldTwoQA.bridge.getSnapshot().profile,
  );
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForSelector('.lobby', { timeout: 60000 });
  await shot('main-app-boot');
  checks.push('Ứng dụng chính khởi động');
  await page.addInitScript((profile) => {
    if (location.port === '4173')
      localStorage.setItem('vo-luyen.profile.v1', JSON.stringify(profile));
  }, productionFixture);
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForSelector('.lobby', { timeout: 60000 });
  assert.ok(
    (await page.locator('body').innerText()).includes('CỬU THIÊN THÁNH ĐỊA'),
    (await page.locator('body').innerText()).slice(0, 1200),
  );
  await page.locator('.station-nav button').filter({ hasText: 'Lịch luyện' }).click();
  await page.locator('.stage-choice').last().click();
  await page.getByRole('button', { name: /Vào Đại chiến Cốt tộc/ }).click();
  await page.waitForSelector('.mission-hud', { timeout: 30000 });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.skill-slot').count(), 6);
  await shot('production-world-two');
  checks.push('Bản production vào trận Phần 2, tải actor mới');
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  fs.writeFileSync(
    'qa/world-two-browser-qa.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        checks,
        errors,
        missing,
        screenshots: 'qa/screenshots/world-two',
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks: checks.length, errors, missing }));
  await browser.close();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

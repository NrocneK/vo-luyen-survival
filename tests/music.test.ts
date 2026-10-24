import test from 'node:test';
import assert from 'node:assert/strict';
import { soundForOccurrence, soundPresets } from '../src/data/audio.ts';
import type { SoundKind } from '../src/data/audio.ts';
import {
  composeMusicBar,
  musicBarDuration,
  musicThemes,
  themeForContext,
} from '../src/data/music.ts';
import type { MusicContext } from '../src/data/music.ts';

test('Sáu màn có câu nhạc riêng; boss tăng nhịp, lobby dùng chủ đề độc lập', () => {
  const signatures = new Set<string>();
  for (const stageId of Object.keys(musicThemes)) {
    const context: MusicContext = { screen: 'battle', stageId };
    const bars = Array.from({ length: 8 }, (_, bar) => composeMusicBar(context, bar));
    signatures.add(JSON.stringify(bars));
    assert.ok(themeForContext(context).bpm >= 100);
    assert.ok(musicBarDuration({ ...context, screen: 'boss' }) < musicBarDuration(context));
    assert.ok(bars.every(({ layers }) => layers.some(({ source }) => source === 'brown-noise')));
    assert.ok(
      bars.every(({ layers }) => layers.some(({ from, to }) => Math.min(from, to) < 100)),
      'Thiếu nền bass/trống',
    );
    assert.ok(bars.every(({ layers }) => layers.some(({ pan }) => (pan ?? 0) < 0)));
    assert.ok(bars.every(({ layers }) => layers.some(({ pan }) => (pan ?? 0) > 0)));
    assert.notDeepEqual(bars[0], bars[1], 'Câu giai điệu phải chuyển động giữa các ô nhịp');
    assert.deepEqual(bars[0], composeMusicBar(context, 8), 'Chu kỳ tám ô nhịp nối lại ổn định');
  }
  assert.equal(signatures.size, 20);
  const lobby = composeMusicBar({ screen: 'lobby' }, 0);
  assert.equal(
    lobby.layers.some(({ source }) => source === 'brown-noise'),
    false,
  );
  assert.equal(themeForContext({ screen: 'lobby' }).id, 'lang-tieu-cac');
  assert.equal(themeForContext({ screen: 'battle', stageId: 'khong-ton-tai' }).id, 'hac-phong-son');
});

test('Cường độ bổ sung trống dồn nhưng không đổi BPM; boss luôn có nhịp căng hơn', () => {
  const low: MusicContext = { screen: 'battle', stageId: 'hac-phong-son', intensity: 0.1 };
  const high: MusicContext = { ...low, intensity: 1 };
  const boss: MusicContext = { ...low, screen: 'boss' };
  assert.ok(composeMusicBar(high, 0).layers.length > composeMusicBar(low, 0).layers.length);
  assert.ok(composeMusicBar(boss, 0).layers.length > composeMusicBar(low, 0).layers.length);
  assert.equal(musicBarDuration(low), musicBarDuration(high));
});

test('Toàn bộ envelope nhạc và hiệu ứng nằm trong miền hợp lệ và đủ giới hạn ngân sách', () => {
  const contexts: MusicContext[] = [
    { screen: 'lobby' },
    { screen: 'result' },
    ...Object.keys(musicThemes).flatMap((stageId): MusicContext[] => [
      { screen: 'battle', stageId, intensity: 1 },
      { screen: 'boss', stageId },
    ]),
  ];
  for (const context of contexts) {
    for (let bar = 0; bar < 8; bar++) {
      const preset = composeMusicBar(context, bar);
      assert.ok(preset.layers.length > 12 && preset.layers.length <= 110);
      for (const layer of preset.layers) {
        assert.ok(layer.from > 0 && layer.to > 0 && layer.from < 14000 && layer.to < 14000);
        assert.ok(layer.volume > 0 && layer.volume <= 0.5);
        assert.ok(layer.attack > 0 && layer.attack < layer.duration);
        assert.ok((layer.delay ?? 0) < musicBarDuration(context));
        assert.ok(Math.abs(layer.pan ?? 0) <= 1);
        if (layer.release !== undefined)
          assert.ok(layer.release > 0 && layer.release < layer.duration);
        if (layer.sustain !== undefined) assert.ok(layer.sustain > 0 && layer.sustain <= 1);
      }
    }
  }
  for (const kind of Object.keys(soundPresets) as SoundKind[]) {
    for (let occurrence = 0; occurrence < 8; occurrence++) {
      for (const layer of soundForOccurrence(kind, occurrence).layers) {
        assert.ok(layer.volume > 0 && layer.volume <= 0.5);
        assert.ok(layer.attack > 0 && layer.attack < layer.duration);
        assert.ok(layer.from > 0 && layer.to > 0);
      }
    }
  }
});

test('Quyền và kiếm luân phiên ba âm động tác, không tiến biến thể khi âm bị chặn cooldown', () => {
  for (const kind of ['attack-fist', 'attack-sword'] as const) {
    const variants = Array.from({ length: 3 }, (_, occurrence) =>
      soundForOccurrence(kind, occurrence),
    );
    assert.equal(new Set(variants.map((variant) => JSON.stringify(variant))).size, 3);
    assert.deepEqual(soundForOccurrence(kind, 0), soundForOccurrence(kind, 3));
  }
  assert.notDeepEqual(
    soundForOccurrence('cast-chain-lightning', 0),
    soundForOccurrence('cast-lightning', 0),
  );
  assert.notDeepEqual(soundForOccurrence('cast-flame-ring', 0), soundForOccurrence('cast-fire', 0));
});

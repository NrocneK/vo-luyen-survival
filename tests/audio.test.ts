import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio } from '../src/game/systems/Audio.ts';
import { MAX_SOUND_VOICES } from '../src/data/audio.ts';
import { MAX_MUSIC_VOICES, MUSIC_TIMER_MS, musicBarDuration } from '../src/data/music.ts';

class Parameter {
  value = 0;
  events: { value: number; time: number }[] = [];
  setValueAtTime(value: number, time: number) {
    this.events.push({ value, time });
  }
  linearRampToValueAtTime(value: number, time: number) {
    this.events.push({ value, time });
  }
  exponentialRampToValueAtTime(value: number, time: number) {
    assert.ok(value > 0, 'Web Audio không cho ramp mũ tới 0');
    this.events.push({ value, time });
  }
}

class Node {
  connections: Node[] = [];
  disconnected = false;
  connect(target: Node) {
    this.connections.push(target);
    return target;
  }
  disconnect() {
    this.disconnected = true;
    this.connections = [];
  }
}

class Gain extends Node {
  gain = new Parameter();
}
class Filter extends Node {
  type = '';
  frequency = new Parameter();
  Q = new Parameter();
}
class Source extends Node {
  type = 'noise';
  frequency = new Parameter();
  buffer: unknown = null;
  loop = false;
  onended: (() => void) | null = null;
  started: number | null = null;
  scheduledStop: number | null = null;
  stopped = false;
  start(time: number) {
    this.started = time;
  }
  stop(time?: number) {
    if (time === undefined) {
      this.stopped = true;
      this.finish();
    } else this.scheduledStop = time;
  }
  finish() {
    this.stopped = true;
    this.onended?.();
  }
}
class Compressor extends Node {
  threshold = new Parameter();
  knee = new Parameter();
  ratio = new Parameter();
  attack = new Parameter();
  release = new Parameter();
}

class Context {
  state = 'running';
  currentTime = 0;
  sampleRate = 8000;
  destination = new Node();
  nodes: Node[] = [];
  sources: Source[] = [];
  buffers: Float32Array[] = [];
  resumeCount = 0;
  closeCount = 0;
  unblock: (() => void) | null = null;
  deny: (() => void) | null = null;
  createGain() {
    const node = new Gain();
    this.nodes.push(node);
    return node;
  }
  createDynamicsCompressor() {
    const node = new Compressor();
    this.nodes.push(node);
    return node;
  }
  createBiquadFilter() {
    const node = new Filter();
    this.nodes.push(node);
    return node;
  }
  createOscillator() {
    const node = new Source();
    this.nodes.push(node);
    this.sources.push(node);
    return node;
  }
  createBufferSource() {
    return this.createOscillator();
  }
  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    this.buffers.push(data);
    return { getChannelData: () => data };
  }
  resume() {
    this.resumeCount++;
    return new Promise<void>((resolve, reject) => {
      this.unblock = () => {
        this.state = 'running';
        resolve();
      };
      this.deny = () => reject(new Error('Autoplay blocked'));
    });
  }
  close() {
    this.state = 'closed';
    this.closeCount++;
    return Promise.resolve();
  }
}

function harness(state = 'running') {
  const context = new Context();
  context.state = state;
  const clock = { now: 0 },
    timers = new Map<number, () => void>();
  let contexts = 0,
    interval = 0;
  const audio = new GameAudio({
    createContext: () => {
      contexts++;
      return context as unknown as AudioContext;
    },
    now: () => clock.now,
    setInterval: (callback, milliseconds) => {
      interval = milliseconds;
      timers.set(1, callback);
      return 1;
    },
    clearInterval: (id) => {
      timers.delete(id);
    },
  });
  return { context, clock, timers, audio, contexts: () => contexts, interval: () => interval };
}

test('Âm thanh chỉ khởi động khi kích hoạt; tắt hiệu ứng không tắt nhạc và ngược lại', () => {
  const { audio, context, contexts, timers } = harness();
  audio.play('attack-fist');
  assert.equal(contexts(), 0);
  audio.activate(false, false);
  assert.equal(contexts(), 0);
  audio.activate(false, true);
  assert.equal(contexts(), 1);
  assert.equal(timers.size, 1);
  const musicSources = [...context.sources];
  assert.ok(musicSources.length > 0);
  audio.play('attack-fist');
  assert.equal(context.sources.length, musicSources.length);
  audio.activate(true, false);
  assert.equal(timers.size, 0);
  assert.ok(musicSources.every((source) => source.stopped && source.disconnected));
  audio.play('attack-fist');
  const effects = context.sources.slice(musicSources.length);
  assert.ok(effects.length >= 2);
  audio.activate(false, true);
  assert.ok(effects.every((source) => source.stopped && source.disconnected));
  assert.equal(timers.size, 1);
  audio.dispose();
  assert.equal(timers.size, 0);
});

test('Quyền, kiếm, hỏa, lôi, quái và phản hồi có âm sắc riêng, không còn cùng một nốt nhỏ', () => {
  const signatures = new Set<string>();
  for (const kind of [
    'attack-fist',
    'attack-sword',
    'cast-fire',
    'cast-lightning',
    'attack-monster',
    'hit',
    'hurt',
    'level',
    'awaken',
    'win',
    'ui',
  ]) {
    const { audio, context } = harness();
    audio.activate(true, false);
    audio.play(kind);
    assert.ok(context.sources.length >= 1, `Thiếu âm ${kind}`);
    const layers = context.nodes.filter(
      (node): node is Gain => node instanceof Gain && node.gain.events.length > 0,
    );
    assert.ok(
      layers.some((node) => node.gain.events.some(({ value }) => value >= 0.1)),
      `${kind} quá nhỏ`,
    );
    assert.ok(
      layers.every((node) => node.gain.events.every(({ value }) => value > 0 && value <= 0.5)),
    );
    assert.ok(context.sources.every((source) => source.scheduledStop! > source.started!));
    signatures.add(
      JSON.stringify({
        sources: context.sources.map((source) => ({
          type: source.type,
          frequency: source.frequency.events,
          start: source.started,
          stop: source.scheduledStop,
        })),
        filters: context.nodes
          .filter((node): node is Filter => node instanceof Filter)
          .map((node) => ({ type: node.type, frequency: node.frequency.events })),
      }),
    );
    audio.dispose();
  }
  assert.equal(signatures.size, 11);
});

test('Tốc độ x6 không phát hàng trăm tiếng hit mỗi giây; cooldown dùng đồng hồ thực', () => {
  const { audio, context, clock } = harness();
  audio.activate(true, false);
  for (let millisecond = 0; millisecond < 1000; millisecond++) {
    clock.now = millisecond;
    for (let step = 0; step < 6; step++) audio.play('hit');
    for (const source of context.sources) if (!source.stopped) source.finish();
  }
  // 6.000 sự kiện mô phỏng chỉ tạo tối đa 16 tiếng va chạm trong một giây thực.
  assert.ok(context.sources.length >= 20 && context.sources.length <= 32);
  assert.equal(context.buffers.length, 1, 'Nhiễu được cache, không sinh buffer cho từng đòn');
  assert.ok(context.buffers[0].some((sample) => sample !== 0));
  audio.dispose();
});

test('Đông đòn đánh có giới hạn đồng thời, compressor và dọn sạch node khi kết thúc', () => {
  const { audio, context, clock } = harness();
  audio.activate(true, false);
  for (let index = 0; index < 100; index++) {
    clock.now += 1000;
    audio.play(['attack-fist', 'attack-sword', 'cast-fire', 'cast-lightning'][index % 4]);
    assert.ok(context.sources.filter((source) => !source.stopped).length <= MAX_SOUND_VOICES * 3);
  }
  const compressor = context.nodes.find((node): node is Compressor => node instanceof Compressor)!;
  assert.ok(compressor.threshold.value < 0 && compressor.ratio.value >= 8);
  assert.ok(compressor.connections.length === 1);
  audio.play('hurt');
  assert.ok(context.sources.at(-1)!.frequency.events.some(({ value }) => value === 125));
  for (const source of context.sources) if (!source.stopped) source.finish();
  assert.ok(context.sources.every((source) => source.disconnected));
  assert.ok(
    context.nodes.filter((node) => node instanceof Filter).every((node) => node.disconnected),
  );
  audio.dispose();
  audio.dispose();
  assert.equal(context.closeCount, 1);
  assert.ok(context.nodes.every((node) => node.disconnected));
  const count = context.sources.length;
  audio.activate(true, true);
  audio.play('win');
  assert.equal(context.sources.length, count);
});

test('AudioContext bị khóa chỉ resume một lần đang chờ; không resume lại mỗi đòn/nhấp chuột', async () => {
  const { audio, context } = harness('suspended');
  audio.activate(true, false);
  audio.activate(true, false);
  audio.activate(true, false);
  audio.play('attack-sword');
  assert.equal(context.resumeCount, 1);
  assert.equal(context.sources.length, 0);
  context.unblock!();
  await Promise.resolve();
  const resumedSources = context.sources.length;
  assert.ok(resumedSources >= 2, 'Tiếng của lần bấm đầu phát ngay sau khi mở AudioContext');
  audio.activate(true, false);
  audio.play('attack-sword');
  assert.equal(context.resumeCount, 1);
  assert.equal(context.sources.length, resumedSources, 'Không lặp tiếng đã phát trong cooldown');
  audio.dispose();
});

test('Lần mở âm đầu chỉ giữ một tiếng, không phát lại cả hàng đợi sau resume', async () => {
  const { audio, context } = harness('suspended');
  audio.activate(true, false);
  audio.play('ui');
  for (let index = 0; index < 50; index++) {
    audio.play('attack-fist');
    audio.play('attack-sword');
    audio.play('hurt');
  }
  assert.equal(context.sources.length, 0);
  context.unblock!();
  await Promise.resolve();
  assert.equal(context.sources.length, 1, 'Chỉ tiếng UI đầu tiên được phát');
  assert.equal(context.sources[0].frequency.events[0].value, 540);
  audio.dispose();
});

test('Tắt âm hoặc dispose trước khi resume xong phải hủy tiếng đang chờ', async () => {
  for (const action of ['mute', 'dispose']) {
    const { audio, context } = harness('suspended');
    audio.activate(true, false);
    audio.play('attack-sword');
    if (action === 'mute') audio.activate(false, false);
    else audio.dispose();
    context.unblock!();
    await Promise.resolve();
    assert.equal(context.sources.length, 0, `${action} đã hủy tiếng đang chờ`);
    audio.dispose();
  }
});

test('Resume bị từ chối không giữ âm cũ tới lần mở tiếp theo', async () => {
  const { audio, context } = harness('suspended');
  audio.activate(true, false);
  audio.play('win');
  context.deny!();
  await Promise.resolve();
  audio.activate(true, false);
  context.unblock!();
  await Promise.resolve();
  assert.equal(context.sources.length, 0);
  audio.play('ui');
  assert.equal(context.sources.length, 1);
  assert.equal(context.resumeCount, 2);
  audio.dispose();
});

test('Dispose dừng cả nguồn đang hẹn giờ, bỏ qua event lạ và chịu được trình duyệt chặn AudioContext', () => {
  const { audio, context, timers } = harness();
  audio.activate(true, true);
  const count = context.sources.length;
  audio.play('unknown-event');
  assert.equal(context.sources.length, count);
  audio.play('win');
  audio.dispose();
  assert.ok(context.sources.every((source) => source.stopped && source.disconnected));
  assert.equal(timers.size, 0);
  const blocked = new GameAudio({
    createContext: () => {
      throw new Error('Blocked');
    },
  });
  assert.doesNotThrow(() => blocked.activate(true, true));
  assert.doesNotThrow(() => blocked.play('attack-fist'));
  blocked.dispose();
});

test('Nhạc lập lịch theo AudioContext; chuyển phase thay cả dàn nhạc, cập nhật áp lực không lặp câu mở đầu', () => {
  const { audio, context, timers, contexts, clock, interval } = harness();
  const battle = { screen: 'battle' as const, stageId: 'trung-do-doat-dich', intensity: 0.2 };
  audio.setContext(battle);
  assert.equal(contexts(), 0, 'Context nhạc không được tự mở âm trước thao tác người dùng');
  audio.activate(false, true);
  assert.equal(interval(), MUSIC_TIMER_MS);
  const initial = [...context.sources];
  assert.ok(initial.length > 40, 'Dàn nhạc cần bass/trống và nhiều nhạc cụ');
  const tick = [...timers.values()][0];
  for (let frame = 0; frame < 100; frame++) {
    clock.now += 8;
    audio.setContext({ ...battle, intensity: frame / 100 });
    tick();
  }
  assert.equal(context.sources.length, initial.length, 'Đồng hồ mô phỏng không đẩy nhanh nhạc');
  assert.ok(initial.every((source) => !source.stopped));
  context.currentTime = musicBarDuration(battle);
  tick();
  assert.ok(context.sources.length > initial.length, 'Lịch âm thực tiến sang ô nhịp kế tiếp');
  const previous = [...context.sources];
  audio.setContext({ ...battle, screen: 'boss' });
  assert.equal(timers.size, 1);
  assert.ok(previous.every((source) => source.stopped && source.disconnected));
  assert.ok(context.sources.length > previous.length);
  assert.ok(
    context.sources
      .slice(previous.length)
      .every((source) => source.started! >= context.currentTime),
  );
  audio.setContext({ screen: 'lobby' });
  assert.equal(timers.size, 1);
  audio.dispose();
});

test('Quay về từ tab nền không phát dồn nhạc; nhạc có giới hạn nguồn và hủy hết khi mute', () => {
  const { audio, context, timers } = harness();
  const battle = { screen: 'battle' as const, stageId: 'trung-do-hao-kiep' };
  audio.setContext(battle);
  audio.activate(true, true);
  const tick = [...timers.values()][0];
  const first = context.sources.length;
  context.currentTime = 600;
  tick();
  assert.ok(context.sources.length - first < 110, 'Không tạo hàng trăm ô nhịp đã trễ');
  assert.ok(context.sources.slice(first).every((source) => source.started! >= 600));
  for (let bar = 0; bar < 100; bar++) {
    context.currentTime += musicBarDuration(battle);
    tick();
    // Fake context không tự onended: giới hạn vẫn bảo vệ trường hợp trình duyệt bị trễ dọn node.
    assert.ok(context.sources.filter((source) => !source.stopped).length <= MAX_MUSIC_VOICES * 110);
  }
  audio.play('attack-fist');
  const effects = context.sources.slice(-2);
  audio.activate(true, false);
  assert.ok(context.sources.slice(0, -2).every((source) => source.stopped));
  assert.ok(
    effects.every((source) => !source.stopped),
    'Tắt nhạc không dừng hiệu ứng',
  );
  assert.equal(timers.size, 0);
  audio.dispose();
});

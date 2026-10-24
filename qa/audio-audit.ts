import { GameAudio } from '../src/game/systems/Audio.ts';
import { musicBarDuration, musicThemes } from '../src/data/music.ts';
import type { MusicContext } from '../src/data/music.ts';
import type { SoundKind } from '../src/data/audio.ts';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const theme = element<HTMLSelectElement>('theme');
const status = element<HTMLParagraphElement>('status');
const rows = element<HTMLTableSectionElement>('results');
const playing = element<HTMLParagraphElement>('playing');
const live = new GameAudio();
const pending = new Set<number>();
const urls: string[] = [];
const reports: Record<string, unknown>[] = [];

for (const screen of ['battle', 'boss', 'lobby'] as const) {
  element<HTMLButtonElement>(screen).onclick = () => {
    live.setContext({ screen, stageId: theme.value, intensity: 0.7 });
    live.activate(true, true);
    playing.textContent = `Đang phát: ${screen} / ${theme.selectedOptions[0].textContent}.`;
  };
}
element<HTMLButtonElement>('stop').onclick = () => {
  live.activate(true, false);
  playing.textContent = 'Đã dừng nhạc.';
};
function audition(kind: SoundKind, count = 1) {
  live.activate(true, true);
  for (let index = 0; index < count; index++) {
    const id = window.setTimeout(() => {
      pending.delete(id);
      live.play(kind);
    }, index * 500);
    pending.add(id);
  }
}
element<HTMLButtonElement>('fist').onclick = () => audition('attack-fist', 3);
element<HTMLButtonElement>('sword').onclick = () => audition('attack-sword', 3);
element<HTMLButtonElement>('ring').onclick = () => audition('cast-flame-ring');
element<HTMLButtonElement>('chain').onclick = () => audition('cast-chain-lightning');

function wave(buffer: AudioBuffer): Blob {
  const samples = buffer.length,
    channels = buffer.numberOfChannels;
  const bytes = new ArrayBuffer(44 + samples * channels * 2),
    data = new DataView(bytes);
  const string = (position: number, value: string) => {
    for (let index = 0; index < value.length; index++)
      data.setUint8(position + index, value.charCodeAt(index));
  };
  string(0, 'RIFF');
  data.setUint32(4, bytes.byteLength - 8, true);
  string(8, 'WAVE');
  string(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, channels, true);
  data.setUint32(24, buffer.sampleRate, true);
  data.setUint32(28, buffer.sampleRate * channels * 2, true);
  data.setUint16(32, channels * 2, true);
  data.setUint16(34, 16, true);
  string(36, 'data');
  data.setUint32(40, bytes.byteLength - 44, true);
  let offset = 44;
  for (let sample = 0; sample < samples; sample++) {
    for (let channel = 0; channel < channels; channel++) {
      const value = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[sample]));
      data.setInt16(offset, Math.round(value * (value < 0 ? 32768 : 32767)), true);
      offset += 2;
    }
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

async function offline(context: MusicContext, mix = false, onlyEffects = false) {
  const duration = onlyEffects ? 9 : musicBarDuration(context) * 8 + 1.5;
  const target = new OfflineAudioContext(2, Math.ceil(duration * 48000), 48000);
  let tick: (() => void) | null = null;
  // Offline context được dừng đúng từng mốc lịch; node/envelope/compressor đều là Web Audio thật.
  const wrapped = new Proxy(target, {
    get: (object, property) => {
      if (property === 'state') return 'running';
      if (property === 'close') return () => Promise.resolve();
      const value = Reflect.get(object, property, object);
      return typeof value === 'function' ? value.bind(object) : value;
    },
  });
  const audio = new GameAudio({
    createContext: () => wrapped as unknown as AudioContext,
    now: () => target.currentTime * 1000,
    setInterval: (callback) => {
      tick = callback;
      return 1;
    },
    clearInterval: () => {
      tick = null;
    },
  });
  audio.setContext(context);
  audio.activate(mix || onlyEffects, !onlyEffects);
  const effects: SoundKind[] = [
    'attack-fist',
    'attack-sword',
    'cast-flame-ring',
    'cast-chain-lightning',
    'enemy-blade',
    'enemy-arrow',
    'attack-monster',
    'hurt',
    'boss-roar',
  ];
  const pauses: Promise<void>[] = [];
  for (let at = 0.1; at < duration - 1.2; at += 0.1) {
    const step = Math.round(at * 10);
    pauses.push(
      target.suspend(at).then(() => {
        const callback = tick as (() => void) | null;
        callback?.();
        if (mix) {
          audio.play(effects[step % effects.length]);
          audio.play('hit');
          if (step % 3 === 0) audio.play('pickup');
        } else if (onlyEffects) {
          if ([2, 7, 12].includes(step)) audio.play('attack-fist');
          if ([20, 25, 30].includes(step)) audio.play('attack-sword');
          if (step === 40) audio.play('cast-flame-ring');
          if (step === 50) audio.play('cast-chain-lightning');
          if (step === 60) audio.play('boss-roar');
        }
        return target.resume();
      }),
    );
  }
  const buffer = await target.startRendering();
  await Promise.all(pauses);
  audio.dispose();
  let peak = 0,
    sum = 0,
    clipped = 0;
  const data = Array.from({ length: buffer.numberOfChannels }, (_, channel) =>
    buffer.getChannelData(channel),
  );
  for (const channel of data)
    for (const sample of channel) {
      peak = Math.max(peak, Math.abs(sample));
      sum += sample * sample;
      if (Math.abs(sample) >= 0.99) clipped++;
    }
  const rms = Math.sqrt(sum / (buffer.length * buffer.numberOfChannels));
  return { buffer, peak, rms, peakDb: 20 * Math.log10(peak), rmsDb: 20 * Math.log10(rms), clipped };
}

function plot(canvas: HTMLCanvasElement, buffer: AudioBuffer) {
  canvas.width = 400;
  canvas.height = 108;
  const painter = canvas.getContext('2d')!;
  painter.fillStyle = '#091519';
  painter.fillRect(0, 0, 400, 108);
  painter.strokeStyle = '#598878';
  painter.beginPath();
  painter.moveTo(0, 54);
  painter.lineTo(400, 54);
  painter.stroke();
  const channel = buffer.getChannelData(0),
    chunk = Math.ceil(channel.length / 400);
  painter.strokeStyle = '#b8edba';
  painter.beginPath();
  for (let x = 0; x < 400; x++) {
    let min = 1,
      max = -1;
    for (let index = x * chunk; index < Math.min(channel.length, (x + 1) * chunk); index++) {
      min = Math.min(min, channel[index]);
      max = Math.max(max, channel[index]);
    }
    painter.moveTo(x, 54 - max * 52);
    painter.lineTo(x, 54 - min * 52);
  }
  painter.stroke();
}

element<HTMLButtonElement>('audit').onclick = async () => {
  const button = element<HTMLButtonElement>('audit');
  button.disabled = true;
  reports.length = 0;
  rows.replaceChildren();
  live.activate(false, false);
  for (const url of urls) URL.revokeObjectURL(url);
  urls.length = 0;
  const cases: { label: string; context: MusicContext; mix?: boolean; onlyEffects?: boolean }[] = [
    { label: 'Lobby Lăng Tiêu Các', context: { screen: 'lobby' } },
    ...Object.keys(musicThemes).flatMap((stageId) => [
      {
        label: `${stageId} / battle`,
        context: { screen: 'battle' as const, stageId, intensity: 0.5 },
      },
      { label: `${stageId} / boss`, context: { screen: 'boss' as const, stageId, intensity: 1 } },
    ]),
    {
      label: 'Boss + giao tranh dày',
      context: { screen: 'boss', stageId: 'trung-do-hao-kiep', intensity: 1 },
      mix: true,
    },
    {
      label: 'Quyền ×3 / Kiếm ×3 / Viêm Hoàn / Lôi Liên',
      context: { screen: 'battle' },
      onlyEffects: true,
    },
  ];
  try {
    for (const entry of cases) {
      status.textContent = `Đang đo ${reports.length + 1}/${cases.length}: ${entry.label}`;
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const measured = await offline(entry.context, entry.mix, entry.onlyEffects);
      const { buffer, ...metrics } = measured;
      const report = {
        label: entry.label,
        context: entry.context,
        duration: buffer.duration,
        ...metrics,
        pass:
          metrics.clipped === 0 &&
          metrics.peak < 0.99 &&
          metrics.rms > (entry.context.screen === 'lobby' || entry.onlyEffects ? 0.006 : 0.01),
      };
      reports.push(report);
      const tr = document.createElement('tr');
      tr.className = report.pass ? 'ok' : 'bad';
      const label = document.createElement('td');
      label.textContent = entry.label;
      const levels = document.createElement('td');
      levels.textContent = `${metrics.peakDb.toFixed(1)} / ${metrics.rmsDb.toFixed(1)} dBFS`;
      const clipping = document.createElement('td');
      clipping.textContent = String(metrics.clipped);
      const waveform = document.createElement('td'),
        canvas = document.createElement('canvas');
      waveform.append(canvas);
      plot(canvas, buffer);
      const preview = document.createElement('td'),
        player = document.createElement('audio');
      player.controls = true;
      const url = URL.createObjectURL(wave(buffer));
      urls.push(url);
      player.src = url;
      preview.append(player);
      tr.append(label, levels, clipping, waveform, preview);
      rows.append(tr);
    }
    status.textContent = `Hoàn tất ${reports.length} đoạn; ${reports.filter(({ pass }) => pass).length} đạt miền âm lượng. Tổng ${reports.reduce((sum, report) => sum + Number(report.clipped), 0)} mẫu vượt 0,99. Kiểm tra nhịp và envelope có test đi kèm.`;
    element<HTMLButtonElement>('save').disabled = false;
  } catch (error) {
    status.textContent = `Lỗi QA: ${String(error)}`;
  } finally {
    button.disabled = false;
  }
};

element<HTMLButtonElement>('save').onclick = () => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            schema: 1,
            createdAt: new Date().toISOString(),
            sampleRate: 48000,
            channels: 2,
            reports,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    ),
  );
  link.href = url;
  link.download = 'combat-audio-offline-qa.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
window.addEventListener('pagehide', () => {
  for (const id of pending) window.clearTimeout(id);
  for (const url of urls) URL.revokeObjectURL(url);
  live.dispose();
});

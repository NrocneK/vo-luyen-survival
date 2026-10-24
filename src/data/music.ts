import type { SoundLayer, SoundPreset } from './audio.ts';
import { worldTwoStages } from './worldTwoStages.ts';

export interface MusicContext {
  screen: 'lobby' | 'battle' | 'boss' | 'result';
  stageId?: string;
  intensity?: number;
}

export interface MusicTheme {
  id: string;
  bpm: number;
  root: number;
  scale: readonly number[];
  lead: 'flute' | 'pluck' | 'bell';
  percussion: 'wood' | 'stone' | 'war';
  motifs: readonly (readonly number[])[];
}

const mountainMotifs = [
  [7, -1, 5, 4, 2, -1, 4, 5],
  [4, 2, -1, 0, 2, 4, 5, -1],
  [7, 9, 7, 5, 4, -1, 5, 7],
  [5, -1, 4, 2, 0, -1, -1, 2],
] as const;
const martialMotifs = [
  [0, 0, 4, -1, 5, 4, 2, 0],
  [2, -1, 4, 5, 7, 5, 4, -1],
  [7, 7, 9, 7, 5, -1, 4, 2],
  [4, 2, 0, -1, 2, 4, 0, -1],
] as const;
const shadowMotifs = [
  [0, -1, 1, 4, 5, -1, 4, -1],
  [7, 5, -1, 4, 1, 0, -1, -1],
  [4, -1, 5, 7, 8, 7, 5, 4],
  [1, -1, 0, -1, 4, 1, 0, -1],
] as const;

export const musicThemes: Record<string, MusicTheme> = {
  'hac-phong-son': {
    id: 'hac-phong-son',
    bpm: 116,
    root: 50,
    scale: [0, 3, 5, 7, 10],
    lead: 'flute',
    percussion: 'wood',
    motifs: mountainMotifs,
  },
  'truyen-thua-dong-thien': {
    id: 'truyen-thua-dong-thien',
    bpm: 110,
    root: 48,
    scale: [0, 2, 5, 7, 10],
    lead: 'bell',
    percussion: 'stone',
    motifs: shadowMotifs,
  },
  'cuu-am-son-coc': {
    id: 'cuu-am-son-coc',
    bpm: 120,
    root: 49,
    scale: [0, 1, 5, 7, 8],
    lead: 'pluck',
    percussion: 'wood',
    motifs: shadowMotifs,
  },
  'ly-dia': {
    id: 'ly-dia',
    bpm: 128,
    root: 45,
    scale: [0, 3, 5, 7, 10],
    lead: 'pluck',
    percussion: 'war',
    motifs: martialMotifs,
  },
  'trung-do-doat-dich': {
    id: 'trung-do-doat-dich',
    bpm: 132,
    root: 50,
    scale: [0, 2, 5, 7, 9],
    lead: 'flute',
    percussion: 'war',
    motifs: martialMotifs,
  },
  'trung-do-hao-kiep': {
    id: 'trung-do-hao-kiep',
    bpm: 138,
    root: 43,
    scale: [0, 1, 5, 7, 8],
    lead: 'bell',
    percussion: 'war',
    motifs: shadowMotifs,
  },
};

for (const stage of worldTwoStages) {
  const i = stage.stageIndex;
  musicThemes[stage.id] = {
    id: stage.id,
    bpm: [118, 122, 126, 124, 108, 116, 122, 130, 112, 134, 128, 136, 120, 140][i],
    root: [47, 45, 48, 50, 54, 49, 46, 50, 52, 47, 49, 45, 48, 43][i],
    scale: i === 4 || i === 8 ? [0, 2, 4, 7, 9] : [0, 2, 5, 7, 10],
    lead: i === 4 || i === 12 ? 'bell' : i % 3 === 0 ? 'flute' : 'pluck',
    percussion: i >= 9 ? 'war' : i % 2 ? 'stone' : 'wood',
    motifs: i >= 9 ? martialMotifs : i % 2 ? shadowMotifs : mountainMotifs,
  };
}
const lobbyTheme: MusicTheme = {
  id: 'lang-tieu-cac',
  bpm: 78,
  root: 57,
  scale: [0, 2, 4, 7, 9],
  lead: 'pluck',
  percussion: 'wood',
  motifs: mountainMotifs,
};

export const MUSIC_LOOKAHEAD = 0.18;
export const MUSIC_TIMER_MS = 100;
export const MAX_MUSIC_VOICES = 4;

export function themeForContext(context: MusicContext): MusicTheme {
  if (context.screen === 'lobby' || context.screen === 'result') return lobbyTheme;
  const theme = musicThemes[context.stageId ?? ''] ?? musicThemes['hac-phong-son'];
  return context.screen === 'boss' ? { ...theme, bpm: theme.bpm + 14 } : theme;
}

export function musicBarDuration(context: MusicContext): number {
  return (60 / themeForContext(context).bpm) * 4;
}

function frequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function degree(theme: MusicTheme, index: number): number {
  const octave = Math.floor(index / theme.scale.length);
  const step = ((index % theme.scale.length) + theme.scale.length) % theme.scale.length;
  return frequency(theme.root + theme.scale[step] + octave * 12);
}

function tone(
  source: OscillatorType,
  hz: number,
  volume: number,
  duration: number,
  delay: number,
  attack = 0.008,
  pan = 0,
): SoundLayer {
  return { source, from: hz, to: hz, volume, duration, attack, delay, pan };
}

function pluck(hz: number, delay: number, gain = 1, pan = 0): SoundLayer[] {
  return [
    tone('triangle', hz, 0.11 * gain, 0.4, delay, 0.004, pan),
    tone('sine', hz * 2.004, 0.052 * gain, 0.16, delay, 0.003, pan),
    tone('sine', hz * 3.01, 0.021 * gain, 0.09, delay, 0.002, pan),
  ];
}

function lead(
  theme: MusicTheme,
  hz: number,
  delay: number,
  duration: number,
  gain: number,
): SoundLayer[] {
  if (theme.lead === 'pluck') return pluck(hz, delay, gain, 0.22);
  if (theme.lead === 'bell') {
    return [
      tone('sine', hz, 0.105 * gain, duration + 0.6, delay, 0.004, 0.2),
      tone('sine', hz * 2.76, 0.026 * gain, 0.35, delay, 0.002, -0.12),
      tone('triangle', hz * 1.002, 0.035 * gain, 0.38, delay, 0.004, 0.15),
    ];
  }
  return [
    {
      ...tone('sine', hz, 0.13 * gain, duration, delay, 0.028, 0.18),
      sustain: 0.65,
      release: 0.08,
    },
    {
      ...tone('sine', hz * 2.002, 0.024 * gain, duration * 0.85, delay, 0.04, -0.08),
      sustain: 0.4,
      release: 0.09,
    },
    {
      source: 'white-noise',
      filter: 'bandpass',
      from: hz * 2,
      to: hz * 2.1,
      volume: 0.009 * gain,
      duration,
      delay,
      attack: 0.04,
      pan: 0.18,
    },
  ];
}

function drum(delay: number, heavy: boolean, accent = 1): SoundLayer[] {
  return [
    {
      source: 'sine',
      from: heavy ? 145 : 185,
      to: heavy ? 44 : 64,
      volume: 0.21 * accent,
      duration: heavy ? 0.31 : 0.21,
      attack: 0.003,
      delay,
    },
    {
      source: 'brown-noise',
      filter: 'lowpass',
      from: 950,
      to: 140,
      volume: 0.13 * accent,
      duration: 0.13,
      attack: 0.002,
      delay,
    },
  ];
}

function rim(delay: number, stone: boolean, accent = 1): SoundLayer[] {
  return [
    tone('triangle', stone ? 740 : 1180, 0.065 * accent, 0.085, delay, 0.002, -0.35),
    {
      source: 'white-noise',
      filter: 'bandpass',
      from: stone ? 1800 : 2600,
      to: 900,
      volume: 0.06 * accent,
      duration: 0.075,
      attack: 0.002,
      delay,
      pan: -0.3,
    },
  ];
}

// Tám ô nhịp tạo thành câu nhạc: trống/bass giữ nhịp, câu giai điệu có khoảng nghỉ và biến tấu.
// Mọi lịch phát dùng giây AudioContext, không nhân theo tốc độ mô phỏng của chế độ test.
export function composeMusicBar(context: MusicContext, bar: number): SoundPreset {
  const theme = themeForContext(context),
    beat = 60 / theme.bpm;
  const lobby = context.screen === 'lobby' || context.screen === 'result';
  const boss = context.screen === 'boss';
  const intensity = Math.max(0, Math.min(1, context.intensity ?? 0.4));
  const phrase = ((bar % 8) + 8) % 8,
    motif = theme.motifs[phrase % theme.motifs.length];
  const layers: SoundLayer[] = [];
  const harmony = [0, 0, 3, 3, 4, 3, 1, 4][phrase];

  // Dây gảy đối đáp với sáo/chuông; không phủ giai điệu dày ở mọi phách.
  for (let step = 0; step < 8; step++) {
    const note = motif[step];
    if (note < 0 || (lobby && step % 2 === 1 && phrase % 2 === 0)) continue;
    const octave = lobby ? 0 : 5;
    const duration = (motif[(step + 1) % 8] < 0 ? 0.92 : 0.47) * beat;
    layers.push(
      ...lead(
        theme,
        degree(theme, note + octave),
        step * beat * 0.5,
        Math.max(0.15, duration),
        lobby ? 0.72 : 0.84,
      ),
    );
  }
  const arpeggio = lobby ? [0, 2, 4, 2] : [0, 4, 2, 4];
  for (let step = 0; step < 4; step++) {
    layers.push(
      ...pluck(
        degree(theme, harmony + arpeggio[step]),
        step * beat + beat * 0.25,
        lobby ? 0.5 : 0.38,
        -0.35,
      ),
    );
  }
  for (const interval of [0, 4]) {
    layers.push({
      ...tone(
        'sine',
        degree(theme, harmony + interval - 5),
        lobby ? 0.035 : 0.047,
        beat * 4.2,
        0,
        beat * 0.3,
        interval ? 0.4 : -0.4,
      ),
      sustain: 0.6,
      release: beat * 0.8,
    });
  }
  if (lobby) {
    // Chuông gió thưa để lobby thanh tĩnh nhưng không dùng chung vòng nhạc của chiến đấu.
    if (phrase % 4 === 3)
      layers.push(...lead({ ...theme, lead: 'bell' }, degree(theme, 12), beat * 2.6, 0.8, 0.3));
    return { priority: 0, cooldown: 0, layers };
  }

  const heavy = theme.percussion === 'war' || boss;
  const kickSteps = heavy ? [0, 3, 4, 6] : [0, 4, 6];
  for (const step of kickSteps)
    layers.push(...drum(step * beat * 0.5, heavy, step === 0 ? 1 : 0.68));
  for (const step of [2, 6]) layers.push(...rim(step * beat * 0.5, theme.percussion === 'stone'));
  for (let step = 0; step < 8; step++) {
    layers.push({
      source: 'white-noise',
      filter: 'highpass',
      from: 6100,
      to: 4300,
      volume: step % 2 === 0 ? 0.036 : 0.022,
      duration: 0.055,
      attack: 0.002,
      delay: step * beat * 0.5,
      pan: step % 2 ? -0.45 : 0.45,
    });
  }
  const bassSteps = heavy ? [0, 2, 3, 4, 6, 7] : [0, 3, 4, 6];
  for (const step of bassSteps) {
    const hz = degree(theme, harmony - 5 + (step === 7 ? 4 : 0));
    layers.push(tone('triangle', hz, 0.1, beat * 0.48, step * beat * 0.5, 0.006, -0.08));
    layers.push(tone('sine', hz, 0.08, beat * 0.5, step * beat * 0.5, 0.008, 0.08));
  }
  if (phrase === 3 || phrase === 7 || boss || intensity >= 0.7) {
    // Fill cuối câu và trống dồn khi giao tranh căng, không tăng tốc toàn bộ âm thanh.
    for (const step of [6, 6.5, 7, 7.5]) {
      layers.push(...rim(step * beat * 0.5, false, 0.42 + (step - 6) * 0.2));
    }
  }
  if (phrase === 0 || (boss && phrase % 2 === 0)) {
    layers.push({
      source: 'white-noise',
      filter: 'highpass',
      from: 3600,
      to: 1700,
      volume: 0.05,
      duration: beat * 1.5,
      attack: 0.006,
      delay: 0,
      pan: 0.3,
    });
    layers.push(tone('sine', degree(theme, -5), 0.085, beat * 2, 0, 0.008));
  }
  return { priority: 0, cooldown: 0, layers };
}

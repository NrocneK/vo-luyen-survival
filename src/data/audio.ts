export interface SoundLayer {
  source: OscillatorType | 'white-noise' | 'brown-noise';
  from: number;
  to: number;
  volume: number;
  duration: number;
  attack: number;
  delay?: number;
  filter?: BiquadFilterType;
  pan?: number;
  sustain?: number;
  release?: number;
}

export interface SoundPreset {
  // Hồi âm tính theo thời gian thực, không nhân theo tốc độ vượt ải.
  cooldown: number;
  priority: number;
  layers: readonly SoundLayer[];
}

export const soundPresets = {
  'attack-fist': {
    cooldown: 75,
    priority: 1,
    layers: [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 1800,
        to: 350,
        volume: 0.44,
        duration: 0.13,
        attack: 0.014,
      },
      {
        source: 'sine',
        from: 160,
        to: 62,
        volume: 0.34,
        duration: 0.16,
        attack: 0.006,
        delay: 0.025,
      },
    ],
  },
  'attack-sword': {
    cooldown: 90,
    priority: 1,
    layers: [
      {
        source: 'white-noise',
        filter: 'highpass',
        from: 4400,
        to: 850,
        volume: 0.3,
        duration: 0.22,
        attack: 0.025,
      },
      {
        source: 'triangle',
        from: 1750,
        to: 640,
        volume: 0.075,
        duration: 0.16,
        attack: 0.005,
        delay: 0.045,
      },
      { source: 'sine', from: 460, to: 170, volume: 0.1, duration: 0.16, attack: 0.01 },
    ],
  },
  'cast-fire': {
    cooldown: 110,
    priority: 1,
    layers: [
      {
        source: 'brown-noise',
        filter: 'lowpass',
        from: 2600,
        to: 450,
        volume: 0.47,
        duration: 0.34,
        attack: 0.035,
      },
      { source: 'sawtooth', from: 240, to: 70, volume: 0.065, duration: 0.27, attack: 0.018 },
      {
        source: 'white-noise',
        filter: 'highpass',
        from: 4800,
        to: 1900,
        volume: 0.16,
        duration: 0.1,
        attack: 0.005,
        delay: 0.1,
      },
    ],
  },
  'cast-lightning': {
    cooldown: 100,
    priority: 1,
    layers: [
      { source: 'sawtooth', from: 900, to: 60, volume: 0.13, duration: 0.19, attack: 0.003 },
      {
        source: 'white-noise',
        filter: 'highpass',
        from: 5600,
        to: 1500,
        volume: 0.27,
        duration: 0.17,
        attack: 0.003,
      },
      {
        source: 'triangle',
        from: 2100,
        to: 360,
        volume: 0.1,
        duration: 0.1,
        attack: 0.002,
        delay: 0.05,
      },
    ],
  },
  'cast-flame-ring': {
    cooldown: 180,
    priority: 2,
    layers: [
      {
        source: 'brown-noise',
        filter: 'lowpass',
        from: 650,
        to: 3200,
        volume: 0.46,
        duration: 0.58,
        attack: 0.065,
      },
      { source: 'sine', from: 200, to: 48, volume: 0.31, duration: 0.45, attack: 0.005 },
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 3100,
        to: 1100,
        volume: 0.19,
        duration: 0.36,
        attack: 0.018,
        delay: 0.08,
        pan: -0.18,
      },
      {
        source: 'triangle',
        from: 370,
        to: 100,
        volume: 0.055,
        duration: 0.4,
        attack: 0.035,
        delay: 0.03,
        pan: 0.18,
      },
    ],
  },
  'cast-chain-lightning': {
    cooldown: 150,
    priority: 2,
    layers: [
      {
        source: 'white-noise',
        filter: 'highpass',
        from: 7000,
        to: 1900,
        volume: 0.33,
        duration: 0.14,
        attack: 0.002,
        pan: -0.25,
      },
      { source: 'sawtooth', from: 1600, to: 210, volume: 0.1, duration: 0.11, attack: 0.002 },
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 4300,
        to: 1250,
        volume: 0.26,
        duration: 0.15,
        attack: 0.002,
        delay: 0.075,
        pan: 0.25,
      },
      {
        source: 'sine',
        from: 125,
        to: 42,
        volume: 0.25,
        duration: 0.35,
        attack: 0.008,
        delay: 0.04,
      },
    ],
  },
  'enemy-blade': {
    cooldown: 150,
    priority: 0,
    layers: [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 2900,
        to: 700,
        volume: 0.2,
        duration: 0.18,
        attack: 0.018,
      },
      {
        source: 'triangle',
        from: 950,
        to: 430,
        volume: 0.06,
        duration: 0.14,
        attack: 0.004,
        delay: 0.03,
      },
    ],
  },
  'enemy-arrow': {
    cooldown: 160,
    priority: 0,
    layers: [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 3800,
        to: 1800,
        volume: 0.19,
        duration: 0.16,
        attack: 0.003,
      },
      { source: 'sine', from: 680, to: 330, volume: 0.055, duration: 0.13, attack: 0.003 },
    ],
  },
  'boss-roar': {
    cooldown: 1700,
    priority: 4,
    layers: [
      {
        source: 'brown-noise',
        filter: 'lowpass',
        from: 1700,
        to: 210,
        volume: 0.45,
        duration: 1.1,
        attack: 0.025,
      },
      { source: 'triangle', from: 160, to: 42, volume: 0.23, duration: 0.8, attack: 0.025 },
      {
        source: 'sawtooth',
        from: 218,
        to: 66,
        volume: 0.07,
        duration: 0.7,
        attack: 0.06,
        delay: 0.08,
      },
    ],
  },
  'attack-monster': {
    cooldown: 130,
    priority: 0,
    layers: [
      {
        source: 'brown-noise',
        filter: 'bandpass',
        from: 850,
        to: 180,
        volume: 0.32,
        duration: 0.2,
        attack: 0.02,
      },
      { source: 'sine', from: 108, to: 43, volume: 0.26, duration: 0.22, attack: 0.008 },
    ],
  },
  hit: {
    cooldown: 65,
    priority: 0,
    layers: [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 1400,
        to: 320,
        volume: 0.2,
        duration: 0.07,
        attack: 0.002,
      },
      { source: 'sine', from: 185, to: 75, volume: 0.19, duration: 0.1, attack: 0.003 },
    ],
  },
  hurt: {
    cooldown: 180,
    priority: 3,
    layers: [
      {
        source: 'brown-noise',
        filter: 'lowpass',
        from: 1700,
        to: 180,
        volume: 0.4,
        duration: 0.25,
        attack: 0.003,
      },
      { source: 'sawtooth', from: 125, to: 48, volume: 0.13, duration: 0.29, attack: 0.007 },
    ],
  },
  awaken: {
    cooldown: 300,
    priority: 3,
    layers: [
      {
        source: 'sine',
        from: 523,
        to: 523,
        volume: 0.18,
        duration: 0.55,
        attack: 0.012,
        sustain: 0.35,
        release: 0.3,
      },
      {
        source: 'sine',
        from: 659,
        to: 659,
        volume: 0.15,
        duration: 0.5,
        attack: 0.012,
        delay: 0.09,
        sustain: 0.35,
        release: 0.3,
      },
      {
        source: 'triangle',
        from: 784,
        to: 1046,
        volume: 0.12,
        duration: 0.6,
        attack: 0.02,
        delay: 0.18,
        sustain: 0.35,
        release: 0.35,
      },
    ],
  },
  level: {
    cooldown: 180,
    priority: 3,
    layers: [
      { source: 'sine', from: 440, to: 440, volume: 0.24, duration: 0.3, attack: 0.015 },
      {
        source: 'sine',
        from: 660,
        to: 660,
        volume: 0.2,
        duration: 0.35,
        attack: 0.015,
        delay: 0.1,
      },
      {
        source: 'triangle',
        from: 880,
        to: 880,
        volume: 0.12,
        duration: 0.45,
        attack: 0.015,
        delay: 0.2,
      },
    ],
  },
  win: {
    cooldown: 600,
    priority: 4,
    layers: [
      { source: 'sine', from: 330, to: 330, volume: 0.22, duration: 0.4, attack: 0.02 },
      {
        source: 'sine',
        from: 440,
        to: 440,
        volume: 0.22,
        duration: 0.4,
        attack: 0.02,
        delay: 0.16,
      },
      { source: 'sine', from: 550, to: 550, volume: 0.2, duration: 0.4, attack: 0.02, delay: 0.32 },
      {
        source: 'triangle',
        from: 660,
        to: 660,
        volume: 0.16,
        duration: 0.7,
        attack: 0.02,
        delay: 0.48,
      },
    ],
  },
  lose: {
    cooldown: 900,
    priority: 4,
    layers: [
      { source: 'triangle', from: 293.66, to: 293.66, volume: 0.16, duration: 0.48, attack: 0.02 },
      {
        source: 'sine',
        from: 261.63,
        to: 261.63,
        volume: 0.19,
        duration: 0.55,
        attack: 0.02,
        delay: 0.25,
      },
      { source: 'sine', from: 220, to: 220, volume: 0.2, duration: 0.9, attack: 0.03, delay: 0.5 },
    ],
  },
  pickup: {
    cooldown: 115,
    priority: 0,
    layers: [
      { source: 'sine', from: 1050, to: 1390, volume: 0.065, duration: 0.075, attack: 0.003 },
      {
        source: 'triangle',
        from: 2100,
        to: 2780,
        volume: 0.018,
        duration: 0.06,
        attack: 0.002,
        delay: 0.012,
      },
    ],
  },
  ui: {
    cooldown: 60,
    priority: 2,
    layers: [{ source: 'sine', from: 540, to: 760, volume: 0.16, duration: 0.09, attack: 0.006 }],
  },
} as const satisfies Record<string, SoundPreset>;

export type SoundKind = keyof typeof soundPresets;
export const MAX_SOUND_VOICES = 12;

// Biến thể là các động tác khác nhau, thay vì phát lại một mẫu âm ở mọi đòn.
// Bản đầu giữ nguyên để âm mở đầu/UI nhất quán và kiểm thử được bằng đồng hồ giả.
const soundVariants: Partial<Record<SoundKind, readonly (readonly SoundLayer[])[]>> = {
  'attack-fist': [
    [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 2100,
        to: 270,
        volume: 0.45,
        duration: 0.16,
        attack: 0.012,
        pan: 0.12,
      },
      {
        source: 'sine',
        from: 145,
        to: 52,
        volume: 0.38,
        duration: 0.2,
        attack: 0.005,
        delay: 0.028,
      },
    ],
    [
      {
        source: 'brown-noise',
        filter: 'bandpass',
        from: 480,
        to: 1900,
        volume: 0.42,
        duration: 0.19,
        attack: 0.022,
        pan: -0.12,
      },
      {
        source: 'triangle',
        from: 210,
        to: 68,
        volume: 0.16,
        duration: 0.18,
        attack: 0.005,
        delay: 0.045,
      },
      {
        source: 'sine',
        from: 118,
        to: 45,
        volume: 0.28,
        duration: 0.18,
        attack: 0.004,
        delay: 0.05,
      },
    ],
  ],
  'attack-sword': [
    [
      {
        source: 'white-noise',
        filter: 'highpass',
        from: 1700,
        to: 4700,
        volume: 0.28,
        duration: 0.25,
        attack: 0.035,
        pan: -0.2,
      },
      {
        source: 'triangle',
        from: 1350,
        to: 600,
        volume: 0.08,
        duration: 0.21,
        attack: 0.005,
        delay: 0.055,
        pan: 0.15,
      },
      { source: 'sine', from: 370, to: 150, volume: 0.09, duration: 0.17, attack: 0.01 },
    ],
    [
      {
        source: 'white-noise',
        filter: 'bandpass',
        from: 5300,
        to: 1300,
        volume: 0.34,
        duration: 0.14,
        attack: 0.007,
      },
      {
        source: 'sine',
        from: 1950,
        to: 800,
        volume: 0.09,
        duration: 0.12,
        attack: 0.003,
        delay: 0.02,
      },
      {
        source: 'triangle',
        from: 380,
        to: 120,
        volume: 0.1,
        duration: 0.16,
        attack: 0.004,
        delay: 0.025,
      },
    ],
  ],
};

export function soundForOccurrence(kind: SoundKind, occurrence: number): SoundPreset {
  const preset: SoundPreset = soundPresets[kind];
  const variants = soundVariants[kind];
  if (variants) {
    const variant = occurrence % (variants.length + 1);
    return variant === 0 ? preset : { ...preset, layers: variants[variant - 1] };
  }
  if (occurrence === 0 || ['ui', 'level', 'win', 'lose'].includes(kind)) return preset;
  const pitch = [1, 0.94, 1.045, 0.98][occurrence % 4];
  const gain = [1, 0.94, 1, 0.97][occurrence % 4];
  return {
    ...preset,
    layers: preset.layers.map((layer) => ({
      ...layer,
      from: layer.from * pitch,
      to: layer.to * pitch,
      volume: layer.volume * gain,
      pan: layer.pan ?? (occurrence % 2 ? -0.08 : 0.08),
    })),
  };
}

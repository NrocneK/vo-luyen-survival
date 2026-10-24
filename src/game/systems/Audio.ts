import { MAX_SOUND_VOICES, soundForOccurrence, soundPresets } from '../../data/audio.ts';
import type { SoundKind, SoundLayer, SoundPreset } from '../../data/audio.ts';
import {
  composeMusicBar,
  MAX_MUSIC_VOICES,
  MUSIC_LOOKAHEAD,
  MUSIC_TIMER_MS,
  musicBarDuration,
} from '../../data/music.ts';
import type { MusicContext } from '../../data/music.ts';

interface AudioEnvironment {
  createContext?: () => AudioContext;
  now?: () => number;
  setInterval?: (callback: () => void, milliseconds: number) => number;
  clearInterval?: (id: number) => void;
}

interface Voice {
  bus: 'sound' | 'music';
  priority: number;
  sources: AudioScheduledSourceNode[];
  nodes: AudioNode[];
  remaining: number;
}

// Tổng hợp cục bộ: tiếng gió, lực quyền, lưỡi kiếm và nguyên tố; không cần tải file âm thanh.
export class GameAudio {
  private context: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private master: GainNode | null = null;
  private soundBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private musicTimer: number | null = null;
  private sound = true;
  private music = true;
  private disposed = false;
  private resuming = false;
  private pendingSound: SoundKind | null = null;
  private musicContext: MusicContext = { screen: 'lobby' };
  private nextBarTime = 0;
  private bar = 0;
  private voices = new Set<Voice>();
  private lastPlayed = new Map<SoundKind, number>();
  private occurrences = new Map<SoundKind, number>();
  private noiseBuffers = new Map<string, AudioBuffer>();
  private readonly environment: Required<AudioEnvironment>;

  constructor(environment: AudioEnvironment = {}) {
    this.environment = {
      createContext: environment.createContext ?? (() => new AudioContext()),
      now: environment.now ?? (() => performance.now()),
      setInterval: environment.setInterval ?? ((callback, ms) => window.setInterval(callback, ms)),
      clearInterval: environment.clearInterval ?? ((id) => window.clearInterval(id)),
    };
  }

  setContext(context: MusicContext): void {
    if (this.disposed) return;
    const changed =
      context.screen !== this.musicContext.screen || context.stageId !== this.musicContext.stageId;
    this.musicContext = {
      ...context,
      intensity: Math.max(0, Math.min(1, context.intensity ?? 0.4)),
    };
    if (!changed) return;
    this.stopMusicTimer();
    this.stopBus('music');
    this.bar = 0;
    this.nextBarTime = 0;
    this.startMusic();
  }

  // Chỉ gọi từ thao tác người dùng. Nhạc và hiệu ứng có bus riêng, tắt bên nào dừng bên đó.
  activate(sound: boolean, music: boolean): void {
    if (this.disposed) return;
    this.sound = sound;
    this.music = music;
    if (!sound) {
      this.pendingSound = null;
      this.stopBus('sound');
    }
    if (!music) {
      this.stopMusicTimer();
      this.stopBus('music');
    }
    if (!sound && !music) return;
    try {
      if (!this.context) this.createGraph();
      if (this.context!.state === 'suspended' && !this.resuming) {
        this.resuming = true;
        void this.context!.resume().then(
          () => {
            this.resuming = false;
            const pending = this.pendingSound;
            this.pendingSound = null;
            this.startMusic();
            if (pending !== null) this.play(pending);
          },
          () => {
            this.resuming = false;
            this.pendingSound = null;
          },
        );
      }
      this.startMusic();
    } catch {
      this.resuming = false;
      this.pendingSound = null;
      // Trình duyệt chưa cho phép âm thanh: trò chơi vẫn tiếp tục và có thể thử lại khi bấm nút.
    }
  }

  private createGraph(): void {
    const context = this.environment.createContext();
    const master = context.createGain(),
      compressor = context.createDynamicsCompressor(),
      soundBus = context.createGain(),
      musicBus = context.createGain();
    master.gain.value = 0.68;
    soundBus.gain.value = 0.88;
    musicBus.gain.value = this.musicVolume();
    // Giới hạn biên độ khi nhiều quái đánh cùng lúc hoặc bật tốc độ thử nghiệm x6.
    compressor.threshold.value = -14;
    compressor.knee.value = 8;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.16;
    soundBus.connect(compressor);
    musicBus.connect(compressor);
    compressor.connect(master);
    master.connect(context.destination);
    this.context = context;
    this.master = master;
    this.compressor = compressor;
    this.soundBus = soundBus;
    this.musicBus = musicBus;
  }

  private startMusic(): void {
    if (
      !this.music ||
      this.disposed ||
      this.context?.state !== 'running' ||
      this.musicTimer !== null
    )
      return;
    const gain = this.musicBus!.gain,
      now = this.context!.currentTime;
    gain.cancelScheduledValues?.(now);
    gain.setValueAtTime(0.0001, now);
    gain.linearRampToValueAtTime(this.musicVolume(), now + 0.22);
    this.nextBarTime = now + 0.035;
    this.scheduleMusic();
    this.musicTimer = this.environment.setInterval(() => this.scheduleMusic(), MUSIC_TIMER_MS);
  }

  private stopMusicTimer(): void {
    if (this.musicTimer !== null) this.environment.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private musicVolume(): number {
    return this.musicContext.screen === 'lobby' || this.musicContext.screen === 'result'
      ? 0.25
      : 0.4;
  }

  private scheduleMusic(): void {
    const context = this.context;
    if (!this.music || this.disposed || context?.state !== 'running') return;
    // Tab chạy nền có thể trễ nhiều nhịp: bỏ phần đã lỡ, không phát dồn nhạc lúc quay lại.
    if (this.nextBarTime < context.currentTime - MUSIC_LOOKAHEAD)
      this.nextBarTime = context.currentTime + 0.035;
    if (this.nextBarTime > context.currentTime + MUSIC_LOOKAHEAD) return;
    const voices = [...this.voices].filter((voice) => voice.bus === 'music');
    if (voices.length >= MAX_MUSIC_VOICES) this.release(voices[0], true);
    this.render(composeMusicBar(this.musicContext, this.bar++), 'music', this.nextBarTime);
    this.nextBarTime += musicBarDuration(this.musicContext);
  }

  private noise(kind: string): AudioBuffer {
    const cached = this.noiseBuffers.get(kind);
    if (cached) return cached;
    const context = this.context!,
      buffer = context.createBuffer(1, context.sampleRate, context.sampleRate),
      samples = buffer.getChannelData(0);
    let seed = 0x69f42a,
      brown = 0;
    for (let index = 0; index < samples.length; index++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      const white = (seed >>> 0) / 0x80000000 - 1;
      brown = (brown + white * 0.02) / 1.02;
      samples[index] = kind === 'brown-noise' ? brown * 3.5 : white;
    }
    this.noiseBuffers.set(kind, buffer);
    return buffer;
  }

  private render(preset: SoundPreset, bus: Voice['bus'], start?: number): void {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    const voice: Voice = { bus, priority: preset.priority, sources: [], nodes: [], remaining: 0 };
    this.voices.add(voice);
    try {
      const scheduled = start ?? context.currentTime;
      for (const layer of preset.layers) this.addLayer(layer, voice, scheduled);
    } catch {
      this.release(voice, true);
    }
  }

  private addLayer(layer: SoundLayer, voice: Voice, scheduled: number): void {
    const context = this.context!,
      start = scheduled + (layer.delay ?? 0),
      gain = context.createGain();
    let source: AudioScheduledSourceNode, output: AudioNode;
    voice.nodes.push(gain);
    if (layer.source === 'white-noise' || layer.source === 'brown-noise') {
      const noise = context.createBufferSource();
      noise.buffer = this.noise(layer.source);
      noise.loop = true;
      source = noise;
      output = noise;
    } else {
      const oscillator = context.createOscillator();
      oscillator.type = layer.source;
      oscillator.frequency.setValueAtTime(layer.from, start);
      oscillator.frequency.exponentialRampToValueAtTime(layer.to, start + layer.duration);
      source = oscillator;
      output = oscillator;
    }
    if (layer.filter || layer.source === 'white-noise' || layer.source === 'brown-noise') {
      const filter = context.createBiquadFilter();
      filter.type = layer.filter ?? 'lowpass';
      filter.Q.value = layer.filter === 'bandpass' ? 0.7 : 0.5;
      filter.frequency.setValueAtTime(layer.from, start);
      filter.frequency.exponentialRampToValueAtTime(layer.to, start + layer.duration);
      output.connect(filter);
      output = filter;
      voice.nodes.push(filter);
    }
    voice.sources.push(source);
    voice.remaining++;
    output.connect(gain);
    const bus = voice.bus === 'sound' ? this.soundBus! : this.musicBus!;
    if (layer.pan && typeof context.createStereoPanner === 'function') {
      const pan = context.createStereoPanner();
      pan.pan.value = layer.pan;
      gain.connect(pan);
      pan.connect(bus);
      voice.nodes.push(pan);
    } else gain.connect(bus);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(layer.volume, start + layer.attack);
    if (layer.sustain !== undefined) {
      const sustain = Math.max(0.0001, layer.volume * layer.sustain);
      const release = Math.min(
        layer.release ?? layer.duration * 0.35,
        layer.duration - layer.attack,
      );
      gain.gain.linearRampToValueAtTime(sustain, start + layer.duration - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + layer.duration);
    } else gain.gain.exponentialRampToValueAtTime(0.0001, start + layer.duration);
    source.onended = () => {
      if (--voice.remaining === 0) this.release(voice, false);
    };
    source.start(start);
    source.stop(start + layer.duration + 0.02);
  }

  private release(voice: Voice, stop: boolean): void {
    if (!this.voices.delete(voice)) return;
    for (const source of voice.sources) {
      source.onended = null;
      if (stop) {
        try {
          source.stop();
        } catch {
          /* Nguồn đã kết thúc trước lúc đóng AudioContext. */
        }
      }
      source.disconnect();
    }
    for (const node of voice.nodes) node.disconnect();
  }

  private stopBus(bus: Voice['bus']): void {
    for (const voice of this.voices) if (voice.bus === bus) this.release(voice, true);
  }

  play(kind: string): void {
    if (!this.sound || this.disposed || !this.context) return;
    if (!Object.hasOwn(soundPresets, kind)) return;
    const soundKind = kind as SoundKind;
    if (this.context.state !== 'running') {
      // Giữ đúng một tiếng của lần bấm mở âm đầu tiên, không tích hàng đợi âm chiến đấu.
      if (this.context.state === 'suspended' && this.resuming) this.pendingSound ??= soundKind;
      return;
    }
    const occurrence = this.occurrences.get(soundKind) ?? 0;
    const preset = soundForOccurrence(soundKind, occurrence),
      now = this.environment.now(),
      last = this.lastPlayed.get(soundKind);
    if (last !== undefined && now - last < preset.cooldown) return;
    const effects = [...this.voices].filter((voice) => voice.bus === 'sound');
    if (effects.length >= MAX_SOUND_VOICES) {
      const oldest = effects.find((voice) => voice.priority <= preset.priority);
      if (!oldest) return;
      this.release(oldest, true);
    }
    this.lastPlayed.set(soundKind, now);
    this.occurrences.set(soundKind, occurrence + 1);
    if (
      this.musicBus &&
      ['hurt', 'boss-roar', 'level', 'awaken', 'win', 'lose'].includes(soundKind)
    ) {
      // Hạ nhạc ngắn ở phản hồi quan trọng để tiếng báo không bị trống/bass che mất.
      const gain = this.musicBus.gain,
        at = this.context.currentTime;
      gain.cancelScheduledValues?.(at);
      gain.setValueAtTime(this.musicVolume() * 0.45, at);
      gain.linearRampToValueAtTime(this.musicVolume(), at + 0.4);
    }
    this.render(preset, 'sound');
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pendingSound = null;
    this.stopMusicTimer();
    for (const voice of this.voices) this.release(voice, true);
    this.soundBus?.disconnect();
    this.musicBus?.disconnect();
    this.compressor?.disconnect();
    this.master?.disconnect();
    this.noiseBuffers.clear();
    this.lastPlayed.clear();
    this.occurrences.clear();
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
    this.context = null;
  }
}

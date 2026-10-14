// Nhạc ngũ cung và tiếng va chạm tổng hợp cục bộ; chỉ khởi động sau thao tác người dùng.
export class GameAudio {
  private context: AudioContext | null = null;
  private musicTimer: number | null = null;
  private sound = true;
  private music = true;
  private note = 0;
  activate(sound: boolean, music: boolean): void {
    this.sound = sound;
    this.music = music;
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
    } catch {
      return;
    }
    if (music && !this.musicTimer) {
      this.melody();
      this.musicTimer = window.setInterval(() => this.melody(), 4000);
    }
    if (!music && this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
  private tone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
    delay = 0,
  ): void {
    if (!this.context) return;
    const time = this.context.currentTime + delay,
      oscillator = this.context.createOscillator(),
      gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.04);
  }
  private melody(): void {
    if (!this.music) return;
    const notes = [220, 246.94, 329.63, 293.66, 369.99, 293.66, 246.94, 220];
    for (let index = 0; index < 4; index++)
      this.tone(notes[(this.note++ + index) % notes.length], 1.8, 0.012, 'triangle', index * 0.85);
    this.tone(110, 3.5, 0.009);
  }
  play(kind: string): void {
    if (!this.sound || !this.context) return;
    if (kind === 'hit') this.tone(110, 0.09, 0.022, 'triangle');
    else if (kind === 'hurt') this.tone(65, 0.15, 0.04, 'sawtooth');
    else if (kind === 'level' || kind === 'win') {
      this.tone(440, 0.25, 0.04);
      this.tone(660, 0.35, 0.035, 'sine', 0.1);
    } else this.tone(330, 0.12, 0.025, 'triangle');
  }
  dispose(): void {
    if (this.musicTimer) clearInterval(this.musicTimer);
    void this.context?.close();
  }
}

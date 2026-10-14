import type { GameCommand, GameSnapshot } from '../shared/types';
import type { Profile, PillId, RunResult } from '../shared/models';
import { EMPTY_RUN, weaponFromEquipment } from '../shared/models';
import { areaAt } from '../data/stages';
import { skills } from '../data/skills';
import { realms } from '../data/realms';
import { loadProfile, saveProfile, exportSave, importSave } from '../persistence/save';
import {
  claimIdle,
  breakthrough,
  brew,
  usePill,
  forge,
  upgrade,
  equip,
  unlockPet,
  feedPet,
  evolvePet,
  applyResult,
  cleanLoadout,
} from '../domain/profile';
import { GameAudio } from '../game/systems/Audio';

export class GameBridge {
  private snapshot: GameSnapshot;
  private listeners = new Set<() => void>();
  private commands = new Set<(command: GameCommand) => void>();
  readonly audio = new GameAudio();
  private timer: number;
  private autosave = 0;
  private disposed = false;
  constructor() {
    const loaded = loadProfile(),
      profile = loaded.profile;
    const idle = claimIdle(profile, Date.now());
    this.snapshot = {
      mode: 'menu',
      lobbyArea: 'courtyard',
      status: 'loading',
      progress: 0,
      weapon: weaponFromEquipment(profile.equipped.weapon),
      position: { x: 0, y: 0 },
      direction: 'S',
      area: areaAt({ x: 0, y: 0 }),
      distance: 0,
      zoom: 2,
      error: null,
      profile,
      run: { ...EMPTY_RUN },
      cards: [],
      result: null,
      toast:
        loaded.warning ||
        (idle >= 1 ? `Hấp thụ linh khí ngoại tuyến: +${idle.toFixed(1)} tu vi.` : ''),
      idleGained: idle,
      saveOk: true,
    };
    this.timer = window.setInterval(() => {
      const current = structuredClone(this.snapshot.profile);
      claimIdle(current, Date.now());
      this.update({ profile: current });
      if (++this.autosave % 15 === 0) this.persist();
    }, 1000);
    window.addEventListener('pagehide', this.persist);
  }
  getSnapshot = (): GameSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  update(values: Partial<GameSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...values };
    this.listeners.forEach((listener) => listener());
  }
  onCommand(listener: (command: GameCommand) => void): () => void {
    this.commands.add(listener);
    return () => {
      this.commands.delete(listener);
    };
  }
  activateAudio(): void {
    const settings = this.snapshot.profile.settings;
    this.audio.activate(settings.sound, settings.music);
  }
  dispatch(command: GameCommand): void {
    this.activateAudio();
    if (command.type === 'travel') {
      if (this.snapshot.mode !== 'menu') return;
      this.update({ lobbyArea: command.area });
    }
    if (command.type === 'start' && this.snapshot.status !== 'ready') return;
    this.commands.forEach((listener) => listener(command));
  }
  toast(message: string): void {
    this.update({ toast: message });
  }
  act(
    action:
      | 'breakthrough'
      | 'brew'
      | 'pill'
      | 'forge'
      | 'upgrade'
      | 'equip'
      | 'unlockPet'
      | 'feedPet'
      | 'evolvePet'
      | 'activePet'
      | 'skill',
    id = '',
  ): void {
    if (this.snapshot.mode !== 'menu') return;
    const profile = structuredClone(this.snapshot.profile);
    let message = '';
    switch (action) {
      case 'breakthrough':
        message = breakthrough(profile);
        break;
      case 'brew':
        message = brew(profile, id as PillId);
        break;
      case 'pill':
        message = usePill(profile, id as PillId);
        break;
      case 'forge':
        message = forge(profile, id);
        break;
      case 'upgrade':
        message = upgrade(profile, id);
        break;
      case 'equip':
        message = equip(profile, id);
        break;
      case 'unlockPet':
        message = unlockPet(profile, id);
        break;
      case 'feedPet':
        message = feedPet(profile, id);
        break;
      case 'evolvePet':
        message = evolvePet(profile, id);
        break;
      case 'activePet':
        if (!id || profile.pets[id]) {
          profile.activePet = id || null;
          message = id ? 'Đã chọn linh thú đồng hành.' : 'Đã cho linh thú nghỉ ngơi.';
        }
        break;
      case 'skill':
        if (
          !skills[id] ||
          skills[id].realm > profile.realm ||
          ['cuong-quyen', 'nguyen-khi-tram'].includes(id)
        )
          break;
        if (profile.selectedSkills.includes(id)) {
          profile.selectedSkills = profile.selectedSkills.filter((skill) => skill !== id);
          message = 'Đã bỏ kỹ năng khỏi bộ mang theo.';
        } else if (profile.selectedSkills.length < realms[profile.realm].slots - 1) {
          profile.selectedSkills.push(id);
          message = 'Đã chọn kỹ năng. Vào màn cần thẻ kích hoạt.';
        } else message = 'Đã đầy ô kỹ năng. Tu luyện để mở thêm ô.';
        break;
    }
    cleanLoadout(profile);
    this.update({ profile, weapon: weaponFromEquipment(profile.equipped.weapon), toast: message });
    this.persist();
    this.activateAudio();
    this.audio.play('ui');
  }
  finish(result: RunResult): void {
    if (this.snapshot.result && this.snapshot.mode === 'result') return;
    const profile = structuredClone(this.snapshot.profile);
    applyResult(profile, result);
    this.update({ profile, result, mode: 'result', cards: [] });
    this.persist();
  }
  consumePotion(): void {
    const profile = structuredClone(this.snapshot.profile);
    profile.pills['hoi-nguyen-dan'] = Math.max(0, profile.pills['hoi-nguyen-dan'] - 1);
    this.update({ profile });
    this.persist();
  }
  persist = (): void => {
    if (!this.disposed) {
      const saveOk = saveProfile(this.snapshot.profile);
      if (saveOk !== this.snapshot.saveOk) this.update({ saveOk });
    }
  };
  setting(key: keyof Profile['settings'], value: boolean): void {
    const profile = structuredClone(this.snapshot.profile);
    profile.settings[key] = value;
    this.update({ profile });
    this.persist();
    this.activateAudio();
  }
  export(): void {
    this.persist();
    exportSave(this.snapshot.profile);
    this.toast('Đã xuất file tiến trình.');
  }
  async import(file: File): Promise<void> {
    if (this.snapshot.mode !== 'menu') return;
    try {
      const profile = await importSave(file);
      const idleGained = claimIdle(profile, Date.now());
      this.update({
        profile,
        weapon: weaponFromEquipment(profile.equipped.weapon),
        idleGained,
        toast: 'Đã nhập tiến trình thành công.',
      });
      this.persist();
      this.activateAudio();
    } catch (error) {
      this.toast(error instanceof Error ? error.message : 'Không nhập được file lưu.');
    }
  }
  dispose(): void {
    this.persist();
    this.disposed = true;
    clearInterval(this.timer);
    window.removeEventListener('pagehide', this.persist);
    this.audio.dispose();
  }
}

import type { GameCommand, GameSnapshot } from '../shared/types';
import type { Profile, PillId, RunResult } from '../shared/models';
import { EMPTY_RUN, weaponFromEquipment } from '../shared/models';
import { areaAt, stageById } from '../data/stages';
import {
  stageUnlocked,
  stageLockReason,
  worldProgress,
  justCompletedWorld,
  newlyCompletedWorld,
  currentWorld,
} from '../data/campaign';
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
  unequip,
  unlockPet,
  feedPet,
  evolvePet,
  applyResult,
  cleanLoadout,
  skillUnlocked,
} from '../domain/profile';
import { GameAudio } from '../game/systems/Audio';
import { defaultTestSettings, normalizeTestSettings } from '../data/testing';
import type { TestSettings } from '../data/testing';
import {
  applyTestAction,
  loadTestProfile,
  replenishTestResources,
  saveTestProfile,
} from '../domain/testing';
import type { TestAction } from '../domain/testing';
import { cameraSettings } from '../data/camera';

export class GameBridge {
  private snapshot: GameSnapshot;
  private listeners = new Set<() => void>();
  private commands = new Set<(command: GameCommand) => void>();
  readonly audio = new GameAudio();
  private timer: number;
  private autosave = 0;
  private disposed = false;
  private mainProfile: Profile | null = null;
  private afterStoryStart = false;
  constructor() {
    const loaded = loadProfile(),
      profile = loaded.profile;
    const idle = claimIdle(profile, Date.now());
    this.snapshot = {
      test: { ...defaultTestSettings },
      mode: 'menu',
      stageId: profile.selectedStageId,
      lobbyArea: 'courtyard',
      status: 'loading',
      progress: 0,
      weapon: weaponFromEquipment(profile.equipped.weapon),
      position: { x: 0, y: 0 },
      direction: 'S',
      area: areaAt({ x: 0, y: 0 }),
      distance: 0,
      zoom: cameraSettings.defaultZoom,
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
      chapterEndingOpen: false,
      chapterEndingWorld: 1,
      storyOpen: false,
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
    const state = this.snapshot;
    this.audio.setContext({
      screen:
        state.mode === 'menu'
          ? 'lobby'
          : state.mode === 'result'
            ? 'result'
            : state.run.boss
              ? 'boss'
              : 'battle',
      stageId: state.stageId,
      intensity: Math.min(
        1,
        (state.run.time / stageById(state.stageId).duration) * 0.65 +
          (state.run.enemies / 120) * 0.35,
      ),
    });
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
    if (command.type === 'chapter-ending') {
      if (this.snapshot.storyOpen) return;
      if (!['menu', 'result'].includes(this.snapshot.mode)) return;
      const world = command.world ?? currentWorld(this.snapshot.profile);
      if (command.open && !worldProgress(this.snapshot.profile, world).completed) return;
      this.update({ chapterEndingOpen: command.open, chapterEndingWorld: world });
      return;
    }
    if (this.snapshot.chapterEndingOpen) return;
    if (command.type === 'story') {
      if (this.snapshot.mode !== 'menu' && this.snapshot.mode !== 'result') return;
      if (command.open) {
        if (
          !this.snapshot.profile.stageProgress['thong-huyen-tru']?.wins &&
          !this.snapshot.test.enabled
        )
          return;
        this.afterStoryStart = false;
        this.update({ storyOpen: true });
      } else if (this.snapshot.storyOpen) {
        const profile = structuredClone(this.snapshot.profile);
        profile.storySeen = [...new Set([...profile.storySeen, 'ma-do'])];
        this.update({ profile, storyOpen: false });
        this.persist();
        if (this.afterStoryStart) {
          this.afterStoryStart = false;
          this.dispatch({ type: 'start' });
        }
      }
      return;
    }
    if (this.snapshot.storyOpen) return;
    if (command.type === 'stage') {
      if (this.snapshot.mode !== 'menu') return;
      const selected = stageById(command.id);
      // Chọn màn khóa để đọc điều kiện; chỉ ghi lựa chọn hợp lệ vào bản lưu.
      this.update({ stageId: selected.id });
      if (this.snapshot.test.enabled || stageUnlocked(this.snapshot.profile, selected.id)) {
        const profile = structuredClone(this.snapshot.profile);
        profile.selectedStageId = selected.id;
        this.update({ profile });
        this.persist();
      }
      return;
    }
    if (command.type === 'travel') {
      if (this.snapshot.mode !== 'menu') return;
      this.update({ lobbyArea: command.area });
    }
    if (command.type === 'start') {
      if (this.snapshot.status !== 'ready' || this.snapshot.mode !== 'menu') return;
      if (
        !this.snapshot.test.enabled &&
        !stageUnlocked(this.snapshot.profile, this.snapshot.stageId)
      ) {
        this.toast(stageLockReason(this.snapshot.profile, this.snapshot.stageId));
        return;
      }
      if (
        this.snapshot.stageId === 'dai-chien-cot-toc' &&
        !this.snapshot.profile.storySeen.includes('ma-do')
      ) {
        this.afterStoryStart = true;
        this.update({ storyOpen: true });
        return;
      }
    }
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
      | 'unequip'
      | 'unlockPet'
      | 'feedPet'
      | 'evolvePet'
      | 'activePet'
      | 'skill',
    id = '',
    quantity: number | 'max' = 1,
  ): void {
    if (this.snapshot.mode !== 'menu' || this.snapshot.chapterEndingOpen || this.snapshot.storyOpen)
      return;
    const profile = structuredClone(this.snapshot.profile);
    if (this.snapshot.test.enabled && this.snapshot.test.unlimitedResources)
      replenishTestResources(profile);
    let message = '';
    switch (action) {
      case 'breakthrough':
        message = breakthrough(profile);
        break;
      case 'brew':
        message = brew(profile, id as PillId, quantity);
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
      case 'unequip':
        message = unequip(profile, id);
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
          (this.snapshot.test.enabled
            ? skills[id].realm > profile.realm
            : !skillUnlocked(profile, id)) ||
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
    cleanLoadout(profile, this.snapshot.test.enabled);
    if (this.snapshot.test.enabled && this.snapshot.test.unlimitedResources)
      replenishTestResources(profile);
    this.update({
      profile,
      weapon: weaponFromEquipment(profile.equipped.weapon),
      toast: message,
      chapterEndingOpen: justCompletedWorld(this.snapshot.profile, profile),
      chapterEndingWorld:
        newlyCompletedWorld(this.snapshot.profile, profile) ||
        this.snapshot.chapterEndingWorld ||
        1,
    });
    this.persist();
    this.activateAudio();
    this.audio.play('ui');
  }
  finish(result: RunResult): void {
    if (result.settled) return;
    if (this.snapshot.result && this.snapshot.mode === 'result') return;
    const profile = structuredClone(this.snapshot.profile);
    applyResult(profile, result);
    if (this.snapshot.test.enabled && this.snapshot.test.unlimitedResources)
      replenishTestResources(profile);
    this.update({
      profile,
      result,
      mode: 'result',
      cards: [],
      chapterEndingOpen: justCompletedWorld(this.snapshot.profile, profile),
      chapterEndingWorld:
        newlyCompletedWorld(this.snapshot.profile, profile) ||
        this.snapshot.chapterEndingWorld ||
        1,
    });
    this.persist();
  }
  consumePotion(): void {
    const profile = structuredClone(this.snapshot.profile);
    profile.pills['hoi-nguyen-dan'] = Math.max(0, profile.pills['hoi-nguyen-dan'] - 1);
    if (this.snapshot.test.enabled && this.snapshot.test.unlimitedResources)
      replenishTestResources(profile);
    this.update({ profile });
    this.persist();
  }
  persist = (): void => {
    if (!this.disposed) {
      const saveOk = this.snapshot.test.enabled
        ? saveTestProfile(this.snapshot.profile)
        : saveProfile(this.snapshot.profile);
      if (saveOk !== this.snapshot.saveOk) this.update({ saveOk });
    }
  };
  testSettings(partial: Partial<TestSettings>): void {
    const current = this.snapshot.test;
    const next = normalizeTestSettings({ ...current, ...partial });
    if (next.enabled !== current.enabled) {
      if (this.snapshot.mode !== 'menu') {
        this.toast('Bật hoặc tắt chế độ test tại lobby.');
        return;
      }
      // Lưu tiến trình chính trước khi đổi; mọi thao tác test đi vào khóa riêng.
      this.persist();
      let profile: Profile;
      let warning = '';
      if (next.enabled) {
        this.mainProfile = structuredClone(this.snapshot.profile);
        const loaded = loadTestProfile(this.mainProfile);
        profile = loaded.profile;
        warning = loaded.warning;
      } else {
        profile = structuredClone(this.mainProfile ?? loadProfile().profile);
        this.mainProfile = null;
        claimIdle(profile, Date.now());
      }
      if (next.enabled && next.unlimitedResources) replenishTestResources(profile);
      this.update({
        test: next,
        chapterEndingOpen: false,
        profile,
        stageId: profile.selectedStageId,
        weapon: weaponFromEquipment(profile.equipped.weapon),
        toast:
          warning ||
          (next.enabled
            ? 'Đang dùng tiến trình test riêng. Mọi màn đã mở để test.'
            : 'Đã trở về tiến trình chính.'),
      });
      this.persist();
      return;
    }
    const profile = structuredClone(this.snapshot.profile);
    if (next.enabled && next.unlimitedResources) replenishTestResources(profile);
    this.update({ test: next, profile });
    this.persist();
  }
  testAction(action: TestAction, amount?: number): void {
    if (!this.snapshot.test.enabled || this.snapshot.mode !== 'menu') return;
    const profile = structuredClone(this.snapshot.profile);
    const toast = applyTestAction(profile, action, amount);
    if (this.snapshot.test.unlimitedResources) replenishTestResources(profile);
    this.update({
      profile,
      toast,
      chapterEndingOpen: justCompletedWorld(this.snapshot.profile, profile),
    });
    this.persist();
  }
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
        stageId: profile.selectedStageId,
        weapon: weaponFromEquipment(profile.equipped.weapon),
        idleGained,
        chapterEndingOpen: false,
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

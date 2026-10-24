import './world-two-audit';
import { newProfile, upgradeCost } from '../src/domain/profile';
import { equipment } from '../src/data/equipment';
import { allStages } from '../src/data/stages';
import { realms } from '../src/data/realms';
import { recipes } from '../src/data/recipes';
import { weaponFromEquipment, type Profile } from '../src/shared/models';
import type { GameBridge } from '../src/app/GameBridge';
const bridge = (Reflect.get(window, 'worldTwoQA') as { bridge: GameBridge }).bridge;
function seed(rich = false) {
  const p: Profile = newProfile();
  p.settings.music = p.settings.sound = false;
  if (rich) {
    p.realm = 52;
    p.relicUnlocked = true;
    p.stone = 100000;
    p.cultivation = 1200000;
    p.alchemyXp = 100;
    p.permanentPills = 5;
    for (const key of Object.keys(p.resources) as (keyof typeof p.resources)[])
      p.resources[key] = 1000;
    p.pills = { 'tu-vi-dan': 5, 'cuong-the-dan': 5, 'hoi-nguyen-dan': 5 };
    for (const item of Object.values(equipment)) {
      p.equipment[item.id] = 0;
      if (item.special) p.blueprints.push(item.id);
    }
    for (const stage of allStages)
      p.stageProgress[stage.id] = { wins: 1, bestTime: 120, bestKills: 40 };
    p.selectedStageId = 'sa-thanh';
    p.pets = {
      'linh-ho': { level: 3, evolved: false },
      'thanh-dieu': { level: 10, evolved: true },
    };
    p.activePet = 'thanh-dieu';
    p.selectedSkills = [
      'diet-hon-kim-quang',
      'gia-thien-thu',
      'kim-long-hien-hoa',
      'nhap-ma',
      'phong-loi-vu-duc',
    ];
    p.storySeen = ['ma-do'];
    p.wins = p.runs = 20;
  }
  bridge.update({
    profile: p,
    weapon: weaponFromEquipment(p.equipped.weapon),
    mode: 'menu',
    stageId: p.selectedStageId,
    lobbyArea: 'courtyard',
    lobbyStation: 'home',
    lobbyPanelOpen: true,
    lobbyFacing: 'S',
    chapterEndingOpen: false,
    storyOpen: false,
    result: null,
    toast: '',
  });
}
Object.assign(window, { lobbyQA: { seed, equipment, realms, recipes, upgradeCost } });

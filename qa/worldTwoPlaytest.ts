import { writeFileSync } from 'node:fs';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile, permanentStats } from '../src/domain/profile.ts';
import { allStages } from '../src/data/stages.ts';
import { worldTwoStages } from '../src/data/worldTwoStages.ts';
import { mapObstacles } from '../src/data/mapCollisions.ts';
import type { Point } from '../src/shared/types';
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const p = newProfile();
p.realm = 52;
p.permanentPills = 5;
p.worldTwoPills = 5;
p.relicUnlocked = true;
for (const stage of allStages)
  p.stageProgress[stage.id] = { wins: 1, bestTime: 100, bestKills: 20 };
p.selectedSkills = [
  'diet-hon-kim-quang',
  'gia-thien-thu',
  'kim-long-hien-hoa',
  'nhap-ma',
  'phong-loi-vu-duc',
];
p.equipped = {
  weapon: 'thanh-duong-kiem',
  head: 'thanh-minh-phap-quan',
  body: 'thanh-linh-chien-y',
  hands: 'thanh-mach-uyen',
  feet: 'dap-van-thanh-ngoa',
  jewel: 'thanh-than-ngoc-boi',
  relic: 'thanh-chu-ngoc-an',
};
// Đọc ID thật thay vì tạo đồ thử; bản QA này không ghi vào localStorage.
import { worldTwoEquipment } from '../src/data/worldTwoEquipment.ts';
for (const [slot, id] of Object.entries(p.equipped)) {
  if (!worldTwoEquipment[id!]) {
    const found = Object.values(worldTwoEquipment).find(
      (item) => item.slot === slot && (item.requiredRealm ?? 0) >= 50,
    )!;
    p.equipped[slot as keyof typeof p.equipped] = found.id;
  }
  p.equipment[p.equipped[slot as keyof typeof p.equipped]!] = 5;
}
p.pets = { 'linh-ho': { level: 10, evolved: true }, 'thanh-dieu': { level: 10, evolved: true } };
p.activePet = 'thanh-dieu';
p.pills['hoi-nguyen-dan'] = 3;
const reports = [];
for (const stage of worldTwoStages) {
  const run = new RunEngine(structuredClone(p), mapObstacles(stage), 117 + stage.stageIndex, stage);
  let peak = 0;
  const seen = new Set<number>();
  for (let frame = 0; frame < 12000 && !run.result; frame++) {
    while (run.mode === 'levelup') {
      const priority = (id: string) =>
        id.startsWith('awaken')
          ? 100
          : id === `skill:nguyen-khi-tram`
            ? 95
            : id.startsWith('skill:')
              ? 80
              : id.startsWith('augment:')
                ? 70
                : id === 'stat:damage'
                  ? 60
                  : 20;
      run.choose([...run.choices].sort((a, b) => priority(b.id) - priority(a.id))[0].id);
    }
    if (run.hp < run.view().maxHp * 0.5) run.potion();
    const mission = run.mission!,
      boss = run.enemies.find((e) => !e.dead && e.type === stage.bossId);
    const alive = run.enemies.filter((e) => !e.dead);
    peak = Math.max(peak, alive.length);
    if (boss?.attack) seen.add(boss.attack);
    let goal: Point = { x: Math.sin(run.time * 0.4) * 3, y: Math.cos(run.time * 0.4) * 3 };
    const node = mission.nodes.find((n) => !n.completed);
    if (node) goal = node;
    if (stage.mission!.kind === 'escort' && mission.protected) {
      const gate = mission.nodes.find((n) => !n.completed);
      if (gate && distance(gate, mission.protected) > 1.5) goal = gate;
      else {
        const route = [
          { x: 0, y: 0 },
          { x: 9, y: -9 },
          { x: 18, y: -18 },
          { x: 22, y: -22 },
        ];
        const next =
          route.find(
            (point) => point.x > mission.protected!.x + 0.4 || point.y < mission.protected!.y - 0.4,
          ) ?? route[3];
        const d = distance(next, mission.protected) || 1;
        goal = {
          x: mission.protected.x + ((next.x - mission.protected.x) / d) * 2,
          y: mission.protected.y + ((next.y - mission.protected.y) / d) * 2,
        };
      }
    }
    if (stage.mission!.kind === 'release' || stage.mission!.kind === 'defend')
      goal = boss
        ? { x: boss.x, y: boss.y + 2 }
        : { x: Math.sin(run.time) * 1.8, y: Math.cos(run.time) * 1.8 };
    if (stage.mission!.kind === 'formation' && node) {
      const d = distance(node, run.position);
      if (d < 2.1) goal = run.position;
    }
    if (mission.phase === 2 && stage.mission!.kind === 'final' && !mission.bloodStoneUsed)
      goal = { x: 0, y: 0 };
    else if (!node && !['escort', 'defend'].includes(stage.mission!.kind)) {
      const loot = run.drops
        .filter((d) => d.kind === 'xp' || d.kind === 'heal')
        .sort((a, b) => distance(a, run.position) - distance(b, run.position))[0];
      if (loot && distance(loot, run.position) < 7) goal = loot;
      else if (boss) {
        const dx = run.position.x - boss.x,
          dy = run.position.y - boss.y,
          d = Math.hypot(dx, dy) || 1;
        goal =
          d > 4
            ? boss
            : { x: boss.x + (dx / d) * 4 - (dy / d) * 2, y: boss.y + (dy / d) * 4 + (dx / d) * 2 };
      }
    }
    const near = alive.filter((e) => distance(e, run.position) < 1.05);
    if (near.length > 2) {
      run.dash();
      if (!node && !mission.protected)
        goal = {
          x: run.position.x + Math.sin(run.time) * 3,
          y: run.position.y + Math.cos(run.time) * 3,
        };
    }
    const dx = goal.x - run.position.x,
      dy = goal.y - run.position.y,
      d = Math.hypot(dx, dy);
    run.tick(0.1, d > 0.25 ? { x: dx / d, y: dy / d } : { x: 0, y: 0 });
    run.interact();
  }
  const report = {
    stage: stage.id,
    won: run.result?.won ?? false,
    outcome: run.result?.outcome ?? 'stalled',
    time: Math.round(run.time),
    hp: Math.round(run.hp),
    level: run.level,
    peak,
    bossAttacks: [...seen],
    phase: run.mission!.phase,
    progress: run.mission!.view(run.position).progress,
  };
  reports.push(report);
  console.log(JSON.stringify(report));
}
writeFileSync(
  'qa/world-two-playtest-report.json',
  JSON.stringify(
    {
      scope:
        'Nhân vật Nhập Thánh đỉnh phong, đủ đồ/thú/đan hợp lệ; AI điều khiển đầu vào, không bất tử, không nhân damage, không ép kết quả. Đây là kiểm tra giao tranh, không là chuẩn thời lượng hành trình.',
      stats: permanentStats(p),
      reports,
    },
    null,
    2,
  ),
);

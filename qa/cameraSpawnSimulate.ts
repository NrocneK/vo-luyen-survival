import { writeFileSync } from 'node:fs';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { playWorldOne } from './campaignPlaytest.ts';
import { cameraFootprint } from '../src/game/math/cameraFootprint.ts';
import { project } from '../src/game/math/worldPhysics.ts';
import { outsideSpawnView } from '../src/game/math/spawnView.ts';
import { layoutForStage, projectionForStage } from '../src/data/stages.ts';
import type { Point } from '../src/shared/types';

interface CameraRunReport {
  stage: string;
  seed: number;
  realm: number;
  zoom: number;
  won: boolean | null;
  time: number;
  kills: number;
  level: number;
  peakEnemies: number;
  arrivals: number;
  offscreenArrivals: number;
  telegraphedArrivals: number;
  unannouncedVisibleArrivals: number;
  firstEnemyAttackAt: number | null;
  bossSpawnAt: number | null;
  bossFirstAttackAt: number | null;
  bossAttackKinds: number[];
}

/** QA tiến trình thật với camera, không đổi playtest gốc hoặc bơm chỉ số/tài nguyên. */
function campaignAtZoom(zoom: number) {
  const tick = RunEngine.prototype.tick;
  const tracks = new Map<
    RunEngine,
    { report: CameraRunReport; scrollX: number; scrollY: number; ids: Set<number> }
  >();
  const reports: CameraRunReport[] = [];
  RunEngine.prototype.tick = function (dt: number, input: Point): void {
    const projection = projectionForStage(this.stage);
    const layout = layoutForStage(this.stage);
    const player = project(this.position, projection);
    const width = 960,
      height = 640;
    let track = tracks.get(this);
    if (!track) {
      const report: CameraRunReport = {
        stage: this.stage.id,
        seed: this.seed,
        realm: this.profile.realm,
        zoom,
        won: null,
        time: 0,
        kills: 0,
        level: 1,
        peakEnemies: 0,
        arrivals: 0,
        offscreenArrivals: 0,
        telegraphedArrivals: 0,
        unannouncedVisibleArrivals: 0,
        firstEnemyAttackAt: null,
        bossSpawnAt: null,
        bossFirstAttackAt: null,
        bossAttackKinds: [],
      };
      track = {
        report,
        scrollX: player.x - width / 2,
        scrollY: player.y - height / 2,
        ids: new Set(),
      };
      tracks.set(this, track);
      reports.push(report);
    }
    const blend = 1 - Math.pow(0.9, Math.min(dt, 0.15) * 60);
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const dw = width / zoom,
      dh = height / zoom;
    const minX = (dw - width) / 2,
      minY = (dh - height) / 2;
    track.scrollX = clamp(
      track.scrollX + (player.x - width / 2 - track.scrollX) * blend,
      minX,
      Math.max(minX, minX + layout.dimensions[0] - dw),
    );
    track.scrollY = clamp(
      track.scrollY + (player.y - height / 2 - track.scrollY) * blend,
      minY,
      Math.max(minY, minY + layout.dimensions[1] - dh),
    );
    const camera = { scrollX: track.scrollX, scrollY: track.scrollY, width, height, zoom };
    const view = { corners: cameraFootprint(camera, projection), padding: 0.85 };
    this.setSpawnView(view);
    tick.call(this, dt, input);
    const report = track.report;
    report.time = this.time;
    report.kills = this.kills;
    report.level = this.level;
    report.peakEnemies = Math.max(
      report.peakEnemies,
      this.enemies.filter((enemy) => !enemy.dead).length,
    );
    for (const enemy of this.enemies) {
      if (!track.ids.has(enemy.id)) {
        track.ids.add(enemy.id);
        report.arrivals++;
        if ((enemy.spawnTime ?? 0) > 0) report.telegraphedArrivals++;
        else if (outsideSpawnView(enemy, { ...view, padding: 0 })) report.offscreenArrivals++;
        else report.unannouncedVisibleArrivals++;
        if (enemy.type === this.stage.bossId) report.bossSpawnAt = this.time;
      }
      if (enemy.attack) {
        report.firstEnemyAttackAt ??= this.time;
        if (enemy.type === this.stage.bossId) {
          report.bossFirstAttackAt ??= this.time;
          if (!report.bossAttackKinds.includes(enemy.attack))
            report.bossAttackKinds.push(enemy.attack);
        }
      }
    }
    if (this.result && report.won === null) {
      report.won = this.result.won;
      console.log(JSON.stringify(report));
    }
  };
  try {
    const result = playWorldOne();
    return { zoom, completed: true, realm: result.profile.realm, reports };
  } catch (error) {
    return { zoom, completed: false, error: String(error), reports };
  } finally {
    RunEngine.prototype.tick = tick;
  }
}

const result = {
  createdAt: new Date().toISOString(),
  viewport: [960, 640],
  results: [0.5, 1].map(campaignAtZoom),
};
writeFileSync('qa/camera-spawn-campaign-report.json', JSON.stringify(result, null, 2));
console.log(
  JSON.stringify(
    result.results.map(({ reports, ...summary }) => ({
      ...summary,
      runs: reports.length,
      arrivals: reports.reduce((sum, report) => sum + report.arrivals, 0),
      unannouncedVisibleArrivals: reports.reduce(
        (sum, report) => sum + report.unannouncedVisibleArrivals,
        0,
      ),
    })),
    null,
    2,
  ),
);
if (
  result.results.some(
    (entry) =>
      !entry.completed || entry.reports.some((report) => report.unannouncedVisibleArrivals),
  )
)
  process.exitCode = 1;

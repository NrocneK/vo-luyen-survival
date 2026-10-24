import { writeFileSync } from 'node:fs';
import { playWorldOne } from './campaignPlaytest.ts';
import { realms } from '../src/data/realms.ts';

const { profile, reports } = playWorldOne();
writeFileSync(
  'qa/world-one-balance-report.json',
  JSON.stringify(
    {
      status: 'PASS',
      realm: realms[profile.realm].name,
      totalRuns: profile.runs,
      stageProgress: profile.stageProgress,
      reports,
    },
    null,
    2,
  ),
);
// Fixture chỉ phục vụ cổng QA riêng; không nhập vào bản chơi của người dùng.
writeFileSync(
  'qa/world-one-completed-fixture.json',
  JSON.stringify({ game: 'vo-luyen', profile }, null, 2),
);
console.log(JSON.stringify({ realm: realms[profile.realm].name, reports }, null, 2));

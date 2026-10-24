import type { Cost } from '../shared/models';

export interface RealmDef {
  id: number;
  name: string;
  cost: number;
  slots: number;
  breakthroughCost?: Cost & { pills?: { 'tu-vi-dan': number } };
  requiredStageId?: string;
}

// Các chỉ số 0–10 giữ nguyên để bản lưu map đầu tiếp tục đúng cảnh giới đã đạt.
const cultivationCosts = [
  60,
  100,
  150,
  210,
  280,
  360,
  460,
  580,
  740,
  1000,
  450,
  550,
  650,
  750,
  850,
  950,
  1100,
  1250,
  1500,
  900,
  1100,
  1300,
  1500,
  1700,
  1900,
  2100,
  2300,
  2800,
  1800,
  2100,
  2400,
  2700,
  3000,
  3300,
  3600,
  4000,
  4600,
  4000,
  4600,
  5200,
  5800,
  6400,
  7000,
  8000,
  9500,
  11500,
  Infinity,
];
const majorBreakthroughs: Record<number, string> = {
  9: 'hac-phong-son',
  18: 'truyen-thua-dong-thien',
  27: 'cuu-am-son-coc',
  36: 'ly-dia',
};

export const realms: RealmDef[] = cultivationCosts.map((cost, index) => {
  let name: string;
  if (index < 9) name = `Thối Thể tầng ${index + 1}`;
  else if (index === 9) name = 'Thối Thể đỉnh phong';
  else if (index < 19) name = `Khai Nguyên tầng ${index - 9}`;
  else if (index < 28) name = `Khí Động tầng ${index - 18}`;
  else if (index < 37) name = `Chân Nguyên tầng ${index - 27}`;
  else if (index < 46) name = `Thần Du tầng ${index - 36}`;
  else name = 'Thần Du đỉnh phong';
  const requiredStageId = majorBreakthroughs[index];
  return {
    id: index,
    name,
    cost,
    slots: index < 2 ? 2 : index < 4 ? 3 : index < 6 ? 4 : index < 9 ? 5 : 6,
    ...(requiredStageId
      ? {
          requiredStageId,
          breakthroughCost: {
            resources: { 'hat-sen-dot-pha': 1 },
            pills: { 'tu-vi-dan': 2 },
          },
        }
      : {}),
  };
});

export const WORLD_ONE_REALM_CAP = 46;
export const WORLD_TWO_REALM_CAP = 52;
const worldTwoCosts = [90000, 135000, 210000, 300000, 420000, 570000];
const worldTwoGates = [
  'co-ma',
  'ma-hoa',
  'duong-toc',
  'thanh-lang',
  'long-phuong-phu',
  'thong-huyen-tru',
];
const worldTwoNames = [
  'Siêu Phàm nhất tầng',
  'Siêu Phàm nhị tầng',
  'Siêu Phàm tam tầng',
  'Nhập Thánh nhất tầng',
  'Nhập Thánh nhị tầng',
  'Nhập Thánh tam tầng đỉnh phong',
];
for (let i = 0; i < 6; i++) {
  realms[46 + i].cost = worldTwoCosts[i];
  realms[46 + i].requiredStageId = worldTwoGates[i];
  realms.push({ id: 47 + i, name: worldTwoNames[i], cost: Infinity, slots: 6 });
}

/** Idle hỗ trợ tu luyện chậm; thắng chặng mới làm tăng mật độ linh khí. */
export const idlePerSecond = (realm: number, clearedMilestone = 0) =>
  realm > WORLD_ONE_REALM_CAP
    ? [1.5, 2.25, 3, 4, 5, 6][Math.min(5, realm - 47)]
    : (0.004 + realm * 0.001) * (1 + Math.min(6, Math.max(0, clearedMilestone)) * 1.5);

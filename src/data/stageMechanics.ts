import type { StageMechanicKind } from '../shared/stageMechanics';

export interface StageMechanicDef {
  kind: StageMechanicKind;
  name: string;
  description: string;
  start: number;
  interval: number;
  warning: number;
  active: number;
}

/** Nội dung màn tách khỏi AI/scene; mọi thời lượng dưới đây là giây chiến đấu. */
export const stageMechanics: Record<string, StageMechanicDef> = {
  'hac-phong-son': {
    kind: 'hunt',
    name: 'Thú triều',
    description:
      'Tiếng gầm báo trước thú triều. Bầy thú tăng 25% tốc chạy trong 10 giây; giữ đường rút và lướt khi bị vây.',
    start: 35,
    interval: 65,
    warning: 3,
    active: 10,
  },
  'truyen-thua-dong-thien': {
    kind: 'rune',
    name: 'Linh trận hộ thân',
    description:
      'Linh trận xuất hiện gần bạn. Đứng trong trận đủ 3 giây để nhận Linh hộ: giảm 30% sát thương nhận trong 10 giây.',
    start: 24,
    interval: 38,
    warning: 0,
    active: 14,
  },
  'cuu-am-son-coc': {
    kind: 'poison',
    name: 'Độc chướng lưu động',
    description:
      'Đám mây độc được báo trước bằng vòng nét đứt, sau đó trôi qua chiến trường. Rời vùng xanh khi độc chướng tụ lại.',
    start: 30,
    interval: 11,
    warning: 2.4,
    active: 11,
  },
  'ly-dia': {
    kind: 'fire',
    name: 'Hỏa triều',
    description:
      'Dải lửa quét ngang sân sau 3 giây cảnh báo. Đi theo mũi tên xanh tới khe trống hoặc né khỏi đường quét.',
    start: 32,
    interval: 24,
    warning: 3,
    active: 6,
  },
  'trung-do-doat-dich': {
    kind: 'squad',
    name: 'Hộ trận thế gia',
    description:
      'Tổ đội gồm đội trưởng, kiếm khách và pháp tu cùng tiến vào. Cờ vàng đánh dấu đội trưởng; hạ hắn để phá lớp hộ trận giảm 35% sát thương cho đồng đội ở gần.',
    start: 42,
    interval: 66,
    warning: 3,
    active: 0,
  },
  'trung-do-hao-kiep': {
    kind: 'siege',
    name: 'Chiến tuyến Hắc Triều',
    description:
      'Ba nhịp giao tranh: địch xung kích nhanh hơn, hắc ấn khóa vị trí cũ, rồi lộ sơ hở. Né hắc ấn và phản công khi địch nhận thêm 30% sát thương.',
    start: 48,
    interval: 56,
    warning: 3,
    active: 14,
  },
};

export const mechanicRules = {
  huntSpeed: 1.25,
  runeRadius: 1.75,
  runeCharge: 3,
  wardDuration: 10,
  wardReduction: 0.3,
  poisonRadius: 2.35,
  poisonSpeed: 0.48,
  poisonDamage: 0.04,
  poisonHitEvery: 0.8,
  fireWidth: 0.58,
  fireHalfLength: 9,
  fireGapHalfWidth: 1.3,
  fireSpeed: 1.4,
  fireDamage: 0.085,
  fireHitEvery: 0.7,
  squadReduction: 0.35,
  squadRadius: 5,
  squadLeaderHealth: 1.8,
  squadEnemies: [
    'ho-ve-trung-do',
    'kiem-khach-trung-do',
    'kiem-khach-trung-do',
    'phap-tu-trung-do',
    'phap-tu-trung-do',
  ],
  siegeSpeed: 1.15,
  siegeStorm: 14,
  siegeCounter: 12,
  siegeVulnerability: 1.3,
  darkRadius: 1.65,
  darkWarning: 2.4,
  darkDuration: 0.55,
  darkDamage: 0.085,
  darkInterval: 3.5,
} as const;

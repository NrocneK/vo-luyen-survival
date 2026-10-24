import type { LobbyArea } from '../shared/types';

/** Bố cục thuần hiển thị, dùng chung cho nhân vật Phaser và lớp React. */
export function lobbyComposition(
  width: number,
  height: number,
  station = 'home',
  panelOpen = true,
) {
  const mobile = width <= 760;
  const home = station === 'home';
  const x = mobile ? 0.5 : !panelOpen ? 0.5 : home ? (width < 1000 ? 0.32 : 0.48) : 0.24;
  const scale = mobile
    ? Math.min(0.86, (height * 0.22) / 190)
    : Math.min(home ? 1.42 : 1.3, (height * 0.29) / 190);
  const y = mobile && panelOpen ? (110 + 190 * scale) / height : height < 700 ? 0.66 : 0.7;
  return {
    x,
    y,
    scale,
    panelY: y * height + 26,
    identityY: y * height - 190 * scale - 92,
    gearY: y * height - 190 * scale + 5,
  };
}

/** Các khu thật của lobby; kho đồ và chuẩn bị lịch luyện dùng tại sân trung tâm. */
export const lobbyAreas: Record<
  LobbyArea,
  {
    name: string;
    background: string;
    description: string;
    hero: [number, number];
  }
> = {
  courtyard: {
    name: 'Sân trung tâm',
    background: 'cultivation-courtyard',
    description: 'Đan phòng phía Tây · Luyện khí đường phía Đông',
    hero: [0.43, 0.64],
  },
  alchemy: {
    name: 'Đan phòng',
    background: 'lobby-alchemy',
    description: 'Lửa đan lô giữ ấm · Dược hương lan tỏa',
    hero: [0.43, 0.66],
  },
  forge: {
    name: 'Luyện khí đường',
    background: 'lobby-forge',
    description: 'Tinh luyện linh quáng · Rèn nên pháp khí',
    hero: [0.43, 0.66],
  },
  cultivate: {
    name: 'Tĩnh thất',
    background: 'lobby-cultivate',
    description: 'Tĩnh tâm hấp thụ linh khí · Đột phá cảnh giới',
    hero: [0.43, 0.66],
  },
  pets: {
    name: 'Linh thú viên',
    background: 'lobby-pets',
    description: 'Chăm sóc linh thú · Nuôi dưỡng đồng hành',
    hero: [0.43, 0.66],
  },
};

export const lobbyDoors: {
  area: Exclude<LobbyArea, 'courtyard'>;
  symbol: string;
  direction: string;
}[] = [
  { area: 'alchemy', symbol: '←', direction: 'Phía Tây' },
  { area: 'forge', symbol: '→', direction: 'Phía Đông' },
  { area: 'cultivate', symbol: '↑', direction: 'Phía Bắc' },
  { area: 'pets', symbol: '↓', direction: 'Vườn phía Nam' },
];

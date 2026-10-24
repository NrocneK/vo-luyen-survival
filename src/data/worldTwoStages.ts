import type { StageDef } from './stages';
import type { MissionKind } from '../shared/worldTwo';
import { worldTwoReward } from './worldTwoEconomy.ts';
import { worldTwoBlueprints } from './worldTwoEquipment.ts';

const rows: [string, string, string, MissionKind, number, string, string, number, number][] = [
  [
    'doc-ngao-minh',
    'Độc Ngạo Minh',
    'Giải cứu những người bị Mị Yêu khống chế, phá ảo cảnh rồi đánh bại chân thân.',
    'rescue',
    46,
    'mi-yeu',
    'Giải cứu ba đồng môn rồi đánh bại Mị Yêu.',
    3,
    4,
  ],
  [
    'co-ma',
    'Tiểu Huyền Giới · Cổ Ma',
    'Phá vòng vây Cổ Ma và tìm cơ hội từ truyền thừa Ma Thần.',
    'breakout',
    46,
    'chu-kien',
    'Phá bốn phong ấn, cùng đồng minh đánh bại Chử Kiến.',
    4,
    5,
  ],
  [
    'phe-hon-trung',
    'Thiên Tiêu Tông · Phệ Hồn Trùng',
    'Thanh tẩy trùng triều trong động phủ; tận dụng thần hồn hỏa để áp chế đàn trùng.',
    'purify',
    47,
    'phe-hon-trung-chu',
    'Thanh tẩy ba ổ trùng rồi tiêu diệt đàn Phệ Hồn Trùng hợp nhất.',
    3,
    6,
  ],
  [
    'ma-hoa',
    'Thiên Niên Ma Hoa',
    'Giành cơ duyên Ma Hoa trong cuộc tranh đoạt với những đối thủ cùng thế hệ.',
    'capture',
    47,
    'ma-hoa-doi-thu',
    'Chiếm ba điểm linh khí, đánh bại thủ lĩnh tranh đoạt.',
    3,
    8,
  ],
  [
    'bang-tong',
    'Băng Tông',
    'Khảo nghiệm với Thiên Nguyệt giữa băng trận, không phải trận chiến sinh tử.',
    'trial',
    48,
    'thien-nguyet',
    'Phá ba mắt băng trận, vượt khảo nghiệm của Thiên Nguyệt.',
    3,
    6,
  ],
  [
    'di-tich-duoi-bien',
    'Di tích dưới biển',
    'Đưa An Linh Nhi thoát khỏi Nam Thánh Cô và mở lối rời di tích.',
    'escort',
    48,
    'nam-thanh-co',
    'Bảo vệ An Linh Nhi qua di tích và mở cửa thoát.',
    3,
    5,
  ],
  [
    'duong-toc',
    'Dương tộc · Thần Thụ',
    'Giải thoát người bị giam, nhận sự trợ giúp của Thần Thụ rồi phá vây.',
    'prison',
    48,
    'duong-toc-thu-linh',
    'Giải cứu ba nhóm tù nhân, đánh bại thủ lĩnh truy đuổi.',
    3,
    5,
  ],
  [
    'sa-thanh',
    'Sa Thành · Địch Kiêu',
    'Đấu tay đôi với Địch Kiêu: đọc thế trọng kích trước khi đối thủ bạo phát ma công.',
    'duel',
    49,
    'dich-kieu',
    'Đánh bại Địch Kiêu trong trận đấu tay đôi.',
    0,
    0,
  ],
  [
    'thanh-lang',
    'Cửu Thiên · Thánh Lăng',
    'Vượt thần kỹ và trận đồ của Thánh chủ tiền nhiệm, lĩnh ngộ truyền thừa.',
    'tomb',
    49,
    'thanh-chu-tan-anh',
    'Hoàn tất ba khảo nghiệm rồi vượt tàn ảnh Thánh chủ.',
    3,
    7,
  ],
  [
    'thanh-dia-bi-vay',
    'Cửu Thiên Thánh Địa · Bị vây',
    'Giữ tâm hộ trận trước quân vây hãm, phản công buộc Trương Ngạo rút lui.',
    'defend',
    50,
    'truong-ngao-vay',
    'Bảo vệ tâm hộ trận qua ba đợt, đẩy lui Trương Ngạo.',
    3,
    18,
  ],
  [
    'long-phuong-phu',
    'Long Phượng Phủ',
    'Phá quân xâm nhập và tiếp nhận Long Hoàng truyền thừa giữa trận chiến.',
    'invasion',
    50,
    'xam-luoc-tong-chu',
    'Phá ba điểm quân xâm nhập, đánh bại tông chủ đối địch.',
    3,
    7,
  ],
  [
    'giai-phong-co-ma',
    'Giải phong Cổ Ma',
    'Hoàn thành nghi thức giải phong, sau đó giao chiến bên ngoài Tiểu Huyền Giới.',
    'release',
    51,
    'truong-ngao-truy-kich',
    'Giữ điểm giải phong, sau đó đánh bại Trương Ngạo.',
    3,
    12,
  ],
  [
    'thong-huyen-tru',
    'Thông Huyền Trụ',
    'Phá trận đồ để giải cứu Mộng Vô Nhai và Hạ Ngưng Thường.',
    'formation',
    51,
    'thong-huyen-tru-tran',
    'Phá bốn nút trận rồi dập tắt trận đồ quá tải.',
    4,
    6,
  ],
  [
    'dai-chien-cot-toc',
    'Đại chiến Cốt tộc',
    'Cùng liên quân phá cốt trận, dùng Huyết Tinh Thạch ngăn tái sinh và kết thúc đại chiến.',
    'final',
    51,
    'cot-toc-thu-linh',
    'Đánh bại thủ lĩnh Cốt tộc qua ba pha; dùng Huyết Tinh Thạch ở pha hấp thu.',
    0,
    0,
  ],
];
export const worldTwoStages: StageDef[] = rows.map(
  ([id, name, description, kind, requiredRealm, bossId, objective, targets, charge], index) => {
    const rewards = worldTwoReward(index);
    const protectedInfo =
      kind === 'escort'
        ? { protectedName: 'An Linh Nhi', protectedHp: 2200 }
        : kind === 'defend'
          ? { protectedName: 'Tâm hộ trận', protectedHp: 4200 }
          : kind === 'release'
            ? { protectedName: 'Điểm giải phong', protectedHp: 4800 }
            : {};
    return {
      id,
      name,
      description,
      objective,
      world: 'Thông Huyền Đại Lục',
      chapter: 2,
      stageIndex: index,
      requiredRealm,
      prerequisite: index ? rows[index - 1][0] : 'trung-do-hao-kiep',
      bossId,
      groundId: 'forest-floor-tile',
      propsId: 'hac-phong-son-props',
      bounds: { minX: -32, maxX: 32, minY: -32, maxY: 32 },
      groundStyle:
        index === 4
          ? { color: 0x739ba5, line: 0xb3dbe0, pattern: 'ice' }
          : index === 5
            ? { color: 0x315962, line: 0x678f91, pattern: 'stone' }
            : index === 3 || index === 7
              ? { color: 0x8b7856, line: 0xb19b70, pattern: 'sand' }
              : index === 6
                ? { color: 0x405b3b, line: 0x657e50, pattern: 'soil' }
                : {
                    color: [0x4d485a, 0x454156, 0x505f5b, 0x485347][index % 4],
                    line: 0x7c8584,
                    pattern: 'stone',
                  },
      moveSpeed: 2.4,
      playerRadius: 0.21,
      cameraZoom: 1,
      duration: kind === 'duel' || kind === 'final' ? 1 : 180,
      eliteTimes: targets ? [45, 100] : [],
      elites: targets
        ? [
            { at: 45, id: `thong-huyen-tinh-anh-${index}` },
            { at: 100, id: `thong-huyen-tinh-anh-${index}` },
          ]
        : [],
      maxEnemies: kind === 'duel' ? 0 : kind === 'final' ? 35 : 65,
      enemyScale: 1,
      tint: [
        0xd1bded, 0xb5a6c7, 0xa8c9db, 0xdac8a4, 0x9fcbef, 0x85bbcf, 0xa5c78c, 0xc8b39c, 0xc6d5ed,
        0xb8c6dd, 0xc7b7e5, 0xb3c9bd, 0xa4c4da, 0xc7c5be,
      ][index],
      accent: 0xdab86c,
      landmarks: [
        { id: `${id}-west`, name: 'Tây trận', position: { x: -18, y: 12 }, radius: 5 },
        { id: `${id}-east`, name: 'Đông trận', position: { x: 18, y: -12 }, radius: 5 },
      ],
      rewards,
      firstClear: {
        cultivation: rewards.cultivation * 0.5,
        stone: rewards.stone * 0.5,
        resources: Object.fromEntries(
          Object.entries(rewards.resources).map(([key, value]) => [key, Math.floor(value * 0.5)]),
        ),
        equipment: [],
        blueprints: worldTwoBlueprints[id] ?? [],
      },
      spawnWaves: [
        {
          from: 0,
          weights: { [`thong-huyen-vo-gia-${index}`]: 65, [`thong-huyen-phap-tu-${index}`]: 35 },
        },
      ],
      mission: { kind, targets, charge, bossPhases: kind === 'final' ? 3 : 2, ...protectedInfo },
    };
  },
);

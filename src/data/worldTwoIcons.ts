export type IconCategory = 'items' | 'equipment' | 'skills';

/** Chỉ các biểu tượng Phần 2 mới chuyển sang bộ v7; không thay ảnh tài sản Trung Đô. */
export const worldTwoIconIds = {
  equipment: [
    'liet-duong-quyen-sao',
    'xich-duong-kiem',
    'thanh-minh-quan',
    'huyen-linh-chien-y',
    'ho-mach-uyen',
    'truy-phong-ngoa',
    'ngung-than-boi',
    'ma-than-ho-an',
    'thanh-nguyen-quyen-sao',
    'huyen-duong-thanh-kiem',
    'huyen-quang-quan',
    'thanh-nguyen-chien-y',
    'kim-cuong-ho-uyen',
    'ngu-phong-ngoa',
    'thanh-tam-ngoc-boi',
    'thanh-chu-ngoc-an',
  ],
  skills: [
    'diet-hon-kim-quang',
    'gia-thien-thu',
    'kim-long-hien-hoa',
    'nhap-ma',
    'phong-loi-vu-duc',
    'diet-the-kim-quang',
    'gia-thien-ma-thu',
    'phong-loi-kim-long',
    'quang-tan',
    'quang-pha-hon',
    'thu-tran-dia',
    'thu-diep-chuong',
    'long-du',
    'long-tuc',
  ],
} as const;

export function worldTwoIconFile(id: string, category: IconCategory): string | undefined {
  if (category === 'items') return undefined;
  return (worldTwoIconIds[category] as readonly string[]).includes(id)
    ? `assets/v7/icons/${category}/${id}.png`
    : undefined;
}

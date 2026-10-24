export type AugmentId =
  | 'quyen-lien-kich'
  | 'quyen-bang-son'
  | 'kiem-hoi-phong'
  | 'kiem-tan-anh'
  | 'chuong-tam-hoa'
  | 'chuong-luu-hoa'
  | 'hoan-quang-vuc'
  | 'hoan-liet-diem'
  | 'loi-song-lien'
  | 'loi-tap-kich'
  | 'quang-tan'
  | 'quang-pha-hon'
  | 'thu-tran-dia'
  | 'thu-diep-chuong'
  | 'long-du'
  | 'long-tuc';

export interface AugmentDef {
  id: AugmentId;
  skill: string;
  name: string;
  icon: string;
  description: string;
  minRank: number;
}

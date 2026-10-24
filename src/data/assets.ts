import source from './assets.generated.json';
import type { ActorAsset, AssetCatalogue } from '../shared/types';

// Địch/thú v3/v5/v6, nền v4, icon v7; nhân vật Thông Huyền v9 đọc riêng từ hero.ts.
export const assets = source as unknown as AssetCatalogue;
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
export function actorAsset(id: string): ActorAsset {
  const actor = assets.actors.find((item) => item.id === id);
  if (!actor) throw new Error(`Không tìm thấy actor ${id}.`);
  return actor;
}
export function sharedAsset(id: string): { file: string; atlas?: string } {
  const item = assets.sharedAssets.find((asset) => asset.id === id);
  if (!item) throw new Error(`Không tìm thấy asset ${id}.`);
  return item;
}

/** Tạo danh mục gọn từ asset đã duyệt, không đưa atlasFrames lớn vào bundle JS. */
import { readFile, writeFile, mkdir, access, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const source = JSON.parse(
  await readFile(resolve(root, 'public/assets/v3/asset-manifest.json'), 'utf8'),
);
if (source.status !== 'validated')
  throw new Error('Bộ asset cần được kiểm tra trước khi tích hợp.');
const actorIds = source.actors.map((actor) => actor.id);
const sharedIds = source.sharedAssets.map((asset) => asset.id);
const selectedActors = source.actors.filter((actor) => actorIds.includes(actor.id));
const actors = selectedActors.map(
  ({ id, name, size, origin, atlas, atlasData, animations, walk, camera, attacks }) => ({
    id,
    name,
    size,
    origin,
    atlas,
    atlasData,
    animations,
    walk,
    camera,
    attacks,
  }),
);
for (const actor of selectedActors) {
  const bytes = await readFile(resolve(root, 'public', actor.atlas));
  if (createHash('sha256').update(bytes).digest('hex') !== actor.sha256)
    throw new Error(`Atlas lệch hash: ${actor.id}`);
  await access(resolve(root, 'public', actor.atlasData));
}
if (!actors.some((a) => a.id === 'duong-khai') || !actors.some((a) => a.id === 'duong-khai-kiem'))
  throw new Error('Thiếu Dương Khai.');
await mkdir(resolve(root, 'src/data'), { recursive: true });
await writeFile(
  resolve(root, 'src/data/assets.generated.json'),
  JSON.stringify(
    {
      version: source.version,
      actors,
      sharedAssets: source.sharedAssets.filter((asset) => sharedIds.includes(asset.id)),
      sceneLayout: source.sceneLayout,
    },
    null,
    2,
  ) + '\n',
);
const files = new Set([
  ...actors.flatMap((actor) => [actor.atlas, actor.atlasData]),
  ...source.sharedAssets
    .filter((asset) => sharedIds.includes(asset.id))
    .flatMap((asset) => [asset.file, asset.atlas].filter(Boolean)),
  ...(await Promise.all(
    ['items', 'equipment', 'skills'].map(async (category) => {
      const { readdir } = await import('node:fs/promises');
      return (await readdir(resolve(root, 'public/assets/v3', category, category)))
        .filter((name) => name.endsWith('.png') && !name.endsWith('-32.png'))
        .map((name) => `assets/v3/${category}/${category}/${name}`);
    }),
  ).then((groups) => groups.flat())),
]);
for (const file of files) {
  const target = resolve(root, 'public/game', file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, 'public', file), target);
}
await mkdir(resolve(root, 'public/game/licenses'), { recursive: true });
for (const [packagePath, name] of [
  ['@fontsource/be-vietnam-pro', 'BeVietnamPro-OFL.txt'],
  ['@fontsource-variable/noto-serif', 'NotoSerif-OFL.txt'],
]) {
  await copyFile(
    resolve(root, 'node_modules', packagePath, 'LICENSE'),
    resolve(root, 'public/game/licenses', name),
  );
}
console.log(
  `Đã đồng bộ ${actors.length} actor, bản đồ v${source.version} và ${files.size} file runtime.`,
);

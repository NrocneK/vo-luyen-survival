/** Tạo danh mục gọn từ asset đã duyệt, không đưa atlasFrames lớn vào bundle JS. */
import { readFile, writeFile, mkdir, access, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const source = JSON.parse(
  await readFile(resolve(root, 'public/assets/v3/asset-manifest.json'), 'utf8'),
);
const environments = JSON.parse(
  await readFile(resolve(root, 'public/assets/v4/environment-manifest.json'), 'utf8'),
);
const humanEnemies = JSON.parse(
  await readFile(resolve(root, 'public/assets/v5/enemy-manifest.json'), 'utf8'),
);
const worldTwoEnemies = JSON.parse(
  await readFile(resolve(root, 'public/assets/v6/enemy-manifest.json'), 'utf8'),
);
const worldTwoIcons = JSON.parse(
  await readFile(resolve(root, 'public/assets/v7/icon-manifest.json'), 'utf8'),
);
const hero = JSON.parse(
  await readFile(resolve(root, 'public/assets/v9/hero-manifest.json'), 'utf8'),
);
if (
  hero.status !== 'validated' ||
  hero.version !== 9 ||
  hero.pixelArt ||
  hero.pixelsPerUnit !== 100
)
  throw new Error('Bản Thông Huyền khôi phục phải dùng catalogue nhân vật v9, 100 pixel/đơn vị.');
for (const texture of hero.textures) {
  if (
    ![texture.file, texture.atlas].every(
      (path) => path.startsWith('assets/v9/hero/') && !path.includes('..'),
    )
  )
    throw new Error(`Sai đường dẫn nhân vật: ${texture.key}`);
  for (const [path, hash] of [
    [texture.file, texture.sha256],
    [texture.atlas, texture.dataSha256],
  ]) {
    const bytes = await readFile(resolve(root, 'public', path));
    if (createHash('sha256').update(bytes).digest('hex') !== hash)
      throw new Error(`Ngoại quan lệch hash: ${texture.key}`);
  }
}
if (hero.portrait) {
  if (!hero.portrait.startsWith('assets/v9/hero/') || hero.portrait.includes('..'))
    throw new Error('Sai đường dẫn chân dung nhân vật.');
  const bytes = await readFile(resolve(root, 'public', hero.portrait));
  if (createHash('sha256').update(bytes).digest('hex') !== hero.portraitSha256)
    throw new Error('Chân dung nhân vật lệch hash.');
}
await writeFile(
  resolve(root, 'src/data/hero.generated.json'),
  JSON.stringify(hero, null, 2) + '\n',
);
if (worldTwoIcons.status !== 'validated' || worldTwoIcons.assets.length !== 30)
  throw new Error('Bộ biểu tượng Phần 2 cần đủ 30 ảnh đã qua kiểm tra.');
for (const icon of worldTwoIcons.assets) {
  if (!icon.file.startsWith('assets/v7/icons/'))
    throw new Error(`Sai đường dẫn biểu tượng: ${icon.id}`);
  const bytes = await readFile(resolve(root, 'public', icon.file));
  if (createHash('sha256').update(bytes).digest('hex') !== icon.sha256)
    throw new Error(`Biểu tượng lệch hash: ${icon.id}`);
}
if (worldTwoEnemies.status !== 'validated')
  throw new Error('Địch Thông Huyền cần qua QA trước tích hợp.');
if (humanEnemies.status !== 'validated')
  throw new Error('Địch hình người cần qua kiểm tra trước khi tích hợp.');
if (environments.status !== 'validated')
  throw new Error('Nền lobby/map cần qua kiểm tra trước khi tích hợp.');
for (const asset of environments.sharedAssets) {
  const bytes = await readFile(resolve(root, 'public', asset.file));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
    throw new Error(`Nền lệch hash: ${asset.id}`);
}
const sharedAssets = [...source.sharedAssets, ...environments.sharedAssets];
if (source.status !== 'validated')
  throw new Error('Bộ asset cần được kiểm tra trước khi tích hợp.');
const actorSources = [...source.actors, ...humanEnemies.actors, ...worldTwoEnemies.actors];
const actorIds = actorSources.map((actor) => actor.id);
if (new Set(actorIds).size !== actorIds.length)
  throw new Error('Trùng ID actor giữa bộ v3 và bộ địch Trung Đô.');
const sharedIds = sharedAssets.map((asset) => asset.id);
const selectedActors = actorSources.filter((actor) => actorIds.includes(actor.id));
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
  if (actor.atlasDataSha256) {
    const data = await readFile(resolve(root, 'public', actor.atlasData));
    if (createHash('sha256').update(data).digest('hex') !== actor.atlasDataSha256)
      throw new Error(`Tọa độ atlas lệch hash: ${actor.id}`);
  }
}
if (!actors.some((a) => a.id === 'duong-khai') || !actors.some((a) => a.id === 'duong-khai-kiem'))
  throw new Error('Thiếu Dương Khai.');
await mkdir(resolve(root, 'src/data'), { recursive: true });
await writeFile(
  resolve(root, 'src/data/assets.generated.json'),
  JSON.stringify(
    {
      version: Math.max(worldTwoEnemies.version, worldTwoIcons.version),
      actors,
      sharedAssets: sharedAssets.filter((asset) => sharedIds.includes(asset.id)),
      sceneLayout: source.sceneLayout,
    },
    null,
    2,
  ) + '\n',
);
const files = new Set([
  'assets/v9/hero-manifest.json',
  ...(hero.portrait ? [hero.portrait] : []),
  ...hero.textures.flatMap((texture) => [texture.file, texture.atlas]),
  'assets/v7/icon-manifest.json',
  ...worldTwoIcons.assets.map((icon) => icon.file),
  ...actors.flatMap((actor) => [actor.atlas, actor.atlasData]),
  ...sharedAssets
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
  `Đã đồng bộ ${actors.length} actor, ${hero.textures.length} atlas ngoại quan v${hero.version}, 30 biểu tượng v7, bản đồ v${source.version} và ${files.size} file runtime.`,
);

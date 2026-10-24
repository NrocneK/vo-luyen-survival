import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectVfx,
  dragonSpine,
  inHand,
  palmRestOutline,
  v3,
} from '../src/game/math/vfxGeometry.ts';
import {
  buildDragon,
  buildHand,
  buildWings,
  wingPose,
  handHeight,
} from '../src/game/math/vfxModels.ts';
import { project } from '../src/game/math/worldPhysics.ts';
import { spiritSurface } from '../src/game/math/vfxMaterial.ts';

const motion = {
  position: { x: 0, y: 0 },
  heading: 0,
  bodyLength: 6.2,
  trail: Array.from({ length: 65 }, (_, i) => ({ x: -i * 0.1, y: 0 })),
};
test('Chiếu hiệu ứng 3D giữ đúng mặt đất chung; nâng z không trượt ngang hay đổi kích thước', () => {
  const projection = { origin: { x: 100, y: 200 }, pixelsPerUnit: 33 };
  assert.deepEqual(
    projectVfx(v3(2, 3, 0), 33, projection.origin),
    project({ x: 2, y: 3 }, projection),
  );
  const a = projectVfx(v3(2, 3, 1), 33, projection.origin),
    b = projectVfx(v3(2, 3, 4), 33, projection.origin);
  assert.equal(a.x, b.x);
  assert.ok(Math.abs(a.y - b.y - 99 * Math.sqrt(2 / 3)) < 1e-8);
});
test('Rồng có sóng cơ dọc thân và độ cao, đầu dẫn đường; không chỉ xoay một vật thể cứng', () => {
  const a = dragonSpine(motion, 2, 1),
    b = dragonSpine(motion, 2, 1.4);
  assert.ok(Math.abs(a[0].x - b[0].x) < 1e-9);
  assert.ok(Math.abs(a[0].y - b[0].y) < 1e-9);
  assert.ok(a.some((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y) > 0.15));
  assert.ok(Math.max(...a.map((p) => p.z)) - Math.min(...a.map((p) => p.z)) > 0.2);
  assert.ok(a.every((p) => p.z > 0));
});
test('Rồng sinh tại người rồi kéo thân theo lịch sử bay, không xuất hiện cả một tấm ảnh phía sau', () => {
  const seed = { ...motion, trail: [{ x: 0, y: 0 }] };
  const initial = dragonSpine(seed, 0, 0);
  assert.ok(initial.every((p) => p.x === 0 && p.y === 0 && p.z === 0));
  const short = dragonSpine(
    {
      ...seed,
      trail: [
        { x: 0.2, y: 0 },
        { x: 0, y: 0 },
      ],
    },
    0.05,
    0.05,
  );
  assert.ok(short.every((p) => p.x >= -1e-8 && p.x <= 0.2 + 1e-8));
});
test('Khối rồng có pháp tuyến hữu hạn, thể tích và chân/râu có pha riêng', () => {
  const a = buildDragon(dragonSpine(motion, 2, 1), 1, 1.5, 1),
    b = buildDragon(dragonSpine(motion, 2, 1), 1.3, 1.5, 1);
  assert.ok(a.faces.length > 1000);
  assert.ok(a.strokes.length > 20);
  assert.ok(
    a.faces.every((f) => [f.a, f.b, f.c, f.normal].every((p) => Number.isFinite(p.x + p.y + p.z))),
  );
  assert.notDeepEqual(
    a.faces.map((f) => f.a),
    b.faces.map((f) => f.a),
  );
});
test('Chưởng nằm trên mặt phẳng ngang và rơi theo độ cao, không quay mặt bàn tay về camera', () => {
  const a = buildHand({ x: 0, y: 0 }, 2, 0.45, 0.3, true, 0.8),
    b = buildHand({ x: 0, y: 0 }, 2, 0.93, 0.7, true, 0.8);
  const bounds = (faces: typeof a.faces) => {
    const vertices = faces.flatMap((f) => [f.a, f.b, f.c]);
    return {
      x: Math.max(...vertices.map((p) => p.x)) - Math.min(...vertices.map((p) => p.x)),
      y: Math.max(...vertices.map((p) => p.y)) - Math.min(...vertices.map((p) => p.y)),
      z: Math.max(...vertices.map((p) => p.z)) - Math.min(...vertices.map((p) => p.z)),
      minZ: Math.min(...vertices.map((p) => p.z)),
    };
  };
  const aa = bounds(a.faces),
    bb = bounds(b.faces);
  assert.ok(aa.z < aa.x * 0.4 && aa.z < aa.y * 0.4);
  assert.ok(aa.minZ > bb.minZ + 2);
  assert.equal(handHeight(1), 0);
  assert.ok(handHeight(0.6) > handHeight(0.9));
});
test('Biên bàn tay giữ ngón cái và khe ngón; không phụ thuộc alpha ảnh PNG', () => {
  assert.ok(inHand(0, 0.3));
  assert.ok(inHand(-0.76, -0.03));
  assert.ok(inHand(-0.07, -0.96));
  assert.equal(inHand(0.4, -0.75), false);
  assert.equal(inHand(1, 0), false);
  assert.ok(palmRestOutline.length > 40);
});
test('Cánh chuyển khớp trong 3D, gốc giữ nguyên còn khuỷu/cổ/tip và lông đi theo pha', () => {
  const root = v3(2, 3, 1.6),
    f = { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  const a = wingPose(root, f, 0, false),
    b = wingPose(root, f, 0.3, false);
  // Hai gốc riêng nằm sát bả vai; chuyển động vỗ bắt đầu sau gốc.
  assert.ok(
    a.every((p) => Math.hypot(p.root.x - root.x, p.root.y - root.y, p.root.z - root.z) < 0.12),
  );
  assert.ok(a.every((p, i) => Math.abs(p.tip.z - b[i].tip.z) > 0.1));
  assert.notDeepEqual(buildWings(root, f, 0, false).faces, buildWings(root, f, 0.3, false).faces);
  for (const t of [0, 0.3, 0.7]) {
    const mesh = buildWings(root, f, t, true);
    assert.ok(
      mesh.faces.every((face) =>
        [face.a, face.b, face.c, face.normal].every((p) => Number.isFinite(p.x + p.y + p.z)),
      ),
    );
  }
});
test('Vật liệu linh lực xuyên nền, rìa sáng hơn tâm và ánh sáng có luồng chuyển động', () => {
  const face = {
    a: v3(0, 0, 1),
    b: v3(1, 0, 1),
    c: v3(0, 1, 1),
    normal: v3(Math.SQRT1_2, -Math.SQRT1_2, 0),
    color: 0xffce79,
    alpha: 1,
  };
  const samples = Array.from({ length: 40 }, (_, i) => spiritSurface(face, i / 20));
  assert.ok(samples.every((s) => s.alpha > 0 && s.alpha < 0.5));
  assert.ok(
    Math.max(...samples.map((s) => s.alpha)) - Math.min(...samples.map((s) => s.alpha)) > 0.02,
  );
  assert.equal(spiritSurface({ ...face, alpha: 0 }, 1).alpha, 0);
  const center = spiritSurface(
    { ...face, normal: v3(1 / Math.sqrt(3), -1 / Math.sqrt(3), 1 / Math.sqrt(3)) },
    1,
  );
  const edge = spiritSurface({ ...face, normal: v3(Math.SQRT1_2, Math.SQRT1_2, 0) }, 1);
  assert.ok(edge.alpha > center.alpha);
});

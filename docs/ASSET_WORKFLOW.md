# Võ Luyện — asset runtime và đợt nâng cấp 2.5D

## Hướng nâng cấp đã duyệt · 16/10/2026

Người dùng chọn hướng **Tiên hiệp 2.5D — mẫu số 2**. Quy chuẩn hiện hành cho asset mới nằm tại [ART_DIRECTION_2_5D.md](ART_DIRECTION_2_5D.md); nguồn mesh/rig và cách xuất nằm trong [art/duong-khai-rebuild/README.md](../art/duong-khai-rebuild/README.md). Các ảnh mẫu trong `art/motion-style-study/` và bộ cutout bị bác tại `art/duong-khai-2-5d/` chỉ giữ làm lịch sử màu sắc/trang phục.

Bộ dựng mới `fresh-3d-10759de3137b` đã qua kiểm tra nội bộ ngày 18/10/2026, chưa thay actor v3 trong game. Mở `art/duong-khai-rebuild/MO_DUONG_KHAI.cmd` để xem HTML trực tiếp, không cần server. Metadata nằm trong `art/duong-khai-rebuild/export/manifest.json`: ô quyền 320 px, ô kiếm/ngã 448 px; cùng mật độ 100 px/đơn vị và `anchor` riêng theo clip. Đọc `frameSize`, `anchor`, số khung, thời lượng, `loop`, `previewLoop`, `locomotion`, `impactFrames` và dữ liệu bóng khi tích hợp. Hai đòn kiếm thứ hai/ba nối từ đòn trước; dùng combo hoặc điều phối đúng thứ tự. Dùng thế thủ cho trạng thái chờ của kiếm; danh mục kiếm không có idle.

Các phần v3 dưới đây mô tả bộ MVP đang chạy; môi trường lobby/rừng mở rộng của game dùng thêm v4 theo README dự án. Chúng có quy cách và quy trình xuất riêng.

Bộ hình giai đoạn 0 gồm nhân vật, quái, boss, sủng vật, vật phẩm, trang bị, kỹ năng, hiệu ứng, UI và Hắc Phong Sơn. Actor được dựng bằng rig 3D rồi xuất thành sprite pixel 2D theo camera isometric 35,264°.

## Xem bộ MVP đang dùng

Mở `art/v3/ASSET_PREVIEW.html` bằng trình duyệt. Trang dùng PNG runtime thật, có 8 hướng, chọn từng đòn hoặc luân phiên combo, xem nhãn chuẩn bị/ra đòn/thu về, phóng 1×–3×, chạy chậm, tạm dừng và chuyển từng khung. Tab màn chơi đặt các lớp ảnh trên cùng phép chiếu, kèm Dương Khai và sủng vật di chuyển. Các tab còn lại xem vật phẩm, kỹ năng, hiệu ứng và UI.

Nếu dùng máy chủ nội bộ:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Sau đó mở `http://127.0.0.1:8765/art/v3/ASSET_PREVIEW.html`.

## File runtime MVP v3

- `public/assets/v3/asset-manifest.json`: danh mục chính, kích thước, điểm neo, camera, animation, tốc độ bước và SHA-256.
- Các thư mục `characters`, `enemies`, `bosses`, `pets`: atlas PNG, atlas JSON, animations JSON và PNG từng khung.
- `maps`: nền isometric, props riêng và layout có tọa độ thế giới, phép chiếu, vị trí xuất hiện, va chạm đề xuất.
- `items`, `equipment`, `skills`, `effects`, `ui`: các nhóm hình tĩnh và hiệu ứng.
- `art/v3/models`: 12 mô hình Blender có skeleton, đứng/đi/ngã và từng đòn đánh riêng.
- `art/stage0-assets-v3.zip`: bộ đóng gói để sử dụng và chỉnh sửa.

Tạo hình hiện tại được tạm duyệt để triển khai cơ chế; chất lượng đồ họa sẽ được nâng cấp ở đợt sau theo ý người dùng.

PNG + JSON là đầu vào cho game 2D. Mô hình Blender và script dùng khi cần thay tạo hình hoặc xuất lại.

## Quy cách runtime v3

Mỗi actor có 8 hướng S, SW, W, NW, N, NE, E, SE theo màn hình; S nhìn mặt và N nhìn lưng. Di chuyển dùng 12 khung / 0,8 giây, hai chân luân phiên chống đất và nhấc bước; quái bốn chân, cóc nhảy và chim bay có chu kỳ riêng. Camera và tỉ lệ giữ cố định trong mọi trạng thái. Mỗi actor có 3 đòn riêng; boss có 4. Bộ gồm 7.024 khung actor và 37 động tác tấn công × 8 hướng. Atlas cắt vùng alpha, giữ offset/điểm neo trong JSON; mỗi texture dưới 4096 px.

Khi tích hợp, lấy `origin` từ manifest để đặt điểm chân. Lấy frame qua tên trong JSON, tránh tự suy ra từ số hàng. Tốc độ đi chuẩn nằm ở `walk.worldSpeed`; nếu đổi tốc độ nhân vật, đổi tốc độ animation cùng tỉ lệ để giữ chân bám nền. Dùng animation đi khi đang di chuyển và phát hiệu ứng kỹ năng độc lập; animation đánh dùng khi đứng tung đòn.

Cấu hình gameplay tu luyện, XP/thẻ trong màn, luyện đan, luyện khí và sủng vật được mô tả trong [GAME_DESIGN.md](GAME_DESIGN.md). Game React + TypeScript + Vite + Phaser hiện đã có map đầu và lobby; cách chạy nằm trong README dự án.

## Chỉnh sửa và xuất lại runtime v3

Các lệnh sau áp dụng cho bộ v3. Quy trình dựng mới, đóng gói và kiểm tra nguồn của Dương Khai 2.5D nằm trong [README bộ dựng mới](../art/duong-khai-rebuild/README.md).

Bản Blender đã kiểm tra: 4.5.14 LTS. Script xử lý PNG dùng Python, Pillow và NumPy. Tên đòn, tay/chân ra đòn và mốc thời gian nằm trong `attack_library.py`; bộ đòn được mô tả ở `docs/ATTACK_DESIGN.md`. Sửa tạo hình/pose trong `build_duong_khai.py`, `build_creatures.py`; camera, IK và vòng bước nằm trong `rig_helpers.py`; bảng màu/ánh sáng nằm trong `toon_materials.py`.

```powershell
blender -b --python-exit-code 1 --python art/v3/build_duong_khai.py
blender -b --python-exit-code 1 --python art/v3/build_duong_khai.py -- --sword
blender -b --python-exit-code 1 --python art/v3/build_creatures.py -- --actor hac-lang
```

Lặp lệnh quái/sủng vật cho các ID trong manifest khi sửa nhóm đó. Sau khi xuất xong:

```powershell
python art/v3/export_rig_assets.py
python art/v3/export_scene_assets.py
python art/v3/validate_assets.py
python art/v3/validate_attacks.py
python art/v3/render_scene_preview.py
```

Sau khi xem trực tiếp hoạt ảnh, từng khung, các tab và kiểm tra console trong trình duyệt, ghi kết quả mới vào `browser-qa.json`. Báo cáo trực quan phải gắn với đúng hash của atlas vừa xuất; các kiểm tra file không thay cho bước xem chuyển động. Khi đã kiểm tra xong:

```powershell
python art/v3/record_visual_review.py --reviewed
python art/v3/finalize_assets.py
python art/v3/package_assets.py
```

Có thể xuất toàn bộ bằng `python art/v3/render_all.py`; đặt Blender trên PATH hoặc khai báo `BLENDER_EXE`.

Khi tích hợp atlas cắt alpha, dùng JSON Hash của Phaser để giữ `spriteSourceSize` và `sourceSize`. Các animation `attack-1-S`, `attack-2-S`… đều chạy một lần (`repeat: 0`); `comboOrder` xác định thứ tự. Mốc `impactFrame` là dữ liệu thời điểm tiếp xúc, chưa có xử lý sát thương trong giai đoạn asset.

Kiểm tra kỹ thuật ghi tại `art/v3/preview/qa-report.json` và `package-qa.json`; kiểm tra trình duyệt ghi tại `browser-qa.json`. Cần xem cả chuyển động chậm và chuyển động trên nền sau mọi thay đổi pose.

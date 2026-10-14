"""Cập nhật tài liệu theo số liệu đã kiểm tra, không tự đoán kích thước frame."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
assert json.loads((HERE/'preview/package-qa.json').read_text(encoding='utf-8'))['status']=='passed'
assert json.loads((HERE/'preview/attack-qa.json').read_text(encoding='utf-8'))['status']=='passed'
readme=(ROOT/'README.md').read_text(encoding='utf-8').replace('art/v2','art/v3').replace('assets/v2','assets/v3').replace('stage0-assets-v2','stage0-assets-v3')
readme=readme.replace('có skeleton và 4 action đứng/đi/đánh/ngã xuống.', 'có skeleton, đứng/đi/ngã và từng đòn đánh riêng.')
readme=readme.replace('Atlas xếp 20 cột × 16 hàng, có 320 frame đặt tên rõ; mỗi texture dưới 4096 px.', 'Mỗi actor có 3 đòn riêng; boss có 4. Bộ gồm 7.024 khung actor và 37 động tác tấn công × 8 hướng. Atlas cắt vùng alpha, giữ offset/điểm neo trong JSON; mỗi texture dưới 4096 px.')
readme=readme.replace('chọn trạng thái, phóng', 'chọn từng đòn hoặc luân phiên combo, xem nhãn chuẩn bị/ra đòn/thu về, phóng')
readme=readme.replace('Script xử lý PNG dùng Python, Pillow và NumPy.', 'Script xử lý PNG dùng Python, Pillow và NumPy. Tên đòn, tay/chân ra đòn và mốc thời gian nằm trong `attack_library.py`; bộ đòn được mô tả ở `docs/ATTACK_DESIGN.md`.')
readme=readme.replace('python art/v3/validate_assets.py', 'python art/v3/validate_assets.py\npython art/v3/validate_attacks.py')
readme=readme.replace('PNG + JSON là đầu vào cho game 2D.', 'Tạo hình hiện tại được tạm duyệt để triển khai cơ chế; chất lượng đồ họa sẽ được nâng cấp ở đợt sau theo ý người dùng.\n\nPNG + JSON là đầu vào cho game 2D.')
readme=readme.replace('Kiểm tra kỹ thuật ghi', 'Có thể xuất toàn bộ bằng `python art/v3/render_all.py`; đặt Blender trên PATH hoặc khai báo `BLENDER_EXE`.\n\nKhi tích hợp atlas cắt alpha, dùng JSON Hash của Phaser để giữ `spriteSourceSize` và `sourceSize`. Các animation `attack-1-S`, `attack-2-S`… đều chạy một lần (`repeat: 0`); `comboOrder` xác định thứ tự. Mốc `impactFrame` là dữ liệu thời điểm tiếp xúc, chưa có xử lý sát thương trong giai đoạn asset.\n\nKiểm tra kỹ thuật ghi')
(ROOT/'README.md').write_text(readme,encoding='utf-8')
lines=['# Danh mục asset MVP — isometric v3','',
       'Bộ runtime nằm trong `public/assets/v3`. Có 12 actor, 7.024 frame và 37 đòn tấn công riêng với đủ tám hướng. Tạo hình rig hiện tại được tạm duyệt; nâng cấp đồ họa thực hiện sau.', '',
       '| Actor | Ô PNG gốc | Frame | Đòn riêng |','| --- | --- | --- | --- |']
for a in manifest['actors']:lines.append(f'| {a["name"]} | {a["size"]} × {a["size"]} | {a["frames"]} | {len(a["attacks"])} |')
lines += ['', 'Mỗi actor thường có 576 khung, boss có 688. Đứng: 8 khung/8 fps; đi: 12 khung/15 fps; mỗi đòn: 14 khung/24 fps (boss 16 fps); ngã: 10 khung/12 fps. Chỉ đứng và đi lặp trong JSON runtime.', '',
          'Các clip `attack-1`, `attack-2`, `attack-3` (boss thêm `attack-4`) có cùng pose đầu/cuối để nối chuỗi. `attacks` chứa tên đòn, chi dẫn và chuẩn bị/ra đòn/thu về; `comboOrder` chứa thứ tự. Chi tiết ở `ATTACK_DESIGN.md`.', '',
          'Hướng S/SW/W/NW/N/NE/E/SE theo màn hình, S thấy mặt, N thấy lưng; camera orthographic cố định 35,264°. Điểm neo mặt đất và pixel/đơn vị thế giới giữ cố định giữa mọi pose.', '',
          'Atlas dùng JSON Hash, cắt alpha và giữ `spriteSourceSize`, `sourceSize`, `pivot`. Khôi phục về ô PNG gốc theo offset trước khi so sánh; không căn lại tâm từng pose. PNG đơn và sheet từng đòn vẫn có ô vuông/điểm neo cố định. Không suy ra tọa độ atlas từ số hàng.', '',
          'Hình tĩnh giữ bộ đã duyệt: 48 icon, 16 props, 16 phần UI, 12 hiệu ứng × 4 frame, nền Hắc Phong Sơn và nền tu luyện. Nền/props tách lớp; layout có tọa độ thế giới và phép chiếu isometric.', '',
          'Nguồn Blender và công cụ nằm trong `art/v3`. ZIP gồm mô hình, PNG/JSON, trang xem, script và tài liệu; loại Blender portable, log và bản thử nội bộ.', '',
          'Kiểm tra gồm PNG/atlas, alpha, cắt mép, hash/điểm neo, giới hạn 4096 px; vị trí bàn chân thật; 296 tổ hợp đòn/hướng không trùng động tác; đổi tay quyền và quỹ đạo đầu kiếm; pose nối; xem hoạt ảnh chậm/từng khung và kiểm tra trình duyệt. Các báo cáo nằm trong `art/v3/preview`.','']
(ROOT/'docs/ASSET_MANIFEST.md').write_text('\n'.join(lines),encoding='utf-8')
guide=(ROOT/'docs/ART_GUIDE.md').read_text(encoding='utf-8').replace('MVP v2','MVP v3').replace('`toon_materials.py` quản lý','`attack_library.py` quản lý các đòn và mốc ra đòn; `toon_materials.py` quản lý')
guide=guide.replace('## Xuất và kiểm tra', '## Bộ đòn\n\nQuyền: trái thẳng, phải chéo, trái móc lên. Kiếm: chéo thuận xuống, chéo ngược lên, quét ngang. Mỗi sinh vật có 3 đòn theo loài, boss có 4 đòn cào trái/cào phải/vồ/gầm. Cắn và gầm dùng hàm có khớp riêng. Mọi đòn giữ cùng pose nối và tám hướng; xem `ATTACK_DESIGN.md`.\n\n## Xuất và kiểm tra')
guide=guide.replace('Atlas hash JSON có frame, pivot, sourceSize và meta;', 'Atlas hash JSON có frame cắt alpha, spriteSourceSize, pivot, sourceSize và meta;')
guide=guide.replace('Đây là bộ hình sản xuất, không phải tranh ý tưởng.', 'Tạo hình hiện tại được người dùng tạm duyệt để triển khai gameplay; nâng cấp đồ họa thực hiện ở đợt sau.')
(ROOT/'docs/ART_GUIDE.md').write_text(guide,encoding='utf-8')
gdd=(ROOT/'docs/GAME_DESIGN.md').read_text(encoding='utf-8')
note='\n\n## Cập nhật asset ngày 13/10/2026\n\nNgười dùng tạm duyệt tạo hình rig hiện tại, yêu cầu nâng cấp đồ họa sau. Trước phần gameplay, bổ sung tối thiểu ba đòn quyền đổi tay, ba đường kiếm và bộ đòn riêng cho sinh vật/boss theo `ATTACK_DESIGN.md`. Giai đoạn này vẫn chỉ sản xuất asset và trang xem.\n'
if '## Cập nhật asset ngày 13/10/2026' not in gdd:gdd+=note
(ROOT/'docs/GAME_DESIGN.md').write_text(gdd,encoding='utf-8')
print('Tài liệu v3 đã cập nhật theo manifest đã kiểm tra.')

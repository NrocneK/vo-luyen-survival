# Danh mục asset MVP — isometric v3

Bộ runtime nằm trong `public/assets/v3`. Có 12 actor, 7.024 frame và 37 đòn tấn công riêng với đủ tám hướng. Tạo hình rig hiện tại được tạm duyệt; nâng cấp đồ họa thực hiện sau.

| Actor | Ô PNG gốc | Frame | Đòn riêng |
| --- | --- | --- | --- |
| Độc Thiềm | 120 × 120 | 576 | 3 |
| Dương Khai — quyền | 128 × 128 | 576 | 3 |
| Dương Khai — kiếm | 136 × 136 | 576 | 3 |
| Linh Hồ | 120 × 120 | 576 | 3 |
| Ngọc Vĩ Linh Hồ | 120 × 120 | 576 | 3 |
| Thanh Điểu | 120 × 120 | 576 | 3 |
| Phong Linh Loan | 120 × 120 | 576 | 3 |
| Thiết Nha Trư | 120 × 120 | 576 | 3 |
| Thiết Nha Trư Tinh Anh | 120 × 120 | 576 | 3 |
| Hắc Lang | 120 × 120 | 576 | 3 |
| Hắc Lang Tinh Anh | 128 × 128 | 576 | 3 |
| Hắc Phong Lang Vương | 176 × 176 | 688 | 4 |

Mỗi actor thường có 576 khung, boss có 688. Đứng: 8 khung/8 fps; đi: 12 khung/15 fps; mỗi đòn: 14 khung/24 fps (boss 16 fps); ngã: 10 khung/12 fps. Chỉ đứng và đi lặp trong JSON runtime.

Các clip `attack-1`, `attack-2`, `attack-3` (boss thêm `attack-4`) có cùng pose đầu/cuối để nối chuỗi. `attacks` chứa tên đòn, chi dẫn và chuẩn bị/ra đòn/thu về; `comboOrder` chứa thứ tự. Chi tiết ở `ATTACK_DESIGN.md`.

Hướng S/SW/W/NW/N/NE/E/SE theo màn hình, S thấy mặt, N thấy lưng; camera orthographic cố định 35,264°. Điểm neo mặt đất và pixel/đơn vị thế giới giữ cố định giữa mọi pose.

Atlas dùng JSON Hash, cắt alpha và giữ `spriteSourceSize`, `sourceSize`, `pivot`. Khôi phục về ô PNG gốc theo offset trước khi so sánh; không căn lại tâm từng pose. PNG đơn và sheet từng đòn vẫn có ô vuông/điểm neo cố định. Không suy ra tọa độ atlas từ số hàng.

Hình tĩnh giữ bộ đã duyệt: 48 icon, 16 props, 16 phần UI, 12 hiệu ứng × 4 frame, nền Hắc Phong Sơn và nền tu luyện. Nền/props tách lớp; layout có tọa độ thế giới và phép chiếu isometric.

Nguồn Blender và công cụ nằm trong `art/v3`. ZIP gồm mô hình, PNG/JSON, trang xem, script và tài liệu; loại Blender portable, log và bản thử nội bộ.

Kiểm tra gồm PNG/atlas, alpha, cắt mép, hash/điểm neo, giới hạn 4096 px; vị trí bàn chân thật; 296 tổ hợp đòn/hướng không trùng động tác; đổi tay quyền và quỹ đạo đầu kiếm; pose nối; xem hoạt ảnh chậm/từng khung và kiểm tra trình duyệt. Các báo cáo nằm trong `art/v3/preview`.

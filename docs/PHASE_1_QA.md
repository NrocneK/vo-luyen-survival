# Kiểm thử giai đoạn 1 — 14/10/2026

Phạm vi: khung React/TypeScript/Vite/Phaser 3, Dương Khai, bản đồ isometric Hắc Phong Sơn, camera và vật cản. Bộ hình sử dụng asset v3 đã duyệt. Quái, chiến đấu, sát thương và máu thuộc giai đoạn 2.

## Kiểm tra tự động

- `npm run build`: thành công; chạy đồng bộ asset, TypeScript và build Vite.
- `npm run test`: 8 bài đạt, 0 lỗi.
- Kiểm tra phép chiếu và phép chiếu ngược, tám hướng sprite, tốc độ đi chéo, bán kính nhân vật ở ranh giới, chống xuyên đá, trượt quanh vật cản và ghép tốc độ animation với quãng đường thực ở frame bình thường/chậm.
- Script đồng bộ kiểm tra SHA-256 atlas, chọn 2 actor và 9 file hình/atlas cần cho giai đoạn 1. Bản build không chứa bộ xuất Blender hoặc ảnh thử.

## Kiểm tra trên trình duyệt

Bản production tại `http://127.0.0.1:4173/`, Codex In-app Browser, viewport 1280 × 720. Thao tác bằng nút thật và phím thật; đọc vị trí từ HUD, không thay đổi trạng thái engine bằng script.

| Trường hợp | Kết quả |
| --- | --- |
| Tải menu và vào màn | Thành công; hình và font tải đủ, menu nằm trong viewport |
| WASD, phím mũi tên và tổ hợp đi chéo | Nhân vật di chuyển, hướng và camera cập nhật |
| Quyền → kiếm | Radio, HUD và sprite đổi theo vũ khí; mỗi lần vào màn đặt lại vị trí/quãng đường |
| Esc và nút tạm dừng/tiếp tục | Hiện/đóng hộp thoại đúng; phím di chuyển lúc tạm dừng không làm đổi tọa độ |
| Trở về chuẩn bị, vào màn nhiều lần | Hoạt động; chỉ có một canvas |
| Thu/phóng | HUD và camera đổi 2.0 → 2.5 → 2.0 |
| Rìa màn | Thành phần x dừng ở 9.99, bằng giới hạn 10.2 trừ bán kính 0.21 |
| Đá lớn tại (-4, 2) | Nhân vật dừng trước đá ở khoảng (-3.14, 2.11), ngoài bán kính tổng 0.86; HUD chuyển sang Bãi đá |
| Console production | Không có lỗi hoặc cảnh báo trong lượt kiểm thử cuối |

Ảnh xác nhận được lưu tại `qa/screenshots/menu-stage1.jpg` và `qa/screenshots/game-stage1.jpg`. Ảnh chụp là bản chạy thật.

## Quyết định triển khai

- Phaser quản lý render/animation/input; React quản lý menu/HUD với cập nhật vị trí 10 lần/giây.
- Phaser tự bắt phím di chuyển trong màn. React chỉ xử lý Esc để tránh chặn keydown trước khi engine nhận phím.
- Tọa độ mặt đất dùng chung cho vật cản và actor, sau đó chiếu isometric. Atlas giữ điểm neo từ khung gốc; đổi hướng walk giữ pha chân.
- Phaser tải bằng chunk riêng. Asset và font được đóng gói cục bộ, kèm giấy phép font trong `dist/licenses`.

Giai đoạn 1 hoàn thành theo phạm vi trên. Mốc tiếp theo: quái xuất hiện, tự tấn công bằng kỹ năng mặc định của vũ khí, sát thương, máu và xử lý chết.

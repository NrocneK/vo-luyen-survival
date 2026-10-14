# Môi trường lobby/map v4

Bốn nền phòng được tạo bằng imagegen dựa trên sân v3: Đan phòng, Luyện khí đường, Tĩnh thất và Linh thú viên. Ảnh gốc nằm trong `sources/`; bản runtime 1600 × 900 nằm trong `public/assets/v4/maps/`. Bộ actor và hoạt ảnh v3 giữ nguyên.

`forest-floor-tile.png` là ô nền rừng 512 × 512. Script chuẩn hóa kích thước và ghép mép đối diện; `qa/terrain-repeat.png` dùng kiểm tra trải 2 × 2. Không thay ảnh nền cũ trong v3.

Để xuất lại, cài Python cùng Pillow/NumPy và chạy:

```powershell
python art/v4/export-environments.py
```

Script tạo manifest trạng thái `prepared`. Sau khi kiểm tra ảnh, mép nối, các phòng trong trình duyệt và vị trí chân nhân vật, đổi trạng thái sang `validated`, rồi chạy `npm run sync:assets`. Script đồng bộ kiểm tra SHA-256 trước khi đưa vào game.

Bản v4 đã kiểm tra trong game ở 1280 × 720 và 1024 × 680: nền riêng từng khu, lối trở về không bị thông báo che, nhân vật/linh thú đứng trên sàn, các cửa không bị panel phủ. Nền rừng được kiểm tra bằng di chuyển thật tới (23,78; 23,78) và mép Đông (31,79; 31,79).

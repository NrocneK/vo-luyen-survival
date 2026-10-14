# Lobby và map mở rộng 1.1 — 14/10/2026

## Thay đổi

- Sân trung tâm kết nối Đan phòng phía Tây, Luyện khí đường phía Đông, Tĩnh thất phía Bắc và Linh thú viên phía Nam. Mỗi khu có nền riêng và nút trở về sân. Thanh bên chuyển nhanh đến cùng các khu đó.
- Map tăng từ 20,4 × 20,4 lên 64 × 64 đơn vị: diện tích gấp 9,84 lần. Camera 2×, tỉ lệ sprite và tốc độ di chuyển giữ nguyên.
- Bỏ đá, thân cây, gốc cây, rễ cây và cụm phế tích dày trong lối đi. Bố cục mới có 12 prop; chỉ 2 vật thể chắn ở điểm mốc xa, 8 cây nằm ngoài ranh giới và 2 cụm thực vật nhỏ để trang trí.
- Scene, minimap và va chạm dùng chung `forestLayout`/`forestProjection`. Spawn đọc ranh giới mới và vị trí hiện tại, bỏ giới hạn cứng ±9,3.
- Nền rộng dùng TileSprite; texture 512 × 512 được chuẩn hóa mép nối. Bốn nền phòng 1600 × 900 có hash được kiểm tra khi build.

## Kiểm tra tự động

- **27/27 bài kiểm tra đạt**, gồm 24 quy tắc gốc và 3 kiểm tra map mở rộng.
- Di chuyển hơn 21 đơn vị theo cả tám hướng ở vùng giữa, không bị vật cản cũ chặn.
- Quái xuất hiện quanh nhân vật ở các góc/vùng xa, nằm trong ranh giới có tính bán kính, không tụ ở map nhỏ cũ.
- Bốn góc và các điểm mốc chiếu vào đúng vùng camera.
- Lượt tích hợp seed 87: hai tinh anh, đủ bốn đòn boss, thức tỉnh, thắng, nhận/lưu thưởng và bắt đầu lại bậc 1.
- 9 lượt mô phỏng dùng đúng vùng va chạm mới đều hoàn thành; thời gian thắng 611–660 giây. Bộ điều khiển tự động biết né, ưu tiên thẻ và nhặt XP nên kết quả này không đại diện độ khó của người mới. Số quái đồng thời cao nhất trong mẫu là 100, trong giới hạn cấu hình.
- TypeScript, build production và Prettier đạt. Hash 12 atlas actor cùng 5 ảnh môi trường mới khớp nguồn.

## Kiểm tra trong trình duyệt

Bản production thử riêng tại cổng 4180, không sửa tiến trình ở cổng bàn giao 4173.

- Click từng cửa trên sân → đúng nền phòng và panel chức năng → quay lại sân. Luyện Tu Vi Đan trừ 25 linh thạch, thêm 1 viên, trạng thái giữ sau tải lại.
- Thông báo luyện đan không phủ lối quay về; quay ra sân khi thông báo còn hiện được.
- Đi về phía Đông bằng phím D tới (23,78; 23,78), vượt xa ranh giới cũ. Giữ tiếp tới (31,79; 31,79), dừng đúng mép có bán kính chân; camera/minimap và quái vẫn hoạt động.
- Rút lui nhận 30%, quay về sân; cảnh rừng và các đối tượng chiến đấu được dọn. Có thể tiếp tục vào phòng.
- 1280 × 720 và 1024 × 680: phòng căn lại theo cửa sổ, bốn cửa có tâm click không bị UI khác che; viewport kiểm thử được trả về mặc định.
- Console không có lỗi/cảnh báo. Ảnh QA trong `qa/screenshots/`: `alchemy-1.1.jpg`, `forge-1.1.jpg`, `cultivate-1.1.jpg`, `pets-1.1.jpg`, `map-east-edge-1.1.jpg` và ảnh sân bàn giao.

## Repository công khai

Mã nguồn, tài liệu, asset gốc/runtime và nguồn rig đã đưa lên https://github.com/NrocneK/vo-luyen-survival. File tải/xuất tiến trình cá nhân, runtime Blender portable, thư viện cài đặt, build và ảnh QA tạm không được commit. README có lệnh clone/cài/chạy và hướng dẫn đồng bộ trên thiết bị khác; GitHub Actions kiểm tra test/build mỗi lần push.

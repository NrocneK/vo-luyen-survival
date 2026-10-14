# Kiểm thử Hắc Phong Sơn 1.0 — 14/10/2026

Phạm vi bàn giao: lobby Lăng Tiêu Các và trọn vòng chơi của map đầu. Dùng bộ hình v3 đã duyệt; không thay tạo hình.

## Kiểm tra tự động

- Build Vite và kiểm tra TypeScript thành công.
- **24/24 bài kiểm tra đạt**, gồm phép chiếu/va chạm, tốc độ chân, chi phí chế tạo, cảnh giới, đan dược, sủng vật, điều kiện thẻ/thức tỉnh, thưởng 100%/30%, reset lượt và lưu/nhập.
- Bài tích hợp chạy cùng RunEngine và vùng va chạm với scene: nhân vật mới, seed 87, đi qua hai tinh anh, đủ bốn đòn boss, thức tỉnh Cương Quyền, thắng sau khoảng 640 giây mô phỏng, giữ phần thưởng, xác thực bản lưu và bắt đầu lượt mới bậc 1.
- `qa/balance-report.json`: 9 lượt tự động với 3 seed × 3 mức tiến trình, có cả thắng và thua. Lượt thắng kéo dài khoảng 611–674 giây; quái đồng thời cao nhất trong bộ mẫu là 47. Cả hai liên kết thức tỉnh và bộ đòn boss được thực thi.
- Kiểm tra bản chính hỏng/bản dự phòng tốt, lưu riêng dữ liệu hỏng, lỗi quota và file nhập sai game/số liệu/kích thước.
- Mã nguồn được định dạng bằng Prettier; danh mục asset tự sinh được bỏ khỏi thao tác định dạng.

## Kiểm tra trên trình duyệt

Kiểm thử tương tác qua UI và phím thật trên bản production, viewport 1280 × 720. Bản thử riêng dùng cổng 4180 để tách dữ liệu khỏi bản bàn giao 4173.

| Hệ thống | Kiểm tra đã thực hiện |
| --- | --- |
| Lobby | Động phủ/courtyard, nhân vật đứng động, chuyển từng khu, panel cuộn, nút vào màn cố định dưới phần chuẩn bị |
| Luyện đan/tu luyện | Luyện Tu Vi Đan, trừ linh thạch/dược liệu, dùng +80 tu vi, đột phá và mở kỹ năng; tải lại giữ cảnh giới |
| Luyện khí/trang bị | Chế tạo Ngọc Giới, trang bị, cường hóa quyền sáo; chế tạo và trang bị Liệt Dương Kiếm/Ngọc Liên sau khi có bản vẽ |
| Sủng vật | Ấp Linh Hồ, nuôi lên bậc 3, tiến hóa Ngọc Vĩ; hiển thị cùng nhân vật trong lobby và hỗ trợ đánh trong màn |
| Chuẩn bị | Đổi quyền/kiếm theo vũ khí trang bị, chọn Tụ Khí, đúng số ô và các kỹ năng ngoài mặc định bắt đầu khóa |
| Chiến đấu | Di chuyển, auto attack, đạn, quái thường, tinh anh phút 3, sát thương/máu, chiến lợi phẩm và hạt XP |
| Thẻ XP | Hiện 3 thẻ, khóa thời gian/vị trí, chọn bằng click/phím số; xử lý nhiều cấp từ XP dư; icon/bậc cập nhật |
| Phím chủ động | Q dùng đan tăng máu và tiêu hao đúng, Space lướt/hồi chiêu; bắt keydown cả thao tác bấm nhanh |
| Tạm dừng/kết thúc | Esc/nút tạm dừng, tiếp tục, rút lui nhận 30%, về lobby, giữ chỉ số vĩnh viễn và reset kỹ năng khi vào lại |
| Lưu/xuất/nhập | Tải lại giữ trang bị/cảnh giới, nhập fixture hợp lệ qua file picker với xác nhận; xuất JSON thành công và kiểm tra file tải được |
| Bản cuối 4173 | Một canvas, font/ảnh tải đủ, trang nằm trong viewport, console không có lỗi/cảnh báo |

Fixture tại cổng kiểm thử được tạo từ phần thưởng của hai lượt mô phỏng đã thắng. Fixture không được nhập vào bản bàn giao. Bản 4173 bắt đầu với tài nguyên mặc định, giữ nguyên dữ liệu riêng theo origin.

## Vùng va chạm và render

Đá, thân cây và phế tích dùng nhiều vùng chân theo silhouette và scale, thay cho vòng tròn nhỏ ở điểm neo. Cùng bộ vùng chân được dùng cho người chơi, quái và Linh Hồ; Thanh Điểu bay. Sprite sắp lớp theo bàn chân, tán cây mờ khi che nhân vật. Pha walk theo quãng đường thực; mỗi clip tấn công/death đọc khung theo trạng thái của RunEngine.

Boss/thức tỉnh/phần thưởng thắng được xác nhận bằng kiểm thử tích hợp cùng engine; các thao tác lobby, chiến đấu, tinh anh, XP và rút lui được xác nhận thêm bằng trình duyệt. Ảnh bàn giao thực tế: `qa/screenshots/lobby-1.0.jpg`.

Tải file tiến trình trong công cụ kiểm thử trình duyệt đã có một lần chờ lâu bất thường; thao tác hoàn tất và file JSON được lưu thành công. Lượt này được ghi nhận riêng, không thay đổi quy tắc gameplay.

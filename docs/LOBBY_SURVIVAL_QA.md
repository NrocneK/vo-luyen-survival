# Lobby survival 2.2.0

Ngày 22/10/2026. Phạm vi theo yêu cầu: đổi bố cục các giao diện lobby vốn thiên về văn bản sang giao diện trực quan. Kế thừa hình nền, ảnh vật phẩm/kỹ năng đã có và ngoại quan nhân vật v9.

## Bố cục và nguồn dữ liệu

- Nhân vật lớn, xoay tám hướng thật; bảy ô đồ quanh người, bấm ô để lọc kho. Thuộc tính tổng ở trang chủ lấy trực tiếp từ `permanentStats`.
- Menu tám khu ở cạnh dưới: Căn cứ, Trang bị, Tu luyện, Luyện đan, Luyện khí, Linh thú, Lịch luyện, Thiết lập. Giữ việc đi tới bốn phòng chức năng.
- Kho đồ và luyện khí dùng lưới ảnh, lọc theo ô và bảng chi tiết. Chọn ảnh chỉ xem; trang bị, cường hóa và chế tạo có nút riêng. Nhãn cấp, khung nhóm đồ, trạng thái đang mặc và khóa đọc từ dữ liệu thực.
- Đan dược dùng thẻ ảnh, số tồn kho, hiệu lực, nguyên liệu và lô 1/5/10/tối đa. Tu luyện dùng vòng tiến độ, hiển thị tu vi dư và cổng truyện trước nút đột phá thủ công.
- Linh thú có chân dung cắt từ atlas đang dùng trong trận, bậc nuôi, nội tại, tiến hóa và đồng hành. Chân dung boss trên thẻ nhiệm vụ cũng đọc actor thật; không thêm bộ ảnh thay thế.
- Lịch luyện có lưới 6/14 màn, thẻ boss/mục tiêu và bộ ô kỹ năng. Nút vào trận cố định dưới bảng; phần thưởng, cơ chế và hướng dẫn mở trong chi tiết.
- Điện thoại dùng bảng phía dưới nhân vật, có mở rộng/thu chiều cao và thu gọn hoàn toàn. `lobbyComposition` dùng chung giữa React và Phaser, tránh nhân vật lệch vị trí khi đổi khu/độ rộng.
- Trạng thái khu đang xem, hướng nhìn và mở bảng chỉ thuộc `GameSnapshot`. Không đổi Profile v3, khóa lưu, chi phí, sát thương, cổng truyện hoặc luật tích trữ tu vi. Khi vào trận trả lại tỷ lệ 100 px/đơn vị theo camera.

## Kiểm tra

- `npm test`: 221/221 đạt.
- `npm run typecheck`, `npm run check:format`, `npm run build`: đạt. Cảnh báo kích thước chunk Phaser hiện có không cản build.
- `qa/lobbySurvivalBrowser.cjs` trên server dev mới ở cổng 5177: 11 nhóm đạt; chi tiết tại `qa/lobby-survival-browser-qa.json`.
- `qa/lobbySurvivalProduction.cjs` trên bản build ở cổng 4173: bốn nhóm đạt, đủ tám khu ở 1440×900 / 390×844 / 390×640 và khóa ải Hạo Kiếp bằng tiến trình thường. Kiểm tra cả công cụ test trong App thật: không che menu, mở/đóng được trên điện thoại. Không có lỗi JavaScript hoặc thiếu asset; xem `qa/lobby-survival-production-qa.json`.
- Kiểm tra 40 tổ hợp gồm tám khu ở 1280×720, 1024×700, 820×640, 390×844, 390×640; thêm ảnh desktop 1440×900. Không tràn ngang, không che tâm tám nút menu; thu/mở và mở rộng bảng điện thoại hoạt động.
- Trang bị thật đủ bảy ô cập nhật ngoại quan; chọn đồ giữ nguyên qua nhịp idle; cường hóa, chế tạo, luyện năm viên trừ đúng tài nguyên. Đột phá phải đủ cổng truyện, giữ tu vi dư. Tiến hóa/thay đồng hành, chọn/bỏ kỹ năng, đổi hai thế giới, bắt đầu trận, pause/rút lui/quay lại đều đạt.
- Đọc trực tiếp ảnh thật trong `art/lobby-upgrade/qa/`: trang chủ mới/có đồ, kho, luyện khí/đan, tu vi dư, linh thú, lịch luyện và điện thoại thường/mở rộng. Không dùng số lượng file làm tiêu chí hình ảnh.
- Kiểm thử trình duyệt dùng context riêng và Profile test; đối chiếu khóa chính trước/sau. Không sửa tiến trình đang chơi của người dùng.

## Chạy lại

```powershell
npx vite --host 127.0.0.1 --port 5177
node --preserve-symlinks qa/lobbySurvivalBrowser.cjs
npm run build
npm run preview
node --preserve-symlinks qa/lobbySurvivalProduction.cjs
```

Các script trình duyệt dùng Playwright và Chrome tại đường dẫn runtime của máy này. Khi thay file trong `qa/`, khởi động server dev mới để tránh cache do thư mục QA nằm trong watch ignore. Trang `qa/lobby-survival.html` chỉ dành cho kiểm tra nội bộ; bản chơi chính vẫn là `/`.

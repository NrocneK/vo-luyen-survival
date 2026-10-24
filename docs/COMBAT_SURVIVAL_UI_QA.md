# Giao diện chiến đấu survival 2.3.0

Ngày 22/10/2026. Người dùng duyệt đồng bộ HUD chiến đấu, bảng chọn kỹ năng và màn kết quả với lobby survival 2.2.0.

## Nội dung

- `GameHud.tsx`: thanh XP phía trên, đồng hồ/màn chơi và số hạ địch; thanh boss riêng; sinh lực, kỹ năng và hai hành động ở mép dưới. Sáu ô đọc bộ mang theo thực tế, bậc/chờ kích hoạt/thức tỉnh/biến chiêu rõ ràng. Bấm ô xem chi tiết không đổi build. Nút đan/lướt hiển thị số tồn, lượt lướt và hồi chiêu từ snapshot; không tạo bộ đếm mô phỏng riêng.
- Bản đồ nhỏ thu/mở được, vẫn giữ phép chiếu/chỉ dấu và zoom gốc. Nhiệm vụ, cơ chế và cơ duyên giữ điều kiện/nút tương tác; mục tiêu bảo vệ có thanh HP và số thật. Bảng nhiệm vụ trên điện thoại cuộn trong vùng phía trên tâm trận, không kéo dài che nhân vật.
- `RunOverlays.tsx`: ba thẻ có ảnh lớn, loại thẻ, bậc hiện tại→kế tiếp hoặc nhãn giữ bậc khi chọn Biến chiêu; giữ đầy đủ mô tả do engine tạo. Thức tỉnh giữ điều kiện tấn công bậc 5 + hỗ trợ ≥1. Footer đổi ba thẻ luôn thấy; phím 1/2/3 và R giữ đúng chức năng. Giữ trap Tab, bỏ phím chọn khi đang nhập liệu hoặc xem truyện/kết chương.
- `PauseMenu.tsx`: đồng hồ, số hạ địch, cấp và bộ kỹ năng dạng biểu tượng, nút tiếp tục/rút lui rõ ràng. Hướng dẫn thức tỉnh/biến chiêu nằm trong chi tiết.
- Kết quả: bốn chỉ số nhanh, lưới thưởng bằng ảnh và bảng đóng góp sát thương cạnh nhau trên desktop, xếp dọc trên điện thoại. `CombatReport.tsx` dùng ảnh chiêu/thức tỉnh hoặc chân dung linh thú, giữ số damage thực/kills/tỷ lệ/bậc và tách trước/sau thức tỉnh. Nguyên nhân tử trận vẫn đọc đòn cuối và lịch sáu giây; rút lui/hỏng nhiệm vụ hiển thị riêng.
- Footer trở về căn cứ cố định; trạng thái lưu đọc `saveOk`, không tự khẳng định đã lưu khi ghi thất bại. Kết chương ghi đúng tên Trung Đô/Thông Huyền theo chương.
- `CombatWidgets.tsx` chia sẻ bộ ô trong lượt, nhãn bậc thẻ và lưới thưởng. `combat-survival.css` giới hạn trong `.survival-combat-ui` / `.survival-overlay`, không đổi lobby/HUD renderer Phaser. Các quy tắc mobile Phần 2 đời cũ được ghi đè có chủ đích để boss không che XP.

Không đổi Profile/save, engine, RNG, chi phí, mức damage, nguồn/bậc lúc xuất đòn, luật thưởng 100%/30%, cổng truyện hay gameplay. UI vẫn nhận snapshot ở nhịp giới hạn của bridge; không đưa render mỗi frame sang React.

## Kiểm tra

- `npm test`: 221/221 đạt (`qa/combat-survival-tests.log`).
- `npm run typecheck`, `npm run check:format`, `npm run build`: đạt, bản 2.3.0.
- `qa/combatSurvivalBrowser.cjs` + `qa/combatSurvivalActions.cjs`: tổng mười nhóm đạt; `qa/combat-survival-browser-qa.json` không có lỗi JavaScript hoặc thiếu asset. Dùng engine/bridge thật với snapshot/test profile riêng; khóa main không đổi.
- `qa/combatSurvivalProduction.cjs`: đạt trên bản build 1440×900 và 390×640. App thật dùng công cụ test riêng, di chuyển nhặt XP thật để lên cấp; R/1, ESC, pause/resume, rút lui, kết quả và trở lại tám khu lobby đều đạt. Không lỗi JavaScript/asset; so khóa lưu chính trước/sau không đổi. Báo cáo `qa/combat-survival-production-qa.json`.
- Luồng production phát hiện toast chọn kỹ năng trong lobby mobile che nút vào trận. Đã sửa `lobby-survival.css`: thông báo thường không chặn pointer, nút đóng vẫn bấm được, vị trí nằm phía trên bảng chức năng. Bản sửa đã được chạy lại qua luồng trên, không bỏ qua bằng force click.
- Kiểm HP/XP đúng số snapshot; popup kỹ năng chỉ đọc; thu/mở minimap và zoom; đan trừ tồn/hồi HP/khóa hồi chiêu; pause không chạy đồng hồ; lướt đúng số lượt. Kiểm R đúng một lần, 1/3 chọn đúng thẻ, thức tỉnh 5→6 giữ nhánh, Biến chiêu không tăng bậc, chỉ số được engine cộng. Cơ duyên nhận bằng nút E trên bảng cuộn điện thoại.
- Kiểm sáu kích thước 1440×900, 1280×720, 820×640, 390×844, 390×640, 360×640: HUD không chồng nhau, boss không che XP; nhiệm vụ chừa tâm trận; modal không tràn ngang; footer dùng được; Tab vẫn trong dialog. Kiểm bốn kết quả thắng/tử trận/rút lui/hỏng mục tiêu; thưởng sau settlement và từng hàng damage đúng dữ liệu; quay lại lobby được.
- Đã đọc ảnh thật của HUD, boss, pause, ba loại thẻ, bốn kết quả và biến thể điện thoại thường/cuộn tại `art/combat-ui/qa/`. Cảnh nền/actor là tài sản đã có, phạm vi bản này là giao diện.

## Chạy lại

```powershell
npx vite --host 127.0.0.1 --port 5178
node --preserve-symlinks qa/combatSurvivalBrowser.cjs
node --preserve-symlinks qa/combatSurvivalActions.cjs
npm run build
npm run preview
node --preserve-symlinks qa/combatSurvivalProduction.cjs
```

Trang nội bộ `qa/combat-survival.html` tạo fixture bằng engine/bridge thật, gồm controls test/pause tương ứng App. Script dùng Playwright trong runtime máy hiện tại và Chrome. Khi sửa file `qa/`, khởi động lại dev server để tránh cache do watch ignore. Không dùng fixture để ghi vào tiến trình người dùng.

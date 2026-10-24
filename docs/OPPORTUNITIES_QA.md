# Cơ duyên tùy chọn — 1.7.0

Hoàn tất mục 4 của lộ trình Thế giới 1; các mục 5/6 còn chờ.

## Nội dung và vòng lặp

- **Rương hộ vệ:** đến gần ≤1,5 đơn vị, E phá ấn → ba hộ vệ có cảnh báo 1,2 giây → hạ hết trong 55 giây → trở lại nhận rương. Có linh thạch, tu vi, khoáng và 40% cơ hội có trang bị trong pool của màn.
- **Linh dược:** E thu hái, hồi 25% HP tối đa ngay, thêm linh thảo, XP và thưởng nhỏ. Không tăng chỉ số vĩnh viễn trực tiếp.
- **Tinh anh:** chỉ sinh sau khi nhận khiêu chiến. Hạ trong 55 giây, quay lại nhận thưởng; có yêu đan và 20% cơ hội bản vẽ theo màn. Không dùng boss hoặc đổi tên thú thành võ giả.
- **Tụ linh:** E bắt đầu, ba hộ vệ gây áp lực; giữ tâm nhân vật trong bán kính 2,8 đủ 12 giây trước hạn 30 giây. Rời vòng giảm tiến độ 0,5 giây/giây, không tự thắng chỉ nhờ giết hộ vệ. Thành công dọn hộ vệ còn lại rồi chờ nhận thưởng.

Mỗi lượt trộn bốn loại một lần bằng RNG riêng; thời điểm ở 14/34/54/74% thời lượng màn, lệch ngẫu nhiên ±2,5%. Tối đa một mục tiêu tồn tại. Chờ tham gia 70 giây, chờ nhận thưởng 30 giây, thông báo kết quả 5 giây. Mốc bị trì hoãn nếu mục tiêu cũ còn tồn tại, không mở mục tiêu mới trong 35 giây cuối trước boss; lượt kết thúc sớm hoặc tham gia rất muộn có thể thấy ít hơn bốn mục tiêu.

Vị trí cách người chơi 6–8 đơn vị, chặn trong biên với khoảng trống cho hộ vệ và tránh vật cản. Không tìm được chỗ thì thử lại, không dùng tọa độ dự phòng sai. Quái thường vẫn sinh theo footprint camera như 1.3.0. Giữ ba chỗ trong giới hạn quái cho cơ duyên; khi thiếu chỗ không sinh một phần hoặc tiêu tài nguyên, có thể thử lại.

## Dữ liệu và phần thưởng

`data/opportunities.ts` chứa thời gian, bán kính, bộ hộ vệ và pool đồ/bản vẽ sáu màn. Mức thưởng tăng theo stageIndex; tu vi lấy 3,5% thưởng màn, hệ số linh dược 0,5 và tinh anh 1,3. Đây là mức khởi đầu để đo hành trình ở mục 5.

Thưởng được gieo khi mục tiêu xuất hiện và xem trước trong HUD, không gieo lại khi bấm E. Hộ vệ chỉ cho XP khi bị hạ; loot riêng chỉ cộng một lần qua tương tác nhận thưởng. XP/hồi máu tác dụng ngay, có thể mở màn chọn thẻ. Loot đi vào RunEngine rồi settleLoot: thắng 100%, thất bại/rút lui 30%, đồ/bản vẽ theo xác suất hiện có. Không thêm khóa Profile hoặc tự trao thưởng vĩnh viễn trước tổng kết.

`Opportunities.ts` là máy trạng thái offered → active → claimable → completed hoặc expired. Pause/chọn thẻ dừng tick/deadline; x8 dùng thời gian mô phỏng chung. Hết hạn, hoàn tất tụ linh, boss và kết thúc dọn hộ vệ/attackPlans/cảnh báo/đạn đúng chủ. Sổ guard IDs giữ tới cleanup kể cả actor đã mất; projectile địch có sourceEnemyId. Không cộng kill/loot cho hộ vệ bị rút. RunResult có completed/missed trong lượt, không đổi điều kiện mở màn hoặc hoàn tất thế giới.

## Hình ảnh và điều khiển

Phaser vẽ rương gỗ, linh dược từ atlas hiện có, kiếm khiêu chiến và trận tụ linh. Vòng tương tác/vùng giữ trận dùng bán kính thật, phép chiếu chung. Nhãn co theo zoom; cài đặt giảm hiệu ứng giảm nhấp nháy. Không thêm vật cản. HUD xếp cùng cơ chế màn, cho đọc thưởng và bấm tương tác; E là phím tương đương. Minimap dùng sao tím. Lobby và tạm dừng có hướng dẫn.

## Kiểm tra

- `tests/opportunities.test.ts`: 13 bài kiểm tra nội dung sáu màn, seed/lịch/bag, RNG riêng, tương tác/idempotence, hồi máu/XP, bốn vòng lặp, timeout/pause/levelup/x8, loot 100%/30%, boss/cleanup, biên/vật cản/giới hạn quái và đạn của actor đã bị dọn.
- **154/154 kiểm thử đạt**, gồm hành trình sáu màn và các bài thức tỉnh/biến chiêu/đạn/vòng lửa/lưu/âm thanh. Log: `qa/opportunities-test-results.log`.
- `qa/opportunities-audit.html` dùng GameBridge/ForestScene/HUD/RunOverlays thật trên origin riêng, fixture theo seed; chỉ QA có nút tới mục tiêu/hạ hộ vệ/tiến thời gian. Không đóng gói QA vào production. Báo cáo: `qa/opportunities-browser-qa.json`; ảnh: `qa/screenshots/opportunity-*.png`.

## Xác nhận trình duyệt ngày 20/10/2026

- Rương: phím E sinh đúng ba hộ vệ có cảnh báo; hạ hết chuyển sang nút nhận, loot vẫn 0 trước khi bấm. Nhận rương mẫu cộng 32 linh thạch, giữ một lần và mở màn chọn thẻ do XP.
- Linh dược: sinh lực 400/1000 → 650/1000, không cần đánh; XP mở chọn thẻ. Rút lui sau thu hái cho 1 Linh thảo từ 6 thảo đã giữ, có số cơ duyên 1 trong tổng kết và áp tỷ lệ 30% cùng thưởng theo thời gian màn.
- Tụ linh: sau 5 giây HUD ghi 5/12 và còn 25 giây; hoàn tất đủ 12 giây rồi dọn ba hộ vệ còn sống. Đã đối chiếu vòng/nhãn/minimap ở camera 0,5×.
- Tinh anh: chỉ một hộ vệ sau nhận khiêu chiến; hết hạn dọn sạch, không cấp quà và ghi một cơ duyên bỏ lỡ.
- TypeScript, Prettier, build 1.7.0 và kiểm tra khoảng trắng Git đạt. Console QA/production không warning/error. Bản cổng 4173 tải `/assets/index-CHFvi4D6.js`; nhân vật chính giữ Thối Thể tầng 4, 196 linh thạch, 0 thắng/1 lượt, tu vi tăng idle bình thường.

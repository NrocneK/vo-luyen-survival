# Biến chiêu và đổi thẻ — 1.5.1

## Phạm vi mục 2

Mười thẻ mới xuất hiện trong bộ ba lựa chọn khi kỹ năng tương ứng đã kích hoạt và đạt bậc 2. Mỗi kỹ năng tấn công chọn **một nhánh trong lượt**; chọn rồi loại cả hai thẻ của kỹ năng khỏi pool. Biến chiêu không tăng bậc, không chiếm ô kỹ năng, giữ nguyên khi kỹ năng thức tỉnh và được xóa khi bắt đầu lượt khác.

| Kỹ năng | Nhánh 1 | Nhánh 2 |
| --- | --- | --- |
| Cương Quyền | Liên Hoàn Kình: dư kình sau 0,18 giây, 55% sát thương | Băng Sơn Kình: một luồng lớn, +45% sát thương, thêm 2 lượt xuyên, đẩy quái thường; hồi chiêu +20% |
| Nguyên Khí Trảm | Hồi Phong Kiếm: bay 7 đơn vị/đến biên rồi quay về, xuyên toàn bộ địch mỗi chiều, mỗi lần 85% sát thương | Tán Ảnh Kiếm: thêm 2 đường kiếm hình quạt, mỗi đường 70% sát thương |
| Dương Viêm Chưởng | Tam Hoa Chưởng: thêm 2 chưởng hình quạt, mỗi chưởng 65% sát thương và nổ riêng | Lưu Hỏa Chưởng: nổ để lại vùng đốt 3 giây, 20% sát thương mỗi 0,5 giây; tối đa 8 vùng |
| Viêm Hoàn | Quảng Vực: bán kính ×1,6, giữ DPS | Liệt Diễm: DPS ×1,6, giữ bán kính; thay nhánh Điệp Lãng từ bản 1.5.0 |
| Lôi Liên | Song Liên: hai chuỗi riêng, không trúng trùng địch, mỗi mục tiêu 70% sát thương | Tam Điệp: ba nhịp vào một mục tiêu, cách 0,16 giây, mỗi nhịp 55% sát thương |

Các hệ số áp dụng trên sát thương kỹ năng theo bậc hiện tại trước chí mạng, hệ số test và cơ chế bảo hộ của màn. Băng Sơn không đẩy boss/tinh anh; đẩy quái thường dùng va chạm/map hiện có. Không bổ sung bậc 6 hay đổi liên kết thức tỉnh ở mục này.

## Rút và đổi thẻ

- Bộ thẻ gồm kỹ năng, thức tỉnh, chỉ số và biến chiêu hợp lệ; không có ID lặp trong một bộ.
- Nút **Đổi ba thẻ** hoặc **R** dùng miễn phí đúng một lần cả lượt, chỉ tại levelup. Không tiêu XP, không chọn thẻ, không tăng cấp và không cho mô phỏng chạy tiếp.
- Loại bộ cũ khi pool đủ ba thẻ mới. Nếu pool nhỏ, chỉ giữ lại số thẻ cũ tối thiểu để có ba lựa chọn. Mô tả thẻ chỉ số vẫn tính theo màn/trần thực tế.
- Mỗi lượt có RNG rút thẻ riêng, tách khỏi RNG chiến đấu/loot. Cùng seed/cùng thao tác cho cùng bộ thẻ; dùng đổi thẻ không thay trạng thái RNG chiến đấu.
- HUD đánh dấu kỹ năng đã biến chiêu. Có danh sách và mô tả trong chọn thẻ, tạm dừng, tổng kết lượt. Nút/phím 1/2/3 chọn thẻ giữ nguyên; Tab được giữ trong hộp thoại.

## Kỹ thuật và kiểm thử

- `src/data/augments.ts`: điều kiện, mô tả và thông số; `src/shared/augments.ts`: kiểu dữ liệu. Không thêm trường vào Profile/bản lưu.
- `RunEngine`: đòn trễ chạy theo dt mô phỏng; pause/levelup chặn cả đòn nối tiếp và tick lửa. Kết thúc dọn queue/đạn/vùng đốt.
- Hồi Phong dùng sổ trúng riêng mỗi chiều và va chạm quét, xuyên không giới hạn; chạm địch không đổi chiều hoặc làm hết sát thương. Chiều về hướng đến vị trí hiện tại của người chơi. Đạn thường vẫn giữ xuyên theo bậc và bay đến biên.
- Viêm Hoàn tích phân DPS theo dt cho địch đang ở trong vùng; số sát thương gom theo thời gian thực để không tạo Text/hit sound mỗi frame. Chí mạng giữ trong các cửa sổ 0,4 giây, chia bước tại ranh giới để FPS không làm đổi DPS. Sóng nhiệt theo `VisualEvent ring/heat-wave`, bám tâm nhân vật và lan đến đúng bán kính; không quyết định thời điểm gây sát thương.
- Quảng Vực dùng `RunEngine.flameRadius()` cho cả renderer và sát thương. Vùng đốt giữ tọa độ thế giới, vẽ qua phép chiếu chung và giảm chi tiết theo thiết lập hiệu ứng.
- `tests/augments.test.ts`: điều kiện/chọn loại trừ, lượt đổi và RNG, reset run, quyền trễ/đẩy, kiếm quay về/quạt, hỏa đốt, vòng lặp, sét phân nhánh/tập trung, pause/levelup/kết thúc/x8.
- `/qa/augments-audit.html`: trang QA dev với renderer/HUD/thẻ thật và fixture địch đứng để quan sát. Không được đưa vào giao diện production.

Kết quả chạy và ảnh xác minh nằm ở `qa/augments-test-results.log`, `qa/augments-browser-qa.json`, `qa/screenshots/`.

## Kết quả bản 1.5.0 ngày 19/10/2026 — lưu lịch sử

- **124/124 kiểm thử đạt**, gồm 15 bài cho biến chiêu/đổi thẻ và hành trình đi hết sáu màn bằng thưởng, chế tạo, đột phá thật. TypeScript, production build 1.5.0, Prettier và `git diff --check` đạt.
- Đã kiểm tra ảnh từng nhánh với scene/HUD thật: hai đợt quyền, một luồng đẩy, kiếm quay về, ba đường kiếm/chưởng, vùng đốt, vòng lửa rộng/vòng lặp và hai kiểu sét. Ảnh từng nhánh ở `qa/screenshots/augments/`.
- Một tab QA mới đã kiểm tra phím R: bộ ba thẻ thay đổi hoàn toàn, nút đổi bị khóa; màn vẫn ở levelup. Chọn biến chiêu và xem danh sách build ở menu tạm dừng đã được kiểm tra qua UI. Console tab QA mới không có warning/error; cảnh báo createRoot cũ phát sinh trong quá trình HMR ở tab sửa mã không xuất hiện ở tab mới hoặc production.
- Trên production riêng cổng 4187, nhân vật test ban đầu đã chiến đấu tới lần lên cấp đầu ở x8, HUD/thẻ và lượt đổi hiển thị đúng. Kiểm tra giới hạn lượt đổi, sát thương và reset dựa trên kiểm thử tự động cùng UI QA dùng chung mã game.
- Bản phát hành tại cổng 4173 tải bundle `index-IHgB3BYE.js`; hướng dẫn Biến chiêu/R đã xuất hiện trong Lịch luyện, console sạch. Không bật test hay vào ải trên tiến trình chính của cổng này; nhân vật vẫn Thối Thể tầng 4, 196 linh thạch, 0 thắng/1 lượt như trước; tu vi tiếp tục tăng theo idle.
- Ảnh màn thẻ hoàn thiện: `qa/screenshots/augments-cards-1.5.0.png`. Cân bằng toàn hành trình vẫn thuộc mục 5; liên kết thức tỉnh của Dương Viêm Chưởng thuộc mục 3 tiếp theo.

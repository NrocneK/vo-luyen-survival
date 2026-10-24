# Thế giới 1 — Trung Đô 1.2

Ngày hoàn thiện: 18/10/2026. Phạm vi: gameplay của thế giới Trung Đô, dùng bộ hình runtime v3/v4 hiện có. Trần được người dùng chốt là **Thần Du đỉnh phong, tầng 10**. Các trận survival và boss là nội dung thiết kế cho game, lấy cảm hứng từ các mốc truyện.

## Hành trình

| Màn | Cảnh giới tối thiểu | Boss xuất hiện | Boss |
| --- | --- | --- | --- |
| Hắc Phong Sơn | Thối Thể tầng 1 | 10 phút | Hắc Phong Lang Vương |
| Truyền Thừa Động Thiên | Khai Nguyên tầng 1 | 9 phút | Cổ Trận Thủ Vệ |
| Cửu Âm Sơn Cốc | Khí Động tầng 1 | 9 phút | Cửu Âm Độc Chủ |
| Ly Địa | Chân Nguyên tầng 1 | 10 phút | Xích Diễm Thú Vương |
| Trung Đô · Đoạt Đích | Thần Du tầng 1 | 10 phút | Kiếm Trận Hộ Vệ |
| Trung Đô · Hạo Kiếp | Thần Du tầng 7 | 12 phút | Hắc Triều Thống Lĩnh |

Mỗi màn cần thắng màn trước và đủ cảnh giới. Có hai tinh anh giữa màn, làn quái và thưởng riêng. Boss có bốn đòn, kết hợp lao tới, đánh vùng khóa vị trí, bắn quạt, vòng đạn và triệu hồi theo loại. Giết boss là điều kiện thắng; vượt đủ sáu màn và đạt Thần Du tầng 10 mới hoàn tất thế giới. Có thể chơi lại các màn đã mở.

## Các hệ thống đã nối

- 47 mốc tu luyện, bốn lần đột phá đại cảnh giới có điều kiện chiến thắng/nguyên liệu/đan; idle theo chặng và đan tăng tu vi theo cảnh giới.
- Mười kỹ năng, bốn liên kết thức tỉnh. Viêm Hoàn đánh vùng quanh người; Lôi Liên truyền mục tiêu; Khinh Thân tăng tốc, cải thiện lướt. Kỹ năng ngoài mặc định bắt đầu khóa trong lượt.
- Mười một trang bị, gồm năm món cho các chặng Khí Động–Thần Du; bản vẽ đặc biệt gắn với thưởng vượt lần đầu. Ba công thức đan và hai linh thú giữ toàn bộ vòng nuôi/tiến hóa/đồng hành.
- Thưởng boss và thưởng lần đầu tách riêng. Thưởng lần đầu chỉ cộng khi thắng, đúng một lần; kết quả đã tổng kết không thể cộng lại. Thất bại/rút lui giữ quy tắc 30%.
- Thẻ chỉ số công/máu/giáp/hồi phục tăng hiệu lực theo màn. Thẻ tốc chạy/tốc đánh/chí mạng bị loại khi đã chạm trần; số trên thẻ khớp lượng nhận.
- Vùng cảnh báo và vùng sát thương dùng chung kế hoạch đòn. Khi thắng tự thu tài nguyên đếm được còn trên sân; XP/hồi máu không chuyển thành tiến trình vĩnh viễn.
- Scene, minimap và va chạm đọc cùng bố cục theo màn. Giữ sân 64 × 64 và chỉ hai vật cản tại mốc xa.
- Profile v2 lưu màn đã chọn, số thắng, thời gian tốt nhất và kỷ lục từng màn. Tự chuyển bản v1 trên khóa lưu cũ, giữ tài sản/cảnh giới và chỉ suy ra chiến thắng Hắc Phong Sơn. Không bịa thời gian kỷ lục cho dữ liệu cũ.

## Kiểm tra tự động

**47/47 bài kiểm tra đạt.** Bao gồm kiểm thử cũ cùng các kiểm thử mới tại `tests/campaignEngine.test.ts`, `tests/campaignProgression.test.ts` và `tests/worldOne.test.ts`.

- Kiểm tra 24 đòn của sáu boss, vùng báo trước khóa đúng vị trí, né ra ngoài không nhận sát thương vùng.
- Kỹ năng mới có sát thương/chỉ số thật, đủ điều kiện thức tỉnh; thuộc tính trong lượt không ghi vào profile.
- Kiểm tra mở màn, điều kiện đột phá, thưởng lần đầu, tổng kết lặp, lưu dự phòng, migration và từ chối dữ liệu sai.
- Mô phỏng nhân vật mới đi qua sáu màn, mua/chế tạo/nuôi thú/đột phá bằng tài nguyên kiếm được; lưu và xác thực lại sau mỗi lượt. Đạt trần và hoàn tất thế giới mà không cần idle hay tài nguyên thử nghiệm.
- Báo cáo tái tạo bằng `npm run test:world`, lưu tại `qa/world-one-balance-report.json`. Bộ điều khiển tự động biết nhặt XP và né; kết quả chứng minh đường tiến triển khả thi, không đại diện kỹ năng người mới.

## Kiểm tra trình duyệt

Thử bản production ở cổng QA **4180**, tách tiến trình với cổng bàn giao **4173**. Fixture hoàn tất được tạo từ mô phỏng thưởng thật và chỉ nhập ở cổng QA.

- Bản lưu cũ chuyển sang v2; xem sáu màn, chọn màn khóa để đọc điều kiện, nút bắt đầu bị khóa đúng.
- Đột phá cập nhật cảnh giới và số ô; các phòng lobby vẫn hoạt động.
- Nhập fixture qua giao diện có xác nhận; hiện sáu mốc hoàn tất và Thần Du đỉnh phong.
- Vào/thoát đủ sáu màn; tên màn, thời lượng boss, mục tiêu, minimap, tổng kết và kỹ năng bậc đầu cập nhật đúng.
- Truyền Thừa Động Thiên: đánh thật, đi bằng phím D, nhặt XP lên cấp, chọn Lôi Liên, tạm dừng và rút lui nhận 30%.
- Console không có lỗi/cảnh báo trong các thao tác trên. Layout kiểm tra ở 1280 × 720; ảnh và biên bản nằm trong `qa/screenshots/` và `qa/world-one-browser-qa.json`.

## Tổ chức mã

`stages.ts` giữ cấu hình màn/boss/làn quái/thưởng/bố cục; `campaign.ts` giữ cổng mở màn và hoàn tất thế giới; `realms.ts` giữ điều kiện tu luyện. `RunEngine` nhận màn qua tham số, không phụ thuộc giao diện. `GameBridge` kiểm tra điều kiện bắt đầu, lưu lựa chọn và chốt thưởng. Asset hiện hành đọc từ manifest runtime v3; bộ dựng 2.5D mới tiếp tục dành cho đợt nâng mỹ thuật.

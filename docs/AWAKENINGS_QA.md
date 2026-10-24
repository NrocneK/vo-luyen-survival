# Thức tỉnh và cân bằng kỹ năng — 1.6.0

## Phạm vi mục 3

Hoàn tất năm liên kết của các kỹ năng tấn công hiện có. Đủ điều kiện khi tấn công đúng bậc 5 và hỗ trợ liên kết đã kích hoạt bậc 1–5; người chơi chọn thẻ thức tỉnh ở lần lên cấp. Hỗ trợ không bị tiêu hao. Một Hỏa Linh hỗ trợ được cả Dương Viêm Chưởng và Viêm Hoàn, mỗi kỹ năng vẫn cần chọn thẻ riêng.

| Kỹ năng | Hỗ trợ | Thức tỉnh | Vai trò bậc 6 |
| --- | --- | --- | --- |
| Cương Quyền | Cường Thể | Long Viêm Quyền | Ba quyền kình mạnh; Liên Hoàn thêm dư kình, Băng Sơn gộp toàn bộ volley thành một luồng có đẩy quái |
| Nguyên Khí Trảm | Tụ Khí | Kiếm Khí Phong Bạo | Kiếm khí nhanh hơn; Hồi Phong xuyên hai chiều, Tán Ảnh mở thêm hai đường ngoài |
| Dương Viêm Chưởng | Hỏa Linh | Kim Ô Phần Thiên Chưởng | Ba chưởng vàng, nổ rộng ở lần chạm đầu; giữ Tam Hoa hoặc Lưu Hỏa |
| Viêm Hoàn | Hỏa Linh | Liên Hoa Viêm Giới | Đốt liên tục quanh nhân vật; Quảng Vực mở bán kính, Liệt Diễm tăng DPS |
| Lôi Liên | Lôi Tâm | Cửu Thiên Lôi Liên | Mỗi chuỗi tới mười địch; Song Liên tới hai mươi địch khác nhau, Tam Điệp tập trung một địch |

Thẻ mô tả số luồng, phạm vi hoặc nhịp đánh theo đúng biến chiêu đang dùng. Lobby giải thích liên kết trước khi mang kỹ năng; menu thẻ/tạm dừng hiển thị thiếu hỗ trợ, tiến độ, đủ điều kiện và đã thức tỉnh. HUD đổi tên thực trong tooltip, thêm dấu VI; âm thức tỉnh có ba lớp cao dần và hạ nhạc ngắn để nghe rõ.

## Cấu trúc và thông số

- `src/data/awakenings.ts`: năm liên kết, điều kiện và mô tả thẻ; `skills.ts` lấy liên kết từ cùng nguồn.
- `src/data/combatSkills.ts`: thông số đòn quyền/kiếm/chưởng/lôi và góc bắn. Engine và thẻ cùng gọi các hàm này; không sao chép hệ số vào UI.
- Bậc 6: quyền 3 luồng ×3,3 công kích; kiếm 3 luồng ×3,1 và tốc bay 8. Băng Sơn gộp đủ số luồng trước khi nhân 1,45 và tăng hồi chiêu 20%; tránh mất tổng damage như cách gộp cũ.
- Chưởng bậc 6: 3 luồng ×4,2; tốc bay 6, hồi 2,4 giây trước tốc đánh; nổ một lần bán kính 2,4, sát thương lan 80%. Một đạn không đánh trùng cùng địch bằng cả trực tiếp và lan; vẫn xuyên không giới hạn. Tam Hoa thêm hai luồng ngoài và giữ hệ số 65%; Lưu Hỏa giữ sáu nhịp đốt/3 giây, tối đa tám vùng.
- Lôi bậc 6: ×3,9 công kích; mở chuỗi ở tầm 10, truyền tầm 5, tối đa 10 địch/chuỗi, hồi 2,4 giây trước tốc đánh. Song Liên giữ 70% damage/địch và không trùng địch; Tam Điệp giữ ba nhịp ×55% vào cùng mục tiêu.
- Vòng lửa giữ bán kính/DPS/nhánh liên tục của 1.5.1; bậc 6 bán kính 4,2 hoặc 6,72 khi Quảng Vực. Sóng nhiệt chỉ là phản hồi hình, không phát thêm đòn damage.
- Phát hiện và sửa lỗi góc khi chuyển từ 2 lên 3 hoặc 4 lên 5 luồng: luồng cũ bị đẩy lệch, làm damage mục tiêu đơn giảm khi thức tỉnh. Bậc 6 giữ góc lõi ±0,095 rad và thêm luồng giữa; biến chiêu quạt thêm hai góc ngoài ±0,6 rad.
- `fireburst/solar-burst` vẽ bằng Graphics theo phép chiếu chung và đúng bán kính nổ; phát trước damage để không mất khi kết liễu boss. Thời lượng 0,8 giây thực, có mức giảm hiệu ứng; không sửa asset nhân vật.

Profile, tu luyện, phần thưởng, trần thế giới và mở màn giữ cấu trúc hiện có. Bậc/thẻ/biến chiêu chỉ trong lượt, không cần chuyển bản lưu. Cơ duyên và cân bằng toàn hành trình thuộc mục 4/5 riêng.

## Phép đo cân bằng tái lập

Chạy `npm run test:awakenings`: 75 cặp bậc 5/6, gồm năm kỹ năng × ba nhánh (cơ bản/hai biến chiêu) × năm đội hình. Mỗi lượt 24 giây mô phỏng, seed 72, công kích 100, không chí mạng/tốc đánh/hỗ trợ/linh thú, mục tiêu bất động HP cao. Đội hình gồm một địch ở khoảng 3/6, cụm 12 địch, vòng tản 10 địch và đàn 20 địch. Script kiểm tra bậc 6 tăng ít nhất 50% ở mọi trường hợp bậc 5 có gây damage; vòng lửa ngoài tầm ở cả hai bậc được ghi rõ 0 thay vì chia cho 0.

| Cơ bản, một địch ở khoảng 3 | DPS bậc 5 | DPS bậc 6 | Hệ số |
| --- | ---: | ---: | ---: |
| Cương Quyền | 551 | 1196,25 | 2,171 |
| Nguyên Khí Trảm | 551 | 1123,75 | 2,039 |
| Dương Viêm Chưởng | 193,33 | 525 | 2,716 |
| Viêm Hoàn | 89,58 | 225,88 | 2,521 |
| Lôi Liên | 78,33 | 162,5 | 2,074 |

Đây là damage đo trong engine, gồm thời gian khởi động/di chuyển đạn. Không yêu cầu DPS một địch của năm kỹ năng bằng nhau: quyền/kiếm là vũ khí luôn mang, hỏa có nổ/đốt, vòng lửa đánh mọi địch trong vùng, lôi đánh rộng khi địch tản. Ví dụ đàn 20 địch: Quảng Vực bậc 6 đạt 4517,65 DPS, Song Liên 2275, Hồi Phong 3754,88. Báo cáo đủ điều kiện tại `qa/awakening-balance-report.json`; không dùng số này để tuyên bố đã cân bằng hành trình tu luyện ở mục 5.

## Kiểm tra tự động và trình duyệt

`tests/awakenings.test.ts` kiểm tra đủ năm liên kết, hỗ trợ tối thiểu/tối đa, chung Hỏa Linh, chọn thẻ thật và chặn thẻ cũ mất điều kiện, không bậc 7, giữ cả mười biến chiêu, reset lượt mới/không đổi Profile, chưởng thật/nổ một lần/không double hit, kết liễu boss, Hồi Phong hai chiều, Băng Sơn gộp, lôi xa/mười hoặc hai mươi mục tiêu, mô tả đúng nhánh, damage gần/xa và x1/x8/pause. Bộ kiểm tra cũ tiếp tục bảo vệ vòng lửa, đạn, chiến dịch, lưu và âm thanh.

Trang `qa/awakenings-audit.html` dùng Phaser scene/HUD/thẻ/pause thật với fixture và origin riêng, không đóng gói production. Có thể rút thẻ, kiểm tra thiếu hỗ trợ, chọn thức tỉnh và dừng theo khung để đối chiếu hiệu ứng với damage. Kết quả trình duyệt và kiểm tra bản build ghi tại `qa/awakenings-browser-qa.json`; ảnh tại `qa/screenshots/awakening-*.png`.

## Kết quả đợt 19–20/10/2026

- **141/141 kiểm thử đạt**, gồm mô phỏng hành trình sáu màn. TypeScript, Prettier, build production 1.6.0 và `git diff --check` đạt.
- **75/75 cặp cân bằng đạt**; các trường hợp bậc 5 gây damage đều vượt ngưỡng tăng 50% sau thức tỉnh. Bảng đầy đủ giữ cả các trường hợp ngoài tầm ở cả hai bậc.
- Đã chọn đủ năm thẻ thức tỉnh trong UI thật: Băng Sơn một luồng lớn, Hồi Phong ba kiếm, Tam Hoa năm chưởng/năm vụ nổ, Quảng Vực một sóng nhiệt và Song Liên hai chuỗi. Tooltip HUD giữ đúng tên thức tỉnh và tên nhánh. Đã xem riêng Lưu Hỏa ba vùng đốt và Tam Điệp ba nhịp trong lượt kiểm trước.
- Chưa kích hoạt Hỏa Linh: không có thẻ thức tỉnh; kích hoạt bậc 1: có một thẻ Kim Ô. Phím 1 chọn được, menu tiến độ chuyển sang bậc 6/đã thức tỉnh. Không yêu cầu hỗ trợ lên bậc 5.
- Trang QA cuối và production không có warning/error trong console. Cổng 4173 tải `/assets/index-CtogDnOP.js`; thư mục QA không nằm trong dist.
- Nhân vật chính giữ Thối Thể tầng 4, 196 linh thạch, 0 thắng/1 lượt; không bật test hoặc vào ải trên bản lưu chính. Tu vi tiếp tục tăng bởi idle bình thường.

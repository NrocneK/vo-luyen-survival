# Hỗ trợ test, camera và chiến đấu 1.2.1

Ngày kiểm tra: 18/10/2026.

## Cách sử dụng

Bấm **Hỗ trợ test** ở góc trái phía dưới, bật test tại lobby. Bản test lưu riêng ở `vo-luyen.profile.test.v1`; tiến trình chính giữ nguyên. Tắt test tại lobby để quay về nhân vật chính. Tải lại trang bắt đầu với test tắt; bật lại sẽ đọc bản test đã lưu.

| Công cụ | Tác dụng |
| --- | --- |
| +10.000 / +100.000 tu vi | Cộng trực tiếp, không tiêu tài nguyên |
| Thần Du đỉnh phong tầng 10 | Đạt trần ngay để thử kỹ năng/cảnh giới |
| Cấp trang bị / bản vẽ / linh thú | Toàn bộ đồ +5, thú bậc 5 đã tiến hóa; chọn mặc tại kho |
| Tài nguyên không giới hạn | Linh thạch, nguyên liệu và đan tự bù về 1.000.000 sau tiêu hao |
| Sát thương x1 / x10 / x50 / x100 | Áp dụng sát thương nhân vật và thú, trước chí mạng |
| Tốc độ x1 / x2 / x4 / x6 / x8 | Tăng thời gian mô phỏng; dừng ngay khi chọn thẻ, tạm dừng hoặc kết thúc |
| Mọi màn mở trong test | Bỏ cổng mở màn, không tự tạo thành tích thắng |
| Thử tiếng quyền / kiếm | Nghe hiệu ứng trực tiếp khi cài đặt âm thanh đang bật |

Trong màn có nút đổi tốc độ cạnh đồng hồ trên màn hình máy tính. Màn nhỏ dùng các nút trong bảng test. Hồi chiêu đan vẫn giữ; lượng đan luôn được bù khi bật tài nguyên không giới hạn. Tốc độ test không nhân thời gian tu luyện idle.

## Thay đổi gameplay

- Camera mặc định 1×, chỉnh 0,5×–3× theo bước 0,25×. Tỉ lệ thế giới, va chạm và tốc độ thật giữ nguyên.
- Đạn phe ta không còn thời hạn 1,5 giây. Bay theo đường đã phóng tới khi trúng đủ mục tiêu hoặc rời bản đồ cộng lề 2 đơn vị.
- Bậc 1–5 trúng 1–5 mục tiêu trực tiếp; bậc 6 xuyên không giới hạn trên đường bay. Mỗi mục tiêu chỉ nhận một lần sát thương từ cùng viên đạn. Linh vũ dùng bậc thú, tiến hóa tương ứng bậc 6.
- Va chạm quét cả đoạn di chuyển, ưu tiên mục tiêu gần trên đường bay. Chưởng lửa nổ một lần; trúng lan không tiêu lượt xuyên và không trúng lại từ chính viên đạn đó.
- Đạn địch giữ thời hạn ba giây; các viên còn lại được dọn khi kết thúc màn.
- Quyền, kiếm, hỏa, lôi, quái và va chạm có âm riêng. Âm thanh có giới hạn đồng thời, compressor và nhịp phát theo thời gian thực để dùng cùng x6/x8. Lần mở âm đầu chờ AudioContext sẵn sàng; tắt tiếng hoặc đóng game hủy âm đang chờ.

## Kiểm tra

**75/75 bài kiểm tra đạt**, TypeScript và build production đạt. Các kiểm thử mới nằm trong `testing.test.ts`, `simulationSpeed.test.ts`, `projectiles.test.ts` và `audio.test.ts`; các kiểm thử thế giới 1 tiếp tục đạt.

- Xác thực dữ liệu test, lưu riêng và phục hồi bản chính; thưởng và autosave không ghi vào bản chính khi đang test.
- Hệ số thời gian x4/x6/x8 tiến đúng tỉ lệ, dừng tại thẻ/tạm dừng/kết quả.
- Tầm bay dài, xuyên theo bậc, va chạm tốc độ cao, AoE không lặp, hệ số damage và hành vi linh thú.
- Chín kiểm thử âm thanh bao gồm mở âm lần đầu, mute, dispose, giới hạn nguồn và resume bị từ chối.
- Mô phỏng trọn hành trình từ nhân vật mới tới hết thế giới bằng phần thưởng thật vẫn thành công ở chế độ thường.

QA trình duyệt dùng cổng riêng **4182**: bật test từ nhân vật mới, cấp tu vi/đồ/cảnh giới, chọn x6/x100, vào Hạo Kiếp khi chưa có thành tích, chỉnh 0,5×, mở bảng khi lên cấp và khi đang chơi, dùng đan/rút lui, luyện đan với tài nguyên tự bù, tắt test trở lại nhân vật chính. Console không có lỗi/cảnh báo trong các thao tác này. Bản cổng 4173 giữ tiến trình thật và hiển thị bảng hỗ trợ test mới.

Biên bản và ảnh: `qa/test-support-browser-qa.json`, `qa/screenshots/test-support-1.2.1.png`.

## Các file chính

- `data/testing.ts`, `domain/testing.ts`, `GameBridge.ts`: cấu hình và lưu tiến trình test riêng.
- `advanceSimulation.ts`: chia bước tăng tốc, giữ điều kiện dừng của engine.
- `data/projectiles.ts`, `RunEngine.ts`: tầm bay, xuyên thấu, va chạm quét, hệ số sát thương và phát sự kiện âm.
- `data/camera.ts`: cấu hình thu phóng dùng chung cho scene/HUD.
- `data/audio.ts`, `Audio.ts`: mẫu âm và vòng đời Web Audio.
- `TestTools.tsx`: bảng điều khiển test; các hệ số không nằm trong Profile vĩnh viễn.

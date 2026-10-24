# Cơ chế riêng sáu màn — 1.4.0

## Phạm vi mục 1

| Màn | Cơ chế | Thông số chính |
| --- | --- | --- |
| Hắc Phong Sơn | Thú triều | Bắt đầu giây35, lặp65 giây; báo trước3 giây, tăng tốc địch25% trong10 giây |
| Truyền Thừa Động Thiên | Linh trận hộ thân | Bắt đầu24, lặp38 giây; trận tồn tại14 giây, tụ đủ3 giây để giảm30% sát thương trong10 giây |
| Cửu Âm Sơn Cốc | Độc chướng | Bắt đầu30, lặp11 giây; báo trước2,4 giây, trôi11 giây, sát thương theo nhịp0,8 giây |
| Ly Địa | Hỏa triều có khe | Bắt đầu32, lặp24 giây; báo trước3 giây, di chuyển6 giây; khe rộng2,6 đơn vị |
| Đoạt Đích | Tổ đội thế gia | Bắt đầu42, chuẩn bị3 giây; năm người gồm chỉ huy/hộ vệ, kiếm khách, pháp tu; hộ trận giảm35% sát thương cho đồng đội trong5 đơn vị |
| Hạo Kiếp | Ba nhịp giao tranh | Bắt đầu48, chu kỳ56 giây: chuẩn bị3, xung kích14, hắc ấn14, phản công12, nghỉ13 |

Sát thương môi trường dùng sinh lực tối đa làm cơ sở rồi qua giáp, Linh hộ và miễn thương/lướt hiện có. Không cộng tiền/tu vi hay sửa thuộc tính vĩnh viễn. Cơ chế dừng trong levelup/pause, đi theo mô phỏng x1–x8, dọn toàn bộ khi vào pha boss hoặc kết thúc run. Thời gian/mở màn/điều kiện thắng và quy tắc thưởng giữ nguyên.

## Các quyết định kỹ thuật

- `data/stageMechanics.ts` chứa toàn bộ lịch và thông số; `StageMechanics` quản trạng thái theo dt, không phụ thuộc Phaser/React.
- Luồng ngẫu nhiên môi trường được tách khỏi luồng chọn thẻ/chiến lợi phẩm bằng seed riêng.
- `stageZones.ts` là hình học dùng chung cho cảnh báo và va chạm, đặc biệt dải lửa có đầu phẳng để không lấn vào khe xanh.
- Formation sinh từ ngoài camera qua cùng hàm sinh quái thường. Nếu mép ngoài hình quá hẹp, dùng vị trí sát đội trưởng với khoảng lệch nhỏ để AI tách đàn, không rải thành viên sang cánh khác. Khi camera bao hết sân, cả đội xuất hiện tại biên với báo trước.
- Hạ đội trưởng hoặc rời bán kính bảo hộ làm giảm sát thương mất hiệu lực ngay. Chỉ giữ một đội trưởng đang hoạt động; dành năm ô sinh để không vượt giới hạn đàn quái.
- HUD nhận trạng thái theo tần suất hiện có; Phaser cập nhật vùng/nhãn mỗi frame. Thu/phóng khi tạm dừng cũng vẽ lại viền/nhãn để giữ độ rõ.

## Kiểm thử

```powershell
npm run test
npm run typecheck
npm run build
npm run check:format
```

`tests/stageMechanics.test.ts` bảo vệ khác biệt sáu màn, tốc chạy thực tế, yêu cầu tụ linh, giảm sát thương/giới hạn thời gian, mây trôi, cảnh báo không gây hại, khe lửa tại góc map, tổ đội/giới hạn quái/camera0,5×, phá bảo hộ, khóa vị trí hắc ấn, cửa sổ phản công, pause/levelup/x8 và dọn khi boss/rút lui.

Trang QA dev `/qa/stage-mechanics-audit.html` dùng ForestScene, GameHud và RunEngine của game. Fixture máu cao/địch đứng để soi tín hiệu; các phép đo sát thương và hành trình đầy đủ dùng test riêng theo luật thật. Trang QA không được đóng gói vào giao diện production. Báo cáo trình duyệt và ảnh nằm ở `qa/stage-mechanics-browser-qa.json` và `qa/screenshots/`.

## Kết quả ngày 19/10/2026

- 109/109 kiểm thử tự động đạt; TypeScript, production build 1.4.0 và định dạng mã đạt.
- Hai chiến dịch mô phỏng với camera 0,5× và 1× đều hoàn thành sáu màn, đạt cảnh giới 46 — Thần Du đỉnh phong tầng 10. Lần lượt 7 và 6 lượt chạy, tổng 21.246 lần địch xuất hiện; không có địch sinh trong vùng nhìn mà thiếu cảnh báo. Dữ liệu tại `qa/camera-spawn-campaign-report.json`.
- Đã quan sát sáu cơ chế qua trang QA dùng renderer thật: cảnh báo/hoạt động, tụ đủ Linh hộ, cờ đội trưởng và vòng bảo hộ, Hắc ấn và cửa sổ phản công. Khi chuyển boss, vùng môi trường và bảng cơ chế đã dọn.
- Trên production riêng tại cổng 4185, đã vào Ly Địa bằng tiến trình test, thu camera về 0,5× và quan sát Hỏa triều đang quét với khe xanh. Ảnh: `qa/screenshots/stage-mechanics-release-1.4.0.png`. Console của tab production mới không ghi nhận warning/error trong lượt kiểm tra.
- Đã tạm dừng, rút lui nhận 30% thưởng ở tiến trình test rồi tắt test tại lobby. Tiến trình chính trở về Thối Thể tầng 1, 180 linh thạch và 0 lượt lịch luyện; tu vi chỉ tăng chậm do idle. Không nhận cảnh giới, thưởng hoặc thành tích từ lượt test.

Mô phỏng xác nhận luật chơi và hành trình có thể hoàn thành; việc tinh chỉnh độ khó cho người chơi thật thuộc mục 5 trong lộ trình, chưa được coi là hoàn tất tại bản này.

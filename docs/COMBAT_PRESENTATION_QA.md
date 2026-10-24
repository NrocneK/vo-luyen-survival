# Kiểm tra trình bày chiến đấu — 1.3.0

## Phạm vi

- Viêm Hoàn: vòng lửa nền sau khi kích hoạt, bùng lửa khi đánh; bán kính renderer/sát thương cùng đọc `data/skillEffects.ts`.
- Lôi Liên: đường nối player → mục tiêu đầu → từng mục tiêu truyền. Điểm trúng giữ nguyên khi thêm nhiễu thị giác; hiệu ứng vẫn phát nếu đòn kết liễu boss.
- Hiệu ứng được giữ theo thời gian thực khi test tăng tốc. Cảnh báo sát thương giữ theo thời gian mô phỏng để không báo sai thời điểm.
- Quái sinh theo footprint camera cố định, có khoảng đệm đầu/vũ khí và bán kính actor. Ngoài hình được ưu tiên; khi không còn chỗ ngoài hình thì dùng biên map, cảnh báo/hiện hình 0,85 giây và chưa hành động trong khoảng đó. Áp dụng cho thường, tinh anh, boss, viện binh.
- Nội dung từng màn được tách trong `enemies.ts`/`stages.ts`; địch hình người dùng atlas v5 riêng. Hai màn cuối không dùng yêu thú ở wave/tinh anh/boss/triệu hồi.
- Nhạc dùng sáu chủ đề, tám ô nhịp với melody/bass/percussion; boss tăng nhịp. SFX có các biến thể quyền/kiếm, nguyên tố, phe địch và nhặt đồ. Chi tiết tại [COMBAT_AUDIO_QA.md](COMBAT_AUDIO_QA.md).

## Cách tự kiểm tra lại

```powershell
npm run test
npm run typecheck
npm run build
npm run check:format
node --experimental-strip-types qa/cameraSpawnSimulate.ts
```

Trang QA chỉ chạy trong dev, không nằm trong giao diện/bản build game:

- `/qa/combat-audit.html`: dùng chính ForestScene/RunEngine, fixture có máu cao để giữ mục tiêu và chụp đồng thời vòng lửa/chuỗi sét. Nút bắt khung chạy engine tới thời điểm có hai hiệu ứng thật rồi tạm dừng; không chèn ảnh minh họa.
- `/qa/audio-audit.html`: phát thử, đo OfflineAudioContext 48 kHz stereo, kiểm peak/RMS và mẫu tràn khi nhạc/hiệu ứng chồng.

`tests/skillEffects.test.ts`, `tests/spawnView.test.ts`, `tests/presentationGeometry.test.ts` và các kiểm thử âm thanh bảo vệ vùng sát thương, chuỗi trúng, zoom 0,5×–3×, mép/góc map, x8, mute/dispose và chuyển chủ đề. Báo cáo mô phỏng camera tại `qa/camera-spawn-campaign-report.json`; ảnh/đo trình duyệt được ghi riêng sau kiểm tra trực tiếp.

## Kết quả ngày 19/10/2026

- 96/96 kiểm thử đạt; TypeScript, build production, Prettier và `git diff --check` đạt.
- Mô phỏng kinh tế/chiến đấu thật hoàn tất sáu màn ở cả camera 0,5× và 1×, tới cảnh giới 46; không có lần sinh quái đang thấy mà thiếu báo trước.
- Kiểm tra trực tiếp renderer tại camera 0,5×/1× và tốc độ x1/x8: vòng lửa, đường nối sét và actor v5 hiển thị, không có lỗi console. Ảnh kiểm tra được lưu trong `qa/screenshots/`.
- OfflineAudioContext đo 15 đoạn đạt miền âm lượng, 0 mẫu vượt 0,99; giao tranh dày đạt peak −6,7 dBFS và RMS −22,1 dBFS. Đây là phép đo kỹ thuật, không thay cho sở thích âm nhạc của người chơi.

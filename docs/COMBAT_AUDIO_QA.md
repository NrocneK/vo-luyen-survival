# Âm thanh chiến đấu và nhạc theo màn

Bộ âm thanh tổng hợp bằng Web Audio, không cần tải file ngoài. `src/data/audio.ts` chứa tiếng xuất đòn, va chạm và thông báo; `src/data/music.ts` chứa các câu nhạc, nhạc cụ và nhịp. `GameAudio` chỉ quản lý lịch phát, bus và vòng đời node.

## Thiết kế

- Lăng Tiêu Các: dây gảy, nền hòa âm và chuông gió thưa, 78 BPM.
- Hắc Phong Sơn: sáo, dây gảy và trống gỗ, 116 BPM.
- Truyền Thừa Động Thiên: chuông, âm gõ đá, 110 BPM.
- Cửu Âm Sơn Cốc: dây gảy, thang âm tối và nhịp gõ khô, 120 BPM.
- Ly Địa: trống trầm dày, dây gảy và bass, 128 BPM.
- Trung Đô — Đoạt Đích: sáo và trống trận, 132 BPM.
- Trung Đô — Hạo Kiếp: chuông tối, trống trận và bass, 138 BPM.
- Boss tăng thêm 14 BPM và thêm trống dồn. Mỗi chủ đề có câu nhạc tám ô nhịp, có khoảng nghỉ, câu đáp, chuyển hòa âm và fill cuối câu. Cường độ giao tranh bổ sung nhịp gõ; không nhân nhạc theo tốc độ vượt ải.
- Quyền và kiếm luân phiên ba mẫu động tác. Hỏa chưởng, Viêm Hoàn, linh vũ, Lôi Liên có tiếng riêng; vũ khí của địch, tiếng boss, nhặt đồ và thất bại có phản hồi riêng.

## Tích hợp

```ts
audio.setContext({ screen: 'battle', stageId: 'trung-do-doat-dich', intensity: 0.6 });
audio.activate(settings.sound, settings.music);
audio.play('cast-chain-lightning');
```

`screen` nhận `lobby`, `battle`, `boss`, `result`. Đổi cường độ không khởi động lại câu nhạc. Đổi màn/phase thay nhạc. Thao tác người dùng vẫn là điểm mở AudioContext; nhạc và hiệu ứng có bus riêng.

Lịch nhạc dựa trên `AudioContext.currentTime`, nhìn trước 180 ms và kiểm tra mỗi 100 ms. Khi tab bị trễ, bỏ các ô nhịp đã lỡ để tránh phát dồn. Tối đa bốn nhóm ô nhịp còn hoạt động và 12 tiếng hiệu ứng; tiếng quan trọng có quyền thay tiếng nhỏ. Cooldown dùng thời gian thực. Compressor và master giới hạn tổng biên độ; nhạc hạ ngắn khi nhận sát thương, lên cấp, xuất hiện boss và kết thúc trận.

## Kiểm tra

`tests/audio.test.ts` và `tests/music.test.ts` kiểm tra cooldown ở tốc độ cao, ba biến thể, tính hợp lệ của envelope, khác biệt giữa các màn, thay phase, hai bus, mở âm lần đầu, tab nền và dọn node.

Trang nội bộ `/qa/audio-audit.html` trên Vite dev server dùng chính GameAudio với OfflineAudioContext stereo 48 kHz. Nút **Đo toàn bộ âm thanh** đo 15 đoạn: lobby, sáu màn × hai phase, giao tranh dày và chuỗi động tác. Trang hiển thị peak/RMS, số mẫu vượt 0,99, dạng sóng, bản nghe và có nút lưu báo cáo JSON. Phép đo biên độ xác nhận miền kỹ thuật; việc nghe nhịp, âm sắc và độ rõ giữa các lớp được kiểm tra riêng trên các nút nghe trực tiếp.

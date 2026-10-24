# Khôi phục bản Thông Huyền — 24/10/2026

Người dùng yêu cầu dừng nâng cấp nhân vật, khôi phục bản Thông Huyền và đẩy mã lên repository; sẽ tìm nguồn spritesheet mới trước khi tiếp tục đồ họa.

## Phạm vi bản 2.3.1

- Giữ gameplay hiện có: sáu màn Trung Đô, 14 màn Thông Huyền, cổng truyện/cảnh giới, kỹ năng, vật phẩm và giao diện lobby/HUD survival.
- Đưa nhân vật về catalogue v9 trước đợt chuyển pixel: hai mode quyền/kiếm, tám hướng, 100 pixel/đơn vị, lọc LINEAR. Dùng lại PNG/atlas đã có; không sản xuất đồ họa mới.
- Bỏ các nhánh chọn lớp pixel trong PlayerView và chân dung PNG pixel. Công cụ đồng bộ chỉ nhận v9 đã ghim hash.
- Giữ Profile v3 và bảy ô runtime; không chuyển save, xóa đồ, thay chỉ số hoặc đụng localStorage của người dùng. Thiết kế bốn ô tiếp tục được giữ trong tài liệu để xem lại khi có nguồn mới.
- Các bộ thử nhân vật và gói xuất cũ ở máy được giữ riêng, không đưa vào bản commit khôi phục. Bản sao 11 file trước khi sửa nằm tại `.local-backups/before-thong-huyen-restore-2026-10-24/`. Hai thư mục asset pixel v10/v11 cùng cache runtime cũ được chuyển nguyên vẹn vào `.local-backups/retired-pixel-runtime-2026-10-24/`; cache bản chơi được sinh lại từ v9.

Git trước công việc này chỉ có bản 1.1 ở HEAD. Đây là bản chốt mã gameplay Phần 2 đang có cùng việc trả nhân vật về bộ trước pixel; không phải checkout một commit 2.3.0 tồn tại sẵn. Không dùng reset để làm mất các thay đổi Phần 2.

## Kiểm tra

- TypeScript: đạt.
- 222 kiểm thử logic: đạt. `npm test` tự đồng bộ asset trước kiểm thử để chạy được sau khi clone, không phụ thuộc cache `public/game` của máy cũ.
- Build production: đạt; có cảnh báo kích thước bundle Phaser, không có lỗi build.
- Asset runtime được đưa đủ vào Git và giữ nguyên byte qua `.gitattributes`, tránh Git đổi CRLF/LF làm sai hash atlas trên máy khác.
- Chrome/WebGL trên 1440 × 900 và 390 × 844: lobby → mặc đủ bảy món/chuyển quyền sang kiếm → thấy đủ 14 màn Thông Huyền → vào Sa Thành, di chuyển/pause → rút lui → căn cứ. Tải atlas v9 cho cả hai mode, không tải v10/v11, không có lỗi JavaScript/HTTP; save chính trong browser profile kiểm thử được giữ nguyên. Xem `qa/thong-huyen-restore-qa.json` và script `qa/restoreThongHuyen.cjs`. Script cần Playwright/Chrome sẵn có; có thể đặt `NODE_PATH`, `CHROME_PATH` và `QA_URL` theo môi trường.

Không diễn giải các phép kiểm tra này thành việc người dùng đã duyệt thẩm mỹ bộ nhân vật cũ. Chỉ tiếp tục công việc đồ họa khi người dùng cung cấp nguồn spritesheet mới và yêu cầu làm tiếp.

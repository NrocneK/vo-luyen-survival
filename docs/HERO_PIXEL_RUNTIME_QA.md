# Dương Khai pixel — bản tích hợp 2.4.0

**Lịch sử:** ngày 23/10/2026 người dùng gửi video và bác kết luận ngoại quan 2.4.0. Những số liệu bên dưới chỉ chứng minh các kiểm tra kỹ thuật đã chạy, không chứng minh phối đồ nhìn đúng. Bản hiện hành là **2.4.1 / atlas v11**; đọc `HERO_PIXEL_2_4_1_FIX.md` và báo cáo so ảnh trong game theo chuỗi video.

Ngày 22/10/2026, người dùng yêu cầu hoàn thiện toàn bộ rồi đưa vào game chơi thử. Chỉ đạo này thay bước chờ duyệt mẫu tĩnh ở các ghi chú trước. Dương Khai hiện dùng v10 trong lobby và trận; địch, thú, nền và VFX giữ bộ hiện có.

## Nội dung

- Cơ thể nền chỉ mặc quần cộc, tám hướng thật, nguồn riêng từng hướng; không mirror, không lấy cơ thể của bộ Engvee hoặc 3D đã bị bác.
- Hai bộ quyền/kiếm, tám clip mỗi bộ: đứng, đi, chạy, chịu đòn, ba đòn tấn công và ngã. Kiếm có chu kỳ giữ tay riêng khi bước/chạy và tư thế kiếm ấn. Nhịp di chuyển đi theo quãng đường; tư thế tiếp xúc vẫn ánh xạ nửa nhịp sát thương engine.
- Toàn bộ **27 món hiện có**, thuộc bảy ô, có PNG lớp theo ID/tư thế/hướng. Bốn bộ thân khác kết cấu và tà áo, dùng nguồn riêng; đầu, tay, chân, trang sức, bí bảo và vũ khí là lớp độc lập. Không dùng đổi màu theo tier để thay ngoại quan món khác.
- Áo gồm quần/tay áo/găng vải. Tháo áo trả cơ thể nền; hộ uyển/quyền sáo ghép bên trên. Sáu ô phụ có nút **Tháo trang bị**; vũ khí đổi qua món khác để giữ bộ chiêu. Mọi phép mặc/tháo vẫn đi qua Profile.equipped.
- Bí bảo chỉ hiện khi mở ô. Nhập Ma tô cả bảy lớp, hết hiệu lực trả màu. Cánh tiếp tục đọc neo lưng của pose. Tử trận phát ba pha 26→27→28 rồi giữ cuối; rút lui không ngã.
- Khung logic 256 × 256, neo chân `[128,209]`, cơ thể đứng khoảng 104 pixel cao; **50 pixel/đơn vị**, NEAREST và căn vị trí pixel. Atlas trim/dedup, chỉ giữ một mode sau khi đổi quyền/kiếm. Chân dung UI cũng lấy PNG v10.

Profile vẫn v3, không có trường skin mới. Giữ tài sản/tiến trình/tu vi dư, cổng truyện, chỉ số trang bị, sát thương, kỹ năng và kinh tế. Không chuyển toàn bộ môi trường hoặc địch sang pixel trong đợt này.

## Nguồn và sửa hình

Nguồn/prompt ở `art/hero-pixel-runtime/source/`, các bước tái tạo trong README cùng thư mục. `extract_body.py` tách hình thật và căn khung; `extract_sword_gait.py` thêm chu kỳ giữ kiếm; `materialise.py` xuất lớp theo pose; `pack_runtime.py` tạo catalogue v10; `verify_catalogue.py` kiểm tra khứ hồi trước tích hợp.

Đã xem bảng bốn áo/tám hướng, các chuỗi đi/chạy/quyền/kiếm/ngã, ảnh renderer Phaser và ảnh game thực. Các sửa hình trong lần rà cuối:

1. Thay nguồn SW idle/walk sai hướng và nguồn S bị sát mép, giữ đủ cơ thể.
2. Tạo riêng dáng giữ kiếm, sửa nguồn N thành lưng thẳng, không dùng góc chéo giả lưng.
3. Giữ tóc/mặt, bỏ các lỗ da sai vị trí trên tay áo, sửa neo kiếm ở chém ngang và đâm.
4. Không dùng khung ngã 29 đổi phía đột ngột; hiệu chỉnh điểm chân 28 theo pixel nguồn để giày không nổi rời cơ thể.

`qa/visual-review.json` ghi bộ ảnh đã xem và chữ ký atlas tương ứng. Đây là QA nội bộ, không tự coi là người dùng đã duyệt thẩm mỹ.

## Kết quả kiểm tra

- **8.512 phép hoàn nguyên lớp** từ atlas khớp PNG nguồn trên cả nền trắng và đen; 27/27 ID có ngoại quan riêng. Catalogue 6.526 frame trim, năm trang atlas; bộ nhớ giải nén quyền **36 MiB**, kiếm **24 MiB**. Báo cáo `art/hero-pixel-runtime/qa/atlas-parity.json`.
- `qa/pixelHeroBrowser.cjs`: **384 trạng thái** tư thế/hướng trong PlayerView thật, không lật ảnh, neo mọi lớp thống nhất, đổi mode giải phóng đúng bộ cũ và giữ cổng bí bảo. Báo cáo browser ràng cùng chữ ký atlas; sau đó mới cho phép validate/sync.
- `qa/pixelHeroGame.cjs`: **chín nhóm đạt**, thao tác kho thật đủ bảy món, tháo/mặc áo, đổi bốn áo, di chuyển bằng phím, pause giữ pose/thời gian, đúng tỉ lệ thế giới, Nhập Ma, ngã giữ cuối, rút lui và menu điện thoại. Không thay khóa lưu chính.
- `qa/pixelHeroProduction.cjs`: bản build ở **1440 × 900** và **390 × 844** đi qua lobby → mặc bảy món → vào trận/di chuyển/tạm dừng → rút lui → căn cứ. Tải atlas v10, không lỗi JavaScript/HTTP, giữ save chính. Ảnh tại `art/hero-pixel-runtime/qa/game/production-*.png`.
- **222/222 kiểm thử đạt**; TypeScript, kiểm định dạng và build đạt. Build có thông báo kích thước chunk Phaser lớn hiện hữu; không chặn chạy.

Game chính: `http://127.0.0.1:5173/`. Các trang `qa/` dùng cho kiểm tra nội bộ, không thay game chính. Không commit/push hoặc xuất bản trong đợt này.

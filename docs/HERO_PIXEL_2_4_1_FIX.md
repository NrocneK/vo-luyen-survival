# Sửa ngoại quan theo video ngày 23/10/2026

Video người dùng: `Võ Luyện · Thông Huyền Đại Lục - Cốc Cốc 2026-10-23 18-39-20.mp4`, dài 64,13 giây, 1920 × 1052. Người dùng bác kết luận “đã thử đạt” của bản 2.4.0. Các kết quả khứ hồi atlas, ID/neo và unit test trước đó không chứng minh việc phối đồ nhìn đúng.

## Nguyên nhân và thay đổi 2.4.1

1. **Khoảng 32–48 giây:** thay quyền sáo nhưng vẫn nhìn chủ yếu thấy hộ uyển vàng. Cả hai ô dùng cùng điểm gắn, hộ uyển vẽ sau vũ khí. `equipmentLayerOrder()` nay đặt hộ uyển trước vũ khí; nguồn có hai điểm riêng: tâm nắm đấm và đoạn cẳng tay.
2. Hàm cũ cắt hai nửa trái/phải của **icon chứa hai món chồng nhau**, dẫn đến mảnh bị cắt, lẫn phần món bên cạnh và khó nhận dạng. Bộ mới có **96 mảnh riêng**: bốn quyền sáo và hai hộ uyển × tám hướng × hai tay. Nguồn, prompt, ảnh gốc ở `art/hero-pixel-runtime/source/hands-v11/` và JSON cùng thư mục source.
3. Huyền Thiết Quyền Sáo trước dùng lại ảnh Đồng Quyền Sáo và đổi kích thước. Nay dùng nguồn găng sắt đen có tấm khớp ngón riêng; Đồng là đồng/da, Liệt Dương là đỏ–vàng có mặt trời, Thánh Nguyên có ngón ngà và giáp vàng. Đây là các mảnh dùng thật trong game.
4. Điểm bàn tay hướng W đứng bị đặt lên cẳng tay. Bản sửa hiệu chỉnh vị trí đó, các tâm bàn tay/hộ uyển trong chu kỳ chạy và phần tay khuất sau thân. `source/hand-anchors-v11.json` giữ hiệu chỉnh; `fit_hands_v11.py` thêm trường cổ tay vào dữ liệu sản xuất, không thêm vào Profile.
5. Rà tư thế đánh phát hiện điều kiện lọc điểm tay bỏ mất nắm đấm ở phía trên ngực khi nhìn từ N/NE. `extract_body.py` sửa điểm cuối ở đòn 13/16/25; nắm đấm/chuôi kiếm đi theo tay duỗi hết.
6. Runtime xuất sang **atlas v11**, đổi đường dẫn và key để trình duyệt không dùng lẫn atlas v10 trong bộ nhớ đệm. Vẫn tám hướng thật, 50 pixel/đơn vị, NEAREST, hai mode. Không đổi chỉ số, damage, kinh tế, Profile v3 hoặc quyền mở bí bảo.

## Kiểm tra đúng lỗi

- `check_equipment_visibility.py` phối ảnh hoàn chỉnh với áo và hộ uyển rồi mới so vũ khí. Kiểm tra cả phần quyền sáo lẫn phần hộ uyển còn nhìn thấy; không dùng hash của lớp PNG độc lập làm bằng chứng ngoại quan khác nhau.
- `pixelEquipmentVideoRegression.cjs` thao tác giao diện thật ở **1920 × 940**, tương ứng vùng nội dung trong video: xoay tám góc, tháo Võ Phục, mặc Huyền Giáp, thử bốn quyền sáo khi vẫn đeo Kim Cương Hộ Uyển, đổi Hộ Mạch Uyển, Huyền Linh/Thánh Nguyên Chiến Y rồi vào trận.
- Khi so bốn quyền sáo, cố định hướng và khung đứng. `check_video_regression.py` chỉ so các vùng bàn tay của ảnh chụp renderer thật, tránh lấy thay đổi icon, chữ, pose hoặc linh thú làm khác biệt giả.
- Xem trực tiếp ảnh sau phối, ảnh trong game và các bảng chuỗi đi/chạy/đánh. `qa/user-report-2026-10-23/` giữ video đã trích khung, ảnh trước/sau và các thao tác đã chụp; đây là hồ sơ nội bộ, không phải bản preview thay game.

Các báo cáo hiện hành: `art/hero-pixel-runtime/qa/equipment-visibility.json`, `video-regression.json`, `qa/pixel-hero-browser-qa.json`, `qa/pixel-hero-game-qa.json`, `qa/pixel-hero-production-qa.json`. Kết quả kiểm tra chỉ áp dụng các điều kiện đã ghi, không tự coi là người dùng đã duyệt chất lượng mỹ thuật tổng thể.

## Kết quả trên atlas cuối

- Chữ ký: `e8f29b1acd2e3fcb1df49ad6382f346adc67e55c1f38a21d1b087e51e15aece5`.
- 4.608 ảnh phối nguồn được kiểm: các cặp quyền sáo khác tối thiểu 55 pixel native sau phối; phần vũ khí còn nhìn thấy tối thiểu 98,64%, hộ uyển vẫn còn phần hiển thị riêng.
- Lặp video bằng UI thật: 46 trạng thái được chụp, 48 cặp vùng bàn tay được so; thay quyền sáo khác tối thiểu tương đương 102,65 pixel native trong renderer. Đã xem hai bảng ảnh game tám hướng và các chuỗi chạy/đấm sau sửa, không lấy khác biệt icon làm bằng chứng.
- Chín nhóm trong game và bản production ở 1440 × 900 / 390 × 844 chạy qua; 222 kiểm thử, TypeScript, định dạng và build qua. Các con số này bổ sung cho kiểm tra đúng lỗi trong video, không thay nhận xét mỹ thuật.

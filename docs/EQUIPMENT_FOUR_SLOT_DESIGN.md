# Thiết kế trang bị bốn ô — quyết định ngày 23/10/2026

Theo chỉ đạo người dùng, hướng phát triển mới thay hệ bảy ô bằng:

| Ô | Ngoại quan | Phạm vi |
| --- | --- | --- |
| Vũ khí | Có | Quyền sáo hoặc kiếm; ảnh vũ khí riêng |
| Trang phục | Có | Một bộ gộp đầu, áo, quần, ống tay và giày |
| Trang sức | Không | Chỉ ảnh hưởng chỉ số |
| Bí bảo | Không | Chỉ ảnh hưởng chỉ số, tiếp tục giữ cổng mở ô khi triển khai gameplay |

Trang phục xuất dưới dạng nhân vật nguyên hình, đã mặc đúng đồ. Thay trang phục đổi bộ sprite nguyên hình, không bóc cổ/vai/tay/quần/tà để kéo ráp vào một cơ thể khác. Vũ khí dùng lớp độc lập, với điểm gắn đo trên đúng pose/hướng của trang phục tương ứng. Trang sức/bí bảo không sinh lớp hình trên người.

Mỗi kiểu dùng vũ khí có thể cần các tư thế cầm/đánh khác nhau (quyền và kiếm). Chưa lấy việc đứng tĩnh làm bằng chứng đã giải quyết hoạt ảnh. Hướng sản xuất dự kiến là bộ nhân vật theo trang phục và kiểu động tác, cộng các ảnh vũ khí và điểm gắn; tránh vẽ sẵn toàn bộ phối hợp từng món.

## Demo tân thủ đang xin duyệt

`art/hero-starter-four-slot/demo/index.html` dùng **Võ Phục tân thủ + Đồng Quyền Sáo**, tám hình đứng; có xem gần, cỡ gốc và đeo/tháo vũ khí. Trang phục có tóc buộc cao, cổ chéo viền ngà, đai đỏ, quần tối và giày vải; không có ô đầu/tay/chân rời. Trang sức/bí bảo để trống trong demo, không giả lập thưởng chỉ số.

Đây là mốc tạo hình trước tích hợp. Game chính vẫn 2.4.1, save v3 và runtime bảy ô cũ. Chưa ghi lại Profile hoặc di chuyển/xóa món đang có. Việc triển khai bốn ô thực sự, chuyển đổi đồ cũ, phân bổ chỉ số và giao diện game sẽ được làm sau khi duyệt mẫu; phải bảo toàn tiến trình/tài sản/tu vi dư và kiểm riêng phần chuyển save. Không tự xem demo này là phê duyệt chuyển đổi dữ liệu.

## Mốc hoạt ảnh ngày 24/10/2026

Người dùng đã chấp nhận vị trí găng sau sửa v2 và yêu cầu làm lại tạo hình găng, hoàn tất sáu hoạt ảnh rồi gửi demo. `art/hero-starter-animation/demo/` có đứng nghỉ, đi, chạy, liên quyền ba nhịp, trúng đòn và ngã; tám hướng riêng, tổng 320 khung. Găng mới là lớp vải xanh sẫm/giáp đồng mỏng theo đúng từng crop tay của bộ trang phục, không co/xoay ảnh găng đứng tĩnh.

Mỗi hướng có hai atlas nguyên ô, trang phục và vũ khí; ô 320, neo `[160,244]`. Các bộ trang phục tiếp theo cần giữ cùng tư thế và vị trí bàn tay để dùng lại lớp vũ khí; thay hình thể/tư thế phải kiểm lại độ khớp. Đã có demo thành phẩm cho mốc hoạt ảnh, chưa sửa hệ bốn ô trong game hoặc dữ liệu lưu. Xem README và hồ sơ kiểm trong thư mục mới.

# Quy chuẩn hình ảnh và hoạt ảnh — isometric

Bộ asset MVP v3 được xuất bằng rig 3D cho actor và giữ các hình tĩnh đã sản xuất. Tất cả sprite runtime dùng PNG và metadata để tích hợp game 2D. Tạo hình hiện tại được người dùng tạm duyệt để triển khai gameplay; nâng cấp đồ họa thực hiện ở đợt sau.

## Tạo hình

Dương Khai mặc áo xanh đen, cổ áo sáng, đai đỏ, tóc đen buộc cao, bao tay đồng và ủng nâu; có bản quyền và bản kiếm. Quái thường màu dịu, tinh anh có dấu hổ phách, boss có tinh thể đỏ. Sủng vật có bản thường và tiến hóa với silhouette riêng. Nền Hắc Phong Sơn dùng xanh rêu, đất nâu và đá xám; kỹ năng dùng vàng cam/lam ngọc, cảnh báo boss dùng đỏ.

## Camera và bước đi

- Camera isometric orthographic cố định 35,264°. Chỉ xoay actor trên mặt đất để tạo 8 hướng; không xoay/lật một ảnh ngang thành hướng mặt/lưng.
- Điểm neo và pixel trên đơn vị thế giới ổn định trong cả bộ pose của mỗi actor.
- Người có hai chân lệch nửa chu kỳ, IK gối và bàn chân bám nền ở pha chống; hông chuyển trọng lượng, tay đánh ngược chân dẫn, tóc/tà áo phản ứng theo bước.
- Quái bốn chân dùng nhịp 4 chân và pha chống dài, cóc dùng nhảy với bàn chân riêng, chim dùng cánh có khớp và chu kỳ bay.
- Chu kỳ đi 12 frame, 0,8 giây tại tốc độ chuẩn. `walk.worldSpeed` là dữ liệu ghép animation với chuyển động; tốc độ thay đổi thì fps thay đổi cùng tỉ lệ.
- Đòn quyền/kiếm của Dương Khai có chuẩn bị và thu đòn; tay giữ chiều dài khớp trong đòn đánh. Ngã xuống chạy một lần và được đặt trên mặt đất.

## Bộ đòn

Quyền: trái thẳng, phải chéo, trái móc lên. Kiếm: chéo thuận xuống, chéo ngược lên, quét ngang. Mỗi sinh vật có 3 đòn theo loài, boss có 4 đòn cào trái/cào phải/vồ/gầm. Cắn và gầm dùng hàm có khớp riêng. Mọi đòn giữ cùng pose nối và tám hướng; xem `ATTACK_DESIGN.md`.

## Xuất và kiểm tra

- PNG actor RGBA có alpha 0/255, cạnh pixel và bảng màu nhất quán; hiệu ứng dùng alpha mềm khi cần.
- Cùng camera, scale và canvas cho toàn bộ frame; khung tính từ toàn bộ pose/hướng để không mất chi khi đánh hoặc ngã.
- Atlas hash JSON có frame cắt alpha, spriteSourceSize, pivot, sourceSize và meta; đọc bằng tên frame thay vì giả định số hàng.
- Xem chuyển động tại chỗ, trên nền di chuyển, 1×/3×, tốc độ thường/chậm và từng khung. Bảng các pha chân là một phần kiểm tra, không thay cho animation.
- Kiểm tra vị trí bàn chân từ bone thực, độ lệch khi cộng root movement, tên/hướng và khép vòng.
- Kiểm tra PNG/atlas, alpha, file tham chiếu và texture; kiểm tra trực tiếp trình duyệt trước đóng gói.
- Chỉ bàn giao thành phẩm đã sửa và kiểm tra xong, theo yêu cầu người dùng ngày 13/10/2026. Bản thử giữ riêng trong dự án.

## Tổ chức nguồn

`build_duong_khai.py` và `build_creatures.py` dựng model/pose; `rig_helpers.py` quản lý camera, IK, framing, action; `attack_library.py` quản lý các đòn và mốc ra đòn; `toon_materials.py` quản lý bảng màu/ánh sáng; exporter tạo PNG/atlas; validator kiểm tra dữ liệu. Các `.blend` có skeleton và action, có thể chỉnh bằng Blender.

Âm thanh thuộc giai đoạn 6 theo GDD. Cảnh giới/XP, kỹ năng, luyện đan, luyện khí và sủng vật là hệ thống gameplay của các giai đoạn tiếp theo; giai đoạn 0 tập trung toàn bộ hình ảnh của MVP.

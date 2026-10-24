# Hướng đồ họa đã duyệt — Tiên hiệp 2.5D

Ngày 16/10/2026, người dùng duyệt **mẫu số 2 — Tiên hiệp 2.5D** sau khi xem sprite sheet và hoạt ảnh của bốn phương án. Đây là hướng đồ họa chính cho đợt nâng cấp game.

## Chuẩn hình ảnh

- Dương Khai: tóc đen buộc cao, trường bào xanh trầm, đai đỏ, cổ áo sáng, hộ oản vàng đồng và ủng nâu. Giữ khuôn mặt, tỷ lệ và chi tiết trang phục nhất quán trong mọi khung.
- Chất liệu có sắc độ và nét vẽ mềm của hướng đã chọn; giữ chi tiết rõ ở kích thước chơi thực tế. Xuất sprite 2D nền trong suốt, dùng lọc tuyến tính (`LINEAR`) và `pixelated: false` cho sprite bộ dựng mới khi tích hợp.
- Camera isometric cố định, tám hướng thật S/SW/W/NW/N/NE/E/SE. Mọi lớp dùng cùng phép chiếu và điểm chân.
- Nhân vật, quái, boss, sủng vật, trang bị và môi trường tiếp theo được phát triển đồng bộ theo hướng này. Hoàn thiện và kiểm tra từng nhóm trước khi tích hợp.

## Nguồn dựng mới và dữ liệu cho đợt nâng cấp

Nguồn hiện hành nằm trong [art/duong-khai-rebuild/README.md](../art/duong-khai-rebuild/README.md): mesh cơ thể, trang phục, tóc, kiếm và rig 3D mới, sau đó render thành sprite 2D. Hình học và xương tạo tư thế; chất liệu đi theo mesh. Bản `fresh-3d-10759de3137b` đã qua các cổng kiểm tra nội bộ ngày 18/10/2026; chứng cứ tại [QUALITY_GATE.md](../art/duong-khai-rebuild/QUALITY_GATE.md). Đây chưa phải bước thay actor trong game.

Mở `art/duong-khai-rebuild/MO_DUONG_KHAI.cmd` để xem `PREVIEW.html` trực tiếp bằng trình duyệt. HTML nhúng manifest và đọc PNG trong `export/` cùng thư mục; xem trên máy khác cần lấy cả bộ. Server HTTP là tùy chọn cho phát triển.

Đợt tích hợp đọc `art/duong-khai-rebuild/export/manifest.json` của đúng bản xuất:

| Nhóm clip | Kích thước ô | Vùng thế giới mỗi ô | Mật độ |
| --- | --- | --- | --- |
| Quyền, trừ ngã | 320 × 320 px | 3,2 × 3,2 | 100 px/đơn vị |
| Kiếm, trừ ngã | 448 × 448 px | 4,48 × 4,48 | 100 px/đơn vị |
| Ngã của cả hai nhóm | 448 × 448 px | 4,48 × 4,48 | 100 px/đơn vị |

Mỗi clip có `frameSize`, `anchor`, `pixelsPerUnit`, `count`, `columns`, `rows`, `durationSeconds`, `loop`, `previewLoop` và `impactFrames`. Neo chuẩn hóa đọc theo từng clip; các khổ ảnh cùng mật độ pixel nhưng có neo khác nhau. Lấy nhịp bước từ `locomotion` của clip đi/chạy và phép chiếu trong manifest. Bóng từng khung nằm trong `directions[hướng].shadowFrames`. Hai nhóm đều có đi, chạy, thủ, ba đòn riêng, liên hoàn, trúng đòn và ngã; chỉ quyền có idle, kiếm dùng thủ. Ba đòn kiếm nối theo tư thế kết thúc, không về thủ giữa đòn. Chạy dùng chu kỳ 0,64 giây/tốc độ 1,75 đơn vị/giây. Ngã phát một lần rồi giữ cuối.

## Mẫu tham chiếu và dữ liệu lịch sử

Các nguồn dưới đây lưu lựa chọn màu sắc/trang phục và quy cách của bản trước. Sau phản hồi loại bộ cutout ngày 16/10/2026, chúng không còn là chuẩn phê duyệt hình thể hay nguồn để biến dạng thành hoạt ảnh. Mesh và rig mới được xây độc lập trong `art/duong-khai-rebuild/`; kích thước/neo xuất mới phải lấy từ manifest mới.

- Tạo hình tám hướng của bài thử: `art/motion-style-study/sources/registered-style-2.png`.
- Manifest/sprite lịch sử: `art/motion-style-study/samples/style-2/manifest.json`.
- Hoạt ảnh quyền của bài thử: `art/motion-style-study/samples/style-2/combat-v2/`.

Kích thước ô, neo, mật độ pixel và số khung của bài thử chỉ mô tả dữ liệu lịch sử đó. Thông số tích hợp đợt nâng cấp lấy từ manifest bộ dựng mới ở phần trên.

## Chuẩn chuyển động

Đi bộ đổi chân, gập gối, nhấc chân và tiếp đất rõ. Đòn quyền có thế thủ, đổi tay, phát lực từ chân–hông–vai và thu tay. Kiếm cần tối thiểu ba đường kiếm riêng; quái và boss có bộ đòn nhận diện rõ. Giữ nguyên kích thước đầu/ủng và sự liền mạch của cổ, vai, thân; xử lý phần áo bị che trước khi nâng tay.

Kiểm tra cả phát bình thường, phát chậm, từng khung, mặt/lưng/ngang/chéo và nền di chuyển. Kiểm tra định dạng PNG hoặc số lượng khung là bước bổ sung cho việc xem chuyển động.

## Trình tự áp dụng

1. Hoàn thiện bộ Dương Khai từ mesh và rig 3D mới theo hướng tiên hiệp 2.5D: đi/đứng, thế thủ, quyền, kiếm, trúng đòn và bị hạ; đồng bộ hiệu ứng với điểm chạm.
2. Hoàn thiện quái, tinh anh, boss và sủng vật theo cùng chuẩn, với động tác phù hợp từng loài.
3. Đồng bộ vật phẩm, trang bị, hiệu ứng, lobby và Hắc Phong Sơn; kiểm tra độ rõ khi nhiều đối tượng cùng xuất hiện.
4. Đóng gói atlas/metadata, tích hợp vào runtime và kiểm tra trên camera, tốc độ di chuyển, va chạm và chiến đấu thực tế.

Ngày 22/10/2026, người dùng yêu cầu nâng tổng thể nhân vật và ngoại quan theo trang bị. Bản 2.1.0 tích hợp riêng Dương Khai từ rig mới dưới dạng atlas v9 và bảy lớp trang bị; xem [hồ sơ ngoại quan](HERO_EQUIPMENT_2_1_QA.md). Địch/thú và môi trường giữ các bộ hiện hành. Đây là kiểm tra nội bộ, chưa phải người dùng duyệt tạo hình cuối.

## Bộ cutout đã bị loại

Ngày 16/10/2026, người dùng bác bộ cắt lớp vì hình thể và chuyển động bị biến dạng. Những file bên dưới chỉ lưu lịch sử, không còn là nguồn dựng hình chuẩn hoặc bộ đã được duyệt. Mẫu 2 tiếp tục là hướng màu sắc/trang phục; bản sản xuất mới dùng cơ thể, trang phục và rig 3D mới tại `art/duong-khai-rebuild/`. Không cắt các phần của hình cũ để kéo thành tư thế mới.

Manifest, PNG và script trong thư mục cũ chỉ lưu lại lần thử đã bị bác. [DUONG_KHAI_2_5D_QA.md](DUONG_KHAI_2_5D_QA.md) là báo cáo lịch sử của bộ đó, không phê duyệt bộ dựng mới. Nguồn, trình mở trang xem và quy cách hiện hành đều được dẫn ở mục **Nguồn dựng mới và dữ liệu cho đợt nâng cấp**.

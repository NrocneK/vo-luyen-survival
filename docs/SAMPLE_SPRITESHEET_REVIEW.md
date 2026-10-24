# Đánh giá bộ spritesheet mẫu — 22/10/2026

## Kết luận

Bộ trong `sample_pritesheets/` có cấu trúc tốt để dùng làm nhân vật ngoại quan cố định và làm chuẩn tham khảo tư thế. Tuy nhiên, các PNG hiện có **chưa phải nguồn phù hợp để sản xuất Dương Khai với bảy ô trang bị thay đổi hình dáng độc lập**. Điểm nghẽn là nhân vật và đồ mặc đã gộp vào ảnh, không phải khả năng hiển thị sprite của game.

Chưa có quyết định chuyển sang pixel art. Chưa sửa PNG nguồn, thay runtime hay tạo bản preview mới. Mẫu `art/hero-redesign-study/` trước đó đã bị người dùng bác, không phải tạo hình được duyệt.

## Phạm vi đã kiểm tra

- Đọc toàn bộ 320 PNG, kích thước, kênh màu/alpha và hash; phân tích biên của 3.520 khung Body.
- Xem sheet nguồn và bảng đối chiếu 16 hướng; rà các chuỗi khung đi/chạy, đánh kiếm, trúng đòn và ngã ở các góc chéo.
- Đối chiếu cấu trúc `src/data/hero.ts`, `src/data/equipmentAppearance.ts` và cách phát hoạt ảnh của `PlayerView.ts`.
- Kiểm tra [trang gốc của Engvee](https://engvee.itch.io/animated-isometric-prototyping-hero) và [mô tả gói Props](https://engvee.itch.io/animated-isometric-prototyping-hero/devlog/799189/props-added).

Đây là đánh giá nguồn và chuỗi tư thế. Chưa xác nhận chuyển động ở FPS gốc, độ trượt chân trên nền di chuyển hoặc kết quả khi chạy trong game. Không có metadata FPS/neo kèm trong thư mục mẫu.

## Dữ liệu thực có trong thư mục

320 PNG gồm 10 clip × 16 hướng × hai lớp Body/Shadow. Có 16 góc thật, cách nhau khoảng 22,5°. Có thể lấy tám góc 000/045/090/135/180/225/270/315 mà không lật ảnh giả mặt/lưng.

| Clip | Lưới sheet | Số khung/hướng |
| --- | --- | ---: |
| Attack_Sword | 6 × 4 | 24 |
| Death_Sword | 6 × 5 | 30 |
| Death_Unarmed | 6 × 5 | 30 |
| Hit_Sword | 4 × 4 | 16 |
| Idle_Sword | 4 × 4 | 16 |
| Idle_Unarmed | 4 × 4 | 16 |
| Run_Sword | 5 × 4 | 20 |
| Run_Unarmed | 5 × 4 | 20 |
| WalkForward_Sword | 6 × 4 | 24 |
| WalkForward_Unarmed | 6 × 4 | 24 |

Lưới suy ra thống nhất ô 180 × 180 px. Có 3.520 khung Body và số khung Shadow tương ứng. Không phát hiện alpha Body chạm biên ô; kiểm tra này chỉ phát hiện nguy cơ cắt ảnh, không chứng minh chất lượng hoạt ảnh.

Nhân vật đứng thực chiếm khoảng 69–111 px chiều cao trong ô ở các hướng/clip idle; 180 px là kích thước ô, không phải chiều cao hình người. Nét mặt có ít pixel nguồn, phóng lớn không tự tạo được chi tiết sắc hơn.

Không có model/rig 3D, texture UV, lớp phục trang riêng, tọa độ gắn đồ hoặc thông số thời gian trong thư mục. `Unarmed` là không cầm vũ khí ở tay, vẫn mặc quần áo và có cung/bao tên trên lưng. Kiếm trong clip Sword cũng đã nằm trong Body.

## Chất lượng tư thế và giới hạn nội dung

Chuỗi khung cho thấy chân luân phiên, gối gập, bàn chân nhấc, tay và thân có chuyển động đối ứng; cơ thể giữ liên tục giữa các tư thế. Đòn kiếm có chuẩn bị, vung và thu hồi với chuyển trọng lượng. Các điểm này phù hợp để tham khảo khi khắc phục tay chân rời rạc ở bản thử bị bác.

Tạo hình hiện có mang phục trang chiến binh fantasy; chuyển thành Dương Khai cần đổi đầu/tóc, phục trang và bỏ cung/bao tên. Đây là thay cấu trúc hình, vượt quá đổi màu.

Trong **bản mẫu địa phương** chưa có đòn quyền hoặc clip trúng đòn tay không, chỉ có một clip Attack_Sword. Chưa đáp ứng yêu cầu ba đòn quyền và ba đường kiếm riêng. Không suy rộng thiếu hụt này cho toàn bộ gói trên trang tác giả.

## Khả năng thay trang bị

| Mục tiêu | Đánh giá với nguồn hiện tại |
| --- | --- |
| Nhân vật cố định, tám hướng | Khả thi sau khi chuẩn hóa neo, tỉ lệ và thời gian |
| Chỉnh một vài ảnh mẫu theo concept | Có thể thử; chưa đủ để cam kết toàn bộ hoạt ảnh |
| Thay riêng quần áo, tay/chân, mũ và vũ khí | Khó duy trì vì các phần đã gộp vào Body |
| Phục trang mới có tà áo/dáng khác | Cần vẽ lại chuyển động và vùng che khuất, không thể chỉ dán lớp màu |
| Theo dõi vị trí cánh/trang sức/bí bảo | Cần thêm điểm gắn theo khung và xử lý trước/sau thân |
| Mặt rõ khi phóng lớn ở lobby | Bản 180 hiện tại hạn chế chi tiết |

Nếu giữ tám hướng, bộ mẫu có 1.760 khung Body. Việc sửa nhiều món cần duy trì sự nhất quán trên những khung liên quan, đặc biệt khi tay hoặc kiếm đi trước/sau thân. AI sửa từng ảnh không cung cấp bảo đảm giữ đúng hình thể, đồ mặc và chuyển động xuyên suốt.

Game hiện có cơ chế đọc trang bị và phát lớp ảnh, nên không cần viết lại gameplay. Tuy nhiên, `equipmentAppearance.ts` hiện ánh xạ ba nhóm ngoại quan; vẫn phải bổ sung hình dáng theo món và dữ liệu lớp/che khuất. Code không thể tự tách phục trang khỏi PNG đã gộp.

PNG nén khoảng 10,43 MiB không đại diện bộ nhớ texture. Nếu tải nguyên mọi sheet thành RGBA8, 16 hướng và cả bóng ước tính 870 MiB, tám hướng khoảng 435 MiB; đây là phép tính kích thước ảnh thô, chưa đo runtime. Cần cắt vùng trống/đóng atlas và chỉ tải clip, hướng, chế độ cần thiết.

## Đối chiếu trang nguồn

Trang gốc có các gói độ phân giải cao hơn, gồm 320 px, và ghi phạm vi “for prototyping, non-commercial use”. Danh sách tải công bố không có model/rig; tác giả ghi nguồn model là Dary Palasky. Chưa xác nhận quyền sử dụng thương mại hoặc nguồn model tương ứng. [Nguồn](https://engvee.itch.io/animated-isometric-prototyping-hero).

Gói Props công bố cung, bao tên, kiếm và bao kiếm rời. Thông tin này chưa chứng minh có lớp quần áo hoặc bộ trang bị hoạt ảnh độc lập. [Nguồn](https://engvee.itch.io/animated-isometric-prototyping-hero/devlog/799189/props-added).

## Đề xuất

Ưu tiên nguồn có model + rig chỉnh sửa được, phục trang tách và phạm vi sử dụng phù hợp. Có nguồn đó mới giữ được chất lượng chuyển động khi đổi hình thể và đồ mặc, rồi xuất sprite tám hướng theo kiến trúc game hiện có.

Nếu tiếp tục thử trên bộ PNG này, chỉ nên kiểm chứng một chuỗi ngắn, một hướng với hai cấu trúc phục trang khác nhau, kiểm tra cả che khuất và tính liên tục trước khi duyệt sản xuất. Bản độ phân giải cao hơn giúp chi tiết, không giải quyết việc thiếu lớp.

Nếu không có nguồn chỉnh sửa phù hợp và vẫn giữ yêu cầu nhiều món/bảy ô độc lập, pixel art với **bộ nền đã tách lớp trang bị và có hoạt ảnh tốt** là hướng dễ kiểm soát hơn so với sửa hàng loạt PNG gộp này. Pixel art vẫn cần vẽ đủ hướng, khung, vùng che khuất; không tự giảm công chỉ vì đổi phong cách.

Hồ sơ nội bộ: `art/sample-spritesheet-review/inventory.json`, `frame-analysis.json`, `directions-16.png`, `locomotion.png`, `actions.png`. Đây là bảng đối chiếu nguồn, không phải mẫu nhân vật mới để duyệt.

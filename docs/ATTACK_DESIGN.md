# Bộ đòn isometric — giai đoạn 0

Tạo hình rig hiện tại được người dùng tạm duyệt; nâng cấp chất lượng đồ họa thực hiện ở đợt sau. Đợt này bổ sung hoạt ảnh chiến đấu trước khi viết gameplay.

| Actor / nhóm | Đòn 1 | Đòn 2 | Đòn 3 | Đòn 4 |
| --- | --- | --- | --- | --- |
| Dương Khai — quyền | Đấm thẳng trái | Đấm chéo phải | Móc lên trái | — |
| Dương Khai — kiếm | Chém chéo thuận từ cao xuống | Chém chéo ngược từ thấp lên | Quét ngang | — |
| Hắc Lang / tinh anh | Cắn chồm | Cào trái | Cào phải | — |
| Thiết Nha Trư / tinh anh | Húc nanh trái | Húc nanh phải | Dậm đầu lao tới | — |
| Độc Thiềm | Rướn miệng phun độc | Nhảy đập đất | Quật tay trước | — |
| Linh Hồ / tiến hóa | Cắn nhanh | Quật đuôi | Vồ hai chân trước | — |
| Thanh Điểu / tiến hóa | Lao mổ | Quạt cánh trái | Quạt cánh phải | — |
| Hắc Phong Lang Vương | Cào trái diện rộng | Cào phải diện rộng | Chồm vồ | Gầm tụ lực |

Mỗi đòn là một clip riêng, có đủ tám hướng thật và 14 khung. Đòn thường chuẩn bị 0–4, ra đòn 5–8, thu về 9–13; tiếp xúc chính ở khung 7 (đánh số từ 0). Vồ và nhảy đập ra đòn tới khung 10, chạm đất ở khung 9, thu về 11–13. Các clip cùng actor bắt đầu/kết thúc ở cùng tư thế để nối chuỗi. Dương Khai và sinh vật thường dùng 24 fps; boss dùng 16 fps để có nhịp báo trước dài hơn. Dữ liệu thời gian có thể chỉnh theo cân bằng gameplay sau này.

Quyền kết hợp đổi tay, xoay thân, chuyển trọng lượng và gập khuỷu; kiếm có cung lưỡi khác nhau trong ba mặt phẳng, giữ chiều dài tay và lưỡi. Đòn cào đổi chân ở sói; trư dùng hai hướng xoay đầu; chim đổi cánh; boss tách cào, vồ, gầm thành động tác riêng. Tinh anh dùng cùng bộ cơ bản của loài; sức mạnh, tầm đánh và hiệu ứng sẽ được cấu hình ở phần gameplay.

`art/v3/attack_library.py` chứa tên đòn, chi dẫn, mốc khung và kiểu động tác. Manifest có `attacks`, `comboOrder` và các animation `attack-1-S`, `attack-2-S`… JSON runtime đặt `repeat: 0`; chức năng lặp/luân phiên trên trang xem chỉ để kiểm tra asset.

Đòn phun độc/gầm là động tác cơ thể. Projectile, âm thanh, sát thương và hiệu ứng phạm vi sẽ được ghép bằng asset hiệu ứng khi triển khai chiến đấu; giai đoạn này không xử lý chúng.

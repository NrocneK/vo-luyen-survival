# Phần 2 — Tu vi, chỉ số và phần thưởng đã duyệt

Ngày lập: **20/10/2026**. **Người dùng đã xác nhận “duyệt toàn bộ phương án A” cho cả năm nhóm: tu vi/thưởng, tăng chỉ số, điều kiện đột phá, Tu Vi Đan và ngoại tuyến. Chưa lập trình hoặc kiểm chứng gameplay.** Các bảng A bên dưới là số liệu thiết kế đã duyệt; phương án B chỉ giữ lịch sử và không được chọn. Số học đã đối chiếu, độ khó thực tế sẽ kiểm chứng sau khi được duyệt triển khai.

Tham chiếu [thiết kế tổng](WORLD_TWO_DESIGN.md), [tiến trình đã duyệt](WORLD_TWO_PROGRESSION.md) và [boss/mục tiêu 14 màn đã duyệt](WORLD_TWO_COMBAT_DRAFT.md). Không thay đổi kinh tế, cảnh giới hoặc XP chọn thẻ của Trung Đô. Không đặt mục tiêu thời lượng hành trình hoặc số lượt phải chơi.

**Cập nhật 21/10/2026 — đã duyệt sửa đan:** theo [bảng vật phẩm đã duyệt A](WORLD_TWO_ITEMS_DRAFT.md), từ Siêu Phàm nhất tầng dùng tên Ngưng Nguyên/Hồi Xuân/Tẩy Tủy, giữ ba kho/công thức và số viên tồn. Các mức tu vi 4.000–20.000 dưới đây giữ nguyên; hồi phục tăng lên 60% HP, ba viên/20 giây; thêm năm suất vĩnh viễn +30 HP/+4 công sau năm suất cũ +8/+1, giữ đúng chỉ số cũ. Chi phí đột phá, thưởng tu vi cố định, tăng chỉ số cảnh giới và ngoại tuyến không đổi. Giá đồ/nguồn nguyên liệu/linh thú/quyết toán đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md).

## 1. Căn cứ đối chiếu mã 1.8.0

- Từ Thần Du tầng 1 đến đỉnh phong có chín lần tăng mốc, tổng **62.000 tu vi**. Đây không gồm bước nhập Thần Du từ đại cảnh giới trước.
- Mỗi đại cảnh giới mới có ba lần tăng mốc nếu tính cả nhập cảnh: từ cảnh giới trước lên nhất tầng, nhất → nhị, nhị → tam. Hai đại cảnh giới có sáu bước.
- Thưởng cơ sở sáu màn Trung Đô: 500 / 2.600 / 5.500 / 10.000 / 18.000 / 30.000 tu vi; thưởng lần đầu cộng thêm 2.600 / 5.200 / 10.000 / 19.000 / 32.000 / 0. Nguồn: `src/data/stages.ts`.
- Gốc cảnh giới ở mốc 46, chưa cộng trang bị, đan vĩnh viễn hoặc linh thú: **743,04 HP; 181,92 công; 15 giáp; 0,828 HP/giây**. Nếu chỉ nối sáu ID bằng công thức cũ thì mốc 52 thành 897,36 HP và 224,88 công, chỉ tăng khoảng 20,8% HP và 23,6% công qua cả hai đại cảnh giới mới. Nguồn: `src/domain/profile.ts`.
- Tu Vi Đan ở mốc 46 hiện cho 1.360 tu vi, chế tạo cần 25 linh thạch + 3 Linh Thảo. Giá trị được tính theo cảnh giới lúc dùng, không khóa vào lúc chế tạo. Nguồn: `profile.ts`, `src/data/recipes.ts`.
- Ngoại tuyến ở mốc 46 và đủ sáu thắng Trung Đô hiện có tốc độ 0,5 tu vi/giây, tích lũy tối đa 8 giờ. Nguồn: `idlePerSecond` trong `src/data/realms.ts`.
- Trong lượt, XP chọn thẻ dùng hệ riêng `8 + level * 4`; không lấy tu vi vĩnh viễn làm XP trong màn.

## 2. Câu 1 — ngân sách tu vi/phần thưởng

### Phương án A đã duyệt

| Đột phá tới | Cần thắng màn | Tu vi riêng của bước | Tổng chi phí sáu bước đến đây |
| --- | --- | --- | --- |
| Siêu Phàm nhất tầng | 2 | 90.000 | 90.000 |
| Siêu Phàm nhị tầng | 4 | 135.000 | 225.000 |
| Siêu Phàm tam tầng | 7 | 210.000 | 435.000 |
| Nhập Thánh nhất tầng | 9 | 300.000 | 735.000 |
| Nhập Thánh nhị tầng | 11 | 420.000 | 1.155.000 |
| Nhập Thánh tam tầng đỉnh phong | 13 | 570.000 | 1.725.000 |

Ngân sách **Siêu Phàm là 435.000**, gồm 90.000 + 135.000 + 210.000. Ngân sách **Nhập Thánh là 1.290.000**, gồm 300.000 + 420.000 + 570.000. Toàn bộ sáu bước **1.725.000 tu vi**. Không lấy giá một tầng Trung Đô nhân đồng loạt 10/3; tăng chi phí đi cùng thưởng, mức tăng sức mạnh và các nguồn tu luyện bên dưới.

Thắng màn nhận phần thưởng cơ sở; lần thắng đầu tiên cộng **50% cơ sở**, chỉ một lần. Đây là phần tu vi cố định, chưa gồm tu vi thu thêm trong lượt.

| Màn | Thắng: cơ sở | Cộng lần đầu | Tổng cố định lần đầu |
| --- | --- | --- | --- |
| 1 | 35.000 | 17.500 | 52.500 |
| 2 | 40.000 | 20.000 | 60.000 |
| 3 | 45.000 | 22.500 | 67.500 |
| 4 | 50.000 | 25.000 | 75.000 |
| 5 | 60.000 | 30.000 | 90.000 |
| 6 | 65.000 | 32.500 | 97.500 |
| 7 | 70.000 | 35.000 | 105.000 |
| 8 | 80.000 | 40.000 | 120.000 |
| 9 | 90.000 | 45.000 | 135.000 |
| 10 | 105.000 | 52.500 | 157.500 |
| 11 | 120.000 | 60.000 | 180.000 |
| 12 | 135.000 | 67.500 | 202.500 |
| 13 | 150.000 | 75.000 | 225.000 |
| 14 | 170.000 | 85.000 | 255.000 |

Màn khảo nghiệm/thoát hiểm hoàn thành mục tiêu được nhận thưởng thắng tương ứng. Luật thua/rút lui/thất bại nhiệm vụ tiếp tục 30% chiến lợi phẩm mới, không giảm tu vi đã tích từ trước; không có thưởng lần đầu khi thất bại.

**B — không chọn:** giảm toàn bộ chi phí sáu bước 20%, giữ thưởng cơ sở và thưởng lần đầu như A. Tổng chi phí thành 1.380.000 tu vi; tu vi còn lại sau đột phá sẽ nhiều hơn. Không áp dụng phương án này.

### Phần cần hoàn thiện cùng thông số màn

- Tu vi quái, tinh anh, cơ duyên và lượng nguyên liệu/linh thạch chưa chốt cho từng màn. Khi duyệt phải tính chung với đan và ngoại tuyến, không coi bảng thưởng cố định là tổng thu nhập.
- Thưởng thất bại của màn mục tiêu cần mức hoàn thành theo mục tiêu/pha được định nghĩa riêng, không tự bê tỷ lệ `time / duration` của màn sinh tồn cũ sang mọi loại nhiệm vụ. Trọng số và lượng thưởng thô còn chờ bảng thông số màn; luật quyết toán 30% đã duyệt không đổi.
- Huyết Tinh Thạch/truyền thừa là mốc truyện đã duyệt, không đổi thành phần thưởng ngẫu nhiên hoặc nguồn tu vi lặp thêm.

## 3. Câu 2 — sức mạnh mỗi lần đột phá

**A — đã duyệt:** mỗi bước mới nhân **1,15** vào HP gốc cảnh giới, công gốc cảnh giới và hồi HP gốc; tăng **2 giáp gốc**. Tính lũy tiến từ gốc mốc 46. Trang bị, Cường Thể Đan đã dùng và nội tại linh thú vẫn cộng riêng theo luật hiện hành, không bị nhân lại hoặc trừ đi khi sang thế giới.

| Cảnh giới | Hệ số HP/công/hồi so với gốc mốc 46 | HP gốc | Công gốc | Giáp gốc | Hồi HP gốc/giây |
| --- | --- | --- | --- | --- | --- |
| Siêu Phàm nhất tầng | ×1,150 | 854,50 | 209,21 | 17 | 0,952 |
| Siêu Phàm nhị tầng | ×1,322 | 982,67 | 240,59 | 19 | 1,095 |
| Siêu Phàm tam tầng | ×1,521 | 1.130,07 | 276,68 | 21 | 1,259 |
| Nhập Thánh nhất tầng | ×1,749 | 1.299,58 | 318,18 | 23 | 1,448 |
| Nhập Thánh nhị tầng | ×2,011 | 1.494,52 | 365,91 | 25 | 1,665 |
| Nhập Thánh tam tầng đỉnh phong | ×2,313 | 1.718,70 | 420,79 | 27 | 1,915 |

Ba bước của Siêu Phàm cho hệ số **×1,521** so với Thần Du đỉnh phong; sáu bước đến Nhập Thánh đỉnh phong là **×2,313**. Như vậy mỗi tầng của cấu trúc ba tầng tạo bước tăng rõ, thay vì chỉ thêm một ID vào công thức cũ. Các mốc 0–46 giữ công thức hiện tại.

Giữ tốc độ di chuyển, tầm hút, chí mạng nền và giới hạn sáu ô kỹ năng theo luật hiện hành; chưa đề xuất thêm ô. HP/công của quái, boss và HP mục tiêu bảo vệ sẽ xét cùng bảng này và trang bị dự kiến trước khi triển khai.

**B — không chọn:** mỗi bước tăng 10% HP/công/hồi gốc, tăng 1 giáp; không áp dụng phương án này.

## 4. Câu 3 — điều kiện phụ của đột phá mới

**A — đã duyệt:** sáu bước mới cần đủ **tu vi + cổng truyện đã duyệt**, không tiêu thêm Hạt Sen Đột Phá, Tu Vi Đan hoặc nguyên liệu phụ. Giữ toàn bộ tu vi dư, kiểm tra điều kiện từng bước và thực hiện qua thao tác đột phá hiện hành.

**B — không chọn:** hai lần nhập đại cảnh giới còn cần đạo cụ truyền thừa nhận chắc chắn qua mốc truyện tương ứng; không áp dụng phương án này.

Điều kiện đột phá Trung Đô hiện có không đổi.

## 5. Câu 4 — Tu Vi Đan và kho đan kế thừa

**A — đã duyệt:** giữ một loại Tu Vi Đan hiện hành và công thức **25 linh thạch + 3 Linh Thảo**. Từ Phần 2, hiệu quả dùng đan đọc bảng theo từng cảnh giới mới, không tính bằng `floor(realm / 10)`. Giữ công thức/hiệu quả của toàn bộ mốc Trung Đô; ở mốc 46 vẫn là 1.360.

| Cảnh giới mới | Tu vi mỗi Tu Vi Đan theo A | Ngoại tuyến theo A ở câu 5 (tu vi/giây) |
| --- | --- | --- |
| Siêu Phàm nhất tầng | 4.000 | 1,50 |
| Siêu Phàm nhị tầng | 6.000 | 2,25 |
| Siêu Phàm tam tầng | 9.000 | 3,00 |
| Nhập Thánh nhất tầng | 12.000 | 4,00 |
| Nhập Thánh nhị tầng | 16.000 | 5,00 |
| Nhập Thánh tam tầng đỉnh phong | 20.000 | 6,00 |

Đan đang giữ hoặc đã chế tạo từ trước nhận hiệu lực theo cảnh giới lúc dùng, tiếp tục cách vận hành hiện tại. Không đổi ID, không xóa kho hoặc bắt đổi đan cũ sang loại mới. Từ Siêu Phàm nhất tầng đến Nhập Thánh nhị tầng, một viên tương đương khoảng **2,8–3%** chi phí đột phá tiếp theo của A, thay vì bê nguyên tỷ lệ của một tầng nhỏ cũ sang tầng mới. Ở trần vẫn được cộng vào tu vi tích trữ.

**B — không chọn:** giữ Tu Vi Đan cũ ở mức tối đa 1.360 sau mốc 46 và thêm hai loại đan mới; không áp dụng phương án này.

## 6. Câu 5 — tu luyện ngoại tuyến

**A — đã duyệt:** dùng tốc độ riêng theo sáu cảnh giới mới như cột cuối bảng trên: **1,5 / 2,25 / 3 / 4 / 5 / 6 tu vi mỗi giây**. Trước khi đột phá Siêu Phàm, mức Thần Du đỉnh phong/đủ Trung Đô vẫn là 0,5 mỗi giây.

Giữ giới hạn tích lũy ngoại tuyến tối đa **8 giờ** hiện hành và cộng vào kho tu vi thực, kể cả khi thanh đột phá đầy hoặc cổng truyện còn khóa. Hai thế giới/căn cứ không tạo hai bộ thu nhập ngoại tuyến đồng thời; đọc mức đã mở cao nhất của nhân vật. Không cộng trực tiếp toàn bộ màn Phần 2 vào chỉ số chặng Trung Đô để làm tăng công thức cũ.

**B — không chọn:** giữ mức ngoại tuyến tối đa hiện hành 0,5 tu vi/giây trong Phần 2; không áp dụng phương án này.

## 7. Đối chiếu số học — không thay cho kiểm thử gameplay

Bảng dưới cộng phần thưởng cố định lần đầu đến từng mốc, xuất phát với **0 tu vi dự trữ**, và trừ tổng chi phí đã mở đến đó. Chưa cộng tu vi từ quái/cơ duyên, đan, ngoại tuyến hoặc kho cũ. Đây là đối chiếu nguồn/chi phí để lộ phần cần kiểm chứng cùng các nguồn còn lại; không đặt yêu cầu về số lượt phải chơi.

| Mốc truyện | Tổng thưởng cố định lần đầu đến mốc | Tổng chi phí đột phá đến mốc | Chênh lệch hai tổng |
| --- | --- | --- | --- |
| Sau màn 2 | 112.500 | 90.000 | +22.500 |
| Sau màn 4 | 255.000 | 225.000 | +30.000 |
| Sau màn 7 | 547.500 | 435.000 | +112.500 |
| Sau màn 9 | 802.500 | 735.000 | +67.500 |
| Sau màn 11 | 1.140.000 | 1.155.000 | -15.000 |
| Sau màn 13 | 1.567.500 | 1.725.000 | -157.500 |

Chênh lệch âm chỉ là phần chưa được bù trong phép cộng giới hạn này, không phải cho phép số dư nhân vật âm. Ví dụ tại cổng sau màn 11, bảng nguồn cố định còn thiếu 15.000 so với tổng chi phí đến Nhập Thánh nhị tầng; cần đánh giá cùng các nguồn khác khi kiểm chứng, không tuyên bố chỉ thưởng cố định là đủ.

Tổng thưởng cố định lần đầu của 14 màn là **1.822.500**, tổng sáu lần đột phá là **1.725.000**, chênh lệch **97.500** trước các nguồn khác. Điều kiện mở trần sau màn 13 và được vào trận cuối ở Nhập Thánh nhị tầng đã duyệt vẫn giữ nguyên.

Các số gốc/hệ số, tổng ngân sách, tổng thưởng và tỷ lệ đan đã được đối chiếu số học bằng JavaScript; chưa có mã Phần 2 hay kết quả chơi thử chứng minh độ khó/nhịp tu luyện của bộ số này.

## 8. Phạm vi còn chờ trước khi triển khai

Năm phương án A của tài liệu này, năm phương án A sửa trang bị/đan và năm phương án A về giá/nguồn thu/linh thú tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md) đều đã duyệt; chưa thay runtime. Còn thông số kỹ năng/màn, mốc tiến triển cụ thể, giao diện, asset và nghiệm thu. Nếu thay số đã duyệt sau kiểm chứng, trình lại bảng liên quan. Duyệt thiết kế không tự cho phép lập trình toàn bộ Phần 2.

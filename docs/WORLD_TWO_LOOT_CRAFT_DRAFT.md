# Phần 2 — Chiến lợi phẩm, giá đồ và linh thú đã duyệt

Ngày lập: **21/10/2026**. **Đã duyệt A cho cả năm nhóm qua xác nhận “duyệt phương án A”, sau khi trình bảng kinh tế; chưa lập trình.** Đã chốt gói thưởng/nguồn phụ, giá chế tạo, giá cường hóa, giá/chỉ số thú 6–10 và quyết toán theo tiến trình. Các phương án B không được chọn. Lần duyệt này nối tiếp năm nhóm trang bị/đan đã chốt ở [bảng vật phẩm](WORLD_TWO_ITEMS_DRAFT.md).

Tham chiếu [thiết kế tổng](WORLD_TWO_DESIGN.md), [kinh tế tu vi đã duyệt](WORLD_TWO_ECONOMY_DRAFT.md), [hệ thống](WORLD_TWO_SYSTEMS_DRAFT.md) và [tiến trình](WORLD_TWO_PROGRESSION.md). Giữ Trung Đô, giá món cũ, nuôi thú bậc 1–5 và các số tu vi/đan đã duyệt. Không đặt mục tiêu thời lượng hành trình hoặc số lượt phải lặp.

## 1. Lựa chọn 1 — nguồn linh thạch, nguyên liệu và tu vi phụ

**A — đã duyệt:** bốn nhóm thưởng cố định theo màn. Mỗi lần thắng nhận đủ gói tương ứng; thắng lần đầu cộng thêm **50% từng lượng cố định**, phần thưởng nguyên chiếc làm tròn xuống theo từng tài nguyên. Tu vi thắng cố định/lần đầu tiếp tục đúng bảng đã duyệt, không cộng 50% hai lần.

### Gói cố định khi thắng, chưa cộng thưởng lần đầu

| Nhóm màn | Linh thạch | Linh Tài Thông Huyền | Thiết Khoáng | Da Thú | Linh Thảo | Yêu Đan | Thức ăn linh thú |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1–3 | 4.000 | 12 | 60 | 45 | 50 | 24 | 8 |
| 4–7 | 5.500 | 16 | 80 | 60 | 65 | 32 | 10 |
| 8–11 | 7.500 | 22 | 105 | 80 | 85 | 42 | 14 |
| 12–14 | 10.000 | 30 | 140 | 105 | 110 | 56 | 18 |

Ví dụ thắng lần đầu màn 1: nhận 6.000 linh thạch, 18 Linh Tài, 90 Thiết Khoáng, 67 Da Thú, 75 Linh Thảo, 36 Yêu Đan, 12 thức ăn; tu vi theo bảng riêng đã duyệt. Thưởng lần đầu chỉ cấp một lần sau thắng, không rơi trong sân. Chỉ số nhóm thưởng đọc từ màn đang chơi, không tăng theo cảnh giới nhân vật hoặc chỉ số màn toàn bộ thế giới.

Bản vẽ và hai bí bảo giữ lịch mở sau màn 2/3/9/11 đã duyệt, không nằm trong phép nhân số lượng này. Không tự cấp vật phẩm chế tạo chỉ vì nhận bản vẽ. Huyết Tinh Thạch vẫn là đạo cụ nhiệm vụ. Ma Đô là sự kiện truyện, không tạo thêm gói thắng màn hoặc thưởng số lượng lặp lại.

### Quái thường và tinh anh trong lịch luyện Phần 2

| Nhóm màn | Tu vi/quái thường | Tu vi/tinh anh | Linh thạch/tinh anh | Yêu Đan/tinh anh | Linh Tài/tinh anh |
| --- | --- | --- | --- | --- | --- |
| 1–3 | 6 | 300 | 150 | 3 | 1 |
| 4–7 | 9 | 450 | 220 | 4 | 1 |
| 8–11 | 12 | 600 | 300 | 5 | 2 |
| 12–14 | 16 | 800 | 400 | 6 | 3 |

- Quái thường không phải boss: nhận tu vi khi hạ; có 30% rơi linh thạch, mỗi lần rơi tương ứng **6/8/10/12** theo bốn nhóm. Có 18% rơi **1/2/2/3** nguyên liệu theo nhóm: quái đánh xa cho Linh Thảo, lao tới cho Thiết Khoáng, loại khác cho Da Thú, kế thừa phân loại hành vi hiện có. Hai phép rơi độc lập; cần nhặt giọt rơi theo luật đang có.
- Tinh anh lịch luyện nhận đúng gói riêng trong bảng, không nhận lặp gói quái thường hoặc thêm một hệ số tinh anh nữa. Gói số lượng vào chiến lợi phẩm của lượt; chưa vào tài sản vĩnh viễn trước quyết toán.
- Boss không cộng thêm gói tinh anh; phần thưởng chiến thắng của màn đại diện phần thưởng boss, kể cả khảo nghiệm/thoát truy sát không giết nhân vật đối địch.
- Hộ vệ và tinh anh của cơ duyên chỉ rơi XP khi bị hạ, không nhận các gói tu vi/tài nguyên này; thưởng cơ duyên chỉ cấp qua tương tác nhận đúng một lần. Giữ `opportunityId` và cleanup của hệ thống hiện hành.
- Chưa chốt XP từng loại quái và vật hồi HP rơi từ quái; chúng thuộc bảng chiến đấu. Không thay công thức XP cần lên cấp trong lượt `8 + 4 * level`.

### Cơ duyên Phần 2

Giữ tối đa bốn cơ duyên, bốn loại và thao tác nhận đã có. Bảng dưới dùng tu vi thắng cố định **của đúng màn** và linh thạch thắng trong bảng trên; không tính trên số sau thưởng lần đầu. Gọi nhóm màn là `b = 1..4`.

| Loại | Tu vi | Linh thạch | Nguyên liệu | XP/hồi HP dùng ngay |
| --- | --- | --- | --- | --- |
| Di vật có hộ vệ | 2% tu vi thắng màn | 8% linh thạch thắng màn | `2*b` Linh Tài, `10*b` Thiết Khoáng | 16/20/24/28 XP theo nhóm |
| Linh dược | 1% tu vi thắng màn | 0 | 10/15/20/25 Linh Thảo theo nhóm | Cùng mức XP; hồi 25% HP tối đa ngay |
| Truy sát tinh anh | 3% tu vi thắng màn | 12% linh thạch thắng màn | `3*b` Linh Tài, `4*b` Yêu Đan | Cùng mức XP |
| Tụ linh | 4% tu vi thắng màn | 5% linh thạch thắng màn | `2*b` Linh Tài | Cùng mức XP |

Các lượng số nguyên làm tròn xuống. Thưởng tu vi/tài nguyên cơ duyên đi vào kho chiến lợi phẩm trong lượt, giữ quyết toán 100%/30%; XP và hồi HP dùng ngay, không được cấp lại ở kết quả. Cơ duyên Phần 2 thưởng nguyên liệu, không rơi thẳng 16 món mới hoặc bản vẽ mới để vượt sự kiện mở đã duyệt. Quy tắc cơ duyên/loot Trung Đô không đổi.

Mốc xuất hiện cơ duyên theo tiến trình nhiệm vụ của từng màn, đội hình hộ vệ và dữ liệu chiến đấu chưa nằm trong lần duyệt này. Giữ hủy cơ duyên chưa nhận khi boss xuất hiện/kết thúc lượt, RNG cơ duyên tách riêng; không kéo một chỉ số toàn cục qua hai thế giới để vô tình đổi bảng Trung Đô.

**B — không chọn:** cùng bảng gói thắng, quái và cơ duyên, nhưng thưởng lần đầu mới **chỉ cộng tu vi theo quyết định trước**, không cộng thêm 50% linh thạch/nguyên liệu. Bản vẽ lần đầu vẫn giữ lịch đã duyệt.

## 2. Lựa chọn 2 — giá chế tạo 16 món

**A — đã duyệt:** giá theo ô và nhóm dưới đây. Hai vũ khí của một nhóm có cùng giá, mỗi vũ khí là một món phải chế tạo riêng. Chỉ tiêu linh thạch/nguyên liệu, không tiêu tu vi hoặc phá hủy món cũ.

### Siêu Phàm

| Món | Linh thạch | Linh Tài | Nguyên liệu cũ |
| --- | --- | --- | --- |
| Liệt Dương Quyền Sáo | 2.400 | 4 | 80 Thiết Khoáng + 20 Yêu Đan |
| Xích Dương Kiếm | 2.400 | 4 | 80 Thiết Khoáng + 20 Yêu Đan |
| Thanh Minh Quan | 1.400 | 2 | 20 Thiết Khoáng + 40 Da Thú |
| Huyền Linh Chiến Y | 2.200 | 4 | 30 Thiết Khoáng + 70 Da Thú |
| Hộ Mạch Uyển | 1.200 | 2 | 30 Thiết Khoáng + 20 Da Thú |
| Truy Phong Ngoa | 1.400 | 2 | 10 Thiết Khoáng + 40 Da Thú |
| Ngưng Thần Bội | 2.200 | 3 | 35 Thiết Khoáng + 20 Yêu Đan |
| Ma Thần Hộ Ấn | 2.800 | 5 | 60 Linh Thảo + 24 Yêu Đan |

### Nhập Thánh

| Món | Linh thạch | Linh Tài | Nguyên liệu cũ |
| --- | --- | --- | --- |
| Thánh Nguyên Quyền Sáo | 6.000 | 8 | 160 Thiết Khoáng + 40 Yêu Đan |
| Huyền Dương Thánh Kiếm | 6.000 | 8 | 160 Thiết Khoáng + 40 Yêu Đan |
| Huyền Quang Quan | 3.500 | 5 | 40 Thiết Khoáng + 80 Da Thú |
| Thánh Nguyên Chiến Y | 5.500 | 8 | 60 Thiết Khoáng + 140 Da Thú |
| Kim Cương Hộ Uyển | 3.000 | 4 | 60 Thiết Khoáng + 40 Da Thú |
| Ngự Phong Ngoa | 3.500 | 5 | 20 Thiết Khoáng + 80 Da Thú |
| Thánh Tâm Ngọc Bội | 5.500 | 7 | 70 Thiết Khoáng + 40 Yêu Đan |
| Thánh Chủ Ngọc Ấn | 7.000 | 10 | 120 Linh Thảo + 48 Yêu Đan |

Giữ mốc bản vẽ/cảnh giới đã duyệt, một món mỗi ID sở hữu, chế tạo bắt đầu +0. Chế tạo món mới cần đúng bản vẽ mới đã nhận; không đặt thêm cổng trình độ luyện khí. Giữ cộng trình độ theo từng thao tác thành công đang có. Đồ cũ và các mức + đã đầu tư vẫn giữ trong kho/trang bị, không tự hoàn tiền hoặc đổi ngang sang đồ mới.

**B — không chọn:** giảm **20% linh thạch chế tạo** ở mọi dòng trên, giữ toàn bộ lượng nguyên liệu/Linh Tài và điều kiện. Không giảm giá cường hóa ở lựa chọn 3.

## 3. Lựa chọn 3 — giá cường hóa đồ mới

**A — đã duyệt:** cùng chi phí cho mọi ô trong một nhóm; nâng đúng một mức, thành công chắc chắn, giữ mức +5 và +20% chỉ số gốc/mức đã duyệt.

| Lần nâng | Siêu Phàm: linh thạch / Thiết Khoáng / Linh Tài | Nhập Thánh: linh thạch / Thiết Khoáng / Linh Tài |
| --- | --- | --- |
| +0 → +1 | 250 / 6 / 1 | 600 / 12 / 2 |
| +1 → +2 | 400 / 10 / 2 | 900 / 18 / 3 |
| +2 → +3 | 550 / 14 / 3 | 1.200 / 24 / 4 |
| +3 → +4 | 700 / 18 / 4 | 1.500 / 30 / 5 |
| +4 → +5 | 850 / 22 / 5 | 1.800 / 36 / 6 |

Một món Siêu Phàm +0→+5 tốn **2.750 linh thạch + 70 Thiết Khoáng + 15 Linh Tài**; Nhập Thánh tốn **6.000 + 120 + 20**. Giá chỉ áp 16 món mới, không dùng cấp nhân vật hoặc thế giới đang đứng để tăng giá món cũ. Đổi căn cứ/quay Trung Đô không đổi giá cùng một món.

**B — không chọn:** giữ thành phần Thiết Khoáng/Linh Tài theo A, nhưng phí linh thạch mỗi bước của đồ mới dùng mức cũ **35/65/95/125/155**, tổng 475 mỗi món. Giữ giá đồ cũ nguyên trạng; không thêm xác suất thất bại hoặc mất mức cường hóa.

## 4. Lựa chọn 4 — giá và sức mạnh linh thú bậc 6–10

**A — đã duyệt:** mỗi lần nuôi đủ chi phí tăng đúng một bậc; giữ hai loài/tiến hóa một lần và một con đồng hành. Không bắt tiến hóa trước mới được nuôi bậc 6–10. Mốc cảnh giới đã duyệt chỉ mở trần, không tự tăng bậc hoặc trừ tài nguyên.

### Giá cho một con

| Bước nuôi | Cảnh giới tối thiểu đã duyệt | Linh thạch | Thức ăn | Linh Tài |
| --- | --- | --- | --- | --- |
| 5 → 6 | Siêu Phàm nhất tầng | 600 | 8 | 3 |
| 6 → 7 | Siêu Phàm nhị tầng | 900 | 10 | 5 |
| 7 → 8 | Siêu Phàm tam tầng | 1.300 | 12 | 7 |
| 8 → 9 | Nhập Thánh nhất tầng | 1.800 | 15 | 10 |
| 9 → 10 | Nhập Thánh nhị tầng | 2.400 | 18 | 14 |

Từ bậc 5 tới 10 một con tốn **7.000 linh thạch + 63 thức ăn + 39 Linh Tài**. Hai con dùng bảng giá giống nhau. Bậc 1–5, giá mở loài/tiến hóa và tài nguyên đã đầu tư không thay đổi.

### Nội tại và hệ số sát thương

Bảng là **tổng nội tại của từng con tại bậc đó trước tiến hóa**, không cộng cả năm dòng hoặc cộng lại nội tại bậc 5 lần nữa. Mọi con đã mở vẫn có nội tại, chỉ một con gây đòn đồng hành.

| Bậc | Linh Hồ: HP / tầm nhặt | Thanh Điểu: công / chí mạng | Hệ số công cho một đòn đồng hành |
| --- | --- | --- | --- |
| 6 | +35 HP / +1,1 | +7 công / +5,5 điểm phần trăm | ×1,04 |
| 7 | +45 HP / +1,2 | +9 công / +6 điểm phần trăm | ×1,13 |
| 8 | +55 HP / +1,3 | +11 công / +6,5 điểm phần trăm | ×1,22 |
| 9 | +65 HP / +1,4 | +13 công / +7 điểm phần trăm | ×1,31 |
| 10 | +75 HP / +1,5 | +15 công / +7,5 điểm phần trăm | ×1,40 |

Giữ hệ số tiến hóa nội tại **×2** và đòn đồng hành **×1,7** của mã hiện hành; sát thương dùng công nhân vật tại lúc xuất đòn. Ví dụ bậc 10 đã tiến hóa: Linh Hồ +150 HP/+3 tầm nhặt; Thanh Điểu +30 công/+15 điểm phần trăm chí mạng; đòn đồng hành có hệ số **1,40×1,7 = 2,38** trước luật chí mạng/kháng đang có. Bậc 5 giữ nguyên công thức 1.8.0 (hệ số đòn ×0,95 trước tiến hóa), không giảm sức mạnh cũ.

Giữ nhịp đánh đồng hành 1,4 giây, ba động tác hiện có, tầm/va chạm theo loài và bộ quy tắc đòn đang có; không thêm đòn mới hoặc cho hai con cùng đánh. Nếu cần thay sau thử chiến đấu, trình lại thay vì coi số này đã kiểm chứng.

Bậc ghi nguồn/thống kê là **bậc thú thật 1–10 lúc xuất đòn**, tách khỏi bậc dùng chọn hình học/xuyên của đạn. Bậc thú 10 không nâng trần kỹ năng tấn công từ 6 lên 10. Giữ nguồn đạn sau khi actor bị dọn và quy tắc sát thương HP thực theo AGENTS.md.

**B — không chọn:** cùng giá/mốc mở theo A, nhưng kéo tiếp công thức nội tại/đòn cũ tới bậc 10. Ở bậc 10 đã tiến hóa: Linh Hồ +100 HP/+4 tầm nhặt; Thanh Điểu +20 công/+20 điểm phần trăm chí mạng; hệ số đòn **1,55×1,7 = 2,635**. Phương án này ưu tiên tầm nhặt/chí mạng và đòn đồng hành hơn HP/công cộng phẳng so với A; chưa được chọn hoặc coi là đã cân bằng.

## 5. Lựa chọn 5 — phần thưởng khi thất bại/rút lui

**A — đã duyệt:** giữ quyết toán 30% tổng chiến lợi phẩm đã ghi nhận, nhưng phần thưởng cố định nhiệm vụ được cộng theo các **mốc tiến triển**, không theo thời gian đã chơi.

Mỗi màn có ba mốc ghi nhận **25% / 50% / 75%**. Mốc là hoàn thành một phần nhiệm vụ, tới chặng hộ tống hoặc vượt ngưỡng của trận boss; cần đánh dấu đơn điệu, không cộng nhiều lần do boss hồi HP hoặc người chơi quay lại khu cũ. Thắng nhận đủ 100% gói cố định, không cộng thêm phần mốc trước đó.

Khi chưa thắng, lấy `p = 0 / 0,25 / 0,5 / 0,75` theo mốc cao nhất đã đạt:

- Kho chiến lợi phẩm thô cộng thêm **tu vi thắng cố định × p** và **linh thạch thắng cố định × (2/3) × p**, kế thừa hệ số phần linh thạch thất bại đang có nhưng thay cách đo tiến trình.
- Chưa thắng không cộng gói nguyên liệu thắng cố định, bản vẽ lần đầu, thưởng lần đầu hoặc vật phẩm nhiệm vụ sau màn. Nguyên liệu đã nhặt/đã nhận từ quái và cơ duyên vẫn nằm trong kho thô.
- Sau đó mới quyết toán **30% đúng một lần** trên kho thô, giữ luật làm tròn/vật phẩm nguyên chiếc hiện hành. Không nhân đôi hệ số 30%, không trừ tài sản đã có trước lượt. XP/hồi HP trong lượt không chuyển thành phần thưởng lâu dài.
- Tử trận, thất bại nhiệm vụ khi nhân vật còn sống và chủ động rút lui giữ nhãn kết quả khác nhau; đều không ghi thắng/mở màn tiếp hoặc mở cổng đột phá.

Ví dụ màn 2 có tu vi thắng 40.000, linh thạch thắng theo 1A là 4.000: rút lui sau mốc 50%, chưa tính loot quái/cơ duyên, phần thô tương đương 20.000 tu vi và 1.333,333… linh thạch; sau quyết toán nhận **6.000 tu vi và 400 linh thạch**. Ghi mốc dưới dạng số nguyên `k = 0..3`, với `p = k/4`, và tính bằng tử số/mẫu số tới lần làm tròn cuối; không làm tròn phần thô trước hoặc dựa vào phép nhân số thực liên tiếp có thể thành 399,999999…. Nếu có `R` linh thạch nguyên từ quái/cơ duyên và gói thắng `S`, kết quả linh thạch thất bại là `floor((6*R + S*k)/20)`; đây là làm tròn một lần cho toàn bộ phần linh thạch, không cộng các phần đã làm tròn riêng.

Ví dụ cho mô hình mốc (chưa duyệt bảng mốc chi tiết 14 màn): màn hộ tống có thể dùng hai đoạn đường và mở lối thoát; màn đấu tay đôi có thể dùng boss xuống 75% HP, chuyển pha 50%, xuống 25%. Bảng mốc cụ thể từng màn sẽ trình cùng thông số mục tiêu/pha boss, không tự áp ví dụ chung cho mọi màn.

**B — không chọn:** khi thua/rút lui chỉ quyết toán 30% loot quái/cơ duyên thực đã nhận; không cộng phần gói nhiệm vụ cố định theo tiến trình. Thắng/lần đầu và các nhãn kết quả không đổi.

## 6. Đối chiếu nguồn/chi phí của A — không phải mục tiêu số lượt

Các tổng dưới đây chỉ cộng các dòng dữ liệu để phát hiện sai số/nghẽn nguồn. Không quy định phải sở hữu cả hai bộ, nâng tối đa mọi món, nuôi đủ hai con hoặc hoàn thành tất cả bằng một số lượt nhất định; không phải kết quả chơi thử.

| Phép cộng tham chiếu | Linh thạch | Linh Tài | Thiết Khoáng | Da Thú | Linh Thảo | Yêu Đan | Thức ăn |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tổng gói cố định lần đầu 14 màn, gồm 50% của 1A | 141.000 | 417 | 2.008 | 1.512 | 1.616 | 804 | 261 |
| Chế tạo bảy món Siêu Phàm, chọn một vũ khí | 13.600 | 22 | 205 | 170 | 60 | 64 | 0 |
| Chế tạo bảy món Nhập Thánh, chọn một vũ khí | 34.000 | 47 | 410 | 340 | 120 | 128 | 0 |
| Nâng bảy món Siêu Phàm từ +0 tới +5 | 19.250 | 105 | 490 | 0 | 0 | 0 | 0 |
| Nâng bảy món Nhập Thánh từ +0 tới +5 | 42.000 | 140 | 840 | 0 | 0 | 0 | 0 |
| Nuôi cả hai thú từ bậc 5 tới 10 | 14.000 | 78 | 0 | 0 | 0 | 0 | 126 |
| Tổng năm dòng chi phí trên | **122.850** | **392** | **1.945** | **510** | **180** | **192** | **126** |

Thưởng cố định lần đầu được làm tròn **phần thưởng thêm của từng tài nguyên ở từng màn**, không lấy tổng toàn chương nhân 1,5 rồi làm tròn một lần. Các chi phí tham chiếu chưa gồm vũ khí còn lại, luyện đan hoặc mở/nuôi thú trước bậc 5. Các nguồn chưa tính là kho mang từ Trung Đô, quái, cơ duyên và thưởng các lần chơi khác. Không lấy chênh lệch tổng cuối chương để khẳng định đủ tài nguyên tại từng cổng màn hoặc mọi lựa chọn phát triển đều có cùng chi phí.

Đối chiếu tại mốc bản vẽ đầu: tổng gói thắng lần đầu màn 1–2 là 12.000 linh thạch/36 Linh Tài/180 Thiết Khoáng/134 Da Thú/150 Linh Thảo/72 Yêu Đan, chưa cộng loot phụ hoặc kho cũ. Chọn một vũ khí Siêu Phàm, Huyền Linh Chiến Y và Ma Thần Hộ Ấn ở +0 cần 7.400 linh thạch/13 Linh Tài/110 Thiết Khoáng/70 Da Thú/60 Linh Thảo/44 Yêu Đan. Khi đủ cảnh giới, gói nguồn này đáp ứng ba món đã chọn mà không cần giả định có nguyên liệu ngẫu nhiên. Điều đó không có nghĩa phải chế tạo cả ba, hoặc được trang bị trước Siêu Phàm nhất tầng.

Ở tổng tham chiếu, Thiết Khoáng và Linh Tài có dư nhỏ hơn các nguyên liệu khác. Trước khi triển khai cần đối chiếu khả năng tiếp cận tại các mốc còn lại; không tự sửa giá Trung Đô hoặc chi phí đột phá đã duyệt để ép một nhịp chơi. Có thể tiếp tục dùng đồ cũ đã nâng, chọn ô muốn đổi trước, chưa cần chế tạo cả nhóm ngay khi nhận bản vẽ.

Các tổng được tính bằng JavaScript từ bảng nguồn/giá, chưa chạy mô phỏng đội hình/độ khó mới. Việc duyệt năm nhóm này không tự duyệt thông số chiến đấu hoặc cho phép lập trình toàn bộ Phần 2.

## 7. Phần tiếp theo còn cần chốt

Năm nhóm đã duyệt A: **(1) gói thưởng/nguồn phụ; (2) giá chế tạo; (3) giá cường hóa; (4) giá/chỉ số thú; (5) quyết toán theo tiến trình**. Không hỏi lại các phương án đã chốt hoặc tự áp phương án B. Riêng mốc tiến triển cụ thể từng màn và đội hình/XP quái/cơ duyên vẫn cần chốt cùng dữ liệu chiến đấu.

Sau đó tiếp tục bảng kỹ năng/biến chiêu/thức tỉnh, HP/công/pha/đội hình/mốc nhiệm vụ của 14 màn, cơ duyên theo tiến trình, giao diện/căn cứ/lời kết, danh sách asset và nghiệm thu. Chưa chỉnh runtime, dữ liệu lưu hoặc đồ họa 2.5D.

# Thiết kế Phần 2 — Thông Huyền Đại Lục

Ngày cập nhật: **21/10/2026**. Nền gameplay: **1.8.0**.

**Trạng thái hiện hành:** đã được ủy quyền hoàn thiện các mặc định A và triển khai Phần 2 ngày 21/10/2026. Bản chạy 2.0.0 và kiểm tra ở [WORLD_TWO_IMPLEMENTATION.md](WORLD_TWO_IMPLEMENTATION.md), [WORLD_TWO_QA.md](WORLD_TWO_QA.md). Các mục “còn chờ/chưa có mã” phía dưới lưu trạng thái của giai đoạn thiết kế 1.8.0; quyền triển khai mới thay thế yêu cầu hỏi/duyệt tiếp. Không thay số liệu đã chốt.

Đọc cùng [quy tắc dự án](../AGENTS.md), [review Trung Đô](WORLD_ONE_REVIEW.md) và [handoff Phần 2](WORLD_TWO_HANDOFF.md).

## 1. Phạm vi đã duyệt

- Bao phủ trọn chặng Thông Huyền Đại Lục, từ đặt chân tới chuẩn bị rời đại lục; chọn những biến cố nổi bật.
- Giữ địa danh, thứ tự sự kiện lớn, nhân vật và hệ thống cảnh giới; chuyển thể giao tranh cho gameplay survival.
- **14 màn chiến đấu**, ứng với các cụm sự kiện trong mục 2. Ma Đô là sự kiện truyện nằm trước đại chiến cuối chương.
- Giữ Dương Khai, tài sản, trang bị, kỹ năng, linh thú, thành tích và tiến trình lưu hiện có. Kỹ năng mang theo tiếp tục tuân theo luật kích hoạt/nâng bậc trong từng lượt.
- Trọng tâm nội dung mới: kỹ năng, biến chiêu và boss nhiều pha. Đã duyệt **ba kỹ năng tấn công + hai hỗ trợ mới**; mỗi tấn công mới có **hai biến chiêu và một thức tỉnh**.
- Người dùng đã chọn **bộ A — Ma Thần và Long Hoàng**: tấn công **Diệt Hồn Kim Quang, Già Thiên Thủ, Kim Long Hiển Hóa**; hỗ trợ **Nhập Ma, Phong Lôi Vũ Dực**. Đã duyệt sáu biến chiêu, ba liên kết/tên/hướng hiệu ứng thức tỉnh, dấu ấn tăng sát thương trong khoảng hiệu lực (áp lại làm mới thời gian, không cộng dồn vô hạn), tối đa hai lượt lướt hồi lần lượt và mốc mở theo màn/cảnh giới. Thông số và chi tiết tương tác còn chờ duyệt. Xem [thiết kế bộ kỹ năng A](WORLD_TWO_SKILLS_A.md).
- Đã duyệt mục tiêu màn đa dạng: sinh tồn, giữ trận, phá vây/giải cứu và khảo nghiệm, tiếp tục có XP/thẻ trong lượt. Đã duyệt phương án A về boss/mục tiêu/hướng các pha của cả 14 màn tại [bảng chiến đấu](WORLD_TWO_COMBAT_DRAFT.md).
- Boss thông thường **hai pha**; boss cuối chương **ba pha**, thay đổi bộ đòn hoặc tình thế chiến trường. Đã chốt hướng các pha của cả 14 màn; lượng HP, sát thương, ngưỡng chuyển pha và các thông số chi tiết còn cần duyệt.
- Kỹ năng mới mở bằng truyền thừa qua mốc truyện/màn tương ứng, kết hợp yêu cầu cảnh giới. Sau khi mở, có thể chọn mang vào lượt; dùng thẻ kích hoạt/nâng bậc theo luật hiện hành.
- Đã duyệt bốn phương án A trong [tiến trình Phần 2](WORLD_TWO_PROGRESSION.md): cổng màn/đột phá, mốc mở kỹ năng, thất bại mục tiêu và hoàn tất chương. Thắng các màn 2/4/7/9/11/13 lần lượt mở điều kiện cho sáu lần đột phá mới. Hoàn tất chương khi thắng đủ 14 màn và đạt Nhập Thánh tam tầng đỉnh phong, theo bất kỳ thứ tự nào.
- Đã duyệt toàn bộ năm phương án A tại [bảng tu vi/chỉ số/thưởng](WORLD_TWO_ECONOMY_DRAFT.md): sáu chi phí 90.000 / 135.000 / 210.000 / 300.000 / 420.000 / 570.000; thưởng tu vi cố định 14 màn và cộng 50% lần đầu; mỗi bước mới +15% HP/công/hồi gốc và +2 giáp; đột phá chỉ cần tu vi + cổng truyện; Tu Vi Đan và ngoại tuyến theo bảng cảnh giới mới. Công thức/ID/tài sản Trung Đô giữ nguyên. Đây là thiết kế đã duyệt, chưa triển khai hoặc kiểm chứng gameplay.
- **Tu vi được tích trữ vượt ngưỡng đột phá**, kể cả khi chờ đủ điều kiện truyện hoặc đang ở trần. Chỉ đột phá khi đủ mọi điều kiện; mỗi lần trừ đúng chi phí bước đó và giữ nguyên phần dư. Không cắt thưởng/đan/idle vì thanh tu vi đã đầy; giữ phần dư khi lưu/tải và chuyển thế giới.
- Với màn được thiết kế bảo vệ/hộ tống: mục tiêu bị phá hủy cũng gây thất bại, quyết toán 30%; nếu nhân vật còn sống, ghi thất bại nhiệm vụ thay vì tử trận. Đã duyệt HP bảo vệ riêng cho An Linh Nhi ở màn 6, tâm hộ trận ở màn 10 và điểm giải phong trong phần đầu màn 12. Lượng HP còn cần chốt; các màn khác không tự thêm HP mục tiêu bảo vệ.
- Đã duyệt Ma Đô là sự kiện đối thoại/hồi ức ngắn có tương tác giữa màn 13 và 14; có bỏ qua và xem lại từ căn cứ. Huyết Tinh Thạch nhận qua sự kiện sau màn 12, dùng ngăn hấp thu huyết nhục ở pha 2 trận cuối; là đạo cụ nhiệm vụ, không chiếm ô trang bị/kỹ năng.
- Có căn cứ mới tại **Cửu Thiên Thánh Địa**. Người dùng đã xác nhận dùng tên này thay cho tên Huyền Thiên Thánh Địa trong câu trả lời ban đầu.
- Đã duyệt **bảy ô — vũ khí, đầu, thân, tay, chân, trang sức, bí bảo** và **16 món mới**, hai nhóm Siêu Phàm/Nhập Thánh, mỗi nhóm tám món gồm hai vũ khí thay thế nhau. Ô bí bảo mở qua sự kiện; bản lưu đang có bí bảo giữ quyền dùng ô/sức mạnh, nhân vật mới mở sau Hắc Phong Sơn. Áo giáp cũ chuyển sang thân, giữ sở hữu/chỉ số/cường hóa. Chi tiết tại [thiết kế hệ thống](WORLD_TWO_SYSTEMS_DRAFT.md).
- Đã chọn **Linh Tài Thông Huyền**, lịch bản vẽ chắc chắn sau màn 2/3/9/11 và tên/chỉ số đủ 16 món tại [bảng vật phẩm đã duyệt A](WORLD_TWO_ITEMS_DRAFT.md). Hai bí bảo mới là Ma Thần Hộ Ấn (màn 2) và Thánh Chủ Ngọc Ấn (màn 9), không thay quyền dùng bí bảo cũ.
- Đã duyệt **Ngưng Nguyên Đan / Hồi Xuân Đan / Tẩy Tủy Đan** từ Siêu Phàm nhất tầng; giữ ba kho/công thức, chuyển ngang số viên, luyện 1/5/10/tối đa. Đan tu vi giữ bảng 4.000–20.000; hồi phục tăng lên 60% HP, ba viên/20 giây. Giữ năm suất vĩnh viễn cũ +8 HP/+1 công, mở thêm năm suất +30/+4 sau khi dùng hết phần cũ, tổng tối đa +190 HP/+25 công; giữ đúng chỉ số đã nhận, không tính lại bằng hiệu lực mới.
- Đã duyệt năm A về [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md): gói thắng/nguồn phụ, +50% lượng cố định lần đầu, giá chế tạo/cường hóa, giá/chỉ số thú 6–10 và quyết toán theo mốc nhiệm vụ 25%/50%/75%. Bảng chi tiết các mốc theo từng màn còn chờ dữ liệu chiến đấu; không dùng thời gian đã chơi để đo tiến trình thưởng thất bại Phần 2.
- Đã duyệt mở trần 10 cho Linh Hồ/Thanh Điểu: Siêu Phàm nhất/nhị/tam lần lượt mở bậc 6/7/8, Nhập Thánh nhất/nhị mở 9/10; giữ tiến hóa và một vị trí đồng hành. Chỉ số và giá bậc mới còn chờ bảng chi tiết.
- Căn cứ đã duyệt: **Lăng Tiêu Tông trong chặng màn 1–3 → Cửu Thiên Thánh Địa sau khi hoàn thành màn 3**, chuẩn bị màn 4 trở đi; không lùi khi chơi lại. Lịch điểm tạm/Thiên Tiêu Tông/trú ẩn/trở về cũ được thay thế. Dùng đúng tên Lăng Tiêu Tông theo yêu cầu, giữ thứ tự sự kiện và mốc nhận Thánh chủ ở màn 9.
- Ưu tiên gameplay; nâng đồ họa 2.5D làm riêng. Nội dung mới cần asset phù hợp bối cảnh và đạt QA trước tích hợp tương ứng.

## 2. Các màn theo cụm sự kiện đã duyệt

Đây là cách nhóm sự kiện để chuyển thể thành màn, không phải danh mục hồi truyện của tác giả. Boss/mục tiêu/hướng các pha của cả 14 màn và cách trình bày Ma Đô đã duyệt phương án A. Đội hình, thông số chiến đấu và phần thưởng chưa chốt. Cổng cảnh giới đã duyệt tại tài liệu tiến trình; số pha và nhóm mục tiêu đã được duyệt ở mục 1.

| Thứ tự | Cụm sự kiện làm nền | Nguồn đối chiếu |
| --- | --- | --- |
| 1 | Độc Ngạo Minh — biến cố Mị Yêu | [Truyện chương 628](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-628-charm-monster/) |
| 2 | Tiểu Huyền Giới Cổ Ma — nội loạn, Lệ Dung và Hàn Phi | [Chương 659](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-659-inviolable/), [660](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-660-a-saint/) |
| 3 | Thiên Tiêu Tông — cổ động Phệ Hồn Trùng | [Chương 689](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-689-soul-devouring-insects/) |
| 4 | Phù Vân Thành — tranh đoạt Thiên Niên Ma Hoa | [Chương 711](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-711-movement/) |
| 5 | Băng Tông — tìm lại Tô Nhan | [Tư liệu Băng Tông](https://martial-peak-mp.fandom.com/wiki/Ice_Sect) |
| 6 | Di tích dưới biển — An Linh Nhi, Cửu Thiên Thần Kỹ và biến cố Nam Thánh Cô | [Mục lục truyện, chương 741–761](https://novelzi.com/novelbin/martial-peak/) |
| 7 | Tiểu Huyền Giới Dương tộc — Thần Thụ | [Chương 766](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-766-divine-tree/) |
| 8 | Sa Thành — đấu trường sinh tử và Địch Kiêu | [Chương 785](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-785-death-match/) |
| 9 | Cửu Thiên Thánh Địa — Thánh Lăng và kế thừa vị trí Thánh chủ | [Chương 794](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-794-holy-tomb/), [796](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-796-completely-comprehending-the-nine-divine-skills/) |
| 10 | Cửu Thiên Thánh Địa bị vây công, kế hoạch tạm rút | [Chương 810](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-810-great-senior/), [814](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-814-theyve-come/) |
| 11 | Long Phượng Phủ — truyền thừa Long Hoàng và chống ngoại địch | [Chương 830](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-830-senior/), [840](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-840-little-brat-youve-got-good-prospects/) |
| 12 | Giải phong Cổ Ma nhất tộc, đưa họ ra ngoài và trở về xây dựng thế lực | [Chương 863](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-863-must-be-joking/), [871](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-871-chat/) |
| 13 | Thông Huyền Trụ — cứu Mộng Vô Nhai và Hạ Ngưng Thường, phá đại trận | [Chương 911](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-911-how-much-strength-do-you-have-left/) |
| Sự kiện truyện | Ma Đô — bí mật Đại Ma Thần và nguồn gốc tai họa | [Chương 962](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-962-secrets-of-the-starry-sky/) |
| 14 | Liên minh Nhân–Yêu–Ma đại chiến Cốt tộc | [Chương 964](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-964-union/), [977](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-977-saint-realm/) |

Các đoạn nhận sư môn, luyện đan, đưa người thân từ Trung Đô sang và chuẩn bị rời đại lục có thể được nối bằng sự kiện truyện/căn cứ. Cách trình bày cụ thể chưa duyệt.

## 3. Cảnh giới và yêu cầu tỷ lệ tu vi đã duyệt

### Cấu trúc

Kế thừa Thần Du đỉnh phong tầng 10 của Trung Đô, sau đó:

**Siêu Phàm nhất tầng → nhị tầng → tam tầng → Nhập Thánh nhất tầng → nhị tầng → tam tầng đỉnh phong.**

Mỗi tầng có thanh tích lũy tu vi. Người dùng chọn cấu trúc ba tầng của mỗi đại cảnh giới, không chọn thêm các mốc đột phá sơ kỳ/trung kỳ/hậu kỳ cho từng tầng. Trần chương là **Nhập Thánh Cảnh đỉnh phong**.

[Nguồn tổng hợp cảnh giới](https://ligru.com/review-truyen-vu-luyen-dien-phong-mac-mac/). Về chuyển thể, Dương Khai ở Nhập Thánh nhất tầng khi bắt đầu hành trình tinh vực trong [chương 984](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-984-youre-also-lost/); trần nhân vật của game theo quyết định riêng của người dùng ở trên. Không tự đổi trần đã duyệt khi đối chiếu truyện.

### Yêu cầu mới từ người dùng ngày 20/10/2026

> A, nhưng phải đảm bảo tỷ lệ kinh nghiệm cần để lên cấp hợp lý so với giai đoạn đầu ở Trung Đô nhé. ở Trung Đô các cảnh giới chia thành 10 cảnh giới nhỏ, còn bây giờ chỉ còn có 3 cảnh giới nhỏ, cần lưu ý điểm này nhé

Ở đây, kinh nghiệm lên cảnh giới được hiểu là **tu vi vĩnh viễn**. XP chọn thẻ trong lượt tiếp tục là hệ tiến triển riêng.

Yêu cầu này cho phép thiết kế tỷ lệ chi phí/phần thưởng hợp lý của nội dung mới; không khôi phục mục cân hành trình theo số giờ hoặc số lượt lặp đã bỏ. Không tự thay đổi kinh tế Trung Đô để phục vụ Phần 2.

### Căn cứ từ mã 1.8.0

- `src/data/realms.ts`: tổng chi phí từ Thần Du tầng 1 đến mốc đỉnh phong hiện hành là **62.000 tu vi**, qua chín lần tăng mốc. Các chi phí lần lượt: 4.000 / 4.600 / 5.200 / 5.800 / 6.400 / 7.000 / 8.000 / 9.500 / 11.500. Mốc đỉnh phong đang chặn đi tiếp bằng `Infinity`; chi phí sang Siêu Phàm chưa tồn tại.
- Số mốc thực tế không đồng nhất hoàn toàn giữa các đại cảnh giới cũ. Khi lập bảng mới phải đếm đúng cả bước nhập cảnh và các bước nội tầng; ba tầng có hai bước nội tầng, cộng bước từ đại cảnh giới trước lên nhất tầng.
- `src/domain/profile.ts`: chỉ số vĩnh viễn đang tính từ chỉ số mảng cảnh giới; hiệu quả Tu Vi Đan dùng nhóm `floor(realm / 10)`; tu luyện ngoại tuyến phụ thuộc mốc cảnh giới và chặng đã vượt. Các công thức này cần được xét cùng cấu trúc ba tầng.
- `src/game/systems/RunEngine.ts`: XP trong lượt có công thức riêng `8 + level * 4`; tu vi từ quái, tinh anh và thưởng màn là các nguồn khác. Chưa có quyết định sửa đường XP chọn thẻ.

### Nguyên tắc thiết kế và kiểm chứng số liệu

1. Xét tổng tu vi cho một đại cảnh giới và tỷ lệ thưởng/chi phí ở từng chặng. Không sao chép giá một tầng cũ sang một tầng mới, hoặc mặc định nhân tất cả bằng 10/3.
2. Phân bổ chi phí cho bước nhập cảnh, nhất → nhị và nhị → tam theo mức tăng sức mạnh và phần thưởng tương ứng. Tránh dồn phần lớn chi phí vào một bước duy nhất mà không có lý do gameplay.
3. Mỗi lần đột phá ở cấu trúc ba tầng phải có mức tăng sức mạnh xứng đáng. Không dùng riêng số ID mới thêm làm thước đo cho toàn bộ chỉ số, đan dược và idle.
4. Đối chiếu đầy đủ thưởng màn, thưởng lần đầu, tu vi từ quái/cơ duyên, đan dược và idle; giữ luật thắng 100%, tử trận/rút lui 30%.
5. Trình duyệt bảng cảnh giới/cổng/chi phí/phần thưởng trước khi triển khai. Khi có mã được duyệt, kiểm tra tỷ lệ và gameplay thực tế, không đặt số giờ hoàn thành hay số lượt phải lặp làm mục tiêu.

Đã duyệt cổng cảnh giới từng nhóm màn và cổng đột phá ở [tiến trình Phần 2](WORLD_TWO_PROGRESSION.md), cùng toàn bộ phương án A của [tu vi/chỉ số/thưởng](WORLD_TWO_ECONOMY_DRAFT.md). Sáu bước mới chỉ tiêu tu vi, không thêm nguyên liệu phụ. Tu vi từ quái/cơ duyên, linh thạch/nguyên liệu và trọng số thưởng thất bại còn cần chốt.

## 4. Các quyết định thiết kế còn chờ

- Thông số cụ thể của cả 14 màn: đội hình, số mục tiêu, HP, sát thương, thời lượng cơ chế, ngưỡng chuyển pha và các giới hạn. Boss, mục tiêu, hướng bộ đòn/các pha và cách trình bày Ma Đô đã duyệt phương án A; tiếp tục giữ khác biệt giữa đánh bại, khảo nghiệm và thoát truy sát.
- Thông số và chi tiết tương tác của bộ kỹ năng A đang trình tại [bảng thông số kỹ năng](WORLD_TWO_SKILL_BALANCE_DRAFT.md); năm môn, sáu biến chiêu, ba thức tỉnh, hướng xử lý dấu ấn/lượt lướt và cổng mở kỹ năng đã được duyệt.
- Mốc thưởng tiến triển 25%/50%/75% cụ thể từng màn, đội hình/XP quái và cơ duyên theo tiến trình. Kinh tế vật phẩm/nguồn phụ/giá/thú/mô hình quyết toán đã duyệt, chưa sửa runtime.
- Cả bốn phương án A ở [thiết kế hệ thống](WORLD_TWO_SYSTEMS_DRAFT.md), mục 7 và năm phương án A ở [trang bị/đan](WORLD_TWO_ITEMS_DRAFT.md) đã duyệt. Tên/chỉ số/mốc mở 16 món và tên/hiệu lực/hạn mức/công thức đan đã chốt; không hỏi lại các lựa chọn này.
- Tiện ích căn cứ theo chặng, giao diện chuyển thế giới, nội dung lời kết và xem lại; điều kiện hoàn tất 14 thắng + trần cảnh giới đã duyệt.
- Danh sách asset và tiêu chí nghiệm thu cụ thể.

Bảng boss/mục tiêu/hướng các pha **đã duyệt phương án A cho cả 14 màn và Ma Đô**: [chiến đấu Phần 2, mục 3](WORLD_TWO_COMBAT_DRAFT.md#3-bảng-đối-thủ-và-mục-tiêu-của-14-màn-đề-xuất). Thông số chiến đấu còn chờ; bộ kỹ năng đầu tiên trong cùng tài liệu đã được thay thế.

Bảng cổng cảnh giới, mốc mở kỹ năng, điều kiện thắng/thua và quy tắc giữ tu vi dư **đã duyệt**: [tiến trình Phần 2](WORLD_TWO_PROGRESSION.md). Tu vi/chỉ số/thưởng cố định/đan/ngoại tuyến đã duyệt A tại [bảng kinh tế](WORLD_TWO_ECONOMY_DRAFT.md), giá vật phẩm/nguồn thu phụ/linh thú/quyết toán đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md). Thông số chiến đấu vẫn cần duyệt trước khi triển khai.

**Cập nhật trong cuộc trao đổi ngày 20/10/2026:** sau khi yêu cầu tra cứu thêm và xem [các lựa chọn theo truyện](WORLD_TWO_SKILL_OPTIONS.md), người dùng đã chọn bộ A. Bộ năm môn ở đề xuất đầu và các nhánh/liên kết của nó được thay thế về phạm vi thiết kế, không đưa vào danh sách nội dung mới đã duyệt. Hướng hiện hành nằm tại [WORLD_TWO_SKILLS_A.md](WORLD_TWO_SKILLS_A.md). Các quyết định đã duyệt về thế giới, 14 màn, mục tiêu, số pha boss, căn cứ và cảnh giới tiếp tục áp dụng.

## 5. Ràng buộc triển khai kế thừa

- Chỉ lập trình sau khi người dùng duyệt thiết kế để triển khai.
- Giữ nguyên các ID/mốc Trung Đô và tài sản cũ; không chèn cảnh giới mới vào giữa 0–46. Tách tiến độ/trần/cổng từng thế giới trước khi bổ sung nội dung.
- Trung Đô vẫn hoàn thành khi đủ sáu thắng và đạt mốc 46; chưa hoàn thành không vào được Phần 2. Hoàn thành một thế giới không bị thay đổi do nối thêm màn của thế giới khác.
- Đọc/migration/lưu/xuất nhập và công cụ test phải cùng hỗ trợ cấu trúc mới nếu có thay đổi; giữ khóa test riêng.
- Kế thừa luật tạm dừng/chọn thẻ, nguồn và bậc sát thương lúc xuất đòn, thống kê HP thực, phép chiếu/hình học chung, camera và quy tắc asset trong AGENTS.md.
- Tự kiểm tra và sửa xong trước khi bàn giao.

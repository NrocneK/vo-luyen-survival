# Phần 2 — Đề xuất trang bị, luyện đan, linh thú và căn cứ

Ngày lập: **20/10/2026** · Cập nhật: **21/10/2026**. **Đã duyệt nguyên liệu/bản vẽ A, luyện theo số lượng, linh thú A, bốn phương án chuyển tiếp ở mục 7, năm phương án A trong [bảng trang bị/đan](WORLD_TWO_ITEMS_DRAFT.md) và năm phương án A trong [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md).** Đã chốt tên/chỉ số/mốc bản vẽ/giá 16 món, đan, nguồn chiến lợi phẩm, giá/chỉ số thú 6–10 và quyết toán theo tiến trình. **Chưa lập trình.** Thông số chiến đấu, giao diện và hồ sơ asset còn chờ.

Tham chiếu [thiết kế tổng](WORLD_TWO_DESIGN.md), [tu vi/chỉ số đã duyệt](WORLD_TWO_ECONOMY_DRAFT.md), [tiến trình](WORLD_TWO_PROGRESSION.md) và [boss/mục tiêu đã duyệt](WORLD_TWO_COMBAT_DRAFT.md).

## 1. Căn cứ từ mã hiện hành

- Có 11 trang bị và bốn ô: vũ khí, áo giáp, trang sức, bí bảo. Quyền sáo và kiếm dùng chung ô vũ khí; chúng quyết định kỹ năng mặc định tương ứng. Các món cần bản vẽ có dữ liệu riêng trong `src/data/equipment.ts`.
- Cường hóa hiện tối đa +5, mỗi mức cộng 20% chỉ số gốc món đồ. Công thức giá hiện chỉ phụ thuộc mức cường hóa, chưa phân nhóm đồ mới.
- Có ba đan: Tu Vi Đan, Hồi Nguyên Đan, Cường Thể Đan. Giao diện hiện luyện từng viên. Tu Vi Đan theo cảnh giới Phần 2 đã duyệt; Hồi Nguyên Đan hồi 45% HP, mang tối đa ba viên, hồi chiêu 20 giây; Cường Thể Đan dùng tối đa năm viên, mỗi viên +8 HP/+1 công vĩnh viễn.
- Có hai linh thú Linh Hồ và Thanh Điểu, bậc 1–5, tiến hóa một lần từ bậc 3. Nội tại của mọi con đã mở đều có hiệu lực; chọn một con đồng hành. Đòn đồng hành hiện dùng công kích nhân vật và bậc thú để tính sức mạnh.
- Lobby có sân trung tâm cùng Đan phòng, Luyện khí đường, Tĩnh thất và Linh thú viên. Các dịch vụ đang dùng chung Profile.

Nguồn đối chiếu: `src/data/equipment.ts`, `recipes.ts`, `pets.ts`, `lobby.ts`, `src/domain/profile.ts`, `src/game/systems/RunEngine.ts`, các panel trong `src/ui/lobby/`. Đây là trạng thái mã 1.8.0, không xác nhận đã có nội dung Phần 2.

## 2. Trang bị — đã duyệt bảy ô, 16 món và quy tắc chuyển tiếp

Người dùng yêu cầu cập nhật lớn thành **bảy ô trang bị**: **vũ khí, đầu, thân, tay, chân, trang sức và bí bảo**. **Ô bí bảo là ô đặc biệt, mở qua sự kiện đặc biệt quan trọng trong màn.** Quyết định này thay cấu trúc bốn ô của đề xuất trước, không phải chỉ tăng tổng danh mục thành bảy vật phẩm.

Áo giáp cũ được chuyển sang ô thân, giữ ID món, sở hữu, chỉ số và mức cường hóa. Vũ khí/trang sức giữ vai trò hiện hành; đầu/tay/chân là các ô bổ sung. Không tự chuyển quyền sáo từ vũ khí sang ô tay: quyền sáo và kiếm tiếp tục là hai lựa chọn vũ khí; ô tay dùng hộ thủ/bao tay giáp. Bản lưu đang có bí bảo giữ quyền dùng ô và toàn bộ sức mạnh hiện có; nhân vật mới mở ô qua sự kiện sau khi thắng Hắc Phong Sơn theo A đã duyệt ở mục 7.

### Số món mới — đã duyệt A

**A — đã duyệt:** giữ hai nhóm Siêu Phàm/Nhập Thánh nhưng mở rộng mỗi nhóm thành **tám món**, tổng **16 món**: hai vũ khí thay thế nhau (quyền sáo/kiếm), một món cho mỗi ô đầu/thân/tay/chân/trang sức và một bí bảo. Đây là số lượng danh mục; mỗi nhân vật trang bị tối đa bảy món cùng lúc.

**B — không chọn:** trước mắt thêm một nhóm tám món, mở dần trong Phần 2.

Tên/chỉ số/yêu cầu cảnh giới và mốc bản vẽ 16 món đã duyệt A tại [bảng trang bị/đan](WORLD_TWO_ITEMS_DRAFT.md): nhóm Siêu Phàm nhận bản vẽ sau màn 2/3, Nhập Thánh sau màn 9/11. Giữ trần +5 và hệ số cường hóa 20% mỗi mức; không tự nâng chỉ số món cũ để bù các ô mới. Giá chế tạo/cường hóa nhóm mới đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md), xét cùng nguồn nguyên liệu và tổng sức mạnh bảy món.

Huyết Tinh Thạch vẫn là đạo cụ nhiệm vụ theo quyết định trước, không tự chuyển thành bí bảo chiếm ô. Hai bí bảo mới đã duyệt là **Ma Thần Hộ Ấn** qua sự kiện màn 2 và **Thánh Chủ Ngọc Ấn** qua Thánh Lăng màn 9; vẫn phải chế tạo và đủ cảnh giới.

## 3. Nguyên liệu và bản vẽ — đã duyệt A

**A — đã duyệt:** bổ sung **một nguyên liệu chung “Linh Tài Thông Huyền”**, là tên tài nguyên thiết kế cho game. Tài nguyên này nhận trong Phần 2 và được dùng cùng linh thạch/nguyên liệu đang có để chế tạo/cường hóa đồ mới, nuôi linh thú ở các bậc mới đã chọn. Không tạo đồng tiền mới hoặc đổi tài sản cũ.

Bản vẽ mới nhận **chắc chắn theo lần đầu vượt các mốc truyện phù hợp**, sau đó giữ kiến thức chế tạo. Không yêu cầu nhận ngẫu nhiên trước khi có thể chế tạo. Bản vẽ chỉ mở công thức, không tự cấp món đồ hay tiêu tu vi. Lịch nhận sau màn 2/3/9/11 đã duyệt tại bảng vật phẩm; lượng Linh Tài, giá và nguồn phụ đã duyệt A ở [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md). Linh Tài thắng màn là 12/16/22/30 theo bốn nhóm màn, lần đầu cộng 50%; còn có gói tinh anh/cơ duyên.

Giữ toàn bộ nguyên liệu, linh thạch, bản vẽ, trình độ luyện khí và trang bị đang có. Công thức Tu Vi Đan 25 linh thạch + 3 Linh Thảo đã duyệt không nhận thêm Linh Tài làm chi phí; sáu đột phá mới cũng không tiêu tài nguyên này.

Phương án không thêm nguyên liệu mới không được chọn. Bảng lượng rơi/giá và mốc bản vẽ/sự kiện bí bảo đã chốt; không thay quy tắc kế thừa ô bí bảo ở mục 7.

## 4. Luyện đan — đã duyệt tên, hiệu lực, hạn mức và luyện nhiều viên

Đã duyệt A tại [bảng trang bị/đan](WORLD_TWO_ITEMS_DRAFT.md): **Ngưng Nguyên Đan** tăng tu vi 4.000/6.000/9.000/12.000/16.000/20.000 theo sáu cảnh giới mới; **Hồi Xuân Đan** hồi 60% HP, mang tối đa ba viên/hồi chiêu 20 giây; **Tẩy Tủy Đan** thêm năm suất +30 HP/+4 công sau năm suất cũ. Bắt đầu cấp đan mới từ Siêu Phàm nhất tầng, giữ hiệu lực khi quay Trung Đô. Ba nhóm công dụng giữ nguyên, không thêm đan hộ thể.

Đã duyệt chọn số lượng luyện **1/5/10 hoặc tối đa đủ nguyên liệu**. Giao diện cho xem tổng chi phí/số viên; trừ nguyên liệu, nhận đan và cộng trình độ đúng theo số viên, giữ điều kiện công thức.

Giữ ba công thức/ID kho cũ, chuyển ngang số viên tồn kho và giữ đúng chỉ số vĩnh viễn đã nhận; không tách thêm ba kho đan cao cấp, không thêm Linh Tài vào công thức. Bảng tu vi đã duyệt trước đó được giữ nguyên, không tăng thêm một hệ số mới. Đây là thiết kế đã chốt, chưa thay runtime.

Riêng đan vĩnh viễn: bản lưu hiện có bộ đếm tối đa năm viên; giữ mỗi suất cũ +8 HP/+1 công và hoàn thành phần cũ trước năm suất mới +30/+4. Tối đa mười viên, tổng +190 HP/+25 công. Khi chuyển dữ liệu phải giữ riêng hai giai đoạn, không nhân lại viên cũ theo hiệu lực mới hoặc xóa suất chưa dùng. Giao diện ghi hiệu lực viên kế tiếp.

## 5. Linh thú — đã duyệt A

**A — đã duyệt:** mở trần **bậc 10** cho Linh Hồ và Thanh Điểu, giữ tiến hóa hiện hành và một vị trí đồng hành. Không thêm loài mới hoặc lần tiến hóa/tạo hình mới trong lựa chọn này. Bậc 1–5 và tài sản nuôi dưỡng đã có giữ nguyên.

| Bậc mới được phép nuôi tới | Cảnh giới cần đạt |
| --- | --- |
| 6 | Siêu Phàm nhất tầng |
| 7 | Siêu Phàm nhị tầng |
| 8 | Siêu Phàm tam tầng |
| 9 | Nhập Thánh nhất tầng |
| 10 | Nhập Thánh nhị tầng |

Mở giới hạn không tự tăng bậc hoặc hồi lại tài nguyên đã tiêu. Giá/chỉ số bậc 6–10 đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md): mỗi con bậc 5→10 tốn 7.000 linh thạch/63 thức ăn/39 Linh Tài. Ở bậc 10 đã tiến hóa, Linh Hồ +150 HP/+3 tầm nhặt; Thanh Điểu +30 công/+15 điểm phần trăm chí mạng; đòn đồng hành có hệ số ×2,38 công nhân vật. Giữ bảng tăng theo từng bậc đã chốt, không kéo tiếp công thức cũ theo B. Kim Long Hiển Hóa vẫn là kỹ năng, Thần Thụ giữ vai trò sự kiện, không biến thành loài đồng hành mới.

Phương án giữ trần 5 và thêm loài mới không được chọn.

## 6. Căn cứ — đã duyệt chuyển sau khi hoàn thành màn 3

Yêu cầu mới của người dùng: **“màn 1-3 lăng tiêu tông, từ màn 3 trở đi là cửu thiên thánh địa”**. Dùng đúng tên **Lăng Tiêu Tông** theo yêu cầu này. Không tự sửa tên thành Thiên Tiêu Tông hoặc đổi tên Lăng Tiêu Các của Trung Đô.

Giữ hai căn cứ: **Lăng Tiêu Tông → Cửu Thiên Thánh Địa**. Lịch điểm tạm/Thiên Tiêu Tông/trú ẩn/trở về trong đề xuất cũ được thay thế. Người dùng đã duyệt A ở mục 7, giải quyết phần mốc màn 3 chồng nhau trong câu trả lời ban đầu:

- **A — đã duyệt:** dùng Lăng Tiêu Tông trong chặng màn 1–3; chuyển Cửu Thiên sau khi hoàn thành màn 3, để chuẩn bị màn 4 trở đi.
- **B — không chọn:** dùng Lăng Tiêu Tông trong chặng màn 1–2; trước khi vào màn 3 đã chuyển Cửu Thiên.

Đây là lịch dùng căn cứ được giản lược cho gameplay. Danh sách sự kiện màn, mốc nhận vị trí Thánh chủ ở màn 9 và các cổng tu luyện/kỹ năng đã duyệt không tự bị chuyển sớm theo giao diện căn cứ.

Giữ đầy đủ quyền truy cập kho, tu luyện, luyện đan, luyện khí và linh thú. Căn cứ không tạo Profile hoặc bộ thu nhập ngoại tuyến riêng. Mốc chuyển dựa vào tiến trình vượt lần đầu, không lùi khi chơi lại màn trước. Có thể quay Trung Đô và giữ tài sản theo quyết định đã duyệt.

## 7. Bốn phương án A đã duyệt sau yêu cầu cập nhật

**Người dùng xác nhận “duyệt các phương án A”: cả bốn lựa chọn A dưới đây đã duyệt. Cột B chỉ giữ để đối chiếu lựa chọn không được chọn.** Đây là lần duyệt phạm vi/chuyển tiếp; sau đó tên/chỉ số/mốc mở từng món và hiệu lực/hạn mức đan đã duyệt ở [bảng vật phẩm](WORLD_TWO_ITEMS_DRAFT.md), giá đồ/nguồn nguyên liệu/linh thú/quyết toán đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md).

| Câu | A — đã duyệt | B — không chọn |
| --- | --- | --- |
| 1. Số món cho bảy ô | Hai nhóm Siêu Phàm/Nhập Thánh, mỗi nhóm tám món, tổng 16; hai vũ khí là lựa chọn thay nhau trong một ô. | Một nhóm tám món, mở dần trong Phần 2. |
| 2. Bí bảo và bản lưu cũ | Bản lưu đang có bí bảo giữ quyền dùng ô và sức mạnh hiện có. Nhân vật mới mở ô qua sự kiện sau thắng Hắc Phong Sơn, mốc hiện có bản vẽ bí bảo đầu tiên; bí bảo Phần 2 tiếp tục mở theo sự kiện quan trọng riêng. | Áp khóa mới cả với bản lưu cũ: chỉ mở ô sau Thánh Lăng, màn 9 Phần 2; bí bảo cũ giữ trong kho nhưng chưa dùng được trước mốc. |
| 3. Đổi tên/hiệu lực đan với kho cũ | Nâng cấp ba nhóm đan đang có cho Phần 2, đổi tên/hiệu lực, chuyển ngang số viên tồn kho và giữ đúng chỉ số vĩnh viễn đã nhận. Trình tiếp tên, hiệu lực, hạn mức dùng mới và giá/công thức. | Giữ riêng các đan cũ, bổ sung ba phiên bản cao cấp Phần 2 với kho và công thức riêng. |
| 4. Mốc đổi căn cứ | Sau hoàn thành màn 3 chuyển từ Lăng Tiêu Tông sang Cửu Thiên, dùng khi chuẩn bị màn 4. | Trước khi vào màn 3 đã chuyển Cửu Thiên. |

Phương án 2A cần chuyển dữ liệu đủ để không khóa lại ô của người đang có bí bảo, không cộng hai lần chỉ số. Hắc Phong Sơn đã được duyệt làm sự kiện mở ô cho nhân vật mới, dựa trên mốc bản vẽ bí bảo đầu tiên hiện có. Hai bí bảo Phần 2 đã chốt mở bản vẽ qua sự kiện màn 2/9; không áp phương án 2B khóa lại bí bảo cũ tới màn 9.

## 8. Phần cần hoàn thiện tiếp

- Tên/chỉ số/mốc mở 16 món và tên/hiệu lực/hạn mức/công thức ba nhóm đan đã duyệt tại [trang bị và đan](WORLD_TWO_ITEMS_DRAFT.md), giá đồ đã duyệt tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md); còn cần kiểm chứng cùng chỉ số đối thủ khi triển khai.
- Chiến lợi phẩm/giá/chỉ số thú và mô hình quyết toán đã duyệt A tại [kinh tế vật phẩm](WORLD_TWO_LOOT_CRAFT_DRAFT.md); còn cần mốc nhiệm vụ cụ thể 14 màn và kiểm chứng cùng dữ liệu chiến đấu. Nguồn/bậc thống kê phải phản ánh bậc thú thật, không dùng trần kỹ năng 6 thay bậc thú 10.
- Giao diện bảy ô và hai căn cứ; áo giáp cũ chuyển thân, ô mới chưa có đồ không tự cấp chỉ số. Đọc được bản lưu cũ, giữ ID/mức nâng, kiểm tra nhập/xuất và tiến trình test riêng.
- Thông số kỹ năng/màn, quyết toán theo mục tiêu, danh sách asset và tiêu chí nghiệm thu trước khi duyệt triển khai.

Yêu cầu đan mới mở lại phần tên/hiệu lực đan, không tự thay các chi phí đột phá, thưởng cố định, sức mạnh cảnh giới hoặc ngoại tuyến đã duyệt. Chưa sửa mã gameplay.

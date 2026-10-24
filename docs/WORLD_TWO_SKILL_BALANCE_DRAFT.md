# Phần 2 — Đề xuất thông số bộ Ma Thần và Long Hoàng

Ngày lập: **21/10/2026**. **Đã chốt toàn bộ sáu phương án A và triển khai ở 2.0.0** theo ủy quyền tiếp tục của người dùng. Tài liệu giữ các phương án B để đối chiếu lịch sử, không dùng B trong runtime. Xem [triển khai](WORLD_TWO_IMPLEMENTATION.md) và [QA](WORLD_TWO_QA.md).

Tên/năm môn, sáu biến chiêu, ba thức tỉnh, giới hạn hai lượt lướt và cổng mở đã duyệt tại [bộ kỹ năng A](WORLD_TWO_SKILLS_A.md). Giữ điều kiện thẻ trong lượt, sáu ô mang theo gồm kỹ năng mặc định theo vũ khí, tấn công bậc 1–5/thức tỉnh 6, hỗ trợ 1–5 và không lưu bậc/nhánh vào Profile. Không thêm kỹ năng/nhánh thứ ba hoặc đổi liên kết đã chốt.

Ký hiệu **C** là công kích nhân vật tại lúc xuất đòn, đã tính trang bị, linh thú, thẻ và Nhập Ma nếu đang bật. **C0** là công cùng thời điểm trước hệ số Nhập Ma. Hệ số sát thương trong bảng nhân với C, sau đó theo luật chí mạng/nhận sát thương đang có, trừ ngoại lệ nổ dấu ấn được ghi riêng. Bán kính/chiều dài/tốc độ dùng tọa độ thế giới. Hồi chiêu là giây mô phỏng trước tốc đánh; trần thực tế ở mục 6.

## 1. Lựa chọn 1 — Diệt Hồn Kim Quang

**A — đề xuất:** xung hình quạt **80°**, tầm **6,5**, gây một lần sát thương cho mỗi địch chạm vùng. Chốt gốc/hướng khi bắt đầu xuất chiêu; báo trước **0,2 giây**, nhân vật vẫn di chuyển được. Khi không có địch hợp lệ trong tầm, giữ chiêu sẵn sàng, không tiêu hồi chiêu.

| Bậc | Sát thương xung | Hồi chiêu cơ bản |
| --- | --- | --- |
| 1 | 1,50 × C | 3,8 giây |
| 2 | 1,85 × C | 3,6 giây |
| 3 | 2,20 × C | 3,4 giây |
| 4 | 2,55 × C | 3,2 giây |
| 5 | 2,90 × C | 3,0 giây |
| 6 — Diệt Thế Kim Quang | 4,00 × C | 2,8 giây |

Biến chiêu áp trên chỉ số cơ bản:

| Nhánh đã duyệt | Số liệu đang đề xuất |
| --- | --- |
| **Tán Quang** | Góc **140°**, tầm 6,5; sát thương xung/nổ dấu ấn **×0,80**, sức mạnh tăng sát thương của dấu ấn **×0,75**. |
| **Phá Hồn** | Góc **35°**, tầm **8**; sát thương xung/nổ dấu ấn **×1,30**, sức mạnh tăng sát thương của dấu ấn **×1,25**. Ưu tiên hướng boss đang trong tầm, rồi tinh anh, rồi địch gần nhất. |

Mặc định/Tán Quang chọn hướng địch gần nhất. Xung không có trần số địch, nhưng mỗi địch chỉ nhận một hit từ một xung, không tạo nhiều luồng chồng vào cùng mục tiêu. Bậc 6 giữ hình học của nhánh đã chọn và thêm nổ dấu ấn theo mục 6, không tự thêm lần xung thứ hai.

**B:** cùng hình học/hồi chiêu nhưng tăng **20% sát thương xung trực tiếp**, giảm **20% sức mạnh tăng sát thương của dấu ấn** so với A; nổ dấu ấn riêng giữ hệ số A. Thiên về sát thương tự thân hơn phối hợp. Đây là bộ số thay thế, không phải biến chiêu mới.

## 2. Lựa chọn 2 — Già Thiên Thủ

**A — đề xuất:** chưởng giáng vào vị trí địch gần nhất trong **tầm chọn 7**, chốt tâm khi phát chiêu, báo trước **0,4 giây**. Đánh một lần mỗi mục tiêu trong vùng; không dịch tâm để đuổi mục tiêu.

| Bậc | Sát thương một chưởng cơ bản | Bán kính | Hồi chiêu cơ bản |
| --- | --- | --- | --- |
| 1 | 3,0 × C | 1,6 | 5,5 giây |
| 2 | 3,8 × C | 1,8 | 5,3 giây |
| 3 | 4,6 × C | 2,0 | 5,1 giây |
| 4 | 5,4 × C | 2,2 | 4,9 giây |
| 5 | 6,2 × C | 2,4 | 4,7 giây |
| 6 — Già Thiên Ma Thủ | 8,0 × C | 2,6 | 4,5 giây |

| Nhánh đã duyệt | Số liệu đang đề xuất |
| --- | --- |
| **Trấn Địa** | Chưởng trực tiếp **×0,85**; để lại vùng làm chậm **2,5 giây**, cùng tâm/bán kính chưởng. Giảm tốc quái thường **35%**, tinh anh **20%**, boss **10%**. Vùng không tự gây thêm DPS. |
| **Điệp Chưởng** | Hai chưởng, mỗi chưởng **×0,65**, cách **0,3 giây**, cùng tâm/bán kính đã chốt; tổng khi trúng cả hai là **×1,30**. Không có vùng làm chậm. |

Chưởng cuối đẩy quái thường **0,8 đơn vị** ra xa tâm; tinh anh/boss không bị đẩy. Nhánh Điệp chỉ đẩy ở chưởng thứ hai để cú đầu không tự hất mục tiêu khỏi cú sau. Nhánh Trấn và bản chưa có nhánh dùng cú đơn để đẩy. Vật cản/biên giới hạn chuyển vị theo hình học hiện hành, không hất xuyên vật cản.

**Thức tỉnh bậc 6:** thêm đúng **một xung chấn 3,0 × C**, bán kính **3**, sau chưởng cuối **0,25 giây**. Xung không đẩy, không tạo thêm vùng chậm/chưởng, không nhân đôi vì Điệp Chưởng. Hệ số ×0,85/×0,65 của nhánh chỉ áp cho chưởng; xung thức tỉnh dùng riêng 3,0 × C. Tất cả giữ nguồn bậc 6 của lần xuất chiêu.

**B:** cùng hồi chiêu/nhánh nhưng bán kính mọi phần **×0,85**, sát thương chưởng/xung **×1,20**. Vùng chậm thu cùng tỷ lệ với chưởng, giữ thời lượng/tỷ lệ làm chậm. Phạm vi hẹp hơn, dồn sát thương cao hơn.

## 3. Lựa chọn 3 — Kim Long Hiển Hóa

**A — đề xuất:** đòn long ảnh lớn, báo trước **0,35 giây**. Chốt gốc/hướng theo địch gần nhất trong chiều dài đánh cơ bản; nhân vật di chuyển tự do, long ảnh không bám theo nhân vật hoặc chiếm ô linh thú.

| Bậc | Hệ số cơ bản P | Chiều dài cơ bản | Bề rộng toàn phần | Hồi chiêu cơ bản |
| --- | --- | --- | --- | --- |
| 1 | 6 × C | 7 | 1,2 | 9,0 giây |
| 2 | 8 × C | 7,5 | 1,3 | 8,6 giây |
| 3 | 10 × C | 8 | 1,4 | 8,2 giây |
| 4 | 12 × C | 8,5 | 1,5 | 7,8 giây |
| 5 | 14 × C | 9 | 1,6 | 7,4 giây |
| 6 — Phong Lôi Kim Long | 18 × C | 10 | 1,8 | 7,0 giây |

P ở bảng là lượng sát thương của một lần quét, đã gồm công nhân vật. Chưa có biến chiêu: long ảnh lao theo đoạn thẳng cơ bản, tốc độ **10 đơn vị/giây**, mỗi mục tiêu trúng tối đa một lần. Kết thúc khi đi hết chiều dài hoặc tới biên thật, không phải một viên đạn thường tự hết hạn theo số giây.

| Nhánh đã duyệt | Số liệu đang đề xuất |
| --- | --- |
| **Du Long** | Chiều dài **×1,40**, bề rộng **×1,25**, giữ tốc độ 10; sát thương **P** mỗi địch, tối đa một lần/địch/cast. Kiểm tra quét để không bỏ sót giữa hai frame. |
| **Long Tức** | Long ảnh đứng tại gốc đã chốt; chiều dài bằng cơ bản, bề rộng **×0,75**. Phun **1,4 giây**, bảy nhịp ở 0,2/0,4/…/1,4 giây từ lúc luồng bắt đầu. Mỗi nhịp **0,20 × P** nếu địch còn trong luồng, tổng tối đa **1,40 × P**. |

**Thức tỉnh bậc 6:** lôi kình chỉ nằm trong chính vùng đòn, không lan sang địch ngoài đường:

- Du Long thêm **0,35 × P** cho mỗi địch trúng đường lao, một lần/địch; tổng **1,35 × P**.
- Long Tức thêm **0,05 × P** mỗi nhịp, tối đa bảy nhịp; tổng lửa/long ảnh và lôi kình là **1,75 × P** nếu giữ mục tiêu trong cả luồng.
- Phần long ảnh và lôi kình cùng nhịp dùng chung kết quả chí mạng; gộp sát thương cùng nhịp vào một hit trước khi tăng nhờ dấu ấn/chặn overkill, ghi HP thực đúng một lần dưới nguồn Kim Long bậc 6. Phát cả hiệu ứng long/lôi trước khi xử lý đòn có thể kết liễu boss, không gọi thêm damage sau khi đã chốt kết quả.

Không tăng tick theo tốc đánh; tốc đánh chỉ giảm thời gian giữa các lần xuất chiêu theo mục 6. Hình chữ nhật/đoạn quét dùng bề rộng toàn phần, không nhầm thành bán kính rồi nhân đôi vùng đánh. Biên bản đồ cắt đúng vùng vật lý và hiệu ứng.

**B:** giảm **15% P** và **15% hồi chiêu cơ bản** của mọi bậc, giữ nhánh/kích thước/số nhịp; vẫn chịu trần hồi thực tế ở mục 6. Đòn nhỏ hơn nhưng xuất hiện thường hơn khi chưa chạm trần hồi.

## 4. Lựa chọn 4 — Nhập Ma

**A — đề xuất:** bạo phát theo chu kỳ **12 giây**, tính từ đầu một pha bật tới đầu pha kế tiếp, không giảm bởi tốc đánh. Khi học bậc 1 qua thẻ, pha đầu bắt đầu khi tiếp tục playing; không có buff chỉ vì mang môn chưa kích hoạt.

| Bậc hỗ trợ | Thời gian bật | Tăng công trong pha | Giảm sát thương nhận |
| --- | --- | --- | --- |
| 1 | 3,0 giây | +20% | 10% |
| 2 | 3,5 giây | +25% | 12% |
| 3 | 4,0 giây | +30% | 14% |
| 4 | 4,5 giây | +35% | 16% |
| 5 | 5,0 giây | +40% | 18% |

Trong pha bật, `C = C0 * (1 + tỷ lệ tăng công)`. Không cộng rồi nhân hệ số Nhập Ma lần nữa trong từng kỹ năng. Công này dùng cho cả đòn nhân vật và tính đòn đồng hành theo luật đang có; không buff công của NPC, không tăng HP/hồi HP và không tiêu HP để bật.

Giảm sát thương chỉ áp nhân vật, không bảo vệ thay An Linh Nhi/tâm trận/điểm giải phong. Áp một lần sau giáp và nhân với các hệ số giảm còn lại, không cộng thẳng tỷ lệ. Ví dụ đường hiện hành được mở rộng thành `max(1, damage - armor*1.6) * (1 - wardReduction) * (1 - nhapMaReduction)` khi các hiệu ứng thực sự đang bật; thống kê nhận HP thực sau cùng, không thay nguồn đòn địch.

Nâng bậc cập nhật tỷ lệ tăng công/giảm sát thương ngay; không làm mới chu kỳ hoặc kéo lại thời điểm kết thúc pha đang bật. Thời lượng mới áp từ pha kế tiếp. Các đòn rời rạc đã xuất giữ công/nguồn/bậc đã chốt, kể cả khi Nhập Ma hết trước khi trúng; đòn aura liên tục cũ giữ mô hình phát sát thương từng bước hiện hành. Long Tức mới chốt công cho cả luồng lúc xuất, không nhân lại khi tick.

Thức tỉnh Kim Quang/Già Thiên vẫn hoạt động sau khi đã học bậc 6 dù Nhập Ma đang trong pha nghỉ, đúng quyết định trước. Mọi đồng hồ dừng khi pause/levelup/kết quả.

**B:** giữ kiểu bạo phát chu kỳ nhưng dùng **15 giây**, thời gian bật **4/4,5/5/5,5/6 giây**, tăng công **25/30/35/40/45%**; giảm sát thương giữ bảng A. Pha mạnh và dài hơn, khoảng cách giữa các đợt lớn hơn. Không đổi thành buff thường trực.

## 5. Lựa chọn 5 — Phong Lôi Vũ Dực và Khinh Thân Quyết

**A — đề xuất:** có hai lượt khi đã kích hoạt từ bậc 1, hồi từng lượt nối tiếp; giữ thời gian một cú lướt **0,24 giây**, hệ số tốc độ lướt **×3,6** hiện hành. Vũ Dực không tăng thêm thời gian bất tử; Khinh Thân Quyết vẫn phụ trách phần này.

| Bậc Vũ Dực | Hồi một lượt trước Khinh Thân Quyết |
| --- | --- |
| 1 | 4,2 giây |
| 2 | 3,9 giây |
| 3 | 3,6 giây |
| 4 | 3,3 giây |
| 5 | 3,0 giây |

Hồi thực tế mỗi lượt: `max(2, hồi cơ bản * (1 - 0.05 * bậc Khinh Thân))`. Không dùng tốc đánh để giảm hồi lướt. Hai lượt đã tiêu phải hồi nối tiếp; ví dụ cả hai môn bậc 5 là **2,25 giây/lượt**, từ hết sạch tới đầy hai lượt cần 4,5 giây mô phỏng.

Khi học Vũ Dực bậc 1: mở thêm một lượt sẵn dùng, giữ tiến trình hồi của lượt cũ; không xóa rồi cấp đầy lại cả hai. Nâng bậc sau đó không tặng lượt. Nếu thời gian hồi thay đổi, giữ tỷ lệ hoàn thành của lượt đang hồi; các lượt chờ dùng thời gian mới.

Mỗi lần nhấn tiêu tối đa một lượt; giữ phím không tự dùng sạch. Trong cú lướt đang chạy có thể xếp **một lệnh lướt kế tiếp** từ lần nhấn riêng; cú sau bắt đầu khi cú trước kết thúc và chỉ trừ lượt lúc thực sự bắt đầu. Lệnh chờ bị xóa khi pause/levelup/kết quả, không làm nhân vật tự lướt sau khi mở lại giao diện. Cửa sổ bất tử lướt đang có là **0,4 + 0,05 × bậc Khinh Thân**, tối đa 0,65 giây. Với hai lượt, lấy thời điểm kết thúc muộn hơn giữa cửa sổ còn lại và cửa sổ cú mới, không cộng hai khoảng vào một đợt kéo dài. Vật cản/biên và quãng dịch chuyển dùng luật va chạm chung.

Không có Vũ Dực đang kích hoạt thì giữ một lượt và hồi **4,5 × (1 - 0,05 × bậc Khinh Thân)** như mã cũ. Sở hữu truyền thừa vĩnh viễn không tự cho hai lượt trong mọi run khi chưa lấy thẻ.

**B:** vẫn hai lượt hồi nối tiếp, giữ hồi cơ bản **4,5 giây** ở cả năm bậc; mỗi bậc tăng **3% quãng lướt**, tối đa 15%, bằng tốc độ lướt trong cùng 0,24 giây. Khinh Thân giảm hồi như cũ, không tăng bất tử từ Vũ Dực. Thiên về quãng né thay vì hồi nhanh.

## 6. Lựa chọn 6 — dấu ấn, nổ thức tỉnh và quy tắc phối hợp

**A — đề xuất:** dấu ấn kéo dài **3 giây** từ lần áp thành công gần nhất, tăng sát thương hit hợp lệ theo bậc Kim Quang tại lúc đặt ấn:

| Bậc Kim Quang | Quái thường/tinh anh | Boss |
| --- | --- | --- |
| 1 | +10% | +5% |
| 2 | +12% | +6% |
| 3 | +14% | +7% |
| 4 | +16% | +8% |
| 5 | +18% | +9% |
| 6 | +20% | +10% |

Tán Quang/Phá Hồn nhân tiếp hệ số sức mạnh ấn ở mục 1. Ví dụ mặc định A: Phá Hồn bậc 6 tăng **25% lên quái/tinh anh, 12,5% lên boss**; Tán Quang tương ứng **15%/7,5%**. Không thay bằng phần trăm HP tối đa boss.

Quy tắc áp/nhận tăng sát thương:

- Xử lý sát thương xung trước, rồi đặt/làm mới ấn nếu mục tiêu còn sống. Hit đầu không tự nhận lợi ích từ ấn vừa tạo; hit tới khi ấn cũ đang hoạt động được hưởng ấn cũ trước khi làm mới.
- Áp lại làm mới thời gian 3 giây, không cộng dồn tỷ lệ. Nếu có đòn bậc thấp cũ đến trễ, không hạ sức mạnh ấn cao hơn đang còn hiệu lực. Một địch chỉ có một hiệu ứng tăng sát thương Kim Quang.
- Áp cho sát thương hợp lệ của nhân vật/linh thú, gồm đạn, chưởng, lôi, đòn trễ, Viêm Hoàn, vùng đốt và các nhịp Long Tức. Nguồn/bậc gốc được giữ; phần tăng nằm trong HP thực mất của chính đòn đó, không ghi thêm một bản sao dưới Kim Quang.
- Không buff sát thương từ NPC, địch hoặc môi trường. Không tự sinh một hit mới chỉ để biểu diễn phần cộng; chính nổ dấu ấn không nhận tăng sát thương từ ấn và không kích ấn khác.

### Nổ thần hồn bậc 6

Mỗi mục tiêu trúng Kim Quang bậc 6 được đặt **hẹn nổ sau 2 giây** nếu chưa có hẹn. Các lần trúng tới chỉ làm mới ấn, **không lùi hẹn nổ đang chờ**. Nổ một lần **2,0 × C của đòn bậc 6 đã đặt hẹn**, nhân hệ số sát thương nhánh Tán/Phá ở mục 1; không chí mạng, không lan sang địch khác, không đẩy hoặc đặt thêm ấn.

Sau nổ, dấu ấn tăng sát thương tiếp tục đến thời điểm hết hạn của nó. Muốn đặt hẹn nổ kế tiếp cần một lần trúng Kim Quang bậc 6 mới; không tự lặp nổ chỉ vì ấn còn. Mỗi mục tiêu không thể nổ hơn một lần trong 2 giây. Khi mục tiêu chết/rời sân, hủy hẹn, không chuyển sang địch khác hoặc cộng overkill.

Đòn bậc 5 không đặt hẹn. Nâng lên 6 không làm toàn bộ ấn cũ tự nổ; phải có hit bậc 6. Công/nhánh/bậc của hẹn đã đặt không đổi do thẻ hoặc Nhập Ma lên/xuống sau đó. Nổ là một đòn độc lập của Diệt Thế Kim Quang bậc 6, ghi trước kill/finish nếu kết liễu boss.

### Tốc đánh, kháng khống chế và đồng hồ

Hồi thực tế của ba tấn công mới là `max(sàn riêng, hồi cơ bản / (1 + haste))` với haste theo trần hiện hành 2,5:

| Môn mới | Sàn hồi thực tế |
| --- | --- |
| Diệt Hồn Kim Quang | 1 giây |
| Già Thiên Thủ | 1,5 giây |
| Kim Long Hiển Hóa | 2 giây |

Hồi bắt đầu khi bắt đầu xuất chiêu/chốt hình học. Tốc đánh không rút thời gian báo trước, khoảng cách hai chưởng, thời gian luồng/nhịp Long Tức, hẹn nổ ấn hoặc chu kỳ Nhập Ma. Sàn chỉ áp ba môn mới, không sửa công thức hồi môn cũ.

Vùng chậm mới chồng nhau lấy hiệu lực mạnh nhất, không cộng tỷ lệ. Tinh anh/boss không chịu đẩy; boss chậm 10% theo Trấn Địa A. Chậm ảnh hưởng di chuyển tìm mục tiêu, không kéo giãn hoạt ảnh/báo đòn, nhịp sinh đạn hoặc thời lượng đòn lao đã phát. Các hình học va chạm/hiệu ứng dùng cùng dữ liệu, không lấy vùng vẽ để suy riêng sát thương.

Đồng hồ kỹ năng/vùng/ấn/lướt dùng thời gian mô phỏng, dừng tại levelup/pause/kết quả; tăng tốc test vẫn chia bước nhỏ và dừng đúng. Đòn đã xuất giữ nguồn/bậc, HP thực sau tất cả hệ số và chặn overkill theo AGENTS.md. Nhịp liên tục dùng cửa sổ chí mạng 0,4 giây mô phỏng theo cast/mục tiêu và gom số 0,35 giây thực như hướng Viêm Hoàn, không tự cộng damage vì renderer phát sóng/flash.

**B:** giữ mọi quy tắc phối hợp của A nhưng hẹn nổ thức tỉnh **3 giây** thay vì 2; làm mới vẫn không lùi hẹn. Khi nổ và hết hạn ấn cùng thời điểm, xử lý đòn nổ tới hạn trước khi xóa ấn; không nổ sau khi mục tiêu đã chết/kết quả đã chốt. Các con số dấu ấn, sàn hồi và kháng khống chế giữ A.

## 7. Đối chiếu số học và giới hạn lần duyệt

Theo A, bỏ qua chí mạng, tốc đánh, dấu ấn và việc mục tiêu rời vùng:

| Đòn bậc 6 | Sát thương tối đa vào một mục tiêu/lần xuất | Tỷ lệ chia hồi cơ bản |
| --- | --- | --- |
| Già Thiên Ma Thủ — Trấn Địa | 8×0,85 + 3 = **9,8 × C** | **2,178 × C/giây** |
| Già Thiên Ma Thủ — Điệp Chưởng | 8×0,65×2 + 3 = **13,4 × C** | **2,978 × C/giây** |
| Phong Lôi Kim Long — Du Long | 18×1,35 = **24,3 × C** | **3,471 × C/giây** |
| Phong Lôi Kim Long — Long Tức | 18×(0,20+0,05)×7 = **31,5 × C** | **4,5 × C/giây** |

Nhập Ma bậc 5 bật 5/12 thời gian, tăng công trung bình lý thuyết khoảng **16,67%** nếu sát thương phân bố đều; đòn lớn chốt trong pha bật có thể hưởng khác trung bình này. Vũ Dực 5 + Khinh Thân 5 hồi **2,25 giây/lượt**, không hồi đồng thời hai lượt. Long Tức bậc 6 báo trước 0,35 + phun 1,4 = **1,75 giây**, thấp hơn sàn hồi 2; Du Long đi tối đa 14 đơn vị ở tốc độ 10 cũng có tổng 1,75 giây từ đầu báo trước tới cuối đòn, trước khi bị biên cắt.

Đối chiếu mã cũ làm nền: `src/data/combatSkills.ts`, `awakenings.ts`, `augments.ts`, `skills.ts` và `src/game/systems/RunEngine.ts`. Ví dụ Dương Viêm Chưởng bậc 6 có ba luồng chính 4,2× công mỗi luồng, hồi 2,4 giây trước tốc đánh; mức thực vào cùng địch tùy hình học/nhánh/nổ. Không lấy hệ số chia hồi đơn lẻ để khẳng định môn mới mạnh hơn/yếu hơn mọi môn cũ; cần xét phạm vi, thời điểm, mục tiêu và chi phí ô hỗ trợ.

Sáu lựa chọn đã chốt A: **(1) Kim Quang/hai nhánh; (2) Già Thiên/hai nhánh/thức tỉnh; (3) Kim Long/hai nhánh/thức tỉnh; (4) Nhập Ma; (5) Vũ Dực/Khinh Thân; (6) dấu ấn/nổ/sàn hồi/tương tác.** Phương án B ở một nhóm chỉ thay các số ghi rõ tại nhóm đó. Số học trên đã được nối vào mô phỏng và kiểm thử; kết quả thực tế/phạm vi kiểm tra ghi tại WORLD_TWO_QA.md.

Mốc mở/giới hạn kỹ năng đã duyệt giữ nguyên. Đội hình/HP/công/pha boss/mục tiêu/mốc nhiệm vụ 14 màn, giao diện trạng thái và asset đã được triển khai theo ủy quyền ngày 21/10/2026. Không sửa kinh tế Trung Đô, số liệu đã duyệt hoặc cân theo thời lượng/số lượt hành trình.

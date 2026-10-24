# Phần 2 — Đề xuất kỹ năng và boss

Ngày lập: **20/10/2026**. Nền gameplay: **1.8.0**.

**Trạng thái: đã duyệt phương án A về boss, mục tiêu và hướng các pha của cả 14 màn, cùng cách trình bày sự kiện Ma Đô. Chưa lập trình.** Các lựa chọn đã duyệt được ghi ở [thiết kế Phần 2](WORLD_TWO_DESIGN.md). Thông số chiến đấu, ngưỡng chuyển pha và thưởng vật phẩm còn chờ; tu vi thắng cố định/cộng lần đầu đã duyệt tại [bảng kinh tế](WORLD_TWO_ECONOMY_DRAFT.md).

**Bộ kỹ năng mục 2 đã được thay thế:** sau khi tra cứu thêm, người dùng chọn **bộ A — Ma Thần và Long Hoàng**: Diệt Hồn Kim Quang, Già Thiên Thủ, Kim Long Hiển Hóa, Nhập Ma và Phong Lôi Vũ Dực. Xem [thiết kế hiện hành của bộ A](WORLD_TWO_SKILLS_A.md). Mục 2 bên dưới chỉ giữ lịch sử đề xuất, không đưa các môn/nhánh/liên kết đó vào phạm vi đã duyệt. Bảng boss ở mục 3 có trạng thái duyệt riêng theo từng nhóm màn.

## 1. Khung đã duyệt

- 14 màn chiến đấu; Ma Đô là sự kiện truyện trước đại chiến cuối chương.
- Mục tiêu đa dạng: sinh tồn, giữ trận, phá vây/giải cứu và khảo nghiệm; tiếp tục dùng XP/thẻ trong lượt.
- Boss thông thường hai pha, boss cuối ba pha.
- Ba tấn công, hai hỗ trợ mới; mỗi tấn công có hai biến chiêu và một thức tỉnh.
- Mở kỹ năng mới bằng truyền thừa theo mốc truyện và cảnh giới; sau đó chọn mang vào lượt và dùng thẻ kích hoạt/nâng bậc.
- Kế thừa trần tấn công bậc 6/hỗ trợ bậc 5. Điều kiện thức tỉnh: tấn công đúng bậc 5 + hỗ trợ liên kết bậc 1–5; giữ biến chiêu, không tiêu hỗ trợ.

## 2. Bộ năm kỹ năng đề xuất cũ — đã được thay thế

### Nguồn và cách chuyển thể

Phệ Hồn Trùng xuất hiện trong [truyện chương 689](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-689-soul-devouring-insects/). Kiếm và xiềng trói thuộc nhóm Cửu Thiên Thần Kỹ, có thể thấy trong [chương 795](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-795-cracking/) và [danh sách thần kỹ của Thánh địa](https://martial-peak-mp.fandom.com/wiki/Nine_Heavens_Holy_Land). Tên hiển thị tiếng Việt của chiêu xiềng được đề xuất là **Khốn Thiên Tỏa**, tương ứng chiêu được bản Anh gọi là Imprisoning Heaven Chain/Imprison Heavenly Lock.

Đối chiếu tên Việt bổ sung: [Vidian](https://vidian.org/nhan-vat/duong-khai.html) và [một bản dịch truyện](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-932) dùng **U Thiên Tỏa**. Khốn Thiên Tỏa ở bản nháp này là tên hiển thị đề xuất trước khi có đối chiếu đó; nếu giữ môn xiềng, ưu tiên tên U Thiên Tỏa. Không dùng tên nháp như một xác nhận tên nguyên tác.

Thần thức tinh luyện và cảm ngộ không gian được chuyển thể thành thẻ hỗ trợ. Kỹ thuật xé không gian được Dương Khai nghiên cứu trong [chương 828](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-828-tearing-space/). Hiệu ứng thẻ, biến chiêu và tên thức tỉnh dưới đây là thiết kế riêng cho game, không gán toàn bộ các hiệu ứng hoặc tên này cho nguyên tác.

| Kỹ năng đề xuất | Loại | Vai trò và cơ chế chính | Mốc mở đề xuất |
| --- | --- | --- | --- |
| Phệ Hồn Trùng | Tấn công | Tự phái bầy trùng bám một mục tiêu, gây sát thương theo nhịp; khi mục tiêu chết, bầy tìm mục tiêu khác trong tầm. Bầy là hiệu ứng kỹ năng, không chiếm ô linh thú. | Hoàn thành màn 3, cổ động Phệ Hồn Trùng |
| Huyền Thiên Kiếm | Tấn công | Tự chọn điểm có địch, báo trước ngắn rồi giáng kiếm khí lớn xuống vùng đó. Đòn mạnh, hồi chiêu dài; vị trí chém chốt lúc xuất chiêu. | Hoàn thành màn 6, di tích dưới biển |
| Khốn Thiên Tỏa | Tấn công | Xiềng khóa một vùng, giữ quái thường và gây sát thương theo nhịp; chuyên tạo khoảng trống khi bị bao vây. Boss nhận dạng làm chậm có giới hạn thay vì bị giữ cứng. | Hoàn thành màn 9, Thánh Lăng |
| Thần Thức Tinh Luyện | Hỗ trợ | Tăng tầm tự chọn mục tiêu của kỹ năng tấn công và tăng sát thương kỹ năng lên tinh anh/boss. Áp dụng cả bộ kỹ năng cũ theo loại đòn phù hợp. | Hoàn thành màn 3 |
| Không Gian Cảm Ngộ | Hỗ trợ | Giảm hồi chiêu lướt và làm chậm đạn địch trong một vùng nhỏ quanh nhân vật. Tốc độ nhân vật/đòn khác vẫn dùng quy tắc hiện hành. | Sự kiện nghiên cứu không gian sau màn 10; mở trước màn 11 |

Điều kiện cảnh giới tối thiểu cho từng môn sẽ chốt cùng bảng tu vi/cổng màn; chưa gán con số ở đây. Thần thức đã tồn tại trong hành trình nhân vật; thẻ mới thể hiện tinh luyện khả năng ấy, không viết lại thời điểm nhân vật có thần thức.

Các kỹ năng tấn công mới tự xuất chiêu như bộ hiện tại; giữ điều khiển quyền/kiếm, lướt và dùng đan. Hai phép kiếm/xiềng là kỹ năng được mang theo, không bắt buộc đổi vũ khí hoặc thay kỹ năng mặc định theo vũ khí.

### Sáu biến chiêu đề xuất

Giữ quy tắc chọn một nhánh từ bậc 2; nhánh không tăng bậc kỹ năng và được giữ khi thức tỉnh. Chưa chốt phần trăm, cooldown, bán kính hoặc số mục tiêu.

| Tấn công | Nhánh A | Nhánh B |
| --- | --- | --- |
| Phệ Hồn Trùng | **Quần Phệ:** chia bầy lên nhiều mục tiêu; giảm sát thương tập trung trên một mục tiêu để đổi lấy khả năng dọn đàn. | **Thâm Thực:** tập trung một mục tiêu; sát thương tăng dần khi bám liên tục, có trần và về mức đầu khi chuyển mục tiêu. |
| Huyền Thiên Kiếm | **Trọng Kiếm:** một lần giáng mạnh hơn trong vùng hẹp hơn. | **Liên Kiếm:** chia đòn thành hai lần giáng liên tiếp tại cùng vị trí; mỗi lần nhẹ hơn, thuận lợi xử lý địch mới đi vào vùng. |
| Khốn Thiên Tỏa | **Thiên La:** vùng khóa rộng hơn, nhịp gây sát thương thưa hơn. | **Trấn Áp:** vùng nhỏ hơn, tăng sát thương lên mục tiêu đang nằm trong vùng; không kéo dài vô hạn thời gian khống chế boss. |

### Ba thức tỉnh đề xuất

Các tên dưới đây đặt cho bản game. Một hỗ trợ có thể liên kết hai tấn công, cùng nguyên tắc Hỏa Linh đang liên kết Dương Viêm Chưởng và Viêm Hoàn ở Phần 1.

| Tấn công + hỗ trợ | Thức tỉnh | Khác biệt ở bậc 6 |
| --- | --- | --- |
| Phệ Hồn Trùng + Thần Thức Tinh Luyện | **Phệ Hồn Trùng Triều** | Bầy trùng tăng khả năng duy trì áp lực và lan sang mục tiêu mới khi địch chết; vẫn giữ lựa chọn dọn đàn/tập trung của nhánh. |
| Huyền Thiên Kiếm + Thần Thức Tinh Luyện | **Cửu Thiên Kiếm Trận** | Đòn kiếm tạo thêm các điểm giáng quanh tâm ban đầu; mỗi điểm kế thừa nhánh Trọng Kiếm/Liên Kiếm. |
| Khốn Thiên Tỏa + Không Gian Cảm Ngộ | **Tỏa Thiên Phong Giới** | Vùng xiềng có thêm đường biên gây sát thương khi địch đi qua; vẫn giữ giới hạn khống chế boss và nhánh đã chọn. |

### Quy tắc tương tác đề xuất

- Quái thường có thể bị trói trong khoảng hữu hạn, có khoảng kháng giữa các lần trói để tránh bị khóa liên tục.
- Boss nhận làm chậm ngắn; tăng kháng khi bị áp liên tiếp. Đòn đang ở pha xuất chiêu không bị hủy bởi xiềng. Các tỷ lệ và cửa sổ cụ thể còn cần duyệt số liệu.
- Không Gian Cảm Ngộ làm chậm đạn trong vùng thực; đạn trở về tốc độ gốc khi ra khỏi vùng. Giữ nguyên quỹ đạo, nguồn sát thương và va chạm quét; hình vẽ đọc cùng vùng hiệu lực.
- Nhiều nguồn sát thương mới phải giữ nguồn/bậc tại lúc xuất chiêu cho cả bầy trùng, đòn kiếm trễ và nhịp xiềng. Tổng kết tách trước/sau thức tỉnh theo HP thực, không cộng trùng sát thương trực tiếp/nhánh/thức tỉnh.
- Các phép chọn vùng không chuyển tâm sau khi xuất đòn; hình báo trước, hình tác động và sát thương cùng dùng vùng đã chốt.
- Toàn bộ cooldown, nhịp damage, khống chế và đòn trễ dừng khi pause/chọn thẻ/kết quả. Cleanup theo kết thúc lượt và quy tắc hiện hành.

## 3. Bảng đối thủ và mục tiêu của 14 màn đề xuất

**Cả 14 màn đã duyệt phương án A trong ba đợt; màn 1–13 có hai pha, màn 14 có ba pha. Cách trình bày Ma Đô đã duyệt phương án A.** Chưa duyệt thông số, số lượng mục tiêu và ngưỡng chuyển pha. Tên vai trò dùng cho những đối thủ chưa có tên hiển thị tiếng Việt được xác nhận; nguồn bên dưới giữ danh tính nhân vật gốc. Không tự tạo tên cá nhân rồi coi là tên nguyên tác.

Màn có nhân vật không bị giết trong truyện dùng giao đấu, đẩy lui hoặc thoát truy kích. Một cụm đàn trùng/trận pháp có thể là đối tượng boss của màn khảo nghiệm, với thanh tiến độ tương ứng; không thêm một nhân vật phản diện vào cốt truyện chỉ để có boss.

| Màn | Mục tiêu và đối tượng boss | Pha 1 | Pha 2 | Điều kiện kết thúc |
| --- | --- | --- | --- | --- |
| 1 — Độc Ngạo Minh | Giải cứu nhóm đồng đội bị khống chế rồi đối đầu **Mị Yêu**. | Ảo ảnh gây nhiễu, đòn tầm xa có cảnh báo; phá dấu khống chế để giải cứu. | Lộ vị trí thật xen các đợt áp sát. | Đánh bại Mị Yêu và hoàn tất giải cứu. Giải cứu bằng tương tác/phá dấu là chuyển thể gameplay; chưa đề xuất thêm HP hộ tống cho màn này. |
| 2 — Tiểu Huyền Giới Cổ Ma | Phá vây, có Hàn Phi/Lệ Dung hỗ trợ; đối đầu **Chử Kiến**, thủ lĩnh phản loạn Cổ Ma. Tên bản Anh: Chu Jian. | Ma kình và các nhóm thuộc hạ ép hai cánh. | Truyền thừa Ma Thần trấn áp đối thủ, tạo nhịp phản công/kết liễu thay vì coi đây là trận thắng nhờ cảnh giới cao hơn. | Hạ Chử Kiến. Trấn áp theo cửa sổ là cách chuyển thể hiệu ứng sự kiện, không tự cấp kỹ năng mới trước cổng đã duyệt. |
| 3 — Cổ động Phệ Hồn Trùng | Tiến vào cổ động, giải nguy; **trùng triều Phệ Hồn** là boss dạng đàn. | Dẫn thần thức chi hỏa thanh tẩy các cụm trùng phân tán. | Đàn trùng hợp lại; né các luồng trùng và mở đường thanh tẩy cụm trung tâm. | Dẹp trùng triều và hoàn tất khảo sát. Cụm trung tâm là đối tượng gameplay, không thêm Trùng Vương vào truyện. Dẫn lửa là tương tác riêng của màn, không buộc mang một thẻ hỏa hệ hay thêm môn thứ sáu vào bộ A. |
| 4 — Thiên Niên Ma Hoa | Tranh đoạt/giữ điểm thu thập; **đội trưởng nhóm tranh hoa** là vai đối thủ chuyển thể. | Cận chiến tranh điểm, có nhóm quấy rối. | Đổi điểm thu thập, thủ lĩnh dùng đòn đẩy người chơi khỏi vùng tích lũy. | Vượt đội tranh đoạt và hoàn tất thu nhận; rời điểm chỉ dừng tích lũy, không tự xóa tiến độ. Địch Diệu là người hợp tác trong chặng truyện, không là mục tiêu phải giết. |
| 5 — Băng Tông | Khảo nghiệm/giao đấu; **Thiên Nguyệt**, trưởng lão Băng Tông. Tên bản Anh: Qian Yue. | Băng châm và băng tuyến ép hướng né. | Băng trận thu hẹp lối đi, đòn có khe thoát. | Vượt khảo nghiệm, mở đoạn gặp Tô Nhan; cạn thanh giao đấu là dừng tay, không phải giết đối thủ. |
| 6 — Di tích dưới biển | Khám phá rồi hộ tống **An Linh Nhi** thoát **Nam Thánh Cô**. | Đưa An Linh Nhi qua các vùng di tích, né đòn truy kích báo trước. | Áp lực truy sát tăng; phá chướng ngại và kích hoạt lối thoát. | Cả hai tới lối thoát là thắng, không cần hạ Nam Thánh Cô. An Linh Nhi có thanh HP bảo vệ riêng; hết HP là thất bại nhiệm vụ theo luật đã duyệt. |
| 7 — Dương tộc/Thần Thụ | Giải cứu bạn tù/phá vây; **thủ lĩnh truy kích Dương tộc** là vai đối thủ chuyển thể từ lực lượng Dương tộc. | Mở khóa cứu người, vượt hỏa tuyến và các nhóm chắn lối. | Thủ lĩnh truy kích tụ dương lực đánh vùng; dùng khoảng trống để phản công và mở đường ra. | Đánh bại/đẩy lui thủ lĩnh và thoát cùng nhóm đã cứu. Thần Thụ là điểm tương tác/hỗ trợ trong sự kiện, không phải đối tượng bị đánh hay mục tiêu có HP phải hộ tống. Không thêm điều kiện thu phục linh thú. |
| 8 — Sa Thành | Vượt các trận đấu đầu, quyết chiến **Địch Kiêu**. | Boss áp sát và tung đòn nặng theo chuỗi, có thời gian phản công. | Đòn ma kình liên hoàn, thay đổi nhịp né và hướng áp sát. | Hạ Địch Kiêu. Tập trung đọc bộ đòn của đối thủ, không thêm bẫy sân vào trận chính; nối sự kiện thoát khỏi sự kiểm soát của Tuyết Lỵ sau trận. |
| 9 — Thánh Lăng | Khảo nghiệm truyền thừa; **tàn niệm các đời Thánh chủ** điều khiển phép thử. | Vượt các vùng thần kỹ riêng lẻ, phá nút khảo nghiệm. | Các phép thử phối hợp và áp lực thần hồn tăng, cần né vùng đòn rồi xử lý nút trận. | Hoàn tất các phép thử là thắng và nhận truyền thừa theo cổng đã duyệt; không giết tàn niệm hoặc thêm Thánh chủ còn sống thành phản diện. Khảo nghiệm là cơ chế màn, không buộc mang một môn chưa mở. |
| 10 — Vây công Cửu Thiên | Giữ hộ trận và bảo vệ đường rút; **Trương Ngạo**, có lực lượng Cao Quản hỗ trợ. | Đánh chặn các đợt công phá tâm hộ trận; tâm trận có HP riêng. | Trương Ngạo cùng nhóm hỗ trợ dồn lực vào một cánh, cần phản công đẩy lui và giữ tuyến rút. | Tâm trận chưa bị phá hủy, đẩy lui đợt công kích và rút an toàn là thắng. Tâm trận hết HP là thất bại nhiệm vụ; Trương Ngạo sống để nối sự kiện sau. |
| 11 — Long Phượng Phủ | Phá vây cứu tông môn; **tông chủ địch tập kích Long Phượng Phủ**. Nguồn nhân vật: Yan Zhi. | Hàn kình, tuyến băng và đòn quét ép vị trí. | Đòn diện rộng tăng áp lực; long lực theo sự kiện mở nhịp phá thế và phản công. | Hạ boss, đẩy lui lực lượng tập kích. Không có thêm HP cổng/tông môn phải bảo vệ. Long lực là cơ chế sự kiện tại màn, không buộc mang Kim Long trước mốc mở đã duyệt sau màn 11. |
| 12 — Giải phong Cổ Ma | Phần mở đầu bảo vệ điểm giải phong có HP, đưa Cổ Ma ra ngoài; sau đó quyết chiến **Trương Ngạo** ở chặng truy sát/trở về, không đưa nhân vật này vào nghi thức trong Tiểu Huyền Giới. | Boss dùng bộ đòn chặn đường, đánh lan để ép người chơi đổi vị trí. | Phản kích dồn dập và đòn trễ có báo trước, khác trận vây công ở màn 10. | Hoàn tất giải phong và hạ Trương Ngạo. Điểm giải phong hết HP trong phần mở đầu gây thất bại nhiệm vụ; không thêm HP hộ tống cho từng người Cổ Ma sau đó. Nối sự kiện nhận Huyết Tinh Thạch; Tuyết Lỵ giữ vai trò theo truyện, không bị viết thành nhân vật đã chết. |
| 13 — Thông Huyền Trụ | Cứu Mộng Vô Nhai/Hạ Ngưng Thường; **tâm trận Thông Huyền** là boss trận pháp chuyển thể. | Phá các nút trận, né xung năng lượng có báo trước. | Tâm trận quá tải, phối hợp các vùng nguy hiểm; xử lý các trụ và điểm yếu còn lại. | Phá trận và giải thoát cả hai là thắng; không có thêm HP hộ tống sau giải cứu. Phân thân Đại Ma Thần giữ vai trò trong truyện, không bị viết thành kẻ thù phải giết. |
| 14 — Đại chiến Cốt tộc | Chiến trường liên minh Nhân–Yêu–Ma; **thủ lĩnh Cốt tộc**. Nguồn nhân vật: Ke Luo. | Phá các đợt chiến binh xương và đòn công kích của thủ lĩnh. | Kích hoạt Huyết Tinh Thạch tại các điểm hội tụ huyết khí để ngăn boss hấp thu/hồi phục; điểm tương tác là chuyển thể gameplay. | **Pha 3:** liên minh hỗ trợ mở nhịp phản công, boss bộc phát bộ đòn cuối; người chơi trực tiếp hạ boss để thắng. Huyết Tinh Thạch là đạo cụ sự kiện, không chiếm ô trang bị/kỹ năng. Vào trận vẫn chỉ cần Nhập Thánh nhị tầng; hoàn tất chương giữ điều kiện 14 thắng + trần đã duyệt. |

Các cửa sổ hỗ trợ của đồng minh là cơ chế màn đề xuất, không thêm yêu cầu chọn một linh thú mới hoặc thay nhân vật chính. Màn khảo nghiệm/thoát truy kích vẫn kết thúc bằng kết quả thắng, quyết toán thưởng và thưởng lần đầu theo luật chung. Nhãn UI mô tả đúng thắng khảo nghiệm/thoát hiểm thay vì mặc định ghi đã tiêu diệt đối thủ.

Đã duyệt luật chung cho nhiệm vụ bảo vệ/hộ tống: mục tiêu bị phá hủy cũng kết thúc thất bại, quyết toán 30%; nhân vật còn sống thì ghi thất bại nhiệm vụ. Xem [tiến trình đã duyệt](WORLD_TWO_PROGRESSION.md). Đã duyệt HP bảo vệ riêng cho An Linh Nhi ở màn 6, tâm hộ trận ở màn 10 và điểm giải phong trong phần đầu màn 12. Lượng HP, checkpoint nếu có và các thông số cụ thể vẫn cần duyệt; không tự mặc định thêm mất tài sản vĩnh viễn.

### Đợt duyệt 1 — màn 1–5, đã duyệt phương án A

Người dùng trả lời **“duyệt đề xuất”**, xác nhận phương án A cho cả năm câu đã trình về màn 1–5: boss, hướng hai pha và mục tiêu thắng. Đây là chuyển thể gameplay dựa trên bối cảnh truyện, không khẳng định từng đòn/tương tác xảy ra như vậy trong nguyên tác. Các phương án B dưới đây chỉ giữ lịch sử và không được chọn.

| Câu hỏi | A — đã duyệt | B — không chọn |
| --- | --- | --- |
| 1. Độc Ngạo Minh | Phá khống chế để giải cứu, rồi đánh bại Mị Yêu; hai pha ảo ảnh → lộ thân. | Tập trung trận đấu Mị Yêu, chuyển giải cứu sang đoạn truyện sau trận. |
| 2. Tiểu Huyền Giới Cổ Ma | Phá vây và đối đầu Chử Kiến, pha sau dùng hiệu ứng sự kiện truyền thừa trấn áp để tạo nhịp phản công. | Hai pha chiến đấu bằng bộ đòn thông thường, chuyển trấn áp truyền thừa sang đoạn kết. |
| 3. Cổ động Phệ Hồn Trùng | Boss dạng trùng triều hai pha; dẫn thần thức chi hỏa thanh tẩy cụm rời → cụm tập trung. | Ưu tiên phá vây và bảo vệ điểm rút, trùng triều tăng áp lực theo hai pha; hoàn tất rút lui là thắng. |
| 4. Thiên Niên Ma Hoa | Tranh điểm thu nhận, đổi điểm ở pha sau; đánh bại thủ lĩnh đối thủ và tích đủ tiến độ là thắng. | Tập trung trận đấu với nhóm tranh hoa; thu nhận Ma Hoa là đoạn truyện sau chiến thắng. |
| 5. Băng Tông | Giao đấu khảo nghiệm với Thiên Nguyệt, hai pha băng châm/băng tuyến → băng trận; thắng thì dừng tay. | Vượt băng trận hai pha do Thiên Nguyệt điều khiển, không đánh trực tiếp nhân vật. |

Chưa chốt số điểm giải cứu/thanh tẩy, số cụm trùng, thời lượng, HP, sát thương, ngưỡng chuyển pha hay tỷ lệ thưởng của năm màn. Phạm vi đợt duyệt 1 chỉ là màn 1–5; xem quyết định về màn 6–10 ở đợt duyệt 2.

### Đợt duyệt 2 — màn 6–10, đã duyệt phương án A

Người dùng trả lời **“duyệt cả 5 phương án A”**, xác nhận boss, mục tiêu và hướng hai pha của màn 6–10, gồm HP bảo vệ riêng ở màn 6 và 10. Các cơ chế/tương tác và bộ đòn là chuyển thể cho game. Cổng cảnh giới, mở kỹ năng và luật quyết toán đã duyệt vẫn giữ nguyên; chưa gán lượng HP, thời lượng, số nút trận hay ngưỡng chuyển pha. Các phương án B dưới đây không được chọn.

| Câu hỏi | A — đã duyệt | B — không chọn |
| --- | --- | --- |
| 6. Di tích dưới biển | Hộ tống An Linh Nhi có HP riêng. Hai pha vượt di tích → mở lối thoát dưới truy sát của Nam Thánh Cô. Đưa cả hai thoát là thắng; An Linh Nhi hết HP là thất bại nhiệm vụ. | An Linh Nhi đi theo diễn biến sự kiện, không có HP mục tiêu riêng; người chơi tập trung phá chướng ngại và thoát truy sát. |
| 7. Dương tộc/Thần Thụ | Giải cứu bạn tù rồi phá vây; hai pha mở khóa/vượt hỏa tuyến → đối đầu thủ lĩnh truy kích. Thần Thụ hỗ trợ qua tương tác, thắng khi đẩy lui truy kích và thoát cùng nhóm. | Giữ điểm liên kết với Thần Thụ để tích đủ tiến độ mở đường trước khi phá vây; hai pha áp lực từ lực lượng Dương tộc. |
| 8. Sa Thành | Quyết chiến Địch Kiêu, hai pha đòn nặng áp sát → ma kình liên hoàn; tập trung đọc bộ đòn, không thêm bẫy sân vào trận chính. | Vẫn hai pha và cùng đối thủ, thêm vùng bẫy đấu trường khiến người chơi phải xử lý cả boss lẫn vị trí đứng. |
| 9. Thánh Lăng | Vượt phép thử thần kỹ riêng lẻ → phép thử phối hợp, phá các nút khảo nghiệm để nhận truyền thừa; tàn niệm Thánh chủ điều khiển khảo nghiệm. | Giao đấu trực tiếp với hình ảnh truyền thừa hai pha; cạn thanh khảo nghiệm là thắng, không coi là giết Thánh chủ. |
| 10. Vây công Cửu Thiên | Bảo vệ tâm hộ trận có HP; hai pha chặn đợt công phá → đẩy lui Trương Ngạo và giữ đường rút. Hoàn tất rút an toàn là thắng, tâm trận bị phá là thất bại. | Tập trung trận đánh đẩy lui Trương Ngạo, không có HP hộ trận riêng; cuộc rút lui diễn ra trong đoạn truyện sau trận. |

Ở màn 6/10, HP mục tiêu và cảnh báo nguy hiểm phải hiện rõ. Nhân vật còn sống khi mục tiêu thất bại thì kết quả ghi thất bại nhiệm vụ; giữ 30% chiến lợi phẩm mới của lượt và không ảnh hưởng tu vi/tài sản đã tích trữ từ trước. Màn 7 không thêm HP hộ tống riêng theo phương án đã chọn; giải cứu được thể hiện bằng tiến độ mở đường/đưa nhóm ra. Quyết định màn 11–14 nằm tại đợt duyệt 3 bên dưới.

### Đợt duyệt 3 — màn 11–14 và sự kiện Ma Đô, đã duyệt phương án A

Người dùng trả lời **“duyệt Phương án A”**, xác nhận cả năm đề xuất đã trình về màn 11–14 và sự kiện Ma Đô. Các bộ đòn, vùng tương tác, HP mục tiêu và cách dàn dựng là chuyển thể gameplay. Chưa chốt lượng HP, ngưỡng pha, số mục tiêu, hồi phục hay phần thưởng. Ma Đô vẫn là sự kiện truyện giữa màn 13 và 14. Các phương án B dưới đây không được chọn.

| Câu hỏi | A — đã duyệt | B — không chọn |
| --- | --- | --- |
| 11. Long Phượng Phủ | Phá vây và hạ tông chủ tập kích. Hai pha hàn kình/ép vị trí → long lực mở nhịp phản công trước đòn diện rộng; không thêm HP cổng/tông môn. | Cùng boss và hai pha, thêm HP cổng Long Phượng Phủ phải giữ; cổng bị phá gây thất bại nhiệm vụ. |
| 12. Giải phong Cổ Ma | Bảo vệ điểm giải phong có HP ở phần đầu, sau đó quyết chiến Trương Ngạo với hai pha chặn đường/đánh lan → phản kích dồn dập/đòn trễ. Hoàn tất giải phong và hạ boss là thắng; nhận Huyết Tinh Thạch theo sự kiện sau trận. | Giải phong và nhận Huyết Tinh Thạch được kể bằng sự kiện, không có HP điểm bảo vệ; gameplay tập trung trận Trương Ngạo hai pha. |
| 13. Thông Huyền Trụ | Boss là trận pháp: phá nút trận → xử lý tâm trận quá tải và các vùng đòn phối hợp. Phá trận cứu Mộng Vô Nhai/Hạ Ngưng Thường là thắng, không thêm HP hộ tống. | Pha đầu phá trụ; pha sau hộ tống hai người qua đường thoát, có HP bảo vệ riêng và áp dụng luật thất bại nhiệm vụ. |
| Ma Đô — sự kiện truyện | Đối thoại và hồi ức ngắn có tương tác để tìm hiểu Đại Ma Thần/nguồn gốc tai họa, nối bước chuẩn bị liên minh. Có thể bỏ qua phần trình bày và xem lại từ căn cứ. | Một đoạn kể ngắn tự trình bày giữa màn 13 và 14; có bỏ qua/xem lại, không có thao tác khám phá. |
| 14. Đại chiến Cốt tộc | Ba pha: phá đội hình xương → dùng Huyết Tinh Thạch ngăn hấp thu huyết nhục → liên minh mở nhịp phản công để hạ thủ lĩnh. Thạch là đạo cụ sự kiện, không chiếm ô trang bị/kỹ năng. | Vẫn ba pha, tập trung bộ đòn boss và các đợt viện binh; Huyết Tinh Thạch chỉ xuất hiện ở đoạn truyện chuyển pha, không thành tương tác chiến đấu. |

Ở màn 12, điểm giải phong có HP chỉ hoạt động trong phần nghi thức đầu màn. Trận Trương Ngạo sau đó vẫn có đủ hai pha riêng; không đặt Trương Ngạo tại nơi phong ấn chỉ để gộp màn. Nhận Huyết Tinh Thạch là mốc truyện được đảm bảo sau lần thắng tương ứng, không phải món rơi ngẫu nhiên; công dụng trang bị/luyện khí ngoài cơ chế sự kiện chưa được đề xuất bổ sung.

Ở màn 14, cơ chế Thạch dùng được với mọi bộ kỹ năng hợp lệ. Liên minh hỗ trợ theo kịch bản chiến đấu, người chơi vẫn điều khiển Dương Khai và gây đòn kết thúc; không đổi nhân vật chính hoặc buộc mang một linh thú. Không thêm HP căn cứ vào trận cuối theo phương án đã chọn.

Với sự kiện Ma Đô, bỏ qua phần trình bày vẫn ghi nhận đã đi qua mốc truyện để tiếp tục, không buộc xem lại hay thêm trận chiến. Nội dung hai phương án không thay số 14 màn, trần chương, điều kiện hoàn tất hoặc tự cấp một kỹ năng ngoài bộ A đã duyệt.

### Nguồn đối chiếu danh tính và tình tiết

- Màn 1: [Mị Yêu, chương 628](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-628-charm-monster/).
- Màn 2: [Chử Kiến và Hàn Phi, bản Việt chương 652](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-652); [Chu Jian bị truyền thừa trấn áp, chương 660](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-660-a-saint/). Pha trấn áp điều chỉnh đề xuất cũ về ma văn cường hóa để thể hiện rõ tình tiết này.
- Màn 3: [Phệ Hồn Trùng, chương 689](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-689-soul-devouring-insects/).
- Màn 4: [Tranh đoạt ma hoa, chương 711](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-711-movement/); [Địch Diệu trong cuộc thi luyện đan, chương 710](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-710-persuasion/).
- Màn 5: [Thiên Nguyệt, bản Việt chương 729](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-729); [Qian Yue và Băng Tông, bản Anh chương 729](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-729-ice-sect/).
- Màn 6: [Mục lục chương 741–761](https://novelzi.com/novelbin/martial-peak/); [bản Việt chương 783 nhắc An Linh Nhi và cuộc truy sát của Nam Thánh Cô](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-783).
- Màn 7: [Dương tộc và Thần Thụ, chương 766](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-766-divine-tree/).
- Màn 8: [Địch Kiêu, chương 785](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-785-death-match/).
- Màn 9: [Thánh Lăng, chương 794](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-794-holy-tomb/); [tàn hồn và danh sách thần kỹ](https://martial-peak-mp.fandom.com/wiki/Nine_Heavens_Holy_Land).
- Màn 10: [Liên quân Trương Ngạo/Cao Quản, chương 818](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-818-acting-carefreely/).
- Màn 11: [Yan Zhi, chương 840](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-840-little-brat-youve-got-good-prospects/).
- Màn 12: [giải phong, chương 863](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-863-must-be-joking/); [Trương Ngạo và Huyết Tinh Thạch, chương 870](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-870-blood-essence-stone/); [bản Việt chương 875, truy tìm nguồn gốc Thạch qua ký ức Trương Ngạo](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-875).
- Màn 13: [phá trận cứu người, chương 911](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-911-how-much-strength-do-you-have-left/).
- Màn 14: [Ke Luo và huyết nhục, chương 971](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-971-what-do-you-have-to-fight-me-with/); [cuộc hợp vây, chương 973](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-973-self-destruct/).
- Ma Đô: [bí mật tinh không, chương 962](https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-962-secrets-of-the-starry-sky/). Nội dung sự kiện, tương tác, bỏ qua và xem lại đã duyệt phương án A ở đợt 3.

## 4. Các điểm cần người dùng quyết định tiếp

1. Danh sách năm môn ở mục 2 đã được thay bằng bộ A do người dùng chọn; mốc mở đã duyệt tại [WORLD_TWO_SKILLS_A.md](WORLD_TWO_SKILLS_A.md).
2. Chốt thông số và chi tiết tương tác của bộ A; sáu nhánh, ba thức tỉnh, hướng dấu ấn/hồi lướt và cổng mở đã duyệt tại tài liệu bộ A. Các nhánh/liên kết ở mục 2 không được tiếp tục dùng làm đề xuất hiện hành.
3. Chốt thông số chiến đấu, số lượng mục tiêu và ngưỡng chuyển pha; boss/mục tiêu/hướng các pha của cả 14 màn cùng cách trình bày Ma Đô đã duyệt phương án A. Các vai boss chuyển thể được ghi rõ tại bảng.
4. Cách xử lý trói/xiềng của bộ cũ chưa được duyệt và không còn áp dụng mặc định khi đã chọn bộ A. Tương tác đẩy/làm chậm/dấu ấn của bộ A cần duyệt theo thiết kế mới.

Tu vi/chỉ số/thưởng tu vi cố định, Tu Vi Đan và ngoại tuyến đã duyệt toàn bộ phương án A tại [bảng kinh tế](WORLD_TWO_ECONOMY_DRAFT.md). Còn cần thông số kỹ năng/màn, nguồn thu phụ và vật phẩm, tiện ích căn cứ, danh sách asset và nghiệm thu. Duyệt các bảng nội dung ở tài liệu này không tự thay cho lệnh triển khai toàn bộ Phần 2.

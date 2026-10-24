# Võ Luyện — Trung Đô & Thông Huyền Đại Lục 2.3.1

**Bản hiện hành ngày 24/10/2026:** theo yêu cầu người dùng, dừng nâng cấp đồ họa nhân vật và khôi phục bộ nhân vật Thông Huyền **v9 / 100 pixel mỗi đơn vị**, trước khi chuyển sang pixel. Giữ gameplay Phần 2 (14 màn), Trung Đô (6 màn), giao diện lobby/HUD survival, Profile v3, tài sản và tu vi dư. Chưa triển khai chuyển hệ trang bị sang bốn ô; giữ bảy ô tương thích tiến trình hiện có. Các thử nghiệm nhân vật được giữ riêng tại máy, chờ nguồn spritesheet mới rồi mới tiếp tục. Chi tiết tại [hồ sơ khôi phục](docs/THONG_HUYEN_RESTORE.md).

Các mục 2.4.x bên dưới là lịch sử thử nghiệm đã dừng, không phải nhân vật đang dùng trong bản này.

Bản **2.4.1** sửa ngoại quan theo video ngày 23/10: tách quyền sáo ở bàn tay và hộ uyển ở cẳng tay, sửa thứ tự lớp bị che, thay cách cắt icon bằng 96 mảnh tay pixel riêng và sửa điểm gắn ở góc ngang/chu kỳ chạy/đòn duỗi nhìn từ sau lưng. Huyền Thiết có găng sắt riêng, không dùng lại ảnh Đồng. Atlas chuyển **v11** để tránh cache cũ; giữ tiến trình và gameplay. Xem [hồ sơ sửa theo video](docs/HERO_PIXEL_2_4_1_FIX.md). Kết luận ngoại quan “đạt” của 2.4.0 đã bị người dùng bác; kiểm tra số lượng/ID trước đó không thay việc nhìn ảnh sau phối đồ.

Bản **2.4.0** chuyển Dương Khai sang sprite pixel có cơ thể nền mặc quần cộc và các lớp trang bị độc lập. Tám hướng thật, hai bộ quyền/kiếm, đi/chạy, ba đòn mỗi bộ và ngã; kiếm có chu kỳ giữ tay riêng khi di chuyển. Ngoại quan chọn đúng ID của toàn bộ 27 món thuộc bảy ô, có thể tháo áo/giáp và các phụ kiện trong kho. Bốn bộ áo có hình dáng riêng, không chỉ đổi màu. Dùng cùng atlas trong lobby và trận; giữ Profile v3, tài sản, tu vi dư và gameplay. Nguồn, cách dựng và kiểm tra tại [hồ sơ nhân vật pixel](docs/HERO_PIXEL_RUNTIME_QA.md).

Bản **2.3.0** đồng bộ giao diện chiến đấu với lobby survival: HUD sinh lực/XP/boss và thanh kỹ năng rõ bậc, đan/lướt có hồi chiêu; bảng lĩnh ngộ dùng thẻ ảnh lớn, bậc trước/sau và nút đổi thẻ cố định; kết quả dùng lưới thưởng và biểu đồ sát thương theo chiêu/linh thú. Có bố cục điện thoại, giữ đầy đủ thao tác và gameplay. Xem [kiểm tra giao diện chiến đấu](docs/COMBAT_SURVIVAL_UI_QA.md).

Bản **2.2.0** đổi lobby sang bố cục survival trực quan: nhân vật lớn và bảy ô trang bị, menu tám khu ở cạnh dưới, kho/luyện khí dạng lưới ảnh và bảng chi tiết, thẻ đan dược/linh thú, vòng tu luyện và bộ ô kỹ năng. Lịch luyện có lưới chọn màn, thẻ boss và nút vào trận cố định; điện thoại có bảng mở rộng. Giữ tiến trình, chi phí và gameplay. Xem [kiểm tra lobby](docs/LOBBY_SURVIVAL_QA.md).

Bản **2.1.0** tích hợp Dương Khai 2.5D từ rig dựng mới, tám hướng thật, đi/chạy, ba đòn quyền/kiếm và ngã. Ngoại quan thay theo **bảy ô trang bị đang mặc**, phối từng món trong kho đồ và giữ vào trận. Du Long thon hơn, đường lượn mềm; Già Thiên Thủ dùng mặt linh lực liên tục; Vũ Dực thêm gió cuộn và sét nhánh, gắn theo bả vai của từng pose. Xem [nguồn và kiểm tra ngoại quan](docs/HERO_EQUIPMENT_2_1_QA.md), [hiệu ứng](docs/WORLD_TWO_EFFECTS_QA.md). Trang dev xem nhân vật: `/qa/hero-equipment.html`; xem kỹ năng: `/qa/world-two-effects.html?vfxPreview=1&rev=2.1.0`.

Bản **2.0.4** chuyển hiệu ứng Phần 2 sang linh lực trong suốt: vỏ xuyên nền, lõi/viền tự phát sáng, dải khí mềm và hạt tan. Du Long có luồng vàng trắng/xanh ngọc theo video tham khảo; Già Thiên Thủ tụ–giáng–tan, nhìn xuyên qua chưởng và lưu ấn năm ngón. Vũ Dực dựng lại dáng vai cong, lông xòe nhiều lớp và đầu lông tan khí; Nhập Ma giữ nhân vật nhìn thấy qua khói. Kim Quang giữ tia xuyên hiện tại. Logic damage/va chạm, tiến trình lưu, icon UI v7 và actor v3 được kế thừa. Xem [QA hiệu ứng trong trận](docs/WORLD_TWO_EFFECTS_QA.md). Trang xem chuyển động trực tiếp trên server dev: `/qa/world-two-effects.html?vfxPreview=1`.

Game survival tiên hiệp trên trình duyệt, góc nhìn isometric, dùng React + TypeScript + Vite + Phaser 3. Thế giới Trung Đô có **sáu màn lịch luyện**, từ Hắc Phong Sơn đến Hạo Kiếp, cùng lobby Lăng Tiêu Các và tiến trình tu luyện đến **Thần Du đỉnh phong tầng 10**. Dương Khai dùng catalogue Thông Huyền v9; yêu thú dùng asset v3, phòng lobby/nền dùng v4; đối thủ hình người dùng sprite v5/v6 dựng từ rig 3D, đủ tám hướng thật.

Bản **2.0.1** thay ảnh dùng lại của nội dung Phần 2 bằng **30 biểu tượng mới**: 16 trang bị, 5 môn, 6 biến chiêu và 3 thức tỉnh. Mỗi mục có PNG riêng, được tạo bằng image_gen tích hợp và kiểm tra ở cỡ 40/64 px, dùng thống nhất trong luyện khí/kho đồ/chuẩn bị/thẻ/HUD. Xem [hồ sơ ảnh và prompt](docs/WORLD_TWO_ICON_QA.md).

Bản **2.0.0** mở Phần 2 — **Thông Huyền Đại Lục** với **14 màn nhiệm vụ**, sự kiện **Ma Đô** trước màn cuối, boss nhiều pha và trần **Nhập Thánh tam tầng đỉnh phong**. Hoàn thành sáu màn Trung Đô và đạt realm 46 để mở cổng; có thể trở lại Phần 1. Căn cứ Phần 2 chuyển từ Lăng Tiêu Tông sang Cửu Thiên Thánh Địa sau màn 3.

Phần 2 bổ sung ba tấn công, hai hỗ trợ, sáu biến chiêu/ba thức tỉnh; bảy ô trang bị và 16 món mới; Linh Tài Thông Huyền; đan nâng hiệu lực và luyện 1/5/10/tối đa; hai linh thú cũ nuôi tới bậc 10 theo cảnh giới. Tu vi tích trữ vượt yêu cầu, mỗi lần đột phá chỉ trừ một bước khi đủ cổng truyện. Profile v3 tự chuyển v1/v2, giữ khóa lưu và tài sản; thống kê/thẻ trong lượt vẫn không lưu vào Profile. Đối thủ Phần 2 dùng bộ v6 đã kiểm tra.

Hồ sơ hiện hành: [triển khai Phần 2](docs/WORLD_TWO_IMPLEMENTATION.md) · [kiểm tra Phần 2](docs/WORLD_TWO_QA.md). Các đoạn phiên bản 1.x bên dưới là lịch sử và mô tả nền Trung Đô.

Bản **1.8.0** hoàn tất mục 6: bảng sát thương theo kỹ năng/thức tỉnh/linh thú, nguồn đòn kết liễu và các đòn trúng trong sáu giây cuối. Rút lui có tổng kết riêng. Khi thắng đủ sáu màn và đạt **Thần Du đỉnh phong tầng 10**, kết chương Trung Đô tự mở; có thể xem lại tại sân trung tâm và tiếp tục lịch luyện. Chỉ thống kê HP thực mất, không cộng sát thương dư; dữ liệu chỉ thuộc lượt chơi. Xem [COMBAT_SUMMARY_QA.md](docs/COMBAT_SUMMARY_QA.md).

**Mục 5 đã bỏ qua theo yêu cầu người dùng:** giữ nguyên tốc độ tiến triển, chi phí tu luyện và phần thưởng; không đặt chỉ tiêu thời lượng hoàn thành hoặc số lượt phải chơi.

Hồ sơ chốt Phần 1 và tiếp nối: [Review Trung Đô](docs/WORLD_ONE_REVIEW.md) · [Handoff Phần 2](docs/WORLD_TWO_HANDOFF.md). Handoff ghi phạm vi cần chốt, các điểm phải tách khi thêm thế giới, hợp đồng save và trạng thái mã/asset cần mang sang thiết bị khác.

Bản **1.7.0** thêm **cơ duyên tùy chọn** cho sáu màn: rương có hộ vệ, linh dược, truy sát tinh anh và thử thách tụ linh. Mỗi lượt có lịch/thứ tự/vị trí ngẫu nhiên, tối đa bốn lần; đến dấu tím trên minimap rồi bấm **E** hoặc nút HUD. Phần thưởng tạm giữ theo luật thắng/thua, XP và hồi máu dùng ngay. Xem [OPPORTUNITIES_QA.md](docs/OPPORTUNITIES_QA.md).

Bản 1.6.0 đã hoàn tất năm liên kết thức tỉnh: thêm **Kim Ô Phần Thiên Chưởng** cho Dương Viêm Chưởng + Hỏa Linh, cân lại quyền/kiếm/hỏa/lôi, giữ cả mười biến chiêu khi lên bậc 6. Thẻ và menu chuẩn bị/tạm dừng ghi điều kiện, tiến độ và tên thức tỉnh thật; có phản hồi âm thanh riêng. Xem [AWAKENINGS_QA.md](docs/AWAKENINGS_QA.md).

Bản 1.5.1 đã sửa Hồi Phong xuyên toàn bộ mục tiêu trên cả hai chiều bay, chỉ quay đầu ở tầm 7 đơn vị hoặc biên sân. Viêm Hoàn đốt liên tục trong vùng, lớn theo bậc, có sóng nhiệt lan từ tâm ra rìa; hai nhánh chọn tăng phạm vi hoặc tăng DPS. Xem [FLAME_RETURN_1_5_1_QA.md](docs/FLAME_RETURN_1_5_1_QA.md).

Bản 1.5.0 đã thêm **10 thẻ biến chiêu** cho năm kỹ năng tấn công và **một lần đổi bộ ba thẻ mỗi lượt** bằng nút hoặc phím R. Thẻ biến chiêu thay cách xuất đòn, không tăng bậc và không lưu vĩnh viễn. Xem [AUGMENTS_QA.md](docs/AUGMENTS_QA.md) và [WORLD_ONE_POLISH_ROADMAP.md](docs/WORLD_ONE_POLISH_ROADMAP.md).

Bản 1.4.0 đã thêm cơ chế giao tranh riêng cho sáu màn, với cảnh báo trên sân, hướng dẫn HUD và mục tiêu minimap. Xem [STAGE_MECHANICS_QA.md](docs/STAGE_MECHANICS_QA.md).

Bản 1.3.0 đã sửa Viêm Hoàn/Lôi Liên, sinh quái theo camera, thay đội hình theo bối cảnh từng trận và bổ sung nhạc sáu màn, nhạc boss cùng hiệu ứng âm thanh có biến thể. Xem [COMBAT_PRESENTATION_QA.md](docs/COMBAT_PRESENTATION_QA.md).

Ngày 16/10/2026 đã chốt **Tiên hiệp 2.5D — mẫu số 2** cho đợt nâng cấp đồ họa. Nguồn mẫu, quy chuẩn và thứ tự áp dụng nằm trong [ART_DIRECTION_2_5D.md](docs/ART_DIRECTION_2_5D.md).

Bộ Dương Khai nguồn tại [art/duong-khai-rebuild/README.md](art/duong-khai-rebuild/README.md) là **`fresh-3d-10759de3137b`**, đã kiểm tra nội bộ ngày 18/10/2026: quyền phát lực chân–hông–vai và duỗi hết tay, kiếm có kiếm ấn/xoay cổ tay/liên hoàn ba đòn nối tiếp, thêm chạy cho cả hai vũ khí. Có 19 clip × tám hướng thật, 152 atlas và nguồn Blender chỉnh sửa được. Bản 2.1.0 xuất 16 clip cần cho runtime cùng các mesh trang bị tại [art/hero-equipment/](art/hero-equipment/README.md). Bộ cắt ghép bị bác chỉ giữ làm lịch sử.

Mở `art/duong-khai-rebuild/MO_DUONG_KHAI.cmd` để xem bộ mới qua `PREVIEW.html` trực tiếp, không cần Python hoặc server. Đợt tích hợp mới đọc `export/manifest.json` trong thư mục dựng mới: ô 320/448 px tùy clip, mật độ 100 px/đơn vị và neo riêng từng clip. Hướng dẫn này dành cho bộ nâng cấp; thông số runtime v3 bên dưới vẫn áp dụng cho game hiện tại.

## Cài đặt và chạy

Cần **Node.js 22.12 trở lên**. Tại thư mục dự án:

```powershell
npm ci
npm run dev
```

Để tiếp tục trên thiết bị khác, cài Git và Node.js rồi lấy repository công khai:

```powershell
git clone https://github.com/NrocneK/vo-luyen-survival.git
cd vo-luyen-survival
npm ci
npm run dev
```

Trước mỗi buổi làm việc chạy `git pull`. Sau khi sửa và kiểm tra, dùng `git add`, `git commit` và `git push` để đồng bộ mã nguồn. Tiến trình nhân vật được chuyển riêng bằng **Thiết lập → Xuất/nhập file tiến trình**.

Mở **http://127.0.0.1:5173/**. Trong lobby, chọn **Lịch luyện**, chọn màn đã mở, chuẩn bị bộ kỹ năng rồi bấm **Vào [tên màn]**. Có thể xem thông tin và phần thưởng của cả màn chưa mở; giao diện ghi rõ điều kiện còn thiếu.

```powershell
npm run test           # Kiểm tra logic và mô phỏng trọn lượt
npm run typecheck      # Kiểm tra TypeScript
npm run test:balance   # Chạy 9 lượt tự động, báo cáo qa/balance-report.json
npm run test:world     # Mô phỏng hành trình sáu màn, báo cáo qa/world-one-balance-report.json
npm run test:awakenings # Đo 75 cặp bậc 5/6, báo cáo qa/awakening-balance-report.json
npm run build          # Đóng gói vào dist/
npm run preview        # Chơi bản build tại http://127.0.0.1:4173/
npm run format         # Định dạng code bằng Prettier
```

Lần cài thư viện cần Internet. Sau khi build, mã game, font, hình và âm thanh tổng hợp đều chạy cục bộ; không dùng CDN. Phải phục vụ `dist` qua HTTP, không mở `index.html` bằng `file://`.

## Bắt đầu tu hành

Bạn nhận 180 linh thạch, nguyên liệu ban đầu, quyền sáo, kiếm, võ phục và 2 Hồi Nguyên Đan. Các khu lobby dùng được trực tiếp:

Lobby bắt đầu ở **Sân trung tâm**. Bấm **Đan phòng ở phía trái/Tây**, **Luyện khí đường ở phía phải/Đông**, **Tĩnh thất phía Bắc** hoặc **Linh thú viên phía Nam** để chuyển sang cảnh riêng của từng khu. Trong phòng có lối **Về sân trung tâm**. Thanh bên cho phép chuyển khu nhanh; Trang bị, Lịch luyện và Thiết lập dùng tại sân.

- **Tu luyện:** hấp thụ linh khí chậm, dùng Tu Vi Đan và đột phá. Cảnh giới tăng chỉ số vĩnh viễn, mở kỹ năng và 2–6 ô mang theo. Trung Đô có **47 mốc**: Thối Thể 10 mốc, Khai Nguyên 9 tầng, Khí Động 9 tầng, Chân Nguyên 9 tầng và Thần Du 10 tầng. Trần Trung Đô là Thần Du đỉnh phong tầng 10; Phần 2 thêm sáu mốc tới Nhập Thánh tam tầng đỉnh phong.
- **Luyện đan:** ba công thức tăng tu vi, tăng chỉ số vĩnh viễn và hồi máu trong màn. Hiệu lực Tu Vi Đan tăng theo cảnh giới và hiện trực tiếp trong phòng đan/tu luyện. Luyện đủ 4 viên mở đan sư bậc II. Cường Thể Đan có năm suất nền; từ Siêu Phàm mở thêm năm suất Tẩy Tủy, dùng hết suất nền trước. Có thể luyện 1/5/10/tối đa.
- **Luyện khí:** **27 mẫu trang bị**, gồm 11 món Trung Đô và 16 món Thông Huyền. Các mẫu về sau yêu cầu cảnh giới; trang bị đặc biệt còn cần bản vẽ.
- **Trang bị:** bảy ô vũ khí/đầu/thân/tay/chân/trang sức/bí bảo; ô bí bảo mở sau Hắc Phong Sơn, kho nguyên liệu và cường hóa đến +5.
- **Linh thú:** ấp Linh Hồ hoặc Thanh Điểu, nuôi đến bậc 5 ở Trung Đô và bậc 6–10 theo cảnh giới Phần 2, tiến hóa một lần từ bậc 3. Mọi con đã mở cộng nội tại; chỉ một con đi cùng và hỗ trợ chiến đấu.
- **Lịch luyện:** chọn một trong 20 màn của hai phần và bộ kỹ năng theo cảnh giới/truyền thừa. Có **15 kỹ năng** cùng **tám liên kết thức tỉnh**. Kỹ năng vũ khí bắt đầu bậc 1; các kỹ năng mang thêm bắt đầu khóa và cần thẻ kích hoạt.
- **Thiết lập:** bật/tắt nhạc/tiếng, giảm số sát thương, xuất/nhập file tiến trình.

Linh thú và trang bị được giữ qua các lượt. Trong màn, XP, cấp, bậc kỹ năng và chỉ số từ thẻ được đặt lại khi kết thúc.

## Hành trình Thế giới 1

Mỗi màn sau yêu cầu **vượt màn liền trước và đạt cảnh giới tối thiểu**. Thời lượng trong bảng là mốc boss xuất hiện; lượt chỉ thắng khi tiêu diệt boss.

| Màn | Mốc boss | Cảnh giới tối thiểu | Boss |
| --- | --- | --- | --- |
| 01 · Hắc Phong Sơn | 10 phút | Thối Thể tầng 1 | Hắc Phong Lang Vương |
| 02 · Truyền Thừa Động Thiên | 9 phút | Khai Nguyên tầng 1 | Cổ Trận Thủ Vệ |
| 03 · Cửu Âm Sơn Cốc | 9 phút | Khí Động tầng 1 | Cửu Âm Độc Chủ |
| 04 · Ly Địa | 10 phút | Chân Nguyên tầng 1 | Xích Diễm Thú Vương |
| 05 · Trung Đô · Đoạt Đích | 10 phút | Thần Du tầng 1 | Kiếm Trận Hộ Vệ |
| 06 · Trung Đô · Hạo Kiếp | 12 phút | Thần Du tầng 7 | Hắc Triều Thống Lĩnh |

Mỗi màn có hai đợt tinh anh, phối hợp quái, bộ đòn boss, điểm mốc và phần thưởng riêng. Sáu mốc được chọn lọc để phục vụ survival, không chuyển toàn bộ cốt truyện thành danh sách nhiệm vụ. Vượt lần đầu nhận thêm thưởng một lần; thắng lại vẫn nhận thưởng thường và chiến lợi phẩm trong màn.

| Màn | Cơ chế giao tranh | Cách ứng phó |
| --- | --- | --- |
| Hắc Phong Sơn | Thú triều: báo trước 3 giây, bầy thú tăng 25% tốc chạy trong 10 giây | Giữ đường thoát, di chuyển vòng và lướt khi bị vây |
| Truyền Thừa Động Thiên | Linh trận xuất hiện gần người chơi; đứng trong trận 3 giây nhận giảm 30% sát thương trong 10 giây | Theo dấu trên minimap, giữ chân trong vòng xanh dương để tụ linh |
| Cửu Âm Sơn Cốc | Độc chướng có vòng báo trước rồi trôi qua chiến trường | Rời vòng xanh lá và quan sát hướng mây trôi |
| Ly Địa | Hỏa triều quét qua sau 3 giây, có khe trống | Đi trong hành lang xanh hoặc ra khỏi dải quét |
| Trung Đô · Đoạt Đích | Tổ đội năm người có đội trưởng bảo hộ đồng đội gần hắn, giảm 35% sát thương nhận | Tìm cờ vàng/minimap và hạ đội trưởng để phá hộ trận |
| Trung Đô · Hạo Kiếp | Xung kích tăng tốc → hắc ấn khóa vị trí cũ → địch lộ sơ hở nhận thêm 30% sát thương | Né vòng tím, tận dụng cửa sổ phản công |

Cơ chế chỉ tính theo thời gian chiến đấu: chọn thẻ và tạm dừng cũng dừng mọi vùng/hiệu lực. Khi boss xuất hiện, các vùng môi trường và hiệu lực cơ chế được dọn để tập trung vào bộ đòn boss. Thắng/thua vẫn theo quy tắc hiện có; Linh hộ/hộ trận không ghi vào chỉ số hoặc tiến trình vĩnh viễn.

Đột phá qua các đại cảnh giới đầu yêu cầu vượt mốc lịch luyện tương ứng, **1 Hạt sen đột phá và 2 Tu Vi Đan**, ngoài tu vi. Các điều kiện hiện tại luôn được ghi trong phòng Tu luyện. Hoàn thành Trung Đô khi **hạ boss Hạo Kiếp và đạt Thần Du đỉnh phong tầng 10**; cổng thế giới tiếp theo được ghi nhận trong tiến trình, chưa có nội dung chơi Thế giới 2.

## Chiến đấu

Kỹ năng tấn công đạt **bậc 5** và hỗ trợ liên kết đã kích hoạt **từ bậc 1** sẽ mở thẻ thức tỉnh riêng để chọn khi lên cấp. Tấn công tối đa bậc 6, hỗ trợ tối đa bậc 5; hỗ trợ không bị tiêu hao. Hỏa Linh có thể liên kết cả hai kỹ năng hỏa trong cùng lượt.

| Tấn công bậc 5 | Hỗ trợ từ bậc 1 | Thức tỉnh bậc 6 |
| --- | --- | --- |
| Cương Quyền | Cường Thể | Long Viêm Quyền |
| Nguyên Khí Trảm | Tụ Khí | Kiếm Khí Phong Bạo |
| Dương Viêm Chưởng | Hỏa Linh | Kim Ô Phần Thiên Chưởng |
| Viêm Hoàn | Hỏa Linh | Liên Hoa Viêm Giới |
| Lôi Liên | Lôi Tâm | Cửu Thiên Lôi Liên |

Kỹ năng tấn công đạt **bậc 2** bắt đầu có thẻ **Biến chiêu**. Mỗi kỹ năng chọn một trong hai nhánh cho cả lượt; nhánh còn lại ngừng xuất hiện. Biến chiêu không chiếm ô mang theo và tiếp tục hoạt động sau thức tỉnh. Có thể xem lại tại menu tạm dừng hoặc tổng kết; ô kỹ năng đã biến chiêu có dấu ◆.

| Kỹ năng | Hai hướng biến chiêu |
| --- | --- |
| Cương Quyền | Liên Hoàn Kình: thêm dư kình; Băng Sơn Kình: một luồng lớn xuyên/đẩy quái |
| Nguyên Khí Trảm | Hồi Phong: kiếm khí quay về; Tán Ảnh: quạt kiếm rộng |
| Dương Viêm Chưởng | Tam Hoa: thêm chưởng; Lưu Hỏa: để lại vùng đốt |
| Viêm Hoàn | Quảng Vực: bán kính +60%; Liệt Diễm: sát thương mỗi giây +60% |
| Lôi Liên | Song Liên: hai chuỗi không trùng địch; Tam Điệp: ba nhịp tập trung một mục tiêu |

Mỗi thẻ ghi rõ hệ số sát thương và phần đánh đổi. Các chỉ số/hiệu ứng chỉ tồn tại trong lượt, cùng XP và bậc kỹ năng; không thay đổi cảnh giới, trang bị hay dữ liệu lưu. Nút đổi thẻ ưu tiên lựa chọn chưa xuất hiện; chỉ giữ lại thẻ cũ khi pool hợp lệ không đủ ba thẻ mới.

**Hồi Phong** xuyên không giới hạn trên cả đường đi lẫn đường về; mỗi địch nhận tối đa một lần sát thương mỗi chiều từ cùng một kiếm khí. Kiếm bay 7 đơn vị rồi quay lại vị trí hiện tại của nhân vật, quay sớm nếu gặp biên sân. **Viêm Hoàn** luôn đốt mục tiêu đang nằm trong vòng; làn sóng nhiệt lặp lại chỉ biểu diễn hiệu ứng. Bán kính bậc 1–6 lần lượt 1,8 / 2,2 / 2,6 / 3 / 3,4 / 4,2 đơn vị; cả hai nhánh giữ quy tắc tăng này. Sóng và viền dùng cùng phép chiếu/vùng sát thương, dừng theo pause/chọn thẻ.

Camera bắt đầu ở **1×**, có thể chỉnh **0,5×–3×** bằng nút −/+ dưới minimap, mỗi lần 0,25×. Thu nhỏ giúp quan sát vùng chiến đấu rộng hơn, không thay đổi tốc độ di chuyển hoặc va chạm.

Quyền kình, kiếm khí, chưởng lửa và linh vũ tiếp tục bay theo đường đã phóng cho tới khi trúng đủ mục tiêu hoặc ra khỏi bản đồ; chúng không còn tự biến mất sau 1,5 giây. Bậc 1–5 trúng tối đa 1–5 mục tiêu trực tiếp; bậc 6 xuyên không giới hạn trên đường bay. Chưởng lửa nổ một lần, tránh gây sát thương trùng từ cùng viên đạn. Đạn địch giữ thời gian tồn tại riêng. Quyền, kiếm, hỏa, lôi và đòn quái có âm thanh riêng; hiệu ứng phát theo lúc xuất đòn, tách khỏi nhạc nền.

| Thao tác | Điều khiển |
| --- | --- |
| Di chuyển tám hướng | WASD hoặc phím mũi tên; giữ hai phím để đi chéo |
| Tấn công | Tự chọn đối thủ gần nhất; quyền và kiếm luân phiên ba động tác |
| Lướt né | Space hoặc nút Lướt; hồi chiêu 4,5 giây |
| Dùng đan hồi máu | Q hoặc nút đan; mang tối đa 3 viên, hồi 45%, hồi chiêu 20 giây |
| Chọn thẻ khi lên cấp | Click hoặc phím 1/2/3 |
| Đổi bộ ba thẻ | Nút Đổi ba thẻ hoặc R; miễn phí một lần cả lượt, chỉ khi chọn thẻ |
| Tạm dừng / tiếp tục | Esc hoặc nút góc trên phải |
| Thu/phóng camera | Nút +/− dưới minimap |

Di chuyển để nhặt XP và chiến lợi phẩm, tránh đòn báo trước. Hắc Phong Sơn có Hắc Lang truy đuổi, Thiết Nha Trư lao húc và Độc Thiềm phun độc; hai tinh anh ở phút 3/6 và **Hắc Phong Lang Vương** phút 10. Các màn sau có khôi lỗi/kiếm linh, tà tu và diễm linh. **Đoạt Đích** dùng hộ vệ, kiếm khách và pháp tu; **Hạo Kiếp** dùng ma vệ và tà tu. Tinh anh, boss và quân triệu hồi của hai trận cuối cùng phe hình người. Boss dùng các kiểu trận pháp, độc, hỏa, kiếm và hắc triều.

Mỗi map rộng **64 × 64 đơn vị thế giới**, gần **10 lần diện tích bản 1.0**. Tỉ lệ hình nhân vật và tốc độ không đổi. Trung tâm và lối di chuyển thoáng, chỉ giữ hai vật cản ở các điểm mốc xa. Hắc Phong Sơn giữ Miếu cổ/Rừng trúc; mỗi màn sau có bố cục điểm mốc và tông màu riêng. Quái thường, tinh anh và boss đi vào từ ngoài vùng camera hiện tại, tự cập nhật khi thu/phóng hoặc đổi kích thước cửa sổ. Khi toàn sân đã nằm trong vùng nhìn, quái chỉ hiện ở biên map với cảnh báo trước 0,85 giây. Camera và minimap cùng đọc bố cục màn.

Viêm Hoàn có vòng lửa quanh chân và đợt bùng lửa theo đúng bán kính sát thương. Lôi Liên vẽ tia sét từ người chơi qua từng mục tiêu thực sự trúng đòn. Thức tỉnh đổi màu/cường độ; chế độ giảm hiệu ứng vẫn giữ vòng và tia chính. Hiệu ứng kỹ năng giữ thời gian nhìn thấy theo thời gian thực khi test x4–x8, còn cảnh báo đòn địch vẫn khớp thời gian chiến đấu.

Nhạc nền có giai điệu, tiếng gảy dây/sáo/chuông tổng hợp, bass và trống riêng theo sáu màn; boss tăng nhịp và độ dồn. Quyền/kiếm luân phiên ba biến thể âm; vòng lửa, chuỗi sét, địch dùng kiếm/pháp thuật, nhặt đồ, thắng/thua có âm riêng. Nhạc và SFX có công tắc riêng trong Thiết lập; giới hạn giọng phát và compressor giữ âm khi đông địch. Dữ liệu chỉnh tại `src/data/audio.ts` và `src/data/music.ts`.

Kỹ năng tấn công có năm bậc thường và bậc 6 thức tỉnh; hỗ trợ tối đa bậc 5. Có năm kỹ năng tấn công (Cương Quyền, Nguyên Khí Trảm, Dương Viêm Chưởng, Viêm Hoàn, Lôi Liên) và năm kỹ năng hỗ trợ (Cường Thể, Tụ Khí, Hỏa Linh, Lôi Tâm, Khinh Thân Quyết). Viêm Hoàn/Hỏa Linh mở ở Khí Động tầng 1; Lôi Liên/Lôi Tâm ở Chân Nguyên tầng 1; Khinh Thân Quyết ở Thần Du tầng 1.

Sau khi hết nâng kỹ năng, thẻ chỉ số vẫn tiếp tục xuất hiện.

Thắng nhận 100% phần thưởng. Bị hạ hoặc rút lui nhận 30% tu vi/linh thạch/nguyên liệu; số lượng nguyên làm tròn xuống. Mỗi trang bị/bản vẽ có 30% xác suất được giữ. Món trang bị trùng được đổi thành 25 linh thạch. Đan đã dùng bị tiêu hao ngay; viên chưa dùng được giữ.

## Cơ duyên trong màn

Tối đa bốn cơ duyên xuất hiện theo seed, thay thứ tự và vị trí mỗi lượt. Chỉ có một mục tiêu cùng lúc, có thể bỏ qua; không bắt buộc để gọi boss hoặc thắng màn. HUD ghi đồng hồ, khoảng cách, mục tiêu và chiến lợi phẩm; minimap dùng dấu sao tím khác dấu cơ chế màn.

| Loại | Cách hoàn thành | Giới hạn |
| --- | --- | --- |
| Rương có hộ vệ | Đến gần, bấm E phá ấn; hạ ba hộ vệ rồi trở lại bấm E mở rương | 55 giây giao tranh |
| Linh dược | Bấm E thu hái: linh thảo, XP, hồi ngay 25% máu tối đa và thưởng nhỏ | Không cần chiến đấu |
| Truy sát tinh anh | Bấm E nhận khiêu chiến, hạ một tinh anh riêng rồi trở lại nhận thưởng | 55 giây giao tranh |
| Tụ linh | Bấm E bắt đầu, giữ chân trong vòng đủ 12 giây; ra ngoài tiến độ giảm 0,5 giây/giây | 30 giây thử thách |

Mục tiêu chờ tham gia tối đa 70 giây; hoàn tất rương/tinh anh/tụ linh còn 30 giây để trở lại nhận thưởng. Địch hiện hình có cảnh báo 1,2 giây trước khi đánh; bộ hộ vệ theo bối cảnh từng màn, Đoạt Đích dùng võ giả, Hạo Kiếp dùng ma vệ. Boss xuất hiện sẽ hủy cơ duyên chưa nhận và dọn hộ vệ/đạn riêng.

Linh thạch, tu vi và vật liệu tạm giữ cùng chiến lợi phẩm: thắng nhận 100%, thua/rút lui nhận 30%; mỗi trang bị/bản vẽ dùng xác suất giữ 30% hiện có. XP/hồi máu chỉ có tác dụng trong lượt; cơ duyên không tự ghi Profile. Tổng kết ghi số cơ duyên đã nhận/bỏ lỡ.

## Lưu tiến trình

`localStorage` giữ cảnh giới, tu vi, vật phẩm, trang bị, linh thú, bộ kỹ năng, màn đã chọn, thành tích từng màn và cài đặt. Tự lưu định kỳ, khi nâng cấp/nhận thưởng/dùng đan và khi rời trang. Có bản lưu dự phòng; file nhập được kiểm tra phiên bản, số liệu và ID nội dung.

Tiến trình mới dùng **Profile phiên bản 2**. Bản lưu phiên bản 1 được chuyển tự động khi đọc hoặc nhập: giữ tài nguyên, cảnh giới, trang bị và các dữ liệu cũ; số trận thắng trước đây được ghi cho Hắc Phong Sơn, không tự mở thành tích các màn sau. Khóa `localStorage` cũ được giữ để tìm đúng bản lưu hiện có.

Idle ngoại tuyến tối đa **8 giờ**, không tự đột phá; tốc độ hấp thụ tăng theo cảnh giới và mốc lịch luyện đã vượt. Lượt chiến đấu không lưu giữa chừng: tải lại trang trở về lobby. Dùng chức năng xuất file trước khi chuyển trình duyệt, máy hoặc địa chỉ web; dữ liệu lưu theo từng địa chỉ/cổng.

## Hỗ trợ test nhanh

Bấm **Hỗ trợ test** ở góc trái bên dưới, bật **Bật chế độ test** tại lobby. Game dùng một bản tiến trình test riêng; tắt tại lobby để trở lại nhân vật chính. Khi tải lại trang, chế độ test bắt đầu ở trạng thái tắt; bật lại sẽ đọc bản test đã lưu.

- Cộng trực tiếp **10.000/100.000 tu vi**, không tiêu nguyên liệu; hoặc đặt ngay **Thần Du đỉnh phong tầng 10**.
- **Không giới hạn tài nguyên:** linh thạch, nguyên liệu và đan dược tự bù về 1.000.000 sau khi tiêu hao. Hồi chiêu đan trong màn vẫn có hiệu lực.
- Cấp toàn bộ **trang bị +5, bản vẽ và linh thú bậc 5 đã tiến hóa**. Chọn mặc trang bị ở kho đồ.
- Mọi màn được mở để test; thao tác này không tự tạo thành tích chiến thắng.
- Chọn sát thương **x1/x10/x50/x100**, áp dụng cho nhân vật và linh thú.
- Chọn tốc độ **x1/x2/x4/x6/x8**; trong màn có thêm nút ⏩ cạnh đồng hồ để đổi nhanh. Cả di chuyển, quái, đạn và hồi chiêu tăng cùng thời gian màn; lên cấp, tạm dừng và kết thúc vẫn dừng ngay mô phỏng.
- Có hai nút thử tiếng quyền/kiếm. Nếu hiệu ứng âm thanh đang tắt, bật lại trong Thiết lập.

Bảng tự tạm dừng khi mở trong lúc chiến đấu. Đóng bảng sẽ tiếp tục nếu chính bảng đã tạm dừng. Tiến trình test lưu ở `vo-luyen.profile.test.v1`; hệ số sát thương/tốc độ chỉ thuộc phiên đang chạy. Kiểm thử và cấu trúc tại [TEST_SUPPORT_QA.md](docs/TEST_SUPPORT_QA.md).

## Cấu trúc và chỉnh dữ liệu

```text
src/app/                 # React, canvas, cầu nối sự kiện và tiến trình
src/ui/lobby/            # Mỗi khu lobby là một component riêng
src/ui/                  # Lobby, HUD, thẻ, thắng/thua, tạm dừng
src/data/                # Cấu hình nội dung, kỹ năng, quái và công thức
src/domain/profile.ts    # Tu luyện, chế tạo, trang bị, sủng vật, phần thưởng
src/persistence/         # Lưu, kiểm tra và xuất/nhập
src/game/systems/        # RunEngine thuần TypeScript, âm thanh
src/game/entities/       # Render actor với pha chân và bộ đòn v3
src/game/scenes/         # Tải asset, lobby/map, input, camera và render
src/game/math/           # Phép chiếu, vùng chân và va chạm
tests/                   # Các quy tắc quan trọng và lượt mô phỏng đầy đủ
qa/                      # Bộ điều khiển kiểm thử, fixture và báo cáo
scripts/sync-assets.mjs   # Kiểm tra atlas, chọn và đồng bộ asset runtime
public/assets/v3/        # Asset gốc đã duyệt
public/assets/v4/        # Nền các phòng và ô nền rừng mới
public/game/             # Asset runtime tự sinh, dùng để build
art/                     # Nguồn tạo hình và trang xem asset
```

| Cần chỉnh | File |
| --- | --- |
| Thời lượng, mốc tinh anh, giới hạn quái, tốc độ/ranh giới | `src/data/stages.ts` |
| Bố cục map rộng, phép chiếu dùng chung, props và lối mòn | `src/data/stages.ts` |
| Điều kiện mở màn, tiến độ và hoàn thành thế giới | `src/data/campaign.ts` |
| Các khu lobby, nền và vị trí đứng của nhân vật | `src/data/lobby.ts` |
| Máu, công, tốc độ, hành vi từng quái/boss | `src/data/enemies.ts` |
| Kỹ năng và thẻ chỉ số | `src/data/skills.ts` |
| Liên kết, điều kiện và mô tả thức tỉnh | `src/data/awakenings.ts` |
| Thông số quyền/kiếm/chưởng/lôi và góc đạn | `src/data/combatSkills.ts` |
| Biến chiêu và hệ số riêng từng nhánh | `src/data/augments.ts` |
| Cơ duyên, hộ vệ theo màn, lịch và phần thưởng | `src/data/opportunities.ts` |
| Cảnh giới, số ô và tốc độ idle | `src/data/realms.ts` |
| Trang bị, chi phí, chỉ số, tên nguyên liệu | `src/data/equipment.ts` |
| Công thức đan | `src/data/recipes.ts` |
| Sủng vật và nội tại | `src/data/pets.ts` |
| Vùng chân của vật cản theo hình hiển thị | `src/game/math/mapGeometry.ts` |
| Nhịp spawn, sát thương, XP, projectile | `src/game/systems/RunEngine.ts` |

`stages` chứa sáu cấu hình; `stageById()` lấy màn theo ID. Scene, minimap và va chạm đọc cùng `layoutForStage()`/`projectionForStage()`/`trailsForStage()` để hình và tọa độ không lệch nhau. `campaign.ts` tập trung `stageUnlocked()`, `stageLockReason()` và `worldProgress()`; không viết lại điều kiện mở màn riêng trong UI.

Không sửa trực tiếp `assets.generated.json` hoặc `hero.generated.json`; chạy `npm run sync:assets` để sinh lại từ manifest đã qua kiểm tra (v3–v9). Địa hình cố định; seed mới mỗi lượt quyết định vị trí spawn, chiến lợi phẩm và thẻ. Nguồn nền và script xuất ảnh nằm trong `art/v4/`.

## Quyết định kỹ thuật

**Phaser** render sprite/camera và nhận bàn phím. **React** quản lý lobby/menu/HUD; vị trí cập nhật UI 10 lần/giây, không đưa cả đàn quái vào React state.

**RunEngine** tách khỏi Phaser, nhận input, màn đã chọn và bước thời gian. Kiểm tra tự động chạy cùng luật chiến đấu với game; `test:world` mô phỏng chuỗi sáu màn cùng tu luyện, trang bị và nhận thưởng. RNG có seed giúp tái lập lỗi. Renderer đọc trạng thái đó để hiện đúng pose tấn công/death; đòn đánh gây sát thương ở pha tiếp xúc.

Tọa độ mặt đất dùng chung cho actor/vật cản rồi chiếu isometric 35,264°. Scene, va chạm và minimap đọc các helper bố cục theo màn; `forestLayout`/`forestProjection` vẫn là nền cấu hình của Hắc Phong Sơn. Nền map lớn dùng `TileSprite` với ô ảnh 512 × 512 có mép nối khớp, thay vì một ảnh khổng lồ. Vật thể còn giữ dùng vùng chân theo hình; walk tiến theo quãng đường thực, không trượt chân khi bị chặn. Cây mờ khi che nhân vật.

Atlas được cache, đối tượng hình được giữ theo ID, quái và hiệu ứng có giới hạn. Engine tải ở chunk riêng. Font đóng gói cục bộ kèm giấy phép OFL; nhạc ngũ cung và hiệu ứng dùng Web Audio, khởi động sau thao tác người dùng.

Thiết kế và lịch sử asset: [GAME_DESIGN.md](docs/GAME_DESIGN.md), [ASSET_WORKFLOW.md](docs/ASSET_WORKFLOW.md). Bản 2.0.0 mở thêm Thông Huyền Đại Lục. Nâng chất lượng tạo hình Dương Khai 2.5D là đợt riêng, chưa đưa vào runtime.

Phạm vi và kiểm tra Thế giới 1: [WORLD_ONE_QA.md](docs/WORLD_ONE_QA.md). Lịch sử kiểm tra lobby/map 1.1: [LOBBY_MAP_1_1_QA.md](docs/LOBBY_MAP_1_1_QA.md). GitHub Actions chạy test/build trên mỗi lần push; tại máy cá nhân vẫn nên kiểm tra trước khi đồng bộ.

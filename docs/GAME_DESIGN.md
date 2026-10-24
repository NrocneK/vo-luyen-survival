# Tài liệu thiết kế game — bản đã duyệt 0.1

Ngày duyệt: 13/10/2026. Cập nhật: 16/10/2026. Bộ hình MVP v3 đang dùng trong game. Ngày 16/10 người dùng duyệt mẫu số 2 **Tiên hiệp 2.5D** cho đợt nâng cấp đồ họa; quy chuẩn tại [ART_DIRECTION_2_5D.md](ART_DIRECTION_2_5D.md). Người dùng đã kiểm tra di chuyển và yêu cầu hoàn thiện game với map đầu, bao gồm lobby đầy đủ thay màn khởi động. Bản Hắc Phong Sơn 1.0 triển khai các hệ thống của giai đoạn 2–6; hướng dẫn chơi và cấu trúc thực tế nằm trong README.md.

## 1. Ý tưởng cốt lõi

Game survival tiên hiệp với đồ họa 2.5D, sprite 2D và góc nhìn isometric chạy trên trình duyệt máy tính. Người chơi điều khiển Dương Khai, tự động chiến đấu với số lượng lớn đối thủ, lấy XP để phát triển bộ kỹ năng trong từng màn. Ngoài màn, nhân vật tích lũy cảnh giới, trang bị và sủng vật để ngày càng mạnh hơn, bảo vệ những người bên cạnh.

Tham khảo cảm giác chiến đấu của Vampire Survivors và thế giới Võ Luyện Đỉnh Phong. Chỉ chuyển những khu vực, thử thách và trận chiến nổi bật thành màn chơi; không chuyển toàn bộ chương truyện thành nhiệm vụ.

## 2. Vòng lặp gameplay

1. Tại khu vực nghỉ: nhận tu vi idle, tu luyện/đột phá, luyện đan, luyện khí, nuôi sủng vật.
2. Chuẩn bị: trang bị vũ khí, chọn kỹ năng đủ điều kiện cảnh giới, chọn một sủng vật đồng hành và đan dược mang theo.
3. Chọn một màn đã mở; mỗi lượt chơi là một màn độc lập.
4. Di chuyển bằng WASD/phím mũi tên. Nhân vật tự tấn công bằng kỹ năng mặc định của vũ khí đang trang bị.
5. Giết quái, nhặt hạt XP, lên cấp. Toàn bộ chiến đấu và thời gian màn tạm dừng khi chọn một trong ba thẻ ngẫu nhiên hợp lệ.
6. Kích hoạt kỹ năng đã chọn mang theo, tăng bậc, nhận cường hóa kỹ năng hoặc thuộc tính nhân vật; có thể thức tỉnh kỹ năng tấn công.
7. Gặp 1–2 tinh anh giữa màn. Sau khoảng 10 phút xuất hiện boss cuối; tiêu diệt boss để thắng.
8. Nhận thưởng, trở về khu vực nghỉ. Cấp và toàn bộ hiệu ứng từ thẻ trong màn được đặt lại.

## 3. Hai lớp tiến trình

| Nội dung | Tiến trình vĩnh viễn | Tiến trình trong màn |
| --- | --- | --- |
| Cấp độ | Cảnh giới và tiểu cảnh giới | Cấp lịch luyện từ XP |
| Thuộc tính | Thuộc tính gốc, trang bị, nội tại sủng vật đã mở, đan tăng thuộc tính | Những thuộc tính nhận từ thẻ |
| Kỹ năng | Quyền học và chọn mang theo, mở theo cảnh giới | Kích hoạt, bậc 1–5, thức tỉnh bậc 6 và cường hóa |
| Kết thúc màn | Giữ nguyên tiến trình đã có | Đặt lại toàn bộ |

Tu vi và XP là hai tài nguyên riêng. Kỹ năng đã đủ điều kiện sử dụng ngoài màn vẫn cần được kích hoạt trong lượt, ngoại trừ kỹ năng mặc định của vũ khí.

Số ô kỹ năng tăng theo cảnh giới, từ 2 đến tối đa 6. Kỹ năng tấn công có 5 bậc thường và bậc 6 thức tỉnh. Kỹ năng hỗ trợ có 5 bậc. Khi kỹ năng tấn công đạt bậc 5 và hỗ trợ liên kết đã được kích hoạt ở bậc 1 trở lên, thẻ thức tỉnh có thể xuất hiện trong ba lựa chọn khi lên cấp. Các cặp liên kết được khai báo rõ trong dữ liệu, có thể xem trước khi chuẩn bị vào màn.

Đề xuất chưa đặt trần cứng cho cấp lịch luyện; giới hạn nằm ở bậc kỹ năng. Sau khi hết thẻ nâng kỹ năng hợp lệ, vẫn có các thẻ cường hóa thuộc tính để lựa chọn. Tốc độ nhận XP và mức tăng của thẻ được cân bằng theo thời lượng màn.

Đề xuất để duyệt: kỹ năng mặc định của vũ khí chiếm một ô và bắt đầu mỗi màn ở bậc 1; kỹ năng tấn công và hỗ trợ dùng chung tổng số ô 2–6. Thẻ cường hóa thuộc tính không chiếm ô kỹ năng. Bậc của kỹ năng mặc định cũng được đặt lại sau màn.

## 4. Tu luyện và kinh tế

- Linh thạch là tiền tệ dùng trong luyện đan, luyện khí và các hoạt động nâng cấp có chi phí.
- Tu vi nhận từ màn chơi, đan tăng tu vi và hấp thụ linh khí idle. Phần thưởng tu vi của mỗi màn được cấu hình theo giai đoạn.
- Idle tăng chậm; tốc độ phụ thuộc giai đoạn hiện tại. Khi ngoại tuyến, tích lũy tối đa 8 giờ. Nhận tu vi không tự động thực hiện đột phá.
- Tiểu cảnh giới cần đủ tu vi. Đại cảnh giới cần thêm đan dược hoặc nguyên liệu đặc biệt; đủ điều kiện thì đột phá chắc chắn.
- Luyện đan tức thời bằng đan phương, dược liệu và linh thạch. Trình độ luyện đan mở công thức cao hơn. Có đan tăng tu vi, tăng thuộc tính vĩnh viễn, hồi phục trong màn; danh sách và giới hạn sử dụng sẽ được thiết kế ở giai đoạn 0.
- Trang bị phổ thông rơi từ màn hoặc chế tạo bằng linh thạch và nguyên liệu. Trang bị đặc biệt cần thêm bản vẽ và nguyên liệu cao hơn. Thuộc tính sản phẩm xác định theo công thức; có thể cường hóa tiếp.
- Mỗi sủng vật đã mở khóa cung cấp nội tại vĩnh viễn cho nhân vật. Mỗi màn mang một con trực tiếp hỗ trợ chiến đấu; ngoài màn có thể nuôi dưỡng, nâng cấp và tiến hóa.

| Kết quả màn | Tu vi, linh thạch và nguyên liệu theo số lượng | Trang bị/vật phẩm nguyên chiếc |
| --- | --- | --- |
| Thắng | Nhận 100% phần thưởng tương ứng | Giữ toàn bộ chiến lợi phẩm |
| Thất bại | Nhận 30% | Mỗi món có 30% xác suất được giữ |

Chiến lợi phẩm thu được trong lượt có bảng tổng kết riêng; giải quyết tỷ lệ nhận thưởng khi lượt kết thúc. Với tài nguyên đếm nguyên chiếc, phần 30% được làm tròn xuống. Tu vi có thể lưu phần lẻ. Tỷ lệ 30% của vật phẩm nguyên chiếc là xác suất cho từng món, không bảo đảm đúng 30% số món ở mỗi lượt.

## 5. Thế giới và màn chơi

Cấu trúc nội dung: thế giới/chương lớn → khu vực nổi bật → màn chiến đấu.

Khung hành trình: Trung Đô → Thông Huyền Đại Lục → Hằng La Tinh Vực → Tinh Giới → Càn Khôn Ngoại/Tam Thiên Thế Giới. [Tham khảo hệ thống thế giới](https://vidian.vn/chi-tiet/so-luoc-vo-luyen-dinh-phong). Các chặng chiến tranh về sau có thể là nhóm màn trong thế giới tương ứng, không mặc định là một thế giới riêng.

Muốn mở thế giới tiếp theo phải tiêu diệt boss cuối thế giới và đạt trần cảnh giới của thế giới hiện tại theo nguyên tác. Danh sách màn, boss và trần cảnh giới chính xác sẽ được đối chiếu, đề xuất và duyệt trong giai đoạn 0; tài liệu này chưa gán những con số chưa kiểm chứng.

Đề xuất bắt đầu bằng Hắc Phong Sơn thuộc chặng Trung Đô. Đây là màn lịch luyện được thiết kế lại cho survival; các đợt quái và boss của game không mặc định trùng nguyên xi một trận chiến trong truyện. [Tham khảo bối cảnh Hắc Phong Sơn, chương 87](https://xalosach.com/doc-truyen/vo-luyen-dinh-phong-chuong-87-ngui-mui-huong-biet-nu-nhan.html). Truyền Thừa Động Thiên và các trận mốc tại Trung Đô là ứng viên cho mở rộng tiếp theo. [Tham khảo Truyền Thừa Động Thiên, chương 208](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-208).

Mỗi màn có địa hình cố định, chướng ngại vật đơn giản và ranh giới rõ. Quái, tài nguyên và một số sự kiện thay đổi vị trí giữa các lượt. Các màn có nhịp tăng mật độ và sức mạnh quái theo thời gian. Độ khó vừa phải, đầu màn có khoảng chuẩn bị bộ kỹ năng, các đòn nguy hiểm được báo trước.

Giai đoạn đầu có yêu thú và võ giả đối địch. Ba hành vi nền: truy đuổi cận chiến, lao nhanh, tấn công từ xa. Tinh anh là biến thể mạnh hơn với hình ảnh nhận diện rõ. Boss mỗi màn có bộ đòn riêng và dấu hiệu báo trước dễ đọc.

## 6. Phạm vi bản thử nghiệm đầu tiên — đề xuất để duyệt

Một màn hoàn chỉnh cùng khu vực nghỉ và tất cả hệ thống cốt lõi ở quy mô nhỏ:

| Hạng mục | Nội dung đề xuất |
| --- | --- |
| Nhân vật | Dương Khai, một tạo hình giai đoạn đầu |
| Màn | Một màn Hắc Phong Sơn, khoảng 10 phút trước boss |
| Đối thủ | Ba loại quái thường, hai biến thể tinh anh, một boss |
| Kỹ năng | Hai loại vũ khí; ba kỹ năng tấn công, tính cả các kỹ năng mặc định; hai hỗ trợ; hai liên kết thức tỉnh |
| Tu luyện | Một đại cảnh giới với các tiểu cảnh giới cần thiết và một lần đột phá để kiểm tra vòng lặp |
| Luyện đan | Ba công thức đại diện: tăng tu vi, tăng thuộc tính, hồi phục trong màn |
| Trang bị/luyện khí | Bốn mẫu phổ thông, hai mẫu đặc biệt có bản vẽ; đề xuất bốn vị trí: vũ khí, áo giáp, trang sức, bí bảo |
| Sủng vật | Hai con với nội tại khác nhau; mang một con vào màn; có nuôi dưỡng và một bước tiến hóa mẫu |
| Tài nguyên | Một tiền tệ, XP, bốn nguyên liệu đại diện và các bản vẽ cần thiết |
| Giao diện | Chuẩn bị, tu luyện, luyện đan, luyện khí, kho đồ, sủng vật, chọn thẻ, HUD, thắng/thua |
| Lưu/âm thanh | Tự lưu, xuất/nhập dữ liệu, idle ngoại tuyến, hiệu ứng âm thanh và nhạc nền |

Tên kỹ năng, công thức, vật phẩm, tạo hình sủng vật và boss ở bảng trên được thiết kế cụ thể trong giai đoạn 0, phân biệt rõ yếu tố nguyên tác và nội dung bổ sung phục vụ gameplay.

## 7. Giai đoạn 0 — hoàn thiện hình ảnh trước code

Theo yêu cầu người dùng, hoàn thiện và duyệt toàn bộ bộ hình thuộc phạm vi đã thống nhất trước khi viết code game. Phạm vi đề xuất cho đợt đầu là toàn bộ asset dùng trong bản thử nghiệm một màn ở mục 6. Khi mở rộng nội dung, bộ hình cho phần mở rộng cũng được hoàn thiện trước khi lập trình phần đó.

Quy trình:

1. Chốt danh sách nội dung, mốc cảnh giới, bộ kỹ năng và cặp thức tỉnh; lập danh sách asset tương ứng.
2. Dùng phong cách tiên hiệp 2.5D mẫu số 2 đã duyệt; thống nhất góc nhìn, bảng màu, kích thước và quy tắc nhận diện nhân vật/quái/tinh anh/boss.
3. Tạo và duyệt tạo hình Dương Khai, từng quái, boss, sủng vật, vật phẩm và trang bị theo từng nhóm nhỏ.
4. Hoàn thiện sprite/khung hoạt ảnh cần dùng, biểu tượng kỹ năng và vật phẩm, hiệu ứng chiến đấu, tileset/chướng ngại vật, nền khu vực nghỉ và giao diện hình ảnh.
5. Kiểm tra đồng bộ phong cách, độ rõ khi thu nhỏ, nền trong suốt, kích thước/căn ô khung hoạt ảnh và khả năng nhận diện đòn nguy hiểm.
6. Lưu bộ hình hoàn chỉnh trong dự án, kèm bảng danh mục và bản xem trước; người dùng duyệt bộ asset trước khi chuyển sang giai đoạn 1.

Actor dùng rig và khớp trong không gian 3D, xuất sprite 2D theo camera isometric cố định. Đầu ra đợt nâng cấp giữ sắc độ mềm và chất liệu tiên hiệp 2.5D của mẫu 2. Các hình tĩnh được tạo bằng imagegen, chuẩn hóa và đóng gói bằng script đã được cho phép. Tranh ý tưởng được phân biệt với ảnh dùng trực tiếp trong game. Bản xuất dùng trong game cần đáp ứng kích thước, bố cục và nền trong suốt phù hợp; không coi một bảng tranh ý tưởng là bộ sprite hoàn chỉnh.

Các kích thước logic 48×48–128×128 thuộc đề xuất pixel art ban đầu. Chuẩn mẫu 2.5D mới dùng ô xuất 320×320 với điểm chân cố định; kích thước hiển thị trong game sẽ được kiểm tra trên camera thực tế khi tích hợp. Hoạt ảnh nhân vật/quái tối thiểu gồm đứng, di chuyển, tấn công và bị hạ; boss bổ sung các đòn riêng.

## 8. Công nghệ và cấu trúc dự án dự kiến

React + TypeScript + Vite + Phaser. Phaser xử lý vòng lặp chiến đấu, camera, va chạm, sprite và hiệu ứng. React xử lý giao diện quản lý và các màn lựa chọn. TypeScript giúp kiểm tra cấu trúc dữ liệu; Vite chạy môi trường phát triển và đóng gói bản web. Phiên bản thư viện sẽ được khóa khi dựng dự án.

Cơ sở lựa chọn: Phaser hỗ trợ game 2D web và TypeScript, có mẫu tích hợp React; Vite hỗ trợ dự án React/TypeScript. [Giới thiệu Phaser](https://docs.phaser.io/phaser/getting-started/what-is-phaser), [mẫu Phaser + React](https://phaser.io/news/2024/02/official-phaser-3-and-react-template), [hướng dẫn Vite](https://vite.dev/guide/).

Logic tu luyện, phần thưởng, chỉ số và chế tạo tách khỏi giao diện. React và Phaser trao đổi qua sự kiện tại các mốc cần cập nhật UI; vị trí của toàn bộ quái không được đưa qua trạng thái React mỗi khung hình. Dữ liệu nội dung tách khỏi xử lý chiến đấu để dễ chỉnh cân bằng.

Lưu tiến trình bằng localStorage, có phiên bản cấu trúc dữ liệu, thời điểm nhận idle và chức năng xuất/nhập file. Lưu các trạng thái vĩnh viễn; XP, bậc và cường hóa trong màn không trở thành tiến trình lâu dài.

Thư mục gốc dự kiến: `D:\Ken\Project\ChatGPT\Game`.

```text
Game/
├── docs/
│   ├── GAME_DESIGN.md
│   ├── ART_GUIDE.md
│   └── ASSET_MANIFEST.md
├── art/                    # Tạo hình, bản gốc và bản xem trước
├── public/assets/
│   ├── characters/
│   ├── enemies/
│   ├── bosses/
│   ├── pets/
│   ├── items/
│   ├── equipment/
│   ├── maps/
│   ├── effects/
│   ├── ui/
│   └── audio/
├── src/
│   ├── app/                # Khởi tạo React và nối với Phaser
│   ├── ui/                 # Giao diện React
│   ├── game/
│   │   ├── scenes/
│   │   ├── entities/
│   │   └── systems/        # Sinh quái, chiến đấu, XP, thẻ, boss
│   ├── domain/             # Tu luyện, chế tạo, sủng vật, thưởng, chỉ số
│   ├── data/               # Mỗi nhóm nội dung có file cấu hình riêng
│   │   ├── realms.ts
│   │   ├── worlds.ts
│   │   ├── stages.ts
│   │   ├── enemies.ts
│   │   ├── bosses.ts
│   │   ├── weapons.ts
│   │   ├── skills.ts
│   │   ├── cards.ts
│   │   ├── awakenings.ts
│   │   ├── equipment.ts
│   │   ├── recipes.ts
│   │   └── pets.ts
│   ├── persistence/        # Lưu, xuất/nhập, tính idle
│   └── shared/             # Kiểu dữ liệu và tiện ích dùng chung
└── README.md               # Hướng dẫn tiếng Việt
```

Cấu trúc trên là khung thiết kế. Cấu trúc đã triển khai được liệt kê trong README.md; comment và tài liệu quan trọng dùng tiếng Việt.

## 9. Lộ trình và mốc kiểm tra

Lộ trình được điều chỉnh để hoàn thành bản thử nghiệm một màn có đầy đủ vòng lặp trước khi mở rộng nhiều màn/thế giới.

| Giai đoạn | Sản phẩm có thể kiểm tra |
| --- | --- |
| 0 | Danh sách nội dung và toàn bộ bộ hình đã hoàn thiện, bản xem trước, danh mục asset; duyệt trước code |
| 1 | Khung React/Phaser; Dương Khai di chuyển, camera và map dùng asset đã duyệt |
| 2 | Ba hành vi quái; kỹ năng vũ khí tự đánh; va chạm, sát thương, máu và bị hạ |
| 3 | Hạt XP, lên cấp, tạm dừng chọn ba thẻ, kích hoạt/nâng kỹ năng và đặt lại lượt |
| 4 | Bộ kỹ năng đầy đủ của bản mẫu, hỗ trợ/thức tỉnh, tinh anh và boss; màn có thể thắng/thua |
| 5 | Khu vực nghỉ, chuẩn bị bộ kỹ năng, tu luyện/đột phá, luyện đan, luyện khí, kho đồ và sủng vật; xử lý phần thưởng 100%/30% |
| 6 | Lưu và xuất/nhập, idle 8 giờ, âm thanh, cân bằng và tối ưu; bản thử nghiệm một màn hoàn chỉnh |
| 7 | Chọn lọc thêm các màn mốc, chuyển thế giới theo boss/cảnh giới; hoàn thiện asset trước từng phần mở rộng |

Mỗi giai đoạn lập trình đều có bản chạy được và tiêu chí kiểm tra ngắn. Kiểm tra tập trung vào quy tắc có ảnh hưởng lớn: phân biệt tiến trình vĩnh viễn/tạm thời, điều kiện thẻ và thức tỉnh, phần thưởng khi thắng/thua, chi phí chế tạo, nội tại sủng vật và lưu/idle. Tối ưu đông quái bằng tái sử dụng đối tượng, giới hạn hiệu ứng và tra cứu va chạm phù hợp sau khi có số đo thực tế.

## 10. Các đề xuất cần duyệt cùng tài liệu

1. Phạm vi hoàn thiện asset trước code là toàn bộ bản thử nghiệm một màn; phần mở rộng tiếp tục áp dụng quy tắc làm hình trước.
2. Màn mẫu là Hắc Phong Sơn; danh sách các màn mốc và trần cảnh giới mỗi thế giới được chốt ở giai đoạn 0.
3. Kỹ năng mặc định chiếm một ô, kỹ năng tấn công/hỗ trợ dùng chung số ô 2–6; mặc định bắt đầu bậc 1.
4. Quy mô nội dung bản mẫu và kích thước asset là đề xuất ban đầu, có thể sửa khi duyệt tạo hình.

Sau khi người dùng duyệt tài liệu, bắt đầu giai đoạn 0. Chỉ bắt đầu code game sau khi bộ hình thuộc phạm vi đã thống nhất được hoàn thiện và duyệt.

## Nguồn tham khảo

- [Hệ thống thế giới Võ Luyện Đỉnh Phong](https://vidian.vn/chi-tiet/so-luoc-vo-luyen-dinh-phong).
- [Bối cảnh Hắc Phong Sơn, chương 87](https://xalosach.com/doc-truyen/vo-luyen-dinh-phong-chuong-87-ngui-mui-huong-biet-nu-nhan.html).
- [Truyền Thừa Động Thiên, chương 208](https://truyenhub.net/truyen/vu-luyen-dien-phong/chuong-208).
- [Phaser: giới thiệu](https://docs.phaser.io/phaser/getting-started/what-is-phaser).
- [Phaser và React: mẫu chính thức](https://phaser.io/news/2024/02/official-phaser-3-and-react-template).
- [Vite: hướng dẫn bắt đầu](https://vite.dev/guide/).


## Cập nhật asset ngày 13/10/2026

Người dùng tạm duyệt tạo hình rig hiện tại, yêu cầu nâng cấp đồ họa sau. Bộ đòn v3 hoàn thiện tối thiểu ba đòn quyền đổi tay, ba đường kiếm và bộ đòn riêng cho sinh vật/boss theo `ATTACK_DESIGN.md`.

## Bản map đầu ngày 14/10/2026

Lobby Lăng Tiêu Các hiển thị động phủ, nhân vật và linh thú đồng hành; có tu luyện, đan phòng, luyện khí, trang bị, linh thú, lịch luyện và thiết lập. Các khu tiêu hao/nhận tài nguyên thật và tự lưu.

Hắc Phong Sơn dài 10 phút trước boss; tinh anh ở phút 3 và 6. Ba quái thường, hai tinh anh, một boss bốn đòn; hai bộ vũ khí ba chiêu, Dương Viêm Chưởng, Cường Thể, Tụ Khí và hai thức tỉnh. Có XP/thẻ, lướt, đan hồi máu, thắng/thua/rút lui, phần thưởng 100%/30% và reset lượt.

Tu luyện từ Thối Thể tầng 1 đến đột phá mẫu Khai Nguyên tầng 1; đây là phạm vi của map mở đầu, không phải trần cảnh giới toàn Trung Đô. Ba công thức đan, sáu trang bị, hai linh thú có tiến hóa, idle 8 giờ, localStorage, xuất/nhập và âm thanh cục bộ được triển khai. Các mốc thế giới/map sau vẫn theo quy trình chọn lọc và duyệt nội dung khi mở rộng.

## Thế giới 1 ngày 18/10/2026

Người dùng chuyển trọng tâm sang gameplay và yêu cầu hoàn thiện thế giới đầu. Trần chương được chốt trực tiếp là **Thần Du đỉnh phong tầng 10**. Bản 1.2 triển khai Hắc Phong Sơn → Truyền Thừa Động Thiên → Cửu Âm Sơn Cốc → Ly Địa → Trung Đô · Đoạt Đích → Trung Đô · Hạo Kiếp. Chỉ chọn sáu mốc, mỗi lượt là một màn độc lập; cần vượt màn trước và đạt cảnh giới tối thiểu để mở màn sau.

Có 47 mốc cảnh giới, mười kỹ năng, bốn liên kết thức tỉnh, mười một trang bị và thưởng vượt lần đầu theo màn. Thắng cả sáu màn và đạt trần mới hoàn tất thế giới. Giữ ba công thức đan, hai linh thú và hệ thống lobby hiện tại; hiệu lực Tu Vi Đan/idle tăng theo tiến trình. Profile v2 ghi thành tích và chuyển dữ liệu v1 tự động. Bộ hình runtime v3/v4 được dùng cho đợt hoàn thiện gameplay; bộ dựng mới được giữ riêng cho nâng cấp mỹ thuật sau. Chi tiết và kiểm tra tại [WORLD_ONE_QA.md](WORLD_ONE_QA.md).

## Thức tỉnh — bản 1.6.0, ngày 20/10/2026

Hoàn tất mục 3 của lộ trình bổ sung. Mười kỹ năng hiện có đủ **năm liên kết thức tỉnh**: Dương Viêm Chưởng + Hỏa Linh bổ sung Kim Ô Phần Thiên Chưởng. Hỏa Linh hỗ trợ được cả hai kỹ năng hỏa, không bị tiêu hao khi thức tỉnh. Tấn công đúng bậc 5 + hỗ trợ liên kết từ bậc 1 mở thẻ để người chơi chọn; cả mười biến chiêu được giữ sau khi chọn bậc 6, mọi nâng cấp này chỉ tồn tại trong lượt.

Thông số và mô tả dùng dữ liệu chung; các hướng quyền/kiếm/hỏa/lôi được đo bằng 75 cặp thử có cùng điều kiện. Lobby/thẻ/menu tạm dừng hiển thị điều kiện và tiến độ, HUD hiện tên thức tỉnh thật. Phạm vi và số đo tại [AWAKENINGS_QA.md](AWAKENINGS_QA.md). Cơ duyên, cân bằng hành trình tu luyện và tổng kết sát thương vẫn là các mục 4–6 riêng.

## Cơ duyên — bản 1.7.0, ngày 20/10/2026

Hoàn tất mục 4 với rương hộ vệ, linh dược, tinh anh tùy chọn và thử thách tụ linh. Mỗi lượt trộn bốn loại theo seed và gieo vị trí gần đường di chuyển; chỉ một mục tiêu cùng lúc, có thể bỏ qua. Đến gần bấm E hoặc nút HUD để tham gia/nhận thưởng. Hộ vệ có cảnh báo hiện hình, dùng đúng loại theo bối cảnh sáu màn. Boss xuất hiện sẽ hủy cơ duyên chưa nhận.

XP và hồi máu có tác dụng ngay trong lượt; chiến lợi phẩm còn lại tạm giữ rồi quyết toán 100%/30% cùng phần thưởng màn. Cơ duyên không tự ghi vào Profile, không thay điều kiện thắng hoặc tiến trình thế giới. Dữ liệu, thời gian, phần thưởng và kiểm tra tại [OPPORTUNITIES_QA.md](OPPORTUNITIES_QA.md). Mục tiếp theo là cân bằng hành trình bằng nhân vật thường.

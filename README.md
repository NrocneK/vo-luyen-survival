# Võ Luyện — Hắc Phong Sơn 1.0

Game survival tiên hiệp trên trình duyệt, góc nhìn isometric, dùng React + TypeScript + Vite + Phaser 3. Bản này có một map hoàn chỉnh cùng lobby Lăng Tiêu Các và toàn bộ vòng lặp tiến trình của bản mẫu. Hình ảnh dùng bộ asset v3 đã duyệt.

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

Mở **http://127.0.0.1:5173/**. Trong lobby, chọn **Lịch luyện**, chuẩn bị bộ kỹ năng rồi bấm **Vào Hắc Phong Sơn**.

```powershell
npm run test           # Kiểm tra logic và mô phỏng trọn lượt
npm run typecheck      # Kiểm tra TypeScript
npm run test:balance   # Chạy 9 lượt tự động, báo cáo qa/balance-report.json
npm run build          # Đóng gói vào dist/
npm run preview        # Chơi bản build tại http://127.0.0.1:4173/
npm run format         # Định dạng code bằng Prettier
```

Lần cài thư viện cần Internet. Sau khi build, mã game, font, hình và âm thanh tổng hợp đều chạy cục bộ; không dùng CDN. Phải phục vụ `dist` qua HTTP, không mở `index.html` bằng `file://`.

## Bắt đầu tu hành

Bạn nhận 180 linh thạch, nguyên liệu ban đầu, quyền sáo, kiếm, võ phục và 2 Hồi Nguyên Đan. Các khu lobby dùng được trực tiếp:

- **Tu luyện:** hấp thụ linh khí chậm, dùng Tu Vi Đan và đột phá. Cảnh giới tăng chỉ số vĩnh viễn, mở kỹ năng và 2–6 ô mang theo. Mốc đầu là Thối Thể; có đột phá mẫu đến Khai Nguyên tầng 1.
- **Luyện đan:** ba công thức tăng tu vi, tăng chỉ số vĩnh viễn và hồi máu trong màn. Luyện đủ 4 viên mở đan sư bậc II. Cường Thể Đan dùng tối đa 5 viên.
- **Luyện khí:** bốn mẫu phổ thông và hai mẫu đặc biệt. Trang bị đặc biệt cần bản vẽ từ tinh anh/boss.
- **Trang bị:** bốn ô vũ khí/giáp/trang sức/bí bảo, kho nguyên liệu và cường hóa đến +5.
- **Linh thú:** ấp Linh Hồ hoặc Thanh Điểu, nuôi đến bậc 5, tiến hóa từ bậc 3. Mọi con đã mở cộng nội tại; chỉ một con đi cùng và hỗ trợ chiến đấu.
- **Lịch luyện:** chọn bộ kỹ năng theo cảnh giới. Kỹ năng vũ khí bắt đầu bậc 1; các kỹ năng mang thêm bắt đầu khóa và cần thẻ kích hoạt.
- **Thiết lập:** bật/tắt nhạc/tiếng, giảm số sát thương, xuất/nhập file tiến trình.

Linh thú và trang bị được giữ qua các lượt. Trong màn, XP, cấp, bậc kỹ năng và chỉ số từ thẻ được đặt lại khi kết thúc.

## Chiến đấu

| Thao tác | Điều khiển |
| --- | --- |
| Di chuyển tám hướng | WASD hoặc phím mũi tên; giữ hai phím để đi chéo |
| Tấn công | Tự chọn đối thủ gần nhất; quyền và kiếm luân phiên ba động tác |
| Lướt né | Space hoặc nút Lướt; hồi chiêu 4,5 giây |
| Dùng đan hồi máu | Q hoặc nút đan; mang tối đa 3 viên, hồi 45%, hồi chiêu 20 giây |
| Chọn thẻ khi lên cấp | Click hoặc phím 1/2/3 |
| Tạm dừng / tiếp tục | Esc hoặc nút góc trên phải |
| Thu/phóng camera | Nút +/− dưới minimap |

Di chuyển để nhặt XP và chiến lợi phẩm, tránh đòn báo trước. Có Hắc Lang truy đuổi, Thiết Nha Trư lao húc và Độc Thiềm phun độc. Hai tinh anh xuất hiện ở phút 3 và 6. Phút 10 xuất hiện **Hắc Phong Lang Vương** với cào trái, cào phải, vồ và gầm; phải diệt boss để thắng.

Kỹ năng tấn công nâng đến bậc 5; hỗ trợ tối đa bậc 5. **Cương Quyền bậc 5 + Cường Thể đã kích hoạt** cho thẻ Long Viêm Quyền bậc 6. **Nguyên Khí Trảm bậc 5 + Tụ Khí đã kích hoạt** cho Kiếm Khí Phong Bạo bậc 6. Sau khi hết nâng kỹ năng, thẻ chỉ số vẫn tiếp tục xuất hiện.

Thắng nhận 100% phần thưởng. Bị hạ hoặc rút lui nhận 30% tu vi/linh thạch/nguyên liệu; số lượng nguyên làm tròn xuống. Mỗi trang bị/bản vẽ có 30% xác suất được giữ. Món trang bị trùng được đổi thành 25 linh thạch. Đan đã dùng bị tiêu hao ngay; viên chưa dùng được giữ.

## Lưu tiến trình

`localStorage` giữ cảnh giới, tu vi, vật phẩm, trang bị, linh thú, bộ kỹ năng và cài đặt. Tự lưu định kỳ, khi nâng cấp/nhận thưởng/dùng đan và khi rời trang. Có bản lưu dự phòng; file nhập được kiểm tra phiên bản, số liệu và ID nội dung.

Idle ngoại tuyến tối đa **8 giờ**, không tự đột phá. Lượt chiến đấu không lưu giữa chừng: tải lại trang trở về lobby. Dùng chức năng xuất file trước khi chuyển trình duyệt, máy hoặc địa chỉ web; dữ liệu lưu theo từng địa chỉ/cổng.

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
public/game/             # Asset runtime tự sinh, dùng để build
art/                     # Nguồn tạo hình và trang xem asset
```

| Cần chỉnh | File |
| --- | --- |
| Thời lượng, mốc tinh anh, giới hạn quái, tốc độ/ranh giới | `src/data/stages.ts` |
| Máu, công, tốc độ, hành vi từng quái/boss | `src/data/enemies.ts` |
| Kỹ năng, liên kết thức tỉnh và thẻ chỉ số | `src/data/skills.ts` |
| Cảnh giới, số ô và tốc độ idle | `src/data/realms.ts` |
| Trang bị, chi phí, chỉ số, tên nguyên liệu | `src/data/equipment.ts` |
| Công thức đan | `src/data/recipes.ts` |
| Sủng vật và nội tại | `src/data/pets.ts` |
| Vùng chân của vật cản theo hình hiển thị | `src/game/math/mapGeometry.ts` |
| Nhịp spawn, sát thương, XP, projectile | `src/game/systems/RunEngine.ts` |

Không sửa trực tiếp `assets.generated.json`; chạy `npm run sync:assets` để sinh lại từ manifest v3. Địa hình cố định; seed mới mỗi lượt quyết định vị trí spawn, chiến lợi phẩm và thẻ.

## Quyết định kỹ thuật

**Phaser** render sprite/camera và nhận bàn phím. **React** quản lý lobby/menu/HUD; vị trí cập nhật UI 10 lần/giây, không đưa cả đàn quái vào React state.

**RunEngine** tách khỏi Phaser, nhận input và bước thời gian. Kiểm tra tự động chạy cùng luật chiến đấu với game, gồm cả hai tinh anh, bốn đòn boss, thức tỉnh, thưởng và reset. RNG có seed giúp tái lập lỗi. Renderer đọc trạng thái đó để hiện đúng pose tấn công/death; đòn đánh gây sát thương ở pha tiếp xúc.

Tọa độ mặt đất dùng chung cho actor/vật cản rồi chiếu isometric 35,264°. Vật thể dài được ghép nhiều vùng chân, không dùng một vòng tròn nhỏ ở gốc hình. Walk tiến theo quãng đường thực, không trượt chân khi bị chặn. Cây mờ khi che nhân vật.

Atlas được cache, đối tượng hình được giữ theo ID, quái và hiệu ứng có giới hạn. Engine tải ở chunk riêng. Font đóng gói cục bộ kèm giấy phép OFL; nhạc ngũ cung và hiệu ứng dùng Web Audio, khởi động sau thao tác người dùng.

Thiết kế và lịch sử asset: [GAME_DESIGN.md](docs/GAME_DESIGN.md), [ASSET_WORKFLOW.md](docs/ASSET_WORKFLOW.md). Bản này hoàn thiện map đầu; các map/thế giới tiếp theo và đợt nâng chất lượng tạo hình được mở rộng sau.

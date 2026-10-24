# Review Phần 1 — Trung Đô

Mốc chốt gameplay: **1.8.0** · Ngày lập: **20/10/2026**.

Tài liệu tổng hợp phạm vi đã thực hiện, đối chiếu mã hiện tại và hồ sơ kiểm thử của Phần 1. Tài liệu tiếp nối: [Handoff Phần 2](WORLD_TWO_HANDOFF.md).

## 1. Kết luận

**Thế giới 1 — Trung Đô đã hoàn tất gameplay theo phạm vi thống nhất:** chuẩn bị ở lobby → vào màn → đánh quái/nhặt XP/chọn thẻ → hạ boss hoặc kết thúc lượt → nhận thưởng → phát triển nhân vật → mở màn tiếp theo → kết chương.

Điều kiện hoàn thành chương là thắng đủ sáu màn, gồm boss Hạo Kiếp, và đạt **Thần Du đỉnh phong tầng 10**. Hai điều kiện thắng boss cuối và đạt trần có thể hoàn tất theo bất kỳ thứ tự nào. Sau kết chương vẫn trở lại lobby, tu luyện, chế tạo và chơi lại các màn đã mở được.

Mục 5 của lộ trình bổ sung — đo và cân hành trình theo thời lượng/số lượt lặp — **đã bỏ theo yêu cầu người dùng ngày 20/10/2026**. Đây là quyết định phạm vi, không phải một việc còn chờ xử lý.

## 2. Nội dung có thể chơi

Tên boss dưới đây là nội dung đã triển khai trong game, không phải bảng xác nhận mọi chi tiết của nguyên tác. Mỗi màn cần vượt màn trước và đạt cảnh giới tối thiểu tương ứng.

| Màn                    | Cảnh giới tối thiểu | Boss trong game      | Cơ chế riêng          |
| ---------------------- | ------------------- | -------------------- | --------------------- |
| Hắc Phong Sơn          | Thối Thể tầng 1     | Hắc Phong Lang Vương | Thú triều             |
| Truyền Thừa Động Thiên | Khai Nguyên tầng 1  | Cổ Trận Thủ Vệ       | Linh trận hộ thân     |
| Cửu Âm Sơn Cốc         | Khí Động tầng 1     | Cửu Âm Độc Chủ       | Độc chướng lưu động   |
| Ly Địa                 | Chân Nguyên tầng 1  | Xích Diễm Thú Vương  | Hỏa triều             |
| Trung Đô · Đoạt Đích   | Thần Du tầng 1      | Kiếm Trận Hộ Vệ      | Hộ trận thế gia       |
| Trung Đô · Hạo Kiếp    | Thần Du tầng 7      | Hắc Triều Thống Lĩnh | Chiến tuyến Hắc Triều |

Nguồn: `src/data/stages.ts`, `src/data/enemies.ts`, `src/data/stageMechanics.ts`, `src/data/campaign.ts`.

Các màn dùng sân rộng 64 × 64 đơn vị, ít vật cản, phép chiếu isometric thống nhất. Quái cận chiến, lao tới, đánh xa, tinh anh và boss được phân theo bối cảnh; hai trận Trung Đô có đối thủ hình người. Địch sinh theo vùng nhìn thực của camera; nếu camera bao hết sân thì sinh tại biên có cảnh báo hiện hình.

## 3. Bảng review tính năng

| Nhóm                | Phạm vi đã hoàn tất                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Nhân vật/điều khiển | Dương Khai; quyền và kiếm theo vũ khí; di chuyển tám hướng, tự tấn công, lướt, dùng đan, tạm dừng, thu phóng 0,5×–3×                   |
| Hoạt ảnh runtime    | Ba đòn quyền đổi tay, ba đường kiếm; các bộ đòn quái/boss; đồng bộ pha gây sát thương                                                  |
| XP/thẻ              | Nhặt XP, lên cấp dừng mô phỏng, chọn một trong ba thẻ; kích hoạt/nâng bậc kỹ năng, thẻ chỉ số; đổi bộ ba thẻ một lần/lượt              |
| Kỹ năng             | 10 kỹ năng: 5 tấn công và 5 hỗ trợ; tấn công tối đa bậc 6, hỗ trợ tối đa bậc 5                                                         |
| Biến chiêu          | 10 biến chiêu; mỗi kỹ năng tấn công chọn một nhánh từ bậc 2; giữ nhánh khi thức tỉnh                                                   |
| Thức tỉnh           | Đủ 5 liên kết; tấn công đúng bậc 5 + hỗ trợ liên kết bậc 1–5 mới có thẻ bậc 6; hỗ trợ không bị tiêu hao                                |
| Tu luyện            | 47 mốc cảnh giới, chỉ số vĩnh viễn; tu vi từ lịch luyện, Tu Vi Đan và idle; đột phá có điều kiện hiển thị trong lobby                  |
| Luyện đan           | 3 công thức: Tu Vi Đan, Hồi Nguyên Đan, Cường Thể Đan; tiêu nguyên liệu/linh thạch, có trình độ và giới hạn sử dụng                    |
| Trang bị/luyện khí  | 11 trang bị; 4 ô vũ khí/áo giáp/trang sức/bí bảo; đồ phổ thông và đồ đặc biệt cần bản vẽ; cường hóa                                    |
| Linh thú            | Linh Hồ và Thanh Điểu; nuôi dưỡng/tiến hóa; mọi con đã mở có nội tại, chọn một con đồng hành                                           |
| Lobby               | Sân trung tâm, Đan phòng phía Tây, Luyện khí đường phía Đông, Tĩnh thất phía Bắc, Linh thú viên phía Nam; kho đồ/lịch luyện/thiết lập  |
| Cơ duyên            | Rương hộ vệ, linh dược, tinh anh, tụ linh; tối đa bốn cơ duyên tùy chọn/lượt; dấu sân/HUD/minimap và tương tác E                       |
| Kết quả/phần thưởng | Thắng, tử trận, rút lui; thưởng vượt lần đầu, mở màn, quyết toán chiến lợi phẩm đúng một lần                                           |
| Tổng kết giao tranh | Sát thương HP thực theo kỹ năng/thức tỉnh/linh thú, tỷ trọng, số địch bị hạ; nguyên nhân tử trận và tối đa sáu đòn trong sáu giây cuối |
| Kết chương          | Tự mở khi vừa đủ điều kiện, xem lại tại sân trung tâm/kết quả thắng; giữ nhân vật và khả năng chơi lại                                 |
| Âm thanh            | Nhạc theo màn/pha/boss, các biến thể quyền/kiếm và hiệu ứng kỹ năng/quái/phản hồi; công tắc nhạc/SFX riêng                             |
| Lưu                 | Profile v2, chuyển bản v1, tự lưu, dự phòng/khôi phục, xuất/nhập JSON; idle ngoại tuyến tối đa 8 giờ                                   |
| Hỗ trợ test         | Tiến trình test riêng, cấp tu vi/cảnh giới/trang bị/linh thú, tài nguyên vô hạn; sát thương ×1/10/50/100; thời gian ×1/2/4/6/8         |

Điều khiển đã triển khai: WASD/mũi tên di chuyển, Space lướt, Q dùng đan, E tương tác cơ duyên, R đổi thẻ khi lên cấp, Esc tạm dừng. Bảng này xác nhận bản web hiện hành, không gán thêm trạng thái hoàn tất cho cổng điện thoại hoặc tay cầm.

### Năm liên kết thức tỉnh

| Tấn công          | Hỗ trợ    | Thức tỉnh               |
| ----------------- | --------- | ----------------------- |
| Cương Quyền       | Cường Thể | Long Viêm Quyền         |
| Nguyên Khí Trảm   | Tụ Khí    | Kiếm Khí Phong Bạo      |
| Dương Viêm Chưởng | Hỏa Linh  | Kim Ô Phần Thiên Chưởng |
| Viêm Hoàn         | Hỏa Linh  | Liên Hoa Viêm Giới      |
| Lôi Liên          | Lôi Tâm   | Cửu Thiên Lôi Liên      |

## 4. Các quy tắc đã chốt

**Hai lớp tiến triển:** cảnh giới/tu vi, trang bị, linh thú và tài sản thuộc nhân vật vĩnh viễn. XP, cấp trong màn, bậc kỹ năng, thẻ chỉ số, biến chiêu, hàng đợi đòn và cơ duyên thuộc một lượt. Kỹ năng mặc định theo vũ khí bắt đầu bậc 1; các kỹ năng mang theo còn lại cần thẻ kích hoạt.

**Thưởng:** thắng nhận 100% chiến lợi phẩm tương ứng; thua/rút lui nhận 30% theo luật quyết toán. Tài nguyên nguyên chiếc làm tròn xuống; tu vi giữ phần lẻ; mỗi món trang bị/bản vẽ có 30% xác suất giữ lại. Thưởng vượt lần đầu chỉ nhận một lần khi thắng. XP/hồi máu từ cơ duyên dùng ngay trong lượt; chiến lợi phẩm lâu dài chỉ được quyết toán khi kết thúc.

**Chiến đấu:** đạn phe ta không hết hạn theo giây, được dọn theo va chạm/ranh giới. Hồi Phong xuyên không giới hạn hai chiều, sổ trúng riêng từng chiều, quay ở tầm 7 đơn vị hoặc biên thật. Viêm Hoàn gây DPS liên tục; sóng nhiệt chỉ biểu diễn, không cộng thêm một lượt sát thương. Sát thương và hình vẽ dùng chung vùng thực.

**Thống kê:** chỉ tính HP thực mất sau các hệ số, không cộng overkill; đòn kết liễu boss được ghi trước khi chốt kết quả. Đạn/thiêu đốt/đòn trễ giữ nguồn và bậc lúc xuất đòn. Nguyên nhân tử trận giữ được nguồn đạn kể cả khi kẻ bắn đã bị dọn. Rút lui không bị trình bày như tử trận.

**Thời gian:** tăng tốc phải qua các bước mô phỏng nhỏ và dừng ở pause/thẻ/kết quả. Thời lượng hình ảnh và giới hạn âm thanh tuân theo quy tắc thời gian trình bày/thực đã có. Việc bỏ mục cân thời lượng hành trình không xóa đồng hồ trong màn, cooldown hoặc cơ chế theo chu kỳ.

## 5. Đánh giá cấu trúc kỹ thuật

React + TypeScript + Vite + Phaser 3 đang đáp ứng cấu trúc game hiện hành. Phaser quản lý frame, input, camera và sprite; React nhận HUD với tần suất giới hạn. `RunEngine` chạy độc lập renderer, cho phép kiểm tra luật chiến đấu và tái lập bằng seed.

| Trách nhiệm                           | Nơi chỉnh sửa chính                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Nội dung màn, điều kiện mở, cảnh giới | `src/data/stages.ts`, `campaign.ts`, `realms.ts`                                             |
| Nội dung chiến đấu                    | `src/data/enemies.ts`, `skills.ts`, `combatSkills.ts`, `augments.ts`, `awakenings.ts`        |
| Kinh tế và nhân vật                   | `src/domain/profile.ts`; `src/data/equipment.ts`, `recipes.ts`, `pets.ts`                    |
| Lượt chơi                             | `src/game/systems/RunEngine.ts`, `StageMechanics.ts`, `Opportunities.ts`, `RunStatistics.ts` |
| Hình học và hình ảnh                  | `src/game/math/`, `src/game/entities/`, `src/game/scenes/ForestScene.ts`                     |
| Cầu nối/UI                            | `src/app/GameBridge.ts`, `src/shared/`, `src/ui/`                                            |
| Lưu và test riêng                     | `src/persistence/save.ts`, `src/domain/testing.ts`                                           |
| Asset                                 | `scripts/sync-assets.mjs`, các manifest trong `public/assets/v3`, `v4`, `v5`                 |

Điểm cần chuẩn bị khi sang Phần 2 là tách định nghĩa từng thế giới. Hiện `worldProgress()` đếm toàn bộ `stages`; `WORLD_ONE_REALM_CAP` bằng `realms.length - 1`; lời kết và nhiều nhãn UI đang dành riêng cho Trung Đô. Đây là các điểm mở rộng cần xử lý trước khi nối thêm nội dung, được chỉ rõ trong handoff.

## 6. Hình ảnh hiện hành và đợt nâng cấp

- Runtime: Dương Khai/yêu thú v3, môi trường/lobby v4, đối thủ hình người v5. Các manifest này là đầu vào build hiện tại.
- Hướng người dùng đã chọn: **Tiên hiệp 2.5D — mẫu 2**. Bộ cutout biến dạng đã bị loại, không phải nguồn để kéo ghép tiếp.
- Bộ dựng mới: `art/duong-khai-rebuild/`, bản `fresh-3d-10759de3137b`; 19 clip × 8 hướng, 152 atlas theo hồ sơ QA nội bộ. Quy cách đọc từ `export/manifest.json`, `RELEASE_QA.json`, `QUALITY_GATE.md` và `qa/MOTION_V2_*` trong thư mục dựng.
- Bộ dựng mới chưa tích hợp vào runtime. QA nội bộ không thay cho người dùng duyệt tạo hình cuối. Nâng chất lượng đồ họa là một đợt riêng; không phải điều kiện còn thiếu để chốt gameplay Phần 1.

## 7. Bằng chứng kiểm chứng

Hồ sơ bản 1.8.0 gần nhất ghi nhận **168/168 kiểm thử đạt**, TypeScript/Prettier/build đạt. Kiểm tra trình duyệt đã bao gồm các luồng tổng kết, nguồn tử trận, kết chương khi thắng boss trước hoặc đột phá trước, lưu/tải, xem lại và bắt đầu lượt mới. Console QA và bản production không có lỗi/cảnh báo trong các phiên được ghi nhận.

Đây là kết quả phát hành đã lưu trong dự án; tác vụ lập review/handoff chỉ đối chiếu tài liệu và dữ liệu, không tạo một lượt kiểm thử gameplay mới.

| Hồ sơ                                                  | Nội dung                                              |
| ------------------------------------------------------ | ----------------------------------------------------- |
| [WORLD_ONE_QA.md](WORLD_ONE_QA.md)                     | Sáu màn, cảnh giới, tiến trình và chuyển save         |
| [TEST_SUPPORT_QA.md](TEST_SUPPORT_QA.md)               | Cách ly tiến trình test, tăng tốc, camera, đạn        |
| [COMBAT_PRESENTATION_QA.md](COMBAT_PRESENTATION_QA.md) | Hiệu ứng, sinh quái theo camera, hình người, âm thanh |
| [STAGE_MECHANICS_QA.md](STAGE_MECHANICS_QA.md)         | Sáu cơ chế màn và hình học chung                      |
| [AUGMENTS_QA.md](AUGMENTS_QA.md)                       | Mười biến chiêu và đổi thẻ                            |
| [FLAME_RETURN_1_5_1_QA.md](FLAME_RETURN_1_5_1_QA.md)   | Hồi Phong và Viêm Hoàn theo phản hồi người dùng       |
| [AWAKENINGS_QA.md](AWAKENINGS_QA.md)                   | Năm thức tỉnh, thông số và mô phỏng                   |
| [OPPORTUNITIES_QA.md](OPPORTUNITIES_QA.md)             | Bốn cơ duyên và quyết toán thưởng                     |
| [COMBAT_SUMMARY_QA.md](COMBAT_SUMMARY_QA.md)           | Thống kê, tử trận và kết chương                       |

Bằng chứng máy đọc được: `qa/combat-summary-browser-qa.json`. Log kiểm thử gần nhất: `qa/combat-summary-test.log`. Ảnh kiểm tra ở `qa/screenshots/`; log và ảnh bị Git bỏ qua nên cần sao chép riêng nếu muốn mang toàn bộ bằng chứng sang thiết bị khác.

## 8. Trạng thái bàn giao

| Mục                   | Trạng thái tại lúc lập tài liệu                                                               |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Phiên bản workspace   | 1.8.0 trong `package.json`                                                                    |
| Thư mục đang làm việc | `D:\Ken\Project\ChatGPT\Game`                                                                 |
| Repository cấu hình   | `https://github.com/NrocneK/vo-luyen-survival.git`                                            |
| Nhánh local           | `main`                                                                                        |
| HEAD local            | `9c7254e8b65115be65110f62f98da89e9cf17c8a` — mốc lobby/map 1.1                                |
| Mã sau HEAD           | Workspace có nhiều thay đổi chưa commit và tệp mới; HEAD trên không đại diện đầy đủ cho 1.8.0 |
| Nội dung chơi Phần 2  | Chưa triển khai                                                                               |

Trạng thái này được đọc từ máy local; tài liệu không xác nhận remote GitHub đã chứa toàn bộ 1.8.0. Việc lập hai file này không commit, push hay tạo release. Khi tiếp tục ở thiết bị khác cần mang theo đúng mã/asset 1.8.0 và xuất/nhập tiến trình qua giao diện; chỉ clone một commit cũ sẽ không tái tạo workspace hiện tại.

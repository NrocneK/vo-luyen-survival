# Handoff Phần 2 — tiếp nối Trung Đô

Ngày lập: **20/10/2026** · Nền gameplay: **1.8.0**.

Tài liệu dành cho người hoặc phiên làm việc tiếp theo. Đọc [AGENTS.md](../AGENTS.md), [Review Phần 1](WORLD_ONE_REVIEW.md), rồi tài liệu này. Các đường dẫn mã bên dưới tính từ gốc repository, để dùng được cả khi chuyển thiết bị.

**Cập nhật ngày 21/10/2026:** Phần 2 đã được triển khai ở 2.0.0 theo thiết kế đã duyệt và ủy quyền tự quyết các đề xuất còn lại. Tài liệu này giữ nền bàn giao 1.8.0 để tra lịch sử. Trạng thái mã hiện hành, quyền tiếp tục và kiểm tra thực tế nằm ở [WORLD_TWO_IMPLEMENTATION.md](WORLD_TWO_IMPLEMENTATION.md) và [WORLD_TWO_QA.md](WORLD_TWO_QA.md); không áp yêu cầu hỏi lại thiết kế của bản bàn giao cũ.

## 1. Mục tiêu tiếp nối và ranh giới công việc

Tiếp tục mở rộng game survival tiên hiệp sau Thế giới 1 — Trung Đô, kế thừa nhân vật, tài sản và hệ thống gameplay hiện có. **Chưa có nội dung chơi Phần 2 trong mã 1.8.0.** Bản bàn giao này không tự phê duyệt danh sách màn, boss, cảnh giới hay kỹ năng của chương mới.

Khung hành trình ghi trong `docs/GAME_DESIGN.md` đặt **Thông Huyền Đại Lục** sau Trung Đô. Đây là hướng tiếp nối trong thiết kế hiện có; cần người dùng chốt phạm vi cụ thể trước khi triển khai chương. Không tự điền các mốc truyện hoặc trần cảnh giới từ trí nhớ rồi coi là đã được duyệt.

Ưu tiên gần nhất là thiết kế Phần 2 và chuẩn bị cấu trúc nhiều thế giới. Đợt nâng hình ảnh 2.5D đã được tách riêng; chỉ gộp vào công việc này khi người dùng yêu cầu. Nếu bổ sung đối thủ/map mới, cần chốt danh sách asset và tạo đủ bộ dùng được trước khi tích hợp gameplay tương ứng.

## 2. Trạng thái xuất phát phải nhận đúng

- Workspace hiện tại: `D:\Ken\Project\ChatGPT\Game`, phiên bản `package.json` là **1.8.0**.
- Git local: nhánh `main`, HEAD `9c7254e8b65115be65110f62f98da89e9cf17c8a` thuộc mốc 1.1. Có nhiều thay đổi chưa commit/tệp mới sau HEAD. **Không reset/checkout đè hoặc coi HEAD này là mã hoàn chỉnh 1.8.0.**
- Remote cấu hình: `https://github.com/NrocneK/vo-luyen-survival.git`. Chưa kiểm chứng trạng thái remote trong tác vụ lập tài liệu; chưa commit/push nội dung bàn giao.
- Profile đang dùng phiên bản **2**, chuyển được dữ liệu v1. Khóa chính vẫn là `vo-luyen.profile.v1`; bản dự phòng `vo-luyen.profile.backup.v1`; bản phục hồi lỗi `vo-luyen.profile.recovery.v1`. Khóa test riêng `vo-luyen.profile.test.v1`.
- QA gần nhất của 1.8.0: **168 kiểm thử đạt**, TypeScript/Prettier/build đạt; xem `qa/combat-summary-browser-qa.json` và các báo cáo trong review. Đây là hồ sơ hiện có, không phải kết quả tự chạy lại ở mỗi máy nhận bàn giao.

Khi đổi thiết bị, đối chiếu cả `src/`, `tests/`, `docs/`, `qa/`, script, lockfile và các nguồn asset đang được manifest tham chiếu. `public/game/`, `dist/`, `node_modules/` là đầu ra/phụ thuộc có thể tạo lại. Các thư mục `art/` chưa commit, ảnh QA, log và model bị ignore cần chuyển riêng nếu tiếp tục việc mỹ thuật hoặc cần đầy đủ bằng chứng.

Tiến trình nhân vật nằm trong localStorage của từng origin/trình duyệt, không nằm trong GitHub. Xuất JSON ở Thiết lập trên máy cũ rồi nhập qua giao diện trên máy mới; không chép tiến trình test thành bản chính.

## 3. Những quyết định của người dùng phải giữ

1. Phần 1 chốt gameplay ở sáu màn và **Thần Du đỉnh phong tầng 10**. ID cảnh giới hiện tại là `0..46`, mốc cuối `46`; các ID đang có phải giữ ý nghĩa khi mở rộng.
2. Mở thế giới tiếp theo sau khi hoàn tất thế giới trước. Với Trung Đô, điều kiện là đủ sáu màn đã thắng, gồm Hạo Kiếp, và đạt mốc 46; không chỉ thắng boss hoặc chỉ nâng cảnh giới.
3. Cảnh giới/tu vi và tài sản là vĩnh viễn. XP/cấp trong màn/bậc kỹ năng/biến chiêu/thẻ là tạm thời. Không ghi bộ bậc kỹ năng sau một lượt vào Profile.
4. Kỹ năng mặc định theo vũ khí bắt đầu bậc 1. Các kỹ năng mang theo khác cần thẻ kích hoạt. Tấn công bậc 5 + hỗ trợ liên kết bậc 1–5 mới nhận thẻ thức tỉnh bậc 6; hỗ trợ không bị tiêu, biến chiêu được giữ.
5. Thắng nhận 100%; thua/rút lui nhận 30% theo luật số lượng/vật phẩm nguyên chiếc đang có. Giữ thưởng vượt lần đầu và quyết toán đúng một lần.
6. **Mục cân thời lượng hành trình đã bỏ.** Không đặt số giờ phải hoàn thành, số lượt phải lặp hoặc tự chỉnh kinh tế Trung Đô để ép người chơi vào một lịch trình. Đồng hồ màn/cooldown/tăng tốc test vẫn là cơ chế hợp lệ.
7. Camera isometric cố định; tám hướng thật, không lật một sprite ngang để giả mặt/lưng. Mở rộng map vẫn ít vật cản; vị trí, va chạm và hình vẽ dùng chung phép chiếu.
8. Quái và boss phải đúng bối cảnh trận; không đổi tên heo/sói thành võ giả. Quyền ít nhất ba đòn đổi tay, kiếm ít nhất ba đường, boss có bộ đòn và báo trước riêng.
9. Trao đổi, README và comment quan trọng bằng tiếng Việt. Dữ liệu nội dung tách khỏi scene/UI. Phaser xử lý frame; React không nhận cả đàn quái mỗi frame.
10. Tự kiểm tra và sửa xong trước bàn giao; không chuyển việc tìm lỗi sang người dùng. Không lặp lại các câu hỏi/quyền đã được chốt trong lịch sử.

## 4. Nội dung cần chốt trước khi code Phần 2

Đề xuất bắt đầu bằng một nhóm nhỏ tối đa 5–6 câu hỏi, dựa trên những gì đã biết thay vì hỏi lại thiết kế Phần 1.

| Quyết định                  | Cần có trước khi triển khai                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Thế giới/phạm vi cốt truyện | Xác nhận Thông Huyền Đại Lục và điểm bắt đầu/kết chương; chỉ chọn các khu vực/trận chiến nổi bật                          |
| Danh sách màn               | Số màn và tên mốc, thứ tự, bản sắc gameplay; không mặc định mọi chương đều sáu màn                                        |
| Cảnh giới                   | Trần chương mới, các tầng trung gian, yêu cầu chuyển đại cảnh giới; đối chiếu nguồn truyện khi cần rồi xin duyệt thiết kế |
| Kế thừa sức mạnh            | Cách mang trang bị/kỹ năng/linh thú sang chương mới, nội dung nào mở thêm; mặc định bảo toàn tài sản đã có                |
| Nội dung mới                | Chọn kỹ năng, biến chiêu, đan dược, nguyên liệu, trang bị/bản vẽ, linh thú thực sự cần cho chương                         |
| Lobby và mỹ thuật           | Giữ Lăng Tiêu Các làm hub chung hay có hub mới; danh sách quái/boss/map/hiệu ứng và bộ asset cần tạo                      |

Đầu ra cần duyệt là GDD Phần 2 ngắn gọn, bảng màn/cảnh giới/nội dung và danh sách asset. Chưa chốt ở tài liệu này: tên boss mới, số tầng mới, công thức mới, số lượng linh thú mới hoặc ngày phát hành.

## 5. Bản đồ mã để bắt đầu

| Việc cần làm                              | Điểm vào                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Định nghĩa màn/cổng                       | `src/data/stages.ts`, `src/data/campaign.ts`                                                                               |
| Cảnh giới, đột phá, chỉ số, idle          | `src/data/realms.ts`, `src/domain/profile.ts`                                                                              |
| Kiểu Profile và trạng thái UI/lượt        | `src/shared/models.ts`, `src/shared/types.ts`                                                                              |
| Đọc/lưu/chuyển dữ liệu                    | `src/domain/profile.ts` (`validateProfile`), `src/persistence/save.ts`, `src/domain/testing.ts`                            |
| Điều phối tiến trình, kết quả, kết chương | `src/app/GameBridge.ts`                                                                                                    |
| Vào ải/camera/input/render                | `src/game/scenes/ForestScene.ts`, `src/game/math/`                                                                         |
| Luật chiến đấu                            | `src/game/systems/RunEngine.ts`, `advanceSimulation.ts`                                                                    |
| Quái/kỹ năng/thức tỉnh                    | `src/data/enemies.ts`, `skills.ts`, `combatSkills.ts`, `augments.ts`, `awakenings.ts`, `projectiles.ts`, `skillEffects.ts` |
| Cơ chế màn/cơ duyên                       | `src/data/stageMechanics.ts`, `opportunities.ts`; các system/renderer tương ứng                                            |
| Kinh tế/nội dung lobby                    | `src/data/equipment.ts`, `recipes.ts`, `pets.ts`, `lobby.ts`; `src/ui/lobby/`                                              |
| Tổng kết                                  | `src/game/systems/RunStatistics.ts`, `src/shared/combatSummary.ts`, `src/data/combatReport.ts`, `src/ui/CombatReport.tsx`  |
| Lời kết hiện tại                          | `src/data/chapterEnding.ts`, `src/ui/ChapterEnding.tsx`, `src/ui/RunOverlays.tsx`                                          |
| Âm thanh                                  | `src/game/systems/Audio.ts`, `src/data/audio.ts`, `music.ts`                                                               |
| Tạo danh mục/copy asset                   | `scripts/sync-assets.mjs`, `src/data/assets.ts`, `vite.config.ts`                                                          |

### Những chỗ gắn riêng Trung Đô cần tách trước

| Hiện trạng đã đối chiếu                                                           | Cách xử lý đề xuất khi mở Phần 2                                                                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `worldProgress()` đếm toàn bộ `stages` và lấy phần tử cuối làm màn cuối           | Định nghĩa danh sách stage theo world ID; tính hoàn thành trên đúng danh sách của từng thế giới                                      |
| `WORLD_ONE_REALM_CAP = realms.length - 1`                                         | Cố định ý nghĩa trần Trung Đô ở mốc 46; thêm trần từng thế giới. Nối thêm cảnh giới không được dời trần Phần 1                       |
| Mốc 46 có `cost: Infinity`; đột phá dừng theo độ dài bảng và thông báo Thế giới 1 | Thiết kế mở cổng và chi phí chuyển tiếp đã duyệt; chỉ cho đi tiếp khi đủ điều kiện thế giới. Giữ tên/ID các mốc cũ                   |
| `StageDef.world` đang là nhãn `Trung Đô`, chưa có cấu trúc WorldDef               | Thêm định danh thế giới ổn định và cấu hình màn/trần/cổng/lời kết; quyết định có cần lưu lựa chọn thế giới hay suy ra từ màn đã chọn |
| `nextWorldUnlocked` chỉ là giá trị suy ra từ `completed`                          | Thêm luồng chọn/đi sang thế giới mới thật; không coi cờ này là nội dung Phần 2 đã tồn tại                                            |
| `clearedMilestone()` và idle dựa trên thứ tự toàn bộ `stages`                     | Xác định rõ mốc tiến trình dùng cho idle; tránh tự đổi tốc độ idle cũ chỉ vì sắp xếp lại mảng                                        |
| `permanentStats()` có công thức tăng theo chỉ số cảnh giới                        | Kiểm tra chỉ số ở các mốc mới và tương tác trang bị/kỹ năng; không sao chép enemyScale rồi mặc định phù hợp                          |
| Nhãn HUD/lobby, thanh sáu mốc và lời kết viết riêng cho Trung Đô                  | Hiển thị theo thế giới đang chọn; kết chương Trung Đô vẫn xem lại đúng sáu mốc và không phát nhầm ở chương mới                       |
| Cơ chế/cơ duyên/nhạc có cấu hình theo ID màn                                      | Cấp cấu hình rõ cho màn mới, tránh lặng lẽ dùng fallback Hắc Phong Sơn hoặc đội hình Trung Đô                                        |

Đây là đề xuất tổ chức mã cho phần mở rộng, **chưa được thực hiện** trong 1.8.0. Không chỉ nối Phần 2 vào cuối `stages`/`realms`: cách đó sẽ làm sai tiêu chí hoàn thành chương cũ.

## 6. Hợp đồng lưu và chuyển dữ liệu

1. Giữ ID cũ cho màn, cảnh giới, kỹ năng, trang bị, nguyên liệu, linh thú. Bản 1.8.0 đang tham chiếu cảnh giới bằng chỉ số mảng; không chèn mốc mới vào giữa 0–46.
2. Nếu cần trường mới hoặc Profile v3, viết luồng chuyển v1 → v2 → cấu trúc mới, có kiểm thử. Chỉ tăng `version` hoặc thêm trường TypeScript không đủ để dữ liệu cũ được chấp nhận.
3. `validateProfile()` dựng đối tượng từ `newProfile()` và gán từng trường. Nó kiểm tra chặt ID trang bị/kỹ năng/linh thú/màn và đọc nguyên liệu theo danh sách hiện hành. Trường mới có thể bị bỏ khi tải lại; nguyên liệu mới bị thiếu ở save cũ có thể làm validation thất bại nếu không có giá trị mặc định/migration.
4. `stageProgress` chỉ lưu màn đã thắng với `wins >= 1`. Không tạo hàng `wins: 0` cho mọi màn khóa. Giữ thành tích, thưởng lần đầu đã nhận, tài sản, cài đặt và thời điểm nhận idle của người chơi cũ.
5. Khóa chính và khóa test tiếp tục tách biệt. Thay đổi schema phải áp dụng cả load/save/import/export và công cụ test; không dùng `Infinity` làm tài nguyên Profile để giả vô hạn.
6. Bảo đảm nhân vật chưa hoàn thành Trung Đô vẫn ở chương cũ; đã hoàn thành thì mở cổng Phần 2 mà không mất nội dung chơi lại. Kiểm tra cả trường hợp hạ boss trước rồi mới đạt trần và ngược lại.

## 7. Quy tắc chiến đấu và trình bày cần giữ khi mở rộng

- Nguồn chung thông số/góc đạn là `data/combatSkills.ts`. Thẻ và engine phải cùng đọc dữ liệu này. Năm liên kết nằm ở `data/awakenings.ts`; mười biến chiêu ở `data/augments.ts`.
- Đạn phe ta có va chạm quét, xuyên theo bậc và không hết hạn theo giây. Hồi Phong xuyên cả hai chiều, không quay vì trúng mục tiêu; quay ở 7 đơn vị/biên thật, sổ trúng riêng từng chiều.
- Viêm Hoàn có bán kính bậc 1–6: 1,8 / 2,2 / 2,6 / 3 / 3,4 / 4,2. Quảng Vực tăng 60% bán kính; Liệt Diễm tăng 60% DPS. Sóng nhiệt bám nhân vật từ tâm tới rìa, độc lập với tick damage.
- Camera gửi footprint cho engine mỗi frame; camera 0,5× vẫn phải sinh quái ở ngoài vùng nhìn hoặc biên có báo trước. Không trở lại bán kính sinh cố định.
- Cơ chế màn/cơ duyên dừng khi pause/chọn thẻ và dọn khi boss/kết thúc; cleanup cơ duyên dùng toàn bộ guard IDs và `Projectile.sourceEnemyId` để xóa đúng đạn, kể cả khi actor đã bị dọn.
- Kỹ năng mới phải ghi đúng nguồn cho đòn trực tiếp, lan, đốt, đòn trễ và pet. Đếm HP thực trước kill/finish; giữ bậc lúc xuất chiêu. Địch/hiểm họa mới phải cung cấp nguồn cho tử trận.
- `advanceSimulation` tăng tốc bằng bước nhỏ, dừng ngay khi mode thay đổi. Hiệu ứng dùng `presentationTimeScale` theo quy tắc hiện hành, âm thanh giới hạn theo thời gian thực. Kiểm tra ×1 và ×8 cho nội dung mới.

Đọc các QA chi tiết trong review khi chỉnh một cơ chế; mô tả ở các bản cũ có thể đã được phản hồi mới thay thế, đặc biệt Hồi Phong/Viêm Hoàn 1.5.1.

## 8. Asset và giới hạn tích hợp hiện tại

Nguồn build hiện hành là manifest v3 (actor/chia sẻ), v4 (môi trường) và v5 (địch hình người) trong `public/assets/`. `scripts/sync-assets.mjs` xác minh manifest/hash, sinh `src/data/assets.generated.json` và copy bộ runtime vào `public/game/`. Vite dùng **`publicDir: public/game`**; chỉ bỏ một PNG vào `public/assets/` chưa làm nó xuất hiện trong bản build. Không sửa tay file generated để thay nguồn asset.

Bộ Dương Khai 2.5D mới nằm ở `art/duong-khai-rebuild/`, bản `fresh-3d-10759de3137b`. Đọc `QUALITY_GATE.md`, `RELEASE_QA.json`, `export/manifest.json`, `qa/MOTION_V2_*` trước khi dùng. Bộ này có ô 320/448 px, neo theo clip và mật độ 100 px/đơn vị; thông số đó thuộc bộ mới, không tự áp cho toàn bộ actor v3.

Yêu cầu chuyển động đã chốt: quyền tụ lực bên eo, chân–hông–vai phát lực nối tiếp, duỗi hết tay; kiếm đi/thủ tay phải thẳng lệch thân khoảng 15°, tay trái kết kiếm ấn; chém chéo → xoay cổ tay → chém ngang phải → thu sau hông → đâm hết tay; có hoạt ảnh chạy. Không tái dùng bộ cutout đã bị bác. Kiểm tra chuyển động ở tám hướng, nền di chuyển và điểm tiếp xúc; số file/khung PNG không thay cho QA hoạt ảnh.

## 9. Lộ trình Phần 2 đề xuất

| Chặng                     | Sản phẩm để kiểm tra                                                                    | Điều kiện đi tiếp                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| A. Chốt thiết kế          | GDD Phần 2, bảng màn/boss/cảnh giới/phần thưởng và danh sách asset                      | Người dùng xác nhận phạm vi; không tự thêm toàn bộ cốt truyện     |
| B. Tách nhiều thế giới    | Cấu hình world, tiến độ/trần/cổng theo world, UI lựa chọn và migration nếu cần          | Thế giới 1 vẫn đủ sáu mốc, trần 46, chơi được và đọc save cũ đúng |
| C. Asset cho màn mở đầu   | Bộ đối thủ/boss/map/hiệu ứng đủ dùng, manifest và QA chuyển động/hình học               | Tạo hình/hoạt ảnh đạt yêu cầu trước tích hợp tương ứng            |
| D. Một màn chơi trọn vòng | Từ cổng Trung Đô vào màn đầu Phần 2, chiến đấu/XP/thẻ/boss, thưởng, quay lobby, lưu/tải | Vòng lặp chạy thật; giữ tài sản và tiến độ cũ                     |
| E. Mở rộng chương         | Các màn mốc đã duyệt, nội dung tu luyện/chế tạo/linh thú/kỹ năng mới                    | Mỗi phần có bản chạy, cấu hình riêng và kiểm tra phù hợp          |
| F. Chốt chương            | Kết chương Phần 2, tổng kết đúng nguồn, hồi quy hai thế giới, cập nhật review/handoff   | Đạt các tiêu chí dưới đây và tự sửa xong trước bàn giao           |

Đây là thứ tự triển khai, không phải lịch giờ chơi hay cam kết thời gian phát triển. Trong lúc chỉ cần tạo tài liệu bàn giao, không tự bắt đầu các chặng lập trình trên.

## 10. Chạy và kiểm tra ở máy nhận bàn giao

Cần Node.js **22.12 trở lên** và đúng lockfile/asset nguồn. Tại gốc dự án:

```powershell
npm ci
npm run test
npm run typecheck
npm run check:format
npm run build
npm run preview
```

Bản preview mặc định: `http://127.0.0.1:4173/`. Khi sửa mã dùng `npm run dev`, mặc định `http://127.0.0.1:5173/`. Không dừng/chiếm server của công việc khác nếu cổng đang được dùng.

`npm run test:world`, `test:awakenings`, `test:balance` là công cụ chẩn đoán khi thay luật liên quan, không phải lý do tự mở lại mục cân thời lượng đã bỏ. Baseline trước Phần 2 là 168 kiểm thử; bổ sung kiểm thử có ý nghĩa cho world gating, migration và nội dung mới.

Trang `qa/*-audit.html` phục vụ kiểm tra bằng Vite dev, không đi vào `dist/`. Vite đang bỏ qua watcher cho `qa/`, `docs/`, `art/` và `public/assets/`; sửa harness QA có thể cần khởi động lại server để tránh dùng module đã cache. Chỉ dùng fixture/tiến trình test riêng, không chạy thử gây thay đổi bản lưu chính của người dùng.

### Tiêu chí nghiệm thu Phần 2

- Save v1/v2 tiếp tục đọc đúng; tài sản/cảnh giới/thành tích cũ giữ nguyên. Mở/tắt test và xuất/nhập không làm lẫn dữ liệu.
- Chưa hoàn thành Trung Đô không vào được Phần 2; đủ điều kiện thì chuyển được bằng UI thật. Quay lại Phần 1 vẫn đúng sáu màn và trần chương cũ.
- Một màn mới có đầy đủ chuẩn bị → giao tranh → XP/thẻ → boss/kết quả → quyết toán/lobby; thưởng lần đầu không nhận lặp.
- Pause/thẻ/kết quả chặn mô phỏng; camera xa, va chạm quét, hiệu ứng và âm thanh vẫn đúng ở ×1/×8.
- Quái/boss/map phù hợp bối cảnh; mọi nguồn damage mới hiện trong tổng kết và tử trận; asset có đủ hướng/đòn và không lệch vùng gây sát thương.
- Hoàn thành mỗi thế giới được tính riêng; kết chương/xem lại đúng chương, không tự phát lại mỗi lần tải.
- Tự kiểm tra gameplay và bản production; ghi hồ sơ thực tế, không gọi một bảng dữ liệu hoặc UI chưa nối logic là tính năng hoàn tất.

## 11. Đoạn giao việc cho phiên tiếp theo

> Tiếp tục dự án Võ Luyện từ nền gameplay 1.8.0. Đọc AGENTS.md, docs/WORLD_ONE_REVIEW.md và docs/WORLD_TWO_HANDOFF.md trước. Thế giới 1 — Trung Đô đã hoàn tất sáu màn và trần Thần Du đỉnh phong tầng 10; mục đo/cân thời lượng đã bỏ theo yêu cầu người dùng. Workspace có nhiều thay đổi chưa commit sau HEAD 9c7254e; giữ nguyên dữ liệu hiện có và xác minh đang nhận đủ mã/asset 1.8.0. Việc đầu tiên là cùng người dùng chốt thiết kế Phần 2 theo hướng Thông Huyền Đại Lục trong GDD: chỉ chọn các mốc nổi bật, xác nhận màn/boss/cảnh giới/nội dung mới. Chưa tự code hoặc tự chốt các nội dung này từ file handoff. Khi được duyệt triển khai, tách cấu hình từng thế giới trước khi thêm stages/realms, giữ ID/cổng/trần và save của Trung Đô; hoàn thiện asset mới cần dùng rồi xây một màn Phần 2 trọn vòng, sau đó mở rộng theo từng chặng. Toàn bộ trao đổi và tài liệu bằng tiếng Việt.

# Hiệu ứng chiến đấu Phần 2 — 2.1.0

Ngày 22/10/2026, sau phản hồi tiếp theo, bản 2.1.0 làm Du Long thon cả đầu/thân/chân, nội suy lịch sử đường bay bằng Catmull–Rom và dùng sóng thân dài hơn. Già Thiên Thủ chuyển từ các cầu/ống ghép thành một mặt liên tục theo trường khoảng cách trơn, bỏ viền từng khớp; cảnh báo/ấn tay chiếu về cùng biên trơn. Vũ Dực có gió cuộn rộng bên phong, sét nhánh và hồ quang sắc lam bên ngoài mép cánh, tăng khi lướt. Gốc cánh theo điểm bả vai xuất từ rig Dương Khai mới; Nhập Ma đổi màu cả các lớp trang bị. Chi tiết nhân vật/bảy ô: [hồ sơ ngoại quan](HERO_EQUIPMENT_2_1_QA.md).

Ngày 22/10/2026. Phản hồi của người dùng thay thế cách làm 2.0.2: ảnh rồng uốn theo dải vẫn giống hình dán; góc chưởng nhìn thẳng vào bàn tay không thể hiện một chưởng giáng từ trên xuống. Bộ ảnh v8 và trang `art/world-two-vfx/review/` là lịch sử đã bị bác, không còn là hiệu ứng runtime hiện hành.

Phản hồi tiếp theo cũng bác vật liệu đặc và dáng cánh 2.0.3. Bản 2.0.4 giữ đường chuyển động/khớp để định hình, thay vật liệu bằng vỏ linh lực xuyên nền. Các lớp dùng ADD, alpha đổi theo góc nhìn và luồng sáng; bỏ chiếu sáng kim loại và bóng vật thể rồng. Dải sáng mềm tạo bằng các kernel hạt dọc đường cong, alpha suy giảm về mép/đầu và chuẩn hóa theo khoảng cách mẫu. Không kéo ảnh nguyên kỹ năng. `vfxWings.ts` dựng lại toàn bộ cánh với vai cong, lớp khí liên tục, lớp lông phủ/lông bay, đầu lông có độ trễ và tan thành khí; không dùng bộ cánh nan quạt cũ.

## Chuyển động và hình khối

- **Kim Long / Du Long:** đầu dẫn một đường sống lưng có sóng cơ và độ cao; thân sinh dần từ vị trí nhân vật theo quãng đường đã bay. Tiết diện thân, bụng, gai lưng, sọ, hàm, sừng, tai, mắt và bốn chuỗi chân được dựng trong không gian. Râu, bờm, đuôi và dải khí có pha trễ riêng. Camera thấy các mặt khác nhau khi rồng ngoặt; không dịch/xoay một PNG nguyên con. Hạt sáng chạy theo đường bay. Thân dài 6,2 đơn vị, uốn theo lịch sử; hàm và chân chuyển động độc lập.
- **Già Thiên Thủ:** bàn tay nằm ngang, lòng hướng xuống mặt đất; camera nhìn mu tay và độ dày theo cùng góc isometric của sân. Tụ lực ở độ cao 4,6 đơn vị, ngón hơi cong rồi duỗi; cuối 0,8 giây mới giáng nhanh xuống. Vệt lực theo chiều rơi, bụi/tia lửa tại biên ngón và khối chưởng tan sau va chạm. Dấu tay ở mặt đất tồn tại 2,5 giây. Vùng làm chậm/cảnh báo/sát thương cùng đọc hình bàn–ngón, giữ ngón cái và khe giữa ngón; không dùng hình tròn hoặc alpha PNG.
- **Phong Lôi Vũ Dực:** gốc ở `ActorView.attachment('back')` của khung actor đang vẽ. Khớp vai/khuỷu/cổ cánh thay đổi trong 3D; các lông là dải có độ cong và pha trễ, hai cánh có phong/lôi sắc khác nhau. Lướt tăng biên độ/nhịp vỗ. Hình khối chia lớp trước/sau actor, không kéo giãn ảnh đôi cánh.
- **Nhập Ma:** khói mềm đen đỏ có tuổi và độ nổi, hỏa tinh bốc lên, ba luồng ma lực xoắn quanh thân và bùng khí lúc vào pha. Thân đổi màu, phù ấn và mắt phát sáng; hết pha trả màu. Giữ nháy sáng khi nhận đòn.
- **Diệt Hồn Kim Quang:** giữ renderer tia sáng 2.0.2 mà người dùng tạm chấp nhận: lõi trắng, các lớp quang, hạt chạy dọc tia; tầm nền 12/Phá Hồn 16; Tán Quang ba tia tính hợp vùng, mỗi địch nhận một lần. Long Tức vẫn bảy nhịp/1,4 giây, long hình tại nơi xuất chiêu được dựng bằng cùng khối rồng mới.

## Cấu trúc và hợp đồng gameplay

`vfxGeometry.ts` chứa phép chiếu XYZ, hình học thuần, đường sống lưng và hình bàn tay. `vfxModels.ts`/`vfxWings.ts` dựng các khớp/dải. `vfxMaterial.ts` giới hạn alpha, chọn viền sáng theo pháp tuyến và pha luồng năng lượng; `ProjectedVfx.ts` chiếu tam giác trong suốt, phân lớp sâu theo vị trí thế giới và quản lý dải hạt mềm. Texture duy nhất do mã tạo là một kernel tròn mềm cho từng hạt; không có texture nguyên con rồng, bàn tay hay đôi cánh.

`AdvancedSkills.ts` dùng chính `dragonSpine()` của renderer để quét thân và đường đi của các đốt. Chia bước tối đa 0,02 giây, giữ cả đường quét của đầu. RNG đường bay riêng, chọn điểm quanh người đang di chuyển, có lúc cắt qua địch gần. Bản nền 4,8 giây/Du Long 6 giây; mỗi địch cách ít nhất một giây; mỗi chạm 40% hệ số cơ bản, thức tỉnh cộng 35%. Giữ công/bậc lúc gọi và nguồn damage trước khi kết liễu. Không sửa hệ số kinh tế hay tiến trình lưu.

`techniqueGeometry.ts` đọc trường khoảng cách trơn qua `inHand()` và đường biên sinh một lần; hình cảnh báo/ấn/làm chậm đọc cùng nguồn. Sát thương chưởng vẫn phát ở cuối thời gian tụ–rơi, Điệp Chưởng cách 0,3 giây và chấn thức tỉnh giữ hợp đồng cũ. Dừng theo trạng thái pause/thẻ; kết thúc dọn vùng/cánh/ma khí, giữ đòn kết liễu đủ thời gian trình bày.

Boot và `sync-assets.mjs` đã bỏ tải ba ảnh v8. Icon UI v7 được giữ; Dương Khai chuyển sang v9 theo yêu cầu nâng nhân vật của người dùng, địch và thú giữ bộ cũ.

## Tham khảo và kiểm tra

Video do người dùng cung cấp: `C:\Users\Administrator\Desktop\Dragon Effect Sample.mp4` (1280×720, 30 fps). Dùng Blender FFmpeg giải mã các thời điểm khác nhau để xem đầu dẫn, thân kéo giãn/cuộn và đuôi trễ. Chỉ tham khảo chuyển động, không lấy hình từ video làm asset game. Các khung tham khảo ở `art/world-two-vfx-v3/reference/`.

- `npm test`: **221/221 đạt**, gồm ngoại quan/nhịp tiếp xúc. Các hợp đồng damage/nguồn/bậc/đột phá/save/nhiệm vụ cũ vẫn chạy cùng bộ. Vật liệu xuyên nền giữ kẹp tích vô hướng vào [0,1] trước lũy thừa viền để tránh NaN.
- Chuỗi Phaser thật qua `qa/worldTwoVolumeBrowser.cjs`, ảnh hiện hành tại `art/world-two-vfx-v5/qa/`, có contact theo thời gian cho Du Long, chưởng, cánh và Nhập Ma. Kiểm tra tám hướng neo cánh, zoom 0,5–3×, pause, hết Nhập Ma và các biến chiêu. Số khung/face không thay cho đánh giá chuyển động.
- Báo cáo hiện hành: `qa/world-two-v5-browser-qa.json`, **11 nhóm đạt**, không lỗi JavaScript/HTTP. Báo cáo `world-two-spirit-*` là lịch sử 2.0.4. Kiểm tra lớp ADD/dải hạt mềm, tám hướng neo cánh, pause cả canvas, WASD/thu phóng, hết pha Nhập Ma trả màu và kết quả dọn rồng/cánh/ma. CPU headless chỉ dùng đối chiếu trong môi trường QA, không cam kết FPS cho mọi thiết bị.
- Bản xem trực tiếp chạy cùng renderer/engine tại `/qa/world-two-effects.html?vfxPreview=1` trên server dev riêng, có chọn môn/phối hợp, phát lại, pause, thu phóng và WASD/Space. Dùng profile test, không dùng tiến trình chơi chính.
- Build/TypeScript/định dạng và `git diff --check` đạt. Kiểm tra khởi động bản build và vào Sa Thành: tải atlas Dương Khai v9, không tải ảnh v8, không lỗi JavaScript/HTTP (`qa/world-two-v5-production-qa.json`). Kiểm tra chuyển động từng kỹ năng dùng bản dev chạy cùng nguồn. Chunk game/Phaser và metadata ngoại quan khoảng 2,59 MB (gzip 694 KB); cảnh báo kích thước không chặn build.
- Trang xem chuyển pause/resume qua GameBridge để đồng bộ bàn phím ngay khi bấm, tránh mất lần giữ WASD đầu tiên. Công cụ QA chỉ trả dữ liệu gọn qua trình duyệt, không tuần tự hóa toàn bộ Camera/TextureManager khi đổi zoom.

Đánh giá hình ảnh ở đây là kiểm tra nội bộ, không có nghĩa người dùng đã duyệt tạo hình mới. Không đo/cân hành trình theo số giờ hoặc số lượt.

# Triển khai Phần 2 — Thông Huyền Đại Lục

## Quyền và phạm vi hiện hành

Ngày 21/10/2026, sau khi duyệt các bảng trang bị/đan và kinh tế, người dùng yêu cầu: **“các tính năng tiếp theo cứ làm theo đề xuất của bạn, không cần phải hỏi tiếp nữa”**. Tiếp tục chốt mặc định A, hoàn thiện thiết kế còn lại và triển khai/kiểm thử Phần 2; không hỏi lại từng mục. Quyền này thay bước chờ duyệt tiếp trong các bản nháp trước đó. Không gồm xuất bản hay push. Ngày 22/10, người dùng yêu cầu riêng nâng nhân vật và ngoại quan theo trang bị; bản 2.1.0 tích hợp Dương Khai 2.5D trong phạm vi mới này, xem [hồ sơ](HERO_EQUIPMENT_2_1_QA.md).

Sáu nhóm thông số kỹ năng ở WORLD_TWO_SKILL_BALANCE_DRAFT.md dùng A. Giữ 14 màn, Ma Đô giữa 13–14, sáu bước cảnh giới, bảy ô/16 món, toàn bộ nguồn/giá/đan/thú đã chốt và quy tắc giữ tu vi dư. Không cân theo thời lượng hành trình/số lượt.

## Thứ tự thực hiện

1. Nền nhiều thế giới; cảnh giới, kinh tế, trang bị/đan/thú; chuyển bản lưu cũ và kiểm thử hồi quy.
2. Asset đúng bối cảnh cho đối thủ mới, qua QA nội bộ trước khi tích hợp.
3. Nhiệm vụ 14 màn, boss nhiều pha, mục tiêu bảo vệ và Ma Đô/lời kết.
4. Ba tấn công, hai hỗ trợ, sáu biến chiêu/ba thức tỉnh; hình học/hiệu ứng/HUD dùng chung dữ liệu.
5. UI căn cứ/chuyển thế giới/bảy ô/luyện số lượng và kiểm thử đầy đủ, kể cả trình duyệt.

## Trạng thái

**Đã hoàn thành bản chạy 2.0.0**, gồm toàn bộ năm nhóm ở trên. Kết quả: 205/205 kiểm thử, typecheck/format/build đạt; mô phỏng đầu vào thắng 14/14 màn; 14 nhóm kiểm tra trình duyệt và production đạt. Xem [phạm vi/bằng chứng QA](WORLD_TWO_QA.md).

- Nền Trung Đô giữ sáu màn và realm46. Thông Huyền có 14 màn, sáu bước đến realm52; mở cổng, quay lại chương cũ, Ma Đô và hai lời kết đã nối vào UI thật.
- Profile v3 đọc được v1/v2, giữ khóa chính/test, tài sản, cường hóa và tu vi dư; chuyển áo cũ sang thân. Bộ kỹ năng nhận truyền thừa được lọc sau khi đọc stageProgress để không mất lựa chọn khi tải.
- Bảy ô/16 món mới, Linh Tài Thông Huyền, bản vẽ lần đầu, công thức/cường hóa, tên/hiệu lực đan, luyện hàng loạt và thú bậc 6–10 dùng các bảng đã chốt.
- `WorldTwoMission.ts` chạy mục tiêu/pha boss, mục tiêu HP và phần thưởng theo checkpoint; Sa Thành đấu tay đôi, Nam Thánh Cô là truy đuổi, Thần Thụ là tương tác, Cốt tộc bắt buộc Huyết Tinh Thạch.
- `AdvancedSkills.ts` và `techniqueGeometry.ts` điều khiển ba tấn công/hai hỗ trợ, sáu nhánh/ba thức tỉnh, đòn trễ/ấn/vùng và hai lượt lướt. Hiệu ứng/HUD đọc trạng thái thật, giữ nguồn/bậc và HP thực trong thống kê.
- Bộ năm actor mới ở `art/enemies-thong-huyen/` đã kiểm tra hình ảnh/chuyển động, đóng gói manifest v6 và đồng bộ runtime. Nền màn mới dùng hình học/mẫu nền trong mã; bộ Dương Khai 2.5D riêng vẫn để đợt sau.
- Workspace có nhiều thay đổi 1.8.0 chưa commit từ trước; đã giữ nguyên, không reset/checkout đè. Không commit, push, tạo PR hoặc xuất bản trong đợt này.

Các tài liệu tên `*_DRAFT.md` giữ phương án thay thế/lịch sử trao đổi; sáu nhóm thông số kỹ năng đều dùng A theo quyền tiếp tục ngày 21/10/2026. Không áp lại yêu cầu chờ duyệt tiếp của handoff cũ.

## Bổ sung 2.0.1 — hình riêng cho nội dung mới

**Cập nhật hiện hành 2.0.4:** sau khi người dùng bác vật liệu đặc và dáng cánh 2.0.3, VFX dùng vỏ linh lực xuyên nền, cộng sáng, luồng vàng trắng/xanh ngọc và dải hạt mềm. Cánh được dựng lại vai cong, lớp khí liên tục và lông xòe có độ trễ. Du Long vẫn uốn thân theo đường bay; chưởng nằm ngang, lòng úp xuống rồi giáng từ trên cao; ma khí cho thấy nhân vật qua lớp khói. Kim Quang giữ tia dài 2.0.2. Va chạm Du Long/vùng bàn tay tiếp tục dùng hình học chung; tiến trình và damage không đổi. Chi tiết tại [QA hiệu ứng](WORLD_TWO_EFFECTS_QA.md); các cách dựng cũ chỉ còn lịch sử.

Sau phản hồi về việc dùng ảnh cũ, đã tạo và tích hợp 30 PNG riêng (16 trang bị, 5 môn, 6 nhánh, 3 thức tỉnh). Bộ v7 có manifest/hash và hồ sơ xem ở cỡ thật; đồng bộ vào production qua `sync-assets.mjs`. Hai kiểm thử mới chặn ánh xạ ngược về ảnh cũ và xác minh file đóng gói; tổng 207/207 đạt. Xem [QA biểu tượng](WORLD_TWO_ICON_QA.md).

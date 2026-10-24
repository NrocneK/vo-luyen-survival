# QA Phần 2 — Thông Huyền Đại Lục 2.0.0

Cập nhật **2.0.4**: thay vật liệu khối đặc bằng linh lực trong suốt, dải hạt mềm, dựng lại dáng cánh theo phản hồi tiếp theo. Bộ kiểm thử hiện hành **218/218 đạt**; xem [WORLD_TWO_EFFECTS_QA.md](WORLD_TWO_EFFECTS_QA.md) cho thông số và kiểm tra chuyển động trực tiếp. Các số liệu phiên bản trước bên dưới giữ làm lịch sử.

Cập nhật **2.0.1**: bộ 30 biểu tượng riêng đã thay các ánh xạ ảnh Trung Đô của nội dung Phần 2. Tổng kiểm thử hiện hành **207/207 đạt**, build/format đạt; kiểm tra trình duyệt tải đủ 30 ảnh, tám nhóm giao diện đạt, không lỗi JavaScript/HTTP. Hồ sơ chi tiết tại [WORLD_TWO_ICON_QA.md](WORLD_TWO_ICON_QA.md). Bảng dưới giữ kết quả nền 2.0.0.

Ngày kiểm tra: **21/10/2026**. Phạm vi được triển khai theo các lựa chọn đã duyệt và ủy quyền tiếp tục các đề xuất A; xem [hồ sơ triển khai](WORLD_TWO_IMPLEMENTATION.md).

## Kết quả

| Kiểm tra | Kết quả / bằng chứng |
| --- | --- |
| Hồi quy và chức năng | **205/205 đạt** với `npm test`; gồm hành trình Trung Đô dùng thưởng thật và 37 kiểm thử mới về Phần 2 |
| TypeScript | `npm run typecheck` và bước TypeScript của `npm run build` đạt |
| Định dạng | `npm run check:format` đạt |
| Build production | `npm run build` đạt, xuất tại `dist/` |
| Mục tiêu 14 màn | Từng màn đi qua mục tiêu, các cổng pha boss và kết thúc thật trong `tests/worldTwoCombat.test.ts` |
| Giao tranh | Bộ điều khiển đầu vào thắng **14/14** màn; `qa/world-two-playtest-report.json` |
| Trình duyệt | 14 nhóm kiểm tra, không lỗi JavaScript/HTTP thiếu tài nguyên; `qa/world-two-browser-qa.json` |
| Asset mới | 5 actor, 8 hướng thật, 3 đòn mỗi actor, 2.720 khung; manifest v6 đã xác minh hash/QA |

Kiểm thử mục tiêu dùng đòn sát thương kiểm soát để đi qua các nhánh trạng thái; không dùng kết quả này để kết luận cân bằng. Bộ giao tranh riêng sử dụng nhân vật Nhập Thánh đỉnh phong với trang bị +5, đan và thú tối đa hợp lệ, chỉ điều khiển hướng di chuyển/chọn thẻ/tương tác/dùng đan/lướt. Không cấp bất tử, không nhân sát thương, không ép thắng. Đây là kiểm tra khả năng vận hành và giao tranh ở bộ trang bị ấy; chưa đại diện cho mọi lối chơi hoặc mọi mức trang bị.

Không đo/ép thời lượng hành trình hoặc số lượt phải chơi; các thời gian trong báo cáo là dữ liệu của lượt kiểm tra, không dùng để sửa chi phí hay tu vi theo mục tiêu thời gian.

## Những hợp đồng đã kiểm tra

- Trung Đô giữ sáu màn và tiêu chí hoàn thành realm 46; Thông Huyền có 14 màn và tiêu chí realm 52. Nhận kết chương dù boss cuối hoặc đột phá xảy ra sau. Lưu/tải không tự phát lại kết chương.
- Chuyển v1/v2 sang Profile v3 giữ ID tài sản, cường hóa, áo cũ vào ô thân, tiến trình và tu vi dư lớn hơn yêu cầu. Bảy ô trang bị; bí bảo cũ giữ quyền dùng, nhân vật mới mở sau Hắc Phong Sơn.
- Sáu chi phí/cổng truyện và phần dư sau đột phá; không tự nhảy cảnh giới. Idle dùng trần chung cao nhất, giữ giới hạn tám giờ và không lấy chỉ số màn Phần 2 nhân công thức Trung Đô.
- Luyện đan 1/5/10/tối đa; công dụng đổi từ realm 47; năm suất nền và năm suất Tẩy Tủy có bộ đếm riêng. Thú bậc 6–10 khóa theo cảnh giới, giữ tiến hóa và một con đồng hành.
- Bộ kỹ năng đã nhận truyền thừa được giữ nguyên sau lưu/tải; môn chưa đủ cổng truyện bị loại đúng lúc sau khi đọc tiến trình.
- Kim Quang giữ bậc/công khi tụ lực, ấn không cộng dồn, boss nhận nửa hiệu lực; hẹn nổ không bị dời khi làm mới, không tự hưởng ấn hoặc tự lặp.
- Điệp Chưởng có hai nhịp và một xung chấn thức tỉnh; Long Du quét từng địch một lần; Long Tức bảy nhịp, cửa sổ chí mạng và gom số; đường long ảnh dừng tại biên. Vùng vẽ và tính trúng đọc cùng dữ liệu.
- Nhập Ma không cộng hệ số hai lần; Phong Lôi có hai lượt hồi tuần tự, không tự lướt liên tiếp vì giữ phím; tạm dừng/lên cấp/kết quả dừng mô phỏng.
- An Linh Nhi có HP và đường thoát, Nam Thánh Cô không thể bị kết liễu; Thần Thụ là tương tác thân thiện. Tâm hộ trận và điểm giải phong là hai mục tiêu HP khác, điểm giải phong rời màn sau nghi thức.
- Sa Thành chỉ có Địch Kiêu ở cả hai pha, không bẫy sân/viện binh. Các màn khác có mục tiêu và cơ chế riêng, không dùng đồng hồ sống sót để thay điều kiện thắng.
- Cốt tộc khóa sát thương ở ranh giới pha, bắt buộc dùng Huyết Tinh Thạch tại tâm trận trước pha ba. Đạo cụ dựa trên chiến thắng màn 12, không chiếm ô trang bị.
- Mục tiêu bị phá khi nhân vật còn sống trả `mission-failed`, không ghi thắng/tử trận, chỉ nhận 30% phần thưởng theo mốc. Linh thạch dùng phép tính nguyên để tránh hụt một đơn vị; không nhân 30% hai lần.
- Đạn chọn va chạm sớm nhất giữa nhân vật và mục tiêu bảo vệ. Người chơi đứng trước có thể che đạn; đạn trúng mục tiêu trước không xuyên qua người chơi phía sau.
- Thống kê giữ nguồn/bậc lúc xuất và HP thực sau hệ số, chặn overkill; không lưu combat/rank/biến chiêu vào Profile. Khóa lưu chính và khóa test vẫn tách riêng.

## Kiểm tra hình ảnh và UI

Đã xem ảnh thật của các màn, hai bộ biến chiêu mới, màn hộ tống, bảy ô trang bị, luyện đan hàng loạt, Ma Đô, thất bại nhiệm vụ và kết chương Phần 2. Kiểm tra 1440×900 và 390×844, sửa HUD chồng lấn và camera khi đổi kích thước. Bản production đã mở trận Cốt tộc và tải actor v6 bằng bundle đóng gói; kiểm tra đủ sáu ô kỹ năng sau tải bản lưu.

Ảnh QA ở `qa/screenshots/world-two/` (thư mục nội bộ, không đưa lên Git). Asset nguồn/kiểm tra ở `art/enemies-thong-huyen/`, gồm `CONTACT_SHEET.png`, `ATTACK_CONTACT_SHEET.png`, `WALK_MOTION_QA.png`, `VISUAL_REVIEW.json` và `validate_release.py`. Đã sửa hướng khối xương, dựng lại và kiểm tra chuyển động trước khi đồng bộ. Bộ tạo hình Dương Khai 2.5D riêng chưa tích hợp.

## Chạy lại

```powershell
npm test
npm run typecheck
npm run check:format
npm run build
node --experimental-strip-types qa/worldTwoPlaytest.ts
```

`qa/worldTwoBrowser.cjs` dùng Playwright của runtime cục bộ, Chrome đã cài, dev tại 5173 và preview production tại 4173; chạy bằng `node --preserve-symlinks qa/worldTwoBrowser.cjs`. Nó dùng browser context riêng, không chạm bản lưu của người chơi. Các fixture/hook QA nằm ngoài entry production.

Build còn cảnh báo kích thước chunk Phaser khoảng 1,31 MB trước gzip (UI tải riêng); không có lỗi compile hoặc tài nguyên thiếu. Chưa xuất bản, push hay tạo PR trong đợt này.

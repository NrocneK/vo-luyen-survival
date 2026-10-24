# Kiểm tra Dương Khai 2.5D — 16/10/2026

**Trạng thái: người dùng đã bác bộ cutout này.** Các kiểm tra bên dưới chỉ ghi nhận quá trình kỹ thuật trước đó; chúng không chứng minh hình thể hoặc chất lượng mỹ thuật đạt yêu cầu. Không dùng báo cáo này làm xác nhận bàn giao. Bộ dựng mới phải qua tiêu chí tại `art/duong-khai-rebuild/QUALITY_GATE.md`.

## Phạm vi

Bộ nhân vật chính theo mẫu tiên hiệp 2.5D đã duyệt: quyền và kiếm, mỗi bộ có đứng, đi, thủ, ba đòn, liên hoàn, trúng đòn và ngã trên tám hướng thật. Bộ nguồn nằm tại `art/duong-khai-2-5d/`; runtime game tiếp tục theo lộ trình tích hợp trong `ART_DIRECTION_2_5D.md`.

## Hình và chuyển động

- Đã xem các tư thế chuẩn bị, phát lực, tiếp xúc, thu thế của ba đường kiếm ở cả tám hướng. Chém chéo có thay đổi độ cao, chém ngang quét ngược và đâm tiến thẳng. Kiếm gắn với bàn tay, phân lớp trước/sau thân và đi theo cổ tay khi buông xuống.
- Liên hoàn dùng ba đường kiếm trên, nối cùng thế thủ. Kiểm tra từng khung và tốc độ chậm; nguồn kiểm tra gồm các PNG thật và 24 ảnh chụp từ trang xem, tương ứng các khung 0, 3, …, 69 của clip 72 khung. Ảnh động `KIEM_LIEN_HOAN.gif` được đóng từ chuỗi ảnh trình duyệt này.
- Đã xem bước đi với nền chuyển động ở S/SW/W/NW/N/NE/E/SE, lấy các khung 0/6/12/18. Hai chân luân phiên trụ và nhấc, đầu gối gập, thân và vũ khí giữ cùng tỉ lệ. Bước đi quyền đã duyệt được giữ nguyên.
- Trúng đòn thu về thế thủ; ngã có nhịp khuỵu, mất thăng bằng và giữ tư thế cuối. Đã kiểm tra tóc, tà áo, ủng, cánh tay và kiếm ở tám hướng cho cả hai bộ vũ khí. Khung phản ứng có thêm đệm để giữ toàn bộ tạo hình.

## Kiểm tra tự động và trình duyệt

| Kiểm tra | Kết quả |
|---|---|
| PNG và metadata | 144 sheet, 4.880 khung, không thiếu ảnh/hướng |
| PNG RGBA và biên khung | Không khung rỗng, không alpha chạm biên, không hình ở ô dư |
| Bảy động tác quyền đã duyệt | 56 PNG trùng SHA-256 với nguồn đã duyệt |
| Hồi quy bộ dựng quyền | 24/24 ảnh kiểm tra trùng toàn bộ RGBA với nguồn: thủ, trực quyền và bước đi ở tám hướng |
| Ngã | 16/16 sheet giữ nguyên bảy khung cuối |
| Điểm neo | Khung 320 neo `(160,282)` và khung 448 neo `(224,346)` cùng một điểm chân thế giới |
| Trình duyệt | 144/144 lựa chọn động tác/hướng tải và phát đúng, không lỗi console |
| Điều khiển | Tốc độ 0,5×/1×, tua khung, ngã dừng ở 48/48, lùi về 47/48, Home về 1/48, phát lại hoạt động |

Manifest đã kiểm tra có SHA-256:

```text
6b73e93d599b3dc28905d4c15517b2cb7e0bc4d7cffcbe4ce0c7829ce1da677d
```

Chạy lại kiểm tra kỹ thuật bằng `python art/duong-khai-2-5d/validate_export.py`. Báo cáo PNG/hash, ảnh chụp và các bảng tư thế lưu trong `art/duong-khai-2-5d/internal/`, được bỏ qua khi đồng bộ Git. Sau mọi thay đổi động tác cần xem lại chuyển động trên đúng bản xuất; kiểm tra file không thay cho việc này.

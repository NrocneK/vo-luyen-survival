# Biểu tượng trang bị và kỹ năng Phần 2 — 2.0.1

Ngày thực hiện: **21/10/2026**. Thay các ánh xạ ảnh Trung Đô ở nội dung mới bằng bộ PNG riêng cho từng món/môn; không thay ID tài sản, tiến trình hoặc thông số gameplay.

## Phạm vi

- 16 món: hai bộ tám món Siêu Phàm/Nhập Thánh, mỗi bộ có quyền sáo/kiếm lựa chọn, mũ, chiến y, hộ uyển, giày, ngọc bội và bí bảo.
- Năm môn: Diệt Hồn Kim Quang, Già Thiên Thủ, Kim Long Hiển Hóa, Nhập Ma, Phong Lôi Vũ Dực.
- Sáu biến chiêu: Tán Quang, Phá Hồn, Trấn Địa, Điệp Chưởng, Du Long, Long Tức.
- Ba thức tỉnh: Diệt Thế Kim Quang, Già Thiên Ma Thủ, Phong Lôi Kim Long.

Tổng cộng **30 ảnh độc lập**, không cắt nhiều món từ một bảng ảnh và không đổi màu biểu tượng cũ. Bộ Siêu Phàm dùng đồng cổ/lam ngọc, bộ Nhập Thánh dùng ngọc trắng/kim sắc với hình dáng khác. Quyền sáo có khớp nắm đấm; hộ uyển để hở đầu ống. Ma Thần Hộ Ấn và Thánh Chủ Ngọc Ấn là hai pháp ấn khác nhau. Pháp thuật có hình mắt thần hồn, thủ ấn, rồng, ma văn và cánh phong lôi theo nội dung môn/nhánh.

## Nguồn và đóng gói

Dùng **image_gen tích hợp**, mỗi ảnh một yêu cầu tạo mới; Già Thiên Thủ có một lần sửa hình bàn tay trước khi duyệt. Toàn bộ prompt ở [prompt-set.json](../art/world-two-icons/prompt-set.json), PNG nguồn ở `art/world-two-icons/sources/`. Không dùng CLI/API key hoặc SVG làm ảnh thay thế.

`package_icons.py` giữ alpha thật, chuẩn hóa mỗi PNG về 256×256 với chủ thể nằm trong vùng 220×220 và đệm trong suốt. Ảnh đích ở `public/assets/v7/icons/equipment/` và `public/assets/v7/icons/skills/`. `icon-manifest.json` lưu hash riêng từng PNG và nguồn; chỉ đồng bộ sau khi duyệt hình ảnh.

`worldTwoIcons.ts` định tuyến theo loại/ID. Dữ liệu trang bị, môn, biến chiêu và thức tỉnh trỏ đến ID ảnh riêng. Các màn luyện khí, kho đồ, tu luyện, chọn bộ mang theo, thẻ lên cấp và HUD dùng chung `Icon`. Bộ Trung Đô giữ đường dẫn cũ.

## Kiểm tra

Ảnh đối chiếu ở `art/world-two-icons/QA_EQUIPMENT.png` và `QA_SKILLS.png`, mỗi mục gồm 128/64/40 px trên nền tối. Kiểm tra đúng chủ thể, ngón tay của thủ ấn, hướng/hình rồng, độ rõ khi thu nhỏ, viền alpha và đệm an toàn. Quy trình kỹ thuật tại `validate_release.py`; hồ sơ duyệt từng ảnh ở `VISUAL_REVIEW.json`.

Kết quả cuối: **207/207 kiểm thử đạt**, build production (gồm TypeScript) và kiểm tra định dạng đạt. Hai kiểm thử mới xác minh mỗi nội dung mới trỏ ảnh riêng và 30 file PNG có alpha/đúng kích thước/hash/khớp bản đồng bộ. `qa/world-two-icons-browser-qa.json` ghi tám nhóm giao diện đạt, tải đủ **30 ảnh duy nhất**, không lỗi JavaScript hoặc HTTP thiếu tài nguyên. Đã xem ảnh chụp kho/luyện khí, chuẩn bị môn, ba thẻ thức tỉnh, sáu thẻ biến chiêu, HUD desktop/mobile và bản production.

Ảnh giao diện ở `qa/screenshots/world-two-icons/`. Chạy lại QA trình duyệt bằng `node --preserve-symlinks qa/worldTwoIconsBrowser.cjs` khi dev chạy ở 5173 và preview ở 4173 (dùng Chrome/Playwright runtime cục bộ, context riêng không đụng bản lưu người chơi). Không lấy việc có file hoặc đúng định dạng để thay cho kiểm tra hình ảnh và giao diện thật.

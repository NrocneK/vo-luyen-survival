# Dương Khai và ngoại quan trang bị — 2.1.0

Ngày 22/10/2026. Người dùng yêu cầu tiếp tục sửa Du Long, Già Thiên Thủ, Vũ Dực và nâng tổng thể nhân vật, hướng tới ngoại quan theo trang bị. Yêu cầu này mở phạm vi tích hợp Dương Khai 2.5D; không còn áp trì hoãn tích hợp nhân vật của các bản trước. Không đổi hệ thống tiến trình hoặc cân hành trình theo thời lượng.

## Nhân vật và trang bị

`PlayerView.ts` dành riêng cho Dương Khai. Địch và linh thú giữ `ActorView.ts`. Thân nền xuất từ mesh/rig mới `fresh-3d-10759de3137b`; không lấy ảnh hoặc bộ phận từ cutout đã bị bác. Giữ camera isometric và tám hướng thật.

Mỗi bộ quyền/kiếm có đứng hoặc thủ, đi, chạy, ba đòn đánh, trúng đòn và ngã. Runtime lấy 100 pixel/đơn vị, ô và neo riêng từng clip, lọc LINEAR. Nhịp tiếp xúc của pose ánh xạ về nửa nhịp xuất sát thương hiện hành; không đổi tốc đánh, thời điểm gây damage hoặc nguồn đòn.

Các lớp trang bị dựng bằng mesh, bám cùng xương và render có che khuất theo từng pose. Bảy ô đọc trực tiếp `Profile.equipped`: quyền sáo/kiếm, pháp quan, áo và giáp, hộ uyển, giày, nhẫn/ngọc bội, ấn bên hông. Bí bảo chỉ hiện sau khi mở ô. Có ba dòng tạo hình cơ bản, Siêu Phàm và Nhập Thánh; một số món cùng dòng dùng chung hình với ánh xạ riêng. Áo dùng lớp vải trung tính giữ nếp và màu theo món, phối độc lập với sáu ô còn lại. Không thêm trường save, skin thương mại hoặc chỉ số.

Nguồn: `art/hero-equipment/equipment_mesh.py`, `render_equipment.py`, `produce.py`, `pack.py`. Render Cycles CPU, chỉ một bộ quyền/kiếm được giữ trong GPU. Atlas chứa thân trim và các mảnh lớp nhỏ có neo gốc; lớp được đóng gói có thể gồm nhiều mảnh, nhưng chỉ là tối ưu bộ nhớ ảnh đã render từ rig. Runtime không ghép khớp/cơ thể bằng biến dạng ảnh.

## Hiệu ứng đi cùng

- Du Long: thân và đầu thon hơn, nội suy đường lượn bằng Catmull–Rom, sóng thân dài và có pha trễ. Giữ va chạm quét theo sống lưng dùng chung.
- Già Thiên Thủ: một mặt liên tục theo trường khoảng cách trơn; không dựng bằng các cầu/ống ngón. Tụ linh lực trên cao, giáng xuống và lưu dấu năm ngón; viền cảnh báo được chiếu lại lên biên trơn.
- Vũ Dực: gió cuộn theo bên phong, sét nhánh nhấp hai nhịp bên lôi, tăng lúc lướt. Gốc cánh lấy điểm bả vai xuất từ pose xương, không ước lượng bằng tỷ lệ ảnh cũ.
- Nhập Ma tô màu đồng bộ cả thân và trang bị, hết hiệu lực dọn màu; giữ khói/hạt trong suốt. Kim Quang giữ tia hiện hành.

## Kiểm tra và tái tạo

1. Chạy `produce.py` bằng Python có Pillow/numpy và Blender portable. Script đóng băng hash toàn bộ nguồn rig và trang bị, xuất hai tiến trình CPU, có thể tiếp tục các clip đúng hash.
2. `pack.py` tạo `public/assets/v9/hero-manifest.json` và `src/data/hero.generated.json`. Bản `--partial` chỉ phục vụ kiểm tra nội bộ; không đủ điều kiện tích hợp.
3. `verify.py` kiểm nguồn, hash PNG/atlas, vùng trim, neo, điểm gắn, đủ hướng/clip và ghép khứ hồi thân/lớp so với render. Kết quả trong `art/hero-equipment/qa/asset-qa.json`.
4. Trang `qa/hero-equipment.html` dùng `PlayerView` thật, hồ sơ tạm không localStorage. Rà tám hướng, từng món, bộ phối, chuyển quyền/kiếm, đi trên nền chuyển động, ba đòn và ngã. Hồ sơ và ảnh thực trong `art/hero-equipment/qa/`.
5. Rà trong game với kho đồ, lobby, trận, điểm gắn kỹ năng, pause/kết quả và bản build. Trang xem VFX: `qa/world-two-effects.html?vfxPreview=1&rev=2.1.0`.

Trạng thái mỹ thuật là kiểm tra nội bộ, không được hiểu là người dùng đã duyệt tạo hình. Kết quả kiểm tra kỹ thuật không thay cho xem các chuỗi chuyển động và hình tại kích thước chơi.

## Kết quả bản tích hợp

- 16 clip × tám hướng, 2.880 pose; 6.912 phép ghép khứ hồi đạt. 72.057 mảnh trim/ô lớp đóng thành bảy atlas. Bộ nhớ ảnh giải nén của bộ quyền đang tải là 192 MiB, bộ kiếm 208 MiB; không giữ cả hai bộ sau khi chuyển xong.
- Trang xem PlayerView rà toàn bộ pose, tối đa 22/23 mảnh hiện trên nhân vật; đổi quyền → kiếm → quyền đã giải phóng đúng bộ cũ. Ảnh chuỗi và tám hướng được xem lại riêng, ghi trong `art/hero-equipment/qa/visual-review.json`.
- Sáu nhóm trong game đạt (`qa/hero-equipment-game-qa.json`): bảy nút Trang bị trong kho, chuyển ngoại quan vào trận, tám hướng/điểm gắn, màu Nhập Ma, ngã hết/giữ cuối và rút lui còn sống. Hồ sơ test không dùng khóa lưu chính.
- 221 kiểm thử đạt; TypeScript/build và định dạng đạt. Build thực khởi động/vào Sa Thành, tải atlas v9, không lỗi JavaScript/HTTP; xem báo cáo production của hiệu ứng. Không commit/push hoặc xuất bản trong đợt này.

# Rà lại video thay trang bị ngày 23/10/2026

## Phạm vi và trạng thái

Video gốc: `C:\Users\Administrator\Videos\Captures\Võ Luyện · Thông Huyền Đại Lục - Cốc Cốc 2026-10-23 18-39-20.mp4`, dài 64,13 giây, 1920 × 1052. Mốc bên dưới tính từ đầu video, gồm cả phần trình duyệt.

Người dùng đã nhìn thấy thay đổi quyền sáo sau bản 2.4.1 nhưng nhận xét khác biệt còn quá nhỏ. Lượt này chỉ rà và liệt kê phần bỏ sót để người dùng đối chiếu; **chưa sửa runtime, chưa đổi asset, chưa tăng phiên bản**.

Đã xem lại các bảng khung toàn cảnh, bổ sung 109 khung ở đoạn xoay hướng và trước/sau thao tác, phóng vùng nhân vật để so chi tiết. Đối chiếu thêm cách ghép áo hiện hành và ảnh game v11 đã chụp ở lượt trước. Ảnh video và ảnh v11 được giữ riêng; không dùng ảnh v11 làm bằng chứng video đã thể hiện bản sửa.

## Vấn đề đã biết còn tồn tại

- **Độ rõ của quyền sáo/hộ uyển:** đã khác nhau nhưng diện tích và tương phản còn nhỏ khi xem nhân vật ở kích thước thực tế. Đây là phản hồi mới của người dùng về bản sửa, không tính là lỗi mới phát hiện từ video cũ.

## Các vấn đề lượt trước bỏ sót

| Mã | Mốc video | Quan sát | Đối chiếu / giới hạn kết luận |
| --- | --- | --- | --- |
| V01 | 06,50–09,00; 12,50; 25,00; 56,50; 62,00 | **Cổ áo bị cắt và không ôm cổ.** Góc nghiêng lộ mảng da rộng; sau lưng xuất hiện một khe/viền ngang như cổ áo rời. Đường cổ không liền với mặt áo. | `cloth_layer()` khoét vùng đầu/cổ bằng ellipse sau khi ghép cổ áo; chưa có mask riêng theo phom cổ của từng bộ và từng hướng. Ảnh v11 vẫn thể hiện vấn đề. |
| V02 | 12,50 so với 14,00–16,50; 25,00; 56,50–64,00 | **Tay áo và phần quần vẫn giữ nhiều hình cơ thể trần.** Các bộ khác nhau ở mặt thân và tà, nhưng ống tay vẫn bó sát cùng bắp tay/cẳng tay, phần chân có cùng đường khối; trường bào chưa có phom tay áo tương xứng. | Phần tay/chân được dựng từ alpha và độ sáng cơ thể, tô bảng màu vải; ngoài Võ Phục chỉ nới biên khoảng một pixel. Đây là thiếu sót của cách dựng ngoại quan, không phải lỗi save không nhận món đồ. |
| V03 | 56,00–58,00; 61,00–64,00 | **Trường bào có mảnh vải thừa ở cạnh cổ tay/eo và đường ráp tà gãy.** Rõ nhất ở Thánh Nguyên Chiến Y: một mảnh viền xanh–vàng chìa ngang bên tay phía phải ảnh, trong khi cánh tay đã có ống tay khác. Huyền Linh cũng có các dải tà/đai ráp rời. | Nguồn áo được cắt lõi và dải dưới eo rồi chia đôi để ghép. Vùng cắt có thể giữ cả phần ống tay bên cạnh; hiện chưa phân biệt cấu trúc tay áo với tà trước/sau. Cần sửa vùng cắt và hình dáng liên tục, không chỉ đổi thứ tự lớp. |
| V04 | 13,50–14,00; 24,00–25,00; 56,00–64,00 | **Thay áo đổi luôn giày dù ô Chân đang trống.** Tháo áo trở lại chân trần; mặc áo/giáp lại xuất hiện giày/ủng, trường bào còn đổi viền giày. Điều này làm ngoại quan ô Chân khó hiểu. | Mã hiện có chủ đích ghép “giày vải thuộc bộ nền” trong lớp áo. Không có bằng chứng game tự mặc trang bị Chân hoặc cộng nhầm chỉ số. Đây là vấn đề phân chia ngoại quan và thể hiện ô trống cần chốt lại. |
| V05 | 14,00–24,00, rõ khi so 15,00 / 15,50 / 16,00 / 16,50 | **Hoạt ảnh đứng đổi hình đột ngột.** Đầu luân phiên cúi/ngẩng, đường ngực–bụng và viền quần đổi nét cùng lúc; cảm giác bật giữa hai hình, chưa thành nhịp thở tự nhiên. | Clip đứng dùng hai khung rời và đổi trực tiếp. Không kết luận nhân vật mất chân hay trượt neo: những lỗi đó chưa có bằng chứng rõ trong đoạn này. |
| V06 | 00,00–28,00; đối chiếu 56,50–64,00 | **Icon không thống nhất với món đồ và ngoại quan.** Huyền Thiết dùng cùng icon Đồng; Huyền Giáp dùng cùng icon Võ Phục. Icon áo xám/đai đỏ không mô tả giáp đen đang mặc; các bộ cao hơn cũng có chi tiết ở icon không được thể hiện đầy đủ trên sprite. | `equipment.ts` vẫn có alias Huyền Thiết → Đồng và Huyền Giáp → Võ Phục. Bản 2.4.1 đã tách ảnh quyền sáo trên người nhưng chưa sửa icon kho đồ. Cần đồng bộ thiết kế, không làm các icon khác nhau chỉ bằng màu. |
| V07 | 19,00–23,00; 32,00–60,00 | **Kho đồ có hai vùng cuộn lồng nhau.** Cuộn ngoài làm thanh lọc và tiêu đề kho mất khỏi tầm nhìn, hàng đồ bị cắt sát dưới tiêu đề Trang bị; cuộn trong lại dịch riêng lưới đồ. Việc tìm/lọc/đổi món mất ngữ cảnh. | Quan sát được hai thanh cuộn trong ảnh toàn cảnh. Không có bằng chứng chắc chắn thao tác bấm bị mất, lựa chọn tự đổi hay trang bị sai; không ghi các suy đoán đó thành lỗi. |

## Bằng chứng ảnh

- [Chuỗi xoay hướng](../art/hero-pixel-runtime/qa/user-report-2026-10-23/audit-rotate.png)
- [Chi tiết cổ, tay áo và giày theo hướng](../art/hero-pixel-runtime/qa/user-report-2026-10-23/audit-turn-details.png)
- [So bốn bộ áo trong video](../art/hero-pixel-runtime/qa/user-report-2026-10-23/audit-cloth-details.png)
- [Hai trạng thái đứng lặp lại](../art/hero-pixel-runtime/qa/user-report-2026-10-23/audit-idle-SE.png)
- [Toàn cảnh lúc thay Huyền Linh](../art/hero-pixel-runtime/qa/user-report-2026-10-23/video-56.50.png)
- [Toàn cảnh kho sau khi cuộn](../art/hero-pixel-runtime/qa/user-report-2026-10-23/video-20.00.png)

Video chỉ thể hiện lobby/kho đồ. Không dùng lượt rà này để kết luận hoạt ảnh đi/chạy/đánh, VFX, chiến đấu hoặc toàn bộ bảy ô đã đạt. Các nhận xét phom trang phục và độ mượt đứng là chất lượng hình ảnh; V04 và V07 là sự rõ ràng của giao diện/ngoại quan, không tự suy thành lỗi dữ liệu.

Ưu tiên đề xuất sau khi người dùng đối chiếu: V01–V03 (cấu trúc áo) cùng độ rõ quyền sáo; tiếp V05; sau đó thống nhất V04/V06 và xử lý V07. Chưa triển khai các thay đổi này trong lượt rà.

# Tổng kết giao tranh và kết chương Trung Đô — 1.8.0

Ngày thực hiện: 20/10/2026. Đây là mục 6 của lộ trình. Mục 5 đã được người dùng bỏ qua: không đặt thời lượng hoàn thành, không điều chỉnh tu vi, chi phí hay số lượt lặp theo một thời gian mục tiêu.

## Hành vi đã triển khai

- Sau thắng, tử trận hoặc rút lui: bảng sát thương theo kỹ năng, tỷ trọng và số địch bị hạ; linh thú có hàng riêng. Giai đoạn trước và sau thức tỉnh tách riêng, hiển thị tên thức tỉnh thật và biến chiêu đã chọn.
- Chỉ đếm HP thực mất sau chí mạng, hệ số test, tăng/giảm sát thương. Sát thương dư khi kết liễu không được cộng. Đòn trực tiếp kết liễu boss được ghi trước khi chốt kết quả.
- Đạn xuyên, hai chiều Hồi Phong, dư kình, vụ nổ, vùng Lưu Hỏa, DPS Viêm Hoàn, chuỗi/Tam Điệp Lôi Kích và cả hai linh thú đều giữ nguồn. Đạn/vùng đốt/đòn trễ giữ bậc lúc xuất đòn, kể cả khi nhận thức tỉnh lúc đòn cũ chưa kết thúc.
- Phần tử trận ghi tên kẻ địch, loại đòn và số chiêu; hoặc Độc chướng/Hỏa tuyến/Ám vực. Nguồn đạn được sao chép lúc bắn, vẫn đúng sau khi actor đã chết hoặc bị dọn. Lịch sử tối đa sáu đòn trong sáu giây mô phỏng cuối, ghi sát thương sau giáp/linh hộ và HP thực mất.
- Rút lui có tiêu đề riêng, không hiện nguyên nhân tử trận. Dừng sát thương ở pause/lên cấp/kết quả; không để đạn phe ta đổi tử trận thành thắng sau khi đòn cận chiến đã làm HP bằng 0. Hiệu ứng kim diễm ở đòn kết liễu boss vẫn giữ thời lượng hiển thị theo quy tắc cũ.
- Kết chương cần **đủ sáu màn đã thắng + Thần Du đỉnh phong tầng 10**. Tự mở khi boss là điều kiện cuối hoặc khi đột phá là điều kiện cuối. Có thể xem lại từ sân trung tâm và kết quả thắng; tải tiến trình đã hoàn thành không phát lại tự động.
- Kết chương có lời kết, sáu mốc đã vượt, cảnh giới cuối và hướng dẫn tiếp tục lịch luyện. Không đặt lại nhân vật, không mở màn Thế giới 2 chưa có nội dung.
- Dialog kết chương nhận focus, Tab giữ bên trong, Escape đóng, nền không tương tác. Bảng tổng kết mở từ đầu trang, không tự cuộn xuống nút cuối.

## Cấu trúc và bản lưu

`src/shared/combatSummary.ts` là kiểu dữ liệu; `RunStatistics.ts` là bộ ghi chỉ trong lượt, độc lập với công thức/RNG chiến đấu. `data/combatReport.ts` ánh xạ tên nguồn, `CombatReport.tsx` vẽ bảng tổng kết. Snapshot thống kê sao chép và đóng băng, không bị lượt sau sửa lại.

`data/chapterEnding.ts` chứa lời kết; `ChapterEnding.tsx` trình bày. `campaign.justCompletedWorld` so sánh trước/sau thao tác thật trong `GameBridge.finish/act`. `chapterEndingOpen` chỉ thuộc UI; kết chương được suy ra từ thành tích và cảnh giới đã có.

Giữ Profile v2 và hai khóa lưu hiện hành. Không lưu combat/outcome/bậc kỹ năng/biến chiêu vào Profile. Thưởng thắng 100%, thất bại/rút lui 30% giữ nguyên; chế độ test vẫn chỉ ghi khóa test.

## Kiểm chứng

- 14 kiểm thử mới tại `tests/combatSummary.test.ts`: toàn bộ nguồn sát thương; overkill/chí mạng ×100; đòn boss cuối; bậc đạn/đốt/Tam Điệp khi vừa thức tỉnh; hai linh thú; giáp/linh hộ/bất tử; đạn từ kẻ địch đã dọn; tử trận cận chiến; ba loại hiểm họa; lịch sử có giới hạn; pause/lên cấp/kết quả ×8; reset lượt; Profile; hai thứ tự hoàn thành chương và tải lại.
- Tổng bộ kiểm thử: **168 đạt, 0 lỗi**. TypeScript, Prettier và build production đạt.
- Trình duyệt: trang QA dùng engine, scene, bridge và UI thật trên origin riêng; kiểm tra chiến thắng, năm nguồn tử trận, rút lui, đột phá cuối, lưu/tải và xem lại. Sau đó kiểm tra lại kết chương, Tab/Escape/nền inert và bắt đầu/rút lui một lượt mới trong `App` đầy đủ. Console không có lỗi/cảnh báo.
- Bản chạy chính được mở lại từ build production; chỉ đọc lobby, không bật test hay vào ải trên bản lưu của người dùng.

Hồ sơ: `qa/combat-summary-browser-qa.json`. Trang tái kiểm tra: `/qa/combat-summary-audit.html` trên Vite dev, không đóng gói vào bản production. Ảnh nội bộ ở `qa/screenshots/combat-summary-1.8.png`, `combat-death-1.8.png`, `chapter-ending-app-1.8.png`.

Thống kê dành cho lượt hiện tại, không phải lịch sử nhiều trận. Thời gian sáu giây của nhật ký chỉ giúp đọc tình huống tử trận; không dùng để ép thời lượng hành trình của người chơi.

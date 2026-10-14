# Quy tắc dự án

- Trao đổi, README và comment quan trọng dùng tiếng Việt.
- Người dùng đã duyệt di chuyển và yêu cầu hoàn thiện toàn bộ game với map đầu tiên ngày 14/10/2026. Bản Hắc Phong Sơn 1.0 đã triển khai chiến đấu, XP/thẻ, boss/thưởng, tiến trình vĩnh viễn và lobby Lăng Tiêu Các đầy đủ. Xem README.md và docs/FIRST_MAP_QA.md cho phạm vi, cấu trúc và kiểm thử. Vùng va chạm đã chỉnh theo chân vật cản; tiếp tục giữ phép chiếu dùng chung khi sửa.
- Camera gameplay isometric cố định. Actor có 8 hướng thật: mặt, lưng, hai hướng ngang và bốn góc chéo. Không lật một ảnh ngang để giả hướng trước/sau.
- Người dùng đã chọn rig 3D xuất sprite pixel 2D; đã cho phép script cắt khung, căn neo, chuẩn hóa và đóng gói asset. Không hỏi lại những quyền này.
- Chu kỳ đi phải đổi chân, gập gối, nhấc chân và tiếp đất rõ. Kiểm tra cả tại chỗ lẫn trên nền di chuyển; số lượng file/khung không thay cho kiểm tra chuyển động.
- Chỉ bàn giao thành phẩm đã tự kiểm tra và sửa xong. Không gửi bản còn lỗi kèm nhận xét “chưa đạt”, không giao việc phát hiện lỗi cho người dùng. Bản thử và QA nội bộ giữ trong art; chỉ mở thành phẩm khi đã qua kiểm tra.
- Yêu cầu này được người dùng nhắc lại ngày 13/10/2026. Không gọi một bộ asset hoàn thiện nếu mới kiểm tra định dạng PNG/atlas.
- Người dùng tạm chấp nhận tạo hình rig hiện tại ngày 13/10/2026; nâng cấp chất lượng đồ họa ở đợt sau. Hiện ưu tiên hoạt ảnh tấn công: quyền đổi tay ít nhất 3 đòn, kiếm ít nhất 3 đường kiếm; quái/boss cũng phải có nhiều động tác riêng.
- Dữ liệu tu luyện/cảnh giới vĩnh viễn tách khỏi XP/thẻ trong màn; thưởng thất bại nhận 30% theo GAME_DESIGN.md.
- Dữ liệu nội dung tách khỏi scene và UI. Vị trí vật thể/tính va chạm ở tọa độ thế giới; dùng phép chiếu chung cho mọi lớp isometric. Phaser xử lý mỗi frame, React nhận HUD ở tần suất giới hạn.
- Bản 1.1 ngày 14/10/2026: lobby có sân trung tâm và bốn phòng riêng, map 64 × 64 với hai vật cản ở điểm mốc xa. Dùng `src/data/lobby.ts` cho khu lobby và `forestLayout`/`forestProjection` trong `src/data/stages.ts` cho scene, minimap và va chạm; layout nhỏ trong manifest v3 chỉ giữ làm nguồn asset. Xem `docs/LOBBY_MAP_1_1_QA.md`. Repository công khai: https://github.com/NrocneK/vo-luyen-survival.

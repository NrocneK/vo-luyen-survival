# Hồi Phong và Viêm Hoàn — 1.5.1

## Phản hồi đã xử lý

- **Hồi Phong:** bỏ việc quay đầu khi dùng hết lượt xuyên, bỏ giới hạn sát thương chiều về. Xuyên mọi địch, mỗi địch tối đa một lần mỗi chiều từ cùng một kiếm khí. Tầm bay ra 7 đơn vị đáp ứng tầm tự chọn địch; gặp biên thật thì quay sớm. Chiều về đuổi theo vị trí nhân vật hiện tại. Va chạm vẫn quét toàn đoạn, không bỏ qua mục tiêu ở x8.
- **Viêm Hoàn:** vòng bám nhân vật, gây sát thương theo dt cho mọi địch đang trong vùng, không phải chờ một lần quét. Bán kính bậc 1–6: 1,8 / 2,2 / 2,6 / 3 / 3,4 / 4,2 đơn vị. Quảng Vực tăng bán kính 60% và giữ DPS; Liệt Diễm thay Điệp Lãng, tăng DPS 60% và giữ bán kính.
- **Hình ảnh:** viền lửa luôn hiện; làn sóng nhiệt lan từ tâm ra đúng rìa trong 1,2 giây rồi lặp lại. Vòng/sóng cùng tâm và phép chiếu với sát thương. Nhánh sát thương dùng sắc lửa đỏ rực; nhánh rộng tăng vùng thật.

## Quyết định kỹ thuật

- `data/projectiles.ts`: khoảng cách tia đến biên; Hồi Phong dùng `pierce = Infinity`, reset hits tại một lần đổi chiều duy nhất. Không còn returnSpent/returnPierce. Kiếm thường vẫn xuyên theo bậc, không chịu thay đổi này.
- `data/skillEffects.ts`: bán kính và DPS cơ bản. DPS giữ tương đương mức trung bình của nhịp quét cũ, nhân tốc đánh hiện có; chuyển sang tích phân từng bước thay vì dồn damage. Nhánh rộng không còn giảm damage.
- `RunEngine.updateFlameAura`: chỉ áp damage trong vùng hiện tại. Crit được gieo mỗi cửa sổ 0,4 giây/địch; chia dt ở ranh giới để ổn định giữa FPS. Số damage gom 0,35 giây thực và dùng giới hạn Text sẵn có; không phát hit sound mỗi frame. Pause/levelup chặn cả DPS và tiến độ sóng; rời vùng ngừng damage ngay.
- `VisualEvent ring/heat-wave`: phát trước damage để vẫn có hình khi kết liễu boss. `setPresentationTimeScale` giữ chu kỳ/lifetime theo thời gian thực ở x8. Renderer lấy tâm/bán kính hiện tại để sóng luôn chạm viền vòng dù di chuyển hay nâng bậc.
- Không sửa Profile, phần thưởng, lịch sân/boss hay quy tắc đổi thẻ. Biến chiêu chỉ trong lượt nên đổi ID Điệp Lãng không cần chuyển bản lưu vĩnh viễn.

## Kiểm tra

Các bài bảo vệ xuyên đàn tám địch hai chiều ở bậc 2, không quay sớm, đuổi theo nhân vật, quay tại biên, đạn thường xuyên theo bậc; aura đốt ngay mỗi frame, vào/ra vùng, tăng bậc/nhánh, FPS 30/60/120 có crit, pause/levelup, x8, boss và kết quả.

Trang `/qa/flame-return-audit.html` dùng scene/renderer/HUD thật, fixture địch đứng và bước thời gian cố định. Chụp riêng sóng đầu/giữa/tới biên, vòng cơ bản/Quảng Vực/Liệt Diễm và hai chiều kiếm. QA không nằm trong bản production. Báo cáo: `qa/flame-return-browser-qa.json`; ảnh: `qa/screenshots/flame-return/`.

## Kết quả ngày 19/10/2026

- **128/128 kiểm thử đạt**, gồm hành trình hoàn tất sáu màn. TypeScript, Prettier, build 1.5.1 và kiểm tra khoảng trắng Git đạt.
- Trình duyệt xác nhận Hồi Phong bậc 2 xuyên sáu địch ở khung chiều đi; khung chiều về đã gây sát thương lần thứ hai cho bốn địch phía xa, các địch phía gần chưa bị đánh lại sớm. Kiểm thử tự động theo hết đường bay xác nhận cả tám nhận đúng hai lần từ một kiếm khí và không có lần thứ ba.
- Đã chụp ba pha sóng tại 0,08 / 0,6 / 1,08 giây. HP tiếp tục giảm giữa các pha, viền giữ nguyên bán kính, mặt sóng đi từ tâm ra rìa. Đã đối chiếu bán kính bậc 1/3/5/6 và hai nhánh.
- Với fixture công kích 100, không chí mạng/tốc đánh: bậc 3 cơ bản có bán kính 2,6 và DPS 68,75; Quảng Vực có bán kính 4,16, cùng DPS; Liệt Diễm có bán kính 2,6 và DPS 110. Ảnh `wide.png`/`damage.png` trong thư mục ảnh QA.
- Console của trang QA mới và bản production không có warning/error. Cổng 4173 tải bundle `/assets/index-CTyz8diS.js`. Không vào ải hoặc bật test trên tiến trình chính; nhân vật giữ Thối Thể tầng 4, 196 linh thạch và 0 thắng/1 lượt, tu vi tăng theo idle.

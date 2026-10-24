export const chapterEnding = {
  chapter: 'THẾ GIỚI 1 · TRUNG ĐÔ',
  title: 'Đạo tâm vững vàng',
  subtitle: 'Hạo Kiếp đã lùi. Người cần bảo vệ vẫn còn bên cạnh.',
  paragraphs: [
    'Từ những bước lịch luyện ở Hắc Phong Sơn, Dương Khai đã đi qua cổ trận, độc cốc và biển lửa. Mỗi lần trở về Lăng Tiêu Các, ý chí bảo vệ người thân lại thêm bền vững.',
    'Trận tranh đoạt khép lại, Hạo Kiếp Trung Đô cũng đã bị đẩy lui. Giữa chiến tuyến lặng tiếng binh đao, điều còn lại không chỉ là sức mạnh, mà là những người vẫn có thể cùng nhau trở về.',
    'Thần Du đỉnh phong là thành quả của chặng đường này. Ngoài chân trời còn nhiều điều chưa biết; hôm nay, hãy dành một khoảng bình yên cho những gì đã giữ được.',
  ],
  keepsake:
    'Tu vi, cảnh giới, trang bị và linh thú được giữ nguyên. Bạn có thể tiếp tục tu luyện, chế tạo hoặc trở lại bất kỳ màn đã mở nào.',
  next: 'Thông Huyền Đại Lục đã mở. Chọn thế giới ở Lịch luyện để tiếp tục hành trình; Trung Đô vẫn luôn có thể trở về.',
} as const;
export const worldTwoEnding = {
  chapter: 'THẾ GIỚI 2 · THÔNG HUYỀN ĐẠI LỤC',
  title: 'Một trời rộng hơn',
  subtitle: 'Cốt trận tan. Liên quân đã giữ được đại lục.',
  paragraphs: [
    'Từ Độc Ngạo Minh đến Cửu Thiên Thánh Địa, Dương Khai đã đi qua giải cứu, khảo nghiệm và những lần phá vây. Mỗi truyền thừa được nhận đều đi cùng một lựa chọn của chính mình.',
    'Huyết Tinh Thạch chặn sức mạnh hấp thu của Cốt tộc. Trong khoảng trống liên quân tạo ra, đòn cuối cùng khép lại cuộc chiến. Người còn đứng bên cạnh chính là điều đáng giữ nhất.',
    'Nhập Thánh tam tầng đỉnh phong đánh dấu chặng đường đã hoàn thành. Ngoài chân trời vẫn còn những điều chưa biết; hôm nay, đại lục có thêm một khoảng bình yên.',
  ],
  keepsake: chapterEnding.keepsake,
  next: 'Hai thế giới vẫn mở để lịch luyện, tu luyện và gặp lại những dấu mốc đã qua.',
} as const;
export const endingFor = (world: 1 | 2) => (world === 1 ? chapterEnding : worldTwoEnding);

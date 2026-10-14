export const realms = Array.from({ length: 11 }, (_, index) => ({
  id: index,
  name:
    index < 9
      ? `Thối Thể tầng ${index + 1}`
      : index === 9
        ? 'Thối Thể đỉnh phong'
        : 'Khai Nguyên tầng 1',
  cost: [60, 100, 150, 210, 280, 360, 460, 580, 740, 1000, Infinity][index],
  slots: index < 2 ? 2 : index < 4 ? 3 : index < 6 ? 4 : index < 9 ? 5 : 6,
}));
// Bản đồ đầu dùng mốc mở đầu; trần thế giới Trung Đô sẽ được mở rộng cùng các map tiếp theo.
export const idlePerSecond = (realm: number) => 0.004 + realm * 0.001;

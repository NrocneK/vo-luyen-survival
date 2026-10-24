/** Thu phóng chỉ thay tầm nhìn, không thay tỉ lệ thế giới hoặc vùng va chạm. */
export const cameraSettings = {
  minZoom: 0.5,
  maxZoom: 3,
  step: 0.25,
  defaultZoom: 1,
};

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return cameraSettings.defaultZoom;
  return Math.max(cameraSettings.minZoom, Math.min(cameraSettings.maxZoom, value));
}

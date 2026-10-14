import { newProfile, validateProfile } from '../domain/profile.ts';
import type { Profile } from '../shared/models';
const KEY = 'vo-luyen.profile.v1';
const BACKUP = 'vo-luyen.profile.backup.v1';
const RECOVERY = 'vo-luyen.profile.recovery.v1';
export function loadProfile(): { profile: Profile; warning: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { profile: newProfile(), warning: '' };
    try {
      return { profile: validateProfile(JSON.parse(raw)), warning: '' };
    } catch {
      const backup = localStorage.getItem(BACKUP);
      if (backup)
        return {
          profile: validateProfile(JSON.parse(backup)),
          warning: 'Đã khôi phục bản lưu dự phòng.',
        };
      throw new Error('save');
    }
  } catch {
    // Giữ nguyên bản hỏng ở khóa riêng để autosave không xóa cơ hội khôi phục.
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) localStorage.setItem(RECOVERY, raw);
    } catch {
      /* Trình duyệt có thể từ chối cả đọc lẫn ghi storage. */
    }
    return {
      profile: newProfile(),
      warning:
        'Không đọc được bản lưu. Dữ liệu cũ được giữ nguyên; hãy kiểm tra cài đặt trình duyệt hoặc nhập bản sao lưu.',
    };
  }
}
export function saveProfile(profile: Profile): boolean {
  try {
    const previous = localStorage.getItem(KEY);
    if (previous) {
      try {
        validateProfile(JSON.parse(previous));
        localStorage.setItem(BACKUP, previous);
      } catch {
        /* Không thay bản dự phòng tốt bằng một bản lưu hỏng. */
      }
    }
    localStorage.setItem(KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}
export function exportSave(profile: Profile): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ game: 'vo-luyen', profile }, null, 2)], {
      type: 'application/json',
    }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vo-luyen-tien-trinh.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importSave(file: File): Promise<Profile> {
  if (file.size > 128000) throw new Error('File lưu quá lớn.');
  const data = JSON.parse(await file.text());
  if (data.game !== 'vo-luyen') throw new Error('Đây không phải file lưu Võ Luyện.');
  return validateProfile(data.profile);
}

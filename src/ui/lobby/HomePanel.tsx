import type { GameSnapshot } from '../../shared/types';
import { idlePerSecond } from '../../data/realms';
import { permanentStats } from '../../domain/profile';
export function HomePanel({
  state,
  onStation,
}: {
  state: GameSnapshot;
  onStation: (id: string) => void;
}) {
  const profile = state.profile;
  const stats = permanentStats(profile);
  return (
    <>
      <p className="lead">Một khoảng tĩnh lặng giữa đường tu hành.</p>
      <p>
        Tu luyện để mở cảnh giới. Luyện đan, rèn khí và kết giao linh thú, rồi bước vào Hắc Phong
        Sơn.
      </p>
      <div className="stats-grid">
        {[
          ['Sinh lực', Math.round(stats.hp)],
          ['Công kích', stats.damage.toFixed(1)],
          ['Giáp', stats.armor.toFixed(1)],
          ['Chí mạng', `${Math.round(stats.crit * 100)}%`],
        ].map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="lobby-note">
        <span>LINH KHÍ ĐANG LƯU CHUYỂN</span>
        <p>
          +{(idlePerSecond(profile.realm) * 3600).toFixed(1)} tu vi/giờ · tối đa 8 giờ ngoại tuyến.
        </p>
        {state.idleGained >= 1 && <small>Vừa hấp thụ: +{state.idleGained.toFixed(1)} tu vi</small>}
      </div>
      <div className="progress-note">
        <strong>{profile.wins}</strong> lần vượt Hắc Phong Sơn{' '}
        <span>· {profile.runs} lượt lịch luyện</span>
      </div>
      <button className="primary-button" onClick={() => onStation('expedition')}>
        Chuẩn bị lịch luyện <span>↗</span>
      </button>
      <p className="help-note">
        Thao tác tại các khu trong động phủ hoặc thanh bên trái. Tiến trình được lưu trên trình
        duyệt này.
      </p>
    </>
  );
}

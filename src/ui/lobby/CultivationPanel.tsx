import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { skills } from '../../data/skills';
import { realms } from '../../data/realms';
import { Icon } from '../AssetIcon';
export function CultivationPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;
  const realm = realms[profile.realm];
  return (
    <>
      <div className="realm-card">
        <span className="realm-emblem">道</span>
        <small>CẢNH GIỚI HIỆN TẠI</small>
        <h3>{realm.name}</h3>
        <p>
          {profile.realm < 10
            ? `Kế tiếp: ${realms[profile.realm + 1].name}`
            : 'Đã hoàn thành mốc tu luyện của map đầu.'}
        </p>
      </div>
      <div className="progress-label">
        <span>Tu vi tích lũy</span>
        <strong>
          {profile.cultivation.toFixed(1)} / {Number.isFinite(realm.cost) ? realm.cost : '—'}
        </strong>
      </div>
      <progress max={Number.isFinite(realm.cost) ? realm.cost : 1} value={profile.cultivation} />
      <p>
        Mỗi tầng tăng vĩnh viễn sinh lực và công kích. Ô kỹ năng: <strong>{realm.slots}/6</strong>.
        Đột phá chắc chắn khi đủ điều kiện.
      </p>
      {profile.realm === 9 && (
        <div className="lobby-note">
          Đột phá Khai Nguyên: 1 Hạt sen đột phá và 2 Tu Vi Đan. Hạt sen nhận khi hạ Lang Vương.
        </div>
      )}
      <button
        className="primary-button"
        disabled={
          profile.realm >= 10 ||
          profile.cultivation < realm.cost ||
          (profile.realm === 9 &&
            (profile.resources['hat-sen-dot-pha'] < 1 || profile.pills['tu-vi-dan'] < 2))
        }
        onClick={() => bridge.act('breakthrough')}
      >
        Đột phá cảnh giới <span>↑</span>
      </button>
      <div className="item-row">
        <Icon id="tu-vi-dan" />
        <div>
          <strong>Tu Vi Đan ×{profile.pills['tu-vi-dan']}</strong>
          <small>+80 tu vi mỗi viên</small>
        </div>
        <button
          disabled={!profile.pills['tu-vi-dan']}
          onClick={() => bridge.act('pill', 'tu-vi-dan')}
        >
          Dùng
        </button>
      </div>
      <h3 className="section-label">Kỹ năng đã lĩnh ngộ</h3>
      {Object.values(skills)
        .filter((skill) => skill.kind === 'support' || skill.id === 'duong-viem-chuong')
        .map((skill) => (
          <div className="item-row" key={skill.id}>
            <Icon category="skills" id={skill.icon} />
            <div>
              <strong>{skill.name}</strong>
              <small>
                {profile.realm >= skill.realm
                  ? 'Đã mở · chọn mang theo ở Lịch luyện'
                  : `Mở tại ${realms[skill.realm].name}`}
              </small>
            </div>
          </div>
        ))}
    </>
  );
}

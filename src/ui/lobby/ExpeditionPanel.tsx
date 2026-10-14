import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { skills } from '../../data/skills';
import { pets } from '../../data/pets';
import { realms } from '../../data/realms';
import { startingSkill } from '../../domain/profile';
import { Icon } from '../AssetIcon';
export function ExpeditionPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile;
  const realm = realms[profile.realm];
  return (
    <>
      <div className="expedition-cover">
        <span className="overline">TRUNG ĐÔ · MÀN 01</span>
        <h3>Hắc Phong Sơn</h3>
        <p>10 phút · 2 tinh anh · Lang Vương</p>
      </div>
      <p>
        Diệt boss để thắng. Rút lui hoặc bị hạ nhận 30% tu vi/tài nguyên; mỗi món trang bị và bản vẽ
        có 30% cơ hội giữ lại.
      </p>
      <h3 className="section-label">
        Bộ kỹ năng · {1 + profile.selectedSkills.length}/{realm.slots} ô
      </h3>
      <div className="loadout-default">
        <Icon id={skills[startingSkill(profile)].icon} category="skills" />
        <div>
          <strong>{skills[startingSkill(profile)].name}</strong>
          <small>Mặc định theo vũ khí · bắt đầu bậc 1</small>
        </div>
      </div>
      {Object.values(skills)
        .filter((skill) => !['cuong-quyen', 'nguyen-khi-tram'].includes(skill.id))
        .map((skill) => (
          <button
            className={`skill-select ${profile.selectedSkills.includes(skill.id) ? 'selected' : ''}`}
            key={skill.id}
            disabled={profile.realm < skill.realm}
            aria-pressed={profile.selectedSkills.includes(skill.id)}
            onClick={() => bridge.act('skill', skill.id)}
          >
            <Icon id={skill.icon} category="skills" />
            <span>
              <strong>{skill.name}</strong>
              <small>
                {profile.realm < skill.realm
                  ? `Cần ${realms[skill.realm].name}`
                  : skill.description}
              </small>
            </span>
            <span>{profile.selectedSkills.includes(skill.id) ? '✓' : '+'}</span>
          </button>
        ))}
      <div className="lobby-note">
        Thức tỉnh: {skills[startingSkill(profile)].name} bậc 5 +{' '}
        {skills[skills[startingSkill(profile)].linked!].name} đã kích hoạt →{' '}
        {skills[startingSkill(profile)].awakened} bậc 6.
      </div>
      <div className="run-provisions">
        <span>
          <Icon id="hoi-nguyen-dan" size={28} /> Mang {Math.min(3, profile.pills['hoi-nguyen-dan'])}
          /3 Hồi Nguyên Đan
        </span>
        <span>Đồng hành: {profile.activePet ? pets[profile.activePet].name : 'Không'}</span>
      </div>
      <p className="help-note">
        WASD/mũi tên di chuyển · tự tấn công · Space lướt · Q dùng đan · Esc tạm dừng. Nâng cấp
        trong màn được đặt lại sau lượt.
      </p>
    </>
  );
}

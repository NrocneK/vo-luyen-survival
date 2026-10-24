import { useState } from 'react';
import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { skills } from '../../data/skills';
import { realms } from '../../data/realms';
import { stageById } from '../../data/stages';
import { breakthroughLockReason, pillCultivation, skillUnlocked } from '../../domain/profile';
import { pillName } from '../../data/recipes';
import { Icon } from '../AssetIcon';
import { GameGlyph, MaterialCost, compactAmount } from './SurvivalUI';
export function CultivationPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile,
    realm = realms[profile.realm],
    atCap = profile.realm >= realms.length - 1;
  const reason = breakthroughLockReason(profile),
    extra = realm.breakthroughCost;
  const ratio = atCap ? 1 : Math.min(1, profile.cultivation / realm.cost);
  const [selected, setSelected] = useState('duong-viem-chuong');
  const skill = skills[selected];
  return (
    <>
      <div className="cultivation-hero">
        <div className="realm-orb">
          <svg viewBox="0 0 160 160" aria-label={`Tu vi ${Math.round(ratio * 100)}%`}>
            <circle cx="80" cy="80" r="69" className="orb-track" />
            <circle
              cx="80"
              cy="80"
              r="69"
              className="orb-progress"
              strokeDasharray={`${ratio * 434} 434`}
            />
          </svg>
          <span>道</span>
          <strong>{atCap ? 'ĐỈNH PHONG' : `${Math.round(ratio * 100)}%`}</strong>
        </div>
        <div>
          <span className="overline">CẢNH GIỚI HIỆN TẠI</span>
          <h3>{realm.name}</h3>
          <small>
            {atCap ? 'Đã đạt trần cảnh giới' : `Kế tiếp: ${realms[profile.realm + 1].name}`}
          </small>
          <div className="cultivation-amount">
            <Icon id="tu-vi-dan" size={25} />
            <strong title={profile.cultivation.toLocaleString('vi-VN')}>
              {compactAmount(profile.cultivation)}
            </strong>
            <span>/ {Number.isFinite(realm.cost) ? compactAmount(realm.cost) : '—'}</span>
          </div>
          {!atCap && profile.cultivation > realm.cost && (
            <span className="overflow-badge">
              Dư {compactAmount(profile.cultivation - realm.cost)} · tiếp tục tích trữ
            </span>
          )}
        </div>
      </div>
      {!atCap && (realm.requiredStageId || extra) && (
        <div className="breakthrough-gate">
          {realm.requiredStageId && (
            <span>
              <GameGlyph name="expedition" size={19} />
              {profile.stageProgress[realm.requiredStageId]?.wins ? '✓' : '◇'} Vượt{' '}
              {stageById(realm.requiredStageId).name}
            </span>
          )}
          {extra && <MaterialCost cost={extra} profile={profile} />}{' '}
          {!!extra?.pills && (
            <span>
              <Icon id="tu-vi-dan" size={25} />
              {extra.pills['tu-vi-dan']} Tu Vi Đan
            </span>
          )}
        </div>
      )}
      <button
        className="primary-button"
        disabled={atCap || !!reason}
        onClick={() => bridge.act('breakthrough')}
      >
        {atCap ? 'Đã đạt đỉnh phong' : 'Đột phá cảnh giới'} <span>↑</span>
      </button>
      {!atCap && reason && <p className="unlock-condition">{reason}</p>}
      <div className="cultivation-pill">
        <Icon id="tu-vi-dan" size={45} />
        <div>
          <strong>
            {pillName(profile.realm, 'tu-vi-dan')} <span>×{profile.pills['tu-vi-dan']}</span>
          </strong>
          <small>+{compactAmount(pillCultivation(profile))} tu vi / viên</small>
        </div>
        <button
          disabled={!profile.pills['tu-vi-dan']}
          onClick={() => bridge.act('pill', 'tu-vi-dan')}
        >
          Dùng
        </button>
      </div>
      <div className="collection-heading">
        <h3>Võ học</h3>
        <span>{realm.slots}/6 ô kỹ năng</span>
      </div>
      <div className="skill-icon-grid">
        {Object.values(skills)
          .filter((entry) => !['cuong-quyen', 'nguyen-khi-tram'].includes(entry.id))
          .sort((a, b) => a.realm - b.realm)
          .map((entry) => (
            <button
              key={entry.id}
              className={`skill-icon-tile ${selected === entry.id ? 'selected' : ''} ${skillUnlocked(profile, entry.id) ? '' : 'locked'}`}
              aria-pressed={selected === entry.id}
              onClick={() => setSelected(entry.id)}
            >
              <Icon id={entry.icon} category="skills" size={50} />
              <span>{entry.name}</span>
              {!skillUnlocked(profile, entry.id) && <GameGlyph name="lock" size={14} />}
            </button>
          ))}
      </div>
      {skill && (
        <div className="skill-detail">
          <Icon id={skill.icon} category="skills" size={46} />
          <div>
            <strong>{skill.name}</strong>
            <small>
              {skillUnlocked(profile, skill.id)
                ? 'Đã lĩnh ngộ · chuẩn bị bộ kỹ năng tại Lịch luyện'
                : `Mở tại ${realms[skill.realm].name}${skill.requiredStageId ? ` · Vượt ${stageById(skill.requiredStageId).name}` : ''}`}
            </small>
            <p>{skill.description}</p>
          </div>
        </div>
      )}
    </>
  );
}

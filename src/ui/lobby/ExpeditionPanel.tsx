import { useState, type CSSProperties } from 'react';
import type { GameSnapshot } from '../../shared/types';
import { GameBridge } from '../../app/GameBridge';
import { skills } from '../../data/skills';
import { pets } from '../../data/pets';
import { realms } from '../../data/realms';
import { stageById, allStages } from '../../data/stages';
import { stageLockReason, stageUnlocked } from '../../data/campaign';
import { enemies } from '../../data/enemies';
import { startingSkill, skillUnlocked } from '../../domain/profile';
import { pillName } from '../../data/recipes';
import { Icon } from '../AssetIcon';
import { LootSummary } from '../LootSummary';
import { clock } from '../RunOverlays';
import { stageMechanics } from '../../data/stageMechanics';
import { AwakeningGuide } from '../AwakeningGuide';
import { ActorPortrait, GameGlyph } from './SurvivalUI';
export function ExpeditionPanel({ state, bridge }: { state: GameSnapshot; bridge: GameBridge }) {
  const profile = state.profile,
    realm = realms[profile.realm],
    selected = stageById(state.stageId),
    world = selected.chapter ?? 1;
  const stages = allStages.filter((stage) => (stage.chapter ?? 1) === world),
    progress = profile.stageProgress[selected.id];
  const unlocked = state.test.enabled || stageUnlocked(profile, selected.id);
  const prepared = [startingSkill(profile), ...profile.selectedSkills];
  const [focus, setFocus] = useState('');
  const skill = skills[focus];
  return (
    <>
      <div className="world-tabs" aria-label="Chọn thế giới">
        {([1, 2] as const).map((chapter) => (
          <button
            key={chapter}
            aria-pressed={world === chapter}
            className={world === chapter ? 'selected' : ''}
            onClick={() => {
              const entries = allStages.filter((stage) => (stage.chapter ?? 1) === chapter);
              const target =
                entries.find(
                  (stage) =>
                    stageUnlocked(profile, stage.id) && !profile.stageProgress[stage.id]?.wins,
                ) ??
                entries.filter((stage) => stageUnlocked(profile, stage.id)).at(-1) ??
                entries[0];
              bridge.dispatch({ type: 'stage', id: target.id });
            }}
          >
            {chapter === 1 ? 'Trung Đô' : 'Thông Huyền Đại Lục'}
          </button>
        ))}
      </div>
      <div className="collection-heading">
        <h3>Chọn màn</h3>
        <span>
          {stages.filter((stage) => profile.stageProgress[stage.id]?.wins).length}/{stages.length}{' '}
          đã vượt
        </span>
      </div>
      <div className="stage-list" aria-label={`Các màn lịch luyện ${selected.world}`}>
        {stages.map((stage) => {
          const cleared = (profile.stageProgress[stage.id]?.wins ?? 0) > 0,
            available = state.test.enabled || stageUnlocked(profile, stage.id);
          return (
            <button
              key={stage.id}
              data-stage-id={stage.id}
              className={`stage-choice ${selected.id === stage.id ? 'selected' : ''} ${available ? '' : 'locked'}`}
              aria-pressed={selected.id === stage.id}
              title={
                available
                  ? `${stage.name}${cleared ? ' · Đã vượt' : ''}`
                  : stageLockReason(profile, stage.id)
              }
              onClick={() => bridge.dispatch({ type: 'stage', id: stage.id })}
            >
              <span className="stage-number">
                {cleared ? '✓' : String(stage.stageIndex + 1).padStart(2, '0')}
              </span>
              <strong>{stage.name}</strong>
              {!available && <GameGlyph name="lock" size={13} />}
            </button>
          );
        })}
      </div>
      <div className="mission-banner" style={{ '--stage-color': selected.accent } as CSSProperties}>
        <span className="overline">
          {world === 1 ? 'TRUNG ĐÔ' : 'THÔNG HUYỀN'} · MÀN{' '}
          {String(selected.stageIndex + 1).padStart(2, '0')}
        </span>
        <h3>{selected.name}</h3>
        <small>
          {selected.mission
            ? `${selected.mission.bossPhases} pha nhiệm vụ`
            : clock(selected.duration)}{' '}
          · {selected.eliteTimes.length} tinh anh
        </small>
        <span className="mission-boss">{enemies[selected.bossId]?.name}</span>
        <ActorPortrait
          id={enemies[selected.bossId].actor}
          label={enemies[selected.bossId]?.name ?? 'Boss'}
        />
      </div>
      <div className="mission-objective">
        <GameGlyph name="expedition" size={23} />
        <p>{selected.objective}</p>
      </div>
      {!unlocked && (
        <p className="stage-lock" role="status">
          {stageLockReason(profile, selected.id)}
        </p>
      )}
      <details className="collection-details">
        <summary>Thông tin màn & phần thưởng {progress?.wins ? '· Đã vượt' : ''}</summary>
        <p>{selected.description}</p>
        <p>
          Yêu cầu {realms[selected.requiredRealm].name}
          {selected.prerequisite ? ` · Vượt ${stageById(selected.prerequisite).name}` : ''}.
        </p>
        {stageMechanics[selected.id] && (
          <p>
            <strong>{stageMechanics[selected.id].name}</strong> ·{' '}
            {stageMechanics[selected.id].description}
          </p>
        )}
        <strong>Hạ boss</strong>
        <LootSummary loot={selected.rewards} compact />
        <strong>Vượt lần đầu {progress?.wins ? '· Đã nhận' : ''}</strong>
        <LootSummary loot={selected.firstClear} compact />
        {progress && progress.wins > 0 && (
          <p>
            {progress.wins} chiến thắng · Nhanh nhất {clock(progress.bestTime)} · Kỷ lục{' '}
            {progress.bestKills} quái
          </p>
        )}
      </details>
      <div className="collection-heading">
        <h3>Bộ kỹ năng</h3>
        <span>
          {prepared.length}/{realm.slots} ô
        </span>
      </div>
      <div className="loadout-slots" aria-label="Kỹ năng mang theo">
        {Array.from({ length: realm.slots }, (_, i) => {
          const entry = skills[prepared[i]];
          return (
            <button
              key={i}
              className={`loadout-slot ${i === 0 ? 'default-skill' : ''}`}
              title={
                entry
                  ? `${entry.name}${i === 0 ? ' · Mặc định theo vũ khí' : ' · Bấm để bỏ'}`
                  : 'Ô kỹ năng trống'
              }
              aria-label={
                entry ? `${i === 0 ? 'Mặc định' : 'Bỏ'} ${entry.name}` : `Ô kỹ năng trống ${i + 1}`
              }
              onClick={() => {
                if (entry) {
                  setFocus(entry.id);
                  if (i > 0) bridge.act('skill', entry.id);
                }
              }}
            >
              {entry ? <Icon id={entry.icon} category="skills" size={44} /> : <span>+</span>}
              {i === 0 && <b>1</b>}
            </button>
          );
        })}
      </div>
      <div className="skill-icon-grid">
        {Object.values(skills)
          .filter((entry) => !['cuong-quyen', 'nguyen-khi-tram'].includes(entry.id))
          .sort((a, b) => a.realm - b.realm)
          .map((entry) => {
            const available = state.test.enabled
                ? profile.realm >= entry.realm
                : skillUnlocked(profile, entry.id),
              chosen = profile.selectedSkills.includes(entry.id);
            return (
              <button
                key={entry.id}
                data-skill-id={entry.id}
                className={`skill-icon-tile ${chosen ? 'selected' : ''} ${available ? '' : 'locked'}`}
                aria-pressed={chosen}
                title={available ? entry.name : `${entry.name} · Chưa mở`}
                onClick={() => {
                  setFocus(entry.id);
                  if (available) bridge.act('skill', entry.id);
                }}
              >
                <Icon id={entry.icon} category="skills" size={50} />
                <span>{entry.name}</span>
                {chosen ? <b>✓</b> : !available && <GameGlyph name="lock" size={14} />}
              </button>
            );
          })}
      </div>
      {skill && (
        <div className="skill-detail">
          <Icon id={skill.icon} category="skills" size={46} />
          <div>
            <strong>{skill.name}</strong>
            <p>{skill.description}</p>
            {(profile.realm < skill.realm ||
              (!state.test.enabled && !skillUnlocked(profile, skill.id))) && (
              <small>
                Mở tại {realms[skill.realm].name}
                {skill.requiredStageId ? ` · Vượt ${stageById(skill.requiredStageId).name}` : ''}
              </small>
            )}
            {skill.linked && (
              <small>
                Bậc 5 + {skills[skill.linked].name} → {skill.awakened} bậc 6
              </small>
            )}
          </div>
        </div>
      )}
      <div className="run-provisions survival-provisions">
        <span>
          <Icon id="hoi-nguyen-dan" size={30} />
          {Math.min(3, profile.pills['hoi-nguyen-dan'])}/3{' '}
          {pillName(profile.realm, 'hoi-nguyen-dan')}
        </span>
        <span>
          <GameGlyph name="pets" size={22} />
          {profile.activePet ? pets[profile.activePet].name : 'Không đồng hành'}
        </span>
      </div>
      <details className="collection-details">
        <summary>Thức tỉnh & hướng dẫn chiến đấu</summary>
        <AwakeningGuide prepared={prepared} />
        <p>
          Tấn công bậc 2 có thể chọn một nhánh Biến chiêu. Lên cấp bấm R đổi ba thẻ miễn phí một lần
          / lượt.
        </p>
        <p>
          Tối đa bốn cơ duyên tùy chọn: rương hộ vệ, linh dược, truy sát tinh anh và tụ linh. Đến
          gần dấu tím bấm E để tham gia.
        </p>
        <p>
          WASD / mũi tên di chuyển · tự tấn công · Space lướt · Q dùng đan · Esc tạm dừng. Nâng cấp
          trong màn đặt lại sau lượt.
        </p>
        <p>
          Rút lui hoặc bị hạ nhận 30% tu vi / tài nguyên; mỗi trang bị và bản vẽ có 30% cơ hội giữ
          lại.
        </p>
      </details>
    </>
  );
}

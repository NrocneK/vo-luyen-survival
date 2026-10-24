import type { GameSnapshot } from '../../shared/types';
import type { GameBridge } from '../../app/GameBridge';
import { cultivationIdleRate } from '../../domain/profile';
import { allStages } from '../../data/stages';
import { enemies } from '../../data/enemies';
import { stageLockReason, worldProgress, currentWorld } from '../../data/campaign';
import { endingFor } from '../../data/chapterEnding';
import { CampaignProgress } from './CampaignProgress';
import { ActorPortrait, GameGlyph, compactAmount } from './SurvivalUI';
export function HomePanel({
  state,
  onStation,
  bridge,
}: {
  state: GameSnapshot;
  onStation: (id: string) => void;
  bridge: GameBridge;
}) {
  const p = state.profile,
    world = currentWorld(p),
    progress = worldProgress(p, world),
    ending = endingFor(world);
  const stages = allStages.filter((s) => (s.chapter ?? 1) === world),
    next = stages.find((s) => !p.stageProgress[s.id]?.wins) ?? stages.at(-1)!;
  const boss = enemies[next.bossId];
  return (
    <>
      <button
        className="home-mission"
        onClick={() => {
          bridge.dispatch({ type: 'stage', id: next.id });
          onStation('expedition');
        }}
      >
        <span className="overline">
          {progress.completed ? 'TIẾP TỤC LỊCH LUYỆN' : 'MỐC KẾ TIẾP'}
        </span>
        <h3>{next.name}</h3>
        {boss && <ActorPortrait id={boss.actor} label={boss.name} />}
        <span className="mission-state">
          {stageLockReason(p, next.id) ? '◇ Có điều kiện' : '⚔ Sẵn sàng'}
        </span>
        <span className="home-play">
          Chuẩn bị chiến đấu <b>›</b>
        </span>
      </button>
      <CampaignProgress profile={p} />
      <div className="home-quick">
        <button onClick={() => onStation('cultivate')}>
          <GameGlyph name="cultivate" />
          <span>Đột phá</span>
        </button>
        <button onClick={() => onStation('inventory')}>
          <GameGlyph name="inventory" />
          <span>Trang bị</span>
        </button>
        <button onClick={() => onStation('pets')}>
          <GameGlyph name="pets" />
          <span>Linh thú</span>
        </button>
      </div>
      <div className="idle-badge">
        <GameGlyph name="crit" size={28} />
        <div>
          <strong>+{compactAmount(cultivationIdleRate(p) * 3600)}</strong>
          <small>Tu vi / giờ · tối đa 8 giờ ngoại tuyến</small>
        </div>
      </div>
      {progress.completed && (
        <div className="world-complete">
          <strong>{ending.title}</strong>
          <button
            className="secondary-button"
            onClick={() => bridge.dispatch({ type: 'chapter-ending', open: true, world })}
          >
            Xem kết chương
          </button>
        </div>
      )}
      {world === 1 && progress.completed && (
        <button
          className="primary-button"
          onClick={() => {
            bridge.dispatch({ type: 'stage', id: 'doc-ngao-minh' });
            onStation('expedition');
          }}
        >
          Đến Thông Huyền Đại Lục <span>→</span>
        </button>
      )}
      {world === 2 && (
        <button
          className="world-return"
          onClick={() => {
            bridge.dispatch({ type: 'stage', id: 'hac-phong-son' });
            onStation('home');
          }}
        >
          ← Trở về Trung Đô
        </button>
      )}
      {p.stageProgress['thong-huyen-tru']?.wins > 0 && (
        <button
          className="world-return"
          onClick={() => bridge.dispatch({ type: 'story', open: true })}
        >
          Xem lại Ma Đô
        </button>
      )}
    </>
  );
}

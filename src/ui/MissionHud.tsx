import type { MissionView } from '../shared/worldTwo';
import type { GameBridge } from '../app/GameBridge';
import { GameGlyph } from './lobby/SurvivalUI';
export function MissionHud({
  mission,
  bridge,
  playing,
}: {
  mission: MissionView | null | undefined;
  bridge: GameBridge;
  playing: boolean;
}) {
  if (!mission) return null;
  return (
    <aside className="mission-hud" aria-label="Nhiệm vụ màn">
      <strong>
        <GameGlyph name="expedition" size={17} /> NHIỆM VỤ · PHA {mission.phase}
        <span>{Math.floor(mission.progress * 100)}%</span>
      </strong>
      <small>{mission.hint}</small>
      <div
        className="mission-track"
        role="progressbar"
        aria-label="Tiến trình nhiệm vụ"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(mission.progress * 100)}
      >
        <i style={{ width: `${mission.progress * 100}%` }} />
      </div>
      {mission.protected && (
        <div className="mission-protected">
          <span>
            <GameGlyph name="armor" size={15} />
            {mission.protected.name}
            <b>
              {Math.ceil(mission.protected.hp)} / {mission.protected.maxHp} HP
            </b>
          </span>
          <div
            className="protected-health"
            role="progressbar"
            aria-label={`Sinh lực ${mission.protected.name}`}
            aria-valuemin={0}
            aria-valuemax={mission.protected.maxHp}
            aria-valuenow={Math.max(0, mission.protected.hp)}
          >
            <i
              style={{
                width: `${Math.max(0, (mission.protected.hp / Math.max(1, mission.protected.maxHp)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
      {mission.interactable && (
        <button disabled={!playing} onClick={() => bridge.dispatch({ type: 'interact' })}>
          <kbd>E</kbd> · {mission.action}
        </button>
      )}
    </aside>
  );
}

import type { StageMechanicView } from '../shared/stageMechanics';
import './stage-mechanics.css';

export function StageMechanicHud({ mechanic }: { mechanic: StageMechanicView | null }) {
  if (!mechanic) return null;
  const important = mechanic.phase !== 'rest';
  return (
    <aside
      className={`stage-mechanic phase-${mechanic.phase}`}
      data-kind={mechanic.kind}
      aria-label="Cơ chế màn chơi"
    >
      <div className="mechanic-heading">
        <span>{mechanic.name}</span>
        {mechanic.remaining > 0 && (
          <output aria-label="Thời gian cơ chế">{Math.ceil(mechanic.remaining)}s</output>
        )}
      </div>
      <strong>{mechanic.label}</strong>
      <p>{important ? mechanic.hint : 'Chuẩn bị di chuyển khi có tín hiệu trên sân.'}</p>
      {mechanic.progress > 0 && (
        <div
          className="mechanic-progress"
          role="progressbar"
          aria-label={mechanic.kind === 'squad' ? 'Máu đội trưởng' : 'Tụ linh'}
          aria-valuenow={Math.round(mechanic.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${mechanic.progress * 100}%` }} />
        </div>
      )}
      {mechanic.target && (
        <small>
          {mechanic.kind === 'squad' ? '◆ Cờ vàng trên bản đồ nhỏ' : '◆ Linh trận trên bản đồ nhỏ'}
        </small>
      )}
    </aside>
  );
}

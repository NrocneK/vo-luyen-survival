import { augments } from '../data/augments';
import { skills } from '../data/skills';
import type { AugmentId } from '../shared/augments';

export function RunBuild({ chosen, compact = false }: { chosen: AugmentId[]; compact?: boolean }) {
  if (!chosen.length) return null;
  return (
    <details className={`run-build ${compact ? 'compact' : ''}`}>
      <summary>Biến chiêu đã chọn · {chosen.length}</summary>
      <ul>
        {chosen.map((id) => {
          const def = augments[id];
          return (
            <li key={id}>
              <strong>{def.name}</strong>
              <small>{skills[def.skill].name}</small>
              <p>{def.description}</p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

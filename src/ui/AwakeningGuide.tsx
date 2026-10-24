import { awakeningFor, canAwaken } from '../data/awakenings';
import { skills } from '../data/skills';
import './awakenings.css';

export function AwakeningGuide({
  prepared,
  ranks,
}: {
  prepared: string[];
  ranks?: Record<string, number>;
}) {
  const rows = [...new Set(prepared)].map(awakeningFor).filter((def) => !!def);
  if (!rows.length) return null;
  const count = rows.filter((def) => (ranks?.[def.skill] ?? 0) >= 6).length;
  return (
    <details className="awakening-guide">
      <summary>
        {ranks
          ? `Thức tỉnh · ${count}/${rows.length}`
          : `Liên kết thức tỉnh · ${rows.length} kỹ năng`}
      </summary>
      <p>
        Tấn công bậc 5 + hỗ trợ liên kết đã kích hoạt từ bậc 1 → chọn thẻ thức tỉnh bậc 6. Hỗ trợ
        tối đa bậc 5.
      </p>
      <ul>
        {rows.map((def) => {
          const rank = ranks?.[def.skill] ?? 0,
            support = ranks?.[def.support] ?? 0;
          const state =
            rank >= 6 ? 'awakened' : ranks && canAwaken(def.skill, ranks) ? 'ready' : '';
          return (
            <li className={state} key={def.skill}>
              <strong>{def.name}</strong>
              <span>
                {skills[def.skill].name}
                {ranks ? (rank >= 6 ? ' bậc 6' : ` ${rank}/5`) : ' bậc 5'} +{' '}
                {skills[def.support].name}
                {ranks ? (support ? ` bậc ${support} (cần ≥1)` : ' chưa kích hoạt') : ' bậc 1'}
              </span>
              <small>
                {rank >= 6
                  ? 'Đã thức tỉnh · giữ biến chiêu đến hết lượt'
                  : state === 'ready'
                    ? 'Đủ điều kiện · thẻ thức tỉnh có thể xuất hiện'
                    : !prepared.includes(def.support)
                      ? `Chưa mang theo ${skills[def.support].name}`
                      : ranks
                        ? 'Tiếp tục nâng bậc và kích hoạt hỗ trợ'
                        : 'Đã chuẩn bị hỗ trợ · cần kích hoạt trong màn'}
              </small>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

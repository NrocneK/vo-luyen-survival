import type { GameSnapshot } from '../shared/types';
import { damageSourceName, incomingSourceName } from '../data/combatReport';
import { augments } from '../data/augments';
import { skills } from '../data/skills';
import { pets } from '../data/pets';
import { awakeningFor } from '../data/awakenings';
import { Icon } from './AssetIcon';
import { GameGlyph, ActorPortrait } from './lobby/SurvivalUI';
import type { DamageRow } from '../shared/combatSummary';
import './combat-report.css';

const number = (value: number) =>
  value > 0 && value < 0.1 ? '<0,1' : value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

function DamageFace({ row, state }: { row: Readonly<DamageRow>; state: GameSnapshot }) {
  const petId = row.id.startsWith('pet-') ? row.id.slice(4) : '';
  const pet = pets[petId];
  if (pet)
    return (
      <span className="damage-face">
        <ActorPortrait
          id={state.profile.pets[petId]?.evolved ? pet.evolvedActor : pet.actor}
          label={damageSourceName(row, state.profile)}
        />
      </span>
    );
  const icon = row.awakened ? awakeningFor(row.id)?.icon : skills[row.id]?.icon;
  return (
    <span className={`damage-face ${row.awakened ? 'awakened' : ''}`}>
      {icon ? (
        <Icon id={icon} category="skills" size={35} />
      ) : (
        <GameGlyph name="damage" size={25} />
      )}
    </span>
  );
}

export function CombatReport({ state }: { state: GameSnapshot }) {
  const result = state.result,
    combat = result?.combat;
  if (!result || !combat) return null;
  const death = result.outcome === 'defeat' && combat.lethalHit;
  const culprit = death ? incomingSourceName(death.source) : null;
  return (
    <section className="combat-report" aria-labelledby="combat-report-title">
      <div className="combat-report-heading">
        <h3 id="combat-report-title">
          <GameGlyph name="damage" size={23} /> Dấu ấn giao tranh
        </h3>
        <span>
          Tổng sát thương <strong>{number(combat.damageDealt)}</strong>
        </span>
      </div>
      {state.test.enabled && (
        <p className="report-test-note">
          Lượt test · hệ số sát thương ×{state.test.damageMultiplier}
        </p>
      )}
      {combat.sources.length ? (
        <table className="damage-table">
          <caption className="sr-only">Sát thương thực tế theo kỹ năng và linh thú</caption>
          <thead>
            <tr>
              <th scope="col">Nguồn sát thương</th>
              <th scope="col">Sát thương</th>
              <th scope="col">Hạ địch</th>
            </tr>
          </thead>
          <tbody>
            {combat.sources.map((row) => {
              const share = combat.damageDealt > 0 ? (row.damage / combat.damageDealt) * 100 : 0;
              const branch = state.run.augments
                .map((id) => augments[id])
                .find((a) => a.skill === row.id);
              return (
                <tr
                  key={`${row.id}:${row.awakened}`}
                  data-source-id={row.id}
                  data-awakened={row.awakened}
                >
                  <th scope="row">
                    <div className="damage-source-identity">
                      <DamageFace row={row} state={state} />
                      <div>
                        <span className="damage-source-name">
                          {damageSourceName(row, state.profile)}
                        </span>
                        <small>
                          {row.id.startsWith('pet-')
                            ? 'Linh thú đồng hành'
                            : row.awakened
                              ? 'Thức tỉnh · bậc 6'
                              : `Bậc cao nhất ${row.rank}`}
                          {branch ? ` · ${branch.name}` : ''}
                        </small>
                        {row.awakened && <small>Từ {skills[row.id]?.name}</small>}
                        <span className="damage-bar" aria-hidden="true">
                          <span style={{ width: `${share}%` }} />
                        </span>
                      </div>
                    </div>
                  </th>
                  <td>
                    <strong>{number(row.damage)}</strong>
                    <small>{share.toFixed(1).replace('.', ',')}%</small>
                  </td>
                  <td>{row.kills}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>Chưa gây sát thương trong lượt này.</p>
      )}
      <p className="report-explanation">
        Chỉ tính HP thực mất, sau chí mạng và giảm sát thương. Đòn lan, đòn trễ và thiêu đốt được
        gộp vào kỹ năng gốc; trước và sau thức tỉnh tách riêng.
      </p>
      <div className="received-total">
        Sát thương đã nhận <strong>{number(combat.damageTaken)}</strong>
      </div>
      {result.outcome === 'defeat' && (
        <div className="death-report">
          <span className="overline">NGUYÊN NHÂN TỬ TRẬN</span>
          <strong>{culprit?.name ?? 'Sinh lực cạn kiệt'}</strong>
          <p>
            {culprit?.detail ?? 'Không ghi nhận đòn kết liễu.'}
            {death
              ? ` · Mất ${number(death.damage)} HP cuối cùng (${number(death.hpBefore)} → 0).`
              : ''}
          </p>
          {combat.recentHits.length > 0 && (
            <details>
              <summary>Các đòn trúng trong 6 giây cuối</summary>
              <ol>
                {combat.recentHits.map((hit, index) => {
                  const source = incomingSourceName(hit.source);
                  return (
                    <li key={index}>
                      <span>
                        {Math.max(0, result.time - hit.time).toFixed(1)} giây trước · {source.name}
                        <small>{source.detail}</small>
                      </span>
                      <strong>−{number(hit.damage)} HP</strong>
                    </li>
                  );
                })}
              </ol>
            </details>
          )}
        </div>
      )}
      {result.outcome === 'retreat' && (
        <p className="retreat-note">Bạn chủ động rút lui. Lượt này không được ghi là tử trận.</p>
      )}
    </section>
  );
}

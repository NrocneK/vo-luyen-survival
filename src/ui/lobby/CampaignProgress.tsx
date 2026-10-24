import { allStages } from '../../data/stages';
import { stageUnlocked, worldProgress, currentWorld } from '../../data/campaign';
import type { Profile } from '../../shared/models';

export function CampaignProgress({
  profile,
  world = currentWorld(profile),
}: {
  profile: Profile;
  world?: 1 | 2;
}) {
  const progress = worldProgress(profile, world);
  const stages = allStages.filter((stage) => (stage.chapter ?? 1) === world);
  return (
    <div className={`campaign-progress ${progress.completed ? 'completed' : ''}`}>
      <div className="progress-label">
        <span>{world === 1 ? 'THẾ GIỚI 1 · TRUNG ĐÔ' : 'THẾ GIỚI 2 · THÔNG HUYỀN'}</span>
        <strong>
          {progress.cleared}/{progress.total} mốc
        </strong>
      </div>
      <div
        className="campaign-steps"
        aria-label={`${progress.cleared} trên ${progress.total} màn đã vượt qua`}
      >
        {stages.map((stage) => {
          const cleared = (profile.stageProgress[stage.id]?.wins ?? 0) > 0;
          return (
            <span
              key={stage.id}
              className={cleared ? 'cleared' : stageUnlocked(profile, stage.id) ? 'available' : ''}
              title={`${stage.name} · ${cleared ? 'Đã vượt qua' : stageUnlocked(profile, stage.id) ? 'Có thể lịch luyện' : 'Chưa mở'}`}
            >
              {cleared ? '✓' : stage.stageIndex + 1}
            </span>
          );
        })}
      </div>
      <p>
        {progress.completed
          ? world === 1
            ? 'Thần Du đỉnh phong · Trung Đô hoàn thành.'
            : 'Nhập Thánh đỉnh phong · Thông Huyền hoàn thành.'
          : world === 1
            ? 'Vượt sáu mốc và đạt Thần Du đỉnh phong tầng 10.'
            : 'Vượt 14 màn và đạt Nhập Thánh tam tầng đỉnh phong.'}
      </p>
    </div>
  );
}

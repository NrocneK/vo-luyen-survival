import { useEffect, useState } from 'react';
import { Icon } from '../AssetIcon';
import { actorAsset, assetUrl } from '../../data/assets';
import { equipment, resourceNames, slotNames } from '../../data/equipment';
import type { Cost, Profile, Slot, Stats, Resource } from '../../shared/models';

export function GameGlyph({ name, size = 24 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    home: 'M3 11 12 3l9 8M5 10v11h14V10M10 21v-7h4v7',
    cultivate: 'M12 3c7 6 8 11 4 16-2 2-6 2-8 0C4 14 5 9 12 3Zm0 7v10M8 14l4 3 4-3',
    alchemy: 'M8 4h8M9 4v5l-5 9c-1 2 0 3 2 3h12c2 0 3-1 2-3l-5-9V4M7 15h10',
    forge: 'm3 9 7-6 6 7-4 4-6-7M11 13l9 9M4 20h9',
    inventory: 'M5 8h14v13H5ZM8 8V5a4 4 0 0 1 8 0v3M9 12h6M9 16h6',
    pets: 'M7 13c-7 0-5-6-2-6s4 6 2 6Zm10 0c7 0 5-6 2-6s-4 6-2 6ZM8 6c-3 0-2-5 0-5s3 5 0 5Zm8 0c3 0 2-5 0-5s-3 5 0 5ZM12 12c-3 0-8 7-4 9 2 1 2-1 4-1s2 2 4 1c4-2-1-9-4-9Z',
    expedition: 'm5 21 6-10M7 3l14 5-14 5ZM7 3v13',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 2h4l1 4 4-1 2 4-3 3 3 3-2 4-4-1-1 4h-4l-1-4-4 1-2-4 3-3-3-3 2-4 4 1Z',
    hp: 'M12 21 3 12C-2 5 8 1 12 7c4-6 14-2 9 5Z',
    damage: 'm5 21 4-4M3 15l6 6M7 17 20 4l1-3-3 1L5 15',
    armor: 'm12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6ZM12 7v10',
    crit: 'm12 2 2 7 8 3-8 2-2 8-2-8-8-2 8-3Z',
    head: 'M4 18v-7a8 8 0 0 1 16 0v7M4 15h16M9 4v8M15 4v8',
    body: 'm7 3 5 3 5-3 5 6-5 3v9H7v-9L2 9Z',
    hands: 'M7 21 3 12l3-2 3 4V4h3v9-10h3v10-8h3v11l-3 5Z',
    feet: 'M7 2h8v11l5 3v5H4v-6l3-2Z',
    jewel: 'm12 2 9 9-9 11-9-11ZM3 11h18M8 3l4 19 4-19',
    relic: 'm12 2 9 5v10l-9 5-9-5V7ZM3 7l9 5 9-5M12 12v10',
    lock: 'M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
    rotate: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
    timer: 'M12 8v5l3 2M9 2h6M12 2v3M19 5l2 2M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z',
    level: 'm5 16 7-12 7 12M7 12h10M5 21h14M12 16v5',
    pause: 'M7 4h3v16H7ZM14 4h3v16h-3Z',
    play: 'm8 3 13 9-13 9Z',
    dash: 'm13 2-9 12h7l-1 8L21 9h-8ZM2 5h5M1 9h3',
    close: 'm6 6 12 12M6 18 18 6',
    trophy:
      'M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 5 4M17 5h4v3a4 4 0 0 1-5 4M12 14v6M7 21h10',
    map: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3ZM9 2v17M15 5v17',
    check: 'm4 12 5 5L21 5',
  };
  return (
    <svg
      className="game-glyph"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name === 'weapon' ? 'damage' : name] ?? paths.crit} />
    </svg>
  );
}
export function compactAmount(value: number): string {
  if (Math.abs(value) < 10000) return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  const scale = Math.abs(value) >= 1e9 ? 1e9 : Math.abs(value) >= 1e6 ? 1e6 : 1e3;
  return `${(value / scale).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${scale === 1e9 ? 'B' : scale === 1e6 ? 'M' : 'K'}`;
}
export const itemQuality = (id: string) =>
  (equipment[id]?.requiredRealm ?? 0) >= 50
    ? 'sacred'
    : (equipment[id]?.requiredRealm ?? 0) >= 47
      ? 'super'
      : equipment[id]?.special
        ? 'rare'
        : 'normal';
export function ItemFace({
  id,
  size = 64,
  level,
  empty,
}: {
  id?: string | null;
  size?: number;
  level?: number;
  empty?: Slot;
}) {
  return (
    <span className="item-face" data-quality={id ? itemQuality(id) : 'empty'}>
      {id ? (
        <Icon category="equipment" id={id} size={size} />
      ) : (
        <GameGlyph name={empty ?? 'inventory'} size={size * 0.58} />
      )}
      {level !== undefined && <b className="item-level">+{level}</b>}
    </span>
  );
}
const statLabels: Record<string, string> = {
  hp: 'Sinh lực',
  damage: 'Công kích',
  armor: 'Giáp',
  crit: 'Chí mạng',
  speed: 'Tốc độ',
  haste: 'Tốc đánh',
  pickup: 'Hút XP',
  regen: 'Hồi phục',
};
export function StatBadges({
  stats,
  multiplier = 1,
}: {
  stats: Partial<Stats>;
  multiplier?: number;
}) {
  return (
    <div className="stat-badges">
      {Object.entries(stats).map(([key, value]) => (
        <span key={key} title={statLabels[key] ?? key}>
          <GameGlyph name={key} />
          <b>
            +
            {(value * multiplier * (key === 'crit' || key === 'haste' ? 100 : 1)).toLocaleString(
              'vi-VN',
              { maximumFractionDigits: 1 },
            )}
            {key === 'crit' || key === 'haste' ? '%' : ''}
          </b>
          <small>{statLabels[key] ?? key}</small>
        </span>
      ))}
    </div>
  );
}
export function MaterialCost({ cost, profile }: { cost: Cost; profile?: Profile }) {
  const rows = [
    ...(cost.stone ? [['linh-thach', cost.stone, 'Linh thạch', profile?.stone] as const] : []),
    ...Object.entries(cost.resources ?? {})
      .filter(([, amount]) => amount > 0)
      .map(
        ([id, amount]) =>
          [id, amount, resourceNames[id as Resource], profile?.resources[id as Resource]] as const,
      ),
  ];
  return (
    <div className="material-cost" aria-label="Nguyên liệu cần">
      {rows.map(([id, amount, name, owned]) => (
        <span
          key={id}
          className={owned !== undefined && owned < amount ? 'insufficient' : ''}
          title={`${name}: ${amount.toLocaleString('vi-VN')}${owned !== undefined ? ` · Có ${owned.toLocaleString('vi-VN')}` : ''}`}
        >
          <Icon id={id} size={25} />
          <b>{compactAmount(amount)}</b>
          <span className="sr-only"> {name}</span>
        </span>
      ))}
    </div>
  );
}
export function SlotFilter({
  value,
  onChange,
}: {
  value: Slot | null;
  onChange: (slot: Slot | null) => void;
}) {
  return (
    <div className="slot-filter" aria-label="Lọc ô trang bị">
      <button aria-pressed={!value} onClick={() => onChange(null)}>
        Tất cả
      </button>
      {(Object.keys(slotNames) as Slot[]).map((slot) => (
        <button
          key={slot}
          title={slotNames[slot]}
          aria-label={slotNames[slot]}
          aria-pressed={value === slot}
          onClick={() => onChange(slot)}
        >
          <GameGlyph name={slot} />
        </button>
      ))}
    </div>
  );
}

const portraits = new Map<string, Promise<string>>();
function portrait(id: string): Promise<string> {
  let result = portraits.get(id);
  if (result) return result;
  result = (async () => {
    const actor = actorAsset(id);
    const data = await fetch(assetUrl(actor.atlasData)).then((r) => {
      if (!r.ok) throw Error('Không tải được chân dung');
      return r.json();
    });
    const name = actor.animations['idle-S'].frames[0],
      entry = data.frames[name],
      f = entry.frame;
    const image = new Image();
    image.src = assetUrl(actor.atlas);
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 192;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    const scale = Math.min(164 / f.w, 164 / f.h);
    ctx.drawImage(
      image,
      f.x,
      f.y,
      f.w,
      f.h,
      (192 - f.w * scale) / 2,
      182 - f.h * scale,
      f.w * scale,
      f.h * scale,
    );
    return canvas.toDataURL();
  })();
  portraits.set(id, result);
  return result;
}
export function ActorPortrait({ id, label }: { id: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setSrc(null);
    void portrait(id)
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <span className="actor-portrait">
      {src ? <img src={src} alt={label} /> : <GameGlyph name="pets" size={64} />}
    </span>
  );
}

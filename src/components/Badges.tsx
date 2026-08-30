import type { ClassicTier } from '@/lib/types';

/** 来源徽章：文字取来源名，配色按家族（tokens.css） */
export function SourceBadge({
  name,
  family,
}: {
  name: string;
  family: string;
}) {
  return (
    <span
      className="inline-flex max-w-[240px] items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5"
      style={{
        background: `var(--badge-${family}-bg, var(--badge-other-bg))`,
        color: `var(--badge-${family}-fg, var(--badge-other-fg))`,
        borderColor: `var(--badge-${family}-line, var(--badge-other-line))`,
      }}
      title={name}
    >
      <span className="truncate">{name}</span>
    </span>
  );
}

/** 编辑精选标记 */
export function CuratedBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5"
      style={{
        background: 'var(--curated-bg)',
        color: 'var(--curated-fg)',
        borderColor: 'var(--curated-line)',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.26 6.85.72-5.1 4.6 1.42 6.72L12 17.4l-6.07 3.4 1.42-6.72-5.1-4.6 6.85-.72z"
          fill="currentColor"
        />
      </svg>
      精选
    </span>
  );
}

const TIER_ICON: Record<ClassicTier, string> = {
  seminal: '★',
  milestone: '◆',
  essential: '○',
};

const TIER_TEXT: Record<ClassicTier, string> = {
  seminal: '奠基之作',
  milestone: '里程碑',
  essential: '必读',
};

/** 经典论文重要度徽章 */
export function TierBadge({ tier }: { tier: ClassicTier }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-5"
      style={{
        background: `var(--tier-${tier}-bg)`,
        color: `var(--tier-${tier}-fg)`,
      }}
      title={TIER_TEXT[tier]}
    >
      <span aria-hidden="true">{TIER_ICON[tier]}</span>
      {TIER_TEXT[tier]}
    </span>
  );
}

/** 方向标签 */
export function TrackBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-bg-soft px-2.5 py-0.5 text-[11px] leading-5 text-ink-2">
      {label}
    </span>
  );
}

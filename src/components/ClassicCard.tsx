import Link from 'next/link';

import { TierBadge, TrackBadge } from '@/components/Badges';
import type { ClassicPaper } from '@/lib/types';

function ExternalIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const linkClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink';

/** 经典论文卡片 */
export function ClassicCard({
  paper,
  trackLabel,
}: {
  paper: ClassicPaper;
  trackLabel: string;
}) {
  const arxivUrl = paper.arxiv
    ? `https://arxiv.org/abs/${paper.arxiv}`
    : null;

  return (
    <article className="flex h-full flex-col rounded-[var(--radius)] border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={paper.tier} />
        <TrackBadge label={trackLabel} />
        <span className="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums text-muted">
          {paper.year}
        </span>
      </div>

      <h3 className="mt-3 text-[16px] font-semibold leading-snug text-ink">
        <Link
          href={`/classics/${paper.id}`}
          className="no-underline hover:text-brand"
        >
          {paper.titleZh}
        </Link>
      </h3>

      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
        {paper.title}
      </p>

      <p className="mt-2 text-xs text-muted">
        {paper.authors} · {paper.venue}
      </p>

      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-2">
        {paper.contribution}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/classics/${paper.id}`} className={linkClass}>
          详情与解读
        </Link>
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          原文
          <ExternalIcon />
        </a>
        {arxivUrl ? (
          <a
            href={arxivUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            arXiv
            <ExternalIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}

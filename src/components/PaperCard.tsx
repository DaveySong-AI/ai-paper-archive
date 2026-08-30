import Link from 'next/link';

import { CuratedBadge, SourceBadge } from '@/components/Badges';
import { RelativeTime } from '@/components/RelativeTime';
import type { PaperRecord } from '@/lib/types';

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

/** 每周档案库的论文卡片（M1-6） */
export function PaperCard({
  paper,
  index,
}: {
  paper: PaperRecord;
  index: number;
}) {
  return (
    <article className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 font-mono text-xs font-semibold text-brand-dark"
          aria-label={`第 ${index} 篇`}
        >
          {String(index).padStart(2, '0')}
        </span>
        <SourceBadge name={paper.source.name} family={paper.source.family} />
        {paper.curated ? <CuratedBadge /> : null}
        <span className="ml-auto text-xs text-muted">
          <RelativeTime iso={paper.timelineAt} />
        </span>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-snug text-ink">
        <Link
          href={paper.links.reader}
          className="no-underline hover:text-brand"
        >
          {paper.title}
        </Link>
      </h3>

      {paper.titleEn ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {paper.titleEn}
        </p>
      ) : null}

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
        {paper.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={paper.links.reader} className={linkClass}>
          阅读详情
        </Link>
        <a
          href={paper.links.original}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          原文出处
          <ExternalIcon />
        </a>
        {paper.links.detail ? (
          <a
            href={paper.links.detail}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            来源页
            <ExternalIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}

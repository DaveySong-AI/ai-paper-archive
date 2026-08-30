'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface SearchEntry {
  id: string;
  title: string;
  titleEn: string;
  kind: 'weekly' | 'classic';
  href: string;
  meta: string;
  summary: string;
}

const KIND_LABEL: Record<SearchEntry['kind'], string> = {
  weekly: '每周档案',
  classic: '经典论文',
};

/** 站内搜索：跨每周档案与经典论文库 */
export function SiteSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return entries
      .filter((entry) =>
        [entry.title, entry.titleEn, entry.summary]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 12);
  }, [entries, query]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">站内搜索论文</span>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M16 16l4.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索全站论文：标题、摘要关键词"
          className="w-full rounded-[var(--radius)] border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink shadow-card outline-none placeholder:text-muted focus:border-brand"
        />
      </label>

      {query.trim() !== '' ? (
        <div className="mt-3">
          <p className="m-0 text-xs text-muted" aria-live="polite">
            {results.length > 0
              ? `找到 ${results.length} 条${results.length === 12 ? '（最多显示 12 条）' : ''}`
              : '没有匹配的论文'}
          </p>

          {results.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {results.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    className="block rounded-[var(--radius)] border border-line bg-surface px-4 py-3 no-underline shadow-card transition-shadow hover:shadow-lift"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[11px]',
                          entry.kind === 'classic'
                            ? 'bg-brand-soft text-brand-dark'
                            : 'bg-bg-soft text-ink-2',
                        ].join(' ')}
                      >
                        {KIND_LABEL[entry.kind]}
                      </span>
                      <span className="text-xs text-muted">{entry.meta}</span>
                    </div>
                    <p className="m-0 mt-1.5 text-[14px] font-medium text-ink">
                      {entry.title}
                    </p>
                    <p className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {entry.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

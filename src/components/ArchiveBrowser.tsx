'use client';

import { useMemo, useState } from 'react';

import { PaperCard } from '@/components/PaperCard';
import { Reveal } from '@/components/Reveal';
import { groupByDay } from '@/lib/timeline';
import type { PaperRecord } from '@/lib/types';

interface SourceStat {
  name: string;
  family: string;
  count: number;
}

function matches(paper: PaperRecord, query: string): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [paper.title, paper.titleEn ?? '', paper.summary]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function ArchiveBrowser({ papers }: { papers: PaperRecord[] }) {
  const [query, setQuery] = useState('');
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const sources = useMemo<SourceStat[]>(() => {
    const map = new Map<string, SourceStat>();
    for (const paper of papers) {
      const key = paper.source.name;
      const current = map.get(key);
      if (current) current.count += 1;
      else {
        map.set(key, {
          name: key,
          family: paper.source.family,
          count: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [papers]);

  const filtered = useMemo(
    () =>
      papers.filter(
        (paper) =>
          matches(paper, query) &&
          (activeSource === null || paper.source.name === activeSource),
      ),
    [papers, query, activeSource],
  );

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  // 过滤后重新连续编号，跨天不重置
  const indexById = useMemo(
    () => new Map(filtered.map((paper, i) => [paper.id, i + 1])),
    [filtered],
  );

  const hasFilter = query.trim() !== '' || activeSource !== null;

  return (
    <div>
      {/* 筛选区 */}
      <div className="no-print rounded-[var(--radius)] border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[220px]">
            <span className="sr-only">按标题或摘要搜索</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
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
              placeholder="搜索标题或摘要关键词"
              className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
            />
          </label>

          <p className="shrink-0 text-xs text-muted" aria-live="polite">
            {hasFilter
              ? `筛选出 ${filtered.length} / ${papers.length} 篇`
              : `共 ${papers.length} 篇`}
          </p>

          {hasFilter ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveSource(null);
              }}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              重置
            </button>
          ) : null}
        </div>

        {/* 来源筛选 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sources.map((source) => {
            const active = activeSource === source.name;
            return (
              <button
                key={source.name}
                type="button"
                onClick={() =>
                  setActiveSource(active ? null : source.name)
                }
                aria-pressed={active}
                title={source.name}
                className={[
                  'max-w-[240px] truncate rounded-full border px-2.5 py-0.5 text-[11px] leading-5 transition-colors',
                  active
                    ? 'border-brand bg-brand-soft font-medium text-brand-dark'
                    : 'border-line bg-surface-2 text-ink-2 hover:border-line-strong',
                ].join(' ')}
              >
                {source.name}
                <span className="ml-1 text-muted">{source.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 时间轴 + 卡片 */}
      {groups.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="m-0 text-sm font-medium text-ink">没有匹配的论文</p>
          <p className="mt-1.5 text-[13px] text-muted">
            试试换个关键词，或清除来源筛选。
          </p>
          {hasFilter ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveSource(null);
              }}
              className="mt-4 rounded-lg border border-line px-4 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              重置筛选
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8">
          {groups.map((group) => (
            <section
              key={group.date}
              className="xl:grid xl:grid-cols-[150px_minmax(0,1fr)] xl:gap-7"
            >
              {/* 宽屏：左列日期印章，滚动吸顶 */}
              <div className="relative hidden xl:block">
                <div
                  className="absolute right-0 top-0 h-full w-px bg-line"
                  aria-hidden="true"
                />
                <div className="day-stamp py-1 pr-6 text-right">
                  <span
                    className="absolute right-[-4px] top-[10px] h-2 w-2 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                  <div className="text-[15px] font-semibold tabular-nums text-brand-dark">
                    {group.date.slice(5)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {group.weekday} · {group.papers.length} 篇
                  </div>
                </div>
              </div>

              {/* 窄屏：顶部日期条 */}
              <div className="mb-3 flex items-center gap-2 xl:hidden">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-brand"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold tabular-nums text-brand-dark">
                  {group.date.slice(5)}
                </span>
                <span className="text-xs text-muted">
                  {group.weekday} · {group.papers.length} 篇
                </span>
              </div>

              {/* 卡片列 */}
              <div className="space-y-4 pb-9">
                {group.papers.map((paper) => {
                  const index = indexById.get(paper.id) ?? 0;
                  return (
                    <Reveal key={paper.id} delay={Math.min(index, 8) * 55}>
                      <PaperCard paper={paper} index={index} />
                    </Reveal>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

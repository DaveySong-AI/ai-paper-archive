'use client';

import { useMemo, useState } from 'react';

import { ClassicCard } from '@/components/ClassicCard';
import { Reveal } from '@/components/Reveal';
import type { ClassicPaper, ClassicTier, ClassicTrack } from '@/lib/types';

type ViewMode = 'track' | 'year';

const TIER_ORDER: ClassicTier[] = ['seminal', 'milestone', 'essential'];

export function ClassicBrowser({
  papers,
  trackLabels,
  tierLabels,
}: {
  papers: ClassicPaper[];
  trackLabels: Record<ClassicTrack, string>;
  tierLabels: Record<ClassicTier, string>;
}) {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<ClassicTier | null>(null);
  const [track, setTrack] = useState<ClassicTrack | null>(null);
  const [view, setView] = useState<ViewMode>('track');

  const tracks = useMemo(() => {
    const counts = new Map<ClassicTrack, number>();
    for (const paper of papers) {
      counts.set(paper.track, (counts.get(paper.track) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));
  }, [papers]);

  const tierCounts = useMemo(() => {
    const counts = new Map<ClassicTier, number>();
    for (const paper of papers) {
      counts.set(paper.tier, (counts.get(paper.tier) ?? 0) + 1);
    }
    return counts;
  }, [papers]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return papers.filter((paper) => {
      if (tier && paper.tier !== tier) return false;
      if (track && paper.track !== track) return false;
      if (!needle) return true;
      return [paper.titleZh, paper.title, paper.authors, paper.contribution]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [papers, query, tier, track]);

  // 按方向分组
  const byTrack = useMemo(() => {
    const map = new Map<ClassicTrack, ClassicPaper[]>();
    for (const paper of filtered) {
      const bucket = map.get(paper.track);
      if (bucket) bucket.push(paper);
      else map.set(paper.track, [paper]);
    }
    return [...map.entries()].map(([key, list]) => ({
      key,
      label: trackLabels[key] ?? key,
      papers: [...list].sort((a, b) => a.year - b.year),
    }));
  }, [filtered, trackLabels]);

  // 按年代分组（升序，呈现技术演进脉络）
  const byYear = useMemo(() => {
    const map = new Map<number, ClassicPaper[]>();
    for (const paper of filtered) {
      const bucket = map.get(paper.year);
      if (bucket) bucket.push(paper);
      else map.set(paper.year, [paper]);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, list]) => ({ year, papers: list }));
  }, [filtered]);

  const hasFilter = query.trim() !== '' || tier !== null || track !== null;
  const reset = (): void => {
    setQuery('');
    setTier(null);
    setTrack(null);
  };

  const chipBase =
    'rounded-full border px-3 py-1 text-xs transition-colors shrink-0';
  const chipOff = 'border-line bg-surface-2 text-ink-2 hover:border-line-strong';
  const chipOn = 'border-brand bg-brand-soft font-medium text-brand-dark';

  return (
    <div>
      {/* 筛选区 */}
      <div className="rounded-[var(--radius)] border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[220px]">
            <span className="sr-only">搜索经典论文</span>
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
              placeholder="搜索标题、作者或贡献"
              className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
            />
          </label>

          <div
            className="flex shrink-0 rounded-lg border border-line p-0.5"
            role="group"
            aria-label="视图切换"
          >
            {(
              [
                { key: 'track' as ViewMode, label: '按方向' },
                { key: 'year' as ViewMode, label: '按年代' },
              ]
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setView(option.key)}
                aria-pressed={view === option.key}
                className={[
                  'rounded-md px-3 py-1 text-xs transition-colors',
                  view === option.key
                    ? 'bg-brand-soft font-medium text-brand-dark'
                    : 'text-ink-2 hover:text-ink',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="shrink-0 text-xs text-muted" aria-live="polite">
            {hasFilter
              ? `筛选出 ${filtered.length} / ${papers.length} 篇`
              : `共 ${papers.length} 篇`}
          </p>

          {hasFilter ? (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              重置
            </button>
          ) : null}
        </div>

        {/* 重要度筛选 */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-muted">重要度</span>
          <button
            type="button"
            onClick={() => setTier(null)}
            aria-pressed={tier === null}
            className={`${chipBase} ${tier === null ? chipOn : chipOff}`}
          >
            全部
            <span className="ml-1 text-muted">{papers.length}</span>
          </button>
          {TIER_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTier(tier === key ? null : key)}
              aria-pressed={tier === key}
              className={`${chipBase} ${tier === key ? chipOn : chipOff}`}
            >
              {tierLabels[key]}
              <span className="ml-1 text-muted">
                {tierCounts.get(key) ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* 方向筛选 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-muted">方向</span>
          <button
            type="button"
            onClick={() => setTrack(null)}
            aria-pressed={track === null}
            className={`${chipBase} ${track === null ? chipOn : chipOff}`}
          >
            全部
          </button>
          {tracks.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTrack(track === item.key ? null : item.key)}
              aria-pressed={track === item.key}
              className={`${chipBase} ${track === item.key ? chipOn : chipOff}`}
            >
              {trackLabels[item.key] ?? item.key}
              <span className="ml-1 text-muted">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="m-0 text-sm font-medium text-ink">没有匹配的论文</p>
          <p className="mt-1.5 text-[13px] text-muted">
            试试换个关键词，或放宽重要度与方向筛选。
          </p>
          {hasFilter ? (
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-lg border border-line px-4 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              重置筛选
            </button>
          ) : null}
        </div>
      ) : view === 'track' ? (
        <div className="mt-8 space-y-10">
          {byTrack.map((group) => (
            <section key={group.key} id={group.key}>
              <div className="flex items-baseline gap-3 border-b border-line pb-2">
                <h2 className="m-0 text-base font-semibold text-ink">
                  {group.label}
                </h2>
                <span className="text-xs text-muted">
                  {group.papers.length} 篇
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.papers.map((paper, index) => (
                  <Reveal
                    key={paper.id}
                    delay={Math.min(index, 8) * 45}
                    className="h-full"
                  >
                    <ClassicCard paper={paper} trackLabel={group.label} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          {byYear.map((group) => (
            <section
              key={group.year}
              className="md:grid md:grid-cols-[92px_minmax(0,1fr)] md:gap-6"
            >
              <div className="relative hidden md:block">
                <div
                  className="absolute right-0 top-0 h-full w-px bg-line"
                  aria-hidden="true"
                />
                <div className="day-stamp py-1 pr-5 text-right">
                  <span
                    className="absolute right-[-4px] top-[10px] h-2 w-2 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                  <div className="text-[15px] font-semibold tabular-nums text-brand-dark">
                    {group.year}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {group.papers.length} 篇
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 md:hidden">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-brand"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold tabular-nums text-brand-dark">
                  {group.year}
                </span>
                <span className="text-xs text-muted">
                  {group.papers.length} 篇
                </span>
              </div>

              <div className="grid gap-4 pb-8 sm:grid-cols-2">
                {group.papers.map((paper, index) => (
                  <Reveal
                    key={paper.id}
                    delay={Math.min(index, 6) * 45}
                    className="h-full"
                  >
                    <ClassicCard
                      paper={paper}
                      trackLabel={trackLabels[paper.track] ?? paper.track}
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

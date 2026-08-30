import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllVolumes } from '@/lib/data';

export const metadata: Metadata = {
  title: '每周档案',
  description: '按 ISO 周（周一至周日）归档的 AI 论文卷宗，最新一卷在前。',
};

export default function ArchiveIndexPage() {
  const volumes = getAllVolumes();

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          每周档案
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          按 ISO 周（周一至周日）分卷归档。每卷从数据源当周候选里选篇，
          按发布时间倒序编号展示。
        </p>
      </header>

      {volumes.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-10 text-center text-sm text-muted">
          还没有生成任何卷宗。运行 <code>npm run fetch:volume</code> 抓取。
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {volumes.map((volume) => (
            <li key={volume.isoWeek}>
              <Link
                href={`/archive/${volume.isoWeek}`}
                className="block rounded-[var(--radius)] border border-line bg-surface p-5 no-underline shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="m-0 text-lg font-semibold text-ink">
                    {volume.isoWeek}
                  </h2>
                  <span className="text-xs text-muted">
                    {volume.startDate} ~ {volume.endDate}
                  </span>
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                  收录 {volume.paperCount} 篇 · 来源 {volume.sourceCount} 个 ·
                  精选 {volume.curatedCount} 篇
                </p>
                <p className="mt-1 text-xs text-muted">
                  窗口内共 {volume.poolTotal} 篇候选
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

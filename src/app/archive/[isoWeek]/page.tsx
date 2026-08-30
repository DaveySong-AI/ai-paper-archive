import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArchiveBrowser } from '@/components/ArchiveBrowser';
import { StatGrid } from '@/components/StatGrid';
import { getAllVolumes, getVolume, getVolumePapers } from '@/lib/data';
import { beijingDate } from '@/lib/timeline';

interface PageProps {
  params: Promise<{ isoWeek: string }>;
}

export function generateStaticParams(): { isoWeek: string }[] {
  return getAllVolumes().map((volume) => ({ isoWeek: volume.isoWeek }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { isoWeek } = await params;
  const volume = getVolume(isoWeek);
  if (!volume) return { title: '卷宗不存在' };
  return {
    title: `${volume.isoWeek} 论文档案`,
    description: `${volume.startDate} 至 ${volume.endDate} 共收录 ${volume.paperCount} 篇 AI 论文，其中编辑精选 ${volume.curatedCount} 篇。`,
  };
}

export default async function VolumePage({ params }: PageProps) {
  const { isoWeek } = await params;
  const volume = getVolume(isoWeek);
  if (!volume) notFound();

  const papers = getVolumePapers(volume);
  const allVolumes = getAllVolumes();
  const position = allVolumes.findIndex((item) => item.isoWeek === isoWeek);
  const newer = position > 0 ? allVolumes[position - 1] : null;
  const older =
    position >= 0 && position < allVolumes.length - 1
      ? allVolumes[position + 1]
      : null;

  const dayCount = new Set(
    papers.map((paper) => beijingDate(paper.timelineAt)),
  ).size;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="面包屑" className="text-xs text-muted">
        <Link href="/archive" className="hover:text-brand">
          每周档案
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        <span className="text-ink-2">{volume.isoWeek}</span>
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
              {volume.isoWeek} 论文档案
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {volume.startDate} 至 {volume.endDate} · 按发布时间倒序编号归档
            </p>
          </div>

          {/* 上一周 / 下一周 */}
          <div className="flex gap-2 text-xs">
            {older ? (
              <Link
                href={`/archive/${older.isoWeek}`}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
              >
                ← {older.isoWeek}
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-muted">
                ← 更早
              </span>
            )}
            {newer ? (
              <Link
                href={`/archive/${newer.isoWeek}`}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
              >
                {newer.isoWeek} →
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-muted">
                更新 →
              </span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <StatGrid
            items={[
              { label: '收录论文', value: volume.paperCount },
              {
                label: '编辑精选',
                value: volume.curatedCount,
                hint: '数据源精选池',
              },
              { label: '来源', value: volume.sourceCount },
              { label: '覆盖天数', value: dayCount },
            ]}
          />
        </div>
      </header>

      <div className="mt-8">
        <ArchiveBrowser papers={papers} />
      </div>

      {/* 如实披露选取规则（PRD M1 数据规模现实约束） */}
      <section className="mt-10 rounded-[var(--radius)] border border-line bg-surface-2 p-5">
        <h2 className="m-0 text-sm font-semibold text-ink">本卷数据说明</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted">窗口内总数</dt>
            <dd className="m-0 text-ink-2">{volume.poolTotal} 篇</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted">本卷收录</dt>
            <dd className="m-0 text-ink-2">
              {volume.paperCount} 篇（其中精选 {volume.curatedCount} 篇）
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted">实际时间窗</dt>
            <dd className="m-0 text-ink-2">
              {volume.windowStart} ~ {volume.windowEnd}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted">来源数</dt>
            <dd className="m-0 text-ink-2">{volume.sourceCount} 个</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
          {volume.selectionRule}
        </p>
      </section>
    </div>
  );
}

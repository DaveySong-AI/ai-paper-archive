import Link from 'next/link';

import { CuratedBadge, SourceBadge, TierBadge } from '@/components/Badges';
import { SiteSearch, type SearchEntry } from '@/components/SiteSearch';
import { StatGrid } from '@/components/StatGrid';
import {
  getAllRecords,
  getClassicPapers,
  getLatestClosedVolume,
  getOngoingVolume,
  getSiteStats,
  getVolumePapers,
} from '@/lib/data';
import { beijingDate } from '@/lib/timeline';

export default function HomePage() {
  const stats = getSiteStats();
  const today = beijingDate(new Date().toISOString());
  // 主推最近一个完整周；刚开始的当周单独提示，避免顶着 1 篇内容当门面
  const latest = getLatestClosedVolume(today) ?? getOngoingVolume(today);
  const ongoing = getOngoingVolume(today);
  const latestPapers = latest ? getVolumePapers(latest).slice(0, 5) : [];
  const seminal = getClassicPapers()
    .filter((paper) => paper.tier === 'seminal')
    .slice(0, 6);

  const searchIndex: SearchEntry[] = getAllRecords().map((record) => ({
    id: record.id,
    title: record.title,
    titleEn: record.titleEn ?? '',
    kind: record.kind,
    href: record.kind === 'classic' ? `/classics/${record.id}` : record.links.reader,
    meta:
      record.kind === 'classic'
        ? `${record.venue ?? ''} · ${record.year ?? ''}`
        : `${beijingDate(record.timelineAt)} · ${record.source.name}`,
    summary: record.summary,
  }));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <section>
        <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-tight text-ink sm:text-[36px]">
          每周新论文，放回经典脉络里读
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          按 ISO 周归档的最新 AI 论文、人工策划的领域经典，
          以及带思维导图的结构化阅读器——五分钟判断一篇论文值不值得深读。
        </p>

        <div className="mt-6">
          <StatGrid
            items={[
              { label: '卷宗', value: stats.volumes },
              { label: '每周论文', value: stats.weeklyPapers },
              { label: '经典论文', value: stats.classicPapers },
              {
                label: '深度解读',
                value: stats.reviewedCount,
                hint: '已入库并审核',
              },
            ]}
          />
        </div>

        <div className="mt-6">
          <SiteSearch entries={searchIndex} />
        </div>
      </section>

      {/* 本周卷宗 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="m-0 text-base font-semibold text-ink">最新完整卷宗</h2>
          <Link href="/archive" className="text-xs text-brand hover:underline">
            查看全部卷宗 →
          </Link>
        </div>

        {ongoing && ongoing.isoWeek !== latest?.isoWeek ? (
          <p className="mt-3 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13px] text-ink-2">
            {ongoing.isoWeek} 仍在进行中（{ongoing.startDate} ~{' '}
            {ongoing.endDate}），目前已收录 {ongoing.paperCount} 篇，
            <Link
              href={`/archive/${ongoing.isoWeek}`}
              className="ml-1 text-brand hover:underline"
            >
              前往查看 →
            </Link>
          </p>
        ) : null}

        {!latest ? (
          <p className="mt-4 rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-8 text-center text-sm text-muted">
            还没有卷宗。运行 <code>npm run fetch:volume</code> 抓取最新一周论文。
          </p>
        ) : (
          <div className="mt-4">
            <Link
              href={`/archive/${latest.isoWeek}`}
              className="block rounded-[var(--radius)] border border-line bg-surface p-5 no-underline shadow-card transition-shadow hover:shadow-lift"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="m-0 text-lg font-semibold text-ink">
                  {latest.isoWeek} 论文档案
                </h3>
                <span className="text-xs text-muted">
                  {latest.startDate} ~ {latest.endDate}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                收录 {latest.paperCount} 篇 · 来源 {latest.sourceCount} 个 ·
                精选 {latest.curatedCount} 篇 · 窗口内共 {latest.poolTotal} 篇候选
              </p>
            </Link>

            <ul className="mt-3 space-y-3">
              {latestPapers.map((paper, index) => (
                <li key={paper.id}>
                  <Link
                    href={paper.links.reader}
                    className="flex gap-3 rounded-[var(--radius)] border border-line bg-surface px-4 py-3 no-underline transition-shadow hover:shadow-card"
                  >
                    <span className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 font-mono text-xs font-semibold text-brand-dark">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-ink">
                        {paper.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <SourceBadge
                          name={paper.source.name}
                          family={paper.source.family}
                        />
                        {paper.curated ? <CuratedBadge /> : null}
                        <span className="text-[11px] text-muted">
                          {beijingDate(paper.timelineAt)}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 经典论文精选 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="m-0 text-base font-semibold text-ink">
            经典论文 · 奠基之作
          </h2>
          <Link href="/classics" className="text-xs text-brand hover:underline">
            浏览全部 {stats.classicPapers} 篇 →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {seminal.map((paper) => (
            <Link
              key={paper.id}
              href={`/classics/${paper.id}`}
              className="flex flex-col rounded-[var(--radius)] border border-line bg-surface p-4 no-underline shadow-card transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center gap-2">
                <TierBadge tier={paper.tier} />
                <span className="ml-auto font-mono text-xs tabular-nums text-muted">
                  {paper.year}
                </span>
              </div>
              <p className="m-0 mt-2.5 text-[14px] font-semibold leading-snug text-ink">
                {paper.titleZh}
              </p>
              <p className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {paper.title}
              </p>
              <p className="m-0 mt-2 flex-1 text-[13px] leading-relaxed text-ink-2">
                {paper.contribution}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TierBadge, TrackBadge } from '@/components/Badges';
import { ReaderContent } from '@/components/ReaderContent';
import { ReaderToc } from '@/components/ReaderToc';
import {
  getClassicPaper,
  getClassicPapers,
  getReadingContent,
  getTrackLabels,
} from '@/lib/data';
import type { ClassicPaper } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): { id: string }[] {
  return getClassicPapers().map((paper) => ({ id: paper.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paper = getClassicPaper(id);
  if (!paper) return { title: '论文不存在' };
  return {
    title: `${paper.titleZh}（${paper.title}）`,
    description: paper.contribution,
  };
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
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

function PaperLinks({
  title,
  papers,
}: {
  title: string;
  papers: { id: string; titleZh: string; year: number }[];
}) {
  if (papers.length === 0) return null;
  return (
    <div>
      <h3 className="m-0 text-[13px] font-semibold text-ink">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {papers.map((item) => (
          <li key={item.id}>
            <Link
              href={`/classics/${item.id}`}
              className="flex items-baseline gap-2 rounded-lg border border-line bg-surface px-3 py-2 no-underline transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                {item.year}
              </span>
              <span className="text-[13px] text-ink-2">{item.titleZh}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ClassicDetailPage({ params }: PageProps) {
  const { id } = await params;
  const paper = getClassicPaper(id);
  if (!paper) notFound();

  const trackLabels = getTrackLabels();
  const reading = getReadingContent(id);
  const all = getClassicPapers();
  const byId = new Map(all.map((item) => [item.id, item]));

  const toLink = (ref: string): ClassicPaper | undefined => byId.get(ref);
  const prerequisites = paper.prerequisites
    .map(toLink)
    .filter((item): item is ClassicPaper => Boolean(item))
    .map((item) => ({ id: item.id, titleZh: item.titleZh, year: item.year }));
  const related = paper.related
    .map(toLink)
    .filter((item): item is ClassicPaper => Boolean(item))
    .map((item) => ({ id: item.id, titleZh: item.titleZh, year: item.year }));

  const arxivUrl = paper.arxiv
    ? `https://arxiv.org/abs/${paper.arxiv}`
    : null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="面包屑" className="text-xs text-muted">
        <Link href="/classics" className="hover:text-brand">
          经典论文
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        <span className="text-ink-2">{paper.titleZh}</span>
      </nav>

      <header className="mt-4 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={paper.tier} />
          <TrackBadge label={trackLabels[paper.track] ?? paper.track} />
          <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-muted">
            {paper.year}
          </span>
        </div>

        <h1 className="mt-3 text-[24px] font-semibold leading-snug tracking-tight text-ink sm:text-[30px]">
          {paper.titleZh}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{paper.title}</p>

        <p className="mt-3 text-[13px] text-ink-2">
          {paper.authors} · {paper.venue} · {paper.year}
          {paper.arxiv ? ` · arXiv:${paper.arxiv}` : ''}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-medium text-white no-underline transition-colors hover:bg-brand-dark"
          >
            阅读原文
            <ExternalIcon />
          </a>
          {arxivUrl ? (
            <a
              href={arxivUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
            >
              arXiv:{paper.arxiv}
              <ExternalIcon />
            </a>
          ) : null}
          {reading ? (
            <Link
              href={`/paper/${paper.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
            >
              独立阅读页
            </Link>
          ) : null}
        </div>
      </header>

      {/* 经典论文特有：贡献、影响、脉络 */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-card">
            <h2 className="m-0 flex items-center gap-2 text-base font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-brand" aria-hidden="true" />
              核心贡献
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
              {paper.contribution}
            </p>
          </section>

          <section className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-card">
            <h2 className="m-0 flex items-center gap-2 text-base font-semibold text-ink">
              <span
                className="h-4 w-1 rounded-full bg-accent"
                aria-hidden="true"
              />
              为何必读
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
              {paper.whyItMatters}
            </p>
          </section>

          {reading ? (
            <div className="border-t border-line pt-8">
              <ReaderContent reading={reading} />
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-6">
              <p className="m-0 text-sm font-medium text-ink">
                深度解读待补充
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                这篇经典论文还没有结构化解读（核心观点、方法拆解、思维导图）。
                当前展示的是策展信息：核心贡献、为何必读与论文脉络。
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {reading ? (
            <div className="sticky top-24 hidden lg:block">
              <ReaderToc />
            </div>
          ) : null}
          <PaperLinks title="前置阅读" papers={prerequisites} />
          <PaperLinks title="相关论文" papers={related} />
        </aside>
      </div>
    </div>
  );
}

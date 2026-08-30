import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SourceBadge } from '@/components/Badges';
import { ReaderContent } from '@/components/ReaderContent';
import { ReaderToc } from '@/components/ReaderToc';
import { getAllRecordIds, getRecordWithReading } from '@/lib/data';
import { beijingDateTime, relativeTime } from '@/lib/timeline';
import type { PaperRecord } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): { id: string }[] {
  return getAllRecordIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = getRecordWithReading(id);
  if (!record) return { title: '论文不存在' };
  return {
    title: record.title,
    description: record.summary.slice(0, 120),
  };
}

/** 每周论文的 id 形如 2026-w35-07，据此推出所属卷宗 */
function volumeOf(record: PaperRecord): string | null {
  if (record.kind !== 'weekly') return null;
  const parts = record.id.split('-');
  if (parts.length < 3) return null;
  const week = parts[1];
  if (!week?.startsWith('w')) return null;
  return `${parts[0]}-W${week.slice(1)}`;
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

export default async function PaperPage({ params }: PageProps) {
  const { id } = await params;
  const record = getRecordWithReading(id);
  if (!record) notFound();

  const isoWeek = volumeOf(record);
  const arxivUrl = record.arxivId
    ? `https://arxiv.org/abs/${record.arxivId}`
    : null;
  const isClassic = record.kind === 'classic';

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="面包屑" className="text-xs text-muted">
        {isClassic ? (
          <Link href="/classics" className="hover:text-brand">
            经典论文
          </Link>
        ) : (
          <Link href="/archive" className="hover:text-brand">
            每周档案
          </Link>
        )}
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        {isoWeek ? (
          <>
            <Link href={`/archive/${isoWeek}`} className="hover:text-brand">
              {isoWeek}
            </Link>
            <span className="mx-1.5" aria-hidden="true">
              /
            </span>
          </>
        ) : null}
        <span className="text-ink-2">阅读</span>
      </nav>

      {/* 元数据区（M3-8） */}
      <header className="mt-4 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge
            name={record.source.name}
            family={record.source.family}
          />
          {record.curated ? (
            <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">
              精选
            </span>
          ) : null}
          {isClassic ? (
            <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">
              经典论文
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-[24px] font-semibold leading-snug tracking-tight text-ink sm:text-[30px]">
          {record.title}
        </h1>

        {record.titleEn ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {record.titleEn}
          </p>
        ) : null}

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          {record.authors && record.authors.length > 0 ? (
            <div className="flex gap-2">
              <dt className="text-muted">作者</dt>
              <dd className="m-0 text-ink-2">
                {record.authors.length > 4
                  ? `${record.authors.slice(0, 3).join('、')} 等 ${record.authors.length} 人`
                  : record.authors.join('、')}
              </dd>
            </div>
          ) : null}
          {record.venue ? (
            <div className="flex gap-2">
              <dt className="text-muted">发表</dt>
              <dd className="m-0 text-ink-2">
                {record.venue}
                {record.year ? ` · ${record.year}` : ''}
              </dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="text-muted">时间</dt>
            <dd className="m-0 text-ink-2" title={beijingDateTime(record.timelineAt)}>
              {record.kind === 'weekly'
                ? `${beijingDateTime(record.timelineAt)}（${relativeTime(record.timelineAt)}）`
                : String(record.year ?? '')}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={record.links.original}
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
              arXiv:{record.arxivId}
              <ExternalIcon />
            </a>
          ) : null}
          {record.links.detail ? (
            <a
              href={record.links.detail}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
            >
              来源页
              <ExternalIcon />
            </a>
          ) : null}
          {isClassic ? (
            <Link
              href={`/classics/${record.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
            >
              经典详情与脉络
            </Link>
          ) : null}
        </div>
      </header>

      {/* 正文 */}
      {record.reading ? (
        <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,1fr)_190px] xl:gap-12">
          <div className="min-w-0">
            <ReaderContent reading={record.reading} />
          </div>
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <ReaderToc />
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,1fr)_190px] xl:gap-12">
          <div className="min-w-0">
            <section>
              <h2 className="m-0 flex items-center gap-2 text-base font-semibold text-ink">
                <span className="h-4 w-1 rounded-full bg-brand" aria-hidden="true" />
                摘要
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
                {record.summary}
              </p>
            </section>

            <div className="mt-8 rounded-[var(--radius)] border border-dashed border-line-strong bg-surface p-6">
              <p className="m-0 text-sm font-medium text-ink">
                深度解读待补充
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                这篇论文还没有结构化解读（核心观点、方法拆解、思维导图）。
                解读采用「生成草稿 + 人工审核」的方式入库，核对无误后才会上线。
                你可以先通过上方链接阅读原文。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

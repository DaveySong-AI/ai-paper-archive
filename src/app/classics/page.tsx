import type { Metadata } from 'next';

import { ClassicBrowser } from '@/components/ClassicBrowser';
import { StatGrid } from '@/components/StatGrid';
import { getClassicPapers, getTrackLabels, getTierLabels } from '@/lib/data';
import { READING_PATHS } from '@/lib/reading-paths';

export const metadata: Metadata = {
  title: '经典论文',
  description:
    'AI 领域奠基与里程碑论文的结构化清单，按方向与重要度分级，含前置知识与相关论文脉络。',
};

export default function ClassicsPage() {
  const papers = getClassicPapers();
  const trackLabels = getTrackLabels();
  const tierLabels = getTierLabels();

  const titles = new Map(papers.map((paper) => [paper.id, paper.titleZh]));
  const seminal = papers.filter((paper) => paper.tier === 'seminal').length;
  const years = papers.map((paper) => paper.year);
  const trackCount = new Set(papers.map((paper) => paper.track)).size;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          经典论文
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          AI 领域的奠基之作、里程碑与必读文献，人工策划并长期维护。
          每篇标注核心贡献、为何必读，以及前置与相关论文，可沿脉络系统阅读。
        </p>

        <div className="mt-5">
          <StatGrid
            items={[
              { label: '收录论文', value: papers.length },
              {
                label: '奠基之作',
                value: seminal,
                hint: '开创或定义方向',
              },
              { label: '方向', value: trackCount },
              {
                label: '年代跨度',
                value: `${Math.min(...years)}–${Math.max(...years)}`,
              },
            ]}
          />
        </div>
      </header>

      <div className="mt-8">
        <ClassicBrowser
          papers={papers}
          trackLabels={trackLabels}
          tierLabels={tierLabels}
        />
      </div>

      {/* 推荐阅读路径（PRD M2-7） */}
      <section className="mt-14">
        <h2 className="m-0 text-base font-semibold text-ink">推荐阅读路径</h2>
        <p className="mt-1.5 text-[13px] text-muted">
          按目标方向串起来的最短路径，建议按箭头顺序读。
        </p>

        <div className="mt-4 space-y-3">
          {READING_PATHS.map((path) => {
            const steps = path.steps
              .map((id) => ({ id, title: titles.get(id) }))
              .filter(
                (step): step is { id: string; title: string } =>
                  Boolean(step.title),
              );
            if (steps.length === 0) return null;

            return (
              <div
                key={path.goal}
                className="rounded-[var(--radius)] border border-line bg-surface p-4 shadow-card"
              >
                <p className="m-0 text-[13px] font-semibold text-ink">
                  {path.goal}
                </p>
                <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px]">
                  {steps.map((step, index) => (
                    <li key={step.id} className="flex items-center gap-1.5">
                      {index > 0 ? (
                        <span className="text-muted" aria-hidden="true">
                          →
                        </span>
                      ) : null}
                      <a
                        href={`#${step.id}`}
                        className="rounded-md bg-bg-soft px-2 py-0.5 text-ink-2 no-underline transition-colors hover:bg-brand-soft hover:text-brand-dark"
                      >
                        {step.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

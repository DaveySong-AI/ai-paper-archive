import { Mindmap } from '@/components/Mindmap';
import type { ReadingContent } from '@/lib/types';

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="m-0 flex items-center gap-2 text-base font-semibold text-ink"
    >
      <span
        className="h-4 w-1 rounded-full bg-brand"
        aria-hidden="true"
      />
      {children}
    </h2>
  );
}

/** 阅读器的结构化正文：摘要 / 创新点 / 方法 / 结论 / 思维导图 */
export function ReaderContent({ reading }: { reading: ReadingContent }) {
  return (
    <div className="space-y-9">
      {reading.status === 'draft' ? (
        <p className="m-0 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13px] text-ink-2">
          本节内容为自动生成草稿，尚未经人工审核，仅供参考。
        </p>
      ) : null}

      <section aria-labelledby="abstract">
        <SectionHeading id="abstract">摘要</SectionHeading>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
          {reading.abstract}
        </p>
      </section>

      <section aria-labelledby="key-points">
        <SectionHeading id="key-points">核心观点与创新点</SectionHeading>
        <ul className="mt-3 space-y-2.5">
          {reading.keyPoints.map((point, index) => (
            <li key={point} className="flex gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-[14.5px] leading-relaxed text-ink-2">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="method">
        <SectionHeading id="method">主要方法</SectionHeading>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="text-[13px] font-semibold text-ink">要解决的问题</dt>
            <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
              {reading.method.problem}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-ink">整体思路</dt>
            <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
              {reading.method.approach}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-ink">关键设计</dt>
            <dd className="m-0 mt-1">
              <ul className="m-0 space-y-2 pl-0">
                {reading.method.design.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink-2"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          {reading.method.setup ? (
            <div>
              <dt className="text-[13px] font-semibold text-ink">实验设置</dt>
              <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
                {reading.method.setup}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-labelledby="conclusion">
        <SectionHeading id="conclusion">结论与影响</SectionHeading>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="text-[13px] font-semibold text-ink">论文结论</dt>
            <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
              {reading.conclusion.findings}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-ink">对领域的影响</dt>
            <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
              {reading.conclusion.impact}
            </dd>
          </div>
          {reading.conclusion.limitations ? (
            <div>
              <dt className="text-[13px] font-semibold text-ink">局限</dt>
              <dd className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-2">
                {reading.conclusion.limitations}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-labelledby="mindmap">
        <SectionHeading id="mindmap">思维导图</SectionHeading>
        <div className="mt-3">
          <Mindmap root={reading.mindmap} />
        </div>
      </section>
    </div>
  );
}

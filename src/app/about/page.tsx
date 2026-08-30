import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllVolumes } from '@/lib/data';

export const metadata: Metadata = {
  title: '关于',
  description:
    'AI 论文档案库的数据来源、选篇规则、更新频率与免责声明。',
};

export default function AboutPage() {
  const volumes = getAllVolumes();

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
        关于本站
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        一个面向中文读者的 AI 论文阅读站：每周新论文按 ISO 周归档，
        领域经典论文人工策划，两者共用同一套结构化阅读器。
      </p>

      <section className="mt-10">
        <h2 className="m-0 text-base font-semibold text-ink">数据来源</h2>
        <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink-2">
          <p className="m-0">
            <strong className="font-semibold text-ink">每周档案库</strong>
            ：来自{' '}
            <a
              href="https://aihot.virxact.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              AI HOT
            </a>
            ，一个中文 AI 资讯与论文策展源（公开只读接口，无需密钥）。
            第一版只接这一个源，架构上按可插拔适配器设计，
            后续加入 arXiv、HuggingFace Daily Papers 等源时，
            只需新增一个适配器文件并登记一行。
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">经典论文库</strong>
            ：人工策划并长期维护，收录奠基之作、里程碑与必读文献，
            每篇标注核心贡献、为何必读，以及前置与相关论文构成的阅读脉络。
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-base font-semibold text-ink">选篇规则</h2>
        <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink-2">
          <p className="m-0">
            数据源每周的论文候选量在两百篇以上，其中进入编辑精选池的通常只有个位数。
            因此每卷按以下规则选篇：
          </p>
          <ol className="m-0 space-y-1.5 pl-5">
            <li>抓取窗口内全部条目；</li>
            <li>编辑精选条目无条件收录；</li>
            <li>按综合评分降序补足到目标篇数（默认 50 篇）；</li>
            <li>
              <strong className="font-semibold text-ink">
                最终列表严格按时间倒序展示，不按评分排序
              </strong>
              ——评分只用于筛选，不做热度排行榜。
            </li>
          </ol>
          <p className="m-0">
            每卷页脚都会如实披露：窗口内候选总数、本卷收录数、精选篇数与实际时间窗。
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-base font-semibold text-ink">时间口径</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          排序与按天归组一律使用「时间轴值」，而不是原文发布时间：
          原文发布后 72 小时内被收录的，按收录时间；超过 72 小时才收录的历史回填，
          归位到原发布日。这样官方博客、公众号、HuggingFace Daily
          这类「原文两三天前发、今天才抓到」的慢推信源不会被误判为过期。
          所有时间均换算为北京时间（UTC+8）展示。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-base font-semibold text-ink">解读内容的生产</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          阅读器里的摘要、核心观点、方法拆解与思维导图采用
          「生成草稿 + 人工审核」的方式入库：先生成结构化草稿，
          人工核对创新点、方法细节与数字结论后，才移入已审核目录对线上可见。
          未经核实的数字一律删除而非保留。
          尚未完成解读的论文会明确标注「深度解读待补充」，不会用占位内容充数。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-base font-semibold text-ink">更新频率</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          每周生成上一周的卷宗；经典论文库按需增量。
          当前已生成 {volumes.length} 个卷宗
          {volumes.length > 0
            ? `（${volumes[volumes.length - 1]?.isoWeek} ~ ${volumes[0]?.isoWeek}）`
            : ''}
          。抓取失败时会中止构建并保留上一卷宗，不会产出空卷。
        </p>
        <p className="mt-3">
          <Link href="/archive" className="text-sm text-brand hover:underline">
            查看卷宗索引 →
          </Link>
        </p>
      </section>

      <section className="mt-8 rounded-[var(--radius)] border border-line bg-surface-2 p-5">
        <h2 className="m-0 text-base font-semibold text-ink">免责声明</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
          站内只提供摘要与结构化解读，论文全文版权归原作者与出版方所有，
          所有「原文」入口一律跳转第三方站点。
          解读内容如有偏差，请以原文为准；发现错误欢迎指正。
        </p>
      </section>
    </div>
  );
}

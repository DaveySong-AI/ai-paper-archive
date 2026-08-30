import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface-2">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="m-0 text-sm font-semibold text-ink">AI 论文档案库</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            按 ISO 周归档的新论文、人工策划的领域经典，
            以及统一的结构化阅读器。
          </p>
        </div>

        <div>
          <p className="m-0 text-sm font-semibold text-ink">数据来源</p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-muted">
            <li>
              每周档案来自{' '}
              <a
                href="https://aihot.virxact.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                AI HOT
              </a>
              （中文 AI 资讯与论文策展源）
            </li>
            <li>经典论文库为人工策划，长期维护</li>
            <li>
              <Link
                href="/about"
                className="text-brand underline-offset-2 hover:underline"
              >
                选取规则与更新说明
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="m-0 text-sm font-semibold text-ink">版权与免责</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            站内只提供摘要与结构化解读，论文全文版权归原作者与出版方所有，
            阅读入口一律跳转第三方原文。解读内容如有偏差，以原文为准。
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-20 text-center sm:px-6">
      <p className="m-0 font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        找不到这个页面
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        链接可能已失效，或者论文尚未收录。可以试试从首页或卷宗索引重新进入。
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-brand-dark"
        >
          回到首页
        </Link>
        <Link
          href="/archive"
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
        >
          浏览卷宗
        </Link>
      </div>
    </div>
  );
}

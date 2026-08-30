'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/archive', label: '每周档案' },
  { href: '/classics', label: '经典论文' },
  { href: '/about', label: '关于' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-ink no-underline"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2.5"
              y="3.5"
              width="19"
              height="17"
              rx="3"
              stroke="var(--blue)"
              strokeWidth="1.6"
            />
            <path
              d="M6.5 8h11M6.5 12h11M6.5 16h6.5"
              stroke="var(--cyan)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight">
            AI 论文档案库
          </span>
        </Link>

        <nav aria-label="主导航" className="ml-auto">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'rounded-lg px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-brand-soft font-medium text-brand-dark'
                        : 'text-ink-2 hover:bg-bg-soft hover:text-ink',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // 路由切换时自动收起移动端抽屉
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // 点击抽屉外部区域关闭
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:h-16 sm:gap-6 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
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

        {/* 桌面端横向导航（≥640px 显示） */}
        <nav aria-label="主导航" className="ml-auto hidden sm:block">
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

        {/* 移动端汉堡按钮（<640px 显示） */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端下拉抽屉 */}
      {open ? (
        <div
          id="mobile-nav"
          className="mnav-panel border-b border-line bg-surface shadow-card sm:hidden"
        >
          <nav aria-label="移动端导航" className="mx-auto max-w-[1240px] px-4 py-2">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'block rounded-lg px-3 py-3 text-[15px] leading-none transition-colors',
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
      ) : null}
    </header>
  );
}

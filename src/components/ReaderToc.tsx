'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'abstract', label: '摘要' },
  { id: 'key-points', label: '核心观点' },
  { id: 'method', label: '主要方法' },
  { id: 'conclusion', label: '结论与影响' },
  { id: 'mindmap', label: '思维导图' },
] as const;

/** 阅读器目录：sticky 侧栏，滚动时高亮当前区块 */
export function ReaderToc() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const targets = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // 取文档顺序中最靠前的可见区块
        const first = SECTIONS.find((section) => visible.has(section.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="页面目录" className="text-[13px]">
      <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        目录
      </p>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'true' : undefined}
              className={[
                'block rounded-md border-l-2 py-1 pl-3 no-underline transition-colors',
                active === section.id
                  ? 'border-brand bg-brand-soft font-medium text-brand-dark'
                  : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
              ].join(' ')}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

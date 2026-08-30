import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI 论文档案库 · 每周新论文与领域经典',
    template: '%s · AI 论文档案库',
  },
  description:
    '按 ISO 周归档的 AI 论文清单、人工策划的领域经典论文库，以及带思维导图的结构化论文阅读器。',
  applicationName: 'AI 论文档案库',
  authors: [{ name: 'AI 论文档案库' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* JS 不可用时，滚动渐入的元素必须保持可见 */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-card"
        >
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

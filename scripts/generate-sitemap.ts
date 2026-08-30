#!/usr/bin/env tsx
/**
 * 生成站点地图（public/sitemap.xml）
 *
 * 与 RSS 一样走脚本生成：静态导出模式下产物放进 public/ 即可随站点发布，
 * 无需依赖路由处理器，也不受 output: 'export' 对路由的限制。
 *
 * 站点地址取自环境变量 NEXT_PUBLIC_SITE_URL。
 */

import fs from 'node:fs';
import path from 'node:path';

import { getAllRecordIds, getAllVolumes } from '../src/lib/data';

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
).replace(/\/$/, '');

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface Entry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function render(entries: Entry[]): string {
  const body = entries
    .map(
      (entry) => [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
  ].join('\n');
}

function main(): void {
  const today = new Date().toISOString().slice(0, 10);

  const entries: Entry[] = [
    {
      loc: `${BASE_URL}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      loc: `${BASE_URL}/archive/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${BASE_URL}/classics/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.9',
    },
    {
      loc: `${BASE_URL}/about/`,
      lastmod: today,
      changefreq: 'yearly',
      priority: '0.3',
    },
  ];

  for (const volume of getAllVolumes()) {
    entries.push({
      loc: `${BASE_URL}/archive/${volume.isoWeek}/`,
      lastmod: volume.endDate,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const id of getAllRecordIds()) {
    entries.push({
      loc: `${BASE_URL}/paper/${id}/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5',
    });
  }

  const outDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    `${render(entries)}\n`,
    'utf-8',
  );

  console.log(`站点地图已生成：public/sitemap.xml（${entries.length} 条 URL）`);
}

main();

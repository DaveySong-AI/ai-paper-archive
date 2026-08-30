#!/usr/bin/env tsx
/**
 * 生成 RSS 订阅源（public/feed.xml）
 *
 * 在 next build 之前运行，产物随静态站点一起发布。
 * 站点地址取自环境变量 NEXT_PUBLIC_SITE_URL。
 */

import fs from 'node:fs';
import path from 'node:path';

import { getAllVolumes, getWeeklyPaperIndex } from '../src/lib/data';
import { beijingDate } from '../src/lib/timeline';

/** 订阅源收录的最新论文条数 */
const FEED_SIZE = 30;

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

function main(): void {
  const volumes = getAllVolumes();
  if (volumes.length === 0) {
    console.warn('没有卷宗，跳过 RSS 生成');
    return;
  }

  // 跨卷取最近若干篇：当前周刚开始时也能给出有用的订阅内容
  const papers = [...getWeeklyPaperIndex().values()]
    .sort((a, b) => (a.timelineAt < b.timelineAt ? 1 : -1))
    .slice(0, FEED_SIZE);

  if (papers.length === 0) {
    console.warn('没有论文，跳过 RSS 生成');
    return;
  }
  const items = papers
    .map((paper) => {
      const link = `${BASE_URL}${paper.links.reader}/`;
      return [
        '    <item>',
        `      <title>${escapeXml(paper.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${new Date(paper.timelineAt).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(paper.summary)}</description>`,
        `      <category>${escapeXml(paper.source.name)}</category>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const latest = volumes[0];
  const latestDate = papers[0] ? beijingDate(papers[0].timelineAt) : '';
  const comment =
    `<!-- 最新卷宗 ${latest?.isoWeek ?? ''}，` +
    `本源收录最近 ${papers.length} 篇，最新一篇 ${latestDate} -->`;

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>AI 论文档案库</title>',
    `    <link>${BASE_URL}/</link>`,
    '    <description>按 ISO 周归档的 AI 论文清单，以及人工策划的领域经典论文。</description>',
    '    <language>zh-CN</language>',
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`,
    // 注释内容全部由程序生成，不含用户输入，无需转义
    `    ${comment}`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  const outDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'feed.xml'), `${xml}\n`, 'utf-8');

  console.log(
    `RSS 已生成：public/feed.xml（最新卷宗 ${latest?.isoWeek ?? ''}，${papers.length} 条）`,
  );
}

main();

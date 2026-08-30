/**
 * ClassicPaper → PaperRecord 归一化
 *
 * 经典论文库与每周档案库共用同一套记录模型，这样阅读器（/paper/[id]）只需一套组件。
 */

import type { ClassicPaper, PaperRecord } from './types';

/** 作者串拆成数组；长列表在展示层截断，这里保留完整信息 */
function splitAuthors(authors: string): string[] {
  return authors
    .split(/[,，]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

/**
 * 经典论文的时间轴值。
 *
 * 优先用 arXiv 编号推出年月（1706.03762 → 2017-06），否则退回年份的 1 月 1 日。
 * 经典论文只按年代浏览，不需要精确到日。
 */
export function classicTimelineAt(paper: ClassicPaper): string {
  const matched = paper.arxiv?.match(/^(\d{2})(\d{2})\./);
  if (matched) {
    const twoDigitYear = Number(matched[1]);
    const month = Number(matched[2]);
    const year = twoDigitYear >= 90 ? 1900 + twoDigitYear : 2000 + twoDigitYear;
    // 只在 arXiv 年份与标注年份大致吻合时采信，避免错误编号干扰排序
    if (month >= 1 && month <= 12 && Math.abs(year - paper.year) <= 2) {
      return `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;
    }
  }
  return `${paper.year}-01-01T00:00:00Z`;
}

export function classicToRecord(paper: ClassicPaper): PaperRecord {
  const arxivUrl = paper.arxiv
    ? `https://arxiv.org/abs/${paper.arxiv}`
    : null;

  return {
    id: paper.id,
    kind: 'classic',
    title: paper.titleZh,
    titleEn: paper.title,
    authors: splitAuthors(paper.authors),
    year: paper.year,
    venue: paper.venue,
    arxivId: paper.arxiv,
    source: {
      // 经典论文以发表 venue 作为来源展示
      name: paper.venue,
      family: 'lab',
      url: paper.url,
    },
    timelineAt: classicTimelineAt(paper),
    publishedAt: null,
    // 奠基之作在列表里带「精选」徽章
    curated: paper.tier === 'seminal',
    tags: [paper.track],
    links: {
      reader: `/paper/${paper.id}`,
      original: paper.url,
      detail: arxivUrl,
    },
    summary: paper.contribution,
  };
}

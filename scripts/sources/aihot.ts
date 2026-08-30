/**
 * AI HOT 数据源适配器
 *
 * 公开只读接口，无需密钥。字段契约见
 * ~/.workbuddy/skills/AI HOT/references/api.md。
 *
 * 时间口径必须与服务端一致：默认 by=timeline，即「发布后 72 小时内收录按收录时间，
 * 超过 72 小时的历史回填按发布时间」。本文件复用 src/lib/timeline 的同一套规则，
 * 保证本地收窄与服务端窗口口径一致。
 */

import { computeTimelineAt } from '../../src/lib/timeline';
import type { PaperRecord, SourceFamily } from '../../src/lib/types';
import { readCache, writeCache } from '../lib/cache';
import type { FetchOptions, SourceAdapter, TimeWindow } from './types';

const BASE_URL = 'https://aihot.virxact.com';
const USER_AGENT =
  'ai-paper-archive/0.1 (+https://github.com/DaveySong-AI/ai-paper-archive)';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 800;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_PAGES = 20;
const HOUR = 3_600_000;

export interface AihotRawItem {
  id: string;
  title: string;
  originalTitle: string | null;
  summary: string | null;
  source: { name: string };
  links: { aihot: string; original: string };
  publishedAt: string | null;
  discoveredAt: string;
  category: string | null;
  /** 0—100 综合评分，可能为 null */
  score: number | null;
  /** 是否属于编辑精选 */
  selected: boolean;
}

interface AihotResponse {
  items: AihotRawItem[];
  page: {
    count: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 带重试与 ETag 缓存的 JSON 请求 */
async function getJson(url: string): Promise<AihotResponse> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    if (attempt > 0) await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    try {
      const cached = readCache(url);
      const headers: Record<string, string> = {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      };
      if (cached?.etag) headers['If-None-Match'] = cached.etag;

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (res.status === 304 && cached) {
        return JSON.parse(cached.body) as AihotResponse;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const body = await res.text();
      writeCache(url, {
        etag: res.headers.get('etag'),
        body,
        savedAt: new Date().toISOString(),
      });
      return JSON.parse(body) as AihotResponse;
    } catch (error) {
      // JSON 解析失败不是网络抖动，重试没有意义
      if (error instanceof SyntaxError) throw error;
      lastError = error;
    }
  }

  throw new Error(
    `抓取失败（已重试 ${MAX_RETRIES} 次）：${url} — ${String(lastError)}`,
  );
}

/* ------------------------------ 文本处理工具 ------------------------------ */

/** 按字符（而非 UTF-16 码元）截断，避免把 emoji 或生僻字切坏 */
function truncateChars(text: string, max: number): string {
  const chars = [...text];
  if (chars.length <= max) return text;
  return `${chars.slice(0, max - 1).join('')}…`;
}

/** 去掉来源名尾部的括号说明，如「IT之家（RSS）」→「IT之家」 */
function cleanSourceName(name: string): string {
  const trimmed = name.trim();
  let out = trimmed;
  for (let i = 0; i < 2; i += 1) {
    const next = out.replace(/[（(][^（()）]*[）)]\s*$/, '').trim();
    if (next === out) break;
    out = next;
  }
  return out || trimmed;
}

const MEDIA_HINTS = [
  '量子位',
  '机器之心',
  '新智元',
  '36氪',
  '晚点',
  'IT之家',
  'Decoder',
  'Ars Technica',
  'TechCrunch',
  'MarkTechPost',
  'Artificial Intelligence News',
  '公众号',
  'VentureBeat',
  'The Verge',
  'Wired',
];

const LAB_HINTS = [
  'Research',
  'Blog',
  '官网',
  'Labs',
  'Laboratory',
  'arXiv',
  'Anthropic',
  'OpenAI',
  'Google',
  'DeepMind',
  'Microsoft',
  'NVIDIA',
  'Apple Machine Learning',
];

/** 按来源名判断徽章家族 */
export function familyOf(name: string): SourceFamily {
  const lower = name.toLowerCase();
  if (lower.startsWith('huggingface') || lower.includes('hugging face')) {
    return 'huggingface';
  }
  if (lower.startsWith('hacker news') || lower.includes('hackernews')) {
    return 'hackernews';
  }
  if (name.startsWith('X：') || name.startsWith('X:') || lower.startsWith('twitter')) {
    return 'x';
  }
  if (LAB_HINTS.some((hint) => name.includes(hint))) return 'lab';
  if (MEDIA_HINTS.some((hint) => name.includes(hint))) return 'media';
  return 'other';
}

/** 从原文链接里提取 arXiv 编号 */
function extractArxivId(url: string): string | null {
  const matched = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/);
  return matched?.[1] ?? null;
}

function buildSummary(raw: AihotRawItem): string {
  const text = raw.summary?.trim();
  if (text) return truncateChars(text, 200);
  const alt = raw.originalTitle?.trim();
  if (alt) return truncateChars(`原标题：${alt}`, 200);
  return '数据源未提供摘要，请查看原文。';
}

/* --------------------------------- 适配器 --------------------------------- */

export const aihot: SourceAdapter<AihotRawItem> = {
  id: 'aihot',
  displayName: 'AI HOT',
  supportsCuration: true,

  async fetch(window: TimeWindow, opts?: FetchOptions): Promise<AihotRawItem[]> {
    const spanMs = window.end.getTime() - window.start.getTime();
    // 服务端只承诺 24h 与 7d 两个窗口，更短的范围取 24h 后本地收窄
    const serverWindow = spanMs <= 24 * HOUR ? '24h' : '7d';
    const limit = Math.min(100, Math.max(1, opts?.maxItems ?? 100));

    const collected: AihotRawItem[] = [];
    const seen = new Set<string>();
    let cursor: string | null = null;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const url = new URL('/api/v1/items', BASE_URL);
      url.searchParams.set('mode', 'all');
      url.searchParams.set('category', 'paper');
      url.searchParams.set('window', serverWindow);
      url.searchParams.set('limit', String(limit));
      if (cursor) url.searchParams.set('cursor', cursor);

      const data = await getJson(url.toString());
      for (const item of data.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        collected.push(item);
      }

      if (opts?.maxItems && collected.length >= opts.maxItems) break;
      if (!data.page?.hasMore || !data.page?.nextCursor) break;
      cursor = data.page.nextCursor;
    }

    // 本地收窄：必须用时间轴值，直接用 publishedAt 会误删慢推信源
    const startMs = window.start.getTime();
    const endMs = window.end.getTime();
    return collected.filter((item) => {
      const t = Date.parse(
        computeTimelineAt(item.publishedAt, item.discoveredAt),
      );
      return Number.isFinite(t) && t >= startMs && t <= endMs;
    });
  },

  normalize(raw: AihotRawItem): PaperRecord {
    const original = raw.links?.original ?? raw.links?.aihot ?? '';
    const arxivId = extractArxivId(original);

    return {
      // 临时 id（数据源主键，保证去重与评分可回溯）；
      // 构建卷宗时会换成「卷宗-序号」形式，不对外暴露
      id: raw.id,
      kind: 'weekly',
      title: raw.title?.trim() || raw.originalTitle?.trim() || '(无标题)',
      titleEn: raw.originalTitle?.trim() || null,
      source: {
        name: cleanSourceName(raw.source?.name ?? '未标注来源'),
        family: familyOf(raw.source?.name ?? ''),
        url: null,
      },
      timelineAt: computeTimelineAt(raw.publishedAt, raw.discoveredAt),
      publishedAt: raw.publishedAt ?? null,
      curated: Boolean(raw.selected),
      tags: raw.category ? [raw.category] : [],
      links: {
        reader: `/paper/${raw.id}`,
        original,
        detail: raw.links?.aihot ?? null,
      },
      summary: buildSummary(raw),
      ...(arxivId ? { arxivId } : {}),
    };
  },

  scoreOf(raw: AihotRawItem): number | null {
    return typeof raw.score === 'number' ? raw.score : null;
  },
};

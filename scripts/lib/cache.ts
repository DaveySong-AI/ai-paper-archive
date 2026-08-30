/**
 * 抓取响应缓存（ETag）
 *
 * 按完整 URL 保存 ETag 与响应体，下次请求带 If-None-Match；
 * 304 时直接复用上次结果（见 docs/DATA-SOURCES.md「响应缓存」）。
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.join(process.cwd(), 'scripts', '.cache');

export interface CacheEntry {
  etag: string | null;
  body: string;
  savedAt: string;
}

function fileFor(url: string): string {
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 20);
  return path.join(CACHE_DIR, `${hash}.json`);
}

export function readCache(url: string): CacheEntry | null {
  const file = fileFor(url);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as CacheEntry;
  } catch {
    return null;
  }
}

export function writeCache(url: string, entry: CacheEntry): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(fileFor(url), JSON.stringify(entry), 'utf-8');
}

/**
 * 时间处理
 *
 * 时间轴值（timelineAt）的计算规则见 docs/DATA-SOURCES.md 第 3 节，切勿混用
 * publishedAt 与 discoveredAt，否则慢推信源（官方博客、公众号、HuggingFace Daily）
 * 会被整批误判为过期而丢弃。
 */

import type { DayGroup, PaperRecord } from './types';

const BEIJING_TZ = 'Asia/Shanghai';
const HOUR_72_MS = 72 * 60 * 60 * 1000;

/**
 * 计算时间轴值。
 *
 * - publishedAt 缺失            → discoveredAt
 * - discoveredAt - publishedAt > 72h → publishedAt（历史回填，归位到原发布日）
 * - 其余                        → discoveredAt
 */
export function computeTimelineAt(
  publishedAt: string | null | undefined,
  discoveredAt: string,
): string {
  if (!publishedAt) return discoveredAt;
  const p = Date.parse(publishedAt);
  const d = Date.parse(discoveredAt);
  if (Number.isNaN(p) || Number.isNaN(d)) return discoveredAt;
  if (d - p > HOUR_72_MS) return publishedAt;
  return discoveredAt;
}

/** 取北京时间下的日期分量（年/月/日/时/分） */
function parts(
  iso: string,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone: BEIJING_TZ,
    ...options,
  });
  const out: Record<string, string> = {};
  for (const part of fmt.formatToParts(new Date(iso))) {
    out[part.type] = part.value;
  }
  return out;
}

/** ISO 时间 → 北京时间日期，格式 YYYY-MM-DD */
export function beijingDate(iso: string): string {
  const p = parts(iso, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return `${p.year}-${p.month}-${p.day}`;
}

/** ISO 时间 → 北京时间时刻，格式 HH:mm */
export function beijingTime(iso: string): string {
  const p = parts(iso, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${p.hour}:${p.minute}`;
}

/** ISO 时间 → 北京时间完整字符串，格式 YYYY-MM-DD HH:mm */
export function beijingDateTime(iso: string): string {
  return `${beijingDate(iso)} ${beijingTime(iso)}`;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** YYYY-MM-DD → 星期几（如 周日） */
export function weekdayOfDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return WEEKDAYS[utc.getUTCDay()];
}

/** ISO 时间 → 北京时间星期几 */
export function beijingWeekday(iso: string): string {
  return weekdayOfDate(beijingDate(iso));
}

/** YYYY-MM-DD 加/减天数 */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return toYmd(utc);
}

function toYmd(dt: Date): string {
  const y = String(dt.getUTCFullYear()).padStart(4, '0');
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD → ISO 周标识，如 2026-W35 */
export function isoWeekOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // 周一=1 ... 周日=7
  const day = dt.getUTCDay() || 7;
  // 移到本周的周四，作为 ISO 周归属基准
  const thursday = new Date(dt);
  thursday.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** 取某个日期所在 ISO 周的周一与周日 */
export function weekBounds(date: string): { startDate: string; endDate: string } {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay() || 7;
  const monday = new Date(dt);
  monday.setUTCDate(dt.getUTCDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { startDate: toYmd(monday), endDate: toYmd(sunday) };
}

/** 相对时间，如「3 小时前」。用于卡片，客户端每分钟刷新。 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const diff = now - t;
  const abs = Math.abs(diff);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  let text: string;
  if (abs < MIN) text = '刚刚';
  else if (abs < HOUR) text = `${Math.floor(abs / MIN)} 分钟前`;
  else if (abs < DAY) text = `${Math.floor(abs / HOUR)} 小时前`;
  else if (abs < 30 * DAY) text = `${Math.floor(abs / DAY)} 天前`;
  else if (abs < 365 * DAY) text = `${Math.floor(abs / (30 * DAY))} 个月前`;
  else text = `${Math.floor(abs / (365 * DAY))} 年前`;

  if (diff < 0 && text.endsWith('前')) return `${text.slice(0, -1)}后`;
  return text;
}

/** 按北京时间把论文分天，返回倒序（最新一天在前）的分组 */
export function groupByDay(papers: readonly PaperRecord[]): DayGroup[] {
  const buckets = new Map<string, PaperRecord[]>();
  for (const paper of papers) {
    const date = beijingDate(paper.timelineAt);
    const bucket = buckets.get(date);
    if (bucket) bucket.push(paper);
    else buckets.set(date, [paper]);
  }
  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, list]) => ({ date, weekday: weekdayOfDate(date), papers: list }));
}

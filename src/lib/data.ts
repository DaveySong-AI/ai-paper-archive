/**
 * 数据加载（仅服务端 / 构建期）
 *
 * 所有页面都是构建期静态生成，运行时不读盘、不发请求。
 * 本文件只能在 Server Component 或 generateStaticParams 里使用。
 */

import fs from 'node:fs';
import path from 'node:path';

import { classicToRecord } from './classic';
import type {
  ClassicPaper,
  ClassicPapersFile,
  ClassicTier,
  ClassicTrack,
  PaperRecord,
  ReadingContent,
  VolumeSummary,
  WeeklyVolume,
} from './types';

const ROOT = process.cwd();
const VOLUMES_DIR = path.join(ROOT, 'volumes');
const DATA_DIR = path.join(ROOT, 'data');
const REVIEWED_DIR = path.join(ROOT, 'content', 'reviewed');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

function exists(file: string): boolean {
  return fs.existsSync(file);
}

/* ---------------------------------- 卷宗 ---------------------------------- */

let volumesCache: WeeklyVolume[] | null = null;

/** 全部卷宗，按 ISO 周倒序（最新在前） */
export function getAllVolumes(): WeeklyVolume[] {
  if (volumesCache) return volumesCache;
  if (!exists(VOLUMES_DIR)) {
    volumesCache = [];
    return volumesCache;
  }
  const files = fs
    .readdirSync(VOLUMES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();
  volumesCache = files
    .map((name) => readJson<WeeklyVolume>(path.join(VOLUMES_DIR, name)))
    .sort((a, b) => (a.isoWeek < b.isoWeek ? 1 : -1));
  return volumesCache;
}

export function getVolume(isoWeek: string): WeeklyVolume | null {
  return getAllVolumes().find((volume) => volume.isoWeek === isoWeek) ?? null;
}

/** 卷宗索引页用：不含论文 id 列表 */
export function getVolumeSummaries(): VolumeSummary[] {
  return getAllVolumes().map(({ papers: _papers, ...summary }) => summary);
}

/** 最新一卷 */
export function getLatestVolume(): WeeklyVolume | null {
  return getAllVolumes()[0] ?? null;
}

/**
 * 最新一卷「已结束」的卷宗（endDate 早于给定日期）。
 * 首页用它做主推，避免把刚开始、只收了一两篇的当周顶到最前面。
 */
export function getLatestClosedVolume(today: string): WeeklyVolume | null {
  return getAllVolumes().find((volume) => volume.endDate < today) ?? null;
}

/** 正在进行中的卷宗（endDate 不早于给定日期），可能为空 */
export function getOngoingVolume(today: string): WeeklyVolume | null {
  return getAllVolumes().find((volume) => volume.endDate >= today) ?? null;
}

/* ------------------------------ 每周论文记录 ------------------------------ */

let weeklyIndex: Map<string, PaperRecord> | null = null;

/** 每周论文的全量索引（data/weekly-papers.json） */
export function getWeeklyPaperIndex(): Map<string, PaperRecord> {
  if (weeklyIndex) return weeklyIndex;
  const file = path.join(DATA_DIR, 'weekly-papers.json');
  if (!exists(file)) {
    weeklyIndex = new Map();
    return weeklyIndex;
  }
  const data = readJson<{ papers: PaperRecord[] }>(file);
  weeklyIndex = new Map(data.papers.map((paper) => [paper.id, paper]));
  return weeklyIndex;
}

/** 取某一卷的完整论文记录，顺序与卷宗 papers 数组一致 */
export function getVolumePapers(volume: WeeklyVolume): PaperRecord[] {
  const index = getWeeklyPaperIndex();
  const list: PaperRecord[] = [];
  for (const id of volume.papers) {
    const paper = index.get(id);
    if (paper) list.push(paper);
  }
  return list;
}

/* -------------------------------- 经典论文 -------------------------------- */

let classicsCache: ClassicPapersFile | null = null;

export function getClassicPapersFile(): ClassicPapersFile {
  if (classicsCache) return classicsCache;
  classicsCache = readJson<ClassicPapersFile>(
    path.join(DATA_DIR, 'classic-papers.json'),
  );
  return classicsCache;
}

export function getClassicPapers(): ClassicPaper[] {
  return getClassicPapersFile().papers;
}

export function getClassicPaper(id: string): ClassicPaper | null {
  return getClassicPapers().find((paper) => paper.id === id) ?? null;
}

/** 方向 key → 中文名（取自数据文件 meta，避免硬编码漂移） */
export function getTrackLabels(): Record<ClassicTrack, string> {
  return getClassicPapersFile().meta.tracks;
}

/** 重要度 key → 中文名 */
export function getTierLabels(): Record<ClassicTier, string> {
  return getClassicPapersFile().meta.tiers;
}

/* ------------------------------ 统一记录查询 ------------------------------ */

/** 全站论文记录：每周论文 + 经典论文 */
export function getAllRecords(): PaperRecord[] {
  const weekly = [...getWeeklyPaperIndex().values()];
  const classics = getClassicPapers().map(classicToRecord);
  return [...weekly, ...classics];
}

export function getAllRecordIds(): string[] {
  return getAllRecords().map((paper) => paper.id);
}

export function getRecord(id: string): PaperRecord | null {
  const weekly = getWeeklyPaperIndex().get(id);
  if (weekly) return weekly;
  const classic = getClassicPaper(id);
  return classic ? classicToRecord(classic) : null;
}

/* ------------------------------ 阅读器内容 ------------------------------ */

/**
 * 读取已审核的阅读内容。
 * 只有 content/reviewed/ 下的内容对线上可见（AGENTS.md 硬约束 7）。
 */
export function getReadingContent(id: string): ReadingContent | null {
  const file = path.join(REVIEWED_DIR, `${id}.json`);
  if (!exists(file)) return null;
  return readJson<ReadingContent>(file);
}

/** 取记录并挂上已审核的阅读内容（若存在） */
export function getRecordWithReading(id: string): PaperRecord | null {
  const record = getRecord(id);
  if (!record) return null;
  const reading = getReadingContent(id);
  return reading ? { ...record, reading } : record;
}

/** 全站统计，首页用 */
export function getSiteStats(): {
  weeklyPapers: number;
  classicPapers: number;
  volumes: number;
  reviewedCount: number;
} {
  const reviewed = exists(REVIEWED_DIR)
    ? fs.readdirSync(REVIEWED_DIR).filter((name) => name.endsWith('.json')).length
    : 0;
  return {
    weeklyPapers: getWeeklyPaperIndex().size,
    classicPapers: getClassicPapers().length,
    volumes: getAllVolumes().length,
    reviewedCount: reviewed,
  };
}

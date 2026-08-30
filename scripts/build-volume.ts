#!/usr/bin/env tsx
/**
 * 抓取 → 归一 → 选篇 → 写卷宗
 *
 * 用法：
 *   npm run fetch:volume
 *   VOLUME_TARGET=60 npm run fetch:volume
 *
 * 可靠性约定（docs/DATA-SOURCES.md 第 5 节）：
 * 抓取失败或结果为空时中止构建，保留上一卷宗，绝不产出空卷。
 */

import fs from 'node:fs';
import path from 'node:path';

import { selectPapers } from '../src/lib/select';
import { beijingDate, isoWeekOf, weekBounds } from '../src/lib/timeline';
import type { PaperRecord, WeeklyVolume } from '../src/lib/types';
import { ADAPTERS } from './sources/registry';

const ROOT = process.cwd();
const VOLUMES_DIR = path.join(ROOT, 'volumes');
const DATA_DIR = path.join(ROOT, 'data');
const STORE_FILE = path.join(DATA_DIR, 'weekly-papers.json');

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const TARGET = Number(process.env.VOLUME_TARGET ?? 50);

interface Candidate {
  record: PaperRecord;
  score: number | null;
}

function loadStore(): Map<string, PaperRecord> {
  if (!fs.existsSync(STORE_FILE)) return new Map();
  const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as {
    papers: PaperRecord[];
  };
  return new Map(data.papers.map((paper) => [paper.id, paper]));
}

async function main(): Promise<void> {
  const now = Date.now();
  // 略微放宽窗口，避免服务端与本地时钟有几分钟偏差导致边缘条目被切掉
  const window = {
    start: new Date(now - 7 * DAY_MS - 6 * HOUR_MS),
    end: new Date(now),
  };

  console.log(
    `抓取窗口：${window.start.toISOString()} → ${window.end.toISOString()}`,
  );

  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  for (const adapter of ADAPTERS) {
    console.log(`  数据源 ${adapter.displayName}（${adapter.id}）`);
    const raws = await adapter.fetch(window);
    console.log(`    取得 ${raws.length} 条`);

    for (const raw of raws) {
      // 同一条目被多个源命中时去重，保留先抓到的那条
      if (seen.has(raw.id)) continue;
      seen.add(raw.id);
      candidates.push({
        record: adapter.normalize(raw),
        score: adapter.scoreOf?.(raw) ?? null,
      });
    }
  }

  if (candidates.length === 0) {
    console.error('未取得任何条目：中止构建，保留上一卷宗。');
    process.exit(1);
  }

  // 按 ISO 周（北京时间）分组
  const byWeek = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const week = isoWeekOf(beijingDate(candidate.record.timelineAt));
    const bucket = byWeek.get(week);
    if (bucket) bucket.push(candidate);
    else byWeek.set(week, [candidate]);
  }

  const today = beijingDate(new Date(now).toISOString());
  const weeks = [...byWeek.keys()].sort((a, b) => (a < b ? 1 : -1));
  const allNewPapers: PaperRecord[] = [];

  console.log(`\n覆盖 ${weeks.length} 个 ISO 周：${weeks.join(', ')}`);

  for (const week of weeks) {
    const pool = byWeek.get(week) ?? [];
    const chosen = selectPapers(
      pool.map((candidate) => ({
        id: candidate.record.id,
        curated: candidate.record.curated,
        score: candidate.score,
        timelineAt: candidate.record.timelineAt,
      })),
      TARGET,
    );

    const byRawId = new Map(
      pool.map((candidate) => [candidate.record.id, candidate]),
    );

    const papers: PaperRecord[] = [];
    const ids: string[] = [];
    chosen.forEach((item, index) => {
      const candidate = byRawId.get(item.id);
      if (!candidate) return;
      const seq = String(index + 1).padStart(2, '0');
      const finalId = `${week.toLowerCase()}-${seq}`;
      papers.push({
        ...candidate.record,
        id: finalId,
        links: { ...candidate.record.links, reader: `/paper/${finalId}` },
      });
      ids.push(finalId);
    });

    const dates = papers
      .map((paper) => beijingDate(paper.timelineAt))
      .sort();
    const firstDate = dates[0] ?? today;
    const bounds = weekBounds(firstDate);
    const inProgress = bounds.endDate >= today;

    const rule =
      `窗口内共 ${pool.length} 篇，按综合评分取前 ${papers.length} 篇` +
      `（含全部 ${papers.filter((p) => p.curated).length} 篇编辑精选），` +
      `按时间倒序展示，不按评分排序。` +
      (inProgress ? ' 本周尚未结束，数据仍在累积中。' : '');

    const volume: WeeklyVolume = {
      isoWeek: week,
      startDate: bounds.startDate,
      endDate: bounds.endDate,
      windowStart: firstDate,
      windowEnd: dates[dates.length - 1] ?? firstDate,
      poolTotal: pool.length,
      paperCount: papers.length,
      curatedCount: papers.filter((paper) => paper.curated).length,
      sourceCount: new Set(papers.map((paper) => paper.source.name)).size,
      selectionRule: rule,
      papers: ids,
    };

    fs.mkdirSync(VOLUMES_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(VOLUMES_DIR, `${week}.json`),
      `${JSON.stringify(volume, null, 2)}\n`,
      'utf-8',
    );

    allNewPapers.push(...papers);
    console.log(
      `  ${week}：池 ${pool.length} → 收录 ${papers.length}` +
        `（精选 ${volume.curatedCount}，来源 ${volume.sourceCount}）` +
        ` ${volume.windowStart} ~ ${volume.windowEnd}`,
    );
  }

  // 更新论文仓库：替换本次重算的各周条目，保留其余历史周
  const store = loadStore();
  for (const week of weeks) {
    const prefix = `${week.toLowerCase()}-`;
    for (const key of [...store.keys()]) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  }
  for (const paper of allNewPapers) store.set(paper.id, paper);

  const sorted = [...store.values()].sort((a, b) =>
    a.timelineAt < b.timelineAt ? 1 : -1,
  );
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    STORE_FILE,
    `${JSON.stringify({ papers: sorted }, null, 2)}\n`,
    'utf-8',
  );

  console.log(
    `\n完成：${weeks.length} 个卷宗，论文仓库共 ${sorted.length} 条 → ${path.relative(ROOT, STORE_FILE)}`,
  );
}

main().catch((error: unknown) => {
  console.error('构建卷宗失败：', error);
  process.exit(1);
});

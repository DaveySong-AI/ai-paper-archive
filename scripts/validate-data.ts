#!/usr/bin/env tsx
/**
 * 数据校验门禁
 *
 * 用法：npm run validate:data
 *
 * 校验范围（docs/ARCHITECTURE.md 第 9 节）：
 *   - data/classic-papers.json    每个条目
 *   - data/weekly-papers.json     每个条目
 *   - volumes/*.json              每个卷宗
 *   - content/reviewed/*.json     每个阅读内容
 * 外加跨文件一致性：卷宗引用的论文 id 必须存在，经典论文的引用不得悬空。
 */

import fs from 'node:fs';
import path from 'node:path';

import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ROOT = process.cwd();
const SCHEMA_DIR = path.join(ROOT, 'data', 'schemas');
const DATA_DIR = path.join(ROOT, 'data');
const VOLUMES_DIR = path.join(ROOT, 'volumes');
const REVIEWED_DIR = path.join(ROOT, 'content', 'reviewed');

const errors: string[] = [];
let checked = 0;

function fail(scope: string, message: string): void {
  errors.push(`${scope}: ${message}`);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

function listJson(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort();
}

function compile(schemaFile: string): ValidateFunction {
  const schema = readJson<Record<string, unknown>>(
    path.join(SCHEMA_DIR, schemaFile),
  );
  return ajv.compile(schema);
}

/**
 * Ajv 的 ValidateFunction 返回类型是 boolean | Promise<unknown>。
 * 本项目不使用异步 schema；遇到非布尔结果直接抛错，避免把 Promise 当成「通过」。
 * 用函数承接也能绕开类型守卫把被校验对象收窄成 never 的问题。
 */
function isValid(validate: ValidateFunction, data: unknown): boolean {
  const result = validate(data);
  if (typeof result === 'boolean') return result;
  throw new Error('schema 使用了异步校验，本门禁不支持');
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/* ------------------------------ 1. 经典论文 ------------------------------ */

const classicValidator = compile('classic-paper.schema.json');
const classicFile = readJson<{
  meta: { total: number };
  papers: { id: string; prerequisites: string[]; related: string[] }[];
}>(path.join(DATA_DIR, 'classic-papers.json'));

if (classicFile.papers.length !== classicFile.meta.total) {
  fail(
    'data/classic-papers.json',
    `meta.total=${classicFile.meta.total} 与实际条数 ${classicFile.papers.length} 不一致`,
  );
}

const classicIds = new Set<string>();
for (const paper of classicFile.papers) {
  checked += 1;
  const valid = isValid(classicValidator, paper);
  if (!valid) {
    for (const err of classicValidator.errors ?? []) {
      fail(
        `经典论文 ${paper.id}`,
        `${err.instancePath || '(根)'} ${err.message ?? ''}`,
      );
    }
  }
  if (classicIds.has(paper.id)) {
    fail('data/classic-papers.json', `id 重复：${paper.id}`);
  }
  classicIds.add(paper.id);
}

// 引用完整性：prerequisites 与 related 必须指向已收录的论文
for (const paper of classicFile.papers) {
  for (const ref of [...paper.prerequisites, ...paper.related]) {
    if (!classicIds.has(ref)) {
      fail(`经典论文 ${paper.id}`, `悬空引用 ${ref}`);
    }
  }
}

/* ------------------------------ 2. 每周论文 ------------------------------ */

const recordValidator = compile('paper-record.schema.json');
const weeklyFile = path.join(DATA_DIR, 'weekly-papers.json');
const weeklyIndex = new Map<string, { links: { original: string } }>();

if (fs.existsSync(weeklyFile)) {
  const store = readJson<{ papers: Record<string, unknown>[] }>(weeklyFile);
  for (const paper of store.papers) {
    checked += 1;
    const valid = isValid(recordValidator, paper);
    if (!valid) {
      const id = String((paper as { id?: unknown }).id ?? '(未知)');
      for (const err of recordValidator.errors ?? []) {
        fail(`每周论文 ${id}`, `${err.instancePath || '(根)'} ${err.message ?? ''}`);
      }
    }
    const record = paper as { id: string; links: { original: string } };
    weeklyIndex.set(record.id, record);
  }
}

/* ------------------------------- 3. 卷宗 ------------------------------- */

const volumeValidator = compile('weekly-volume.schema.json');
for (const name of listJson(VOLUMES_DIR)) {
  const file = path.join(VOLUMES_DIR, name);
  const volume = readJson<{
    isoWeek: string;
    poolTotal: number;
    paperCount: number;
    curatedCount: number;
    papers: string[];
  }>(file);
  checked += 1;

  const valid = isValid(volumeValidator, volume);
  if (!valid) {
    for (const err of volumeValidator.errors ?? []) {
      fail(`卷宗 ${name}`, `${err.instancePath || '(根)'} ${err.message ?? ''}`);
    }
  }

  if (volume.paperCount !== volume.papers.length) {
    fail(
      `卷宗 ${name}`,
      `paperCount=${volume.paperCount} 与 papers 长度 ${volume.papers.length} 不一致`,
    );
  }
  if (volume.paperCount > volume.poolTotal) {
    fail(
      `卷宗 ${name}`,
      `收录数 ${volume.paperCount} 超过窗口总数 ${volume.poolTotal}`,
    );
  }
  if (volume.curatedCount > volume.paperCount) {
    fail(
      `卷宗 ${name}`,
      `精选数 ${volume.curatedCount} 超过收录数 ${volume.paperCount}`,
    );
  }
  for (const id of volume.papers) {
    if (!weeklyIndex.has(id)) {
      fail(`卷宗 ${name}`, `引用了不存在的论文 id：${id}`);
    }
  }
}

/* ---------------------------- 4. 阅读器内容 ---------------------------- */

// compile() 已按 $id 注册过该 schema，这里直接按 URI 取子定义
const readingValidator = ajv.getSchema(
  'https://ai-paper-archive/schemas/paper-record.schema.json#/definitions/ReadingContent',
);
if (!readingValidator) {
  fail('schema', '未能取得 ReadingContent 定义');
}

for (const name of listJson(REVIEWED_DIR)) {
  const file = path.join(REVIEWED_DIR, name);
  const content = readJson<Record<string, unknown>>(file);
  checked += 1;
  const valid = readingValidator ? isValid(readingValidator, content) : false;
  if (!valid && readingValidator) {
    for (const err of readingValidator.errors ?? []) {
      fail(`阅读内容 ${name}`, `${err.instancePath || '(根)'} ${err.message ?? ''}`);
    }
  }
  if (content.status !== 'reviewed') {
    fail(`阅读内容 ${name}`, 'content/reviewed/ 下的内容 status 必须为 reviewed');
  }
}

/* -------------------------------- 结果 -------------------------------- */

if (errors.length > 0) {
  console.error(`数据校验未通过：${errors.length} 个问题\n`);
  for (const message of errors.slice(0, 60)) {
    console.error(`  ✗ ${message}`);
  }
  if (errors.length > 60) {
    console.error(`  ... 另有 ${errors.length - 60} 条`);
  }
  process.exit(1);
}

console.log(`数据校验通过：${checked} 个对象，0 个问题`);

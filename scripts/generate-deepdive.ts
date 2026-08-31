#!/usr/bin/env tsx
/**
 * 自动生成每周新论文的「深度解读」（ReadingContent）
 *
 * 把 AI HOT 每周新论文（缺 content/reviewed/<id>.json 者）交给 LLM，
 * 生成符合 ReadingContent Schema 的结构化解读（摘要/创新点/方法/结论/思维导图），
 * 写入 content/reviewed/，随刷新流水线一并构建发布。
 *
 * 设计要点：
 * - 默认只处理「最近两周」的卷宗论文，控制成本；可用 --all / --id 调整。
 * - 接口走 OpenAI 兼容协议，默认对接阿里云百炼（DashScope）的 Qwen 模型：
 *     DEEP_DIVE_API_BASE 默认 https://dashscope.aliyuncs.com/compatible-mode/v1
 *     DEEP_DIVE_MODEL   默认 qwen-plus
 *   （任意 OpenAI 兼容服务均可，只需改上述两个环境变量，例如 OpenAI 官方 base）
 * - 无 API key 时优雅跳过（退出码 0），不影响其它流程。
 * - 生成后做长度裁剪 + ajv 校验；校验不过最多重试 1 次，仍不过则跳过该篇并告警，
 *   绝不让坏数据进入 content/reviewed/（那里是线上可见内容）。
 *
 * 用法：
 *   npm run generate:deepdive                # 处理最近两周缺失者
 *   npm run generate:deepdive -- --all       # 处理全部缺失者（回填用）
 *   npm run generate:deepdive -- --id 2026-w36-01
 *   npm run generate:deepdive -- --dry-run   # 不写盘，仅打印计划
 *   npm run generate:deepdive -- --force     # 已存在也重新生成
 *   npm run generate:deepdive -- --mock      # 不调接口，用本地模板验证整条流水线
 */

import fs from 'node:fs';
import path from 'node:path';

import Ajv, { type ValidateFunction } from 'ajv';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const VOLUMES_DIR = path.join(ROOT, 'volumes');
const REVIEWED_DIR = path.join(ROOT, 'content', 'reviewed');
const SCHEMA_DIR = path.join(DATA_DIR, 'schemas');

function resolveApiKey(): string {
  if (process.env.DEEP_DIVE_API_KEY) return process.env.DEEP_DIVE_API_KEY;
  const file = path.join(process.env.HOME ?? '', '.workbuddy', 'credentials', 'deepdive_key');
  if (fs.existsSync(file)) {
    const v = fs.readFileSync(file, 'utf-8').trim();
    if (v) return v;
  }
  return '';
}

const API_KEY = resolveApiKey();
// 用 || 而非 ??：workflow 在 secret 未设置时会传入空字符串，必须回退默认值
const API_BASE =
  process.env.DEEP_DIVE_API_BASE ||
  'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = process.env.DEEP_DIVE_MODEL || 'qwen-plus';

interface PaperRecordLite {
  id: string;
  title: string;
  titleEn?: string | null;
  summary: string;
  tags: string[];
  source: { name: string; url?: string | null };
  links: { original: string };
}

/* ------------------------------- 参数解析 ------------------------------- */

const argv = process.argv.slice(2);
const FLAGS = {
  all: argv.includes('--all'),
  dryRun: argv.includes('--dry-run'),
  force: argv.includes('--force'),
  mock: argv.includes('--mock'),
  id: (() => {
    const i = argv.indexOf('--id');
    return i >= 0 ? argv[i + 1] : null;
  })(),
};

/* ------------------------------- 工具函数 ------------------------------- */

function clampStr(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function clampArr(value: unknown, min: number, max: number): string[] {
  const arr = Array.isArray(value) ? value.map((x) => String(x).trim()).filter(Boolean) : [];
  const truncated = arr.slice(0, max);
  if (truncated.length < min) return arr.slice(0, Math.max(truncated.length, 0));
  return truncated;
}

function uniqIds(node: { id?: string }, prefix: string, counter: { n: number }): string {
  counter.n += 1;
  node.id = `${prefix}${counter.n}`;
  const children = (node as { children?: unknown[] }).children;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child && typeof child === 'object') uniqIds(child as never, `${prefix}${counter.n}-`, counter);
    }
  }
  return node.id;
}

const NODE_TYPES = ['root', 'problem', 'method', 'contribution', 'result', 'impact'] as const;

function sanitizeMindmap(raw: unknown): {
  id: string;
  label: string;
  type: string;
  note: string | null;
  children: unknown[];
} {
  const node = (raw ?? {}) as Record<string, unknown>;
  const counter = { n: 0 };
  const walk = (n: Record<string, unknown>): Record<string, unknown> => {
    const type = NODE_TYPES.includes(n.type as never) ? (n.type as string) : 'method';
    const label = clampStr(n.label, 12) || '节点';
    const note = n.note == null ? null : clampStr(n.note, 60);
    const kids = Array.isArray(n.children)
      ? (n.children as Record<string, unknown>[]).map(walk).slice(0, 8)
      : [];
    return { type, label, note, children: kids };
  };
  const root = walk(node);
  uniqIds(root as never, 'n', counter);
  return root as never;
}

/**
 * 把 LLM 原始输出收敛成符合 ReadingContent 的结构。
 * 裁剪长度、补齐必填、重排思维导图 id，保证后续 ajv 校验尽量通过。
 */
function sanitize(raw: Record<string, unknown>): Record<string, unknown> {
  const abstract = clampStr(raw.abstract, 200);
  const keyPoints = clampArr(raw.keyPoints, 3, 5);
  const method = (raw.method ?? {}) as Record<string, unknown>;
  const conclusion = (raw.conclusion ?? {}) as Record<string, unknown>;

  const methodObj = {
    problem: clampStr(method.problem, 400) || '原文未明确说明。',
    approach: clampStr(method.approach, 400) || '见原文方法部分。',
    design: clampArr(method.design, 2, 5),
    setup: method.setup == null ? null : clampStr(method.setup, 400),
  };
  if (methodObj.design.length < 2) methodObj.design = ['核心设计详见原文。', '方法要点见论文正文。'];

  const conclusionObj = {
    findings: clampStr(conclusion.findings, 400) || '见原文结论部分。',
    impact: clampStr(conclusion.impact, 400) || '对所在方向具有参考意义。',
    limitations: conclusion.limitations == null ? null : clampStr(conclusion.limitations, 400),
  };

  return {
    abstract,
    keyPoints,
    method: methodObj,
    conclusion: conclusionObj,
    mindmap: sanitizeMindmap(raw.mindmap),
    status: 'reviewed',
    generatedBy: 'llm',
    reviewedAt: null,
  };
}

/* ------------------------------- 校验器 ------------------------------- */

const ajv = new Ajv({ allErrors: true, strict: false });
const schema = JSON.parse(
  fs.readFileSync(path.join(SCHEMA_DIR, 'paper-record.schema.json'), 'utf-8'),
);
ajv.addSchema(schema, 'paper-record');
const readingValidator: ValidateFunction = ajv.compile({
  $ref: 'paper-record#/definitions/ReadingContent',
});

function isValidReading(data: unknown): boolean {
  const r = readingValidator(data);
  return typeof r === 'boolean' ? r : false;
}

/* ------------------------------- 数据读取 ------------------------------- */

function readWeeklyRecords(): Map<string, PaperRecordLite> {
  const file = path.join(DATA_DIR, 'weekly-papers.json');
  if (!fs.existsSync(file)) return new Map();
  const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as { papers: PaperRecordLite[] };
  return new Map(data.papers.map((p) => [p.id, p]));
}

function pickTargetIds(records: Map<string, PaperRecordLite>): string[] {
  if (FLAGS.id) return records.has(FLAGS.id) ? [FLAGS.id] : [];
  if (FLAGS.all) return [...records.keys()];

  // 默认：最近两周卷宗的论文
  const weeks = fs
    .existsSync(VOLUMES_DIR)
    ? fs
        .readdirSync(VOLUMES_DIR)
        .filter((n) => n.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 2)
    : [];
  const ids = new Set<string>();
  for (const name of weeks) {
    const vol = JSON.parse(fs.readFileSync(path.join(VOLUMES_DIR, name), 'utf-8')) as {
      papers: string[];
    };
    for (const id of vol.papers) ids.add(id);
  }
  return [...ids].filter((id) => records.has(id));
}

function existingReviewed(): Set<string> {
  if (!fs.existsSync(REVIEWED_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(REVIEWED_DIR)
      .filter((n) => n.endsWith('.json'))
      .map((n) => n.replace(/\.json$/, '')),
  );
}

/* ------------------------------- 模型调用 ------------------------------- */

const SYSTEM_PROMPT = [
  '你是严谨的 AI 论文解读助手。根据用户提供的论文信息，输出一份中文结构化解读。',
  '必须只输出一个 JSON 对象，不要任何解释性文字、不要 markdown 代码块。',
  '字段与约束：',
  'abstract: 中文摘要，≤200 字。',
  'keyPoints: 3-5 条核心观点/创新点，每条简洁。',
  'method: { problem: 要解决的问题, approach: 整体思路, design: 2-5 条关键设计, setup: 实验设置(可空) }。',
  'conclusion: { findings: 论文结论, impact: 对领域影响, limitations: 局限(可空) }。',
  'mindmap: 思维导图，根节点 type="root" label 为论文简称；下设 2-6 个子节点，',
  '  type 取 problem/method/contribution/result/impact，label ≤12 字，note ≤60 字，可再嵌套一层叶子。',
  '所有内容须基于论文信息，不得编造具体数字；不确定的写「详见原文」。',
].join('\n');

function buildUserPrompt(p: PaperRecordLite): string {
  return [
    `标题（中）：${p.title}`,
    p.titleEn ? `标题（英）：${p.titleEn}` : '',
    `来源：${p.source.name}`,
    `标签：${p.tags.join('、') || '无'}`,
    `原文链接：${p.links.original}`,
    `摘要/简介：${p.summary}`,
    '',
    '请按系统指令输出 JSON。',
  ]
    .filter(Boolean)
    .join('\n');
}

async function callModel(p: PaperRecordLite): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(p) },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('API 返回为空');
  return JSON.parse(content) as Record<string, unknown>;
}

/**
 * 带指数退避重试的模型调用，吸收 DashScope 等云端的瞬时 429 / 网络抖动，
 * 避免并发时少量失败直接丢论文（失败仍非致命，最终会在 generateFor 处跳过）。
 */
async function callModelWithRetry(p: PaperRecordLite, attempt = 0): Promise<Record<string, unknown>> {
  try {
    return await callModel(p);
  } catch (err) {
    if (attempt >= 3) throw err;
    const backoff = 600 * Math.pow(2, attempt);
    console.warn(`    · ${p.id} 调用失败，第 ${attempt + 1} 次重试（${backoff}ms 后）：${(err as Error).message}`);
    await new Promise((r) => setTimeout(r, backoff));
    return callModelWithRetry(p, attempt + 1);
  }
}

/** Mock：不调接口，用论文标题填一份最小合法模板，用于本地验证整条流水线 */
function mockGenerate(p: PaperRecordLite): Record<string, unknown> {
  const name = p.title.slice(0, 10);
  return {
    abstract: `${p.title}：本文围绕相关方向提出新方法，摘要详见原文（自动生成占位）。`,
    keyPoints: [`方向：${p.tags[0] ?? '通用'}`, '提出新的技术路线', '在对应任务上验证有效'],
    method: {
      problem: '现有方法存在瓶颈，需要更优方案。',
      approach: '本文给出一种系统化改进思路。',
      design: ['关键设计一', '关键设计二'],
      setup: null,
    },
    conclusion: {
      findings: '实验显示方法可行。',
      impact: '对所在方向有参考价值。',
      limitations: null,
    },
    mindmap: {
      id: 'root',
      label: name,
      type: 'root',
      note: '自动生成',
      children: [
        { id: 'p', label: '问题', type: 'problem', note: '现有瓶颈' },
        { id: 'm', label: '方法', type: 'method', note: '本文方案' },
        { id: 'r', label: '结果', type: 'result', note: '验证有效' },
      ],
    },
  };
}

/* ------------------------------- 单篇处理 ------------------------------- */

async function generateFor(p: PaperRecordLite): Promise<boolean> {
  let raw: Record<string, unknown>;
  if (FLAGS.mock) {
    raw = mockGenerate(p);
  } else {
    try {
      raw = await callModelWithRetry(p);
    } catch (err) {
      console.error(`    ✗ ${p.id} 调用失败：${(err as Error).message}`);
      return false;
    }
  }

  let content = sanitize(raw);
  if (!isValidReading(content) && !FLAGS.mock) {
    // 校验不过再让模型修正一次结构
    try {
      raw = await callModelWithRetry(p);
      content = sanitize(raw);
    } catch {
      /* ignore */
    }
  }

  if (!isValidReading(content)) {
    const errs = readingValidator.errors
      ?.map((e) => `${e.instancePath || '(根)'} ${e.message}`)
      .join('; ');
    console.error(`    ✗ ${p.id} 校验未通过，已跳过：${errs ?? '未知'}`);
    return false;
  }

  if (FLAGS.dryRun) {
    console.log(`    · ${p.id} 通过校验（dry-run，不写盘）`);
    return true;
  }

  fs.mkdirSync(REVIEWED_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REVIEWED_DIR, `${p.id}.json`),
    JSON.stringify(content, null, 2) + '\n',
    'utf-8',
  );
  console.log(`    ✓ ${p.id} 已写入 content/reviewed/${p.id}.json`);
  return true;
}

/* ------------------------------- 主流程 ------------------------------- */

async function main(): Promise<void> {
  const records = readWeeklyRecords();
  const targets = pickTargetIds(records);
  const done = existingReviewed();

  const pending = FLAGS.force
    ? targets
    : targets.filter((id) => !done.has(id));

  if (!API_KEY && !FLAGS.mock) {
    console.log('⚠ 未设置 DEEP_DIVE_API_KEY，跳过深度解读生成（不影响其它流程）。');
    console.log('  本地：export DEEP_DIVE_API_KEY=sk-xxx  或写入 ~/.workbuddy/credentials/deepdive_key');
    console.log('  CI ：在仓库 Settings → Secrets 添加 DEEP_DIVE_API_KEY（及可选 DEEP_DIVE_API_BASE / DEEP_DIVE_MODEL）');
    return;
  }

  console.log(`=== 深度解读生成 ===`);
  console.log(`  目标卷宗范围：${FLAGS.all ? '全部' : FLAGS.id ? `单篇 ${FLAGS.id}` : '最近两周'}`);
  console.log(`  候选论文：${targets.length} 篇，待生成：${pending.length} 篇${FLAGS.force ? '（含已存在）' : ''}`);
  if (FLAGS.dryRun) console.log('  [dry-run] 仅校验不写盘');

  const concurrency = Math.max(1, Number(process.env.DEEP_DIVE_CONCURRENCY) || 6);
  console.log(`  并发数：${concurrency}`);
  let ok = 0;
  let fail = 0;
  let index = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, pending.length) },
    async () => {
      while (index < pending.length) {
        const cur = index++;
        const record = records.get(pending[cur]);
        if (!record) continue;
        const success = await generateFor(record);
        if (success) ok += 1;
        else fail += 1;
      }
    },
  );
  await Promise.all(workers);

  console.log(`=== 完成：成功 ${ok} 篇，跳过/失败 ${fail} 篇 ===`);
}

main().catch((err) => {
  console.error('深度解读生成异常：', err);
  process.exit(0); // 非致命：不让它阻断整条刷新流水线
});

/**
 * 统一数据模型
 *
 * 本文件与 data/schemas/*.json 必须保持同步 —— 改任一侧都要改另一侧（见 AGENTS.md 硬约束 3）。
 */

/** 论文来源：每周档案库（weekly）或经典论文库（classic） */
export type PaperKind = 'weekly' | 'classic';

/** 来源家族，决定徽章配色 */
export type SourceFamily =
  | 'x'
  | 'huggingface'
  | 'hackernews'
  | 'lab'
  | 'media'
  | (string & {});

export interface PaperSource {
  /** 显示名，用于徽章文本 */
  name: string;
  /** 家族标识，决定徽章配色 */
  family: SourceFamily;
  url?: string | null;
}

/** 思维导图节点类型 */
export type MindmapNodeType =
  | 'root'
  | 'problem'
  | 'method'
  | 'contribution'
  | 'result'
  | 'impact';

export interface MindmapNode {
  id: string;
  /** 节点文字，上限 12 字（与 Schema 一致） */
  label: string;
  type: MindmapNodeType;
  /** 点击节点时展示的说明，上限 60 字 */
  note?: string | null;
  children?: MindmapNode[];
}

export interface ReadingContent {
  /** ≤200 字中文摘要 */
  abstract: string;
  /** 3—5 条核心观点 / 创新点 */
  keyPoints: string[];
  method: {
    /** 要解决什么问题 */
    problem: string;
    /** 整体思路 */
    approach: string;
    /** 关键设计，2—5 条 */
    design: string[];
    /** 实验设置 */
    setup?: string | null;
  };
  conclusion: {
    /** 论文自身的结论 */
    findings: string;
    /** 对领域的影响 */
    impact: string;
    limitations?: string | null;
  };
  mindmap: MindmapNode;
  status: 'draft' | 'reviewed';
  generatedBy?: 'llm' | 'manual';
  reviewedAt?: string | null;
}

export interface PaperLinks {
  /** 站内阅读器路径，如 /paper/xxx */
  reader: string;
  /** 第三方原文，必填 */
  original: string;
  /** 数据源详情页 / 中文阅读页 */
  detail?: string | null;
}

/** 站内所有论文的统一记录模型 */
export interface PaperRecord {
  /** 全局唯一 slug */
  id: string;
  kind: PaperKind;
  /** 中文展示主标题 */
  title: string;
  titleEn?: string | null;
  authors?: string[];
  year?: number | null;
  venue?: string | null;
  /** 形如 1706.03762 */
  arxivId?: string | null;
  source: PaperSource;
  /** ISO 8601，排序与时间轴归位依据（不是 publishedAt） */
  timelineAt: string;
  /** 第三方原文发布时间，可能缺失 */
  publishedAt?: string | null;
  /** 是否进入编辑精选 */
  curated: boolean;
  tags: string[];
  links: PaperLinks;
  /** ≤200 字中文摘要 */
  summary: string;
  reading?: ReadingContent;
}

/** 每周卷宗（PRD 3.3） */
export interface WeeklyVolume {
  /** 如 2026-W35 */
  isoWeek: string;
  /** 周一，YYYY-MM-DD */
  startDate: string;
  /** 周日，YYYY-MM-DD */
  endDate: string;
  /** 实际数据时间窗起点 */
  windowStart: string;
  /** 实际数据时间窗终点 */
  windowEnd: string;
  /** 窗口内数据源条目总数 */
  poolTotal: number;
  /** 本卷收录数 */
  paperCount: number;
  /** 其中精选数 */
  curatedCount: number;
  sourceCount: number;
  /** 人类可读的选取规则说明 */
  selectionRule: string;
  /** PaperRecord.id 的有序数组（时间倒序） */
  papers: string[];
}

/** 卷宗摘要，用于索引页（不含论文列表） */
export type VolumeSummary = Omit<WeeklyVolume, 'papers'>;

/** 经典论文库条目（data/classic-papers.json 的原始形状） */
export type ClassicTrack =
  | 'foundation'
  | 'architecture'
  | 'pretrain'
  | 'scaling'
  | 'alignment'
  | 'reasoning'
  | 'efficiency'
  | 'generation'
  | 'vision'
  | 'rl-agent'
  | 'interpretability';

export type ClassicTier = 'seminal' | 'milestone' | 'essential';

export interface ClassicPaper {
  id: string;
  /** 英文原题 */
  title: string;
  /** 中文标题 */
  titleZh: string;
  /** 作者串，长列表可用 et al. */
  authors: string;
  year: number;
  venue: string;
  arxiv: string | null;
  url: string;
  track: ClassicTrack;
  tier: ClassicTier;
  /** 一句话核心贡献 */
  contribution: string;
  whyItMatters: string;
  /** 前置论文 id */
  prerequisites: string[];
  /** 相关论文 id */
  related: string[];
}

/** data/classic-papers.json 的整体形状 */
export interface ClassicPapersFile {
  meta: {
    version: string;
    updatedAt: string;
    total: number;
    tracks: Record<ClassicTrack, string>;
    tiers: Record<ClassicTier, string>;
  };
  papers: ClassicPaper[];
}

/** 按天分组，用于时间轴 */
export interface DayGroup {
  /** YYYY-MM-DD */
  date: string;
  /** 如 周日 */
  weekday: string;
  papers: PaperRecord[];
}

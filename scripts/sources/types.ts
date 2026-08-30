/**
 * 数据源适配器接口
 *
 * 新增数据源 = 新增一个实现本接口的文件 + 在 registry.ts 登记一行。
 * 页面、数据模型、构建流程均无需改动（见 docs/DATA-SOURCES.md）。
 */

import type { PaperRecord } from '../../src/lib/types';

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface FetchOptions {
  /** 最多抓取多少条原始条目 */
  maxItems?: number;
}

export interface SourceAdapter<TRaw> {
  /** 数据源标识，写入 PaperRecord.source.family */
  id: string;
  /** 展示名 */
  displayName: string;
  /** 该源是否提供「编辑精选」标记 */
  supportsCuration: boolean;

  /**
   * 抓取指定时间窗内的原始条目。
   * 必须处理分页，直到 hasMore=false 或达到 maxItems。
   */
  fetch(window: TimeWindow, opts?: FetchOptions): Promise<TRaw[]>;

  /** 把原始条目归一为统一模型 */
  normalize(raw: TRaw): PaperRecord;

  /**
   * 综合评分（可选）。
   * 仅用于选篇筛选，绝不用于展示排序。数据源不提供时返回 null。
   */
  scoreOf?: (raw: TRaw) => number | null;
}

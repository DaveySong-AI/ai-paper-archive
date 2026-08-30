# 数据源接入规范

> 第一版只接 AI HOT，但架构必须让「加第二个源」变成加一个文件的事。

## 1. 适配器接口

每个数据源在 `scripts/sources/` 下实现一个文件，导出符合以下接口的适配器：

```ts
export interface SourceAdapter {
  /** 数据源标识，写入 PaperRecord.source.family */
  id: string;
  /** 展示名 */
  displayName: string;

  /**
   * 抓取指定时间窗内的原始条目。
   * 必须处理分页，直到 hasMore=false 或达到 maxItems。
   */
  fetch(window: { start: Date; end: Date }, opts?: { maxItems?: number }):
    Promise<RawItem[]>;

  /** 把原始条目归一为统一模型 */
  normalize(raw: RawItem): PaperRecord;

  /** 该源是否提供「编辑精选」标记 */
  supportsCuration: boolean;
}
```

`RawItem` 由各源自行定义，适配器内部消化差异，对外只暴露 `PaperRecord`。

## 2. 登记

在 `scripts/sources/registry.ts` 中登记：

```ts
import { aihot } from './aihot';

export const ADAPTERS: SourceAdapter[] = [aihot];

export function getAdapter(id: string): SourceAdapter {
  const a = ADAPTERS.find(x => x.id === id);
  if (!a) throw new Error(`未登记的数据源: ${id}`);
  return a;
}
```

新增数据源 = 新增一个适配器文件 + 在数组里加一行。页面、数据模型、构建流程均无需改动。

## 3. 已接入：AI HOT

| 项 | 说明 |
|---|---|
| 标识 | `aihot` |
| 类型 | 中文 AI 资讯与论文策展源，公开只读接口，无需密钥 |
| 提供精选标记 | 是（`selected` 字段） |
| 需注意 | 窗口内条目量大（实测单周论文类 200+），精选池通常只有个位数 |

### 时间口径（必须严格遵守）

AI HOT 有**两个**时间戳，混用会导致慢推信源（官方博客、公众号、HuggingFace Daily）被误删：

1. `publishedAt` — 第三方原文发布时间，可能为 `null`
2. `discoveredAt` — 收录时间

**时间轴值**的计算规则：

```
若 publishedAt 为空                          → 取 discoveredAt
若 discoveredAt - publishedAt > 72 小时      → 取 publishedAt（历史回填，归位原发布日）
其余情况                                      → 取 discoveredAt
```

排序与按天分组都必须基于这个时间轴值，不能直接拿 `publishedAt`。

### 收录策略

```
1. 抓取窗口内全部条目（分页取完）
2. 取全部「编辑精选」条目 —— 无条件收录
3. 按综合评分降序补足到目标篇数（默认 50）
4. 最终列表按时间轴值降序展示 —— 不按评分排序
5. 卷宗页脚如实披露：窗口总数 / 收录数 / 精选数 / 选取规则
```

**不得**把结果重排成热度排行榜。评分只用于筛选，不用于展示顺序。

### 署名与合规

- 保留 AI HOT 的署名信息，卷宗与论文页均需标注数据来源。
- 第三方原文版权归原作者所有，站内只做摘要与解读，原文一律跳转。
- 摘要为数据源提供，最长截断至 200 字。

## 4. 规划中的数据源

按优先级排布，接入时各自新增一个适配器：

| 源 | 标识 | 说明 |
|---|---|---|
| arXiv API | `arxiv` | 按 `cs.AI / cs.CL / cs.CV / cs.LG` 分类抓取，提供官方摘要与 PDF 链接 |
| HuggingFace Daily Papers | `hfpapers` | 社区热度论文，自带摘要与讨论 |
| Papers with Code | `pwc` | 附带代码与 SOTA 榜单信息 |
| Semantic Scholar | `semanticscholar` | 引用数、影响力数据，可反哺评分 |

## 5. 抓取可靠性

| 场景 | 处理 |
|---|---|
| 接口失败或超时 | 重试 2 次（指数退避）；仍失败则**中止本次构建**，保留上一卷宗，绝不产出空卷 |
| 部分条目字段缺失 | 按 `PaperRecord` 的最小必填集校验，缺关键字段的条目跳过并记入日志 |
| 同一条目被多源命中 | 以 `arxivId` 优先做去重；无 arXiv 号时用标题相似度（≥0.9）去重，保留较早收录的那条 |
| 抓取频率 | 对同一源的请求至少间隔 60 秒；资讯类内容无秒级新鲜度需求 |
| 响应缓存 | 保存 `ETag` 并在下次请求带 `If-None-Match`，`304` 直接复用上次结果 |

## 6. 产物

抓取结果写入 `volumes/<ISO周>.json`，格式见 PRD 的 `WeeklyVolume` 定义。文件提交进仓库，纳入 CI 的 Schema 校验。

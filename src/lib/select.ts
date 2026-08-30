/**
 * 卷宗选篇逻辑
 *
 * 规则见 docs/DATA-SOURCES.md「收录策略」：
 *   1. 编辑精选条目无条件收录
 *   2. 按综合评分降序补足到目标篇数
 *   3. 最终按时间轴值倒序展示 —— 评分只用于筛选，绝不用于展示顺序
 */

export interface SelectableItem {
  id: string;
  curated: boolean;
  /** 综合评分，数据源可能不提供 */
  score: number | null;
  timelineAt: string;
}

/**
 * 选篇。
 *
 * @param items  窗口内全部候选条目
 * @param target 目标篇数
 * @returns 已按时间轴值倒序排列的选中条目
 */
export function selectPapers<T extends SelectableItem>(
  items: readonly T[],
  target: number,
): T[] {
  const curated = items.filter((item) => item.curated);
  const others = items.filter((item) => !item.curated);

  // 评分降序；同分时按时间倒序，保证结果稳定
  const byScore = [...others].sort((a, b) => {
    const sa = a.score ?? Number.NEGATIVE_INFINITY;
    const sb = b.score ?? Number.NEGATIVE_INFINITY;
    if (sa !== sb) return sb - sa;
    return Date.parse(b.timelineAt) - Date.parse(a.timelineAt);
  });

  const chosen: T[] = [...curated];
  const seen = new Set(curated.map((item) => item.id));
  for (const item of byScore) {
    if (chosen.length >= target) break;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    chosen.push(item);
  }

  // 展示顺序恒为时间倒序
  return chosen.sort(
    (a, b) => Date.parse(b.timelineAt) - Date.parse(a.timelineAt),
  );
}

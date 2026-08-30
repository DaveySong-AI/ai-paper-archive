/**
 * 思维导图布局（自研，零依赖）
 *
 * 水平树：根在左，子节点向右展开；父节点纵向居中于其子节点范围。
 * 连接线为三次贝塞尔曲线，控制点取水平中点。
 *
 * 坐标系约定：
 *   box.x = 节点左边缘
 *   box.y = 节点垂直中心（渲染矩形时用 y - h/2）
 */

import type { MindmapNode, MindmapNodeType } from './types';

const NODE_H = 38;
const V_GAP = 18;
const H_GAP = 72;
const PAD_X = 26;
const MIN_W = 88;
const CHAR_W_CJK = 15;
const CHAR_W_OTHER = 8.2;

const CJK =
  /[㐀-䶿一-鿿぀-ヿ가-힯＀-￯]/;

/** 按字符类型估算节点宽度：中文按 1 em，英文按 0.55 em */
export function measureLabel(label: string): number {
  let width = 0;
  for (const ch of label) {
    width += CJK.test(ch) ? CHAR_W_CJK : CHAR_W_OTHER;
  }
  return Math.max(MIN_W, Math.round(width + PAD_X));
}

export interface MindmapBox {
  id: string;
  label: string;
  type: MindmapNodeType;
  note: string | null;
  /** 左边缘 */
  x: number;
  /** 垂直中心 */
  y: number;
  w: number;
  h: number;
  depth: number;
  parentId: string | null;
  /** 该节点当前是否处于折叠状态 */
  collapsed: boolean;
  /** 原始子节点数量（折叠时 > 0，用于显示展开提示） */
  childCount: number;
}

export interface MindmapEdge {
  id: string;
  from: string;
  to: string;
  /** SVG path d 属性 */
  path: string;
}

export interface MindmapLayout {
  boxes: MindmapBox[];
  edges: MindmapEdge[];
  width: number;
  height: number;
}

interface Sized {
  node: MindmapNode;
  w: number;
  children: Sized[];
}

function sizeTree(
  node: MindmapNode,
  collapsed: ReadonlySet<string>,
): Sized {
  const hideChildren = collapsed.has(node.id);
  const children = hideChildren
    ? []
    : (node.children ?? []).map((child) => sizeTree(child, collapsed));
  return { node, w: measureLabel(node.label), children };
}

/** 子树占据的垂直高度 */
function subtreeHeight(node: Sized): number {
  if (node.children.length === 0) return NODE_H;
  let total = 0;
  for (const child of node.children) total += subtreeHeight(child);
  return total + V_GAP * (node.children.length - 1);
}

function collectMaxWidth(node: Sized, depth: number, acc: number[]): void {
  acc[depth] = Math.max(acc[depth] ?? 0, node.w);
  for (const child of node.children) {
    collectMaxWidth(child, depth + 1, acc);
  }
}

/** 每一层的列起点 x：由上一层的最宽节点累加得到 */
function columnX(maxWidth: readonly number[]): number[] {
  const xs: number[] = [];
  let x = 0;
  for (let depth = 0; depth < maxWidth.length; depth += 1) {
    xs[depth] = x;
    x += (maxWidth[depth] ?? 0) + H_GAP;
  }
  return xs;
}

function place(
  node: Sized,
  depth: number,
  top: number,
  parentId: string | null,
  xs: readonly number[],
  collapsed: ReadonlySet<string>,
  out: MindmapBox[],
): number {
  const x = xs[depth] ?? 0;
  const isCollapsed = collapsed.has(node.node.id);
  const childCount = node.node.children?.length ?? 0;

  if (node.children.length === 0) {
    const y = top + NODE_H / 2;
    out.push({
      id: node.node.id,
      label: node.node.label,
      type: node.node.type,
      note: node.node.note ?? null,
      x,
      y,
      w: node.w,
      h: NODE_H,
      depth,
      parentId,
      collapsed: isCollapsed && childCount > 0,
      childCount,
    });
    return y;
  }

  let cursor = top;
  const childCenters: number[] = [];
  for (const child of node.children) {
    const centerY = place(
      child,
      depth + 1,
      cursor,
      node.node.id,
      xs,
      collapsed,
      out,
    );
    childCenters.push(centerY);
    cursor += subtreeHeight(child) + V_GAP;
  }

  const first = childCenters[0] ?? top;
  const last = childCenters[childCenters.length - 1] ?? first;
  const y = (first + last) / 2;

  out.push({
    id: node.node.id,
    label: node.node.label,
    type: node.node.type,
    note: node.node.note ?? null,
    x,
    y,
    w: node.w,
    h: NODE_H,
    depth,
    parentId,
    collapsed: isCollapsed && childCount > 0,
    childCount,
  });
  return y;
}

/**
 * 计算布局。
 *
 * @param root      树根
 * @param collapsed 处于折叠状态的节点 id 集合
 */
export function layoutMindmap(
  root: MindmapNode,
  collapsed: ReadonlySet<string> = new Set(),
): MindmapLayout {
  const sized = sizeTree(root, collapsed);
  const maxWidth: number[] = [];
  collectMaxWidth(sized, 0, maxWidth);
  const xs = columnX(maxWidth);

  const boxes: MindmapBox[] = [];
  place(sized, 0, 0, null, xs, collapsed, boxes);

  const byId = new Map(boxes.map((box) => [box.id, box]));
  const edges: MindmapEdge[] = [];
  for (const box of boxes) {
    if (!box.parentId) continue;
    const parent = byId.get(box.parentId);
    if (!parent) continue;
    const x1 = parent.x + parent.w;
    const y1 = parent.y;
    const x2 = box.x;
    const y2 = box.y;
    const midX = (x1 + x2) / 2;
    edges.push({
      id: `${parent.id}--${box.id}`,
      from: parent.id,
      to: box.id,
      path: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
    });
  }

  const lastDepth = maxWidth.length - 1;
  return {
    boxes,
    edges,
    width: (xs[lastDepth] ?? 0) + (maxWidth[lastDepth] ?? 0),
    height: subtreeHeight(sized),
  };
}

/** 节点类型 → CSS 变量里的配色 */
export function nodeColor(type: MindmapNodeType): string {
  return `var(--mm-${type})`;
}

/** 节点类型 → 中文名 */
export const NODE_TYPE_LABEL: Record<MindmapNodeType, string> = {
  root: '主题',
  problem: '问题',
  method: '方法',
  contribution: '贡献',
  result: '结果',
  impact: '影响',
};

/** 输出纯文本层级大纲，作为可访问性与复制的降级路径 */
export function mindmapToText(root: MindmapNode): string {
  const lines: string[] = [];
  const walk = (node: MindmapNode, depth: number): void => {
    const indent = '　'.repeat(depth);
    const marker = depth === 0 ? '● ' : '– ';
    const note = node.note ? `：${node.note}` : '';
    lines.push(`${indent}${marker}${node.label}${note}`);
    for (const child of node.children ?? []) walk(child, depth + 1);
  };
  walk(root, 0);
  return lines.join('\n');
}

/** 统计节点总数 */
export function countNodes(root: MindmapNode): number {
  let total = 1;
  for (const child of root.children ?? []) total += countNodes(child);
  return total;
}

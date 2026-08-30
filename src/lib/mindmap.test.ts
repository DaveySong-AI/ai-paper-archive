import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  countNodes,
  layoutMindmap,
  measureLabel,
  mindmapToText,
} from './mindmap';
import type { MindmapNode } from './types';

const tree: MindmapNode = {
  id: 'root',
  label: 'Transformer',
  type: 'root',
  children: [
    {
      id: 'm1',
      label: '多头注意力',
      type: 'method',
      note: '并行捕捉不同子空间依赖',
      children: [
        { id: 'm1a', label: '缩放点积', type: 'method' },
        { id: 'm1b', label: '位置编码', type: 'method' },
      ],
    },
    { id: 'r1', label: ' BLEU 提升', type: 'result' },
  ],
};

function byId(id: string, boxes: { id: string; y: number; h: number }[]) {
  const found = boxes.find((box) => box.id === id);
  assert.ok(found, `未找到节点 ${id}`);
  return found;
}

test('布局：根节点纵向居中于其子节点范围', () => {
  const { boxes, edges } = layoutMindmap(tree);
  assert.equal(boxes.length, 5);
  assert.equal(edges.length, 4, '边数应为节点数减一');

  const root = byId('root', boxes);
  const m1 = byId('m1', boxes);
  const r1 = byId('r1', boxes);
  assert.equal(root.y, (m1.y + r1.y) / 2);
});

test('布局：同层节点纵向不重叠', () => {
  const { boxes } = layoutMindmap(tree);
  const m1 = byId('m1', boxes);
  const r1 = byId('r1', boxes);
  assert.ok(
    Math.abs(m1.y - r1.y) >= m1.h,
    `同层节点间距应不小于节点高度，实际 ${Math.abs(m1.y - r1.y)}`,
  );
});

test('布局：层级越深 x 越大（从左至右展开）', () => {
  const { boxes } = layoutMindmap(tree);
  const depthX = new Map<number, number>();
  for (const box of boxes) {
    if (!depthX.has(box.depth)) depthX.set(box.depth, box.x);
  }
  const xs = [...depthX.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
  assert.deepEqual(xs, [...xs].sort((a, b) => a - b), 'x 应随深度单调递增');
  assert.ok(xs[0]! < xs[1]! && xs[1]! < xs[2]!);
});

test('折叠：隐藏全部后代且不再产生连线', () => {
  const { boxes, edges } = layoutMindmap(tree, new Set(['root']));
  assert.equal(boxes.length, 1);
  assert.equal(edges.length, 0);
  assert.equal(boxes[0]?.collapsed, true);
  assert.equal(boxes[0]?.childCount, 2, '折叠时仍需保留子节点数量用于展示提示');
});

test('折叠：仅折叠中间节点时，其余分支不受影响', () => {
  const { boxes } = layoutMindmap(tree, new Set(['m1']));
  assert.deepEqual(
    boxes.map((b) => b.id).sort(),
    ['m1', 'r1', 'root'],
  );
});

test('宽度估算：中文按 1 em，英文按 0.55 em', () => {
  assert.ok(
    measureLabel('多头自注意力机制') > measureLabel('attention'),
    '同样字数的中文应更宽',
  );
  assert.ok(measureLabel('') >= 88, '极短标签也有最小宽度');
});

test('大纲文本：层级缩进且包含备注', () => {
  const text = mindmapToText(tree);
  const lines = text.split('\n');
  assert.equal(lines[0], '● Transformer');
  assert.match(lines[1] ?? '', /^　– 多头注意力：并行捕捉不同子空间依赖$/);
  assert.equal(countNodes(tree), 5);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { selectPapers } from './select';
import type { SelectableItem } from './select';

function item(
  id: string,
  score: number | null,
  timelineAt: string,
  curated = false,
): SelectableItem {
  return { id, curated, score, timelineAt };
}

test('编辑精选无条件收录，即使超出目标篇数', () => {
  const items = [
    item('c1', 1, '2026-08-25T00:00:00Z', true),
    item('c2', 0, '2026-08-26T00:00:00Z', true),
    item('n1', 99, '2026-08-27T00:00:00Z'),
  ];
  const chosen = selectPapers(items, 1);
  assert.deepEqual(
    chosen.map((x) => x.id),
    ['c2', 'c1'],
    '两篇精选都应保留，且按时间倒序',
  );
});

test('按评分补足到目标篇数', () => {
  const items = [
    item('low', 1, '2026-08-25T00:00:00Z'),
    item('high', 90, '2026-08-26T00:00:00Z'),
    item('mid', 50, '2026-08-27T00:00:00Z'),
  ];
  const chosen = selectPapers(items, 2);
  assert.deepEqual(
    chosen.map((x) => x.id).sort(),
    ['high', 'mid'],
  );
});

test('展示顺序恒为时间倒序，不按评分排序', () => {
  const items = [
    item('old-high', 99, '2026-08-24T00:00:00Z'),
    item('new-low', 10, '2026-08-29T00:00:00Z'),
    item('mid-mid', 50, '2026-08-27T00:00:00Z'),
  ];
  const chosen = selectPapers(items, 3);
  assert.deepEqual(
    chosen.map((x) => x.id),
    ['new-low', 'mid-mid', 'old-high'],
    '评分最高的那篇时间最早，必须排在最后',
  );
});

test('评分缺失的条目排在末尾但不被优先丢弃', () => {
  const items = [
    item('no-score', null, '2026-08-24T00:00:00Z'),
    item('has-score', 5, '2026-08-25T00:00:00Z'),
  ];
  const chosen = selectPapers(items, 1);
  assert.deepEqual(
    chosen.map((x) => x.id),
    ['has-score'],
  );
});

test('候选不足时返回全部，不报错', () => {
  const items = [item('only', 1, '2026-08-24T00:00:00Z')];
  assert.equal(selectPapers(items, 50).length, 1);
  assert.equal(selectPapers([], 50).length, 0);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addDays,
  beijingDate,
  computeTimelineAt,
  groupByDay,
  isoWeekOf,
  relativeTime,
  weekBounds,
  weekdayOfDate,
} from './timeline';
import type { PaperRecord } from './types';

function record(id: string, iso: string): PaperRecord {
  return {
    id,
    kind: 'weekly',
    title: id,
    source: { name: '测试源', family: 'lab' },
    timelineAt: iso,
    curated: false,
    tags: [],
    links: { reader: `/paper/${id}`, original: 'https://example.com' },
    summary: '摘要',
  };
}

test('时间轴值：publishedAt 缺失时取 discoveredAt', () => {
  assert.equal(
    computeTimelineAt(null, '2026-08-30T00:00:00Z'),
    '2026-08-30T00:00:00Z',
  );
});

test('时间轴值：收录比发布晚 72 小时以上，归位到原发布日', () => {
  // 相差 100 小时 > 72h，属于历史回填
  assert.equal(
    computeTimelineAt('2026-08-25T20:00:00Z', '2026-08-30T00:00:00Z'),
    '2026-08-25T20:00:00Z',
  );
});

test('时间轴值：收录与发布相差 72 小时内，取收录时间', () => {
  assert.equal(
    computeTimelineAt('2026-08-29T14:00:00Z', '2026-08-30T00:00:00Z'),
    '2026-08-30T00:00:00Z',
  );
});

test('时间轴值：恰好 72 小时不算回填', () => {
  assert.equal(
    computeTimelineAt('2026-08-27T00:00:00Z', '2026-08-30T00:00:00Z'),
    '2026-08-30T00:00:00Z',
  );
});

test('北京时间换算：UTC 16:00 属于次日', () => {
  assert.equal(beijingDate('2026-08-30T16:00:00Z'), '2026-08-31');
  assert.equal(beijingDate('2026-08-30T15:59:00Z'), '2026-08-30');
});

test('ISO 周：周一开启新的一周，周日归属上一周', () => {
  assert.equal(isoWeekOf('2026-08-31'), '2026-W36');
  assert.equal(isoWeekOf('2026-08-30'), '2026-W35');
});

test('ISO 周：跨年周归属含周四的那一年', () => {
  assert.equal(isoWeekOf('2026-01-01'), '2026-W01');
  assert.deepEqual(weekBounds('2026-01-01'), {
    startDate: '2025-12-29',
    endDate: '2026-01-04',
  });
});

test('周边界：任意日期都能算出周一与周日', () => {
  assert.deepEqual(weekBounds('2026-08-31'), {
    startDate: '2026-08-31',
    endDate: '2026-09-06',
  });
  assert.equal(weekdayOfDate('2026-08-31'), '周一');
  assert.equal(weekdayOfDate('2026-08-30'), '周日');
});

test('日期加减', () => {
  assert.equal(addDays('2026-08-31', -1), '2026-08-30');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
});

test('相对时间：分钟 / 小时 / 天', () => {
  const now = Date.parse('2026-08-31T12:00:00Z');
  assert.equal(
    relativeTime('2026-08-31T10:00:00Z', now),
    '2 小时前',
  );
  assert.equal(
    relativeTime('2026-08-28T12:00:00Z', now),
    '3 天前',
  );
  assert.equal(relativeTime('2026-08-31T11:59:30Z', now), '刚刚');
});

test('按天分组：倒序且日期与星期正确', () => {
  const groups = groupByDay([
    record('a', '2026-08-29T10:00:00Z'),
    record('b', '2026-08-31T02:00:00Z'),
    record('c', '2026-08-30T05:00:00Z'),
  ]);

  assert.deepEqual(
    groups.map((g) => g.date),
    ['2026-08-31', '2026-08-30', '2026-08-29'],
  );
  assert.equal(groups[0]?.weekday, '周一');
});

test('按天分组：以北京时间为准，UTC 晚间会归到次日', () => {
  const groups = groupByDay([record('x', '2026-08-30T20:00:00Z')]);
  assert.equal(
    groups[0]?.date,
    '2026-08-31',
    'UTC 20:00 在北京时间已是次日凌晨 4 点',
  );
});

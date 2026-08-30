'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  NODE_TYPE_LABEL,
  layoutMindmap,
  mindmapToText,
  nodeColor,
} from '@/lib/mindmap';
import type { MindmapNode } from '@/lib/types';

const MIN_SCALE = 0.45;
const MAX_SCALE = 2.2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 移动端与可访问性降级：缩进式大纲，不做横向滚动 */
function Outline({
  root,
  onSelect,
  selectedId,
}: {
  root: MindmapNode;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const rows: { node: MindmapNode; depth: number }[] = [];
  const walk = (node: MindmapNode, depth: number): void => {
    rows.push({ node, depth });
    for (const child of node.children ?? []) walk(child, depth + 1);
  };
  walk(root, 0);

  return (
    <ul className="m-0 list-none space-y-1 p-0">
      {rows.map(({ node, depth }) => (
        <li key={node.id} style={{ paddingLeft: `${depth * 18}px` }}>
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className={[
              'flex w-full items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition-colors',
              selectedId === node.id
                ? 'border-brand bg-brand-soft'
                : 'border-transparent hover:bg-bg-soft',
            ].join(' ')}
          >
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: nodeColor(node.type) }}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="font-medium text-ink">{node.label}</span>
              <span className="ml-1.5 text-[11px] text-muted">
                {NODE_TYPE_LABEL[node.type]}
              </span>
              {node.note ? (
                <span className="block text-xs leading-relaxed text-ink-2">
                  {node.note}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Mindmap({ root }: { root: MindmapNode }) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 16, y: 16, scale: 1 });
  const [showText, setShowText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(() => layoutMindmap(root, collapsed), [root, collapsed]);

  const canvasWidth = layout.width + 40;
  const canvasHeight = layout.height + 40;
  const viewHeight = clamp(canvasHeight, 320, 620);

  /** 按容器宽高同时缩放并居中，保证整张图初始就可见 */
  const fitView = useCallback((): void => {
    const el = containerRef.current;
    if (!el) return;
    const scale = clamp(
      Math.min(el.clientWidth / canvasWidth, viewHeight / canvasHeight),
      MIN_SCALE,
      1,
    );
    setPan({
      x: Math.max(8, (el.clientWidth - canvasWidth * scale) / 2),
      y: Math.max(8, (viewHeight - canvasHeight * scale) / 2),
      scale,
    });
  }, [canvasWidth, canvasHeight, viewHeight]);

  // 展开或折叠改变画布尺寸后重新适配
  useEffect(() => {
    fitView();
  }, [fitView]);

  // 滚轮缩放需要非 passive 监听才能 preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setPan((prev) => ({
        ...prev,
        scale: clamp(
          prev.scale * (event.deltaY < 0 ? 1.12 : 0.89),
          MIN_SCALE,
          MAX_SCALE,
        ),
      }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const toggle = (id: string): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const select = (id: string): void => {
    setSelectedId(id);
    const node = layout.boxes.find((box) => box.id === id);
    if (node && node.childCount > 0) toggle(id);
  };

  const selected = layout.boxes.find((box) => box.id === selectedId) ?? null;
  const outlineText = useMemo(() => mindmapToText(root), [root]);

  return (
    <div>
      {/* 桌面端：可交互 SVG 画布 */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="relative hidden overflow-hidden rounded-[var(--radius)] border border-line bg-surface-2 wide:block"
        style={{ height: `${viewHeight}px` }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            originX: pan.x,
            originY: pan.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          setPan((prev) => ({
            ...prev,
            x: drag.originX + (event.clientX - drag.startX),
            y: drag.originY + (event.clientY - drag.startY),
          }));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <svg
          width={canvasWidth}
          height={canvasHeight}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${pan.scale})`,
            transformOrigin: '0 0',
            cursor: 'grab',
          }}
        >
          {layout.edges.map((edge) => (
            <path
              key={edge.id}
              d={edge.path}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.6"
            />
          ))}

          {layout.boxes.map((box) => {
            const isSelected = box.id === selectedId;
            const color = nodeColor(box.type);
            const isRoot = box.type === 'root';
            return (
              <g
                key={box.id}
                onClick={() => select(box.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={box.x}
                  y={box.y - box.h / 2}
                  width={box.w}
                  height={box.h}
                  rx={9}
                  fill={isRoot ? color : 'var(--surface)'}
                  stroke={color}
                  strokeWidth={isSelected ? 2.6 : 1.6}
                />
                <text
                  x={box.x + box.w / 2}
                  y={box.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fill={isRoot ? '#ffffff' : 'var(--ink)'}
                  style={{ pointerEvents: 'none' }}
                >
                  {box.label}
                  {box.collapsed ? ` +${box.childCount}` : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 缩放控件 */}
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          {[
            {
              label: '放大',
              onClick: () =>
                setPan((p) => ({
                  ...p,
                  scale: clamp(p.scale * 1.15, MIN_SCALE, MAX_SCALE),
                })),
              path: 'M12 5v14M5 12h14',
            },
            {
              label: '缩小',
              onClick: () =>
                setPan((p) => ({
                  ...p,
                  scale: clamp(p.scale * 0.87, MIN_SCALE, MAX_SCALE),
                })),
              path: 'M5 12h14',
            },
            {
              label: '重置视图',
              onClick: () => {
                setCollapsed(new Set());
                setSelectedId(null);
                fitView();
              },
              path: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
            },
          ].map((control) => (
            <button
              key={control.label}
              type="button"
              onClick={control.onClick}
              title={control.label}
              aria-label={control.label}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d={control.path}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* 移动端可见 / 桌面端对读屏软件可见 */}
      <div className="rounded-[var(--radius)] border border-line bg-surface p-3 wide:sr-only">
        <Outline root={root} onSelect={setSelectedId} selectedId={selectedId} />
      </div>

      {/* 选中节点的说明 */}
      <div className="mt-3 min-h-[52px] rounded-lg border border-line bg-surface px-4 py-2.5">
        {selected ? (
          <>
            <p className="m-0 flex items-center gap-2 text-[13px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: nodeColor(selected.type) }}
                aria-hidden="true"
              />
              <span className="font-semibold text-ink">{selected.label}</span>
              <span className="text-[11px] text-muted">
                {NODE_TYPE_LABEL[selected.type]}
              </span>
            </p>
            <p className="m-0 mt-1 text-[13px] leading-relaxed text-ink-2">
              {selected.note ?? '（该节点暂无补充说明）'}
            </p>
          </>
        ) : (
          <p className="m-0 text-[13px] text-muted">
            点击任意节点查看说明；点击有子节点的项可展开或折叠。
            画布支持拖拽平移，按住 Ctrl / ⌘ 滚轮缩放。
          </p>
        )}
      </div>

      {/* 可访问性降级：纯文本大纲 */}
      <div className="no-print mt-3">
        <button
          type="button"
          onClick={() => setShowText((prev) => !prev)}
          aria-expanded={showText}
          className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
        >
          {showText ? '收起大纲文本' : '查看大纲文本'}
        </button>
        {showText ? (
          <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 text-xs leading-relaxed text-ink-2">
            {outlineText}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

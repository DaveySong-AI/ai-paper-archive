/** 统计条：用于卷宗页与首页顶部 */
export function StatGrid({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[var(--radius)] border border-line bg-surface px-4 py-3 shadow-card"
        >
          <dt className="text-[11px] text-muted">{item.label}</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink">
            {item.value}
          </dd>
          {item.hint ? (
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              {item.hint}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

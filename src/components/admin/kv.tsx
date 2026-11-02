/** Label/value grid used on the review screen to show what the representative entered. */
export function KV({ rows, cols = 3 }: { rows: { k: string; v: React.ReactNode }[]; cols?: 2 | 3 }) {
  return (
    <dl className={cols === 3 ? "grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-x-6 gap-y-3 sm:grid-cols-2"}>
      {rows.map((r) => (
        <div key={r.k} className="min-w-0">
          <dt className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">{r.k}</dt>
          <dd className="mt-0.5 truncate text-[14px]">{r.v ?? <span className="text-v-muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

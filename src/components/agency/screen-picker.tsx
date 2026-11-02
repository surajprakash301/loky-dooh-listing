"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type PickerScreen = { id: number; name: string; code: string; locality: string; city: string; image: string | null; reach: string; from: string; booked: string };

/** Location picker shared by the proposal and quotation builders: grouped by city, posts billboardIds[]. */
export function ScreenPicker({ screens, initial = [], error }: { screens: PickerScreen[]; initial?: number[]; error?: string }) {
  const [sel, setSel] = useState<Set<number>>(new Set(initial));
  const cities = [...new Set(screens.map((s) => s.city))];
  const toggle = (id: number) => setSel((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <div>
      {[...sel].map((id) => <input key={id} type="hidden" name="billboardIds" value={id} />)}
      <div className="mb-2 flex items-center justify-between text-[13px]"><span className="font-semibold">{sel.size} screen{sel.size === 1 ? "" : "s"} selected</span>{error && <span className="text-v-red">{error}</span>}</div>
      {cities.map((city) => (
        <div key={city} className="mb-4">
          <p className="mb-2 text-[11px] font-bold tracking-wide text-v-muted uppercase">{city} network</p>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
            {screens.filter((s) => s.city === city).map((s) => (
              <button type="button" key={s.id} onClick={() => toggle(s.id)} className={cn("flex gap-3 rounded-xl border p-2.5 text-left", sel.has(s.id) ? "border-v-green bg-v-chip" : "border-v-line hover:bg-v-tint")}>
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-v-panel">{s.image && <img src={s.image} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0"><p className="truncate text-[13.5px] font-semibold">{s.name}</p><p className="text-[11.5px] text-ink-soft">{s.locality} · #{s.code}</p><p className="text-[11.5px] text-ink-soft">{s.reach} reach/day · {s.booked} booked</p><p className="text-[12px] font-semibold text-v-deep">{s.from}</p></div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

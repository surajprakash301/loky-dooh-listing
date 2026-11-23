"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type FilterOption = { id: string; label: string; hint?: string };

/** Pill + popover with multi-select options. Closes on outside click or Escape. */
export function FilterMenu({ label, options, selected, onChange }: { label: string; options: FilterOption[]; selected: string[]; onChange: (next: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = selected.length > 0;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
  const summary = !active ? label : selected.length === 1 ? (options.find((o) => o.id === selected[0])?.label ?? label) : `${label} · ${selected.length}`;

  return (
    <div ref={root} className="relative shrink-0" data-testid={`filter-${label.toLowerCase()}`}>
      <div className={cn("inline-flex h-9 items-center rounded-full border text-[13px] font-bold whitespace-nowrap transition-colors", active ? "border-ink bg-ink pr-1.5 pl-3.5 text-white" : open ? "border-ink/50 bg-white px-3.5 text-ink" : "border-line bg-white px-3.5 text-ink hover:border-ink/40")}>
        <button type="button" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((v) => !v)} className="inline-flex h-full items-center gap-1.5">
          <span className="max-w-[160px] truncate">{summary}</span>
          {!active && <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />}
        </button>
        {active && (
          <button type="button" aria-label={`Clear ${label}`} onClick={() => onChange([])} className="ml-1 grid size-6 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white">
            <X className="size-3.5" strokeWidth={2.4} />
          </button>
        )}
      </div>

      {open && (
        <div id={menuId} role="group" aria-label={label} className="anim-pop absolute top-[calc(100%+8px)] left-0 z-[600] w-[250px] origin-top-left rounded-2xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(16,24,40,0.16)]">
          <div className="max-h-[300px] overflow-y-auto overscroll-contain">
            {options.length === 0 && <p className="px-3 py-4 text-center text-[13px] text-ink-soft">Nothing to filter by yet.</p>}
            {options.map((o) => {
              const checked = selected.includes(o.id);
              return (
                <button key={o.id} type="button" role="menuitemcheckbox" aria-checked={checked} onClick={() => toggle(o.id)} className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-page", checked && "bg-brand/10 hover:bg-brand/15")}>
                  <span className={cn("mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition-colors", checked ? "border-green bg-green text-white" : "border-ink/30 bg-white text-transparent")}>
                    <Check className="size-3" strokeWidth={3.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] leading-tight font-bold text-ink">{o.label}</span>
                    {o.hint && <span className="mt-0.5 block text-[11.5px] leading-snug font-normal text-ink-soft">{o.hint}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-line px-1 pt-2">
            <button type="button" onClick={() => onChange([])} disabled={!active} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-soft hover:bg-page disabled:opacity-40">
              Clear
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-bold text-white hover:bg-ink/85">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

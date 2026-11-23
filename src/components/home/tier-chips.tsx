"use client";

import { tierFilters } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TierChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {tierFilters.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "h-8 rounded-full border px-4 text-[13px] whitespace-nowrap transition-colors",
              active
                ? "border-line bg-[#f3f3f3] font-bold text-green shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                : "border-line bg-white text-ink-soft hover:border-ink/30",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

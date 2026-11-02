"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  budgetOptions,
  dimensionOptions,
  durations,
  locationTree,
  screenTypeOptions,
} from "@/lib/data";
import { cn } from "@/lib/utils";

function Section({
  title,
  suffix,
  children,
  showMore = true,
}: {
  title: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
  showMore?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-baseline gap-1.5 text-[15px] font-bold uppercase tracking-wide">
          {title}
          {suffix}
        </span>
        {open ? <ChevronUp className="size-4 text-ink-soft" /> : <ChevronDown className="size-4 text-ink-soft" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2.5">
          {children}
          {showMore && (
            <button type="button" className="pt-1 text-[11px] text-coral-600">
              Show More
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function CheckRow({
  label,
  count,
  icon,
  defaultChecked,
  muted,
}: {
  label: React.ReactNode;
  count?: React.ReactNode;
  icon?: React.ReactNode;
  defaultChecked?: boolean;
  muted?: boolean;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-[13px]", muted && "text-muted-ink")}>
      <Checkbox
        defaultChecked={defaultChecked}
        className="size-3.5 rounded-[2px] border-ink-soft/60 data-checked:border-green data-checked:bg-green"
      />
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-[11px] text-muted-ink">({count})</span>}
    </label>
  );
}

export function FiltersSidebar({ className }: { className?: string }) {
  const [budget, setBudget] = useState<number[]>([10, 95]);

  return (
    <aside className={cn("w-[176px] shrink-0", className)}>
      <h2 className="font-anton text-[26px] uppercase leading-none tracking-wide">Filters</h2>

      <Section title="Location">
        <div className="flex h-8 items-center gap-2 rounded-md border border-ink/40 bg-white px-2.5">
          <Search className="size-3.5 text-ink-soft" />
          <input defaultValue="Patna , Bihar" className="w-full bg-transparent text-[12px] font-bold outline-none" />
        </div>
        <ul className="space-y-2">
          {locationTree.map((st) => (
            <li key={st.state}>
              <div className="flex items-center gap-2.5 text-[13px]">
                <Checkbox
                  defaultChecked={st.checked}
                  className="size-3.5 rounded-[2px] border-ink-soft/60 data-checked:border-green data-checked:bg-green"
                />
                <span className={cn("flex-1", st.comingSoon && "text-muted-ink")}>
                  {st.state}{" "}
                  {st.comingSoon ? (
                    <span className="text-[10px] text-coral-600">(comming soon)</span>
                  ) : (
                    <span className="text-[10px] text-muted-ink">({st.count})</span>
                  )}
                </span>
                {st.open ? <ChevronUp className="size-3.5 text-ink-soft" /> : <ChevronDown className="size-3.5 text-ink-soft" />}
              </div>
              {st.open && (
                <ul className="mt-2 ml-4 space-y-1.5">
                  {st.cities.map((c) => (
                    <li key={c.name}>
                      <CheckRow label={c.name} count={c.count} />
                    </li>
                  ))}
                  <li>
                    <button type="button" className="ml-6 text-[11px] text-coral-600">
                      See All
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Duration" showMore={false}>
        <div className="flex flex-wrap gap-2">
          {durations.map((d) => (
            <button
              key={d}
              type="button"
              className="h-6 rounded border border-ink/40 bg-white px-2 text-[10px] font-medium hover:border-ink"
            >
              {d}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Budget" suffix={<span className="text-[10px] font-bold">(PER SCREEN)</span>}>
        <div className="px-1 pt-4">
          <div className="relative">
            <span
              className="absolute -top-4 -translate-x-1/2 text-[9px] text-ink-soft"
              style={{ left: `${((budget[1] - 10) / 85) * 100}%` }}
            >
              ₹{budget[1]}k
            </span>
            <Slider
              min={10}
              max={95}
              value={budget}
              onValueChange={(v) => setBudget(Array.isArray(v) ? v : [v])}
              className="[&_[data-slot=slider-range]]:bg-coral [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-ink [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-[#d9d9d9]"
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-ink-soft">
            <span>₹10k</span>
            <span>₹95k</span>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          {budgetOptions.map((o) => (
            <CheckRow key={o.label} label={o.label} count={o.count} />
          ))}
        </div>
      </Section>

      <Section
        title="Dimensions"
        suffix={
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold">
            (IN Ft <ChevronDown className="size-3" />)
          </span>
        }
      >
        {dimensionOptions.map((o) => (
          <CheckRow key={o.label} label={o.label} count={o.count} />
        ))}
      </Section>

      <Section title="Screen Type">
        {screenTypeOptions.map((o, i) => (
          <CheckRow
            key={`${o.label}-${i}`}
            label={o.label}
            count={o.count}
            icon={
              <span className={cn("text-[11px]", o.icon === "unipole" ? "text-sky-tier" : "text-link")}>
                {o.icon === "unipole" ? "▣" : "▮"}
              </span>
            }
          />
        ))}
      </Section>
    </aside>
  );
}

"use client";

import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "Patna , Bihar" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-3 text-[15px] text-ink-soft"
      >
        <ArrowLeft className="size-5 text-ink" strokeWidth={2.4} />
        Back
      </button>
      <span className="h-6 w-px bg-line" />
      <div className="relative flex h-10 flex-1 items-center rounded-full border border-line bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Search className="size-4 text-ink-soft" strokeWidth={2.2} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="ml-5 h-full flex-1 bg-transparent text-[15px] font-bold outline-none placeholder:font-normal"
          placeholder="Search city, locality or billboard"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setValue("")}
            className="grid size-5 place-items-center rounded-full bg-page text-ink-soft"
          >
            <X className="size-3" strokeWidth={3} />
          </button>
        )}
      </div>
      <span className="h-6 w-px bg-line" />
      <button type="button" className="flex items-center gap-3 text-[15px] text-ink-soft">
        Next
        <ArrowRight className="size-5 text-ink" strokeWidth={2.4} />
      </button>
    </div>
  );
}

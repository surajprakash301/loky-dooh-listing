"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/** Shareable URL with a copy button. The origin is only known in the browser, so it is filled in after hydration. */
export function ShareLink({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${path}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-lg bg-v-panel px-3 py-2 text-[12.5px] select-all">{url}</code>
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-v-line px-3 text-[12.5px] font-semibold">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : label}</button>
    </div>
  );
}

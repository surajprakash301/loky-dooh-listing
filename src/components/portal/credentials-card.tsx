"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

/** One-time display of issued vendor credentials. Shown once; never persisted in clear. */
export function CredentialsCard({ username, password, title = "Vendor login issued" }: { username: string; password: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Loky Media vendor login\nURL: ${typeof window !== "undefined" ? window.location.origin : ""}/login\nUsername: ${username}\nTemporary password: ${password}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the values are selectable text below */
    }
  };
  return (
    <div className="rounded-xl border border-v-green/40 bg-v-tint p-5">
      <div className="flex items-center gap-2 text-v-deep">
        <KeyRound className="size-5" />
        <h3 className="text-[16px] font-bold">{title}</h3>
      </div>
      <p className="mt-1 text-[13px] text-ink-soft">Hand these to the vendor now. The password is shown only once; they must change it on first login.</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-v-line bg-white px-4 py-3">
          <dt className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">Username</dt>
          <dd className="mt-1 font-mono text-[16px] font-semibold select-all">{username}</dd>
        </div>
        <div className="rounded-lg border border-v-line bg-white px-4 py-3">
          <dt className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">Temporary password</dt>
          <dd className="mt-1 font-mono text-[16px] font-semibold select-all">{password}</dd>
        </div>
      </dl>
      <button type="button" onClick={copy} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-v-deep px-4 text-[13px] font-semibold text-white">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy both"}
      </button>
    </div>
  );
}

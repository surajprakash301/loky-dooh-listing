"use client";

import { useSyncExternalStore } from "react";

/**
 * The customer's current selection of billboards ("campaign"), kept in localStorage so it
 * survives navigation between the listing, the map and the quotation builder.
 * Billboards are referenced by their public code (e.g. "01010").
 */
const KEY = "loky_campaign";
const EVENT = "loky-campaign-change";
const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: selection lives for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const campaign = {
  get: read,
  has: (code: string) => read().includes(code),
  add: (code: string) => {
    if (!read().includes(code)) write([...read(), code]);
  },
  remove: (code: string) => write(read().filter((c) => c !== code)),
  toggle: (code: string) => (read().includes(code) ? campaign.remove(code) : campaign.add(code)),
  set: (codes: string[]) => write(Array.from(new Set(codes))),
  clear: () => write([]),
};

/** Reactive view of the selection. Renders as empty on the server and during hydration. */
export function useCampaign(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

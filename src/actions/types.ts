export type ActionState<T = unknown> = {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string>;
  /** Submitted string fields, echoed back so forms can re-populate after React resets them. */
  values?: Record<string, string>;
  data?: T;
};

export const idle: ActionState<never> = {};

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

/** Turns a flat FormData into a plain object of strings (first value per key). */
export function toObject(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string" && !(k in o)) o[k] = v;
  return o;
}

export function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

/** Failure result that keeps what the user typed. */
export function failed(fd: FormData, errors: Record<string, string> | undefined, error?: string): ActionState<never> {
  return { errors, error, values: toObject(fd) };
}

/** `defaultValue` resolver: last submitted value wins, then the stored one. */
export function pick(values: Record<string, string> | undefined, key: string, fallback: string | number | null | undefined): string {
  if (values && key in values) return values[key];
  return fallback == null ? "" : String(fallback);
}

"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "h-11 w-full rounded-lg border border-v-line bg-white px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-v-muted focus:border-v-green focus:ring-2 focus:ring-v-green/20 disabled:bg-v-panel disabled:text-v-muted aria-[invalid=true]:border-v-red";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  name?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)} htmlFor={name}>
      <span className="text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-v-red">*</span>}
      </span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-[12px] text-v-red">
          <AlertCircle className="size-3.5" /> {error}
        </span>
      ) : hint ? (
        <span className="text-[12px] text-v-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input id={props.name} aria-invalid={!!error} className={cn(control, className)} {...props} />;
}

export function Select({ className, error, children, defaultValue, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  const ref = useRef<HTMLSelectElement>(null);
  // React re-applies a changed defaultValue to <input> after a form action resets the form, but not to <select>.
  // Echoed values from a failed action arrive as a new defaultValue, so sync it by hand.
  useEffect(() => {
    if (ref.current && defaultValue != null && props.value === undefined) ref.current.value = String(defaultValue);
  }, [defaultValue, props.value]);
  return (
    <select ref={ref} id={props.name} aria-invalid={!!error} defaultValue={defaultValue} className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea id={props.name} aria-invalid={!!error} className={cn(control, "h-auto min-h-[96px] py-2.5 leading-relaxed", className)} {...props} />;
}

export function FileInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={props.name}
      type="file"
      className={cn(
        "block w-full rounded-lg border border-dashed border-v-line bg-v-tint px-3 py-2.5 text-[13px] text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-v-deep file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-white hover:border-v-green disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2.5 text-[14px]">
      <input type="checkbox" className="size-4 accent-v-green" {...props} />
      {label}
    </label>
  );
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
  pendingText,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "danger" | "ghost"; pendingText?: string }) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-v-deep text-white hover:bg-v-deep/90",
    outline: "border border-v-line bg-white text-ink hover:bg-v-panel",
    danger: "bg-v-red text-white hover:bg-v-red/90",
    ghost: "text-ink-soft hover:bg-v-panel",
  };
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60", styles[variant], className)}
      {...props}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

export function Notice({ tone, children, className }: { tone: "error" | "success" | "info" | "warn"; children: React.ReactNode; className?: string }) {
  const tones = {
    error: "border-v-red/30 bg-v-red-tint text-v-red",
    success: "border-v-green/30 bg-v-chip text-v-deep",
    info: "border-v-line bg-v-panel text-ink-soft",
    warn: "border-v-orange/40 bg-v-orange-tint text-v-rust",
  };
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[13.5px] leading-snug", tones[tone], className)} role={tone === "error" ? "alert" : "status"}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function FormGrid({ children, cols = 2, className }: { children: React.ReactNode; cols?: 1 | 2 | 3; className?: string }) {
  return <div className={cn("grid gap-x-5 gap-y-4", cols === 2 && "md:grid-cols-2", cols === 3 && "md:grid-cols-3", className)}>{children}</div>;
}

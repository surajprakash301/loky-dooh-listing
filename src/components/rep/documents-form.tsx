"use client";

import { useActionState } from "react";
import { ExternalLink, FileCheck2 } from "lucide-react";
import type { ActionState } from "@/actions/types";
import { idle, pick } from "@/actions/types";
import { Field, FileInput, Notice, SubmitButton, TextInput } from "@/components/portal/form";
import type { DocType } from "@/lib/domain";

export type DocValues = { docType: DocType; label: string; required: boolean; existing: { url: string; name: string; docNumber: string | null } | null };

export function DocumentsForm({ action, docs, locked }: { action: (p: ActionState, fd: FormData) => Promise<ActionState>; docs: DocValues[]; locked: boolean }) {
  const [state, act] = useActionState(action, idle);
  const e = state.errors ?? {};
  return (
    <form action={act} className="flex flex-col gap-5">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <fieldset disabled={locked} className="contents">
        <div className="divide-y divide-v-line rounded-lg border border-v-line">
          {docs.map((d) => (
            <div key={d.docType} className="grid gap-3 p-4 md:grid-cols-[200px_1fr_180px] md:items-start">
              <div>
                <p className="text-[14px] font-semibold">
                  {d.label}
                  {d.required && <span className="ml-0.5 text-v-red">*</span>}
                </p>
                {d.existing ? (
                  <a href={d.existing.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-v-green hover:underline">
                    <FileCheck2 className="size-3.5" /> {d.existing.name} <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-[12px] text-v-muted">Not uploaded</p>
                )}
              </div>
              <Field label={d.existing ? "Replace file" : "Upload file"} name={d.docType} error={e[d.docType]}>
                <FileInput name={d.docType} accept="image/*,application/pdf" />
              </Field>
              <Field label="Document no." name={`${d.docType}_number`}>
                <TextInput name={`${d.docType}_number`} defaultValue={pick(state.values, `${d.docType}_number`, d.existing?.docNumber)} placeholder="optional" />
              </Field>
            </div>
          ))}
        </div>
        <p className="text-[12.5px] text-v-muted">PDF, JPG or PNG up to 10 MB each. Files are private: only you, the admin and the vendor can open them.</p>
      </fieldset>
      {!locked && <div className="flex justify-end border-t border-v-line pt-4"><SubmitButton pendingText="Uploading…">Save & continue</SubmitButton></div>}
    </form>
  );
}

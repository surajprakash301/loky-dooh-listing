import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { KV } from "@/components/admin/kv";
import { EventTimeline } from "@/components/portal/event-timeline";
import { SectionActions } from "@/components/admin/section-actions";
import { LiveStatusSelect, RejectVendor, ResetVendorPassword, TierSelect } from "@/components/admin/vendor-controls";
import { Notice } from "@/components/portal/form";
import { PageHeader, Panel } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import { requireRole } from "@/lib/server/auth";
import { BUSINESS_TYPE_LABEL, DOC_LABEL, PACKAGE_LABEL, SECTION_LABEL } from "@/lib/domain";
import { formatDate, formatDateLong, formatDateTime, formatINR, formatNumber } from "@/lib/format";
import { fileUrl } from "@/services/files";
import { loadEvents, loadVendor } from "@/services/onboarding";


function ReviewBox({ vendorId, row }: { vendorId: number; row: { id: number; status: string; remark: string | null; round: number; reviewedAt: Date | null; reviewer?: { name: string } | null } | undefined }) {
  if (!row) return <p className="border-t border-v-line pt-4 text-[13px] text-v-muted">Not submitted for review yet.</p>;
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-3 text-[13px] text-ink-soft">
        <StatusPill status={row.status as "pending"} />
        <span>round {row.round}</span>
        {row.reviewedAt && <span>· {row.reviewer?.name} on {formatDateTime(row.reviewedAt)}</span>}
      </div>
      {row.status === "changes_requested" && row.remark && <Notice tone="warn" className="mt-3"><b>Your remark:</b> {row.remark}</Notice>}
      {row.status === "pending" && <div className="mt-4"><SectionActions vendorId={vendorId} reviewSectionId={row.id} /></div>}
    </div>
  );
}

export default async function AdminVendorPage(props: PageProps<"/admin/vendors/[id]">) {
  await requireRole("admin");
  const { id } = await props.params;
  const v = await loadVendor(Number(id));
  if (!v) notFound();
  const events = await loadEvents(v.id);
  const rows = v.reviewSections ?? [];
  const row = (section: string, billboardId?: number) => rows.find((r) => r.section === section && (section !== "billboard" || r.billboardId === billboardId));
  const sections = [
    { key: "business", label: SECTION_LABEL.business, row: row("business") },
    { key: "contacts", label: SECTION_LABEL.contacts, row: row("contacts") },
    { key: "documents", label: SECTION_LABEL.documents, row: row("documents") },
    { key: "bank", label: SECTION_LABEL.bank, row: row("bank") },
    ...(v.billboards ?? []).map((b) => ({ key: `billboard-${b.id}`, label: `E · ${b.name} #${b.code}`, row: row("billboard", b.id) })),
  ];
  const underReview = v.status === "pending" || v.status === "changes_requested";
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/vendors", label: "Vendor onboarding" }}
        title={v.tradeName ?? v.legalName ?? `Vendor #${v.id}`}
        subtitle={`${v.city ?? ""}${v.state ? `, ${v.state}` : ""} · onboarded by ${v.representative?.name}${v.submittedAt ? ` · submitted ${formatDate(v.submittedAt)}` : ""}`}
        actions={
          <>
            <StatusPill status={v.status} className="h-7 px-3 text-[12px]" />
            {underReview && <RejectVendor vendorId={v.id} />}
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 px-6 py-6 md:px-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 px-2 text-[11px] font-semibold tracking-wide text-v-muted uppercase">Sections · {pendingCount} pending</p>
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <a key={s.key} href={`#${s.key}`} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] hover:bg-white">
                <span className="truncate">{s.label}</span>
                {s.row ? <StatusPill status={s.row.status} label={s.row.status === "changes_requested" ? "Flagged" : s.row.status === "pending" ? "Pending" : "OK"} /> : <span className="text-[11px] text-v-muted">draft</span>}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          {v.status === "rejected" && <Notice tone="error"><b>Rejected:</b> {v.rejectionReason}</Notice>}
          {v.status === "approved" && <Notice tone="success">Approved {formatDateLong(v.approvedAt)}. Billboards below are visible to customers while their live status permits.</Notice>}
          {v.status === "changes_requested" && <Notice tone="warn">Waiting for the representative to fix the flagged sections and resubmit.</Notice>}

          <Panel id="business" title={SECTION_LABEL.business} aside={v.logo && <Image src={fileUrl(v.logo)!} alt="" width={40} height={40} className="size-10 rounded-md object-cover" unoptimized />}>
            <KV rows={[
              { k: "Legal name", v: v.legalName }, { k: "Trade name", v: v.tradeName }, { k: "Business type", v: v.businessType ? BUSINESS_TYPE_LABEL[v.businessType] : null },
              { k: "GSTIN", v: <span className="font-mono">{v.gstNumber}</span> }, { k: "PAN", v: <span className="font-mono">{v.panNumber}</span> }, { k: "Pincode", v: v.pincode },
              { k: "Address", v: v.addressLine }, { k: "City", v: v.city }, { k: "State", v: v.state },
            ]} />
            <ReviewBox vendorId={v.id} row={row("business")} />
          </Panel>

          <Panel id="contacts" title={SECTION_LABEL.contacts}>
            <div className="grid gap-4 md:grid-cols-2">
              {(v.contacts ?? []).map((c) => (
                <div key={c.id} className="rounded-lg border border-v-line p-3">
                  <p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">{c.isPrimary ? "Primary (receives login)" : "Secondary"}</p>
                  <KV cols={2} rows={[{ k: "Name", v: c.name }, { k: "Designation", v: c.designation }, { k: "Mobile", v: c.phone }, { k: "Email", v: c.email }]} />
                </div>
              ))}
              {!v.contacts?.length && <p className="text-v-muted">No contacts entered.</p>}
            </div>
            <ReviewBox vendorId={v.id} row={row("contacts")} />
          </Panel>

          <Panel id="documents" title={SECTION_LABEL.documents}>
            <ul className="divide-y divide-v-line">
              {(v.documents ?? []).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 py-2 text-[14px]">
                  <span className="w-[220px] font-medium">{DOC_LABEL[d.docType]}</span>
                  <span className="font-mono text-[12.5px] text-ink-soft">{d.docNumber ?? "—"}</span>
                  <a href={fileUrl(d.file)!} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-v-green hover:underline">
                    Open {d.file?.originalName} <ExternalLink className="size-3.5" />
                  </a>
                </li>
              ))}
              {!v.documents?.length && <li className="py-2 text-v-muted">No documents uploaded.</li>}
            </ul>
            <ReviewBox vendorId={v.id} row={row("documents")} />
          </Panel>

          <Panel id="bank" title={SECTION_LABEL.bank}>
            {v.bankAccount ? (
              <KV rows={[
                { k: "Account holder", v: v.bankAccount.accountHolder }, { k: "Bank", v: v.bankAccount.bankName }, { k: "Branch", v: v.bankAccount.branch },
                { k: "Account number", v: <span className="font-mono">•••• {v.bankAccount.accountLast4}</span> }, { k: "IFSC", v: <span className="font-mono">{v.bankAccount.ifsc}</span> }, { k: "UPI", v: v.bankAccount.upiId },
              ]} />
            ) : <p className="text-v-muted">No bank details entered.</p>}
            <ReviewBox vendorId={v.id} row={row("bank")} />
          </Panel>

          {(v.billboards ?? []).map((b) => {
            const r = row("billboard", b.id);
            return (
              <Panel key={b.id} id={`billboard-${b.id}`} title={`E · ${b.name}`} aside={<span className="flex items-center gap-2 text-[12.5px]"><span className="font-mono text-v-muted">#{b.code}</span><StatusPill status={b.status} />{b.liveStatus && <StatusPill status={b.liveStatus} />}</span>}>
                {b.media && b.media.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                    {b.media.map((m) => (
                      <a key={m.id} href={fileUrl(m.file)!} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-lg border border-v-line bg-v-panel">
                        {m.kind === "traffic_video" ? <video src={fileUrl(m.file)!} className="h-full w-full object-cover" muted /> : <Image src={fileUrl(m.file)!} alt="" fill sizes="160px" className="object-cover" unoptimized />}
                        <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{m.kind.replace("_", " ")}{m.isCover ? " · cover" : ""}</span>
                      </a>
                    ))}
                  </div>
                )}
                <KV rows={[
                  { k: "Category", v: b.category?.name }, { k: "Tier", v: b.tier }, { k: "Screen", v: `${b.screenType.toUpperCase()} · ${Number(b.widthFt)} × ${Number(b.heightFt)} ft` },
                  { k: "Address", v: `${b.addressLine}${b.landmark ? ` (${b.landmark})` : ""}` }, { k: "Locality / City", v: `${b.locality}, ${b.city}, ${b.state} ${b.pincode ?? ""}` }, { k: "Map pin", v: b.lat != null ? <a className="text-v-green hover:underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}>{Number(b.lat).toFixed(5)}, {Number(b.lng).toFixed(5)}</a> : null },
                  { k: "Pixel pitch / Hz / nits", v: [b.pixelPitch, b.refreshRateHz && `${b.refreshRateHz} Hz`, b.brightnessNits && `${b.brightnessNits} nits`].filter(Boolean).join(" · ") || null }, { k: "Viewing angle", v: b.viewingAngleH ? `${b.viewingAngleH}° H / ${b.viewingAngleV}° V` : null }, { k: "Hours", v: `${b.opsStart} – ${b.opsEnd}` },
                  { k: "Loop / slots", v: `${b.loopSeconds} s · ${b.slotsPerLoop} slots` }, { k: "Daily impressions", v: formatNumber(b.dailyImpressions) }, { k: "LokySense", v: b.lokySense ? "Installed" : "No" },
                ]} />
                {b.description && <p className="mt-3 text-[13.5px] text-ink-soft">{b.description}</p>}
                <table className="mt-4 w-full text-[13px]">
                  <thead className="text-[11px] font-semibold tracking-wide text-v-muted uppercase"><tr><th className="py-1 text-left">Slot</th><th className="py-1 text-left">Package</th><th className="py-1 text-right">List</th><th className="py-1 text-right">Offer</th></tr></thead>
                  <tbody>
                    {(b.pricing ?? []).map((p) => <tr key={p.id} className="border-t border-v-line"><td className="py-1.5">{p.slotSeconds} s</td><td className="py-1.5">{PACKAGE_LABEL[p.package]}</td><td className="py-1.5 text-right line-through decoration-v-muted">{formatINR(p.listPrice)}</td><td className="py-1.5 text-right font-semibold text-v-deep">{formatINR(p.offerPrice)}</td></tr>)}
                  </tbody>
                </table>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-v-line pt-4">
                  <TierSelect vendorId={v.id} billboardId={b.id} tier={b.tier} />
                  {b.status === "approved" && <LiveStatusSelect vendorId={v.id} billboardId={b.id} value={b.liveStatus} />}
                  {b.status === "approved" && <Link href={`/billboard/${b.code}`} target="_blank" className="inline-flex items-center gap-1 text-[13px] font-semibold text-v-green hover:underline">View on customer site <ExternalLink className="size-3.5" /></Link>}
                </div>
                <ReviewBox vendorId={v.id} row={r} />
              </Panel>
            );
          })}

          <Panel title="Vendor login">
            {v.user ? (
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-[14px]">Username <span className="font-mono font-semibold">{v.user.username}</span> · {v.user.status} · {v.user.mustChangePassword ? "temporary password pending change" : "password set"} {v.user.lastLoginAt && `· last login ${formatDate(v.user.lastLoginAt)}`}</p>
                <div className="ml-auto"><ResetVendorPassword vendorId={v.id} /></div>
              </div>
            ) : <p className="text-v-muted">No login yet; it is issued when the representative submits.</p>}
          </Panel>

          <Panel title="History">
            <EventTimeline events={events} billboardCode={(id) => v.billboards?.find((b) => b.id === id)?.code} />
          </Panel>
        </div>
      </div>
    </>
  );
}

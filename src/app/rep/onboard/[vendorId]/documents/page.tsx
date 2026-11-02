import { saveDocumentsAction } from "@/actions/onboarding";
import { DocumentsForm, type DocValues } from "@/components/rep/documents-form";
import { SectionFrame } from "@/components/rep/section-frame";
import { DOC_TYPES } from "@/db";
import { fileUrl } from "@/services/files";
import { DOC_LABEL, REQUIRED_DOCS } from "@/services/onboarding";
import { loadStepPage } from "@/services/rep-page";

export default async function DocumentsPage(props: PageProps<"/rep/onboard/[vendorId]/documents">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, step } = await loadStepPage(vendorId);
  const st = step("documents");
  const docs: DocValues[] = DOC_TYPES.map((docType) => {
    const d = (v.documents ?? []).find((x) => x.docType === docType);
    return {
      docType,
      label: DOC_LABEL[docType],
      required: REQUIRED_DOCS.includes(docType),
      existing: d?.file ? { url: fileUrl(d.file)!, name: d.file.originalName, docNumber: d.docNumber } : null,
    };
  });
  return (
    <SectionFrame step={st} saved={sp.saved === "documents"}>
      <DocumentsForm action={saveDocumentsAction.bind(null, v.id)} docs={docs} locked={!st.editable} />
    </SectionFrame>
  );
}

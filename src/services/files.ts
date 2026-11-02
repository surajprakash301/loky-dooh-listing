import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { File as FileRow } from "@/db";
import { env } from "@/lib/server/env";

const LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  pdf: 10 * 1024 * 1024,
};

const uploadRoot = () => path.resolve(process.cwd(), env().UPLOAD_DIR);

function kindOf(mime: string): keyof typeof LIMITS | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return null;
}

export class UploadError extends Error {}

/** Stores an uploaded browser File on local disk and records it in `files`. */
export async function storeUpload(file: File, uploadedBy: number, opts: { public: boolean }): Promise<FileRow> {
  const kind = kindOf(file.type);
  if (!kind) throw new UploadError(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > LIMITS[kind]) throw new UploadError(`${file.name} is larger than ${LIMITS[kind] / 1024 / 1024} MB`);
  if (file.size === 0) throw new UploadError(`${file.name} is empty`);

  const ext = path.extname(file.name).toLowerCase().slice(0, 8) || "";
  const day = new Date().toISOString().slice(0, 10);
  const key = `${day}/${randomUUID()}${ext}`;
  const abs = path.join(uploadRoot(), key);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));

  const row = await FileRow.create({
    storageKey: key,
    publicUrl: null,
    originalName: file.name.slice(0, 255),
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedBy,
  });
  if (opts.public) {
    row.publicUrl = `/api/files/${row.id}`;
    await row.save();
  }
  return row;
}

export async function readStoredFile(row: FileRow): Promise<Buffer> {
  return readFile(path.join(uploadRoot(), row.storageKey));
}

/** URL to render a file: its public URL, or the authenticated file route. */
export function fileUrl(row: { id: number; publicUrl: string | null } | null | undefined): string | null {
  if (!row) return null;
  return row.publicUrl ?? `/api/files/${row.id}`;
}

/** True when the browser sent an actual file in this field (an empty <input type=file> still posts a 0-byte entry). */
export function hasFile(v: FormDataEntryValue | null): v is File {
  return v instanceof File && v.size > 0 && v.name !== "";
}

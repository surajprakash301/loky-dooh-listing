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

/** Storage keys: `<day>/<uuid>.<ext>` on local disk, `blob:<url>` on Vercel Blob, `static:<path>` for seeded assets. */
const BLOB = "blob:";

const uploadRoot = () => path.resolve(process.cwd(), env().UPLOAD_DIR);

function kindOf(mime: string): keyof typeof LIMITS | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return null;
}

export class UploadError extends Error {}

/** A Vercel Blob store is either public or private as a whole; `BLOB_ACCESS` must match the store. */
const blobAccess = () => (process.env.BLOB_ACCESS === "private" ? "private" : "public");

async function writeToStorage(key: string, body: Buffer, contentType: string, isPublic: boolean): Promise<string> {
  if (env().FILE_STORAGE === "blob") {
    const { put } = await import("@vercel/blob");
    const res = await put(isPublic ? key : `private/${key}`, body, {
      access: blobAccess(),
      contentType,
      // Private documents (KYC, brand assets) get a random suffix so their URL cannot be guessed;
      // the app only ever hands them out through the auth-checked /api/files/[id] route.
      addRandomSuffix: !isPublic,
      token: env().BLOB_READ_WRITE_TOKEN,
    });
    return BLOB + res.url;
  }
  const abs = path.join(uploadRoot(), key);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, body);
  return key;
}

/** Stores an uploaded browser File (local disk or Vercel Blob) and records it in `files`. */
export async function storeUpload(file: File, uploadedBy: number, opts: { public: boolean }): Promise<FileRow> {
  const kind = kindOf(file.type);
  if (!kind) throw new UploadError(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > LIMITS[kind]) throw new UploadError(`${file.name} is larger than ${LIMITS[kind] / 1024 / 1024} MB`);
  if (file.size === 0) throw new UploadError(`${file.name} is empty`);

  const ext = path.extname(file.name).toLowerCase().slice(0, 8) || "";
  const day = new Date().toISOString().slice(0, 10);
  const key = `${day}/${randomUUID()}${ext}`;
  const storageKey = await writeToStorage(key, Buffer.from(await file.arrayBuffer()), file.type, opts.public);

  const row = await FileRow.create({
    storageKey,
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

/** True when the row lives in Vercel Blob; returns its direct URL. */
export function blobUrlOf(row: { storageKey: string }): string | null {
  return row.storageKey.startsWith(BLOB) ? row.storageKey.slice(BLOB.length) : null;
}

export async function readStoredFile(row: FileRow, opts: { fresh?: boolean } = {}): Promise<Buffer> {
  const url = blobUrlOf(row);
  if (url) {
    const { get } = await import("@vercel/blob");
    // `fresh` reads from origin storage: a blob uploaded seconds ago may not be on the CDN yet
    const res = await get(url, { access: blobAccess(), token: env().BLOB_READ_WRITE_TOKEN, ...(opts.fresh ? { useCache: false } : {}) });
    if (!res || res.statusCode !== 200) throw new Error(`Blob not found: ${row.id}`);
    return Buffer.from(await new Response(res.stream).arrayBuffer());
  }
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

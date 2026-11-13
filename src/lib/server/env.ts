import { z } from "zod";

const DB_URL = /^(mysql|postgres|postgresql):\/\//;

/** Validated process environment. Fails fast at boot with a readable message instead of a cryptic runtime error. */
const schema = z.object({
  DATABASE_URL: z.string().url().regex(DB_URL, "DATABASE_URL must be a mysql:// or postgres:// URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be 32 bytes as 64 hex characters"),
  /** Where uploads go: local disk (`UPLOAD_DIR`) or Vercel Blob (`BLOB_READ_WRITE_TOKEN`). Auto-picks blob when a token is present. */
  FILE_STORAGE: z.enum(["disk", "blob"]).optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof schema> & { FILE_STORAGE: "disk" | "blob"; DB_DIALECT: "mysql" | "postgres" };

const g = globalThis as unknown as { __lokyEnv?: Env };

export function env(): Env {
  if (!g.__lokyEnv) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid environment:\n${lines}`);
    }
    const d = parsed.data;
    const FILE_STORAGE = d.FILE_STORAGE ?? (d.BLOB_READ_WRITE_TOKEN ? "blob" : "disk");
    if (FILE_STORAGE === "blob" && !d.BLOB_READ_WRITE_TOKEN) throw new Error("Invalid environment:\n  BLOB_READ_WRITE_TOKEN is required when FILE_STORAGE=blob");
    const DB_DIALECT = d.DATABASE_URL.startsWith("mysql://") ? "mysql" : "postgres";
    g.__lokyEnv = { ...d, FILE_STORAGE, DB_DIALECT };
  }
  return g.__lokyEnv;
}

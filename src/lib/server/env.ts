import { z } from "zod";

/** Validated process environment. Fails fast at boot with a readable message instead of a cryptic runtime error. */
const schema = z.object({
  DATABASE_URL: z.string().url().startsWith("mysql://", "DATABASE_URL must be a mysql:// URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be 32 bytes as 64 hex characters"),
  UPLOAD_DIR: z.string().default("./uploads"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof schema>;

const g = globalThis as unknown as { __lokyEnv?: Env };

export function env(): Env {
  if (!g.__lokyEnv) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid environment:\n${lines}`);
    }
    g.__lokyEnv = parsed.data;
  }
  return g.__lokyEnv;
}

import { Op, Sequelize } from "sequelize";
import { env } from "@/lib/server/env";

// One connection pool per process. `globalThis` keeps it alive across Next.js
// dev-server hot reloads instead of opening a new pool on every file change.
const g = globalThis as unknown as { __lokySequelize?: Sequelize };

export function getSequelize(): Sequelize {
  if (!g.__lokySequelize) {
    const { DATABASE_URL, DB_DIALECT } = env();
    // Serverless hosts (Vercel) run many short-lived instances; keep each one's pool tiny so
    // Neon's connection limit is not exhausted. Long-running servers can afford a bigger pool.
    const serverless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    g.__lokySequelize = new Sequelize(DATABASE_URL, {
      dialect: DB_DIALECT,
      logging: false,
      define: DB_DIALECT === "mysql" ? { underscored: true, charset: "utf8mb4", collate: "utf8mb4_unicode_ci" } : { underscored: true },
      pool: serverless ? { max: 3, min: 0, idle: 5_000, acquire: 30_000 } : { max: 10, min: 0, idle: 10_000 },
      timezone: "+05:30",
      // Neon (and most managed Postgres) require TLS. `sslmode=…` in the URL is honoured by pg;
      // this is the fallback when the URL has none and the host is not local.
      ...(DB_DIALECT === "postgres" && !/sslmode=/.test(DATABASE_URL) && !/@(localhost|127\.0\.0\.1)/.test(DATABASE_URL)
        ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: true } } }
        : {}),
    });
  }
  return g.__lokySequelize;
}

/** Case-insensitive LIKE for the active dialect (MySQL collations are already case-insensitive). */
export function likeOp() {
  return env().DB_DIALECT === "postgres" ? Op.iLike : Op.like;
}


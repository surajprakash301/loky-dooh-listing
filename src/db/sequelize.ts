import { Sequelize } from "sequelize";
import { env } from "@/lib/server/env";

// One connection pool per process. `globalThis` keeps it alive across Next.js
// dev-server hot reloads instead of opening a new pool on every file change.
const g = globalThis as unknown as { __lokySequelize?: Sequelize };

export function getSequelize(): Sequelize {
  if (!g.__lokySequelize) {
    g.__lokySequelize = new Sequelize(env().DATABASE_URL, {
      dialect: "mysql",
      logging: false,
      define: { underscored: true, charset: "utf8mb4", collate: "utf8mb4_unicode_ci" },
      pool: { max: 10, min: 0, idle: 10_000 },
      timezone: "+05:30",
    });
  }
  return g.__lokySequelize;
}

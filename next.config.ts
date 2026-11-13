import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sequelize", "mysql2", "pg", "pg-hstore"],
  experimental: {
    // Uploads arrive through server actions. Vercel caps function request bodies at 4.5 MB,
    // so this is the practical ceiling there; self-hosted servers can raise it.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;

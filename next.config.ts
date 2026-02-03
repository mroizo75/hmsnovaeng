import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Standalone kun i produksjon/Docker – på Windows gir filnavn med [ ] og : EINVAL ved copy
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Øk til 50MB for dokumentopplasting
    },
  },
  ...(process.env.NODE_ENV === "production" && process.env.BUILD_STANDALONE === "true"
    ? { output: "standalone" as const }
    : {}),
};

export default withNextIntl(nextConfig);

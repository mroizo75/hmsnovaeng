import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Øk til 50MB for dokumentopplasting
    },
  },
  output: "standalone",
};

export default withNextIntl(nextConfig);

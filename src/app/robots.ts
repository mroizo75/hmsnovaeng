import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/*",
          "/admin/*",
          "/ansatt/*",
          "/api/*",
          "/login",
          "/reset-password",
          "/forgot-password",
        ],
      },
      {
        userAgent: "GPTBot", // ChatGPT crawler
        allow: [
          "/",
          "/priser",
          "/hms-kurs",
          "/bedriftshelsetjeneste",
          "/komplett-pakke",
          "/blogg/*",
        ],
        disallow: [
          "/dashboard/*",
          "/admin/*",
          "/ansatt/*",
          "/api/*",
        ],
      },
      {
        userAgent: "PerplexityBot", // Perplexity AI crawler
        allow: [
          "/",
          "/priser",
          "/hms-kurs",
          "/bedriftshelsetjeneste",
          "/komplett-pakke",
          "/blogg/*",
        ],
        disallow: [
          "/dashboard/*",
          "/admin/*",
          "/ansatt/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}


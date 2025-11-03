import type { Metadata } from "next";
import {
  PAGE_METADATA,
  getOpenGraphDefaults,
  getTwitterDefaults,
  getCanonicalUrl,
  ROBOTS_CONFIG,
} from "@/lib/seo-config";

export const metadata: Metadata = {
  title: PAGE_METADATA.gratisPakke.title,
  description: PAGE_METADATA.gratisPakke.description,
  keywords: PAGE_METADATA.gratisPakke.keywords,
  alternates: {
    canonical: getCanonicalUrl("/gratis-hms-system"),
  },
  robots: ROBOTS_CONFIG,
  openGraph: getOpenGraphDefaults(
    PAGE_METADATA.gratisPakke.title,
    PAGE_METADATA.gratisPakke.description,
    "/gratis-hms-system"
  ),
  twitter: getTwitterDefaults(
    PAGE_METADATA.gratisPakke.title,
    PAGE_METADATA.gratisPakke.description
  ),
};

export default function GratisHMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

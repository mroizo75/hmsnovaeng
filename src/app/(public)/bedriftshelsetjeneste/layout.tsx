import type { Metadata } from "next";
import {
  PAGE_METADATA,
  getOpenGraphDefaults,
  getTwitterDefaults,
  getCanonicalUrl,
  ROBOTS_CONFIG,
  SITE_CONFIG,
} from "@/lib/seo-config";

export const metadata: Metadata = {
  title: PAGE_METADATA.bht.title,
  description: PAGE_METADATA.bht.description,
  keywords: PAGE_METADATA.bht.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  alternates: {
    canonical: getCanonicalUrl("/bedriftshelsetjeneste"),
  },
  robots: ROBOTS_CONFIG,
  openGraph: {
    ...getOpenGraphDefaults(
      PAGE_METADATA.bht.title,
      PAGE_METADATA.bht.description,
      "/bedriftshelsetjeneste"
    ),
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image-bht.png`,
        width: 1200,
        height: 630,
        alt: "HMS Nova Bedriftshelsetjeneste",
      },
    ],
  },
  twitter: {
    ...getTwitterDefaults(
      PAGE_METADATA.bht.title,
      PAGE_METADATA.bht.description
    ),
    images: [`${SITE_CONFIG.url}/og-image-bht.png`],
  },
};

export default function BHTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>

      <main className="min-h-screen">{children}</main>

    </>
  );
}


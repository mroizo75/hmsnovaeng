import type { Metadata } from "next";
import { Providers } from "./providers";
import { CookieConsent } from "@/components/cookie-consent";
import { AITracker } from "@/components/ai-tracker";
import { StructuredData } from "@/components/seo/structured-data";
import {
  SITE_CONFIG,
  PRIMARY_KEYWORDS,
  ORGANIZATION_SCHEMA,
  ROBOTS_CONFIG,
} from "@/lib/seo-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: PRIMARY_KEYWORDS.join(", "),
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: ROBOTS_CONFIG,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.png`],
    creator: "@hmsnova",
  },
  verification: {
    google: "google-site-verification-code", // Bytt ut med faktisk kode
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <head>
        <StructuredData data={ORGANIZATION_SCHEMA} />
      </head>
      <body>
        <Providers>
          <AITracker />
          {children}
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Providers } from "./providers";
import { CookieConsent } from "@/components/cookie-consent";
import { AITracker } from "@/components/ai-tracker";
import { Toaster } from "sonner";
import {
  SITE_CONFIG,
  PRIMARY_KEYWORDS,
  ORGANIZATION_SCHEMA,
  ROBOTS_CONFIG,
} from "@/lib/seo-config";
import { LOCAL_BUSINESS_SCHEMA } from "@/lib/seo-schemas";
import { MultipleStructuredData } from "@/components/seo/structured-data";
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
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: "@hmsnova",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <MultipleStructuredData dataArray={[ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA]} />
      </head>
      <body>
        <Providers>
          <AITracker />
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}

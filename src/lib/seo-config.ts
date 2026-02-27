/**
 * HMS Nova SEO Configuration
 * Optimized for US EHS market and search engines / AI (ChatGPT, Perplexity, etc.)
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ehsnova.com";
const normalizedBaseUrl = rawBaseUrl.startsWith("http") ? rawBaseUrl : `https://${rawBaseUrl}`;

export const SITE_CONFIG = {
  name: "HMS Nova",
  tagline: "Complete EHS Management — $30/month",
  description: "HMS Nova is an all-in-one EHS management platform for US businesses. OSHA recordkeeping, incident reporting, risk assessments, ISO 45001 audits, training matrix, and more — unlimited users, all modules, one flat price.",
  url: normalizedBaseUrl,
  locale: "en_US",
  contactPhone: "+1 (800) 555-0100",
  contactEmail: "us@hmsnova.com",
  socialMedia: {
    linkedin: "https://www.linkedin.com/company/hmsnova",
    facebook: "https://www.facebook.com/hmsnova",
  },
} as const;

export const PRIMARY_KEYWORDS = [
  "EHS management software",
  "EHS system",
  "HMS Nova",
  "OSHA compliance software",
  "ISO 45001",
  "incident reporting software",
  "risk assessment software",
  "EHS handbook",
  "safety inspection software",
  "occupational health software",
  "EHS compliance",
  "digital EHS",
  "EHS automation",
  "workplace safety software",
] as const;

export const SECONDARY_KEYWORDS = [
  "EHS software price",
  "best EHS software",
  "EHS platform",
  "EHS digitalization",
  "EHS mobile app",
  "mobile safety solution",
  "affordable EHS software",
  "EHS software small business",
  "OSHA 300 log software",
  "OSHA recordkeeping",
  "safety data sheet management",
  "chemical registry software",
  "training competency matrix",
  "EHS documentation",
  "5 whys root cause analysis",
  "corrective action software",
] as const;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.name,
  slogan: SITE_CONFIG.tagline,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/opengraph-image`,
  description: SITE_CONFIG.description,
  telephone: SITE_CONFIG.contactPhone,
  email: SITE_CONFIG.contactEmail,
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
  sameAs: [
    SITE_CONFIG.socialMedia.linkedin,
    SITE_CONFIG.socialMedia.facebook,
  ],
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "EHS Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "EHS Management Software",
          description: "Complete digital EHS management platform for US businesses",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "OSHA Compliance Tools",
          description: "OSHA 300/300A/301 log automation, incident reporting and recordkeeping",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "ISO 45001 Audit Module",
          description: "Internal audit management and corrective action tracking for ISO 45001 certification",
        },
      },
    ],
  },
} as const;

export const SOFTWARE_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HMS Nova",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "30",
    highPrice: "30",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "30",
      priceCurrency: "USD",
      unitText: "MONTH",
    },
  },
  featureList: [
    "Digital e-signatures",
    "5x5 risk assessment matrix",
    "Incident reporting & 5-Whys analysis",
    "Automated reminders & alerts",
    "Offline mobile app",
    "ISO 45001 compliance",
    "Document management with version control",
    "Training competency matrix",
    "Chemical hazard register (HazCom 2012)",
    "Internal audits & CAP tracking",
    "Goals & KPI dashboards",
    "OSHA 300/300A/301 log automation",
  ],
  description: "HMS Nova is an all-in-one EHS management platform. $30/month, unlimited users, all modules included — OSHA compliance, ISO 45001 audits, incident reporting, and more.",
  screenshot: `${SITE_CONFIG.url}/opengraph-image`,
} as const;

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is HMS Nova?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova is an all-in-one EHS management platform for US businesses. It covers OSHA recordkeeping, incident reporting, risk assessments, ISO 45001 audits, training matrix, chemical register, and more — all in a single $30/month subscription with unlimited users.",
      },
    },
    {
      "@type": "Question",
      name: "How much does HMS Nova cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova costs $30/month ($360/year) with a 12-month subscription. Unlimited users are included. No setup fees, no per-seat charges, no add-on modules — everything is included from day one.",
      },
    },
    {
      "@type": "Question",
      name: "Does HMS Nova support OSHA compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HMS Nova includes automated OSHA 300, 300A, and 301 log management, incident reporting with 5-Whys root cause analysis, and corrective action tracking. The platform is built to support full OSHA compliance for US businesses.",
      },
    },
    {
      "@type": "Question",
      name: "Does HMS Nova support ISO 45001?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HMS Nova includes a dedicated ISO 45001 internal audit module with corrective and preventive action (CAPA) tracking, management review tools, and KPI dashboards — everything needed to achieve and maintain ISO 45001 certification.",
      },
    },
    {
      "@type": "Question",
      name: "Does HMS Nova work on mobile and offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HMS Nova has a fully offline-capable mobile app — ideal for job sites, warehouses, and field operations. Data syncs automatically when connectivity is restored.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free trial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HMS Nova offers a 14-day free trial with full access to all features. No credit card required. Most teams are fully onboarded within one week.",
      },
    },
  ],
} as const;

// BreadcrumbList for bedre navigasjon i søkeresultater
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_CONFIG.url}${item.url}`,
  })),
});

export const PAGE_METADATA = {
  home: {
    title: "HMS Nova — Complete EHS Management Software | $30/month",
    description: "HMS Nova is an all-in-one EHS platform for US businesses. OSHA compliance, ISO 45001 audits, incident reporting, training matrix — unlimited users, all modules, $30/month. Start free today.",
    keywords: [...PRIMARY_KEYWORDS, ...SECONDARY_KEYWORDS.slice(0, 10)].join(", "),
  },
  priser: {
    title: "Pricing — HMS Nova | $30/month | No Hidden Fees",
    description: "Transparent pricing: $30/month ($360/year) with a 12-month subscription. Unlimited users, all modules included, no setup fees. See everything you get.",
    keywords: "EHS software price, EHS platform cost, affordable EHS software, EHS software all features, best EHS software price",
  },
  kurs: {
    title: "EHS Training — OSHA Courses & Safety Programs | HMS Nova",
    description: "Manage all EHS training in one place. Track certifications, assign courses, and monitor competency with HMS Nova's built-in training matrix.",
    keywords: "EHS training software, OSHA training, safety training management, competency matrix, training records",
  },
  bht: {
    title: "Occupational Health Services — HMS Nova",
    description: "HMS Nova integrates occupational health service management. Track medical surveillance, exposure monitoring, and health program compliance.",
    keywords: "occupational health software, OHS management, medical surveillance, exposure monitoring",
  },
  komplettPakke: {
    title: "Complete EHS Package — HMS Nova",
    description: "Everything you need for EHS compliance. Risk assessments, incident reporting, audits, training, and more — all in one $30/month subscription.",
    keywords: "complete EHS package, EHS setup, EHS implementation, HMS Nova plan",
  },
  handbook: {
    title: "EHS Handbook — Digital & Always Current | HMS Nova",
    description: "Pre-built EHS handbook templates tailored to your industry. Always up-to-date with OSHA requirements, digital e-signatures, and version control.",
    keywords: "EHS handbook, digital EHS handbook, EHS documentation, safety manual",
  },
  risikovurdering: {
    title: "Risk Assessment — 5x5 Matrix & Analysis | HMS Nova",
    description: "Professional risk assessment with 5x5 probability-severity matrix. Easy to use with automatic follow-up. Built for ISO 45001 compliance.",
    keywords: "risk assessment software, risk analysis, 5x5 matrix, risk management, EHS risk assessment",
  },
  vernerunde: {
    title: "Safety Inspection — Digital & Mobile | HMS Nova",
    description: "Digital safety inspections on mobile, works offline. Automatic reporting, perfect for warehouses and job sites.",
    keywords: "safety inspection software, digital safety inspection, inspection checklist, site inspection app",
  },
  lover: {
    title: "EHS Laws & Regulations — OSHA & EPA | HMS Nova",
    description: "Complete overview of US EHS regulations. OSHA standards, EPA requirements, and ISO 45001. Updated 2026.",
    keywords: "OSHA regulations, EPA compliance, EHS laws, workplace safety regulations, OSHA standards",
  },
  iso: {
    title: "ISO 45001 Checklist — Free Download | HMS Nova",
    description: "Free ISO 45001 checklist for full compliance with occupational health and safety management standards. HMS Nova has built-in ISO 45001 support.",
    keywords: "ISO 45001 checklist, ISO 45001 compliance, OHS management, ISO certification",
  },
} as const;

// Open Graph defaults
export const getOpenGraphDefaults = (
  title: string,
  description: string,
  path: string = ""
) => ({
  title,
  description,
  url: `${SITE_CONFIG.url}${path}`,
  siteName: SITE_CONFIG.name,
  locale: SITE_CONFIG.locale,
  type: "website" as const,
});

// Twitter Card defaults
export const getTwitterDefaults = (title: string, description: string) => ({
  card: "summary_large_image" as const,
  title,
  description,
  creator: "@hmsnova",
});

// Robots meta tags
export const ROBOTS_CONFIG = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
  },
} as const;

// Canonical URL helper
export const getCanonicalUrl = (path: string) => {
  return `${SITE_CONFIG.url}${path}`;
};


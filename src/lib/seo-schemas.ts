/**
 * Additional SEO Schemas for specific pages
 * Ekstra strukturerte data for priser, kurs, BHT, etc.
 */

import { SITE_CONFIG } from "./seo-config";

// Pricing Schema for HMS Nova plans
export const PRICING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "HMS Nova Priser",
  description: "Transparente priser for HMS Nova HMS-system",
  itemListElement: [
    {
      "@type": "Offer",
      position: 1,
      name: "Små bedrifter",
      description: "HMS-system for 1-20 ansatte",
      price: "6000",
      priceCurrency: "NOK",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "6000",
        priceCurrency: "NOK",
        unitText: "YEAR",
      },
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      itemOffered: {
        "@type": "Service",
        name: "HMS Nova - Små bedrifter",
        description: "Komplett HMS-system for små bedrifter med opptil 20 brukere",
      },
    },
    {
      "@type": "Offer",
      position: 2,
      name: "Mellomstore bedrifter",
      description: "HMS-system for 21-50 ansatte",
      price: "8000",
      priceCurrency: "NOK",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "8000",
        priceCurrency: "NOK",
        unitText: "YEAR",
      },
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      itemOffered: {
        "@type": "Service",
        name: "HMS Nova - Mellomstore bedrifter",
        description: "HMS-system for mellomstore bedrifter med opptil 50 brukere",
      },
    },
    {
      "@type": "Offer",
      position: 3,
      name: "Store bedrifter",
      description: "HMS-system for 51+ ansatte",
      price: "12000",
      priceCurrency: "NOK",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "12000",
        priceCurrency: "NOK",
        unitText: "YEAR",
      },
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      itemOffered: {
        "@type": "Service",
        name: "HMS Nova - Store bedrifter",
        description: "HMS-system for store bedrifter med ubegrenset brukere",
      },
    },
  ],
} as const;

// Course Schema for HMS-kurs
export const COURSE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "HMS-kurs og Førstehjelp",
  description: "20% rabatt på alle HMS-kurs for HMS Nova-medlemmer",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "Verneombudkurs",
      description: "Lovpålagt 40-timers verneombudkurs",
      provider: {
        "@type": "Organization",
        name: "KKS AS",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: ["onsite", "online", "blended"],
        duration: "P40H",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "Førstehjelp for voksne",
      description: "Grunnleggende førstehjelp med sertifikat",
      provider: {
        "@type": "Organization",
        name: "KKS AS",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: ["onsite"],
        duration: "P8H",
      },
    },
    {
      "@type": "Course",
      position: 3,
      name: "Førstehjelp for barn",
      description: "Førstehjelp spesielt tilpasset barn",
      provider: {
        "@type": "Organization",
        name: "KKS AS",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: ["onsite"],
        duration: "P4H",
      },
    },
  ],
} as const;

// BHT Service Schema
export const BHT_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Bedriftshelsetjeneste (BHT)",
  description: "Godkjent bedriftshelsetjeneste i samarbeid med Dr. Dropin. 10% rabatt for HMS Nova-medlemmer.",
  provider: {
    "@type": "Organization",
    name: SITE_CONFIG.name,
    partner: {
      "@type": "Organization",
      name: "Dr. Dropin",
    },
  },
  serviceType: "Bedriftshelsetjeneste",
  areaServed: {
    "@type": "Country",
    name: "Norway",
  },
  offers: {
    "@type": "Offer",
    description: "10% rabatt for HMS Nova-medlemmer",
    discount: {
      "@type": "Discount",
      discountRate: "0.10",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "3000",
    bestRating: "5",
  },
} as const;

// How-To Schema for Gratis HMS-pakke
export const GRATIS_HMS_HOWTO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Slik får du gratis HMS-pakke",
  description: "Få komplett HMS-håndbok og dokumenter gratis på 5 minutter",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Oppgi bedriftsinformasjon",
      text: "Fyll inn grunnleggende informasjon om din bedrift",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Velg bransje",
      text: "Velg din bransje for bransjespesifikke dokumenter",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Last ned pakken",
      text: "Last ned komplett HMS-pakke med håndbok, risikovurdering og maler",
    },
  ],
} as const;

// Review Schema for testimonials
export const REVIEW_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Review",
  itemReviewed: {
    "@type": "SoftwareApplication",
    name: "HMS Nova",
  },
  author: {
    "@type": "Person",
    name: "Norske bedrifter",
  },
  reviewRating: {
    "@type": "Rating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
  },
  reviewBody: "HMS Nova bygger trygghet. Beste HMS-system vi har brukt.",
} as const;

// LocalBusiness schema (hvis HMS Nova har fysisk kontor)
export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_CONFIG.name,
  image: `${SITE_CONFIG.url}/logo.png`,
  "@id": SITE_CONFIG.url,
  url: SITE_CONFIG.url,
  telephone: SITE_CONFIG.contactPhone,
  email: SITE_CONFIG.contactEmail,
  address: {
    "@type": "PostalAddress",
    addressCountry: "NO",
  },
  geo: {
    "@type": "GeoCoordinates",
    // Legg til faktiske koordinater hvis aktuelt
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "16:00",
  },
  sameAs: [
    SITE_CONFIG.socialMedia.linkedin,
    SITE_CONFIG.socialMedia.facebook,
  ],
} as const;

// WebSite schema with search action
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;


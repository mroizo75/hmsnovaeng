/**
 * HMS Nova SEO Configuration
 * 
 * Fokusområder:
 * - "HMS Nova bygger trygghet" som kjerneverdi
 * - Overgå konkurrenter (Grønn Jobb, Avonova, Kuba)
 * - Optimalisert for både tradisjonelle søkemotorer og AI (ChatGPT, Perplexity, etc.)
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hmsnova.no";
const normalizedBaseUrl = rawBaseUrl.startsWith("http") ? rawBaseUrl : `https://${rawBaseUrl}`;

export const SITE_CONFIG = {
  name: "HMS Nova",
  tagline: "HMS Nova bygger trygghet",
  description: "Norges mest moderne HMS-system. Byggjer trygghet gjennom digitalisering, automatisering og ISO 9001 compliance. Fra små bedrifter til store konsern.",
  url: normalizedBaseUrl,
  locale: "nb_NO",
  contactPhone: "+47 99 11 29 16",
  contactEmail: "post@hmsnova.no",
  socialMedia: {
    linkedin: "https://www.linkedin.com/company/hmsnova",
    facebook: "https://www.facebook.com/hmsnova",
  },
} as const;

// Keywords som overgår konkurrentene
export const PRIMARY_KEYWORDS = [
  "HMS-system",
  "HMS system Norge",
  "HMS Nova",
  "bedriftshelsetjeneste",
  "BHT",
  "ISO 9001",
  "risikovurdering",
  "HMS håndbok",
  "vernerunde",
  "arbeidsmiljø",
  "internkontroll",
  "HMS compliance",
  "digital HMS",
  "HMS automation",
  "trygt arbeidsmiljø",
] as const;

// Sekundære keywords for long-tail SEO
export const SECONDARY_KEYWORDS = [
  "hms system pris",
  "beste hms system",
  "hms programvare",
  "hms digitalisering",
  "hms app",
  "mobil hms løsning",
  "billig hms system",
  "hms system små bedrifter",
  "godkjent bedriftshelsetjeneste",
  "arbeidstilsynet krav",
  "internkontrollforskriften",
  "arbeidsmiljøloven",
  "hms kurs",
  "verneombud opplæring",
  "5 whys analyse",
  "hendelsesrapportering",
  "avviksbehandling",
  "stoffkartotek",
  "sikkerhetsdatablad",
  "kompetansematrise",
  "hms dokumentasjon",
] as const;

// Strukturerte data for søkemotorer
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.name,
  slogan: SITE_CONFIG.tagline,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  description: SITE_CONFIG.description,
  telephone: SITE_CONFIG.contactPhone,
  email: SITE_CONFIG.contactEmail,
  address: {
    "@type": "PostalAddress",
    addressCountry: "NO",
    addressLocality: "Norge",
  },
  sameAs: [
    SITE_CONFIG.socialMedia.linkedin,
    SITE_CONFIG.socialMedia.facebook,
  ],
  areaServed: {
    "@type": "Country",
    name: "Norway",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "HMS-tjenester",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "HMS-system",
          description: "Komplett digitalt HMS-system for norske bedrifter",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bedriftshelsetjeneste",
          description: "Godkjent bedriftshelsetjeneste i samarbeid med Dr. Dropin",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "HMS-kurs",
          description: "Lovpålagte HMS-kurs og førstehjelp",
        },
      },
    ],
  },
} as const;

// Software Product Schema for HMS Nova systemet
export const SOFTWARE_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HMS Nova",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "NOK",
    lowPrice: "6000",
    highPrice: "12000",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "6000",
      priceCurrency: "NOK",
      unitText: "YEAR",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "500",
    bestRating: "5",
  },
  featureList: [
    "Digital signatur",
    "Risikovurdering 5x5 matrise",
    "Hendelsesrapportering",
    "5 Whys analyse",
    "Automatiske påminnelser",
    "Mobilapp (offline)",
    "ISO 9001 compliance",
    "Dokumenthåndtering",
    "Kompetansematrise",
    "Stoffkartotek",
    "Revisjoner og audits",
    "Mål og KPI-oppfølging",
  ],
  description: "HMS Nova bygger trygghet. Norges mest moderne HMS-system med full ISO 9001 compliance, digital signatur og mobilapp. Trusted av 500+ norske bedrifter.",
  screenshot: `${SITE_CONFIG.url}/screenshots/dashboard.png`,
} as const;

// FAQ Schema for bedre synlighet i søk
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hva er HMS Nova?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova er Norges mest moderne HMS-system. Vi bygger trygghet gjennom digitalisering av HMS-arbeid. Med HMS Nova får bedrifter et komplett verktøy for risikovurdering, hendelsesrapportering, dokumenthåndtering og ISO 9001 compliance.",
      },
    },
    {
      "@type": "Question",
      name: "Hva koster HMS Nova?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova starter på 6.000 kr/år for små bedrifter (1-20 ansatte), 8.000 kr/år for mellomstore bedrifter (21-50 ansatte), og 12.000 kr/år for store bedrifter (51+ ansatte). Ingen oppstartskostnader, ingen bindingstid, alt inkludert.",
      },
    },
    {
      "@type": "Question",
      name: "Er HMS Nova godkjent av Arbeidstilsynet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova følger alle krav i Arbeidsmiljøloven, Internkontrollforskriften og ISO 9001:2015. Systemet er bygget for å sikre full compliance med norsk lov og internasjonale standarder.",
      },
    },
    {
      "@type": "Question",
      name: "Kan HMS Nova erstatte tradisjonell bedriftshelsetjeneste?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova er et HMS-system, ikke en bedriftshelsetjeneste. Men vi samarbeider med Dr. Dropin BHT (godkjent av Arbeidstilsynet) og gir 10% rabatt til HMS Nova-medlemmer. Systemet og BHT utfyller hverandre perfekt.",
      },
    },
    {
      "@type": "Question",
      name: "Fungerer HMS Nova på mobil og offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja! HMS Nova har full mobilstøtte og fungerer offline. Perfekt for byggeplasser, verksteder og feltarbeid. Synkronisering skjer automatisk når du er tilbake online.",
      },
    },
    {
      "@type": "Question",
      name: "Hvordan skiller HMS Nova seg fra Grønn Jobb, Avonova og Kuba?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMS Nova er 100% digitalt og moderne. Vi har digital signatur inkludert (ikke ekstrakostnad), ingen bindingstid, mobilapp med offline-støtte, og betydelig lavere priser. Vår visjon er enkel: HMS Nova bygger trygghet - ikke byråkrati.",
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

// Page-spesifikke metadata templates
export const PAGE_METADATA = {
  home: {
    title: "HMS Nova - Norges Mest Moderne HMS-system | HMS Nova Bygger Trygghet",
    description: "HMS Nova bygger trygghet. Få kontroll på HMS med digital signatur, automatiske påminnelser, mobilapp og ISO 9001 compliance. 500+ norske bedrifter stoler på oss. Prøv gratis i 14 dager.",
    keywords: [...PRIMARY_KEYWORDS, ...SECONDARY_KEYWORDS.slice(0, 10)].join(", "),
  },
  priser: {
    title: "Priser - HMS Nova | Fra 500 kr/mnd | Ingen Skjulte Kostnader",
    description: "Transparente priser på HMS-system. Fra 6.000 kr/år for små bedrifter. Ingen oppstartskostnader, ingen bindingstid. 20% medlemsrabatt på HMS-kurs og 10% på BHT. Se alle priser.",
    keywords: "hms system pris, hms programvare kostnad, billig hms system, hms system små bedrifter, beste hms system pris",
  },
  kurs: {
    title: "HMS-kurs - Lovpålagte Kurs & Førstehjelp | HMS Nova",
    description: "20% rabatt på alle HMS-kurs for HMS Nova-medlemmer. Verneombud, ledelse, førstehjelp, diisocyanater. Godkjent av KKS AS. Fysisk, digitalt eller hybrid. Bestill i dag.",
    keywords: "hms kurs, verneombud kurs, førstehjelp kurs, hms opplæring, lovpålagt hms kurs",
  },
  bht: {
    title: "Bedriftshelsetjeneste - 10% Rabatt for Medlemmer | HMS Nova",
    description: "Godkjent bedriftshelsetjeneste fra Dr. Dropin. HMS Nova-medlemmer får 10% rabatt. Digital integrasjon, ingen bindingstid. 3000+ bedrifter stoler på Dr. Dropin BHT.",
    keywords: "bedriftshelsetjeneste, BHT, godkjent bedriftshelsetjeneste, arbeidstilsynet bht, dr dropin bht",
  },
  gratisPakke: {
    title: "Gratis HMS-pakke - Last Ned Ferdig HMS-håndbok | HMS Nova",
    description: "Få gratis HMS-pakke med ferdig HMS-håndbok, risikovurderingsmaler, vernerundemal og mer. Perfekt for små bedrifter. Last ned i dag - ingen forpliktelser.",
    keywords: "gratis hms håndbok, hms mal gratis, vernerunde mal, risikovurdering mal, gratis hms dokumenter",
  },
  handbook: {
    title: "HMS-håndbok - Digital & Oppdatert | HMS Nova",
    description: "Ferdig HMS-håndbok tilpasset din bedrift. Alltid oppdatert med siste lovkrav. Digital signatur, versjonskontroll og automatisk distribusjon. Spar uker med arbeid.",
    keywords: "hms håndbok, digital hms håndbok, hms dokumentasjon, arbeidsmiljøhåndbok",
  },
  risikovurdering: {
    title: "Risikovurdering - 5x5 Matrise & Analyse | HMS Nova",
    description: "Profesjonell risikovurdering med 5x5 matrise (ISO 9001). Enkelt å bruke, automatisk oppfølging av tiltak. Bestå revisjoner med glans. Prøv gratis.",
    keywords: "risikovurdering, risikoanalyse, 5x5 matrise, risikostyring, hms risikovurdering",
  },
  vernerunde: {
    title: "Vernerunde-guide - Digital Vernerunde på Mobil | HMS Nova",
    description: "Gjennomfør vernerunder digitalt på mobil. Fungerer offline. Automatisk rapportering og oppfølging. Perfekt for byggeplasser og verksteder.",
    keywords: "vernerunde, digital vernerunde, vernerunde mal, sikkerhetsinspeksjon, bygningsvernerunde",
  },
  lover: {
    title: "HMS Lover & Regler - Arbeidsmiljøloven & ISO 9001 | HMS Nova",
    description: "Komplett oversikt over HMS-lover og regler i Norge. Arbeidsmiljøloven, Internkontrollforskriften, ISO 9001. Oppdatert med siste endringer.",
    keywords: "arbeidsmiljøloven, internkontrollforskriften, iso 9001, hms lovverk, arbeidstilsynet regler",
  },
  iso: {
    title: "ISO 9001 Sjekkliste - Gratis Last Ned | HMS Nova",
    description: "Komplett ISO 9001 sjekkliste. Sikre full compliance med kvalitetsstyringsstandarden. HMS Nova har innebygd ISO 9001-støtte.",
    keywords: "iso 9001 sjekkliste, iso 9001 compliance, kvalitetsstyring, iso sertifisering",
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
  images: [
    {
      url: `${SITE_CONFIG.url}/og-image.png`,
      width: 1200,
      height: 630,
      alt: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    },
  ],
});

// Twitter Card defaults
export const getTwitterDefaults = (title: string, description: string) => ({
  card: "summary_large_image" as const,
  title,
  description,
  images: [`${SITE_CONFIG.url}/og-image.png`],
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


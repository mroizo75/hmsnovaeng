/**
 * Subscription utility functions
 * Håndterer logikk for abonnements-pakker og brukerbegrensninger
 * 
 * Pakker speiler priser fra /priser siden og er lik Grønn Jobb sine pakker
 */

export type PricingTier = "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

export interface SubscriptionLimits {
  maxUsers: number;
  price: number;
  name: string;
  description: string;
}

/**
 * Hent grenser og info for en gitt pricing tier
 * Speiler prisene fra /priser siden (hmsnova.no/priser)
 */
export function getSubscriptionLimits(tier: PricingTier | null): SubscriptionLimits {
  switch (tier) {
    case "MICRO":
      // Små bedrifter: 1-20 ansatte
      return {
        maxUsers: 20,
        price: 6000,
        name: "Små bedrifter",
        description: "Opptil 20 brukere inkludert",
      };
    case "SMALL":
      // Mellomstore bedrifter: 21-50 ansatte
      return {
        maxUsers: 50,
        price: 8000,
        name: "Mellomstore bedrifter",
        description: "Opptil 50 brukere inkludert",
      };
    case "MEDIUM":
      // Store bedrifter: 51+ ansatte (ubegrenset)
      return {
        maxUsers: 999, // "Ubegrenset" i praksis
        price: 12000,
        name: "Store bedrifter",
        description: "Ubegrenset brukere",
      };
    case "LARGE":
      // DEPRECATED: Bruk MEDIUM for store bedrifter
      // Beholdt for bakoverkompatibilitet
      return {
        maxUsers: 999,
        price: 12000,
        name: "Store bedrifter",
        description: "Ubegrenset brukere",
      };
    default:
      // Default til MICRO hvis ikke satt (standard pakke)
      return {
        maxUsers: 20,
        price: 6000,
        name: "Små bedrifter",
        description: "Opptil 20 brukere inkludert",
      };
  }
}

/**
 * Sjekk om tenant har nådd maks antall brukere
 */
export function hasReachedUserLimit(currentUsers: number, tier: PricingTier | null): boolean {
  const limits = getSubscriptionLimits(tier);
  return currentUsers >= limits.maxUsers;
}

/**
 * Få anbefalt tier basert på antall ansatte
 * Matcher prisstruktur fra hmsnova.no/priser
 */
export function getRecommendedTier(employeeCount: number): PricingTier {
  if (employeeCount <= 20) return "MICRO";  // Små bedrifter
  if (employeeCount <= 50) return "SMALL";  // Mellomstore bedrifter
  return "MEDIUM";  // Store bedrifter (51+)
}


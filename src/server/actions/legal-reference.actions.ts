"use server";

import { prisma } from "@/lib/db";

/**
 * Henter juridiske referanser som gjelder for tenantens bransje.
 * Tilgjengelig for alle roller – ingen rollebasert begrensning.
 */
export async function getLegalReferencesForIndustry(industry: string | null) {
  const all = await prisma.legalReference.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const applicable = all.filter((ref) => {
    const industries = ref.industries as string[];
    if (!industries || industries.length === 0) return false;
    if (industries.includes("all")) return true;
    if (!industry) return false;
    return industries.includes(industry.toLowerCase());
  });

  return applicable;
}

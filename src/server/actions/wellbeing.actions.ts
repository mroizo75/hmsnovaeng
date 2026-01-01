"use server";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/server-authorization";
import { createNotification, notifyUsersByRole } from "./notification.actions";

/**
 * FASE 3: Psykososialt Arbeidsmiljø - Automatisk Vurdering
 * 
 * Dette systemet analyserer WELLBEING-skjemaer og:
 * 1. Beregner scores per seksjon
 * 2. Identifiserer kritiske områder
 * 3. Oppretter automatisk risikovurdering hvis nødvendig
 * 4. Foreslår konkrete tiltak
 * 5. Varsler BHT/HMS-ansvarlige
 */

interface WellbeingScore {
  section: string;
  average: number;
  criticalFields: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendations: string[];
}

interface WellbeingAnalysis {
  overallScore: number;
  sections: WellbeingScore[];
  criticalIncidents: CriticalIncident[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  requiresAction: boolean;
  riskId?: string;
  measures: string[];
}

interface CriticalIncident {
  type: string;
  frequency: string;
  involvedParties?: string[];
  description?: string;
}

/**
 * Analyser en WELLBEING submission
 */
export async function analyzeWellbeingSubmission(submissionId: string): Promise<WellbeingAnalysis> {
  const submission = await prisma.formSubmission.findUnique({
    where: { id: submissionId },
    include: {
      formTemplate: {
        include: { fields: true }
      },
      fieldValues: true
    }
  });

  if (!submission || submission.formTemplate.category !== "WELLBEING") {
    throw new Error("Ikke et psykososialt skjema");
  }

  const fields = submission.formTemplate.fields;
  const values = submission.fieldValues;

  // Definer seksjoner (basert på standard psykososialt skjema)
  const sections = [
    {
      name: "Arbeidsbelastning",
      keywords: ["arbeidsmengde", "tid", "stress", "krav"],
    },
    {
      name: "Rolle og forutsigbarhet",
      keywords: ["forvent", "ansvar", "endring", "forutsigbar"],
    },
    {
      name: "Sosialt arbeidsmiljø",
      keywords: ["stemning", "respekt", "inkludert", "samarbeid"],
    },
    {
      name: "Ledelse og støtte",
      keywords: ["støtte", "leder", "tilbakemelding", "konflikt", "rettferdig"],
    },
  ];

  // Beregn scores per seksjon
  const sectionScores: WellbeingScore[] = sections.map(section => {
    // Finn LIKERT_SCALE felt som matcher denne seksjonen
    const sectionFields = fields.filter(field => 
      field.fieldType === "LIKERT_SCALE" &&
      section.keywords.some(keyword => 
        field.label.toLowerCase().includes(keyword)
      )
    );

    // Hent verdier for disse feltene
    const sectionValues = sectionFields
      .map(field => {
        const value = values.find(v => v.fieldId === field.id);
        return value ? parseInt(value.value || "0", 10) : null;
      })
      .filter(v => v !== null) as number[];

    // Beregn gjennomsnitt
    const average = sectionValues.length > 0
      ? sectionValues.reduce((a, b) => a + b, 0) / sectionValues.length
      : 0;

    // Identifiser kritiske felt (score ≤ 2)
    const criticalFields = sectionFields
      .filter((field, index) => sectionValues[index] !== null && sectionValues[index] <= 2)
      .map(field => field.label);

    // Bestem risikonivå
    const riskLevel = average < 2.5 ? "HIGH" : average < 3.5 ? "MEDIUM" : "LOW";

    // Generer anbefalinger basert på risiko
    const recommendations = generateSectionRecommendations(section.name, riskLevel, criticalFields);

    return {
      section: section.name,
      average,
      criticalFields,
      riskLevel,
      recommendations,
    };
  });

  // Sjekk kritiske forhold (Del 5)
  const criticalIncidents = checkCriticalIncidents(fields, values);

  // Beregn overall score
  const overallScore = sectionScores.length > 0
    ? sectionScores.reduce((sum, s) => sum + s.average, 0) / sectionScores.length
    : 0;

  // Bestem overall risk level
  const hasHighRiskSection = sectionScores.some(s => s.riskLevel === "HIGH");
  const hasCriticalIncidents = criticalIncidents.some(i => i.frequency !== "Aldri");
  const overallRiskLevel = 
    hasHighRiskSection || hasCriticalIncidents ? "HIGH" :
    sectionScores.some(s => s.riskLevel === "MEDIUM") ? "MEDIUM" :
    "LOW";

  const requiresAction = overallRiskLevel === "HIGH" || overallRiskLevel === "MEDIUM";

  // Opprett risikovurdering og tiltak hvis nødvendig
  let riskId: string | undefined;
  let measures: string[] = [];

  if (requiresAction) {
    const result = await createWellbeingRisk(
      submission.tenantId,
      sectionScores,
      criticalIncidents,
      overallScore,
      overallRiskLevel
    );
    riskId = result.riskId;
    measures = result.measures;
  }

  return {
    overallScore,
    sections: sectionScores,
    criticalIncidents,
    riskLevel: overallRiskLevel,
    requiresAction,
    riskId,
    measures,
  };
}

/**
 * Generer anbefalinger per seksjon
 */
function generateSectionRecommendations(
  section: string,
  riskLevel: string,
  criticalFields: string[]
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === "LOW") {
    return ["✅ Området fungerer godt - fortsett det gode arbeidet"];
  }

  switch (section) {
    case "Arbeidsbelastning":
      if (riskLevel === "HIGH") {
        recommendations.push("Gjennomfør umiddelbart dialogmøte om arbeidsmengde");
        recommendations.push("Kartlegg og prioriter arbeidsoppgaver");
        recommendations.push("Vurder behov for ressursforsterkninger");
      } else {
        recommendations.push("Følg opp arbeidsbelastning i neste medarbeidersamtale");
        recommendations.push("Sikre jevnlig dialog om arbeidsmengde");
      }
      break;

    case "Rolle og forutsigbarhet":
      if (riskLevel === "HIGH") {
        recommendations.push("Avklar forventninger og ansvarsområder skriftlig");
        recommendations.push("Etabler rutiner for kommunikasjon av endringer");
        recommendations.push("Gjennomfør rolleklarifisering");
      } else {
        recommendations.push("Følg opp i medarbeidersamtaler");
        recommendations.push("Forbedre informasjonsflyten");
      }
      break;

    case "Sosialt arbeidsmiljø":
      if (riskLevel === "HIGH") {
        recommendations.push("🚨 Gjennomfør kartlegging av samarbeidsmiljøet");
        recommendations.push("Vurder ekstern bistand (BHT/HMS-ekspert)");
        recommendations.push("Etabler tiltak for å bedre samarbeid og inkludering");
      } else {
        recommendations.push("Styrk team-building aktiviteter");
        recommendations.push("Følg opp i vernerunder");
      }
      break;

    case "Ledelse og støtte":
      if (riskLevel === "HIGH") {
        recommendations.push("Lederopplæring i psykososialt arbeidsmiljø (påkrevd)");
        recommendations.push("Gjennomfør medarbeidersamtaler med fokus på støtte");
        recommendations.push("Vurder endringer i lederskap/organisering");
      } else {
        recommendations.push("Lederutvikling innen feedback og støtte");
        recommendations.push("Jevnlige medarbeidersamtaler");
      }
      break;
  }

  return recommendations;
}

/**
 * Sjekk kritiske forhold (mobbing, trakassering, etc.)
 */
function checkCriticalIncidents(fields: any[], values: any[]): CriticalIncident[] {
  const incidents: CriticalIncident[] = [];

  const criticalTypes = [
    { keyword: "mobbing", type: "MOBBING" },
    { keyword: "trakassering", type: "TRAKASSERING" },
    { keyword: "press", type: "UTILBORLIG_PRESS" },
    { keyword: "konflikt", type: "UHÅNDTERTE_KONFLIKTER" },
  ];

  criticalTypes.forEach(({ keyword, type }) => {
    const field = fields.find(f => 
      f.fieldType === "RADIO" && 
      f.label.toLowerCase().includes(keyword)
    );

    if (field) {
      const value = values.find(v => v.fieldId === field.id);
      const frequency = value?.value || "Aldri";

      if (frequency !== "Aldri") {
        incidents.push({
          type,
          frequency,
        });
      }
    }
  });

  return incidents;
}

/**
 * Opprett risikovurdering og tiltak
 */
async function createWellbeingRisk(
  tenantId: string,
  sectionScores: WellbeingScore[],
  criticalIncidents: CriticalIncident[],
  overallScore: number,
  riskLevel: string
): Promise<{ riskId: string; measures: string[] }> {
  
  // Finn høyrisiko-seksjoner
  const highRiskSections = sectionScores.filter(s => s.riskLevel === "HIGH");
  const mediumRiskSections = sectionScores.filter(s => s.riskLevel === "MEDIUM");

  // Generer beskrivelse
  const description = generateRiskDescription(sectionScores, criticalIncidents, overallScore);

  // Opprett risikovurdering
  const risk = await prisma.risk.create({
    data: {
      tenantId,
      title: "Belastende psykososialt arbeidsmiljø",
      category: "HEALTH", // Psykososialt hører under helse
      context: "Psykososial kartlegging",
      description,
      likelihood: calculateLikelihood(overallScore, criticalIncidents),
      consequence: 4, // Alvorlig (kan føre til sykefravær, redusert trivsel)
      score: calculateLikelihood(overallScore, criticalIncidents) * 4, // likelihood * consequence
      status: "OPEN",
      ownerId: "", // Settes til HMS-ansvarlig senere
    },
  });

  // Generer og opprett tiltak
  const measureTitles: string[] = [];
  const suggestedMeasures = generateWellbeingMeasures(
    highRiskSections,
    mediumRiskSections,
    criticalIncidents
  );

  // Finn HMS-ansvarlig eller første bruker med HMS/BHT-rolle
  const hmsUser = await prisma.userTenant.findFirst({
    where: {
      tenantId,
      role: { in: ["HMS", "BHT", "ADMIN"] }
    },
    select: { userId: true }
  });

  const defaultResponsibleId = hmsUser?.userId || "";

  // Oppdater risk owner
  if (defaultResponsibleId) {
    await prisma.risk.update({
      where: { id: risk.id },
      data: { ownerId: defaultResponsibleId }
    });
  }

  for (const measure of suggestedMeasures) {
    await prisma.measure.create({
      data: {
        tenantId,
        riskId: risk.id,
        title: measure.title,
        description: measure.description,
        status: "PENDING",
        category: "PREVENTIVE",
        dueAt: measure.dueDate,
        responsibleId: defaultResponsibleId,
      },
    });
    measureTitles.push(measure.title);
  }

  // Varsle BHT/HMS-ansvarlige
  const highRiskAreas = highRiskSections.map(s => s.section).join(", ");
  const message = criticalIncidents.length > 0
    ? `🚨 KRITISK: Psykososial kartlegging viser alvorlige forhold (${criticalIncidents.map(i => i.type).join(", ")}). Umiddelbar oppfølging påkrevd!`
    : `⚠️ Psykososial kartlegging viser høy risiko innen: ${highRiskAreas}. Se risikovurdering og foreslåtte tiltak.`;

  await notifyUsersByRole(tenantId, "BHT", {
    type: "NEW_INCIDENT", // Bruker NEW_INCIDENT for å sikre høy prioritet
    title: "⚠️ Psykososial risiko identifisert",
    message,
    link: `/dashboard/risks/${risk.id}`,
  });

  await notifyUsersByRole(tenantId, "HMS", {
    type: "NEW_INCIDENT",
    title: "⚠️ Psykososial risiko identifisert",
    message,
    link: `/dashboard/risks/${risk.id}`,
  });

  console.log(`✅ [Wellbeing] Risikovurdering opprettet: ${risk.id}`);
  console.log(`✅ [Wellbeing] ${suggestedMeasures.length} tiltak foreslått`);

  return {
    riskId: risk.id,
    measures: measureTitles,
  };
}

/**
 * Generer risikobeskrivelse
 */
function generateRiskDescription(
  sectionScores: WellbeingScore[],
  criticalIncidents: CriticalIncident[],
  overallScore: number
): string {
  let description = `**Psykososial kartlegging - Automatisk analyse**\n\n`;
  description += `**Samlet score:** ${overallScore.toFixed(2)}/5\n\n`;

  // Kritiske forhold først
  if (criticalIncidents.length > 0) {
    description += `**🚨 KRITISKE FORHOLD:**\n`;
    criticalIncidents.forEach(incident => {
      description += `- ${incident.type}: ${incident.frequency}\n`;
    });
    description += `\n`;
  }

  // Seksjonsvurderinger
  description += `**Seksjonsvurdering:**\n\n`;
  sectionScores.forEach(section => {
    const emoji = section.riskLevel === "HIGH" ? "🔴" : section.riskLevel === "MEDIUM" ? "🟡" : "🟢";
    description += `${emoji} **${section.section}** (${section.average.toFixed(2)}/5)\n`;
    
    if (section.criticalFields.length > 0) {
      description += `   Kritiske områder:\n`;
      section.criticalFields.forEach(field => {
        description += `   - ${field}\n`;
      });
    }
    description += `\n`;
  });

  description += `\n**Konsekvens:**\n`;
  description += `Økt risiko for sykefravær, redusert trivsel, helseplager, og potensielt høyt turnover.\n\n`;

  description += `**Årsak:**\n`;
  const highRiskAreas = sectionScores.filter(s => s.riskLevel === "HIGH").map(s => s.section);
  if (highRiskAreas.length > 0) {
    description += `Kartleggingen viser betydelige utfordringer innen: ${highRiskAreas.join(", ")}.\n`;
  }

  return description;
}

/**
 * Beregn sannsynlighet (1-5)
 */
function calculateLikelihood(overallScore: number, criticalIncidents: CriticalIncident[]): number {
  // Hvis kritiske forhold er rapportert ofte: Høy sannsynlighet
  if (criticalIncidents.some(i => i.frequency === "Ofte")) {
    return 5;
  }
  
  // Hvis kritiske forhold av og til: Middels-høy
  if (criticalIncidents.some(i => i.frequency === "Av og til")) {
    return 4;
  }

  // Basert på score
  if (overallScore < 2.5) return 4; // Høy
  if (overallScore < 3.5) return 3; // Middels
  return 2; // Lav-middels
}

/**
 * Generer tiltak basert på analyse
 */
function generateWellbeingMeasures(
  highRiskSections: WellbeingScore[],
  mediumRiskSections: WellbeingScore[],
  criticalIncidents: CriticalIncident[]
): Array<{ title: string; description: string; dueDate: Date }> {
  const measures: Array<{ title: string; description: string; dueDate: Date }> = [];
  const now = new Date();

  // KRITISKE TILTAK (umiddelbar oppfølging)
  if (criticalIncidents.some(i => i.type === "MOBBING" || i.type === "TRAKASSERING")) {
    measures.push({
      title: "🚨 AKUTT: Håndtere mobbing/trakassering",
      description: `Umiddelbar oppfølging av rapporterte tilfeller av mobbing/trakassering er påkrevd etter Arbeidsmiljøloven § 4-3.\n\n` +
        `Tiltak:\n` +
        `1. Informere berørte parter om varsling\n` +
        `2. Gjennomføre undersøkelse\n` +
        `3. Iverksette nødvendige tiltak\n` +
        `4. Sikre oppfølging og evaluering\n\n` +
        `Vurder ekstern bistand (BHT, advokat).`,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dager
    });
  }

  // HØYPRIORITERTE TILTAK per seksjon
  highRiskSections.forEach(section => {
    section.recommendations.forEach(rec => {
      if (rec.includes("🚨")) {
        measures.push({
          title: `${section.section}: ${rec.replace("🚨 ", "")}`,
          description: `Basert på psykososial kartlegging er det identifisert høy risiko innen ${section.section}.\n\n` +
            `Kritiske områder:\n${section.criticalFields.map(f => `- ${f}`).join("\n")}\n\n` +
            `Anbefalt handling: ${rec}`,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dager
        });
      }
    });
  });

  // Standard tiltak for høyrisiko-områder
  if (highRiskSections.some(s => s.section === "Arbeidsbelastning")) {
    measures.push({
      title: "Dialogmøte: Arbeidsbelastning og prioritering",
      description: `Gjennomfør møte med berørte ansatte for å:\n` +
        `- Kartlegge arbeidsmengde\n` +
        `- Prioritere arbeidsoppgaver\n` +
        `- Identifisere mulige forbedringer\n` +
        `- Vurdere behov for ressursforsterkninger`,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    });
  }

  if (highRiskSections.some(s => s.section === "Ledelse og støtte")) {
    measures.push({
      title: "Lederopplæring: Psykososialt arbeidsmiljø",
      description: `Påkrevd opplæring for ledere i:\n` +
        `- Arbeidsmiljøloven § 4-3 (psykososialt arbeidsmiljø)\n` +
        `- Forebygging av stress og belastning\n` +
        `- Konflikthåndtering\n` +
        `- Støtte til ansatte\n\n` +
        `Vurder ekstern kurs eller BHT-bistand.`,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dager
    });
  }

  // OPPFØLGINGSTILTAK
  measures.push({
    title: "Ny psykososial kartlegging (oppfølging)",
    description: `Gjennomfør ny kartlegging for å evaluere effekten av iverksatte tiltak.\n\n` +
      `Dette sikrer systematisk oppfølging som kreves i HMS-forskriften § 5.`,
    dueDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 dager (3 måneder)
  });

  return measures;
}

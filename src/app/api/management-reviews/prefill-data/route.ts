import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/management-reviews/prefill-data - Hent data for forhåndsutfylling
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Hent periode fra query params (default: siste 3 måneder)
    const { searchParams } = new URL(req.url);
    const monthsBack = parseInt(searchParams.get("months") || "3");
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Parallell henting av alle data
    const [
      goals,
      incidents,
      risks,
      audits,
      inspections,
      trainings,
      measures,
    ] = await Promise.all([
      // HMS-mål
      db.goal.findMany({
        where: { tenantId },
        include: {
          measurements: {
            orderBy: { measurementDate: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Hendelser og avvik
      db.incident.findMany({
        where: {
          tenantId,
          incidentDate: { gte: startDate },
        },
        include: {
          investigation: true,
        },
        orderBy: { incidentDate: "desc" },
      }),

      // Risikovurderinger
      db.risk.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
      }),

      // Revisjoner
      db.audit.findMany({
        where: {
          tenantId,
          scheduledDate: { gte: startDate },
        },
        include: {
          findings: true,
        },
        orderBy: { scheduledDate: "desc" },
      }),

      // Inspeksjoner/Vernerunder
      db.inspection.findMany({
        where: {
          tenantId,
          scheduledDate: { gte: startDate },
        },
        include: {
          findings: true,
        },
        orderBy: { scheduledDate: "desc" },
      }),

      // Opplæring
      db.training.findMany({
        where: {
          tenantId,
          date: { gte: startDate },
        },
        orderBy: { date: "desc" },
      }),

      // Tiltak
      db.measure.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Generer tekst for HMS-mål
    const hmsGoalsReview = generateGoalsReview(goals);

    // Generer tekst for hendelser
    const incidentStatistics = generateIncidentStatistics(incidents);

    // Generer tekst for risikovurderinger
    const riskReview = generateRiskReview(risks);

    // Generer tekst for revisjoner
    const auditResults = generateAuditResults(audits, inspections);

    // Generer tekst for opplæring
    const trainingStatus = generateTrainingStatus(trainings);

    return NextResponse.json({
      data: {
        hmsGoalsReview,
        incidentStatistics,
        riskReview,
        auditResults,
        trainingStatus,
        // Raw data for evt. videre prosessering
        raw: {
          goals,
          incidents,
          risks,
          audits,
          inspections,
          trainings,
          measures,
        },
      },
    });
  } catch (error: any) {
    console.error("[MANAGEMENT_REVIEWS_PREFILL_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generer tekst for HMS-mål
function generateGoalsReview(goals: any[]): string {
  if (goals.length === 0) {
    return "Ingen HMS-mål er registrert i perioden.\n\n⚠️ ANBEFALING: Sett opp målbare HMS-mål for neste periode.";
  }

  let text = `## HMS-mål og måloppnåelse\n\n`;
  text += `Totalt antall mål: ${goals.length}\n\n`;

  goals.forEach((goal, index) => {
    text += `### ${index + 1}. ${goal.title}\n`;
    text += `- Type: ${goal.type}\n`;
    text += `- Mål: ${goal.targetValue} ${goal.unit}\n`;
    text += `- Status: ${goal.status}\n`;
    text += `- Startdato: ${new Date(goal.startDate).toLocaleDateString("nb-NO")}\n`;
    text += `- Sluttdato: ${new Date(goal.endDate).toLocaleDateString("nb-NO")}\n`;

    if (goal.measurements && goal.measurements.length > 0) {
      const latest = goal.measurements[0];
      text += `- Siste måling: ${latest.value} ${goal.unit} (${new Date(latest.measurementDate).toLocaleDateString("nb-NO")})\n`;
      
      // Beregn måloppnåelse
      const progress = (parseFloat(latest.value) / parseFloat(goal.targetValue)) * 100;
      text += `- Måloppnåelse: ${progress.toFixed(1)}%\n`;
    } else {
      text += `- ⚠️ Ingen målinger registrert\n`;
    }

    text += `\n`;
  });

  // Oppsummering
  const completedGoals = goals.filter(g => g.status === "COMPLETED").length;
  const inProgressGoals = goals.filter(g => g.status === "IN_PROGRESS").length;
  const notStartedGoals = goals.filter(g => g.status === "NOT_STARTED").length;

  text += `\n### Oppsummering\n`;
  text += `- ✅ Fullført: ${completedGoals}\n`;
  text += `- 🔄 Pågående: ${inProgressGoals}\n`;
  text += `- ⏸️ Ikke startet: ${notStartedGoals}\n`;

  return text;
}

// Generer tekst for hendelser
function generateIncidentStatistics(incidents: any[]): string {
  if (incidents.length === 0) {
    return "Ingen hendelser eller avvik registrert i perioden.\n\n✅ Dette er positivt, men sørg for at ansatte vet hvordan de rapporterer hendelser.";
  }

  let text = `## Hendelser og avvik\n\n`;
  text += `Totalt antall hendelser: ${incidents.length}\n\n`;

  // Gruppér etter type
  const types = {
    ACCIDENT: 0,
    NEAR_MISS: 0,
    OBSERVATION: 0,
    ILLNESS: 0,
  };

  incidents.forEach((incident) => {
    if (incident.type in types) {
      types[incident.type as keyof typeof types]++;
    }
  });

  text += `### Hendelser per type\n`;
  text += `- 🚨 Ulykker: ${types.ACCIDENT}\n`;
  text += `- ⚠️ Nestenulykker: ${types.NEAR_MISS}\n`;
  text += `- 👁️ Observasjoner: ${types.OBSERVATION}\n`;
  text += `- 🏥 Sykdom/helseplager: ${types.ILLNESS}\n\n`;

  // Gruppér etter alvorlighetsgrad
  const severities = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  incidents.forEach((incident) => {
    if (incident.severity in severities) {
      severities[incident.severity as keyof typeof severities]++;
    }
  });

  text += `### Alvorlighetsgrad\n`;
  text += `- 🟢 Lav: ${severities.LOW}\n`;
  text += `- 🟡 Middels: ${severities.MEDIUM}\n`;
  text += `- 🟠 Høy: ${severities.HIGH}\n`;
  text += `- 🔴 Kritisk: ${severities.CRITICAL}\n\n`;

  // Status på hendelser
  const statuses = {
    OPEN: 0,
    UNDER_INVESTIGATION: 0,
    CLOSED: 0,
  };

  incidents.forEach((incident) => {
    if (incident.status in statuses) {
      statuses[incident.status as keyof typeof statuses]++;
    }
  });

  text += `### Status\n`;
  text += `- 📂 Åpne: ${statuses.OPEN}\n`;
  text += `- 🔍 Under etterforskning: ${statuses.UNDER_INVESTIGATION}\n`;
  text += `- ✅ Lukket: ${statuses.CLOSED}\n\n`;

  // Hendelser med etterforskning
  const investigated = incidents.filter(i => i.investigation).length;
  text += `### Etterforskning\n`;
  text += `- ${investigated} av ${incidents.length} hendelser har gjennomført etterforskning (${((investigated / incidents.length) * 100).toFixed(0)}%)\n\n`;

  // Anbefaling
  if (statuses.OPEN > 0 || statuses.UNDER_INVESTIGATION > 0) {
    text += `⚠️ PÅKREVD OPPFØLGING: ${statuses.OPEN + statuses.UNDER_INVESTIGATION} hendelser mangler lukking.\n`;
  }

  if (types.ACCIDENT > 0) {
    text += `⚠️ VIKTIG: ${types.ACCIDENT} ulykker er registrert. Sørg for grundig rotårsaksanalyse og korrigerende tiltak.\n`;
  }

  return text;
}

// Generer tekst for risikovurderinger
function generateRiskReview(risks: any[]): string {
  if (risks.length === 0) {
    return "Ingen risikovurderinger er registrert.\n\n🚨 KRITISK: Risikovurdering er lovpålagt (Arbeidsmiljøloven § 3-1). Dette må gjøres umiddelbart.";
  }

  let text = `## Risikovurderinger\n\n`;
  text += `Totalt antall registrerte risikoer: ${risks.length}\n\n`;

  // Gruppér etter risikonivå
  const riskLevels = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  risks.forEach((risk) => {
    const score = risk.probability * risk.consequence;
    if (score <= 4) riskLevels.LOW++;
    else if (score <= 9) riskLevels.MEDIUM++;
    else if (score <= 16) riskLevels.HIGH++;
    else riskLevels.CRITICAL++;
  });

  text += `### Risikonivå (5x5 matrise)\n`;
  text += `- 🟢 Lav risiko (1-4): ${riskLevels.LOW}\n`;
  text += `- 🟡 Middels risiko (5-9): ${riskLevels.MEDIUM}\n`;
  text += `- 🟠 Høy risiko (10-16): ${riskLevels.HIGH}\n`;
  text += `- 🔴 Kritisk risiko (17-25): ${riskLevels.CRITICAL}\n\n`;

  // Risikoer med tiltak
  const withMeasures = risks.filter(r => r.proposedMeasures && r.proposedMeasures.trim().length > 0).length;
  text += `### Tiltak\n`;
  text += `- ${withMeasures} av ${risks.length} risikoer har foreslåtte tiltak (${((withMeasures / risks.length) * 100).toFixed(0)}%)\n\n`;

  // Risikoer med høy/kritisk score som mangler tiltak
  const highRisksWithoutMeasures = risks.filter(r => {
    const score = r.probability * r.consequence;
    return score >= 10 && (!r.proposedMeasures || r.proposedMeasures.trim().length === 0);
  });

  if (highRisksWithoutMeasures.length > 0) {
    text += `🚨 KRITISK: ${highRisksWithoutMeasures.length} høyrisiko/kritiske risikoer mangler tiltak:\n`;
    highRisksWithoutMeasures.slice(0, 5).forEach(r => {
      text += `  - ${r.hazard} (Score: ${r.probability * r.consequence})\n`;
    });
    text += `\n`;
  }

  // Gamle risikovurderinger (ikke oppdatert siste 12 mnd)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const outdatedRisks = risks.filter(r => new Date(r.updatedAt) < oneYearAgo);

  if (outdatedRisks.length > 0) {
    text += `⚠️ ANBEFALING: ${outdatedRisks.length} risikovurderinger er ikke oppdatert siste 12 måneder. Disse bør gjennomgås.\n`;
  }

  return text;
}

// Generer tekst for revisjoner
function generateAuditResults(audits: any[], inspections: any[]): string {
  let text = `## Revisjoner og inspeksjoner\n\n`;

  // Revisjoner
  if (audits.length === 0) {
    text += `⚠️ Ingen revisjoner gjennomført i perioden.\n`;
    text += `ISO 9001 krever minimum én internrevisjon per år.\n\n`;
  } else {
    text += `### Revisjoner\n`;
    text += `Totalt antall revisjoner: ${audits.length}\n\n`;

    const auditStatuses = {
      PLANNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };

    let totalFindings = 0;
    let criticalFindings = 0;

    audits.forEach((audit) => {
      if (audit.status in auditStatuses) {
        auditStatuses[audit.status as keyof typeof auditStatuses]++;
      }
      if (audit.findings) {
        totalFindings += audit.findings.length;
        criticalFindings += audit.findings.filter((f: any) => f.severity === "MAJOR" || f.severity === "CRITICAL").length;
      }
    });

    text += `Status:\n`;
    text += `- Planlagt: ${auditStatuses.PLANNED}\n`;
    text += `- Pågående: ${auditStatuses.IN_PROGRESS}\n`;
    text += `- Fullført: ${auditStatuses.COMPLETED}\n\n`;

    text += `Funn:\n`;
    text += `- Totalt antall funn: ${totalFindings}\n`;
    text += `- Kritiske/alvorlige funn: ${criticalFindings}\n\n`;

    if (criticalFindings > 0) {
      text += `🚨 PÅKREVD OPPFØLGING: ${criticalFindings} kritiske/alvorlige funn må følges opp.\n\n`;
    }
  }

  // Inspeksjoner/Vernerunder
  if (inspections.length === 0) {
    text += `### Vernerunder/Inspeksjoner\n`;
    text += `⚠️ Ingen vernerunder gjennomført i perioden.\n`;
    text += `Arbeidsmiljøloven krever regelmessige vernerunder.\n\n`;
  } else {
    text += `### Vernerunder/Inspeksjoner\n`;
    text += `Totalt antall inspeksjoner: ${inspections.length}\n\n`;

    const inspectionStatuses = {
      PLANNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };

    let totalInspectionFindings = 0;
    let criticalInspectionFindings = 0;

    inspections.forEach((inspection) => {
      if (inspection.status in inspectionStatuses) {
        inspectionStatuses[inspection.status as keyof typeof inspectionStatuses]++;
      }
      if (inspection.findings) {
        totalInspectionFindings += inspection.findings.length;
        criticalInspectionFindings += inspection.findings.filter((f: any) => f.severity === "HIGH" || f.severity === "CRITICAL").length;
      }
    });

    text += `Status:\n`;
    text += `- Planlagt: ${inspectionStatuses.PLANNED}\n`;
    text += `- Pågående: ${inspectionStatuses.IN_PROGRESS}\n`;
    text += `- Fullført: ${inspectionStatuses.COMPLETED}\n\n`;

    text += `Funn:\n`;
    text += `- Totalt antall funn: ${totalInspectionFindings}\n`;
    text += `- Kritiske/høy alvorlighetsgrad: ${criticalInspectionFindings}\n\n`;

    if (criticalInspectionFindings > 0) {
      text += `⚠️ VIKTIG: ${criticalInspectionFindings} kritiske funn fra vernerunder må følges opp.\n`;
    }
  }

  return text;
}

// Generer tekst for opplæring
function generateTrainingStatus(trainings: any[]): string {
  if (trainings.length === 0) {
    return "Ingen opplæring er registrert i perioden.\n\n⚠️ ANBEFALING: Dokumenter all opplæring. Dette er viktig for compliance og ved tilsyn.";
  }

  let text = `## Opplæring og kompetanse\n\n`;
  text += `Totalt antall opplæringer: ${trainings.length}\n\n`;

  // Gruppér etter type
  const types = {
    HMS_INTRODUCTION: 0,
    FIRST_AID: 0,
    FIRE_SAFETY: 0,
    SAFETY_REPRESENTATIVE: 0,
    SPECIFIC_TASK: 0,
    REFRESHER: 0,
    EXTERNAL_COURSE: 0,
    OTHER: 0,
  };

  trainings.forEach((training) => {
    if (training.type in types) {
      types[training.type as keyof typeof types]++;
    }
  });

  text += `### Opplæring per type\n`;
  text += `- HMS-introduksjon: ${types.HMS_INTRODUCTION}\n`;
  text += `- Førstehjelp: ${types.FIRST_AID}\n`;
  text += `- Brannsikkerhet: ${types.FIRE_SAFETY}\n`;
  text += `- Verneombud: ${types.SAFETY_REPRESENTATIVE}\n`;
  text += `- Spesifikk oppgave: ${types.SPECIFIC_TASK}\n`;
  text += `- Oppfriskningskurs: ${types.REFRESHER}\n`;
  text += `- Eksternt kurs: ${types.EXTERNAL_COURSE}\n`;
  text += `- Annet: ${types.OTHER}\n\n`;

  // Status
  const statuses = {
    PLANNED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  trainings.forEach((training) => {
    if (training.status in statuses) {
      statuses[training.status as keyof typeof statuses]++;
    }
  });

  text += `### Status\n`;
  text += `- ✅ Gjennomført: ${statuses.COMPLETED}\n`;
  text += `- 📅 Planlagt: ${statuses.PLANNED}\n`;
  text += `- ❌ Kansellert: ${statuses.CANCELLED}\n\n`;

  // Totalt antall deltakere
  const totalParticipants = trainings.reduce((sum, t) => {
    try {
      const participants = JSON.parse(t.participants || "[]");
      return sum + participants.length;
    } catch {
      return sum;
    }
  }, 0);

  text += `### Deltakelse\n`;
  text += `- Totalt antall opplæringsdeltakelser: ${totalParticipants}\n\n`;

  // Anbefalinger
  if (types.FIRST_AID === 0) {
    text += `⚠️ ANBEFALING: Ingen førstehjelpsopplæring registrert. Dette er ofte lovpålagt.\n`;
  }

  if (types.FIRE_SAFETY === 0) {
    text += `⚠️ ANBEFALING: Ingen brannsikkerhetsopplæring registrert. Dette er ofte lovpålagt.\n`;
  }

  if (statuses.PLANNED > 0) {
    text += `\n📅 INFO: ${statuses.PLANNED} planlagte opplæringer bør gjennomføres snarest.\n`;
  }

  return text;
}


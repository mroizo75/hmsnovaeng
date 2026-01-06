/**
 * Miljørapport-generator for Miljøfyrtårn-godkjenning
 * Genererer profesjonell årlig miljørapport med Adobe PDF Services
 */

import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type {
  EnvironmentalAspect,
  EnvironmentalMeasurement,
  Goal,
  Measure,
  User,
} from "@prisma/client";

interface ReportData {
  tenant: {
    id: string;
    name: string;
    orgNumber: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    industry: string | null;
  };
  year: number;
  aspects: Array<
    EnvironmentalAspect & {
      owner: Pick<User, "name" | "email"> | null;
      goal: Pick<Goal, "title" | "targetValue" | "currentValue" | "unit"> | null;
      measurements: EnvironmentalMeasurement[];
    }
  >;
  measurements: Array<
    EnvironmentalMeasurement & {
      aspect: { title: string; category: string };
      responsible: { name: string | null } | null;
    }
  >;
  goals: Array<
    Goal & {
      measurements: Array<{ measurementDate: Date; value: number; }>;
    }
  >;
  measures: Array<
    Measure & {
      responsible: { name: string | null };
      environmentalAspect: { title: string; category: string } | null;
    }
  >;
}

// CO2 konverteringsfaktorer
const CO2_FACTORS = {
  ENERGY: 0.385,
  WATER: 0.001,
  WASTE: 0.5,
  EMISSIONS: 1.0,
  RESOURCE_USE: 0.2,
};

export async function generateEnvironmentalReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Miljørapport ${data.year} - ${data.tenant.name}`,
          Author: data.tenant.name,
          Subject: "Årlig miljørapport for Miljøfyrtårn",
          Keywords: "miljø, bærekraft, miljøfyrtårn, ISO 14001",
          Creator: "HMS Nova",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // FORSIDE
      generateCoverPage(doc, data);

      // INNHOLDSFORTEGNELSE
      doc.addPage();
      generateTableOfContents(doc);

      // 1. SAMMENDRAG
      doc.addPage();
      generateExecutiveSummary(doc, data);

      // 2. OM BEDRIFTEN
      doc.addPage();
      generateCompanyInfo(doc, data);

      // 3. MILJØASPEKTER OG PÅVIRKNING
      doc.addPage();
      generateAspectsSection(doc, data);

      // 4. MILJØMÅL OG RESULTATER
      doc.addPage();
      generateGoalsSection(doc, data);

      // 5. MÅLINGER OG DATA
      doc.addPage();
      generateMeasurementsSection(doc, data);

      // 6. CO2-FOTAVTRYKK OG BESPARELSER
      doc.addPage();
      generateCO2Section(doc, data);

      // 7. TILTAK OG HANDLINGSPLAN
      doc.addPage();
      generateActionsSection(doc, data);

      // 8. KONKLUSJON OG NESTE STEG
      doc.addPage();
      generateConclusion(doc, data);

      // VEDLEGG
      doc.addPage();
      generateAppendix(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateCoverPage(doc: PDFKit.PDFDocument, data: ReportData) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Grønn header-boks
  doc
    .rect(0, 0, pageWidth, 200)
    .fill("#10b981");

  // Logo/ikon område (hvit sirkel)
  doc
    .circle(pageWidth / 2, 100, 50)
    .fill("#ffffff");

  // Grønt blad-ikon (emoji eller tekst)
  doc
    .fontSize(40)
    .fillColor("#10b981")
    .text("🌿", pageWidth / 2 - 20, 75);

  // Tittel
  doc
    .fontSize(32)
    .fillColor("#1f2937")
    .font("Helvetica-Bold")
    .text("MILJØRAPPORT", 50, 250, { align: "center" });

  doc
    .fontSize(48)
    .fillColor("#10b981")
    .text(data.year.toString(), 50, 295, { align: "center" });

  // Bedriftsnavn
  doc
    .fontSize(24)
    .fillColor("#4b5563")
    .font("Helvetica")
    .text(data.tenant.name, 50, 370, { align: "center" });

  // Undertekst
  doc
    .fontSize(14)
    .fillColor("#6b7280")
    .text("Årlig rapport for Miljøfyrtårn-sertifisering", 50, 420, { align: "center" });
  
  doc
    .fontSize(12)
    .text("I henhold til ISO 14001:2015", 50, 445, { align: "center" });

  // Bunntekst
  const generatedDate = format(new Date(), "d. MMMM yyyy", { locale: nb });
  doc
    .fontSize(10)
    .fillColor("#9ca3af")
    .text(`Generert: ${generatedDate}`, 50, pageHeight - 100, { align: "center" });

  doc
    .text("HMS Nova - Digitalt HMS-system", 50, pageHeight - 80, { align: "center" });

  // Grønn footer-stripe
  doc
    .rect(0, pageHeight - 50, pageWidth, 50)
    .fill("#10b981");
}

function generateTableOfContents(doc: PDFKit.PDFDocument) {
  addSectionHeader(doc, "Innholdsfortegnelse");

  const contents = [
    { title: "1. Sammendrag", page: 3 },
    { title: "2. Om bedriften", page: 4 },
    { title: "3. Miljøaspekter og påvirkning", page: 5 },
    { title: "4. Miljømål og resultater", page: 6 },
    { title: "5. Målinger og data", page: 7 },
    { title: "6. CO₂-fotavtrykk og besparelser", page: 8 },
    { title: "7. Tiltak og handlingsplan", page: 9 },
    { title: "8. Konklusjon og neste steg", page: 10 },
    { title: "Vedlegg", page: 11 },
  ];

  let y = doc.y + 20;
  contents.forEach((item) => {
    doc
      .fontSize(12)
      .fillColor("#374151")
      .font("Helvetica")
      .text(item.title, 70, y);

    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .text(`Side ${item.page}`, 500, y, { align: "right" });

    y += 25;
  });
}

function generateExecutiveSummary(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "1. Sammendrag");

  const totalAspects = data.aspects.length;
  const criticalAspects = data.aspects.filter((a) => a.significanceScore >= 20).length;
  const totalMeasurements = data.measurements.length;
  const goalsAchieved = data.goals.filter((g) => g.status === "ACHIEVED").length;
  const totalGoals = data.goals.length;
  const completedMeasures = data.measures.filter((m) => m.status === "DONE").length;
  const totalMeasures = data.measures.length;

  // Beregn CO2
  let totalCO2Savings = 0;
  data.measurements.forEach((m) => {
    const category = m.aspect.category as keyof typeof CO2_FACTORS;
    const factor = CO2_FACTORS[category] || 0;
    if (m.targetValue && m.measuredValue < m.targetValue) {
      totalCO2Savings += (m.targetValue - m.measuredValue) * factor;
    }
  });

  addBodyText(
    doc,
    `Dette er ${data.tenant.name} sin miljørapport for ${data.year}. Rapporten dokumenterer bedriftens miljøprestasjon, mål, tiltak og resultater i henhold til kravene for Miljøfyrtårn-sertifisering og ISO 14001:2015.`
  );

  doc.moveDown();
  addBodyText(doc, "**Nøkkeltall for " + data.year + ":**");
  doc.moveDown(0.5);

  const keyStats = [
    `• Registrerte miljøaspekter: ${totalAspects} (${criticalAspects} kritiske)`,
    `• Gjennomførte målinger: ${totalMeasurements}`,
    `• Miljømål oppnådd: ${goalsAchieved} av ${totalGoals}`,
    `• Tiltak gjennomført: ${completedMeasures} av ${totalMeasures}`,
    `• Estimert CO₂-besparelse: ${totalCO2Savings.toFixed(0)} kg`,
  ];

  keyStats.forEach((stat) => {
    addBodyText(doc, stat);
  });

  doc.moveDown();
  addBodyText(
    doc,
    `Bedriften har i ${data.year} arbeidet systematisk med miljøstyring og har oppnådd gode resultater innenfor reduksjon av miljøpåvirkning. Rapporten viser en positiv utvikling og kontinuerlig forbedring.`
  );
}

function generateCompanyInfo(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "2. Om bedriften");

  addSubHeader(doc, "Bedriftsinformasjon");

  const companyInfo = [
    `Navn: ${data.tenant.name}`,
    data.tenant.orgNumber ? `Org.nr: ${data.tenant.orgNumber}` : null,
    data.tenant.address ? `Adresse: ${data.tenant.address}` : null,
    data.tenant.postalCode && data.tenant.city
      ? `${data.tenant.postalCode} ${data.tenant.city}`
      : null,
    data.tenant.contactEmail ? `E-post: ${data.tenant.contactEmail}` : null,
    data.tenant.contactPhone ? `Telefon: ${data.tenant.contactPhone}` : null,
    data.tenant.industry ? `Bransje: ${data.tenant.industry}` : null,
  ].filter(Boolean);

  companyInfo.forEach((info) => {
    addBodyText(doc, info!);
  });

  doc.moveDown();
  addSubHeader(doc, "Miljøpolicy");
  addBodyText(
    doc,
    `${data.tenant.name} er forpliktet til å drive virksomheten på en miljømessig forsvarlig måte. Vi jobber kontinuerlig for å redusere vår miljøpåvirkning gjennom systematisk miljøstyring i henhold til ISO 14001 og Miljøfyrtårn-kravene.`
  );

  doc.moveDown();
  addBodyText(doc, "**Våre forpliktelser:**");
  doc.moveDown(0.5);

  const commitments = [
    "• Forebygge forurensning og redusere miljøpåvirkning",
    "• Overholde gjeldende miljølovgivning og forskrifter",
    "• Sette målbare miljømål og arbeide for kontinuerlig forbedring",
    "• Involvere ansatte i miljøarbeidet",
    "• Være åpne om vår miljøprestasjon",
  ];

  commitments.forEach((c) => addBodyText(doc, c));
}

function generateAspectsSection(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "3. Miljøaspekter og påvirkning");

  addBodyText(
    doc,
    `Bedriften har identifisert ${data.aspects.length} miljøaspekter som er vurdert for betydning. Nedenfor følger en oversikt over de mest vesentlige miljøaspektene.`
  );

  doc.moveDown();

  // Gruppér etter kategori
  const categories = {
    ENERGY: "Energibruk",
    WATER: "Vannforbruk",
    WASTE: "Avfallshåndtering",
    EMISSIONS: "Utslipp til luft",
    RESOURCE_USE: "Ressursbruk",
    BIODIVERSITY: "Biologisk mangfold",
    OTHER: "Annet",
  };

  Object.entries(categories).forEach(([key, label]) => {
    const aspectsInCategory = data.aspects.filter((a) => a.category === key);
    if (aspectsInCategory.length === 0) return;

    addSubHeader(doc, label);

    aspectsInCategory.slice(0, 3).forEach((aspect) => {
      addBodyText(doc, `**${aspect.title}**`);
      if (aspect.description) {
        addBodyText(doc, aspect.description, { indent: 20 });
      }
      addBodyText(
        doc,
        `Betydning: ${aspect.significanceScore}/25 • Status: ${getStatusLabel(aspect.status)}`,
        { indent: 20, fontSize: 10, color: "#6b7280" }
      );
      if (aspect.controlMeasures) {
        addBodyText(doc, `Kontrolltiltak: ${aspect.controlMeasures}`, {
          indent: 20,
          fontSize: 10,
        });
      }
      doc.moveDown(0.5);
    });

    if (aspectsInCategory.length > 3) {
      addBodyText(doc, `... og ${aspectsInCategory.length - 3} flere aspekter`, {
        fontSize: 10,
        color: "#6b7280",
      });
    }

    doc.moveDown();
  });
}

function generateGoalsSection(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "4. Miljømål og resultater");

  if (data.goals.length === 0) {
    addBodyText(doc, "Ingen miljømål er registrert for dette året.");
    return;
  }

  addBodyText(
    doc,
    `Bedriften har satt ${data.goals.length} miljømål for ${data.year}. Nedenfor følger en oversikt over målene og status.`
  );

  doc.moveDown();

  data.goals.forEach((goal, index) => {
    addSubHeader(doc, `Mål ${index + 1}: ${goal.title}`);

    if (goal.description) {
      addBodyText(doc, goal.description);
    }

    const status = getGoalStatusLabel(goal.status);
    const progress = goal.targetValue && goal.currentValue
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : 0;

    addBodyText(doc, `**Status:** ${status}`);
    if (goal.targetValue) {
      addBodyText(
        doc,
        `**Målverdi:** ${goal.targetValue} ${goal.unit || ""} • **Oppnådd:** ${goal.currentValue || 0} ${goal.unit || ""} (${progress}%)`
      );
    }

    if (goal.deadline) {
      addBodyText(
        doc,
        `**Frist:** ${format(new Date(goal.deadline), "d. MMMM yyyy", { locale: nb })}`
      );
    }

    doc.moveDown();
  });
}

function generateMeasurementsSection(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "5. Målinger og data");

  if (data.measurements.length === 0) {
    addBodyText(doc, "Ingen målinger er registrert for dette året.");
    return;
  }

  addBodyText(
    doc,
    `Totalt ${data.measurements.length} målinger er gjennomført i ${data.year}. Nedenfor følger en oppsummering av måledata.`
  );

  doc.moveDown();

  // Gruppér målinger per kategori
  const measurementsByCategory: Record<string, typeof data.measurements> = {};
  data.measurements.forEach((m) => {
    const cat = m.aspect.category;
    if (!measurementsByCategory[cat]) {
      measurementsByCategory[cat] = [];
    }
    measurementsByCategory[cat].push(m);
  });

  Object.entries(measurementsByCategory).forEach(([category, measurements]) => {
    const categoryLabel = getCategoryLabel(category);
    addSubHeader(doc, categoryLabel);

    // Beregn statistikk
    const values = measurements.map((m) => m.measuredValue);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const compliant = measurements.filter((m) => m.status === "COMPLIANT").length;

    addBodyText(doc, `Antall målinger: ${measurements.length}`);
    addBodyText(doc, `Gjennomsnitt: ${avg.toFixed(2)} ${measurements[0].unit || ""}`);
    addBodyText(doc, `Min: ${min.toFixed(2)} • Maks: ${max.toFixed(2)}`);
    addBodyText(doc, `I samsvar: ${compliant}/${measurements.length} målinger`);

    doc.moveDown();
  });
}

function generateCO2Section(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "6. CO₂-fotavtrykk og besparelser");

  // Beregn CO2-besparelser per kategori
  const co2ByCategory: Record<string, number> = {};
  let totalCO2 = 0;

  data.measurements.forEach((m) => {
    const category = m.aspect.category as keyof typeof CO2_FACTORS;
    const factor = CO2_FACTORS[category] || 0;

    if (m.targetValue && m.measuredValue < m.targetValue) {
      const savings = (m.targetValue - m.measuredValue) * factor;
      co2ByCategory[category] = (co2ByCategory[category] || 0) + savings;
      totalCO2 += savings;
    }
  });

  addBodyText(
    doc,
    `Basert på registrerte målinger og miljøaspekter har bedriften oppnådd en estimert CO₂-besparelse på **${totalCO2.toFixed(0)} kg CO₂** i ${data.year}.`
  );

  doc.moveDown();
  addSubHeader(doc, "Besparelse per kategori");

  Object.entries(co2ByCategory).forEach(([category, savings]) => {
    const label = getCategoryLabel(category);
    addBodyText(doc, `• ${label}: ${savings.toFixed(0)} kg CO₂`);
  });

  doc.moveDown();
  addSubHeader(doc, "Dette tilsvarer:");

  const trees = Math.round(totalCO2 / 21);
  const cars = totalCO2 / 4600;

  addBodyText(doc, `• ${trees} trær som absorberer CO₂ i ett år`);
  if (cars >= 0.1) {
    addBodyText(doc, `• ${cars.toFixed(1)} biler fjernet fra veien i ett år`);
  }

  doc.moveDown();
  addBodyText(
    doc,
    "*Beregninger er basert på standardfaktorer for norske forhold og er estimater.",
    { fontSize: 9, color: "#6b7280" }
  );
}

function generateActionsSection(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "7. Tiltak og handlingsplan");

  if (data.measures.length === 0) {
    addBodyText(doc, "Ingen miljøtiltak er registrert for dette året.");
    return;
  }

  const completed = data.measures.filter((m) => m.status === "DONE").length;
  const inProgress = data.measures.filter((m) => m.status === "IN_PROGRESS").length;
  const pending = data.measures.filter((m) => m.status === "PENDING").length;

  addBodyText(
    doc,
    `Totalt ${data.measures.length} miljøtiltak er registrert for ${data.year}. Status: ${completed} fullført, ${inProgress} pågående, ${pending} planlagt.`
  );

  doc.moveDown();
  addSubHeader(doc, "Gjennomførte tiltak");

  data.measures
    .filter((m) => m.status === "DONE")
    .slice(0, 5)
    .forEach((measure) => {
      addBodyText(doc, `**${measure.description}**`);
      if (measure.environmentalAspect) {
        addBodyText(doc, `Relatert til: ${measure.environmentalAspect.title}`, {
          indent: 20,
          fontSize: 10,
        });
      }
      if (measure.responsible?.name) {
        addBodyText(doc, `Ansvarlig: ${measure.responsible.name}`, {
          indent: 20,
          fontSize: 10,
        });
      }
      if (measure.completedAt) {
        addBodyText(
          doc,
          `Fullført: ${format(new Date(measure.completedAt), "d. MMMM yyyy", { locale: nb })}`,
          { indent: 20, fontSize: 10 }
        );
      }
      doc.moveDown(0.5);
    });

  if (inProgress > 0 || pending > 0) {
    doc.moveDown();
    addSubHeader(doc, "Pågående og planlagte tiltak");

    data.measures
      .filter((m) => m.status === "IN_PROGRESS" || m.status === "PENDING")
      .slice(0, 5)
      .forEach((measure) => {
        addBodyText(doc, `• ${measure.description}`);
      });
  }
}

function generateConclusion(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "8. Konklusjon og neste steg");

  const goalsAchieved = data.goals.filter((g) => g.status === "ACHIEVED").length;
  const totalGoals = data.goals.length;
  const completedMeasures = data.measures.filter((m) => m.status === "DONE").length;

  addBodyText(
    doc,
    `${data.tenant.name} har i ${data.year} arbeidet systematisk med miljøstyring og kontinuerlig forbedring. Bedriften har oppnådd ${goalsAchieved} av ${totalGoals} miljømål og gjennomført ${completedMeasures} miljøtiltak.`
  );

  doc.moveDown();
  addBodyText(
    doc,
    "Resultatene viser en positiv utvikling, og bedriften oppfyller kravene til Miljøfyrtårn-sertifisering. Miljøstyringssystemet er velfungerende og bidrar til redusert miljøpåvirkning."
  );

  doc.moveDown();
  addSubHeader(doc, "Planer for neste år");

  const nextYearActions = [
    "• Videreføre systematisk miljøovervåking og måling",
    "• Oppdatere og forsterke miljømål basert på årets resultater",
    "• Gjennomføre planlagte miljøtiltak",
    "• Involvere ansatte i kontinuerlig forbedring",
    "• Evaluere og oppdatere miljøaspekter årlig",
  ];

  nextYearActions.forEach((action) => addBodyText(doc, action));

  doc.moveDown(2);

  // Signatur
  addBodyText(doc, `Godkjent av ledelsen, ${format(new Date(), "d. MMMM yyyy", { locale: nb })}`);
  doc.moveDown(3);
  doc
    .moveTo(100, doc.y)
    .lineTo(300, doc.y)
    .stroke("#d1d5db");
  doc.moveDown(0.5);
  addBodyText(doc, "Signatur", { fontSize: 10, color: "#6b7280" });
}

function generateAppendix(doc: PDFKit.PDFDocument, data: ReportData) {
  addSectionHeader(doc, "Vedlegg");

  addSubHeader(doc, "A. Definisjoner og forkortelser");
  const definitions = [
    "**ISO 14001:** Internasjonal standard for miljøledelse",
    "**Miljøfyrtårn:** Norsk miljøsertifiseringsordning",
    "**Miljøaspekt:** Element i virksomhetens aktiviteter som kan påvirke miljøet",
    "**Betydning:** Kombinasjon av alvorlighet og sannsynlighet (1-25)",
    "**CO₂-ekvivalent:** Mengde klimagasser målt i karbondioksid-ekvivalenter",
  ];

  definitions.forEach((def) => {
    addBodyText(doc, def);
    doc.moveDown(0.3);
  });

  doc.moveDown();
  addSubHeader(doc, "B. Beregningsmetoder");
  addBodyText(doc, "**CO₂-faktorer brukt i rapporten:**");
  doc.moveDown(0.5);

  const factors = [
    `• Energi: ${CO2_FACTORS.ENERGY} kg CO₂/kWh`,
    `• Vann: ${CO2_FACTORS.WATER * 1000} kg CO₂/m³`,
    `• Avfall: ${CO2_FACTORS.WASTE} kg CO₂/kg`,
    `• Utslipp: ${CO2_FACTORS.EMISSIONS} kg CO₂/kg`,
    `• Ressursbruk: ${CO2_FACTORS.RESOURCE_USE} kg CO₂/enhet`,
  ];

  factors.forEach((f) => addBodyText(doc, f));

  doc.moveDown();
  addBodyText(
    doc,
    "*Faktorer er basert på norske forhold og standarder fra Miljødirektoratet og Statistisk sentralbyrå.",
    { fontSize: 9, color: "#6b7280" }
  );

  doc.moveDown(2);
  addSubHeader(doc, "C. Kontaktinformasjon");
  addBodyText(doc, "For spørsmål om denne rapporten, kontakt:");
  doc.moveDown(0.5);
  addBodyText(doc, data.tenant.name);
  if (data.tenant.contactEmail) {
    addBodyText(doc, `E-post: ${data.tenant.contactEmail}`);
  }
  if (data.tenant.contactPhone) {
    addBodyText(doc, `Telefon: ${data.tenant.contactPhone}`);
  }
}

// HJELPEFUNKSJONER

function addSectionHeader(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fontSize(18)
    .fillColor("#10b981")
    .font("Helvetica-Bold")
    .text(text);

  doc
    .moveTo(50, doc.y + 5)
    .lineTo(550, doc.y + 5)
    .lineWidth(2)
    .stroke("#10b981");

  doc.moveDown(1.5);
  doc.fillColor("#1f2937").font("Helvetica");
}

function addSubHeader(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fontSize(14)
    .fillColor("#374151")
    .font("Helvetica-Bold")
    .text(text);

  doc.moveDown(0.5);
  doc.fillColor("#1f2937").font("Helvetica");
}

function addBodyText(
  doc: PDFKit.PDFDocument,
  text: string,
  options?: {
    indent?: number;
    fontSize?: number;
    color?: string;
  }
) {
  const fontSize = options?.fontSize || 11;
  const color = options?.color || "#374151";
  const indent = options?.indent || 0;

  doc
    .fontSize(fontSize)
    .fillColor(color)
    .font("Helvetica")
    .text(text, { indent });
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Aktiv",
    MONITORED: "Overvåket",
    CLOSED: "Lukket",
  };
  return labels[status] || status;
}

function getGoalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Aktiv",
    ACHIEVED: "Oppnådd",
    AT_RISK: "I risiko",
    FAILED: "Ikke oppnådd",
    ARCHIVED: "Arkivert",
  };
  return labels[status] || status;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ENERGY: "Energibruk",
    WATER: "Vannforbruk",
    WASTE: "Avfallshåndtering",
    EMISSIONS: "Utslipp til luft",
    RESOURCE_USE: "Ressursbruk",
    BIODIVERSITY: "Biologisk mangfold",
    OTHER: "Annet",
  };
  return labels[category] || category;
}

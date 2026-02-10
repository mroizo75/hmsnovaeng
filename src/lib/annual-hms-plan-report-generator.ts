import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { AnnualPlanChecklistData } from "@/server/actions/annual-hms-plan.actions";

interface AnnualHmsPlanReportTenant {
  name: string;
  orgNumber: string | null;
}

export interface AnnualHmsPlanReportData {
  tenant: AnnualHmsPlanReportTenant;
  checklist: AnnualPlanChecklistData;
}

export async function generateAnnualHmsPlanReport(data: AnnualHmsPlanReportData): Promise<Buffer> {
  const { default: jsPDF } = await import("jspdf");
  const { tenant, checklist } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;
  const lineHeight = 6;
  let y = 30;

  const addLine = (text: string, options?: { size?: number; bold?: boolean }) => {
    const size = options?.size ?? 11;
    const bold = options?.bold ?? false;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 170);
    for (const line of lines) {
      if (y + lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  };

  const generatedDate = format(new Date(), "d. MMMM yyyy", { locale: nb });

  // Topptekst: firmanavn + dato høyre side
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${tenant.name} – ${generatedDate}`, pageWidth - marginX, 15, { align: "right" });
  // Linje under topptekst
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(marginX, 18, pageWidth - marginX, 18);

  // Tittel og metadata
  addLine(`Årlig HMS-plan ${checklist.year}`, { size: 18, bold: true });
  addLine(`Virksomhet: ${tenant.name}`, { size: 12 });
  if (tenant.orgNumber) {
    addLine(`Organisasjonsnummer: ${tenant.orgNumber}`, { size: 11 });
  }
  y += 4;

  // Oppsummering
  const completedPercent =
    checklist.totalCount > 0 ? Math.round((checklist.completedCount / checklist.totalCount) * 100) : 0;
  addLine("Oppsummering", { size: 13, bold: true });
  addLine(`Steg fullført: ${checklist.completedCount} av ${checklist.totalCount}`);
  addLine(`Fremdrift: ${completedPercent} %`);
  y += 4;

  addLine(
    "Denne rapporten viser status for alle steg i den årlige HMS-planen for valgt år. " +
      "Bruk rapporten som dokumentasjon i ledelsens gjennomgang, styremøter og eksterne revisjoner."
  );
  y += 6;

  // Detaljert liste over steg
  addLine("Detaljert oversikt over steg", { size: 13, bold: true });
  y += 2;

  checklist.steps.forEach((step, index) => {
    const status = step.completedAt ? "Fullført" : "Ikke fullført";
    const completedDate = step.completedAt
      ? format(new Date(step.completedAt), "d. MMM yyyy", { locale: nb })
      : "-";

    addLine(`${index + 1}. ${step.title}`, { bold: true });
    addLine(step.description);
    addLine(`Kategori: ${getCategoryLabelSafe(step.category)}`, { size: 10 });
    addLine(`Status: ${status}`, { size: 10 });
    addLine(`Fullført dato: ${completedDate}`, { size: 10 });
    if (step.legalRef) {
      addLine(`Lov / standard: ${step.legalRef}`, { size: 10 });
    }
    y += 4;
  });

  // Bunntekst: firmainfo på alle sider
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 15;

    // Linje over bunntekst
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(marginX, footerY - 6, pageWidth - marginX, footerY - 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(tenant.name, marginX, footerY);

    doc.setFont("helvetica", "normal");
    const line2Parts: string[] = [];
    if (tenant.orgNumber) {
      line2Parts.push(`Org.nr: ${tenant.orgNumber}`);
    }
    const addressParts: string[] = [];
    if ((tenant as any).address) {
      addressParts.push((tenant as any).address as string);
    }
    const cityPart = [((tenant as any).postalCode as string | null) ?? "", ((tenant as any).city as string | null) ?? ""]
      .filter((v) => v && v.length > 0)
      .join(" ");
    if (cityPart) {
      addressParts.push(cityPart);
    }
    if (addressParts.length > 0) {
      line2Parts.push(addressParts.join(", "));
    }
    if (line2Parts.length > 0) {
      doc.setFontSize(8);
      doc.text(line2Parts.join(" • "), marginX, footerY + 4);
    }

    const line3Parts: string[] = [];
    if ((tenant as any).contactEmail) {
      line3Parts.push(`E-post: ${(tenant as any).contactEmail as string}`);
    }
    if ((tenant as any).contactPhone) {
      line3Parts.push(`Telefon: ${(tenant as any).contactPhone as string}`);
    }
    if (line3Parts.length > 0) {
      doc.setFontSize(8);
      doc.text(line3Parts.join(" • "), marginX, footerY + 8);
    }
  }

  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}

function getCategoryLabelSafe(category: string): string {
  const labels: Record<string, string> = {
    ledelse: "Ledelse og gjennomgang",
    risiko: "Risiko og mål",
    dokumenter: "Dokumenter og stoffkartotek",
    kontroll: "Kontroll og revisjon",
    opplæring: "Opplæring",
    oppfølging: "Oppfølging av avvik og tiltak",
    annen: "Annet",
  };
  return labels[category] ?? category;
}

function getCategoryLabel(category: string): string {
  return getCategoryLabelSafe(category);
}


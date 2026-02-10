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
  const { tenant, checklist } = data;
  const generatedDate = format(new Date(), "d. MMMM yyyy", { locale: nb });

  const completedPercent =
    checklist.totalCount > 0 ? Math.round((checklist.completedCount / checklist.totalCount) * 100) : 0;

  const stepsHtml = checklist.steps
    .map((step, index) => {
      const status = step.completedAt ? "Fullført" : "Ikke fullført";
      const statusColor = step.completedAt ? "#16a34a" : "#b91c1c";
      const completedDate = step.completedAt
        ? format(new Date(step.completedAt), "d. MMM yyyy", { locale: nb })
        : "-";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(step.title)}</td>
          <td>${escapeHtml(step.description)}</td>
          <td>${escapeHtml(getCategoryLabel(step.category))}</td>
          <td style="color: ${statusColor}; font-weight: 600;">${status}</td>
          <td>${completedDate}</td>
          <td>${step.legalRef ? escapeHtml(step.legalRef) : ""}</td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <title>Årlig HMS-plan ${checklist.year} - ${escapeHtml(tenant.name)}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111827;
    }

    h1 {
      font-size: 22pt;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 14pt;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #1f2937;
    }

    p {
      margin: 4px 0;
    }

    .muted {
      color: #6b7280;
      font-size: 9pt;
    }

    .summary-box {
      border-left: 4px solid #2563eb;
      background: #eff6ff;
      padding: 10px 12px;
      margin: 12px 0 18px 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .summary-item {
      font-size: 10pt;
    }

    .summary-label {
      display: block;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }

    .summary-value {
      font-size: 11pt;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9pt;
    }

    th,
    td {
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      vertical-align: top;
    }

    th {
      background: #f3f4f6;
      text-align: left;
      font-weight: 600;
    }

    .footer {
      margin-top: 18px;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      font-size: 8pt;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <header>
    <h1>Årlig HMS-plan ${checklist.year}</h1>
    <p><strong>Virksomhet:</strong> ${escapeHtml(tenant.name)}</p>
    ${tenant.orgNumber ? `<p><strong>Organisasjonsnummer:</strong> ${escapeHtml(tenant.orgNumber)}</p>` : ""}
    <p class="muted">Rapporten dokumenterer gjennomføring av årlig HMS-plan og tilhørende krav for valgt år.</p>
  </header>

  <section class="summary-box">
    <div><strong>Oppsummering</strong></div>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">Steg fullført</span>
        <span class="summary-value">${checklist.completedCount} av ${checklist.totalCount}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Fremdrift</span>
        <span class="summary-value">${completedPercent} %</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Generert</span>
        <span class="summary-value">${generatedDate}</span>
      </div>
    </div>
  </section>

  <section>
    <h2>Detaljert oversikt over steg</h2>
    <p class="muted">
      Tabellen under viser alle steg i den årlige HMS-planen, status for gjennomføring og dato der steget ble fullført.
      Bruk rapporten som dokumentasjon ved ledelsens gjennomgang, styrebehandling og eksterne revisjoner.
    </p>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Steg</th>
          <th>Beskrivelse</th>
          <th>Kategori</th>
          <th>Status</th>
          <th>Fullført dato</th>
          <th>Lov / standard</th>
        </tr>
      </thead>
      <tbody>
        ${stepsHtml}
      </tbody>
    </table>
  </section>

  <section class="footer">
    <p>
      Denne rapporten er generert automatisk av HMS Nova sin modul for årlig HMS-plan.
      Når alle steg er markert som fullført, har virksomheten et tydelig bevis på at årlig HMS-arbeid er gjennomført
      i tråd med definerte krav.
    </p>
  </section>
</body>
</html>
  `;
}


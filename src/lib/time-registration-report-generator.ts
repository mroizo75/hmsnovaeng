import { format } from "date-fns";
import { nb } from "date-fns/locale";
import ExcelJS from "exceljs";

const TIME_TYPE_LABELS: Record<string, string> = {
  NORMAL: "Ordinær",
  OVERTIME_50: "Overtid 50 %",
  OVERTIME_100: "Overtid 100 %",
  WEEKEND: "Helg/helligdag",
  TRAVEL: "Reise/kjøring",
};

export interface TimeEntryForReport {
  id: string;
  date: Date;
  hours: number;
  timeType: string;
  comment: string | null;
  project: { name: string; code: string | null };
  user: { id: string; name: string | null; email: string };
  editedBy: { name: string | null } | null;
}

export interface MileageEntryForReport {
  id: string;
  date: Date;
  kilometers: number;
  ratePerKm: number | null;
  amount: number | null;
  comment: string | null;
  project: { name: string; code: string | null };
  user: { id: string; name: string | null; email: string };
  editedBy: { name: string | null } | null;
}

export interface TimeRegistrationReportData {
  tenantName: string;
  dateRange: { from: Date; to: Date };
  timeEntries: TimeEntryForReport[];
  mileageEntries: MileageEntryForReport[];
  userDisplayNames: Record<string, string>;
}

export async function generateTimeRegistrationExcel(
  data: TimeRegistrationReportData
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HMS Nova";

  const { tenantName, dateRange, timeEntries, mileageEntries, userDisplayNames } =
    data;

  const dateRangeStr = `${format(dateRange.from, "d.M.yyyy", { locale: nb })} – ${format(dateRange.to, "d.M.yyyy", { locale: nb })}`;

  // Sheet 1: Timer
  const timeSheet = workbook.addWorksheet("Timer", {
    headerFooter: {
      firstHeader: `${tenantName} – Timeregistrering`,
      firstFooter: `Generert ${format(new Date(), "d. MMMM yyyy", { locale: nb })}`,
    },
  });

  timeSheet.columns = [
    { header: "Navn", key: "name", width: 22 },
    { header: "Dato", key: "date", width: 12 },
    { header: "Prosjekt", key: "project", width: 25 },
    { header: "Kode", key: "code", width: 12 },
    { header: "Timer", key: "hours", width: 8 },
    { header: "Type", key: "type", width: 14 },
    { header: "Kommentar", key: "comment", width: 30 },
  ];

  const timeHeaderRow = timeSheet.getRow(1);
  timeHeaderRow.font = { bold: true };
  timeHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  for (const e of timeEntries) {
    const name =
      userDisplayNames[e.user.id] ||
      e.user.name ||
      e.user.email ||
      "–";
    timeSheet.addRow({
      name,
      date: format(new Date(e.date), "dd.MM.yyyy", { locale: nb }),
      project: e.project.name,
      code: e.project.code || "",
      hours: e.hours,
      type: TIME_TYPE_LABELS[e.timeType] || e.timeType,
      comment: e.comment || "",
    });
  }

  // Oppsummering timer
  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
  const normalHours = timeEntries
    .filter((e) => e.timeType === "NORMAL")
    .reduce((s, e) => s + e.hours, 0);
  const overtime50 = timeEntries
    .filter((e) => e.timeType === "OVERTIME_50")
    .reduce((s, e) => s + e.hours, 0);
  const overtime100 = timeEntries
    .filter((e) => e.timeType === "OVERTIME_100")
    .reduce((s, e) => s + e.hours, 0);
  const weekend = timeEntries
    .filter((e) => e.timeType === "WEEKEND")
    .reduce((s, e) => s + e.hours, 0);

  timeSheet.addRow([]);
  timeSheet.addRow([
    "",
    "",
    "",
    "Totalt:",
    totalHours,
    "",
    "",
  ]);
  const summaryRow = timeSheet.lastRow;
  if (summaryRow) summaryRow.font = { bold: true };

  // Sheet 2: Km godtgjørelse
  const mileageSheet = workbook.addWorksheet("Km godtgjørelse", {
    headerFooter: {
      firstHeader: `${tenantName} – Km godtgjørelse`,
      firstFooter: `Generert ${format(new Date(), "d. MMMM yyyy", { locale: nb })}`,
    },
  });

  mileageSheet.columns = [
    { header: "Navn", key: "name", width: 22 },
    { header: "Dato", key: "date", width: 12 },
    { header: "Prosjekt", key: "project", width: 25 },
    { header: "Kode", key: "code", width: 12 },
    { header: "Km", key: "km", width: 8 },
    { header: "Sats/km", key: "rate", width: 10 },
    { header: "Beløp (kr)", key: "amount", width: 12 },
    { header: "Kommentar", key: "comment", width: 25 },
  ];

  const mileageHeaderRow = mileageSheet.getRow(1);
  mileageHeaderRow.font = { bold: true };
  mileageHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  for (const e of mileageEntries) {
    const name =
      userDisplayNames[e.user.id] ||
      e.user.name ||
      e.user.email ||
      "–";
    mileageSheet.addRow({
      name,
      date: format(new Date(e.date), "dd.MM.yyyy", { locale: nb }),
      project: e.project.name,
      code: e.project.code || "",
      km: e.kilometers,
      rate: e.ratePerKm ?? "",
      amount: e.amount ?? e.kilometers * (e.ratePerKm ?? 4.5),
      comment: e.comment || "",
    });
  }

  const totalAmount = mileageEntries.reduce(
    (s, e) => s + (e.amount ?? e.kilometers * (e.ratePerKm ?? 4.5)),
    0
  );
  const totalKm = mileageEntries.reduce((s, e) => s + e.kilometers, 0);
  mileageSheet.addRow([]);
  mileageSheet.addRow([
    "",
    "",
    "",
    "Totalt:",
    totalKm,
    "",
    totalAmount,
    "",
  ]);
  const mileageSummaryRow = mileageSheet.lastRow;
  if (mileageSummaryRow) mileageSummaryRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

export async function generateTimeRegistrationPdf(
  data: TimeRegistrationReportData
): Promise<Buffer> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const lineHeight = 5;
  let y = 25;

  const addLine = (text: string, opts?: { size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 9;
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, pageWidth - 2 * marginX);
    for (const line of lines) {
      if (y + lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  };

  const { tenantName, dateRange, timeEntries, mileageEntries, userDisplayNames } =
    data;

  doc.setFontSize(10);
  doc.text(
    `${tenantName} – Timeregistrering`,
    pageWidth - marginX,
    15,
    { align: "right" }
  );
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, 18, pageWidth - marginX, 18);

  addLine("Timeregistrering – Rapport", { size: 16, bold: true });
  addLine(`Periode: ${format(dateRange.from, "d. MMM yyyy", { locale: nb })} – ${format(dateRange.to, "d. MMM yyyy", { locale: nb })}`);
  addLine(`Generert: ${format(new Date(), "d. MMMM yyyy HH:mm", { locale: nb })}`);
  y += 6;

  addLine("Timer", { size: 12, bold: true });
  y += 2;

  let totalHours = 0;
  for (const e of timeEntries) {
    const name =
      userDisplayNames[e.user.id] ||
      e.user.name ||
      e.user.email ||
      "–";
    addLine(
      `${format(new Date(e.date), "dd.MM.yy")} | ${name} | ${e.project.name} | ${e.hours} t (${TIME_TYPE_LABELS[e.timeType] || e.timeType})`
    );
    totalHours += e.hours;
  }
  if (timeEntries.length === 0) addLine("Ingen timer registrert.");
  addLine(`Sum timer: ${totalHours.toFixed(1)}`);
  y += 6;

  addLine("Km godtgjørelse", { size: 12, bold: true });
  y += 2;

  let totalKm = 0;
  let totalAmount = 0;
  for (const e of mileageEntries) {
    const name =
      userDisplayNames[e.user.id] ||
      e.user.name ||
      e.user.email ||
      "–";
    const amt = e.amount ?? e.kilometers * (e.ratePerKm ?? 4.5);
    addLine(
      `${format(new Date(e.date), "dd.MM.yy")} | ${name} | ${e.project.name} | ${e.kilometers} km | ${amt.toFixed(0)} kr`
    );
    totalKm += e.kilometers;
    totalAmount += amt;
  }
  if (mileageEntries.length === 0) addLine("Ingen km godtgjørelse registrert.");
  addLine(`Sum km: ${totalKm.toFixed(0)} | Sum beløp: ${totalAmount.toFixed(0)} kr`);

  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}

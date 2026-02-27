import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { OshaClassification } from "@prisma/client";

type RecordableCase = {
  avviksnummer: string | null;
  title: string;
  occurredAt: Date;
  reportedBy: string;
  location: string | null;
  oshaClassification: OshaClassification | null;
  eventType: string | null;
  daysAwayFromWork: number | null;
  daysOnRestriction: number | null;
  daysOnTransfer: number | null;
  bodyPartAffected: string | null;
  natureOfInjury: string | null;
  privacyCaseFlag: boolean;
};

type OshaLogData = {
  totalHoursWorked: number;
  avgEmployeeCount: number;
  trir: number | null;
  dartRate: number | null;
  certifiedBy: string | null;
  certifiedTitle: string | null;
  certifiedAt: Date | null;
} | null;

export function generateOsha300Pdf(params: {
  tenantName: string;
  year: number;
  incidents: RecordableCase[];
}): Buffer {
  const { tenantName, year, incidents } = params;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(31, 78, 121);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("OSHA's Form 300", 30, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Log of Work-Related Injuries and Illnesses", 30, 36);

  doc.setTextColor(200, 220, 255);
  doc.setFontSize(9);
  doc.text(`Establishment: ${tenantName}`, pageWidth - 250, 22);
  doc.text(`Year: ${year}`, pageWidth - 250, 34);
  doc.text("29 CFR Part 1904", pageWidth - 250, 46);

  doc.setTextColor(0, 0, 0);

  const classLabel = (c: OshaClassification | null): string => {
    if (!c) return "";
    const map: Record<OshaClassification, string> = {
      FATALITY: "Death",
      DAYS_AWAY: "Days Away",
      RESTRICTED_WORK: "Restricted",
      JOB_TRANSFER: "Transfer",
      OTHER_RECORDABLE: "Other",
      FIRST_AID_ONLY: "First Aid",
    };
    return map[c] ?? c;
  };

  const rows = incidents.map((inc, idx) => [
    String(idx + 1),
    inc.avviksnummer ?? "—",
    inc.privacyCaseFlag ? "Privacy Case" : inc.title,
    new Date(inc.occurredAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
    inc.location ?? "—",
    inc.reportedBy,
    classLabel(inc.oshaClassification),
    String(inc.daysAwayFromWork ?? 0),
    String((inc.daysOnRestriction ?? 0) + (inc.daysOnTransfer ?? 0)),
    inc.bodyPartAffected ?? "—",
    inc.natureOfInjury ?? "—",
  ]);

  const totDaysAway = incidents.reduce((s, i) => s + (i.daysAwayFromWork ?? 0), 0);
  const totRestr = incidents.reduce((s, i) => s + (i.daysOnRestriction ?? 0) + (i.daysOnTransfer ?? 0), 0);
  rows.push(["", "", "TOTALS", "", "", "", "", String(totDaysAway), String(totRestr), "", ""]);

  autoTable(doc, {
    startY: 60,
    head: [["#", "Case No.", "Description / Employee", "Date", "Where Occurred", "Employee", "Classification", "Days Away", "Restricted+Transfer", "Body Part", "Injury/Illness Type"]],
    body: rows,
    styles: { fontSize: 7, cellPadding: 3 },
    headStyles: { fillColor: [31, 78, 121], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 130 },
      3: { cellWidth: 40 },
      4: { cellWidth: 70 },
      5: { cellWidth: 70 },
      6: { cellWidth: 65 },
      7: { cellWidth: 40 },
      8: { cellWidth: 60 },
      9: { cellWidth: 60 },
      10: { cellWidth: 65 },
    },
  });

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US")} · OSHA Form 300 · 29 CFR 1904 · Retain for 5 years`,
    30,
    doc.internal.pageSize.getHeight() - 15
  );

  return Buffer.from(doc.output("arraybuffer"));
}

export function generateOsha300APdf(params: {
  tenantName: string;
  year: number;
  incidents: RecordableCase[];
  log: OshaLogData;
}): Buffer {
  const { tenantName, year, incidents, log } = params;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const totalHours = log?.totalHoursWorked ?? 0;
  const avgEmployees = log?.avgEmployeeCount ?? 0;

  const deaths = incidents.filter((i) => i.oshaClassification === "FATALITY").length;
  const daysAway = incidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const restricted = incidents.filter((i) => i.oshaClassification === "RESTRICTED_WORK").length;
  const transfer = incidents.filter((i) => i.oshaClassification === "JOB_TRANSFER").length;
  const other = incidents.filter((i) => i.oshaClassification === "OTHER_RECORDABLE").length;
  const injuries = incidents.filter((i) => i.eventType === "INJURY").length;
  const illnesses = incidents.filter((i) => i.eventType === "ILLNESS").length;

  const trir = totalHours > 0 ? ((incidents.length * 200000) / totalHours).toFixed(2) : "N/A";
  const dart = totalHours > 0 ? (((daysAway + restricted + transfer) * 200000) / totalHours).toFixed(2) : "N/A";

  // Header
  doc.setFillColor(31, 78, 121);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("OSHA's Form 300A", 30, 28);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Summary of Work-Related Injuries and Illnesses", 30, 44);
  doc.setFontSize(10);
  doc.text(`Year: ${year}`, pageWidth - 100, 44);

  doc.setTextColor(0, 0, 0);

  let y = 90;
  const col1 = 30;
  const col2 = 220;
  const col3 = 410;

  // Establishment info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Establishment Information", col1, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Establishment Name: ${tenantName}`, col1, y);
  y += 15;
  doc.text(`Industry Description (NAICS): —`, col1, y);
  y += 25;

  // Separator
  doc.setDrawColor(180, 180, 180);
  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // Number of cases
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Number of Cases", col1, y);
  y += 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const caseData = [
    ["Total deaths", deaths],
    ["Cases with days away from work", daysAway],
    ["Cases with restricted work / job transfer", restricted + transfer],
    ["Other recordable cases", other],
    ["Total recordable cases", incidents.length],
  ];

  for (const [label, value] of caseData) {
    doc.setFont("helvetica", "normal");
    doc.text(String(label), col1 + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col2, y);
    y += 14;
  }
  y += 10;

  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // Number of days
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Number of Days", col1, y);
  y += 18;
  doc.setFontSize(9);

  const dayData = [
    ["Total days away from work", incidents.reduce((s, i) => s + (i.daysAwayFromWork ?? 0), 0)],
    ["Total days of restricted work / transfer", incidents.reduce((s, i) => s + (i.daysOnRestriction ?? 0) + (i.daysOnTransfer ?? 0), 0)],
  ];
  for (const [label, value] of dayData) {
    doc.setFont("helvetica", "normal");
    doc.text(String(label), col1 + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col2, y);
    y += 14;
  }
  y += 10;

  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // Injury vs illness
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Injury and Illness Types", col1, y);
  y += 18;
  doc.setFontSize(9);

  for (const [label, value] of [
    ["Injuries", injuries],
    ["Illnesses", illnesses],
  ]) {
    doc.setFont("helvetica", "normal");
    doc.text(String(label), col1 + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col2, y);
    y += 14;
  }
  y += 10;

  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // Employment info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Establishment Employment & Hours", col1, y);
  y += 18;
  doc.setFontSize(9);

  for (const [label, value] of [
    ["Annual average number of employees", avgEmployees],
    ["Total hours worked by all employees", totalHours.toLocaleString("en-US")],
  ]) {
    doc.setFont("helvetica", "normal");
    doc.text(String(label), col1 + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col2, y);
    y += 14;
  }
  y += 10;

  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // KPI summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Calculated Rates", col1, y);
  y += 18;
  doc.setFontSize(9);

  for (const [label, value] of [
    ["TRIR (Total Recordable Incident Rate)", trir],
    ["DART Rate (Days Away, Restricted, Transfer)", dart],
  ]) {
    doc.setFont("helvetica", "normal");
    doc.text(String(label), col1 + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col2, y);
    y += 14;
  }
  y += 15;

  doc.line(col1, y, pageWidth - 30, y);
  y += 20;

  // Certification block
  doc.setFillColor(250, 250, 250);
  doc.rect(col1, y, pageWidth - 60, 80, "FD");
  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Certification", col1 + 10, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "I certify that I have examined this document and that to the best of my knowledge the entries are true, accurate, and complete.",
    col1 + 10, y, { maxWidth: pageWidth - 80 }
  );
  y += 24;

  if (log?.certifiedBy) {
    doc.text(`Signed: ${log.certifiedBy}   |   Title: ${log.certifiedTitle ?? "—"}   |   Date: ${log.certifiedAt ? new Date(log.certifiedAt).toLocaleDateString("en-US") : "—"}`, col1 + 10, y);
  } else {
    doc.text("Not yet certified.", col1 + 10, y);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US")} · OSHA Form 300A · 29 CFR Part 1904 · Post from February 1 to April 30`,
    30,
    doc.internal.pageSize.getHeight() - 15
  );

  return Buffer.from(doc.output("arraybuffer"));
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });
    if (!user || user.tenants.length === 0) {
      return NextResponse.json({ error: "No tenant access" }, { status: 403 });
    }

    const tenantId = user.tenants[0].tenantId;
    const { searchParams } = new URL(request.url);
    const talkId = searchParams.get("id");

    if (!talkId) {
      return NextResponse.json({ error: "Talk ID required" }, { status: 400 });
    }

    const [talk, tenant] = await Promise.all([
      prisma.toolboxTalk.findFirst({
        where: { id: talkId, tenantId },
        include: { attendances: { orderBy: { signedAt: "asc" } } },
      }),
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    ]);

    if (!talk) {
      return NextResponse.json({ error: "Toolbox talk not found" }, { status: 404 });
    }

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(31, 78, 121);
    doc.rect(0, 0, pageWidth, 55, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TOOLBOX TALK — ATTENDANCE RECORD", 30, 24);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(tenant?.name ?? "", 30, 40);
    doc.text(
      new Date(talk.conductedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      pageWidth - 220,
      40
    );

    doc.setTextColor(0, 0, 0);

    let y = 75;

    doc.setFillColor(240, 245, 250);
    doc.rect(30, y, pageWidth - 60, 55, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Topic: ${talk.topic}`, 40, y + 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Conducted by: ${talk.conductedBy}`, 40, y + 34);
    doc.text("OSHA Reference: Company Safety Program", 40, y + 48);
    y += 70;

    if (talk.content) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Discussion Points:", 30, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(talk.content, pageWidth - 60);
      doc.text(lines, 30, y);
      y += lines.length * 12 + 10;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance Record", 30, y);
    y += 8;

    const rows = talk.attendances.map((a, idx) => [
      String(idx + 1),
      a.guestName ?? a.userId ?? "",
      a.signedAt ? new Date(a.signedAt).toLocaleDateString("en-US") : "",
      a.signedAt ? "✓ Signed" : "Unsigned",
    ]);

    const blankRows = Math.max(0, 20 - talk.attendances.length);
    for (let i = 0; i < blankRows; i++) {
      rows.push([String(talk.attendances.length + i + 1), "", "", ""]);
    }

    autoTable(doc, {
      startY: y,
      head: [["#", "Employee Name", "Date", "Signature / Status"]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [31, 78, 121], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 220 },
        2: { cellWidth: 100 },
        3: { cellWidth: 120 },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 50;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Supervisor Signature:", 30, finalY + 30);
    doc.setFont("helvetica", "normal");
    doc.line(160, finalY + 30, 360, finalY + 30);
    doc.text("Date:", 380, finalY + 30);
    doc.line(410, finalY + 30, 520, finalY + 30);

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US")} · Retain this record per company policy · Total attendees: ${talk.attendances.length}`,
      30,
      doc.internal.pageSize.getHeight() - 15
    );

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const fileName = `ToolboxTalk-${talk.topic.replace(/[^a-z0-9]/gi, "-").slice(0, 40)}-${new Date(talk.conductedAt).toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Toolbox Talk PDF] Error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

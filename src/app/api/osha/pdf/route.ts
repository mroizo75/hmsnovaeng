import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOsha300Pdf, generateOsha300APdf } from "@/lib/osha-pdf";

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
    const form = searchParams.get("form") ?? "300";
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const [incidents, log, tenant] = await Promise.all([
      prisma.incident.findMany({
        where: { tenantId, oshaRecordable: true, osha300LogYear: year },
        orderBy: { occurredAt: "asc" },
        select: {
          avviksnummer: true,
          title: true,
          occurredAt: true,
          reportedBy: true,
          location: true,
          oshaClassification: true,
          eventType: true,
          illnessType: true,
          daysAwayFromWork: true,
          daysOnRestriction: true,
          daysOnTransfer: true,
          bodyPartAffected: true,
          natureOfInjury: true,
          privacyCaseFlag: true,
        },
      }),
      prisma.oshaLog.findUnique({ where: { tenantId_year: { tenantId, year } } }),
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    ]);

    const tenantName = tenant?.name ?? "Unknown Establishment";

    let pdfBuffer: Buffer;
    let fileName: string;

    if (form === "300A") {
      pdfBuffer = generateOsha300APdf({ tenantName, year, incidents, log });
      fileName = `OSHA-300A-${tenantName.replace(/\s+/g, "-")}-${year}.pdf`;
    } else {
      pdfBuffer = generateOsha300Pdf({ tenantName, year, incidents });
      fileName = `OSHA-300-Log-${tenantName.replace(/\s+/g, "-")}-${year}.pdf`;
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[OSHA PDF] Error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

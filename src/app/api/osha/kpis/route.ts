import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateOshaKpis } from "@/lib/osha-kpis";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { totalHoursWorkedYtd: true, avgEmployeeCount: true },
  });

  const log = await prisma.oshaLog.findUnique({
    where: { tenantId_year: { tenantId, year } },
  });

  const totalHours = log?.totalHoursWorked ?? tenant?.totalHoursWorkedYtd ?? 0;

  const incidents = await prisma.incident.findMany({
    where: { tenantId, osha300LogYear: year, oshaRecordable: true },
    select: { oshaClassification: true, daysAwayFromWork: true },
  });

  const recordableCount = incidents.length;
  const darsCount = incidents.filter(
    (i) =>
      i.oshaClassification === "DAYS_AWAY" ||
      i.oshaClassification === "RESTRICTED_WORK" ||
      i.oshaClassification === "JOB_TRANSFER"
  ).length;
  const lostTimeCount = incidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const totalLostDays = incidents.reduce((sum, i) => sum + (i.daysAwayFromWork ?? 0), 0);

  const { trir, dartRate, ltir, severityRate } = calculateOshaKpis({
    totalHoursWorked: totalHours,
    recordableIncidents: recordableCount,
    daysAwayRestrictedTransferCases: darsCount,
    lostTimeCases: lostTimeCount,
    totalLostWorkDays: totalLostDays,
  });

  // Historical trend (last 3 years)
  const historicalLogs = await prisma.oshaLog.findMany({
    where: { tenantId, year: { gte: year - 2, lte: year } },
    orderBy: { year: "asc" },
    select: { year: true, trir: true, dartRate: true, ltir: true, severityRate: true },
  });

  return NextResponse.json({
    year,
    trir,
    dartRate,
    ltir,
    severityRate,
    recordableCount,
    lostTimeCount,
    totalLostDays,
    totalHoursWorked: totalHours,
    historicalTrend: historicalLogs,
    log,
  });
}

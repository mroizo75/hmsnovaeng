import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { upsertOshaLog } from "@/server/actions/osha.actions";
import { upsertOshaLogSchema } from "@/features/osha-recordkeeping/schemas/osha.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  const incidents = await prisma.incident.findMany({
    where: { tenantId, oshaRecordable: true, osha300LogYear: year },
    orderBy: { occurredAt: "asc" },
    select: {
      id: true,
      avviksnummer: true,
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
      title: true,
    },
  });

  const log = await prisma.oshaLog.findUnique({
    where: { tenantId_year: { tenantId, year } },
  });

  return NextResponse.json({ incidents, log, year });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = upsertOshaLogSchema.parse(body);
    const log = await upsertOshaLog(input);
    return NextResponse.json(log);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IncidentStage, IncidentStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, severity, responsibleId } = body;

    const stageMap: Record<IncidentStatus, IncidentStage> = {
      OPEN: "REPORTED",
      INVESTIGATING: "UNDER_REVIEW",
      ACTION_TAKEN: "ACTIONS_DEFINED",
      CLOSED: "VERIFIED",
    };

    // Oppdater incident
    const incident = await prisma.incident.update({
      where: {
        id,
        tenantId: session.user.tenantId!,
      },
        data: {
          status,
          severity,
          responsibleId: responsibleId || null,
          stage: stageMap[status as IncidentStatus] || "REPORTED",
        },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error: any) {
    console.error("Update incident error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


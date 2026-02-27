import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { IhHazardType } from "@prisma/client";

const schema = z.object({
  tenantId: z.string(),
  programName: z.string().min(1),
  hazardType: z.nativeEnum(IhHazardType),
  agentName: z.string().min(1),
  oshaStandard: z.string().optional(),
  pel: z.number().optional(),
  al: z.number().optional(),
  stel: z.number().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const program = await prisma.ihMonitoringProgram.create({ data: parsed.data });
  return NextResponse.json(program, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createFallProtectionProgram,
  getFallProtectionPrograms,
  logFallEquipmentInspection,
  getEquipmentNeedingInspection,
} from "@/server/actions/fall-protection.actions";
import {
  createFallProtectionProgramSchema,
  logFallEquipmentSchema,
} from "@/features/fall-protection/schemas/fall-protection.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const type = searchParams.get("type") ?? "programs";

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (type === "equipment-due") {
    const equipment = await getEquipmentNeedingInspection(tenantId);
    return NextResponse.json(equipment);
  }

  const programs = await getFallProtectionPrograms(tenantId);
  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "program";

  try {
    const body = await req.json();

    if (type === "equipment") {
      const input = logFallEquipmentSchema.parse({ ...body, lastInspected: new Date(body.lastInspected) });
      const log = await logFallEquipmentInspection(input);
      return NextResponse.json(log, { status: 201 });
    }

    const input = createFallProtectionProgramSchema.parse({ ...body, effectiveDate: new Date(body.effectiveDate) });
    const program = await createFallProtectionProgram(input);
    return NextResponse.json(program, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

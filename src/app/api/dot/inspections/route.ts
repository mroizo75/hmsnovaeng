import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { DotInspectionType } from "@prisma/client";

const schema = z.object({
  tenantId: z.string(),
  vehicleUnit: z.string().min(1),
  vin: z.string().optional(),
  inspType: z.nativeEnum(DotInspectionType),
  inspectedAt: z.string(),
  inspectedBy: z.string().min(1),
  passed: z.boolean(),
  odometer: z.number().optional(),
  nextDue: z.string().optional(),
  notes: z.string().optional(),
  documentKey: z.string().optional(),
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

  const { tenantId, inspectedAt, nextDue, ...rest } = parsed.data;

  const record = await prisma.dotVehicleInspection.create({
    data: {
      ...rest,
      tenantId,
      inspectedAt: new Date(inspectedAt),
      nextDue: nextDue ? new Date(nextDue) : undefined,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

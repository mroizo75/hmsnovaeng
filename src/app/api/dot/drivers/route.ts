import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  tenantId: z.string(),
  employeeName: z.string().min(1),
  employeeId: z.string().optional(),
  cdlNumber: z.string().optional(),
  cdlClass: z.string().optional(),
  cdlState: z.string().optional(),
  cdlExpires: z.string().optional(),
  medicalCertExpires: z.string().optional(),
  hireDate: z.string().optional(),
  drugTestingEnrolled: z.boolean().default(true),
  hazmatEndorsement: z.boolean().default(false),
  notes: z.string().optional(),
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

  const { tenantId, cdlExpires, medicalCertExpires, hireDate, ...rest } = parsed.data;

  const driver = await prisma.dotDriver.create({
    data: {
      ...rest,
      tenantId,
      cdlExpires: cdlExpires ? new Date(cdlExpires) : undefined,
      medicalCertExpires: medicalCertExpires ? new Date(medicalCertExpires) : undefined,
      hireDate: hireDate ? new Date(hireDate) : undefined,
    },
  });

  return NextResponse.json(driver, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "tenantId required" }, { status: 400 });
  }

  const drivers = await prisma.dotDriver.findMany({
    where: { tenantId, isActive: true },
    orderBy: { employeeName: "asc" },
  });

  return NextResponse.json(drivers);
}

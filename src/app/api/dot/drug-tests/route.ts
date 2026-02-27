import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { DotTestType, DotTestResult } from "@prisma/client";

const schema = z.object({
  tenantId: z.string(),
  driverId: z.string(),
  testType: z.nativeEnum(DotTestType),
  testedAt: z.string(),
  result: z.nativeEnum(DotTestResult),
  substanceTested: z.string().optional(),
  specimenId: z.string().optional(),
  mroName: z.string().optional(),
  collectionSite: z.string().optional(),
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

  const { testedAt, ...rest } = parsed.data;

  const record = await prisma.dotDrugTest.create({
    data: {
      ...rest,
      testedAt: new Date(testedAt),
    },
  });

  return NextResponse.json(record, { status: 201 });
}

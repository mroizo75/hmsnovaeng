import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  tenantId: z.string(),
  carrier: z.string().min(1),
  policyNumber: z.string().min(1),
  policyType: z.string().min(1),
  effectiveDate: z.string(),
  expirationDate: z.string(),
  premiumAmount: z.number().optional(),
  deductible: z.number().optional(),
  coverageLimit: z.number().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email().optional(),
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

  const { effectiveDate, expirationDate, ...rest } = parsed.data;

  const policy = await prisma.insurancePolicy.create({
    data: {
      ...rest,
      effectiveDate: new Date(effectiveDate),
      expirationDate: new Date(expirationDate),
    },
  });

  return NextResponse.json(policy, { status: 201 });
}

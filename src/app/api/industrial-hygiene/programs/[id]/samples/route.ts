import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  programId: z.string(),
  sampledAt: z.string(),
  sampledBy: z.string().min(1),
  employeeName: z.string().optional(),
  jobTitle: z.string().optional(),
  workArea: z.string().min(1),
  sampleType: z.string().min(1),
  result: z.number(),
  exceedsPel: z.boolean().default(false),
  exceedsAl: z.boolean().default(false),
  labName: z.string().optional(),
  labSampleId: z.string().optional(),
  reportKey: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse({ ...body, programId: id });

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sampledAt, ...rest } = parsed.data;

  const sample = await prisma.ihExposureSample.create({
    data: { ...rest, sampledAt: new Date(sampledAt) },
  });

  return NextResponse.json(sample, { status: 201 });
}

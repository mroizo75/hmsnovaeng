import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createBbpProgram, getBbpPrograms, recordHepBVaccination } from "@/server/actions/bbp.actions";
import { createBbpProgramSchema, recordVaccinationSchema } from "@/features/bloodborne-pathogen/schemas/bbp.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  const programs = await getBbpPrograms(tenantId);
  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "program";

  try {
    const body = await req.json();

    if (type === "vaccination") {
      const input = recordVaccinationSchema.parse({
        ...body,
        offeredAt: new Date(body.offeredAt),
        ...(body.respondedAt ? { respondedAt: new Date(body.respondedAt) } : {}),
      });
      const record = await recordHepBVaccination(input);
      return NextResponse.json(record, { status: 201 });
    }

    const input = createBbpProgramSchema.parse({ ...body, effectiveDate: new Date(body.effectiveDate) });
    const program = await createBbpProgram(input);
    return NextResponse.json(program, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

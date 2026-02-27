import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createWorkersCompClaim,
  getWorkersCompClaims,
  getWorkersCompSummary,
  recordEmr,
  getEmrHistory,
} from "@/server/actions/workers-comp.actions";
import {
  createWorkersCompClaimSchema,
  recordEmrSchema,
} from "@/features/workers-comp/schemas/workers-comp.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const type = searchParams.get("type") ?? "claims";

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (type === "summary") {
    const summary = await getWorkersCompSummary(tenantId);
    return NextResponse.json(summary);
  }

  if (type === "emr") {
    const history = await getEmrHistory(tenantId);
    return NextResponse.json(history);
  }

  const claims = await getWorkersCompClaims(tenantId);
  return NextResponse.json(claims);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "claim";

  try {
    const body = await req.json();

    if (type === "emr") {
      const input = recordEmrSchema.parse(body);
      const record = await recordEmr(input);
      return NextResponse.json(record);
    }

    const input = createWorkersCompClaimSchema.parse({
      ...body,
      injuryDate: new Date(body.injuryDate),
      reportedDate: new Date(body.reportedDate),
    });
    const claim = await createWorkersCompClaim(input);
    return NextResponse.json(claim, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

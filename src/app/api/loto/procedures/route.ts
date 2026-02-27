import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createLotoProcedure, getLotoProceduresDueForReview } from "@/server/actions/loto.actions";
import { createLotoProcedureSchema } from "@/features/loto/schemas/loto.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const dueForReview = searchParams.get("dueForReview") === "true";

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (dueForReview) {
    const procedures = await getLotoProceduresDueForReview(tenantId);
    return NextResponse.json(procedures);
  }

  return NextResponse.json({ error: "Use programId filter" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = createLotoProcedureSchema.parse(body);
    const procedure = await createLotoProcedure(input);
    return NextResponse.json(procedure, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

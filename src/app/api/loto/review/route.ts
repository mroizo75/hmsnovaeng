import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recordLotoAnnualReview } from "@/server/actions/loto.actions";
import { annualReviewLotoProcedureSchema } from "@/features/loto/schemas/loto.schema";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = annualReviewLotoProcedureSchema.parse(body);
    const procedure = await recordLotoAnnualReview(input);
    return NextResponse.json(procedure);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

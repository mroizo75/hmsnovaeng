import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getPpeAssessments,
  createPpeAssessment,
  getPpeAssignments,
  createPpeAssignment,
} from "@/server/actions/ppe.actions";
import { createPpeAssessmentSchema, createPpeAssignmentSchema } from "@/features/ppe/schemas/ppe.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const type = searchParams.get("type") ?? "assessments";
  const userId = searchParams.get("userId") ?? undefined;

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (type === "assignments") {
    const assignments = await getPpeAssignments(tenantId, userId);
    return NextResponse.json(assignments);
  }

  const assessments = await getPpeAssessments(tenantId);
  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "assessment";

  try {
    const body = await req.json();

    if (type === "assignment") {
      const input = createPpeAssignmentSchema.parse({ ...body, issuedDate: new Date(body.issuedDate) });
      const assignment = await createPpeAssignment(input);
      return NextResponse.json(assignment, { status: 201 });
    }

    const input = createPpeAssessmentSchema.parse({ ...body, assessedAt: new Date(body.assessedAt) });
    const assessment = await createPpeAssessment(input);
    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

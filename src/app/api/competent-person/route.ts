import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createCompetentPerson,
  getCompetentPersons,
  getExpiredOrExpiringCompetentPersons,
} from "@/server/actions/competent-person.actions";
import { createCompetentPersonSchema } from "@/features/competent-person/schemas/competent-person.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const expiring = searchParams.get("expiring") === "true";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (expiring) {
    const days = parseInt(searchParams.get("days") ?? "30");
    const records = await getExpiredOrExpiringCompetentPersons(tenantId, days);
    return NextResponse.json(records);
  }

  const records = await getCompetentPersons(tenantId, activeOnly);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = createCompetentPersonSchema.parse({
      ...body,
      effectiveDate: new Date(body.effectiveDate),
      ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
    });
    const record = await createCompetentPerson(input);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createConfinedSpace, getConfinedSpaces, getOpenPermits } from "@/server/actions/confined-space.actions";
import { createConfinedSpaceSchema } from "@/features/confined-space/schemas/confined-space.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const type = searchParams.get("type") ?? "spaces";

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  if (type === "open-permits") {
    const permits = await getOpenPermits(tenantId);
    return NextResponse.json(permits);
  }

  const spaces = await getConfinedSpaces(tenantId);
  return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = createConfinedSpaceSchema.parse(body);
    const space = await createConfinedSpace(input);
    return NextResponse.json(space, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

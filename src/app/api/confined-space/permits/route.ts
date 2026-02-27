import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createConfinedSpacePermit,
  closeConfinedSpacePermit,
  cancelConfinedSpacePermit,
  getConfinedSpacePermits,
} from "@/server/actions/confined-space.actions";
import {
  createConfinedSpacePermitSchema,
  closeConfinedSpacePermitSchema,
  cancelConfinedSpacePermitSchema,
} from "@/features/confined-space/schemas/confined-space.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId");
  if (!spaceId) return NextResponse.json({ error: "spaceId is required" }, { status: 400 });

  const permits = await getConfinedSpacePermits(spaceId);
  return NextResponse.json(permits);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "create";

  try {
    const body = await req.json();

    if (action === "close") {
      const input = closeConfinedSpacePermitSchema.parse(body);
      const permit = await closeConfinedSpacePermit(input);
      return NextResponse.json(permit);
    }

    if (action === "cancel") {
      const input = cancelConfinedSpacePermitSchema.parse(body);
      const permit = await cancelConfinedSpacePermit(input);
      return NextResponse.json(permit);
    }

    const input = createConfinedSpacePermitSchema.parse({
      ...body,
      issuedAt: new Date(body.issuedAt),
      expiresAt: new Date(body.expiresAt),
    });
    const permit = await createConfinedSpacePermit(input);
    return NextResponse.json(permit, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logEmergencyDrill } from "@/server/actions/eap.actions";
import { logDrillSchema } from "@/features/eap/schemas/eap.schema";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = logDrillSchema.parse({ ...body, conductedAt: new Date(body.conductedAt) });
    const drill = await logEmergencyDrill(input);
    return NextResponse.json(drill, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

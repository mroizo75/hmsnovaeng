import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { signToolboxAttendance, addToolboxAttendee } from "@/server/actions/toolbox-talk.actions";
import { addAttendanceSchema, signAttendanceSchema } from "@/features/toolbox-talks/schemas/toolbox-talk.schema";
import { ZodError } from "zod";

// POST /api/toolbox-talks/sign — add attendee or sign existing attendance
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "add";

  try {
    const body = await req.json();

    if (action === "sign") {
      const input = signAttendanceSchema.parse(body);
      const attendance = await signToolboxAttendance(input);
      return NextResponse.json(attendance);
    }

    const input = addAttendanceSchema.parse(body);
    const attendance = await addToolboxAttendee(input);
    return NextResponse.json(attendance, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", issues: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

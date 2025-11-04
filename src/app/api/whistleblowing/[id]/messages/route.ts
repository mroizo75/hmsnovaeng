import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  caseNumber: z.string().min(1),
  accessCode: z.string().min(1),
  message: z.string().min(1),
});

// POST /api/whistleblowing/[id]/messages - Add message from reporter
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { caseNumber, accessCode, message } = messageSchema.parse(body);

    // Verify access code
    const report = await db.whistleblowing.findFirst({
      where: {
        id,
        caseNumber,
        accessCode,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newMessage = await db.whistleblowMessage.create({
      data: {
        whistleblowingId: id,
        sender: "REPORTER",
        message,
      },
    });

    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error("[WHISTLEBLOWING_MESSAGE_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


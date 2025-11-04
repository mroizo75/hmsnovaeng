import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adminMessageSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().default(false),
});

// POST /api/admin/whistleblowing/[id]/messages - Admin add message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["ADMIN", "HMS"];
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { message, isInternal } = adminMessageSchema.parse(body);

    // Verify report exists and belongs to tenant
    const report = await db.whistleblowing.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const newMessage = await db.whistleblowMessage.create({
      data: {
        whistleblowingId: id,
        sender: "HANDLER",
        senderUserId: session.user.id,
        message,
        isInternal,
      },
    });

    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN_WHISTLEBLOWING_MESSAGE_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


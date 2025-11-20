import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Hent tenantId fra UserTenant
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    });

    if (!userTenant) {
      return NextResponse.json(
        { error: "No tenant found" },
        { status: 404 }
      );
    }

    const where = {
      userId: session.user.id,
      tenantId: userTenant.tenantId,
      ...(unreadOnly && { isRead: false }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        tenantId: userTenant.tenantId,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("GET notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    // Hent tenantId
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    });

    if (!userTenant) {
      return NextResponse.json(
        { error: "No tenant found" },
        { status: 404 }
      );
    }

    if (markAll) {
      // Merk alle som lest
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          tenantId: userTenant.tenantId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      // Merk enkelt varsling som lest
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: session.user.id,
          tenantId: userTenant.tenantId,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PATCH notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notification ID" },
        { status: 400 }
      );
    }

    // Hent tenantId
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    });

    if (!userTenant) {
      return NextResponse.json(
        { error: "No tenant found" },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
        tenantId: userTenant.tenantId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


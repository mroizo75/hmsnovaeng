import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPermissions } from "@/lib/permissions";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Ikke autorisert" },
        { status: 401 }
      );
    }

    // Sjekk permissions
    const userRole = session.user.role as Role;
    const permissions = getPermissions(userRole);

    if (!permissions.canCreateTraining) {
      return NextResponse.json(
        { error: "Du har ikke tilgang til å opprette opplæring" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      provider,
      completedAt,
      proofDocKey,
      isRequired,
      effectiveness,
    } = body;

    // Valider påkrevde felt
    if (!title || !completedAt) {
      return NextResponse.json(
        { error: "Tittel og gjennomført dato er påkrevd" },
        { status: 400 }
      );
    }

    // Opprett opplæring
    const training = await prisma.training.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        title,
        description: description || null,
        provider: provider || "Egendefinert",
        completedAt: new Date(completedAt),
        proofDocKey: proofDocKey || null,
        isRequired: isRequired || false,
        effectiveness: effectiveness !== undefined ? effectiveness : null,
        courseKey: `${session.user.tenantId}-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("Create training error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette opplæring" },
      { status: 500 }
    );
  }
}

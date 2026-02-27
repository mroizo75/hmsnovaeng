"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createConfinedSpaceSchema,
  createConfinedSpacePermitSchema,
  closeConfinedSpacePermitSchema,
  cancelConfinedSpacePermitSchema,
  type CreateConfinedSpaceInput,
  type CreateConfinedSpacePermitInput,
  type CloseConfinedSpacePermitInput,
  type CancelConfinedSpacePermitInput,
} from "@/features/confined-space/schemas/confined-space.schema";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) throw new Error("User not associated with a tenant");
  return { user, tenantId: user.tenants[0].tenantId };
}

export async function getConfinedSpaces(tenantId: string) {
  return prisma.confinedSpace.findMany({
    where: { tenantId, isActive: true },
    include: {
      entryPermits: {
        where: { status: "OPEN" },
        orderBy: { issuedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { spaceName: "asc" },
  });
}

export async function getConfinedSpacePermits(spaceId: string) {
  return prisma.confinedSpacePermit.findMany({
    where: { spaceId },
    orderBy: { issuedAt: "desc" },
  });
}

export async function createConfinedSpace(input: CreateConfinedSpaceInput) {
  await requireSession();
  const data = createConfinedSpaceSchema.parse(input);

  const space = await prisma.confinedSpace.create({
    data: {
      tenantId: data.tenantId,
      spaceName: data.spaceName,
      location: data.location,
      permitRequired: data.permitRequired,
      hazards: data.hazards,
      dimensions: data.dimensions ?? null,
      entryPoints: data.entryPoints ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/confined-space");
  return space;
}

export async function createConfinedSpacePermit(input: CreateConfinedSpacePermitInput) {
  await requireSession();
  const data = createConfinedSpacePermitSchema.parse(input);

  // Verify the space is permit-required before issuing
  const space = await prisma.confinedSpace.findUnique({ where: { id: data.spaceId } });
  if (!space) throw new Error("Confined space not found");
  if (!space.permitRequired) throw new Error("This space is not permit-required");

  const permit = await prisma.confinedSpacePermit.create({
    data: {
      spaceId: data.spaceId,
      permitNumber: data.permitNumber,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      authorizedEntrants: data.authorizedEntrants,
      attendants: data.attendants,
      supervisors: data.supervisors,
      hazardsIdentified: data.hazardsIdentified,
      atmosphericTests: data.atmosphericTests,
      equipmentRequired: data.equipmentRequired,
      rescueProcedures: data.rescueProcedures ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/confined-space");
  return permit;
}

export async function closeConfinedSpacePermit(input: CloseConfinedSpacePermitInput) {
  await requireSession();
  const data = closeConfinedSpacePermitSchema.parse(input);

  const permit = await prisma.confinedSpacePermit.update({
    where: { id: data.id },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/confined-space");
  return permit;
}

export async function cancelConfinedSpacePermit(input: CancelConfinedSpacePermitInput) {
  await requireSession();
  const data = cancelConfinedSpacePermitSchema.parse(input);

  const permit = await prisma.confinedSpacePermit.update({
    where: { id: data.id },
    data: {
      status: "CANCELLED",
      closedAt: new Date(),
      cancelledReason: data.cancelledReason,
    },
  });

  revalidatePath("/confined-space");
  return permit;
}

export async function getOpenPermits(tenantId: string) {
  return prisma.confinedSpacePermit.findMany({
    where: { status: "OPEN", space: { tenantId } },
    include: { space: true },
    orderBy: { issuedAt: "desc" },
  });
}

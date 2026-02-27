"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createFallProtectionProgramSchema,
  updateFallProtectionProgramSchema,
  logFallEquipmentSchema,
  removeFallEquipmentSchema,
  type CreateFallProtectionProgramInput,
  type UpdateFallProtectionProgramInput,
  type LogFallEquipmentInput,
  type RemoveFallEquipmentInput,
} from "@/features/fall-protection/schemas/fall-protection.schema";

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

export async function getFallProtectionPrograms(tenantId: string) {
  return prisma.fallProtectionProgram.findMany({
    where: { tenantId },
    include: {
      equipmentLogs: { orderBy: { lastInspected: "desc" } },
    },
    orderBy: { effectiveDate: "desc" },
  });
}

export async function createFallProtectionProgram(input: CreateFallProtectionProgramInput) {
  await requireSession();
  const data = createFallProtectionProgramSchema.parse(input);

  const program = await prisma.fallProtectionProgram.create({
    data: {
      tenantId: data.tenantId,
      effectiveDate: data.effectiveDate,
      hazards: data.hazards,
      controls: data.controls,
      rescuePlan: data.rescuePlan ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/fall-protection");
  return program;
}

export async function updateFallProtectionProgram(input: UpdateFallProtectionProgramInput) {
  await requireSession();
  const { id, reviewedBy, ...data } = updateFallProtectionProgramSchema.parse(input);

  const program = await prisma.fallProtectionProgram.update({
    where: { id },
    data: {
      ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
      ...(data.hazards !== undefined && { hazards: data.hazards }),
      ...(data.controls !== undefined && { controls: data.controls }),
      ...(data.rescuePlan !== undefined && { rescuePlan: data.rescuePlan }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(reviewedBy !== undefined && { reviewedAt: new Date(), reviewedBy }),
    },
  });

  revalidatePath("/fall-protection");
  return program;
}

export async function logFallEquipmentInspection(input: LogFallEquipmentInput) {
  await requireSession();
  const data = logFallEquipmentSchema.parse(input);

  const log = await prisma.fallEquipmentLog.create({
    data: {
      programId: data.programId,
      equipmentType: data.equipmentType,
      manufacturer: data.manufacturer ?? null,
      serialNumber: data.serialNumber ?? null,
      lastInspected: data.lastInspected,
      inspectedBy: data.inspectedBy,
      condition: data.condition,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/fall-protection");
  return log;
}

export async function removeFallEquipment(input: RemoveFallEquipmentInput) {
  await requireSession();
  const data = removeFallEquipmentSchema.parse(input);

  const log = await prisma.fallEquipmentLog.update({
    where: { id: data.id },
    data: {
      condition: "REMOVED_FROM_SERVICE",
      removalDate: data.removalDate,
      notes: data.notes,
    },
  });

  revalidatePath("/fall-protection");
  return log;
}

export async function getEquipmentNeedingInspection(tenantId: string) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  return prisma.fallEquipmentLog.findMany({
    where: {
      program: { tenantId },
      condition: { not: "REMOVED_FROM_SERVICE" },
      lastInspected: { lte: ninetyDaysAgo },
    },
    include: { program: true },
    orderBy: { lastInspected: "asc" },
  });
}

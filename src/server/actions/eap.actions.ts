"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createEapSchema,
  updateEapSchema,
  logDrillSchema,
  type CreateEapInput,
  type UpdateEapInput,
  type LogDrillInput,
} from "@/features/eap/schemas/eap.schema";

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

export async function getEmergencyActionPlans(tenantId: string) {
  return prisma.emergencyActionPlan.findMany({
    where: { tenantId },
    include: { drills: { orderBy: { conductedAt: "desc" } } },
    orderBy: { effectiveDate: "desc" },
  });
}

export async function getEmergencyActionPlan(id: string) {
  return prisma.emergencyActionPlan.findUnique({
    where: { id },
    include: { drills: { orderBy: { conductedAt: "desc" } } },
  });
}

export async function createEmergencyActionPlan(input: CreateEapInput) {
  await requireSession();
  const data = createEapSchema.parse(input);

  const plan = await prisma.emergencyActionPlan.create({
    data: {
      tenantId: data.tenantId,
      locationName: data.locationName,
      effectiveDate: data.effectiveDate,
      alarmSystem: data.alarmSystem ?? null,
      evacuationRoutes: data.evacuationRoutes,
      assemblyPoints: data.assemblyPoints,
      emergencyContacts: data.emergencyContacts,
      roles: data.roles,
      equipment: data.equipment,
      medicalFacility: data.medicalFacility ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/eap");
  return plan;
}

export async function updateEmergencyActionPlan(input: UpdateEapInput) {
  await requireSession();
  const { id, ...data } = updateEapSchema.parse(input);

  const plan = await prisma.emergencyActionPlan.update({
    where: { id },
    data: {
      ...(data.locationName !== undefined && { locationName: data.locationName }),
      ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
      ...(data.alarmSystem !== undefined && { alarmSystem: data.alarmSystem }),
      ...(data.evacuationRoutes !== undefined && { evacuationRoutes: data.evacuationRoutes }),
      ...(data.assemblyPoints !== undefined && { assemblyPoints: data.assemblyPoints }),
      ...(data.emergencyContacts !== undefined && { emergencyContacts: data.emergencyContacts }),
      ...(data.roles !== undefined && { roles: data.roles }),
      ...(data.equipment !== undefined && { equipment: data.equipment }),
      ...(data.medicalFacility !== undefined && { medicalFacility: data.medicalFacility }),
      ...(data.notes !== undefined && { notes: data.notes }),
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/eap");
  return plan;
}

export async function logEmergencyDrill(input: LogDrillInput) {
  await requireSession();
  const data = logDrillSchema.parse(input);

  const drill = await prisma.emergencyDrill.create({
    data: {
      planId: data.planId,
      drillType: data.drillType,
      conductedAt: data.conductedAt,
      durationMin: data.durationMin ?? null,
      participantCount: data.participantCount ?? null,
      conductedBy: data.conductedBy,
      findings: data.findings ?? null,
      correctiveActions: data.correctiveActions ?? null,
    },
  });

  revalidatePath("/eap");
  return drill;
}

export async function deleteEmergencyActionPlan(id: string) {
  await requireSession();
  await prisma.emergencyActionPlan.delete({ where: { id } });
  revalidatePath("/eap");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createBbpProgramSchema,
  updateBbpProgramSchema,
  recordVaccinationSchema,
  updateVaccinationStatusSchema,
  type CreateBbpProgramInput,
  type UpdateBbpProgramInput,
  type RecordVaccinationInput,
  type UpdateVaccinationStatusInput,
} from "@/features/bloodborne-pathogen/schemas/bbp.schema";

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

export async function getBbpPrograms(tenantId: string) {
  return prisma.bloodbornePathogenProgram.findMany({
    where: { tenantId },
    include: { vaccinationRecords: { orderBy: { offeredAt: "desc" } } },
    orderBy: { effectiveDate: "desc" },
  });
}

export async function createBbpProgram(input: CreateBbpProgramInput) {
  await requireSession();
  const data = createBbpProgramSchema.parse(input);

  const program = await prisma.bloodbornePathogenProgram.create({
    data: {
      tenantId: data.tenantId,
      effectiveDate: data.effectiveDate,
      exposedPositions: data.exposedPositions,
      engineeringControls: data.engineeringControls,
      workPracticeControls: data.workPracticeControls,
      ppe: data.ppe,
      decontaminationPlan: data.decontaminationPlan ?? null,
      wasteDisposalPlan: data.wasteDisposalPlan ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/bloodborne-pathogen");
  return program;
}

export async function updateBbpProgram(input: UpdateBbpProgramInput) {
  await requireSession();
  const { id, reviewedBy, ...data } = updateBbpProgramSchema.parse(input);

  const program = await prisma.bloodbornePathogenProgram.update({
    where: { id },
    data: {
      ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
      ...(data.exposedPositions !== undefined && { exposedPositions: data.exposedPositions }),
      ...(data.engineeringControls !== undefined && { engineeringControls: data.engineeringControls }),
      ...(data.workPracticeControls !== undefined && { workPracticeControls: data.workPracticeControls }),
      ...(data.ppe !== undefined && { ppe: data.ppe }),
      ...(data.decontaminationPlan !== undefined && { decontaminationPlan: data.decontaminationPlan }),
      ...(data.wasteDisposalPlan !== undefined && { wasteDisposalPlan: data.wasteDisposalPlan }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(reviewedBy !== undefined && { reviewedAt: new Date(), reviewedBy }),
    },
  });

  revalidatePath("/bloodborne-pathogen");
  return program;
}

export async function recordHepBVaccination(input: RecordVaccinationInput) {
  await requireSession();
  const data = recordVaccinationSchema.parse(input);

  const record = await prisma.bbpVaccinationRecord.create({
    data: {
      programId: data.programId,
      userId: data.userId,
      status: data.status,
      offeredAt: data.offeredAt,
      respondedAt: data.respondedAt ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/bloodborne-pathogen");
  return record;
}

export async function updateVaccinationStatus(input: UpdateVaccinationStatusInput) {
  await requireSession();
  const data = updateVaccinationStatusSchema.parse(input);

  const record = await prisma.bbpVaccinationRecord.update({
    where: { id: data.id },
    data: {
      status: data.status,
      respondedAt: data.respondedAt ?? new Date(),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/bloodborne-pathogen");
  return record;
}

export async function getVaccinationSummary(tenantId: string) {
  const programs = await prisma.bloodbornePathogenProgram.findMany({
    where: { tenantId },
    include: { vaccinationRecords: true },
    orderBy: { effectiveDate: "desc" },
    take: 1,
  });

  if (programs.length === 0) return null;

  const records = programs[0].vaccinationRecords;
  return {
    programId: programs[0].id,
    total: records.length,
    offered: records.filter((r) => r.status === "OFFERED").length,
    accepted: records.filter((r) => r.status === "ACCEPTED").length,
    declined: records.filter((r) => r.status === "DECLINED").length,
    completed: records.filter((r) => r.status === "COMPLETED").length,
  };
}

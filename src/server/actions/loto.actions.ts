"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createLotoProgramSchema,
  updateLotoProgramSchema,
  createLotoProcedureSchema,
  updateLotoProcedureSchema,
  annualReviewLotoProcedureSchema,
  type CreateLotoProgramInput,
  type UpdateLotoProgramInput,
  type CreateLotoProcedureInput,
  type UpdateLotoProcedureInput,
  type AnnualReviewLotoProcedureInput,
} from "@/features/loto/schemas/loto.schema";

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

export async function getLotoPrograms(tenantId: string) {
  return prisma.lotoProgram.findMany({
    where: { tenantId },
    include: {
      procedures: { orderBy: { equipmentName: "asc" } },
    },
    orderBy: { effectiveDate: "desc" },
  });
}

export async function getLotoProgram(id: string) {
  return prisma.lotoProgram.findUnique({
    where: { id },
    include: { procedures: { orderBy: { equipmentName: "asc" } } },
  });
}

export async function createLotoProgram(input: CreateLotoProgramInput) {
  await requireSession();
  const data = createLotoProgramSchema.parse(input);

  const program = await prisma.lotoProgram.create({
    data: {
      tenantId: data.tenantId,
      programName: data.programName,
      effectiveDate: data.effectiveDate,
      scope: data.scope,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/loto");
  return program;
}

export async function updateLotoProgram(input: UpdateLotoProgramInput) {
  await requireSession();
  const { id, ...data } = updateLotoProgramSchema.parse(input);

  const program = await prisma.lotoProgram.update({
    where: { id },
    data: {
      ...(data.programName !== undefined && { programName: data.programName }),
      ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
      ...(data.scope !== undefined && { scope: data.scope }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.reviewedBy !== undefined && {
        reviewedAt: new Date(),
        reviewedBy: data.reviewedBy,
        reviewedTitle: data.reviewedTitle ?? null,
      }),
    },
  });

  revalidatePath("/loto");
  return program;
}

export async function createLotoProcedure(input: CreateLotoProcedureInput) {
  await requireSession();
  const data = createLotoProcedureSchema.parse(input);

  const procedure = await prisma.lotoProcedure.create({
    data: {
      programId: data.programId,
      equipmentName: data.equipmentName,
      equipmentId: data.equipmentId ?? null,
      location: data.location ?? null,
      energySources: data.energySources,
      steps: data.steps,
      authorizedUsers: data.authorizedUsers,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/loto");
  return procedure;
}

export async function updateLotoProcedure(input: UpdateLotoProcedureInput) {
  await requireSession();
  const { id, ...data } = updateLotoProcedureSchema.parse(input);

  const procedure = await prisma.lotoProcedure.update({
    where: { id },
    data: {
      ...(data.equipmentName !== undefined && { equipmentName: data.equipmentName }),
      ...(data.equipmentId !== undefined && { equipmentId: data.equipmentId }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.energySources !== undefined && { energySources: data.energySources }),
      ...(data.steps !== undefined && { steps: data.steps }),
      ...(data.authorizedUsers !== undefined && { authorizedUsers: data.authorizedUsers }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/loto");
  return procedure;
}

export async function recordLotoAnnualReview(input: AnnualReviewLotoProcedureInput) {
  await requireSession();
  const data = annualReviewLotoProcedureSchema.parse(input);

  const procedure = await prisma.lotoProcedure.update({
    where: { id: data.id },
    data: {
      annualReviewAt: new Date(),
      annualReviewedBy: data.annualReviewedBy,
    },
  });

  revalidatePath("/loto");
  return procedure;
}

export async function deleteLotoProcedure(id: string) {
  await requireSession();
  await prisma.lotoProcedure.delete({ where: { id } });
  revalidatePath("/loto");
}

export async function getLotoProceduresDueForReview(tenantId: string) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return prisma.lotoProcedure.findMany({
    where: {
      program: { tenantId },
      OR: [
        { annualReviewAt: null },
        { annualReviewAt: { lte: oneYearAgo } },
      ],
    },
    include: { program: true },
    orderBy: { annualReviewAt: "asc" },
  });
}

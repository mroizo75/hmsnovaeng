"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createCompetentPersonSchema,
  updateCompetentPersonSchema,
  deactivateCompetentPersonSchema,
  type CreateCompetentPersonInput,
  type UpdateCompetentPersonInput,
  type DeactivateCompetentPersonInput,
} from "@/features/competent-person/schemas/competent-person.schema";

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

export async function getCompetentPersons(tenantId: string, activeOnly = true) {
  return prisma.competentPerson.findMany({
    where: { tenantId, ...(activeOnly ? { isActive: true } : {}) },
    orderBy: [{ designation: "asc" }, { effectiveDate: "desc" }],
  });
}

export async function createCompetentPerson(input: CreateCompetentPersonInput) {
  await requireSession();
  const data = createCompetentPersonSchema.parse(input);

  const record = await prisma.competentPerson.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      designation: data.designation,
      oshaStandard: data.oshaStandard,
      qualifications: data.qualifications,
      effectiveDate: data.effectiveDate,
      expiresAt: data.expiresAt ?? null,
      designatedBy: data.designatedBy,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/competent-person");
  return record;
}

export async function updateCompetentPerson(input: UpdateCompetentPersonInput) {
  await requireSession();
  const { id, ...data } = updateCompetentPersonSchema.parse(input);

  const record = await prisma.competentPerson.update({
    where: { id },
    data: {
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.designation !== undefined && { designation: data.designation }),
      ...(data.oshaStandard !== undefined && { oshaStandard: data.oshaStandard }),
      ...(data.qualifications !== undefined && { qualifications: data.qualifications }),
      ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
      ...(data.designatedBy !== undefined && { designatedBy: data.designatedBy }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/competent-person");
  return record;
}

export async function deactivateCompetentPerson(input: DeactivateCompetentPersonInput) {
  await requireSession();
  const data = deactivateCompetentPersonSchema.parse(input);

  const record = await prisma.competentPerson.update({
    where: { id: data.id },
    data: {
      isActive: false,
      notes: data.reason,
    },
  });

  revalidatePath("/competent-person");
  return record;
}

export async function getExpiredOrExpiringCompetentPersons(tenantId: string, withinDays = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);

  return prisma.competentPerson.findMany({
    where: {
      tenantId,
      isActive: true,
      expiresAt: { lte: threshold },
    },
    orderBy: { expiresAt: "asc" },
  });
}

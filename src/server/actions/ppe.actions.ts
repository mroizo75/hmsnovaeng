"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createPpeAssessmentSchema,
  createPpeAssignmentSchema,
  inspectPpeAssignmentSchema,
  signPpeAssignmentSchema,
  removePpeAssignmentSchema,
  type CreatePpeAssessmentInput,
  type CreatePpeAssignmentInput,
  type InspectPpeAssignmentInput,
  type SignPpeAssignmentInput,
  type RemovePpeAssignmentInput,
} from "@/features/ppe/schemas/ppe.schema";

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

export async function getPpeAssessments(tenantId: string) {
  return prisma.ppeAssessment.findMany({
    where: { tenantId },
    include: { assignments: true },
    orderBy: { assessedAt: "desc" },
  });
}

export async function createPpeAssessment(input: CreatePpeAssessmentInput) {
  await requireSession();
  const data = createPpeAssessmentSchema.parse(input);

  const assessment = await prisma.ppeAssessment.create({
    data: {
      tenantId: data.tenantId,
      workArea: data.workArea,
      jobTitle: data.jobTitle ?? null,
      hazardsFound: data.hazardsFound,
      ppeRequired: data.ppeRequired,
      assessedBy: data.assessedBy,
      assessedAt: data.assessedAt,
      reviewDue: data.reviewDue ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/ppe");
  return assessment;
}

export async function getPpeAssignments(tenantId: string, userId?: string) {
  return prisma.ppeAssignment.findMany({
    where: { tenantId, ...(userId ? { userId } : {}) },
    include: { assessment: true },
    orderBy: { issuedDate: "desc" },
  });
}

export async function createPpeAssignment(input: CreatePpeAssignmentInput) {
  await requireSession();
  const data = createPpeAssignmentSchema.parse(input);

  const assignment = await prisma.ppeAssignment.create({
    data: {
      tenantId: data.tenantId,
      assessmentId: data.assessmentId ?? null,
      userId: data.userId,
      ppeType: data.ppeType,
      manufacturer: data.manufacturer ?? null,
      model: data.model ?? null,
      serialNumber: data.serialNumber ?? null,
      size: data.size ?? null,
      issuedDate: data.issuedDate,
      issuedBy: data.issuedBy,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/ppe");
  return assignment;
}

export async function inspectPpeAssignment(input: InspectPpeAssignmentInput) {
  await requireSession();
  const data = inspectPpeAssignmentSchema.parse(input);

  const assignment = await prisma.ppeAssignment.update({
    where: { id: data.id },
    data: {
      lastInspected: data.lastInspected,
      inspectedBy: data.inspectedBy,
      condition: data.condition,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/ppe");
  return assignment;
}

export async function signPpeAssignment(input: SignPpeAssignmentInput) {
  await requireSession();
  const data = signPpeAssignmentSchema.parse(input);

  const assignment = await prisma.ppeAssignment.update({
    where: { id: data.id },
    data: {
      signedAt: new Date(),
      signature: data.signature,
    },
  });

  revalidatePath("/ppe");
  return assignment;
}

export async function removePpeAssignment(input: RemovePpeAssignmentInput) {
  await requireSession();
  const data = removePpeAssignmentSchema.parse(input);

  const assignment = await prisma.ppeAssignment.update({
    where: { id: data.id },
    data: {
      condition: "REMOVED_FROM_SERVICE",
      removedDate: data.removedDate,
      removedReason: data.removedReason,
    },
  });

  revalidatePath("/ppe");
  return assignment;
}

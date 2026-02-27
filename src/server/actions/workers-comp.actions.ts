"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createWorkersCompClaimSchema,
  updateWorkersCompClaimSchema,
  closeWorkersCompClaimSchema,
  recordEmrSchema,
  type CreateWorkersCompClaimInput,
  type UpdateWorkersCompClaimInput,
  type CloseWorkersCompClaimInput,
  type RecordEmrInput,
} from "@/features/workers-comp/schemas/workers-comp.schema";

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

export async function getWorkersCompClaims(tenantId: string) {
  return prisma.workersCompClaim.findMany({
    where: { tenantId },
    orderBy: { injuryDate: "desc" },
  });
}

export async function createWorkersCompClaim(input: CreateWorkersCompClaimInput) {
  await requireSession();
  const data = createWorkersCompClaimSchema.parse(input);

  const claim = await prisma.workersCompClaim.create({
    data: {
      tenantId: data.tenantId,
      incidentId: data.incidentId ?? null,
      claimNumber: data.claimNumber,
      carrierName: data.carrierName,
      claimantName: data.claimantName,
      injuryDate: data.injuryDate,
      reportedDate: data.reportedDate,
      reserveAmount: data.reserveAmount ?? null,
      adjusterName: data.adjusterName ?? null,
      adjusterPhone: data.adjusterPhone ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/workers-comp");
  return claim;
}

export async function updateWorkersCompClaim(input: UpdateWorkersCompClaimInput) {
  await requireSession();
  const { id, ...data } = updateWorkersCompClaimSchema.parse(input);

  const claim = await prisma.workersCompClaim.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.reserveAmount !== undefined && { reserveAmount: data.reserveAmount }),
      ...(data.paidAmount !== undefined && { paidAmount: data.paidAmount }),
      ...(data.lostWorkDays !== undefined && { lostWorkDays: data.lostWorkDays }),
      ...(data.returnToWorkDate !== undefined && { returnToWorkDate: data.returnToWorkDate }),
      ...(data.adjusterName !== undefined && { adjusterName: data.adjusterName }),
      ...(data.adjusterPhone !== undefined && { adjusterPhone: data.adjusterPhone }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/workers-comp");
  return claim;
}

export async function closeWorkersCompClaim(input: CloseWorkersCompClaimInput) {
  await requireSession();
  const data = closeWorkersCompClaimSchema.parse(input);

  const claim = await prisma.workersCompClaim.update({
    where: { id: data.id },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      ...(data.paidAmount !== undefined && { paidAmount: data.paidAmount }),
      ...(data.lostWorkDays !== undefined && { lostWorkDays: data.lostWorkDays }),
      ...(data.returnToWorkDate !== undefined && { returnToWorkDate: data.returnToWorkDate }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/workers-comp");
  return claim;
}

export async function recordEmr(input: RecordEmrInput) {
  await requireSession();
  const data = recordEmrSchema.parse(input);

  const record = await prisma.emrHistory.upsert({
    where: { tenantId_year: { tenantId: data.tenantId, year: data.year } },
    update: {
      emrValue: data.emrValue,
      carrier: data.carrier ?? null,
      notes: data.notes ?? null,
    },
    create: {
      tenantId: data.tenantId,
      year: data.year,
      emrValue: data.emrValue,
      carrier: data.carrier ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/workers-comp");
  return record;
}

export async function getWorkersCompSummary(tenantId: string) {
  const [claims, emrHistory] = await Promise.all([
    prisma.workersCompClaim.findMany({
      where: { tenantId },
      select: { status: true, paidAmount: true, lostWorkDays: true, injuryDate: true },
    }),
    prisma.emrHistory.findMany({
      where: { tenantId },
      orderBy: { year: "desc" },
      take: 3,
    }),
  ]);

  const openClaims = claims.filter((c) => c.status === "OPEN").length;
  const totalPaid = claims.reduce((sum, c) => sum + (c.paidAmount ?? 0), 0);
  const totalLostDays = claims.reduce((sum, c) => sum + (c.lostWorkDays ?? 0), 0);
  const currentEmr = emrHistory[0] ?? null;

  return {
    openClaims,
    totalClaims: claims.length,
    totalPaid,
    totalLostDays,
    currentEmr,
    emrTrend: emrHistory,
  };
}

export async function getEmrHistory(tenantId: string) {
  return prisma.emrHistory.findMany({
    where: { tenantId },
    orderBy: { year: "desc" },
  });
}

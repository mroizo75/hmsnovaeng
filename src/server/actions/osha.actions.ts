"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  markOshaRecordableSchema,
  upsertOshaLogSchema,
  certifyOshaLogSchema,
  postOsha300ASchema,
  type MarkOshaRecordableInput,
  type UpsertOshaLogInput,
  type CertifyOshaLogInput,
  type PostOsha300AInput,
} from "@/features/osha-recordkeeping/schemas/osha.schema";
import { calculateOshaKpis } from "@/lib/osha-kpis";

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

export async function markIncidentOshaRecordable(input: MarkOshaRecordableInput) {
  await requireSession();
  const data = markOshaRecordableSchema.parse(input);

  const updated = await prisma.incident.update({
    where: { id: data.incidentId },
    data: {
      oshaRecordable: data.oshaRecordable,
      oshaClassification: data.oshaClassification ?? null,
      daysAwayFromWork: data.daysAwayFromWork ?? null,
      daysOnRestriction: data.daysOnRestriction ?? null,
      daysOnTransfer: data.daysOnTransfer ?? null,
      bodyPartAffected: data.bodyPartAffected ?? null,
      natureOfInjury: data.natureOfInjury ?? null,
      eventType: data.eventType ?? null,
      illnessType: data.illnessType ?? null,
      privacyCaseFlag: data.privacyCaseFlag ?? false,
      osha300LogYear: data.osha300LogYear ?? new Date().getFullYear(),
      osha301CompletedAt: data.oshaRecordable ? new Date() : null,
    },
  });

  revalidatePath("/osha");
  return updated;
}

export async function upsertOshaLog(input: UpsertOshaLogInput) {
  await requireSession();
  const data = upsertOshaLogSchema.parse(input);

  const incidents = await prisma.incident.findMany({
    where: {
      tenantId: data.tenantId,
      oshaRecordable: true,
      osha300LogYear: data.year,
    },
  });

  const totalDeaths = incidents.filter((i) => i.oshaClassification === "FATALITY").length;
  const totalDaysAway = incidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const totalRestricted = incidents.filter((i) => i.oshaClassification === "RESTRICTED_WORK").length;
  const totalTransfer = incidents.filter((i) => i.oshaClassification === "JOB_TRANSFER").length;
  const totalOtherRecordable = incidents.filter((i) => i.oshaClassification === "OTHER_RECORDABLE").length;
  const totalInjuries = incidents.filter((i) => i.eventType === "INJURY").length;
  const totalSkinDisorders = incidents.filter((i) => i.illnessType === "SKIN_DISORDER").length;
  const totalRespiratoryConditions = incidents.filter((i) => i.illnessType === "RESPIRATORY_CONDITION").length;
  const totalPoisonings = incidents.filter((i) => i.illnessType === "POISONING").length;
  const totalHearingLoss = incidents.filter((i) => i.illnessType === "HEARING_LOSS").length;
  const totalOtherIllnesses = incidents.filter((i) => i.illnessType === "ALL_OTHER_ILLNESSES").length;

  const recordableCount = incidents.length;
  const daysAwayRestrictedTransfer = incidents.filter(
    (i) =>
      i.oshaClassification === "DAYS_AWAY" ||
      i.oshaClassification === "RESTRICTED_WORK" ||
      i.oshaClassification === "JOB_TRANSFER"
  ).length;
  const lostTimeCases = incidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const totalLostDays = incidents.reduce((sum, i) => sum + (i.daysAwayFromWork ?? 0), 0);

  const { trir, dartRate, ltir, severityRate } = calculateOshaKpis({
    totalHoursWorked: data.totalHoursWorked,
    recordableIncidents: recordableCount,
    daysAwayRestrictedTransferCases: daysAwayRestrictedTransfer,
    lostTimeCases,
    totalLostWorkDays: totalLostDays,
  });

  const log = await prisma.oshaLog.upsert({
    where: { tenantId_year: { tenantId: data.tenantId, year: data.year } },
    update: {
      totalHoursWorked: data.totalHoursWorked,
      avgEmployeeCount: data.avgEmployeeCount,
      totalDeaths,
      totalDaysAway,
      totalRestricted,
      totalTransfer,
      totalOtherRecordable,
      totalInjuries,
      totalSkinDisorders,
      totalRespiratoryConditions,
      totalPoisonings,
      totalHearingLoss,
      totalOtherIllnesses,
      trir,
      dartRate,
      ltir,
      severityRate,
    },
    create: {
      tenantId: data.tenantId,
      year: data.year,
      totalHoursWorked: data.totalHoursWorked,
      avgEmployeeCount: data.avgEmployeeCount,
      totalDeaths,
      totalDaysAway,
      totalRestricted,
      totalTransfer,
      totalOtherRecordable,
      totalInjuries,
      totalSkinDisorders,
      totalRespiratoryConditions,
      totalPoisonings,
      totalHearingLoss,
      totalOtherIllnesses,
      trir,
      dartRate,
      ltir,
      severityRate,
    },
  });

  revalidatePath("/osha");
  return log;
}

export async function certifyOshaLog(input: CertifyOshaLogInput) {
  await requireSession();
  const data = certifyOshaLogSchema.parse(input);

  const log = await prisma.oshaLog.update({
    where: { tenantId_year: { tenantId: data.tenantId, year: data.year } },
    data: {
      certifiedAt: new Date(),
      certifiedBy: data.certifiedBy,
      certifiedTitle: data.certifiedTitle,
    },
  });

  revalidatePath("/osha");
  return log;
}

export async function postOsha300ASummary(input: PostOsha300AInput) {
  await requireSession();
  const data = postOsha300ASchema.parse(input);

  const log = await prisma.oshaLog.update({
    where: { tenantId_year: { tenantId: data.tenantId, year: data.year } },
    data: {
      postedAt: new Date(),
      postedBy: data.postedBy,
    },
  });

  revalidatePath("/osha");
  return log;
}

export async function getOshaLog(tenantId: string, year: number) {
  return prisma.oshaLog.findUnique({
    where: { tenantId_year: { tenantId, year } },
  });
}

export async function getOshaRecordableIncidents(tenantId: string, year: number) {
  return prisma.incident.findMany({
    where: {
      tenantId,
      oshaRecordable: true,
      osha300LogYear: year,
    },
    orderBy: { occurredAt: "asc" },
  });
}

export async function getAllOshaLogs(tenantId: string) {
  return prisma.oshaLog.findMany({
    where: { tenantId },
    orderBy: { year: "desc" },
  });
}

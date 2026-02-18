"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getWeek,
} from "date-fns";
import { nb } from "date-fns/locale";

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error("Ikke autentisert");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenants: true },
  });
  if (!user) throw new Error("Bruker ikke funnet");
  const userTenant = user.tenants.find((t) => t.tenantId === session.user.tenantId);
  if (!userTenant) throw new Error("Bruker er ikke tilknyttet virksomhet");
  return { user, tenantId: session.user.tenantId, role: userTenant.role };
}

function getDateRange(
  period: "week" | "month" | "year",
  year?: number,
  month?: number,
  week?: number
): { from: Date; to: Date } {
  const now = new Date();
  const y = year ?? now.getFullYear();

  if (period === "week") {
    const w = week ?? getWeek(now, { weekStartsOn: 1, locale: nb });
    const from = startOfWeek(new Date(y, 0, 1 + (w - 1) * 7), {
      weekStartsOn: 1,
      locale: nb,
    });
    const to = endOfWeek(from, { weekStartsOn: 1, locale: nb });
    return { from, to };
  }

  if (period === "month") {
    const m = (month ?? now.getMonth() + 1) - 1;
    const from = startOfMonth(new Date(y, m, 1));
    const to = endOfMonth(from);
    return { from, to };
  }

  const from = startOfYear(new Date(y, 0, 1));
  const to = endOfYear(from);
  return { from, to };
}

export async function getTimeRegistrationConfig(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        timeRegistrationEnabled: true,
        weeklyHoursNorm: true,
        overtime50Multiplier: true,
        overtime100Multiplier: true,
        defaultKmRate: true,
        lunchBreakMinutes: true,
        eveningOvertimeFromHour: true,
      },
    });
    if (!tenant) return { success: false, error: "Virksomhet ikke funnet" };
    return { success: true, data: tenant };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function updateTimeRegistrationConfig(
  tenantId: string,
  data: {
    timeRegistrationEnabled?: boolean;
    weeklyHoursNorm?: number;
    overtime50Multiplier?: number;
    overtime100Multiplier?: number;
    defaultKmRate?: number;
    lunchBreakMinutes?: number;
    eveningOvertimeFromHour?: number | null;
  }
) {
  try {
    const { role } = await getSessionContext();
    if (role !== "ADMIN") {
      return { success: false, error: "Kun administrator kan endre innstillinger" };
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        timeRegistrationEnabled: data.timeRegistrationEnabled,
        weeklyHoursNorm: data.weeklyHoursNorm,
        overtime50Multiplier: data.overtime50Multiplier,
        overtime100Multiplier: data.overtime100Multiplier,
        defaultKmRate: data.defaultKmRate,
        lunchBreakMinutes: data.lunchBreakMinutes,
        eveningOvertimeFromHour: data.eveningOvertimeFromHour,
      },
    });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects(tenantId: string, activeOnly = true) {
  try {
    await getSessionContext();

    const projects = await prisma.project.findMany({
      where: {
        tenantId,
        ...(activeOnly ? { status: "ACTIVE" } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: {
          select: { timeEntries: true, mileageEntries: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: projects };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message, data: [] };
  }
}

export async function createProject(input: {
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
}) {
  try {
    const { user, tenantId } = await getSessionContext();
    if (tenantId !== input.tenantId) {
      return { success: false, error: "Ingen tilgang" };
    }

    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    if (role !== "ADMIN" && role !== "HMS" && role !== "LEDER") {
      return { success: false, error: "Kun admin/HMS/leder kan opprette prosjekter" };
    }

    const project = await prisma.project.create({
      data: {
        tenantId: input.tenantId,
        name: input.name.trim(),
        code: input.code?.trim() || null,
        description: input.description?.trim() || null,
        createdById: user.id,
      },
    });
    revalidatePath("/dashboard/time-registration");
    return { success: true, data: project };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function updateProject(
  id: string,
  input: { name?: string; code?: string; description?: string; status?: "ACTIVE" | "COMPLETED" }
) {
  try {
    const { user, tenantId } = await getSessionContext();
    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    if (role !== "ADMIN" && role !== "HMS" && role !== "LEDER") {
      return { success: false, error: "Ingen tilgang til å redigere prosjekt" };
    }

    await prisma.project.update({
      where: { id, tenantId },
      data: {
        name: input.name?.trim(),
        code: input.code?.trim() ?? undefined,
        description: input.description?.trim() ?? undefined,
        status: input.status,
      },
    });
    revalidatePath("/dashboard/time-registration");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteProject(id: string) {
  try {
    const { user, tenantId } = await getSessionContext();
    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    if (role !== "ADMIN" && role !== "HMS") {
      return { success: false, error: "Kun admin/HMS kan slette prosjekter" };
    }

    await prisma.project.delete({ where: { id, tenantId } });
    revalidatePath("/dashboard/time-registration");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

// ============================================================================
// TIME ENTRIES
// ============================================================================

type TimeEntryTypeValue =
  | "NORMAL"
  | "OVERTIME_50"
  | "OVERTIME_100"
  | "WEEKEND"
  | "TRAVEL";

/** Automatisk overtidsberegning: daglig norm (f.eks. 7,5 t) fra weeklyHoursNorm / 5 */
function getDailyNorm(weeklyHoursNorm: number): number {
  return weeklyHoursNorm / 5;
}

/** Bestem overtidstype fra tenant-regler: helg = WEEKEND; arbeid etter kl X = 100 %; ellers 50 % */
function resolveOvertimeType(
  date: Date,
  workedUntilHour: number | null | undefined,
  eveningOvertimeFromHour: number | null
): TimeEntryTypeValue {
  const d = new Date(date);
  const day = d.getDay();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) return "WEEKEND";
  if (
    workedUntilHour != null &&
    eveningOvertimeFromHour != null &&
    workedUntilHour >= eveningOvertimeFromHour
  ) {
    return "OVERTIME_100";
  }
  return "OVERTIME_50";
}

export async function createTimeEntry(input: {
  tenantId: string;
  projectId: string;
  date: Date;
  hours: number;
  mode: "work" | "travel";
  /** Arbeidet til kl (0–23). Hvis satt og ≥ eveningOvertimeFromHour = 100 % overtid man–fre */
  workedUntilHour?: number | null;
  comment?: string;
}) {
  try {
    const { user, tenantId } = await getSessionContext();
    if (tenantId !== input.tenantId) {
      return { success: false, error: "Ingen tilgang" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        timeRegistrationEnabled: true,
        weeklyHoursNorm: true,
        lunchBreakMinutes: true,
        eveningOvertimeFromHour: true,
      },
    });
    if (!tenant?.timeRegistrationEnabled) {
      return { success: false, error: "Timeregistrering er ikke aktivert for denne virksomheten" };
    }

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, tenantId },
    });
    if (!project || project.status !== "ACTIVE") {
      return { success: false, error: "Prosjekt ikke funnet eller ikke aktivt" };
    }

    if (input.hours <= 0 || input.hours > 24) {
      return { success: false, error: "Timer må være mellom 0 og 24" };
    }

    const date = new Date(input.date);
    const comment = input.comment?.trim() || null;

    const lunchHours = (tenant?.lunchBreakMinutes ?? 30) / 60;

    if (input.mode === "travel") {
      const entry = await prisma.timeEntry.create({
        data: {
          tenantId,
          projectId: input.projectId,
          userId: user.id,
          date,
          hours: input.hours,
          timeType: "TRAVEL",
          comment,
        },
      });
      revalidatePath("/dashboard/time-registration");
      revalidatePath("/ansatt/timeregistrering");
      return { success: true, data: entry };
    }

    // mode === "work": trekke lunsj fra klokketimer, deretter split ordinær + overtid
    const actualHours = Math.max(0, input.hours - lunchHours);
    if (actualHours <= 0) {
      return { success: false, error: "Arbeidstimer (etter lunsj) må være over 0" };
    }

    const dailyNorm = getDailyNorm(tenant.weeklyHoursNorm ?? 37.5);
    const overtimeType = resolveOvertimeType(
      date,
      input.workedUntilHour,
      tenant.eveningOvertimeFromHour
    );

    if (actualHours <= dailyNorm) {
      const entry = await prisma.timeEntry.create({
        data: {
          tenantId,
          projectId: input.projectId,
          userId: user.id,
          date,
          hours: actualHours,
          timeType: "NORMAL",
          comment,
        },
      });
      revalidatePath("/dashboard/time-registration");
      revalidatePath("/ansatt/timeregistrering");
      return { success: true, data: entry };
    }

    const normalHours = dailyNorm;
    const overtimeHours = actualHours - dailyNorm;

    await prisma.$transaction([
      prisma.timeEntry.create({
        data: {
          tenantId,
          projectId: input.projectId,
          userId: user.id,
          date,
          hours: normalHours,
          timeType: "NORMAL",
          comment,
        },
      }),
      prisma.timeEntry.create({
        data: {
          tenantId,
          projectId: input.projectId,
          userId: user.id,
          date,
          hours: overtimeHours,
          timeType: overtimeType,
          workedUntilHour: input.workedUntilHour ?? null,
          comment,
        },
      }),
    ]);
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true, data: null };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function updateTimeEntry(
  id: string,
  input: { date?: Date; hours?: number; timeType?: string; comment?: string }
) {
  try {
    const { user, tenantId } = await getSessionContext();
    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    const isAdmin = ["ADMIN", "HMS", "LEDER"].includes(role || "");

    const existing = await prisma.timeEntry.findUnique({
      where: { id, tenantId },
    });
    if (!existing) return { success: false, error: "Registrering ikke funnet" };

    if (!isAdmin && existing.userId !== user.id) {
      return { success: false, error: "Du kan kun redigere egne registreringer" };
    }

    if (input.hours !== undefined && (input.hours <= 0 || input.hours > 24)) {
      return { success: false, error: "Timer må være mellom 0 og 24" };
    }

    await prisma.timeEntry.update({
      where: { id, tenantId },
      data: {
        date: input.date ? new Date(input.date) : undefined,
        hours: input.hours,
        timeType: input.timeType as TimeEntryTypeValue,
        comment: input.comment?.trim() ?? undefined,
        ...(isAdmin && existing.userId !== user.id
          ? { editedById: user.id, editedAt: new Date() }
          : {}),
      },
    });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteTimeEntry(id: string) {
  try {
    const { user, tenantId } = await getSessionContext();
    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    const existing = await prisma.timeEntry.findUnique({
      where: { id, tenantId },
    });
    if (!existing) return { success: false, error: "Registrering ikke funnet" };

    if (existing.userId !== user.id && !["ADMIN", "HMS", "LEDER"].includes(role || "")) {
      return { success: false, error: "Du kan kun slette egne registreringer" };
    }

    await prisma.timeEntry.delete({ where: { id, tenantId } });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

// ============================================================================
// MILEAGE ENTRIES
// ============================================================================

export async function createMileageEntry(input: {
  tenantId: string;
  projectId: string;
  date: Date;
  kilometers: number;
  ratePerKm?: number;
  comment?: string;
}) {
  try {
    const { user, tenantId } = await getSessionContext();
    if (tenantId !== input.tenantId) {
      return { success: false, error: "Ingen tilgang" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timeRegistrationEnabled: true, defaultKmRate: true },
    });
    if (!tenant?.timeRegistrationEnabled) {
      return { success: false, error: "Timeregistrering er ikke aktivert" };
    }

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, tenantId },
    });
    if (!project || project.status !== "ACTIVE") {
      return { success: false, error: "Prosjekt ikke funnet" };
    }

    if (input.kilometers <= 0) {
      return { success: false, error: "Antall km må være over 0" };
    }

    const rate = input.ratePerKm ?? tenant.defaultKmRate;
    const amount = input.kilometers * rate;

    const entry = await prisma.mileageEntry.create({
      data: {
        tenantId,
        projectId: input.projectId,
        userId: user.id,
        date: new Date(input.date),
        kilometers: input.kilometers,
        ratePerKm: rate,
        amount,
        comment: input.comment?.trim() || null,
      },
    });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true, data: entry };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function updateMileageEntry(
  id: string,
  input: { date?: Date; kilometers?: number; ratePerKm?: number; comment?: string }
) {
  try {
    const { user, tenantId } = await getSessionContext();
    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    const isAdmin = ["ADMIN", "HMS", "LEDER"].includes(role || "");

    const existing = await prisma.mileageEntry.findUnique({
      where: { id, tenantId },
    });
    if (!existing) return { success: false, error: "Registrering ikke funnet" };

    if (!isAdmin && existing.userId !== user.id) {
      return { success: false, error: "Du kan kun redigere egne registreringer" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { defaultKmRate: true },
    });
    const rate = input.ratePerKm ?? existing.ratePerKm ?? tenant?.defaultKmRate ?? 4.5;
    const km = input.kilometers ?? existing.kilometers;
    const amount = km * rate;

    await prisma.mileageEntry.update({
      where: { id, tenantId },
      data: {
        date: input.date ? new Date(input.date) : undefined,
        kilometers: input.kilometers,
        ratePerKm: input.ratePerKm,
        amount,
        comment: input.comment?.trim() ?? undefined,
        ...(isAdmin && existing.userId !== user.id
          ? { editedById: user.id, editedAt: new Date() }
          : {}),
      },
    });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteMileageEntry(id: string) {
  try {
    const { user, tenantId } = await getSessionContext();
    const existing = await prisma.mileageEntry.findUnique({
      where: { id, tenantId },
    });
    if (!existing) return { success: false, error: "Registrering ikke funnet" };

    const role = user.tenants.find((t) => t.tenantId === tenantId)?.role;
    if (existing.userId !== user.id && !["ADMIN", "HMS", "LEDER"].includes(role || "")) {
      return { success: false, error: "Du kan kun slette egne registreringer" };
    }

    await prisma.mileageEntry.delete({ where: { id, tenantId } });
    revalidatePath("/dashboard/time-registration");
    revalidatePath("/ansatt/timeregistrering");
    return { success: true };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

// ============================================================================
// OVERVIEW / LIST
// ============================================================================

export type TimeRegistrationOverviewFilters = {
  period: "week" | "month" | "year";
  year?: number;
  month?: number;
  week?: number;
  projectId?: string;
  userId?: string;
};

export async function getTimeRegistrationOverview(
  tenantId: string,
  filters: TimeRegistrationOverviewFilters
) {
  try {
    await getSessionContext();

    const { from, to } = getDateRange(
      filters.period,
      filters.year,
      filters.month,
      filters.week
    );

    const whereClause = {
      tenantId,
      date: { gte: from, lte: to },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
    };

    const [timeEntries, mileageEntries, projects, users, tenant] = await Promise.all([
      prisma.timeEntry.findMany({
        where: whereClause,
        include: {
          project: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, name: true, email: true } },
          editedBy: { select: { name: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      prisma.mileageEntry.findMany({
        where: whereClause,
        include: {
          project: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, name: true, email: true } },
          editedBy: { select: { name: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      prisma.project.findMany({
        where: { tenantId, status: "ACTIVE" },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.userTenant.findMany({
        where: { tenantId },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          weeklyHoursNorm: true,
          overtime50Multiplier: true,
          overtime100Multiplier: true,
          defaultKmRate: true,
        },
      }),
    ]);

    const userDisplayNames = new Map(
      users.map((ut) => [
        ut.user.id,
        (ut.displayName || ut.user.name || ut.user.email || "").trim(),
      ])
    );

    return {
      success: true,
      data: {
        timeEntries,
        mileageEntries,
        projects,
        users: users.map((ut) => ({
          id: ut.user.id,
          name: ut.displayName || ut.user.name || ut.user.email,
        })),
        userDisplayNames: Object.fromEntries(userDisplayNames),
        dateRange: { from, to },
        config: tenant,
      },
    };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

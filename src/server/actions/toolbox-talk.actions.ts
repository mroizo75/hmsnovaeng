"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createToolboxTalkSchema,
  addAttendanceSchema,
  signAttendanceSchema,
  type CreateToolboxTalkInput,
  type AddAttendanceInput,
  type SignAttendanceInput,
} from "@/features/toolbox-talks/schemas/toolbox-talk.schema";

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

export async function getToolboxTalks(tenantId: string) {
  return prisma.toolboxTalk.findMany({
    where: { tenantId },
    include: {
      attendances: true,
    },
    orderBy: { conductedAt: "desc" },
  });
}

export async function getToolboxTalk(id: string) {
  return prisma.toolboxTalk.findUnique({
    where: { id },
    include: { attendances: true },
  });
}

export async function createToolboxTalk(input: CreateToolboxTalkInput) {
  await requireSession();
  const data = createToolboxTalkSchema.parse(input);

  const talk = await prisma.toolboxTalk.create({
    data: {
      tenantId: data.tenantId,
      title: data.title,
      topic: data.topic,
      content: data.content,
      conductedAt: data.conductedAt,
      conductedBy: data.conductedBy,
      location: data.location ?? null,
      projectId: data.projectId ?? null,
      notes: data.notes ?? null,
      attendances: data.attendees
        ? {
            create: data.attendees.map((a) => ({
              userId: a.userId ?? null,
              guestName: a.guestName ?? null,
            })),
          }
        : undefined,
    },
    include: { attendances: true },
  });

  revalidatePath("/toolbox-talks");
  return talk;
}

export async function addToolboxAttendee(input: AddAttendanceInput) {
  await requireSession();
  const data = addAttendanceSchema.parse(input);

  if (!data.userId && !data.guestName) {
    throw new Error("Either userId or guestName is required");
  }

  const attendance = await prisma.toolboxAttendance.create({
    data: {
      talkId: data.talkId,
      userId: data.userId ?? null,
      guestName: data.guestName ?? null,
      signature: data.signature ?? null,
      signedAt: data.signature ? new Date() : null,
    },
  });

  revalidatePath("/toolbox-talks");
  return attendance;
}

export async function signToolboxAttendance(input: SignAttendanceInput) {
  await requireSession();
  const data = signAttendanceSchema.parse(input);

  const attendance = await prisma.toolboxAttendance.update({
    where: { id: data.attendanceId },
    data: {
      signature: data.signature,
      signedAt: new Date(),
    },
  });

  revalidatePath("/toolbox-talks");
  return attendance;
}

export async function getToolboxTalkStats(tenantId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalThisMonth, totalAllTime, topicsLastMonth] = await Promise.all([
    prisma.toolboxTalk.count({
      where: { tenantId, conductedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.toolboxTalk.count({ where: { tenantId } }),
    prisma.toolboxTalk.findMany({
      where: { tenantId, conductedAt: { gte: thirtyDaysAgo } },
      select: { topic: true },
    }),
  ]);

  const topicFrequency = topicsLastMonth.reduce<Record<string, number>>((acc, t) => {
    acc[t.topic] = (acc[t.topic] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalThisMonth,
    totalAllTime,
    topicFrequency,
  };
}

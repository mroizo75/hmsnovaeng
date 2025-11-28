"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: "Ikke autentisert" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "Bruker ikke funnet" };
  }

  return { user };
}

export async function updateNotificationSettings(data: {
  notifyByEmail: boolean;
  notifyBySms: boolean;
  reminderDaysBefore: number;
  notifyMeetings: boolean;
  notifyInspections: boolean;
  notifyAudits: boolean;
  notifyMeasures: boolean;
}) {
  try {
    const context = await getSessionContext();
    if ("error" in context) {
      return { success: false, error: context.error };
    }

    const { user } = context;

    // Valider at reminderDaysBefore er et gyldig tall
    if (data.reminderDaysBefore < 0 || data.reminderDaysBefore > 30) {
      return {
        success: false,
        error: "Påminnelsestid må være mellom 0 og 30 dager",
      };
    }

    // Hvis SMS er aktivert, sjekk at bruker har telefonnummer
    if (data.notifyBySms && !user.phone) {
      return {
        success: false,
        error: "Du må legge til telefonnummer før du kan aktivere SMS-varsler",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        notifyByEmail: data.notifyByEmail,
        notifyBySms: data.notifyBySms,
        reminderDaysBefore: data.reminderDaysBefore,
        notifyMeetings: data.notifyMeetings,
        notifyInspections: data.notifyInspections,
        notifyAudits: data.notifyAudits,
        notifyMeasures: data.notifyMeasures,
      },
    });

    revalidatePath("/dashboard/settings");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return {
      success: false,
      error: "Kunne ikke oppdatere varslingsinnstillinger",
    };
  }
}


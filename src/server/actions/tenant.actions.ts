"use server";

import { z, ZodError } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { deleteTenantFiles } from "@/lib/storage";

// Valideringsskjemaer
const updateTenantSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  slug: z.string().min(2, "Slug må være minst 2 tegn").regex(/^[a-z0-9-]+$/, "Slug kan kun inneholde små bokstaver, tall og bindestrek"),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email("Ugyldig e-postadresse").optional(),
  contactPhone: z.string().optional(),
  employeeCount: z.number().int().positive("Antall ansatte må være positivt").optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

const updateAdminEmailSchema = z.object({
  tenantId: z.string(),
  oldEmail: z.string().email(),
  newEmail: z.string().email("Ugyldig e-postadresse"),
});

const resendActivationSchema = z.object({
  tenantId: z.string(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8, "Passord må være minst 8 tegn"),
});

const createTenantSchema = z.object({
  name: z.string().min(2, "Bedriftsnavn må være minst 2 tegn"),
  orgNumber: z.string().optional(),
  contactPerson: z.string().min(2, "Kontaktperson er påkrevd"),
  contactEmail: z.string().email("Ugyldig e-postadresse"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  employeeCount: z.number().int().positive("Antall ansatte må være positivt"),
  industry: z.string().optional(),
  notes: z.string().optional(),
  pricingTier: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE"]),
  salesRep: z.string().optional(),
  createInFiken: z.boolean().optional(),
});

/**
 * Hent detaljert tenant-informasjon
 */
export async function getTenantDetails(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            documents: true,
            incidents: true,
            risks: true,
          },
        },
      },
    });

    if (!tenant) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    return { success: true, data: tenant };
  } catch (error) {
    console.error("Get tenant details error:", error);
    return { success: false, error: "Kunne ikke hente bedriftsinformasjon" };
  }
}

/**
 * Oppdater tenant-informasjon
 */
export async function updateTenant(input: z.infer<typeof updateTenantSchema>) {
  try {
    const validated = updateTenantSchema.parse(input);

    // Sjekk at slug er unik (unntatt for denne tenanten)
    const existingSlug = await prisma.tenant.findFirst({
      where: {
        slug: validated.slug,
        id: {
          not: validated.tenantId,
        },
      },
    });

    if (existingSlug) {
      return { success: false, error: "Denne slugen er allerede i bruk" };
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: validated.tenantId },
      data: {
        name: validated.name,
        slug: validated.slug,
        orgNumber: validated.orgNumber,
        address: validated.address,
        postalCode: validated.postalCode,
        city: validated.city,
        contactPerson: validated.contactPerson,
        contactEmail: validated.contactEmail,
        contactPhone: validated.contactPhone,
        employeeCount: validated.employeeCount,
        industry: validated.industry,
        notes: validated.notes,
      },
    });

    revalidatePath(`/admin/tenants/${validated.tenantId}`);
    revalidatePath("/admin/tenants");

    return { success: true, data: updatedTenant };
  } catch (error) {
    console.error("Update tenant error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Kunne ikke oppdatere bedriftsinformasjon" };
  }
}

/**
 * Oppdater admin-brukerens e-post
 */
export async function updateTenantAdminEmail(input: z.infer<typeof updateAdminEmailSchema>) {
  try {
    const validated = updateAdminEmailSchema.parse(input);

    // Finn admin-brukeren
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        tenantId: validated.tenantId,
        role: "ADMIN",
        user: {
          email: validated.oldEmail,
        },
      },
      include: {
        user: true,
      },
    });

    if (!userTenant) {
      return { success: false, error: "Admin-bruker ikke funnet" };
    }

    // Sjekk at ny e-post ikke er i bruk
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.newEmail },
    });

    if (existingUser && existingUser.id !== userTenant.userId) {
      return { success: false, error: "E-postadressen er allerede i bruk av en annen bruker" };
    }

    // Oppdater e-post
    const updatedUser = await prisma.user.update({
      where: { id: userTenant.userId },
      data: {
        email: validated.newEmail,
        emailVerified: new Date(), // Automatisk verifiser admin
      },
    });

    // Send bekreftelse på e-post
    await sendEmail({
      to: validated.newEmail,
      subject: "E-postadresse oppdatert - HMS Nova",
      html: `
        <h1>E-postadresse oppdatert</h1>
        <p>Hei ${updatedUser.name},</p>
        <p>Din e-postadresse for HMS Nova har blitt oppdatert til: <strong>${validated.newEmail}</strong></p>
        <p>Du kan nå logge inn med denne e-postadressen.</p>
        <br>
        <p>Hilsen HMS Nova teamet</p>
      `,
    });

    revalidatePath(`/admin/tenants/${validated.tenantId}`);

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Update admin email error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Kunne ikke oppdatere e-postadresse" };
  }
}

/**
 * Send aktivering på nytt
 */
export async function resendActivationEmail(input: z.infer<typeof resendActivationSchema>) {
  try {
    const validated = resendActivationSchema.parse(input);

    const tenant = await prisma.tenant.findUnique({
      where: { id: validated.tenantId },
    });

    if (!tenant) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    // Finn eller opprett admin-bruker
    let user = await prisma.user.findUnique({
      where: { email: validated.adminEmail },
      include: {
        tenants: {
          where: {
            tenantId: validated.tenantId,
          },
        },
      },
    });

    const hashedPassword = await bcrypt.hash(validated.adminPassword, 10);

    if (!user) {
      // Opprett ny bruker
      user = await prisma.user.create({
        data: {
          email: validated.adminEmail,
          name: tenant.contactPerson || "Admin",
          password: hashedPassword,
          emailVerified: new Date(),
          tenants: {
            create: {
              tenantId: validated.tenantId,
              role: "ADMIN",
            },
          },
        },
        include: {
          tenants: {
            where: {
              tenantId: validated.tenantId,
            },
          },
        },
      });
    } else if (user.tenants.length === 0) {
      // Koble eksisterende bruker til tenant
      await prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: validated.tenantId,
          role: "ADMIN",
        },
      });

      // Oppdater passord
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
    } else {
      // Oppdater eksisterende bruker
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
    }

    // Send aktiverings-e-post
    await sendEmail({
      to: validated.adminEmail,
      subject: `Velkommen til HMS Nova - ${tenant.name}`,
      html: `
        <h1>Velkommen til HMS Nova!</h1>
        <p>Din bedrift, <strong>${tenant.name}</strong>, er nå aktivert.</p>
        
        <h2>Påloggingsinformasjon</h2>
        <p>
          <strong>URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/login<br>
          <strong>E-post:</strong> ${validated.adminEmail}<br>
          <strong>Passord:</strong> (det du nettopp satte)
        </p>

        <p>Du har nå tilgang til systemet og kan begynne å bruke HMS Nova.</p>
        
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Logg inn nå
          </a>
        </p>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Hvis du har spørsmål, kontakt oss på support@hmsnova.no
        </p>
        
        <p>Hilsen HMS Nova teamet</p>
      `,
    });

    revalidatePath(`/admin/tenants/${validated.tenantId}`);

    return { success: true };
  } catch (error) {
    console.error("Resend activation error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Kunne ikke sende aktiverings-e-post" };
  }
}

/**
 * Endre tenant-status
 */
export async function toggleTenantStatus(tenantId: string, newStatus: "ACTIVE" | "SUSPENDED" | "CANCELLED") {
  try {
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: newStatus },
    });

    revalidatePath(`/admin/tenants/${tenantId}`);
    revalidatePath("/admin/tenants");

    return { success: true, data: updatedTenant };
  } catch (error) {
    console.error("Toggle tenant status error:", error);
    return { success: false, error: "Kunne ikke endre status" };
  }
}

/**
 * Opprett ny tenant (CRM/Onboarding)
 */
export async function createTenant(input: z.infer<typeof createTenantSchema>) {
  try {
    const validated = createTenantSchema.parse(input);

    // Generer slug fra navn
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Sjekk at slug er unik
    const existingSlug = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return { 
        success: false, 
        error: `En bedrift med slug "${slug}" eksisterer allerede. Vennligst endre bedriftsnavnet litt.` 
      };
    }

    // Opprett tenant med subscription
    const tenant = await prisma.tenant.create({
      data: {
        name: validated.name,
        slug,
        orgNumber: validated.orgNumber,
        address: validated.address,
        postalCode: validated.postalCode,
        city: validated.city,
        contactPerson: validated.contactPerson,
        contactEmail: validated.contactEmail,
        contactPhone: validated.contactPhone,
        employeeCount: validated.employeeCount,
        industry: validated.industry,
        notes: validated.notes,
        pricingTier: validated.pricingTier,
        salesRep: validated.salesRep,
        status: "TRIAL",
        onboardingStatus: "NOT_STARTED",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dager
        // Subscription opprettes når tenant aktiveres
      },
    });

    revalidatePath("/admin/tenants");
    revalidatePath("/admin/registrations");

    return { 
      success: true, 
      data: tenant,
      message: "Bedrift opprettet. Du kan nå aktivere den ved å sende påloggingsinformasjon til admin." 
    };
  } catch (error) {
    console.error("Create tenant error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Kunne ikke opprette bedrift" };
  }
}

/**
 * Slett tenant permanent (inkludert alle filer i R2 Cloud)
 * ADVARSEL: Denne operasjonen kan ikke angres!
 */
export async function deleteTenant(tenantId: string, confirmationText: string) {
  try {
    // Hent tenant først for å verifisere navn
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            documents: true,
            incidents: true,
            risks: true,
            trainings: true,
            audits: true,
            goals: true,
            chemicals: true,
            formTemplates: true,
            invoices: true,
          },
        },
      },
    });

    if (!tenant) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    // SIKKERHET: Verifiser at confirmationText matcher tenant.name
    if (confirmationText !== tenant.name) {
      return { 
        success: false, 
        error: `Bekreftelse mislyktes. Skriv inn bedriftsnavnet nøyaktig: "${tenant.name}"` 
      };
    }

    // SIKKERHET: Bare tillat sletting hvis status er CANCELLED eller SUSPENDED
    if (tenant.status === "ACTIVE" || tenant.status === "TRIAL") {
      return {
        success: false,
        error: "Kan ikke slette en aktiv bedrift. Endre status til CANCELLED eller SUSPENDED først.",
      };
    }

    console.log(`[DELETE TENANT] Starter sletting av tenant: ${tenant.name} (${tenantId})`);
    console.log(`[DELETE TENANT] Antall relaterte records:`, tenant._count);

    // Steg 1: Slett alle filer i R2 Cloud
    console.log(`[DELETE TENANT] Sletter filer fra R2 Cloud...`);
    const fileResult = await deleteTenantFiles(tenantId);
    console.log(`[DELETE TENANT] R2 Cloud: ${fileResult.deleted} filer slettet, ${fileResult.errors} feil`);

    // Steg 2: Slett tenant fra database (Prisma onDelete: Cascade håndterer alle relasjoner)
    console.log(`[DELETE TENANT] Sletter tenant fra database...`);
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    console.log(`[DELETE TENANT] ✅ Tenant slettet: ${tenant.name}`);

    revalidatePath("/admin/tenants");
    revalidatePath("/admin/registrations");

    return {
      success: true,
      message: `Bedrift "${tenant.name}" og alle tilhørende data er permanent slettet. ${fileResult.deleted} filer fjernet fra R2 Cloud.`,
      filesDeleted: fileResult.deleted,
      fileErrors: fileResult.errors,
    };
  } catch (error) {
    console.error("Delete tenant error:", error);
    return { 
      success: false, 
      error: "Kunne ikke slette bedrift. Se server-logg for detaljer." 
    };
  }
}

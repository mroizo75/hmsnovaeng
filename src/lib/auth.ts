import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // VIKTIG: Vi bruker PrismaAdapter, men må disable den for OAuth
  // fordi vi må kontrollere tenant-tilknytning manuelt i signIn-callback
  adapter: PrismaAdapter(prisma),
  providers: [
    // Microsoft/Office 365 SSO
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "select_account", // Tvinger bruker til å velge konto
        },
      },
    }),
    // Traditional credentials login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ugyldig pålogging");
        }

        // SIKKERHET: Normaliser e-post til lowercase for konsistent lookup
        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            tenants: {
              include: {
                tenant: {
                  include: {
                    invoices: {
                      where: {
                        status: "OVERDUE",
                      },
                    },
                  },
                },
              },
              take: 1,
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Ugyldig pålogging");
        }

        // SIKKERHET: Sjekk om kontoen er låst
        const MAX_ATTEMPTS = 5;
        const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutter

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Kontoen er midlertidig låst på grunn av for mange mislykkede påloggingsforsøk. Prøv igjen om ${minutesLeft} minutter.`
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Inkrementer failed attempts (håndter null-verdier)
          const currentAttempts = user.failedLoginAttempts || 0;
          const newFailedAttempts = currentAttempts + 1;
          const shouldLock = newFailedAttempts >= MAX_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
              lastLoginAttempt: new Date(),
              ...(shouldLock && {
                lockedUntil: new Date(Date.now() + LOCKOUT_DURATION),
              }),
            },
          });

          if (shouldLock) {
            throw new Error(
              "For mange mislykkede påloggingsforsøk. Kontoen er låst i 15 minutter."
            );
          }

          const attemptsLeft = MAX_ATTEMPTS - newFailedAttempts;
          throw new Error(
            `Ugyldig pålogging. ${attemptsLeft} forsøk gjenstår før kontoen låses.`
          );
        }

        // SUCCESS: Reset failed attempts og lockout (håndter null-verdier)
        if ((user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAttempt: new Date(),
            },
          });
        }

        // SIKKERHET: Sjekk om tenant er suspendert pga ubetalt faktura
        if (!user.isSuperAdmin && !user.isSupport && user.tenants.length > 0) {
          const tenant = user.tenants[0].tenant;
          
          if (tenant.status === "SUSPENDED") {
            if (tenant.invoices.length > 0) {
              throw new Error(
                "Din konto er suspendert på grunn av ubetalt faktura. " +
                "Kontakt support@hmsnova.com eller betal fakturaen for å reaktivere kontoen."
              );
            } else {
              throw new Error(
                "Din konto er suspendert. Kontakt support@hmsnova.com for mer informasjon."
              );
            }
          }

          // Advarsel hvis faktura snart forfaller
          const pendingInvoices = await prisma.invoice.findMany({
            where: {
              tenantId: tenant.id,
              status: "PENDING",
              dueDate: {
                lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dager
              },
            },
          });

          if (pendingInvoices.length > 0) {
            // Logg inn, men vi viser varselet i dashboard
            console.warn(`Tenant ${tenant.id} har forfallende faktura`);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth providers (Microsoft, Google, etc.)
      if (account?.provider !== "credentials") {
        const email = user.email!;
        
        // VIKTIG: Microsoft kan returnere ulike e-postadresser
        // - email: Primær e-post (kan være gmail.com, outlook.com, etc.)
        // - userPrincipalName: Innloggingsnavn i Azure AD (bedrift.no)
        // Vi må sjekke UPN for å finne riktig tenant!
        const azureProfile = profile as any;
        const userPrincipalName = azureProfile?.preferred_username || azureProfile?.upn || email;
        
        console.log(`🔐 SSO Login attempt:`, {
          email,
          userPrincipalName,
          provider: account?.provider,
        });
        
        // Valider om brukeren kan logge inn via Azure AD
        // Bruk UPN for tenant-matching, men email for brukeroppretting
        const { validateAzureAdLogin } = await import("@/server/actions/azure-ad.actions");
        const validation = await validateAzureAdLogin(userPrincipalName, email);

        if (!validation.allowed) {
          console.error(`SSO login denied for ${userPrincipalName}: ${validation.error}`);
          return false;
        }

        // Bruk e-posten som validation returnerte (kan være annerledes enn user.email)
        const finalEmail = validation.email || email;

        console.log(`✅ SSO validation passed. Using email: ${finalEmail} for tenant: ${validation.tenantId}`);

        // KRITISK: Sjekk om bruker eksisterer OG har tenant
        let existingUser = await prisma.user.findUnique({
          where: { email: finalEmail.toLowerCase() },
          include: {
            tenants: true, // Hent ALLE tenants for brukeren
          },
        });

        // Hvis bruker ikke eksisterer, opprett automatisk (JIT provisioning)
        if (!existingUser) {
          try {
            existingUser = await prisma.user.create({
              data: {
                email: finalEmail.toLowerCase(),
                name: user.name,
                emailVerified: new Date(),
                tenants: {
                  create: {
                    tenantId: validation.tenantId!,
                    role: validation.role!,
                  },
                },
              },
              include: {
                tenants: true,
              },
            });
            console.log(`✅ JIT provisioning: Created user ${finalEmail} with tenant ${validation.tenantId} and role ${validation.role}`);
          } catch (error) {
            console.error(`❌ Failed to create user ${finalEmail}:`, error);
            return false;
          }
        } else {
          // Bruker eksisterer - sjekk om de har denne tenanten
          const hasTenant = existingUser.tenants.some(t => t.tenantId === validation.tenantId);
          
          if (!hasTenant) {
            // Legg til tenant-tilknytning
            try {
              await prisma.userTenant.create({
                data: {
                  userId: existingUser.id,
                  tenantId: validation.tenantId!,
                  role: validation.role!,
                },
              });
              console.log(`✅ JIT provisioning: Added ${finalEmail} to tenant ${validation.tenantId} with role ${validation.role}`);
            } catch (error) {
              console.error(`❌ Failed to add tenant for user ${finalEmail}:`, error);
              return false;
            }
          } else {
            console.log(`✅ User ${finalEmail} already has tenant ${validation.tenantId}`);
          }
        }

        // EKSTRA SIKKERHET: Verifiser at bruker faktisk har tenant før vi tillater innlogging
        const verifyUser = await prisma.user.findUnique({
          where: { email: finalEmail.toLowerCase() },
          include: {
            tenants: {
              where: {
                tenantId: validation.tenantId,
              },
            },
          },
        });

        if (!verifyUser || verifyUser.tenants.length === 0) {
          console.error(`❌ CRITICAL: User ${finalEmail} exists but has NO tenant after JIT provisioning!`);
          return false; // Avvis innlogging hvis tenant mangler
        }

        console.log(`✅ SSO login successful for ${finalEmail} (UPN: ${userPrincipalName}) - Tenant verified`);
        return true;
      }

      // Credentials provider - standard håndtering
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        
        // Hent brukerdata fra database for å få isSuperAdmin, isSupport, tenantId og role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            tenants: {
              include: {
                tenant: {
                  select: {
                    name: true,
                    status: true,
                  },
                },
              },
            },
          },
        });
        
        if (dbUser) {
          token.isSuperAdmin = dbUser.isSuperAdmin;
          token.isSupport = dbUser.isSupport || false;
          token.hasMultipleTenants = dbUser.tenants.length > 1;
          
          // Velg tenant basert på lastTenantId hvis det finnes, ellers første aktive tenant
          let selectedTenant = dbUser.tenants[0];
          
          if (dbUser.lastTenantId) {
            const lastTenant = dbUser.tenants.find(t => t.tenantId === dbUser.lastTenantId);
            if (lastTenant && (lastTenant.tenant.status === "ACTIVE" || lastTenant.tenant.status === "TRIAL")) {
              selectedTenant = lastTenant;
            }
          }
          
          token.tenantId = selectedTenant?.tenantId || null;
          token.role = selectedTenant?.role || undefined;
          token.tenantName = selectedTenant?.tenant?.name || null;
        }
      }
      
      // Håndter session update (når tenant byttes)
      if (trigger === "update" && session?.tenantId) {
        token.tenantId = session.tenantId;
        
        // Hent oppdatert tenant info
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            tenants: {
              where: { tenantId: session.tenantId },
              include: {
                tenant: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        
        if (dbUser && dbUser.tenants[0]) {
          token.role = dbUser.tenants[0].role;
          token.tenantName = dbUser.tenants[0].tenant.name;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.isSupport = token.isSupport as boolean;
        session.user.tenantId = token.tenantId as string | null;
        session.user.role = token.role as any;
        session.user.tenantName = token.tenantName as string | null;
        session.user.hasMultipleTenants = token.hasMultipleTenants as boolean;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Logg SSO innlogginger
      if (account?.provider !== "credentials") {
        console.log(`SSO login: ${user.email} via ${account.provider}`);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};


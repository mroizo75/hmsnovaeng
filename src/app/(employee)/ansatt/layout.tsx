import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { LogoutButton } from "@/components/ansatt/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { BottomNav } from "@/components/ansatt/bottom-nav";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Kun for ansatte (ikke superadmin/support)
  if (session.user.isSuperAdmin || session.user.isSupport) {
    redirect("/admin");
  }

  // Hent brukerens profilbilde og tenant sin timeregistrering-status
  const [user, tenant] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true, name: true },
    }),
    session.user.tenantId
      ? prisma.tenant.findUnique({
          where: { id: session.user.tenantId },
          select: { timeRegistrationEnabled: true },
        })
      : null,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Mobil-optimalisert med logo */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-nova.png"
                alt="HMS Nova"
                width={155}
                height={100}
                className="h-16 w-auto"
                priority
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500">Ansatt</p>
              </div>
              
              {/* Varsler */}
              <NotificationBell />
              
              {/* Avatar - klikk for profil */}
              <Link
                href="/ansatt/profil"
                className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
                title="Min profil"
              >
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/files/${user.image}`}
                    alt="Profilbilde"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{session.user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </Link>
              
              {/* Logg ut med bekreftelse */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation - Mobil */}
      <BottomNav timeRegistrationEnabled={tenant?.timeRegistrationEnabled ?? false} />
    </div>
  );
}


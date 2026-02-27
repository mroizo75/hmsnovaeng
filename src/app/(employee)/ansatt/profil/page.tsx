import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldCheck, User } from "lucide-react";
import { ProfileForm } from "@/components/ansatt/profile-form";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  HMS: "EHS Manager",
  LEDER: "Supervisor",
  VERNEOMBUD: "Safety Representative",
  ANSATT: "Employee",
  BHT: "Occupational Health",
  REVISOR: "Auditor",
};

export default async function AnsattProfil() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenants: {
        include: {
          tenant: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-muted-foreground">Contact info &amp; account settings</p>
        </div>
      </div>

      {/* Profile form */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4 pt-5 px-5">
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      {/* Company / role info */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Company &amp; Role
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {user.tenants.map((ut) => (
            <div
              key={ut.id}
              className="flex items-start justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="space-y-1 min-w-0 pr-3">
                <p className="font-semibold text-sm text-gray-900 truncate">{ut.tenant.name}</p>
                {ut.department && (
                  <p className="text-xs text-muted-foreground">Dept: {ut.department}</p>
                )}
              </div>
              <Badge
                variant="secondary"
                className="text-[11px] whitespace-nowrap flex-shrink-0 flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" />
                {roleLabel[ut.role] ?? ut.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
}

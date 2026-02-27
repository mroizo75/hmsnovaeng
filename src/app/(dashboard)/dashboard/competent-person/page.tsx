import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users } from "lucide-react";
import { CompetentPersonForm } from "@/features/competent-person/components/competent-person-form";

export default async function CompetentPersonPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const [persons, tenantUsers] = await Promise.all([
    prisma.competentPerson.findMany({
      where: { tenantId, isActive: true },
      orderBy: { effectiveDate: "desc" },
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  const expiringSoon = persons.filter(
    (p) => p.expiresAt && new Date(p.expiresAt) > today && new Date(p.expiresAt) <= in30Days
  );
  const expired = persons.filter(
    (p) => p.expiresAt && new Date(p.expiresAt) <= today
  );

  const uniqueStandards = new Set(persons.map((p) => p.oshaStandard)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Competent Person Registry</h1>
        <p className="text-muted-foreground">OSHA-designated individuals with authority to identify and correct hazards</p>
      </div>

      {(expired.length > 0 || expiringSoon.length > 0) && (
        <div className="space-y-2">
          {expired.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-900">
                <strong>{expired.length}</strong> designation(s) have expired — update or deactivate.
              </p>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900">
                <strong>{expiringSoon.length}</strong> designation(s) expiring within 30 days.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Designations</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{persons.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring / Expired</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expired.length > 0 ? "text-red-600" : expiringSoon.length > 0 ? "text-amber-600" : "text-green-600"}`}>
              {expired.length + expiringSoon.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">OSHA Standards Covered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{uniqueStandards}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Registry</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <CompetentPersonForm tenantId={tenantId} designatedBy={user.name ?? user.email ?? ""} />

          {persons.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No competent persons designated yet.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {persons.map((p) => {
                const isExpired = p.expiresAt && new Date(p.expiresAt) <= today;
                const isExpiringSoon = !isExpired && p.expiresAt && new Date(p.expiresAt) <= in30Days;
                return (
                  <div key={p.id} className="flex items-start justify-between border rounded p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{userMap[p.userId] ?? p.userId}</span>
                        {isExpired
                          ? <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Expired</Badge>
                          : isExpiringSoon
                          ? <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Expiring Soon</Badge>
                          : <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{p.designation}</p>
                      <p className="text-xs text-muted-foreground">
                        Designated {new Date(p.effectiveDate).toLocaleDateString("en-US")} by {userMap[p.designatedBy] ?? p.designatedBy}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">{p.oshaStandard}</Badge>
                    </div>
                    {p.expiresAt && (
                      <p className={`text-xs shrink-0 ${isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                        Exp: {new Date(p.expiresAt).toLocaleDateString("en-US")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Competent Person — OSHA Definition</h3>
        <p className="text-sm text-blue-800">
          "One who is capable of identifying existing and predictable hazards in the surroundings or working conditions which are unsanitary, hazardous, or dangerous to employees, and who has authorization to take prompt corrective measures to eliminate them." — OSHA 29 CFR 1926.32(f)
        </p>
      </div>
    </div>
  );
}

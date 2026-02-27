import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft, Phone, MapPin } from "lucide-react";
import { DrillLogForm } from "@/features/eap/components/drill-log-form";

export default async function EapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [plan, tenantUsers] = await Promise.all([
    prisma.emergencyActionPlan.findFirst({
      where: { id, tenantId },
      include: { drills: { orderBy: { conductedAt: "desc" } } },
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  if (!plan) redirect("/dashboard/eap");

  // emergencyContacts: Array of { name, role, phone, agency? }
  const contacts = (plan.emergencyContacts as Array<{ name: string; role: string; phone: string }>) ?? [];
  // evacuationRoutes: Array of { route: string, mapKey?: string }
  const routes = (plan.evacuationRoutes as Array<{ route: string; mapKey?: string }>) ?? [];
  // assemblyPoints: Array of { name: string, description: string }
  const assemblyPoints = (plan.assemblyPoints as Array<{ name: string; description: string }>) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/eap" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" />
          Emergency Action Plans
        </Link>
        <h1 className="text-3xl font-bold">{plan.locationName}</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          Effective: {new Date(plan.effectiveDate).toLocaleDateString("en-US")}
          {plan.reviewedAt && ` · Reviewed: ${new Date(plan.reviewedAt).toLocaleDateString("en-US")}`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4" /> Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts defined.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                    <a href={`tel:${c.phone}`} className="text-sm font-mono text-blue-700 hover:underline">{c.phone}</a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Assembly Points &amp; Routes</CardTitle>
          </CardHeader>
          <CardContent>
            {assemblyPoints.length === 0 && routes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assembly points defined.</p>
            ) : (
              <div className="space-y-3">
                {assemblyPoints.map((ap, i) => (
                  <div key={i} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">{ap.name}</p>
                    <p className="text-xs text-muted-foreground">{ap.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Emergency Drill Log</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DrillLogForm planId={plan.id} conductedBy={user.name ?? user.email ?? ""} />
          {plan.drills.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No drills recorded yet.</p>
          ) : (
            <div className="space-y-2 mt-4">
              {plan.drills.map((drill) => (
                <div key={drill.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{drill.drillType} Drill</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(drill.conductedAt).toLocaleDateString("en-US")}
                      {drill.participantCount != null && ` · ${drill.participantCount} participants`}
                      {` · Led by ${userMap[drill.conductedBy] ?? drill.conductedBy}`}
                    </p>
                    {drill.findings && (
                      <p className="text-xs text-muted-foreground mt-0.5">Findings: {drill.findings}</p>
                    )}
                  </div>
                  <div className="text-xs text-right shrink-0">
                    {drill.durationMin != null && (
                      <p className="font-medium">{drill.durationMin} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

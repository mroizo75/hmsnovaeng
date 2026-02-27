import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, LifeBuoy, AlertCircle, CheckCircle, FileText } from "lucide-react";

export default async function EapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [plans, drillsThisYear] = await Promise.all([
    prisma.emergencyActionPlan.findMany({
      where: { tenantId },
      include: { drills: { orderBy: { conductedAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.emergencyDrill.count({
      where: {
        plan: { tenantId },
        conductedAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    }),
  ]);

  // Most recent plan is the active one — no isActive field on EAP
  const activePlan = plans[0] ?? null;
  const lastDrill = plans.flatMap((p) => p.drills)[0];
  const daysSinceLastDrill = lastDrill
    ? Math.floor((Date.now() - new Date(lastDrill.conductedAt).getTime()) / 86400000)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Action Plans</h1>
          <p className="text-muted-foreground">29 CFR 1910.38 — Evacuation, contacts &amp; drill records</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/eap/new">
            <Plus className="mr-2 h-4 w-4" /> New EAP
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {activePlan
                ? <><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-semibold">{activePlan.locationName}</span></>
                : <><AlertCircle className="h-5 w-5 text-red-500" /><span className="text-red-700 font-semibold">No plan created</span></>}
            </div>
            {activePlan && (
              <p className="text-xs text-muted-foreground mt-1">
                Updated {new Date(activePlan.updatedAt).toLocaleDateString("en-US")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drills This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drillsThisYear}</div>
            <p className="text-xs text-muted-foreground">
              {drillsThisYear >= 2 ? "✓ Meets OSHA recommendation" : "OSHA recommends ≥2 drills/year"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Drill</CardTitle>
          </CardHeader>
          <CardContent>
            {daysSinceLastDrill !== null ? (
              <>
                <div className="text-2xl font-bold">{daysSinceLastDrill}d ago</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastDrill!.conductedAt).toLocaleDateString("en-US")}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No drills recorded</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Emergency Action Plans</CardTitle></CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-3">
              <LifeBuoy className="h-10 w-10 mx-auto opacity-30" />
              <p>No Emergency Action Plans created yet.</p>
              <Button asChild><Link href="/dashboard/eap/new">Create First EAP</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between border rounded p-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.locationName}</span>
                      {plan === activePlan && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Effective: {new Date(plan.effectiveDate).toLocaleDateString("en-US")}
                      {plan.reviewedAt && ` · Reviewed: ${new Date(plan.reviewedAt).toLocaleDateString("en-US")}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last drill: {plan.drills[0]
                        ? new Date(plan.drills[0].conductedAt).toLocaleDateString("en-US")
                        : "none recorded"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/eap/${plan.id}`}>
                      <FileText className="mr-1 h-3 w-3" /> View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Emergency Action Plan — 29 CFR 1910.38</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Required for all workplaces with <strong>more than 10 employees</strong></li>
            <li>Must be in writing, kept in the workplace</li>
            <li>Include procedures for evacuation and emergency contacts</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Train all employees at time of initial assignment</li>
            <li>Review plan when hazards or procedures change</li>
            <li>OSHA recommends at least <strong>2 drills per year</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

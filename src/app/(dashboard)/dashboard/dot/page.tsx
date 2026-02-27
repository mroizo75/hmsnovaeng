import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Truck, AlertCircle, CheckCircle, UserCheck, ClipboardCheck, FlaskConical } from "lucide-react";

export default async function DotPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const [drivers, inspectionsDue, drugTestsThisYear, violations, recentInspections] = await Promise.all([
    prisma.dotDriver.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { drugTests: true } } },
      orderBy: { employeeName: "asc" },
    }),
    prisma.dotVehicleInspection.count({
      where: { tenantId, nextDue: { lt: today } },
    }),
    prisma.dotDrugTest.count({
      where: { tenantId, testedAt: { gte: yearStart } },
    }),
    prisma.dotViolation.count({
      where: { tenantId, resolvedAt: null },
    }),
    prisma.dotVehicleInspection.findMany({
      where: { tenantId },
      orderBy: { inspectedAt: "desc" },
      take: 5,
    }),
  ]);

  const cdlExpiringSoon = drivers.filter(
    (d) => d.cdlExpires && new Date(d.cdlExpires) <= in30
  );
  const medExpiringSoon = drivers.filter(
    (d) => d.medicalCertExpires && new Date(d.medicalCertExpires) <= in30
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DOT Compliance</h1>
          <p className="text-muted-foreground">FMCSA / 49 CFR — Driver qualifications, vehicle inspections & drug testing</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/dot/drivers/new">+ Add Driver</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/dot/inspections/new">+ Log Inspection</Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(cdlExpiringSoon.length > 0 || medExpiringSoon.length > 0 || inspectionsDue > 0 || violations > 0) && (
        <div className="space-y-2">
          {cdlExpiringSoon.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-900">
                <strong>{cdlExpiringSoon.length}</strong> CDL(s) expiring within 30 days:
                {" "}{cdlExpiringSoon.map((d) => d.employeeName).join(", ")}
              </p>
            </div>
          )}
          {medExpiringSoon.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-3">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-900">
                <strong>{medExpiringSoon.length}</strong> DOT Medical Certificate(s) expiring within 30 days.
              </p>
            </div>
          )}
          {inspectionsDue > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900">
                <strong>{inspectionsDue}</strong> vehicle(s) with overdue inspection.
              </p>
            </div>
          )}
          {violations > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-900">
                <strong>{violations}</strong> unresolved DOT violation(s).
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Drivers</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {cdlExpiringSoon.length > 0 ? `${cdlExpiringSoon.length} CDL expiring` : "All CDLs current"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inspections Overdue</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${inspectionsDue > 0 ? "text-red-600" : "text-green-600"}`}>
              {inspectionsDue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Drug Tests YTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drugTestsThisYear}</div>
            <p className="text-xs text-muted-foreground">This calendar year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Violations</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${violations > 0 ? "text-red-600" : "text-green-600"}`}>
              {violations}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Driver list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Drivers</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/dot/drivers">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {drivers.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <Truck className="h-8 w-8 mx-auto opacity-30 mb-2" />
                <p className="text-sm">No drivers registered.</p>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/dashboard/dot/drivers/new">Add First Driver</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {drivers.slice(0, 6).map((d) => {
                  const cdlExpiring = d.cdlExpires && new Date(d.cdlExpires) <= in30;
                  const medExpiring = d.medicalCertExpires && new Date(d.medicalCertExpires) <= in30;
                  return (
                    <div key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{d.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          CDL-{d.cdlClass ?? "?"}{d.cdlState ? ` (${d.cdlState})` : ""}
                          {d.cdlExpires && ` · Exp. ${new Date(d.cdlExpires).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {cdlExpiring && <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">CDL Expiring</Badge>}
                        {medExpiring && <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">Med Expiring</Badge>}
                        {!cdlExpiring && !medExpiring && <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Current</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inspections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Recent Inspections</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/dot/inspections">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInspections.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No inspections recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentInspections.map((insp) => (
                  <div key={insp.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Unit {insp.vehicleUnit}</p>
                      <p className="text-xs text-muted-foreground">
                        {insp.inspType.replace(/_/g, " ")} · {new Date(insp.inspectedAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    {insp.passed
                      ? <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Passed</Badge>
                      : <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Defects</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 DOT / FMCSA Requirements</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>49 CFR 391</strong> — Driver qualifications (CDL, medical cert)</li>
            <li><strong>49 CFR 382</strong> — Drug & alcohol testing program</li>
            <li><strong>49 CFR 395</strong> — Hours of Service (ELD required)</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>49 CFR 396</strong> — Vehicle inspection, repair, maintenance</li>
            <li><strong>49 CFR 390</strong> — General accident reporting</li>
            <li>State DOT requirements may be more stringent</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

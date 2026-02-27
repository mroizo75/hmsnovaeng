import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ShieldAlert, AlertCircle } from "lucide-react";
import { FallProtectionForm } from "@/features/fall-protection/components/fall-protection-form";
import { PpeItemCondition } from "@prisma/client";

const CONDITION_STYLE: Record<PpeItemCondition, string> = {
  GOOD:                "bg-green-100 text-green-800 border-green-300",
  NEEDS_SERVICE:       "bg-yellow-100 text-yellow-800 border-yellow-300",
  REMOVED_FROM_SERVICE:"bg-red-100 text-red-800 border-red-300",
};

export default async function FallProtectionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const programs = await prisma.fallProtectionProgram.findMany({
    where: { tenantId },
    include: {
      equipmentLogs: {
        where: { removalDate: null },
        orderBy: { lastInspected: "asc" },
        take: 50,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Equipment not inspected in over a year is considered overdue
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const overdueEquipment = programs.flatMap((p) =>
    p.equipmentLogs.filter((e) => new Date(e.lastInspected) < oneYearAgo)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fall Protection Program</h1>
          <p className="text-muted-foreground">29 CFR 1926.502 / 1910.28 — Hazard assessment &amp; equipment inspection logs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fall-protection/new">
            <Plus className="mr-2 h-4 w-4" /> New Program
          </Link>
        </Button>
      </div>

      {overdueEquipment.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Equipment Inspection Overdue</p>
            <p className="text-sm text-red-800">
              <strong>{overdueEquipment.length}</strong> fall protection item(s) not inspected in over a year. Remove from service until inspected.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">Fall protection programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce((s, p) => s + p.equipmentLogs.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tracked items in service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inspection Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueEquipment.length > 0 ? "text-red-600" : "text-green-600"}`}>
              {overdueEquipment.length}
            </div>
            <p className="text-xs text-muted-foreground">Items requiring inspection</p>
          </CardContent>
        </Card>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground space-y-3">
            <ShieldAlert className="h-10 w-10 mx-auto opacity-30" />
            <p>No fall protection programs created yet.</p>
            <Button asChild>
              <Link href="/dashboard/fall-protection/new">Create First Program</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        programs.map((prog) => {
          const overdueItems = prog.equipmentLogs.filter(
            (e) => new Date(e.lastInspected) < oneYearAgo
          );
          return (
            <Card key={prog.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Fall Protection Program
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Effective {new Date(prog.effectiveDate).toLocaleDateString("en-US")}
                      {prog.reviewedAt && ` · Reviewed ${new Date(prog.reviewedAt).toLocaleDateString("en-US")}`}
                    </p>
                  </div>
                  {overdueItems.length > 0 && (
                    <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                      {overdueItems.length} overdue
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {prog.equipmentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No equipment logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {prog.equipmentLogs.slice(0, 10).map((eq) => {
                      const isOverdue = new Date(eq.lastInspected) < oneYearAgo;
                      return (
                        <div key={eq.id} className="flex items-center justify-between text-sm border-b pb-1 last:border-0">
                          <div>
                            <span className="font-medium">{eq.equipmentType}</span>
                            {eq.serialNumber && <span className="text-muted-foreground ml-1">#{eq.serialNumber}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge className={`text-xs border ${CONDITION_STYLE[eq.condition]}`}>{eq.condition}</Badge>
                            <span className={isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                              {isOverdue ? "⚠ " : ""}Inspected {new Date(eq.lastInspected).toLocaleDateString("en-US")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <FallProtectionForm tenantId={tenantId} createdBy={user.name ?? user.email ?? ""} />

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Fall Protection — 29 CFR 1926.502 / 1910.28</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Required when working at heights <strong>≥4 ft</strong> (general industry) or <strong>≥6 ft</strong> (construction)</li>
            <li>Identify all fall hazards and implement controls</li>
            <li>Inspect personal fall arrest systems before each use</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Train employees on fall hazards and equipment</li>
            <li>Remove from service any damaged equipment immediately</li>
            <li>Annual competent person inspection of systems</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

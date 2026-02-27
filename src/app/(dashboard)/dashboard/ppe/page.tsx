import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, HardHat, AlertCircle, ClipboardList } from "lucide-react";
import { PpeItemCondition } from "@prisma/client";

const CONDITION_STYLE: Record<PpeItemCondition, string> = {
  GOOD:                "bg-green-100 text-green-800 border-green-300",
  NEEDS_SERVICE:       "bg-yellow-100 text-yellow-800 border-yellow-300",
  REMOVED_FROM_SERVICE:"bg-red-100 text-red-800 border-red-300",
};

export default async function PpePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [assessments, assignments, tenantUsers] = await Promise.all([
    prisma.ppeAssessment.findMany({
      where: { tenantId },
      orderBy: { assessedAt: "desc" },
    }),
    prisma.ppeAssignment.findMany({
      where: { tenantId, removedDate: null },
      orderBy: { issuedDate: "desc" },
      take: 20,
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  const damagedCount = assignments.filter((a) => a.condition === "REMOVED_FROM_SERVICE").length;
  // Items not inspected in >1 year are considered overdue
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const overdueInspections = assignments.filter(
    (a) => !a.lastInspected || new Date(a.lastInspected) < oneYearAgo
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPE Management</h1>
          <p className="text-muted-foreground">29 CFR 1910.132 — Hazard Assessments &amp; Equipment Issuance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/ppe/assessment/new">
              <ClipboardList className="mr-2 h-4 w-4" /> New Assessment
            </Link>
          </Button>
        </div>
      </div>

      {(damagedCount > 0 || overdueInspections > 0) && (
        <div className="space-y-2">
          {damagedCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-3">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-900"><strong>{damagedCount}</strong> PPE item(s) marked as DAMAGED — remove from service immediately.</p>
            </div>
          )}
          {overdueInspections > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900"><strong>{overdueInspections}</strong> PPE inspection(s) overdue (not inspected in 1+ year).</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hazard Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">Required by 29 CFR 1910.132(d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Currently issued equipment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Damaged / Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${damagedCount + overdueInspections > 0 ? "text-red-600" : "text-green-600"}`}>
              {damagedCount + overdueInspections}
            </div>
            <p className="text-xs text-muted-foreground">Items requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>PPE Hazard Assessments</CardTitle>
          <Button asChild size="sm">
            <Link href="/dashboard/ppe/assessment/new">
              <Plus className="h-3 w-3 mr-1" /> New
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-3">
              <HardHat className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm">No hazard assessments yet. A written assessment is required before issuing PPE.</p>
              <Button asChild>
                <Link href="/dashboard/ppe/assessment/new">Create First Assessment</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between border rounded p-3 hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{a.jobTitle ?? a.workArea}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.workArea} · Assessed {new Date(a.assessedAt).toLocaleDateString("en-US")} by {userMap[a.assessedBy] ?? a.assessedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.signature
                      ? <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Signed</Badge>
                      : <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Pending Signature</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active PPE Assignments</CardTitle></CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active PPE assignments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase">
                    <th className="text-left py-2 pr-3 font-medium">User</th>
                    <th className="text-left py-2 pr-3 font-medium">Type</th>
                    <th className="text-left py-2 pr-3 font-medium">Issued</th>
                    <th className="text-left py-2 pr-3 font-medium">Condition</th>
                    <th className="text-left py-2 font-medium">Last Inspected</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const isOverdue = !a.lastInspected || new Date(a.lastInspected) < oneYearAgo;
                    return (
                      <tr key={a.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-3 text-xs">{userMap[a.userId] ?? a.userId}</td>
                        <td className="py-2 pr-3">{a.ppeType}{a.model ? ` — ${a.model}` : ""}</td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">
                          {new Date(a.issuedDate).toLocaleDateString("en-US")}
                        </td>
                        <td className="py-2 pr-3">
                          <Badge className={`text-xs border ${CONDITION_STYLE[a.condition]}`}>{a.condition}</Badge>
                        </td>
                        <td className="py-2 text-xs">
                          {a.lastInspected
                            ? <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                                {isOverdue ? "⚠ " : ""}
                                {new Date(a.lastInspected).toLocaleDateString("en-US")}
                              </span>
                            : <span className="text-amber-600">Never</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 PPE Requirements — 29 CFR 1910.132</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Conduct and certify a workplace <strong>hazard assessment</strong></li>
            <li>Select PPE appropriate to the hazard</li>
            <li>Provide PPE at <strong>no cost</strong> to employees</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Train each employee who must use PPE</li>
            <li>Ensure proper fit — not one-size-fits-all</li>
            <li>Replace damaged or expired equipment immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

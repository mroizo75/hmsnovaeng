import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Lock, AlertCircle, CheckCircle, CalendarClock } from "lucide-react";

export default async function LotoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const reviewDue = new Date();
  reviewDue.setFullYear(reviewDue.getFullYear() - 1);

  const [programs, proceduresDueReview] = await Promise.all([
    prisma.lotoProgram.findMany({
      where: { tenantId },
      include: { _count: { select: { procedures: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lotoProcedure.count({
      where: {
        program: { tenantId },
        annualReviewAt: { lt: reviewDue },
      },
    }),
  ]);

  const activePrograms = programs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lockout / Tagout (LOTO)</h1>
          <p className="text-muted-foreground">29 CFR 1910.147 — Energy Control Program & Machine Procedures</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/loto/new">
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Link>
        </Button>
      </div>

      {proceduresDueReview > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <CalendarClock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Annual Review Required</p>
            <p className="text-sm text-amber-800">
              <strong>{proceduresDueReview}</strong> LOTO procedure(s) are due for annual review (29 CFR 1910.147(c)(6)).
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/api/loto/procedures?review=true">View Overdue Procedures</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms.length}</div>
            <p className="text-xs text-muted-foreground">Energy control programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce((s, p) => s + p._count.procedures, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Machine-specific procedures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Review Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${proceduresDueReview > 0 ? "text-amber-600" : "text-green-600"}`}>
              {proceduresDueReview}
            </div>
            <p className="text-xs text-muted-foreground">Annual review required</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>LOTO Programs</CardTitle></CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-3">
              <Lock className="h-10 w-10 mx-auto opacity-30" />
              <p>No LOTO programs created yet.</p>
              <p className="text-xs">29 CFR 1910.147 requires an Energy Control Program for any equipment with hazardous energy.</p>
              <Button asChild>
                <Link href="/dashboard/loto/new">Create Energy Control Program</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((prog) => (
                <div key={prog.id} className="flex items-center justify-between border rounded p-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <span className="font-medium">{prog.programName}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prog._count.procedures} procedure(s) · Effective {new Date(prog.effectiveDate).toLocaleDateString("en-US")}
                      {prog.reviewedAt && ` · Reviewed ${new Date(prog.reviewedAt).toLocaleDateString("en-US")}`}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/loto/${prog.id}`}>Manage →</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 LOTO Requirements — 29 CFR 1910.147</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Written Energy Control Program required</li>
            <li>Machine-specific procedures for each piece of equipment</li>
            <li>Annual review and certification of each procedure</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Employee training — authorized & affected employees</li>
            <li>Periodic inspections of the procedures</li>
            <li>Records of inspections must be retained</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

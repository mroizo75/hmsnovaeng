import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { LotoProcedureForm } from "@/features/loto/components/loto-procedure-form";

export default async function LotoProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const program = await prisma.lotoProgram.findFirst({
    where: { id, tenantId },
    include: {
      procedures: { orderBy: { equipmentName: "asc" } },
    },
  });

  if (!program) redirect("/dashboard/loto");

  const overdueCount = program.procedures.filter(
    (p) => !p.annualReviewAt || new Date(p.annualReviewAt) < reviewDue
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/loto" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="h-4 w-4" />
            LOTO Programs
          </Link>
          <h1 className="text-3xl font-bold">{program.programName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Effective {new Date(program.effectiveDate).toLocaleDateString("en-US")}
            {program.reviewedBy && ` · Reviewed by ${program.reviewedBy}`}
          </p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>{overdueCount}</strong> procedure(s) need annual review. OSHA requires annual certification by 29 CFR 1910.147(c)(6).
          </p>
        </div>
      )}

      {program.scope && (
        <Card>
          <CardHeader><CardTitle>Program Scope</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{program.scope}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Machine-Specific LOTO Procedures</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Each piece of equipment with complex energy sources requires its own procedure</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LotoProcedureForm programId={program.id} createdBy={user.name ?? user.email ?? ""} />

          {program.procedures.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No procedures added yet. Add a machine-specific procedure above.</p>
          ) : (
            <div className="space-y-3 mt-4">
              {program.procedures.map((proc) => {
                const isOverdue = !proc.annualReviewAt || new Date(proc.annualReviewAt) < reviewDue;
                return (
                  <div key={proc.id} className="flex items-start justify-between border rounded p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{proc.equipmentName}</span>
                        {isOverdue
                          ? <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Review Due</Badge>
                          : <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {proc.equipmentId && `ID: ${proc.equipmentId} · `}
                        {proc.location && `${proc.location} · `}
                        Annual review: {proc.annualReviewAt
                          ? new Date(proc.annualReviewAt).toLocaleDateString("en-US")
                          : "Never"}
                        {proc.annualReviewedBy && ` by ${proc.annualReviewedBy}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

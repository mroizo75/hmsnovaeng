import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Stethoscope } from "lucide-react";
import { WorkersCompStatus } from "@prisma/client";
import { WorkersCompClaimForm } from "@/features/workers-comp/components/workers-comp-claim-form";
import { EmrHistoryForm } from "@/features/workers-comp/components/emr-history-form";

const STATUS_STYLE: Record<WorkersCompStatus, string> = {
  OPEN:     "bg-amber-100 text-amber-800 border-amber-300",
  CLOSED:   "bg-green-100 text-green-800 border-green-300",
  DISPUTED: "bg-red-100 text-red-800 border-red-300",
  SETTLED:  "bg-blue-100 text-blue-800 border-blue-300",
};

export default async function WorkersCompPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [claims, emrHistory] = await Promise.all([
    prisma.workersCompClaim.findMany({
      where: { tenantId },
      orderBy: { injuryDate: "desc" },
    }),
    prisma.emrHistory.findMany({
      where: { tenantId },
      orderBy: { year: "desc" },
      take: 5,
    }),
  ]);

  const openClaims = claims.filter((c) => c.status === "OPEN");
  const claimsThisYear = claims.filter((c) => new Date(c.injuryDate) >= yearStart);
  const totalPaidThisYear = claimsThisYear.reduce((s, c) => s + (c.paidAmount ?? 0), 0);
  const currentEmr = emrHistory[0];
  const prevEmr = emrHistory[1];

  const emrTrend = currentEmr && prevEmr
    ? currentEmr.emrValue > prevEmr.emrValue ? "up"
    : currentEmr.emrValue < prevEmr.emrValue ? "down"
    : "flat"
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workers&apos; Compensation</h1>
        <p className="text-muted-foreground">Claims management &amp; Experience Modification Rate (EMR) tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Claims</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${openClaims.length > 0 ? "text-amber-600" : "text-green-600"}`}>
              {openClaims.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Claims YTD</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{claimsThisYear.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Paid YTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPaidThisYear.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Current EMR</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${currentEmr && currentEmr.emrValue > 1 ? "text-red-600" : currentEmr && currentEmr.emrValue < 1 ? "text-green-600" : ""}`}>
                {currentEmr ? currentEmr.emrValue.toFixed(2) : "—"}
              </div>
              {emrTrend === "up"   && <TrendingUp className="h-4 w-4 text-red-500" />}
              {emrTrend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
              {emrTrend === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground">1.0 = industry average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Claims</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <WorkersCompClaimForm tenantId={tenantId} />

          {claims.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No workers&apos; compensation claims recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase">
                    <th className="text-left py-2 pr-3 font-medium">Claim #</th>
                    <th className="text-left py-2 pr-3 font-medium">Claimant</th>
                    <th className="text-left py-2 pr-3 font-medium">Carrier</th>
                    <th className="text-left py-2 pr-3 font-medium">Injury Date</th>
                    <th className="text-left py-2 pr-3 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 pr-3 font-mono text-xs">{claim.claimNumber}</td>
                      <td className="py-2 pr-3">{claim.claimantName}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{claim.carrierName}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {new Date(claim.injuryDate).toLocaleDateString("en-US")}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge className={`text-xs border ${STATUS_STYLE[claim.status]}`}>{claim.status}</Badge>
                      </td>
                      <td className="py-2 text-right text-xs">
                        {claim.paidAmount != null ? `$${claim.paidAmount.toLocaleString("en-US")}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience Modification Rate (EMR)</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            EMR &lt; 1.0 = better than average · EMR = 1.0 = industry average · EMR &gt; 1.0 = higher risk
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmrHistoryForm tenantId={tenantId} />

          {emrHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No EMR history entered yet.</p>
          ) : (
            <div className="space-y-2 mt-4">
              {emrHistory.map((emr) => (
                <div key={emr.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="font-medium">{emr.year}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`text-lg font-bold ${emr.emrValue > 1 ? "text-red-600" : emr.emrValue < 1 ? "text-green-600" : ""}`}>
                      {emr.emrValue.toFixed(2)}
                    </span>
                    {emr.carrier && <span className="text-xs text-muted-foreground">{emr.carrier}</span>}
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

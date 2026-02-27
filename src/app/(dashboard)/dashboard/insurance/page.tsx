import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShieldCheck, AlertCircle } from "lucide-react";

const POLICY_LABELS: Record<string, string> = {
  workers_comp: "Workers' Comp",
  general_liability: "General Liability",
  property: "Property",
  umbrella: "Umbrella",
  auto: "Commercial Auto",
  professional_liability: "Professional Liability",
  cyber: "Cyber",
  epli: "EPLI",
};

const POLICY_COLORS: Record<string, string> = {
  workers_comp: "bg-blue-100 text-blue-800 border-blue-300",
  general_liability: "bg-purple-100 text-purple-800 border-purple-300",
  property: "bg-orange-100 text-orange-800 border-orange-300",
  umbrella: "bg-slate-100 text-slate-800 border-slate-300",
  auto: "bg-cyan-100 text-cyan-800 border-cyan-300",
};

export default async function InsurancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenantId = user.tenants[0].tenantId;
  const today = new Date();
  const in60 = new Date();
  in60.setDate(in60.getDate() + 60);

  const policies = await prisma.insurancePolicy.findMany({
    where: { tenantId },
    orderBy: [{ isActive: "desc" }, { expirationDate: "asc" }],
  });

  const active = policies.filter((p) => p.isActive);
  const expiringSoon = policies.filter(
    (p) => p.isActive && new Date(p.expirationDate) <= in60 && new Date(p.expirationDate) > today
  );
  const expired = policies.filter((p) => p.isActive && new Date(p.expirationDate) <= today);

  const totalPremium = active.reduce((sum, p) => sum + (Number(p.premiumAmount) ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insurance Policies</h1>
          <p className="text-muted-foreground">Track active coverage, renewals, and premium history</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/insurance/new">+ Add Policy</Link>
        </Button>
      </div>

      {expired.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-900">
            <strong>{expired.length}</strong> polic{expired.length > 1 ? "ies have" : "y has"} expired:
            {" "}{expired.map((p) => `${POLICY_LABELS[p.policyType] ?? p.policyType} (${p.carrier})`).join(", ")}
          </p>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>{expiringSoon.length}</strong> polic{expiringSoon.length > 1 ? "ies expire" : "y expires"} within 60 days — begin renewal process.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Policies</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Annual Premium (Total)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPremium > 0
                ? `$${totalPremium.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring / Expired</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiringSoon.length + expired.length > 0 ? "text-red-600" : "text-green-600"}`}>
              {expiringSoon.length + expired.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {policies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <ShieldCheck className="h-10 w-10 opacity-30 mb-3" />
              <p className="text-sm text-muted-foreground">No insurance policies on file yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/dashboard/insurance/new">Add First Policy</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          policies.map((p) => {
            const isExpired = new Date(p.expirationDate) <= today;
            const isExpiringSoon = !isExpired && new Date(p.expirationDate) <= in60;

            return (
              <Card key={p.id} className={isExpired ? "border-red-300" : isExpiringSoon ? "border-amber-300" : ""}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge className={POLICY_COLORS[p.policyType] ?? "bg-gray-100 text-gray-800 border-gray-300"}>
                          {POLICY_LABELS[p.policyType] ?? p.policyType}
                        </Badge>
                        {isExpired && <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Expired</Badge>}
                        {isExpiringSoon && <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Renew Soon</Badge>}
                      </div>
                      <p className="font-semibold">{p.carrier}</p>
                      <p className="text-sm text-muted-foreground">Policy #{p.policyNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(p.effectiveDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {" → "}
                      <span className={isExpired ? "text-red-600 font-semibold" : isExpiringSoon ? "text-amber-600 font-semibold" : ""}>
                        {new Date(p.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </p>
                    {p.premiumAmount && (
                      <p className="text-xs text-muted-foreground">
                        Premium: ${Number(p.premiumAmount).toLocaleString("en-US")}/yr
                        {p.coverageLimit && ` · Limit: $${Number(p.coverageLimit).toLocaleString("en-US")}`}
                      </p>
                    )}
                    {p.agentName && (
                      <p className="text-xs text-muted-foreground">Agent: {p.agentName}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

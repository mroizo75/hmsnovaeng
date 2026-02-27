import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, ExternalLink, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type OshaTop10Entry = {
  rank: number;
  standard: string;
  title: string;
  penaltyAvg: string;
  citations: string;
  module?: string;
  moduleLink?: string;
};

const OSHA_TOP10: OshaTop10Entry[] = [
  { rank: 1, standard: "1926.501", title: "Fall Protection — Construction", penaltyAvg: "$15,625", citations: "5,947", module: "Fall Protection", moduleLink: "/dashboard/fall-protection" },
  { rank: 2, standard: "1910.1200", title: "Hazard Communication (HazCom / GHS)", penaltyAvg: "$4,840", citations: "4,025", module: "Regulatory Register", moduleLink: "/dashboard/regulatory-register" },
  { rank: 3, standard: "1926.503", title: "Fall Protection — Training Requirements", penaltyAvg: "$4,840", citations: "2,978", module: "Fall Protection", moduleLink: "/dashboard/fall-protection" },
  { rank: 4, standard: "1910.134", title: "Respiratory Protection", penaltyAvg: "$3,861", citations: "2,976", module: "Industrial Hygiene", moduleLink: "/dashboard/industrial-hygiene" },
  { rank: 5, standard: "1910.147", title: "Control of Hazardous Energy (LOTO)", penaltyAvg: "$9,533", citations: "2,969", module: "LOTO", moduleLink: "/dashboard/loto" },
  { rank: 6, standard: "1910.178", title: "Powered Industrial Trucks (Forklifts)", penaltyAvg: "$4,840", citations: "2,319", module: "Toolbox Talks", moduleLink: "/dashboard/toolbox-talks" },
  { rank: 7, standard: "1910.305", title: "Electrical — Wiring Methods", penaltyAvg: "$4,840", citations: "1,996", module: "Regulatory Register", moduleLink: "/dashboard/regulatory-register" },
  { rank: 8, standard: "1926.1053", title: "Ladders — Construction", penaltyAvg: "$4,840", citations: "1,977", module: "Fall Protection", moduleLink: "/dashboard/fall-protection" },
  { rank: 9, standard: "1910.212", title: "Machine Guarding", penaltyAvg: "$4,840", citations: "1,967", module: "LOTO", moduleLink: "/dashboard/loto" },
  { rank: 10, standard: "1910.303", title: "Electrical — General Requirements", penaltyAvg: "$4,840", citations: "1,937", module: "Regulatory Register", moduleLink: "/dashboard/regulatory-register" },
];

type SystemCheck = {
  label: string;
  link: string;
  check: (data: ComplianceData) => "ok" | "warn" | "missing";
};

type ComplianceData = {
  hasEap: boolean;
  hasPpe: boolean;
  hasLoto: boolean;
  hasFallProtection: boolean;
  hasToolboxTalks: boolean;
  hasConfinedSpace: boolean;
  hasIhPrograms: boolean;
  openViolations: number;
  openClaims: number;
  insuranceExpiring: boolean;
};

const SYSTEM_CHECKS: SystemCheck[] = [
  { label: "Emergency Action Plan", link: "/dashboard/eap", check: (d) => d.hasEap ? "ok" : "missing" },
  { label: "PPE Hazard Assessments", link: "/dashboard/ppe", check: (d) => d.hasPpe ? "ok" : "missing" },
  { label: "LOTO Program", link: "/dashboard/loto", check: (d) => d.hasLoto ? "ok" : "missing" },
  { label: "Fall Protection Program", link: "/dashboard/fall-protection", check: (d) => d.hasFallProtection ? "ok" : "missing" },
  { label: "Toolbox Talks (this year)", link: "/dashboard/toolbox-talks", check: (d) => d.hasToolboxTalks ? "ok" : "warn" },
  { label: "Confined Space Inventory", link: "/dashboard/confined-space", check: (d) => d.hasConfinedSpace ? "ok" : "warn" },
  { label: "Industrial Hygiene Monitoring", link: "/dashboard/industrial-hygiene", check: (d) => d.hasIhPrograms ? "ok" : "warn" },
  { label: "Open DOT Violations", link: "/dashboard/dot", check: (d) => d.openViolations === 0 ? "ok" : "warn" },
  { label: "Open Workers' Comp Claims", link: "/dashboard/workers-comp", check: (d) => d.openClaims === 0 ? "ok" : "warn" },
  { label: "Insurance Coverage", link: "/dashboard/insurance", check: (d) => d.insuranceExpiring ? "warn" : "ok" },
];

export default async function SafetyInsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenantId = user.tenants[0].tenantId;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const in60 = new Date();
  in60.setDate(in60.getDate() + 60);

  const [
    eapCount, ppeCount, lotoCount, fallCount, toolboxCount,
    csCount, ihCount, openViolations, openClaims, expiringPolicies,
    incidentCount, oshaLogCount,
  ] = await Promise.all([
    prisma.emergencyActionPlan.count({ where: { tenantId } }),
    prisma.ppeAssessment.count({ where: { tenantId } }),
    prisma.lotoProgram.count({ where: { tenantId } }),
    prisma.fallProtectionProgram.count({ where: { tenantId } }),
    prisma.toolboxTalk.count({ where: { tenantId, conductedAt: { gte: yearStart } } }),
    prisma.confinedSpace.count({ where: { tenantId } }),
    prisma.ihMonitoringProgram.count({ where: { tenantId, isActive: true } }),
    prisma.dotViolation.count({ where: { tenantId, resolvedAt: null } }),
    prisma.workersCompClaim.count({ where: { tenantId, status: "OPEN" } }),
    prisma.insurancePolicy.count({ where: { tenantId, isActive: true, expirationDate: { lte: in60 } } }),
    prisma.incident.count({ where: { tenantId, occurredAt: { gte: yearStart } } }),
    prisma.oshaLog.count({ where: { tenantId, year: new Date().getFullYear() } }),
  ]);

  const complianceData: ComplianceData = {
    hasEap: eapCount > 0,
    hasPpe: ppeCount > 0,
    hasLoto: lotoCount > 0,
    hasFallProtection: fallCount > 0,
    hasToolboxTalks: toolboxCount > 0,
    hasConfinedSpace: csCount > 0,
    hasIhPrograms: ihCount > 0,
    openViolations,
    openClaims,
    insuranceExpiring: expiringPolicies > 0,
  };

  const checkResults = SYSTEM_CHECKS.map((c) => ({ ...c, result: c.check(complianceData) }));
  const okCount = checkResults.filter((r) => r.result === "ok").length;
  const warnCount = checkResults.filter((r) => r.result === "warn").length;
  const missingCount = checkResults.filter((r) => r.result === "missing").length;
  const score = Math.round((okCount / SYSTEM_CHECKS.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Safety Insights</h1>
        <p className="text-muted-foreground">EHS program health check based on OSHA Top 10 violations &amp; system coverage</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className={score >= 80 ? "border-green-400" : score >= 60 ? "border-amber-400" : "border-red-400"}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">EHS Compliance Score</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}>
              {score}%
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Incidents YTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentCount}</div>
            <p className="text-xs text-muted-foreground">{oshaLogCount} OSHA recordable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Claims</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${openClaims > 0 ? "text-amber-600" : "text-green-600"}`}>{openClaims}</div>
            <p className="text-xs text-muted-foreground">Workers' Comp</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Toolbox Talks YTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolboxCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Program coverage checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Program Coverage Check
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {okCount} OK · {warnCount} attention needed · {missingCount} missing
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {checkResults.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <Link href={r.link} className="text-sm hover:underline flex items-center gap-2">
                  {r.result === "ok" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                  {r.result === "warn" && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                  {r.result === "missing" && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  {r.label}
                </Link>
                {r.result === "ok" && <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">OK</Badge>}
                {r.result === "warn" && <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Review</Badge>}
                {r.result === "missing" && <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Missing</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* OSHA Top 10 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                OSHA Top 10 Citations (FY 2024)
              </CardTitle>
              <a
                href="https://www.osha.gov/top10citedstandards"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
              >
                OSHA.gov <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Ensure your programs address these most-cited standards</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {OSHA_TOP10.map((entry) => (
              <div key={entry.rank} className="flex items-start justify-between py-1.5 border-b last:border-0 gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-0.5">#{entry.rank}</span>
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      §{entry.standard} · {entry.citations} citations · avg {entry.penaltyAvg}
                    </p>
                  </div>
                </div>
                {entry.moduleLink && (
                  <Button asChild size="sm" variant="outline" className="shrink-0 h-7 text-xs">
                    <Link href={entry.moduleLink}>→</Link>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to Improve Your Score</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          {missingCount > 0 && (
            <li>Create the {missingCount} missing safety program(s) flagged above — these are mandatory OSHA requirements.</li>
          )}
          {warnCount > 0 && (
            <li>Address the {warnCount} item(s) marked "Review" to strengthen your EHS program coverage.</li>
          )}
          <li>Conduct monthly Toolbox Talks to maintain employee awareness and demonstrate proactive safety culture.</li>
          <li>Keep the OSHA 300 Log current — accurate recordkeeping is critical during inspections.</li>
          <li>Review the OSHA Top 10 list and verify your programs address each standard.</li>
          {expiringPolicies > 0 && (
            <li>Renew insurance polic{expiringPolicies > 1 ? "ies" : "y"} expiring within 60 days.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

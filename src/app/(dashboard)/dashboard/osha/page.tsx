import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  Minus,
  ClipboardList,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { calculateOshaKpis } from "@/lib/osha-kpis";

export default async function OshaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const currentYear = new Date().getFullYear();

  const [tenant, currentLog, recordableIncidents, allLogs] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { totalHoursWorkedYtd: true, avgEmployeeCount: true, osha300Enabled: true } }),
    prisma.oshaLog.findUnique({ where: { tenantId_year: { tenantId, year: currentYear } } }),
    prisma.incident.findMany({
      where: { tenantId, oshaRecordable: true, osha300LogYear: currentYear },
      orderBy: { occurredAt: "desc" },
      take: 5,
      select: { id: true, title: true, occurredAt: true, oshaClassification: true, privacyCaseFlag: true },
    }),
    prisma.oshaLog.findMany({ where: { tenantId }, orderBy: { year: "desc" }, take: 3 }),
  ]);

  const totalHours = currentLog?.totalHoursWorked ?? tenant?.totalHoursWorkedYtd ?? 0;

  const allRecordable = await prisma.incident.findMany({
    where: { tenantId, oshaRecordable: true, osha300LogYear: currentYear },
    select: { oshaClassification: true, daysAwayFromWork: true },
  });

  const darsCount = allRecordable.filter((i) =>
    i.oshaClassification === "DAYS_AWAY" || i.oshaClassification === "RESTRICTED_WORK" || i.oshaClassification === "JOB_TRANSFER"
  ).length;
  const lostTimeCount = allRecordable.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const totalLostDays = allRecordable.reduce((s, i) => s + (i.daysAwayFromWork ?? 0), 0);

  const kpis = calculateOshaKpis({
    totalHoursWorked: totalHours,
    recordableIncidents: allRecordable.length,
    daysAwayRestrictedTransferCases: darsCount,
    lostTimeCases: lostTimeCount,
    totalLostWorkDays: totalLostDays,
  });

  const is300APostingDue = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    return month >= 2 && month <= 4 && !currentLog?.postedAt;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OSHA Recordkeeping</h1>
          <p className="text-muted-foreground">29 CFR Part 1904 — Injuries & Illnesses Log</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/osha/300-log">
              <FileText className="mr-2 h-4 w-4" />
              OSHA 300 Log
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/incidents/new">
              <AlertCircle className="mr-2 h-4 w-4" />
              Report Incident
            </Link>
          </Button>
        </div>
      </div>

      {is300APostingDue() && (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">OSHA 300A Posting Required</p>
            <p className="text-sm text-amber-800 mt-1">
              The Annual Summary (Form 300A) must be posted in a visible location from <strong>February 1 – April 30</strong>.
              Ensure total hours worked and average employee count are entered, then certify and mark as posted.
            </p>
            <Button asChild size="sm" className="mt-2 bg-amber-700 hover:bg-amber-800">
              <Link href="/dashboard/osha/300-log">Complete 300A →</Link>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">TRIR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours > 0 ? kpis.trir.toFixed(2) : "—"}</div>
            <p className="text-xs text-muted-foreground">Total Recordable Incident Rate</p>
            <p className="text-xs text-muted-foreground mt-1">Industry avg: 2.7</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">DART Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours > 0 ? kpis.dartRate.toFixed(2) : "—"}</div>
            <p className="text-xs text-muted-foreground">Days Away, Restricted, Transfer</p>
            <p className="text-xs text-muted-foreground mt-1">Industry avg: 1.5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recordable Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRecordable.length}</div>
            <p className="text-xs text-muted-foreground">{currentYear} YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lost Work Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLostDays}</div>
            <p className="text-xs text-muted-foreground">{currentYear} YTD</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Recordable Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Recordable Incidents — {currentYear}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/osha/300-log">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recordableIncidents.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No recordable incidents in {currentYear}
              </div>
            ) : (
              <div className="space-y-3">
                {recordableIncidents.map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {inc.privacyCaseFlag ? "Privacy Case" : inc.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inc.occurredAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    {inc.oshaClassification && (
                      <Badge variant="outline" className="text-xs">
                        {inc.oshaClassification.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year-over-Year Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Year-Over-Year Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {allLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No historical data yet. Enter hours worked to see TRIR trend.</p>
            ) : (
              <div className="space-y-3">
                {allLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{log.year}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">TRIR</p>
                        <p className="text-sm font-bold">{log.trir?.toFixed(2) ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">DART</p>
                        <p className="text-sm font-bold">{log.dartRate?.toFixed(2) ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 300A Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            OSHA 300A Annual Summary — {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {currentLog?.certifiedAt
                ? <CheckCircle className="h-5 w-5 text-green-600" />
                : <AlertCircle className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">Certification</p>
                <p className="text-xs text-muted-foreground">
                  {currentLog?.certifiedAt
                    ? `Certified by ${currentLog.certifiedBy} on ${new Date(currentLog.certifiedAt).toLocaleDateString("en-US")}`
                    : "Not yet certified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentLog?.postedAt
                ? <CheckCircle className="h-5 w-5 text-green-600" />
                : <AlertCircle className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">Posted Feb 1 – Apr 30</p>
                <p className="text-xs text-muted-foreground">
                  {currentLog?.postedAt
                    ? `Posted ${new Date(currentLog.postedAt).toLocaleDateString("en-US")}`
                    : "Not yet posted"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {totalHours > 0
                ? <CheckCircle className="h-5 w-5 text-green-600" />
                : <AlertCircle className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">Hours Worked</p>
                <p className="text-xs text-muted-foreground">
                  {totalHours > 0
                    ? `${totalHours.toLocaleString()} hours entered`
                    : "Hours not yet entered"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/osha/300-log">
                <ClipboardList className="mr-2 h-4 w-4" />
                Manage OSHA 300 Log & 300A
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 OSHA 300 Recordkeeping — 29 CFR 1904</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Required for employers with <strong>more than 10 employees</strong></li>
            <li>Record all work-related injuries and illnesses</li>
            <li>Maintain records for <strong>5 years</strong></li>
            <li>Make available to OSHA on request within 4 hours</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>OSHA 300A must be certified by a company executive</li>
            <li>Post 300A from <strong>February 1 – April 30</strong> each year</li>
            <li>First Aid only cases are NOT recordable</li>
            <li>Privacy cases: omit employee name on Form 300</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

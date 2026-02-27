import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CheckCircle, AlertCircle, ClipboardList, Shield, GraduationCap, FileText,
  Lock, HardHat, Flame, Users, DoorOpen, Droplets, CalendarCheck, Target,
} from "lucide-react";
import { calculateOshaKpis } from "@/lib/osha-kpis";

type ProgramItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  status: "complete" | "in-progress" | "not-started" | "na";
  detail: string;
};

export default async function AnnualSafetyProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const year = new Date().getFullYear();

  const [
    activePlans, ppeAssessments, toolboxTalksCount, oshaLog,
    lotoPrograms, fallPrograms, competentPersons, confinedSpaces,
    bbpProgram, openClaims, auditsThisYear, managementReviews,
    goalsOpen, incidentsYtd,
  ] = await Promise.all([
    prisma.emergencyActionPlan.count({ where: { tenantId } }),
    prisma.ppeAssessment.count({ where: { tenantId } }),
    prisma.toolboxTalk.count({ where: { tenantId, conductedAt: { gte: new Date(year, 0, 1) } } }),
    prisma.oshaLog.findUnique({ where: { tenantId_year: { tenantId, year } } }),
    prisma.lotoProgram.count({ where: { tenantId } }),
    prisma.fallProtectionProgram.count({ where: { tenantId } }),
    prisma.competentPerson.count({ where: { tenantId, isActive: true } }),
    prisma.confinedSpace.count({ where: { tenantId } }),
    prisma.bloodbornePathogenProgram.findFirst({ where: { tenantId } }),
    prisma.workersCompClaim.count({ where: { tenantId, status: "OPEN" } }),
    prisma.audit.count({ where: { tenantId, scheduledDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } } }),
    prisma.managementReview.count({ where: { tenantId, reviewDate: { gte: new Date(year, 0, 1) } } }),
    prisma.goal.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.incident.count({ where: { tenantId, occurredAt: { gte: new Date(year, 0, 1) } } }),
  ]);

  const recordableIncidents = await prisma.incident.findMany({
    where: { tenantId, oshaRecordable: true, osha300LogYear: year },
    select: { oshaClassification: true, daysAwayFromWork: true },
  });
  const totalHours = oshaLog?.totalHoursWorked ?? 0;
  const darsCount = recordableIncidents.filter((i) =>
    ["DAYS_AWAY", "RESTRICTED_WORK", "JOB_TRANSFER"].includes(i.oshaClassification ?? "")
  ).length;
  const kpis = calculateOshaKpis({
    totalHoursWorked: totalHours,
    recordableIncidents: recordableIncidents.length,
    daysAwayRestrictedTransferCases: darsCount,
    lostTimeCases: recordableIncidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length,
    totalLostWorkDays: recordableIncidents.reduce((s, i) => s + (i.daysAwayFromWork ?? 0), 0),
  });

  const programs: ProgramItem[] = [
    {
      label: "OSHA Recordkeeping (300/301/300A)",
      href: "/dashboard/osha",
      icon: ClipboardList,
      status: oshaLog?.certifiedAt ? "complete" : recordableIncidents.length > 0 ? "in-progress" : "not-started",
      detail: oshaLog?.certifiedAt
        ? `300A certified · TRIR: ${kpis.trir.toFixed(2)}`
        : `${recordableIncidents.length} recordable case(s) · 300A not yet certified`,
    },
    {
      label: "Emergency Action Plan",
      href: "/dashboard/eap",
      icon: Flame,
      status: activePlans > 0 ? "complete" : "not-started",
      detail: activePlans > 0 ? `${activePlans} active plan(s)` : "No active EAP — required by 29 CFR 1910.38",
    },
    {
      label: "PPE Hazard Assessments",
      href: "/dashboard/ppe",
      icon: HardHat,
      status: ppeAssessments > 0 ? "complete" : "not-started",
      detail: ppeAssessments > 0 ? `${ppeAssessments} job classification(s) assessed` : "No assessments — required by 29 CFR 1910.132",
    },
    {
      label: "Toolbox Talks",
      href: "/dashboard/toolbox-talks",
      icon: Shield,
      status: toolboxTalksCount >= 12 ? "complete" : toolboxTalksCount > 0 ? "in-progress" : "not-started",
      detail: `${toolboxTalksCount} talk(s) YTD ${toolboxTalksCount >= 12 ? "(monthly goal met)" : "(target: 1/month)"}`,
    },
    {
      label: "LOTO Program",
      href: "/dashboard/loto",
      icon: Lock,
      status: lotoPrograms > 0 ? "complete" : "not-started",
      detail: lotoPrograms > 0 ? `${lotoPrograms} active program(s)` : "Not created — required for any hazardous energy",
    },
    {
      label: "Fall Protection Program",
      href: "/dashboard/fall-protection",
      icon: Shield,
      status: fallPrograms > 0 ? "complete" : "not-started",
      detail: fallPrograms > 0 ? `${fallPrograms} active program(s)` : "Not created — required for elevated work",
    },
    {
      label: "Competent Person Registry",
      href: "/dashboard/competent-person",
      icon: Users,
      status: competentPersons > 0 ? "complete" : "not-started",
      detail: `${competentPersons} designated competent person(s)`,
    },
    {
      label: "Confined Space Inventory",
      href: "/dashboard/confined-space",
      icon: DoorOpen,
      status: confinedSpaces > 0 ? "complete" : "na",
      detail: confinedSpaces > 0 ? `${confinedSpaces} space(s) inventoried` : "No confined spaces identified",
    },
    {
      label: "Bloodborne Pathogen Program",
      href: "/dashboard/bloodborne-pathogen",
      icon: Droplets,
      status: bbpProgram ? "complete" : "na",
      detail: bbpProgram ? "Exposure Control Plan active" : "N/A — not required if no occupational exposure",
    },
    {
      label: "Safety Training (OSHA)",
      href: "/dashboard/training",
      icon: GraduationCap,
      status: "in-progress",
      detail: "Review training matrix for annual recertifications",
    },
    {
      label: "Safety Audits / Inspections",
      href: "/dashboard/audits",
      icon: FileText,
      status: auditsThisYear > 0 ? "complete" : "not-started",
      detail: `${auditsThisYear} audit(s) this year`,
    },
    {
      label: "Management Review",
      href: "/dashboard/management-reviews",
      icon: CalendarCheck,
      status: managementReviews > 0 ? "complete" : "not-started",
      detail: `${managementReviews} review(s) this year — ISO 45001 requires annual review`,
    },
    {
      label: "Safety Goals & Objectives",
      href: "/dashboard/goals",
      icon: Target,
      status: goalsOpen > 0 ? "in-progress" : "not-started",
      detail: `${goalsOpen} active goal(s)`,
    },
  ];

  const complete = programs.filter((p) => p.status === "complete").length;
  const inProgress = programs.filter((p) => p.status === "in-progress").length;
  const notStarted = programs.filter((p) => p.status === "not-started").length;
  const pct = Math.round((complete / programs.filter((p) => p.status !== "na").length) * 100);

  const STATUS_COLOR = {
    "complete": "text-green-600",
    "in-progress": "text-amber-600",
    "not-started": "text-red-500",
    "na": "text-muted-foreground",
  };
  const STATUS_ICON = {
    "complete": <CheckCircle className="h-5 w-5 text-green-600" />,
    "in-progress": <AlertCircle className="h-5 w-5 text-amber-500" />,
    "not-started": <AlertCircle className="h-5 w-5 text-red-500" />,
    "na": <Minus className="h-5 w-5 text-muted-foreground" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Annual Safety Program — {year}</h1>
          <p className="text-muted-foreground">EHS program completeness overview & compliance checklist</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{pct}%</div>
          <p className="text-xs text-muted-foreground">Program complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Complete</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{complete}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Not Started</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-500">{notStarted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Incidents YTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentsYtd}</div>
            <p className="text-xs text-muted-foreground">{recordableIncidents.length} recordable</p>
          </CardContent>
        </Card>
      </div>

      {/* Program checklist */}
      <Card>
        <CardHeader><CardTitle>Program Elements Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {programs.map((prog) => {
              const Icon = prog.icon;
              return (
                <Link key={prog.label} href={prog.href} className="flex items-center gap-4 p-3 border rounded hover:bg-muted/40 transition-colors group">
                  <div className="shrink-0">{STATUS_ICON[prog.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${STATUS_COLOR[prog.status]}`}>{prog.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{prog.detail}</p>
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 OSHA Injury & Illness Prevention Program (I2P2)</h3>
        <p className="text-sm text-blue-800">
          OSHA strongly recommends — and some states require — a written Injury and Illness Prevention Program (I2P2). This annual safety program overview tracks the core elements of your EHS management system against OSHA standards, ISO 45001, and ANSI/ASSP Z10.
        </p>
      </div>
    </div>
  );
}

function Minus({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

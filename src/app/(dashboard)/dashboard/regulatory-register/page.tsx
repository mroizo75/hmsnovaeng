import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scale, ExternalLink, CheckCircle, AlertCircle, Minus } from "lucide-react";

type Applicability = "required" | "conditional" | "recommended";

type OshaStandard = {
  code: string;
  title: string;
  category: string;
  applicability: Applicability;
  condition?: string;
  dashboardLink?: string;
  oshaUrl: string;
  requires: string[];
};

const OSHA_STANDARDS: OshaStandard[] = [
  // === Recordkeeping ===
  {
    code: "29 CFR 1904",
    title: "Recording and Reporting Occupational Injuries and Illnesses",
    category: "Recordkeeping",
    applicability: "conditional",
    condition: "Employers with 11+ employees",
    dashboardLink: "/dashboard/osha",
    oshaUrl: "https://www.osha.gov/recordkeeping",
    requires: ["OSHA 300 Log", "OSHA 300A Annual Summary", "OSHA 301 Incident Report"],
  },
  // === General Industry ===
  {
    code: "29 CFR 1910.38",
    title: "Emergency Action Plans",
    category: "General Industry",
    applicability: "required",
    dashboardLink: "/dashboard/eap",
    oshaUrl: "https://www.osha.gov/emergency-preparedness/planning",
    requires: ["Written EAP", "Employee training", "Drill documentation"],
  },
  {
    code: "29 CFR 1910.132",
    title: "Personal Protective Equipment",
    category: "General Industry",
    applicability: "required",
    dashboardLink: "/dashboard/ppe",
    oshaUrl: "https://www.osha.gov/personal-protective-equipment",
    requires: ["Written hazard assessment", "Certification", "Employee training"],
  },
  {
    code: "29 CFR 1910.147",
    title: "Control of Hazardous Energy (Lockout/Tagout)",
    category: "General Industry",
    applicability: "conditional",
    condition: "Any equipment with hazardous energy",
    dashboardLink: "/dashboard/loto",
    oshaUrl: "https://www.osha.gov/lockout-tagout",
    requires: ["Written energy control program", "Machine-specific procedures", "Annual review", "Employee training"],
  },
  {
    code: "29 CFR 1910.146",
    title: "Permit-Required Confined Spaces",
    category: "General Industry",
    applicability: "conditional",
    condition: "Workplaces with permit-required confined spaces",
    dashboardLink: "/dashboard/confined-space",
    oshaUrl: "https://www.osha.gov/confined-spaces",
    requires: ["Space inventory", "Written program", "Entry permits", "Rescue plan"],
  },
  {
    code: "29 CFR 1910.1030",
    title: "Bloodborne Pathogens",
    category: "General Industry",
    applicability: "conditional",
    condition: "Occupational exposure to blood or OPIM",
    dashboardLink: "/dashboard/bloodborne-pathogen",
    oshaUrl: "https://www.osha.gov/bloodborne-pathogens",
    requires: ["Exposure Control Plan", "Hepatitis B vaccine offer", "Annual training", "Sharps injury log"],
  },
  {
    code: "29 CFR 1910.1200",
    title: "Hazard Communication (HazCom 2012 / GHS)",
    category: "General Industry",
    applicability: "required",
    dashboardLink: "/dashboard/chemicals",
    oshaUrl: "https://www.osha.gov/hazard-communication",
    requires: ["Chemical inventory", "SDS for each chemical", "GHS labels", "Employee training"],
  },
  {
    code: "29 CFR 1910.119",
    title: "Process Safety Management (PSM)",
    category: "General Industry",
    applicability: "conditional",
    condition: "Highly hazardous chemicals above threshold quantities",
    oshaUrl: "https://www.osha.gov/process-safety-management",
    requires: ["Process Hazard Analysis", "Written procedures", "Pre-startup review"],
  },
  // === Construction ===
  {
    code: "29 CFR 1926.502",
    title: "Fall Protection — Construction",
    category: "Construction",
    applicability: "conditional",
    condition: "Construction work at heights ≥6 ft",
    dashboardLink: "/dashboard/fall-protection",
    oshaUrl: "https://www.osha.gov/fall-protection",
    requires: ["Fall hazard assessment", "Written program", "Equipment inspection", "Competent person"],
  },
  {
    code: "29 CFR 1910.28",
    title: "Fall Protection — General Industry",
    category: "General Industry",
    applicability: "conditional",
    condition: "Work at heights ≥4 ft (general industry)",
    dashboardLink: "/dashboard/fall-protection",
    oshaUrl: "https://www.osha.gov/fall-protection",
    requires: ["Fall hazard assessment", "Written program", "Equipment inspection"],
  },
  {
    code: "29 CFR 1926.1101",
    title: "Asbestos — Construction",
    category: "Construction",
    applicability: "conditional",
    condition: "Demolition, renovation, or disturbance of asbestos-containing materials",
    oshaUrl: "https://www.osha.gov/asbestos",
    requires: ["Competent person", "Air monitoring", "Medical surveillance", "Training"],
  },
  // === Hazardous Substances ===
  {
    code: "29 CFR 1910.1025",
    title: "Lead",
    category: "Hazardous Substances",
    applicability: "conditional",
    condition: "Exposures to lead at or above action level (30 µg/m³)",
    oshaUrl: "https://www.osha.gov/lead",
    requires: ["Air monitoring", "Medical surveillance", "Respiratory protection", "Hygiene facilities"],
  },
  {
    code: "29 CFR 1910.95",
    title: "Occupational Noise Exposure",
    category: "General Industry",
    applicability: "conditional",
    condition: "Time-weighted average ≥85 dBA (action level)",
    oshaUrl: "https://www.osha.gov/noise",
    requires: ["Hearing conservation program", "Audiometric testing", "HPD", "Training"],
  },
  // === Training ===
  {
    code: "Multi-standard",
    title: "Safety Training Requirements",
    category: "Training",
    applicability: "required",
    dashboardLink: "/dashboard/training",
    oshaUrl: "https://www.osha.gov/training",
    requires: ["HazCom / GHS", "PPE", "Emergency procedures", "Job-specific hazards"],
  },
  {
    code: "Multi-standard",
    title: "Toolbox Talks / Safety Meetings",
    category: "Training",
    applicability: "recommended",
    dashboardLink: "/dashboard/toolbox-talks",
    oshaUrl: "https://www.osha.gov/training/toolbox-talks",
    requires: ["Attendance records", "Topic documentation"],
  },
];

const CATEGORY_ORDER = [
  "Recordkeeping", "General Industry", "Construction", "Hazardous Substances", "Training",
];

const APPLICABILITY_STYLE: Record<Applicability, string> = {
  required: "bg-red-100 text-red-800 border-red-300",
  conditional: "bg-amber-100 text-amber-800 border-amber-300",
  recommended: "bg-blue-100 text-blue-800 border-blue-300",
};

export default async function RegulatoryRegisterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  // Check compliance status across modules
  const [eapCount, ppeCount, lotoCount, confinedCount, bbpProgram, oshaLogThisYear] = await Promise.all([
    prisma.emergencyActionPlan.count({ where: { tenantId } }),
    prisma.ppeAssessment.count({ where: { tenantId } }),
    prisma.lotoProgram.count({ where: { tenantId } }),
    prisma.confinedSpace.count({ where: { tenantId } }),
    prisma.bloodbornePathogenProgram.findFirst({ where: { tenantId } }),
    prisma.oshaLog.findUnique({ where: { tenantId_year: { tenantId, year: new Date().getFullYear() } } }),
  ]);

  const complianceMap: Record<string, "complete" | "partial" | "none"> = {
    "29 CFR 1904": oshaLogThisYear?.certifiedAt ? "complete" : "partial",
    "29 CFR 1910.38": eapCount > 0 ? "complete" : "none",
    "29 CFR 1910.132": ppeCount > 0 ? "complete" : "none",
    "29 CFR 1910.147": lotoCount > 0 ? "complete" : "none",
    "29 CFR 1910.146": confinedCount > 0 ? "complete" : "none",
    "29 CFR 1910.1030": bbpProgram ? "complete" : "none",
    "29 CFR 1910.1200": "partial",
  };

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    standards: OSHA_STANDARDS.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regulatory Register</h1>
        <p className="text-muted-foreground">OSHA standards applicable to your operations — compliance status overview</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(["required", "conditional", "recommended"] as Applicability[]).map((a) => {
          const count = OSHA_STANDARDS.filter((s) => s.applicability === a).length;
          return (
            <div key={a} className={`rounded border p-3 ${APPLICABILITY_STYLE[a]}`}>
              <p className="font-semibold text-sm capitalize">{a}</p>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs">standard{count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {byCategory.map(({ category, standards }) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {standards.map((std) => {
                const status = complianceMap[std.code];
                return (
                  <div key={`${std.code}-${std.title}`} className="border rounded p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{std.code}</code>
                          <span className="font-semibold text-sm">{std.title}</span>
                          <Badge className={`text-xs border ${APPLICABILITY_STYLE[std.applicability]}`}>
                            {std.applicability}
                          </Badge>
                          {status === "complete" && <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle className="h-3 w-3" /> Compliant</span>}
                          {status === "partial" && <span className="flex items-center gap-1 text-xs text-amber-700"><AlertCircle className="h-3 w-3" /> In Progress</span>}
                          {status === "none" && std.applicability !== "recommended" && <span className="flex items-center gap-1 text-xs text-red-700"><AlertCircle className="h-3 w-3" /> Not Started</span>}
                        </div>
                        {std.condition && (
                          <p className="text-xs text-muted-foreground mb-2">⚡ Applies when: {std.condition}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {std.requires.map((r) => (
                            <span key={r} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{r}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {std.dashboardLink && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={std.dashboardLink}>Manage</Link>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="sm">
                          <a href={std.oshaUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 About This Register</h3>
        <p className="text-sm text-blue-800">
          This register tracks key federal OSHA standards applicable to most general industry and construction employers.
          State-plan states (CA, WA, OR, etc.) may have additional or more stringent requirements. Always consult your state OSHA plan.
          <a href="https://www.osha.gov/stateplans" target="_blank" rel="noopener noreferrer" className="underline ml-1">View State Plans →</a>
        </p>
      </div>
    </div>
  );
}

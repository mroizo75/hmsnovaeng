import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, MapPin, AlertCircle, Info } from "lucide-react";

type StateRequirement = {
  id: string;
  standard: string;
  title: string;
  summary: string;
  stricter: boolean;
  applicability: string;
  reference: string;
  referenceUrl: string;
};

const STATE_PLANS: Record<string, { name: string; planUrl: string; requirements: StateRequirement[] }> = {
  CA: {
    name: "California",
    planUrl: "https://www.dir.ca.gov/Cal-OSHA/",
    requirements: [
      {
        id: "ca-iipp",
        standard: "8 CCR 3203",
        title: "Injury & Illness Prevention Program (IIPP)",
        summary: "California requires all employers to have a written IIPP — similar to OSHA's PSM but mandatory for all workplaces.",
        stricter: true,
        applicability: "All employers",
        reference: "Cal/OSHA 8 CCR §3203",
        referenceUrl: "https://www.dir.ca.gov/title8/3203.html",
      },
      {
        id: "ca-heat",
        standard: "8 CCR 3395",
        title: "Heat Illness Prevention (Outdoor)",
        summary: "Mandatory shade, water, and rest requirements when outdoor temperatures exceed 80°F. Emergency response plan required above 95°F.",
        stricter: true,
        applicability: "Outdoor workers",
        reference: "Cal/OSHA 8 CCR §3395",
        referenceUrl: "https://www.dir.ca.gov/title8/3395.html",
      },
      {
        id: "ca-haz",
        standard: "8 CCR 5194",
        title: "HazCom / GHS (Cal/OSHA)",
        summary: "Cal/OSHA has its own version of HazCom aligned with GHS. Same SDS and label requirements as Federal OSHA.",
        stricter: false,
        applicability: "Workplaces using hazardous chemicals",
        reference: "Cal/OSHA 8 CCR §5194",
        referenceUrl: "https://www.dir.ca.gov/title8/5194.html",
      },
      {
        id: "ca-aed",
        standard: "Labor Code §512.9",
        title: "AED Requirements",
        summary: "Employers with 200+ employees must have an AED on the worksite. Training for designated employees required.",
        stricter: true,
        applicability: "Employers 200+ employees",
        reference: "CA Labor Code §512.9",
        referenceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=512.9.&lawCode=LAB",
      },
    ],
  },
  TX: {
    name: "Texas",
    planUrl: "https://www.osha.gov/dcsp/osp/stateprogs/texas.html",
    requirements: [
      {
        id: "tx-fed",
        standard: "Federal OSHA",
        title: "Federal OSHA Applies — No State Plan",
        summary: "Texas operates under Federal OSHA jurisdiction. There is no Texas State OSHA plan. All federal standards apply.",
        stricter: false,
        applicability: "All employers",
        reference: "29 CFR 1910 / 1926",
        referenceUrl: "https://www.osha.gov",
      },
      {
        id: "tx-heat",
        standard: "TLV / ACGIH",
        title: "Heat Exposure (No Specific Standard)",
        summary: "No state-specific heat standard. Federal OSHA's general duty clause applies. ACGIH TLV® recommended best practice.",
        stricter: false,
        applicability: "Outdoor / hot workplaces",
        reference: "OSHA General Duty Clause",
        referenceUrl: "https://www.osha.gov/heat",
      },
    ],
  },
  NY: {
    name: "New York",
    planUrl: "https://dol.ny.gov/worker-protection/public-employee-safety-and-health",
    requirements: [
      {
        id: "ny-peosh",
        standard: "NY Labor Law §27-a",
        title: "Public Employee Safety & Health (PESH)",
        summary: "New York's PESH Bureau enforces OSHA standards for public-sector workers. Private sector is Federal OSHA.",
        stricter: false,
        applicability: "Public sector employers",
        reference: "NY Labor Law §27-a",
        referenceUrl: "https://dol.ny.gov/worker-protection/public-employee-safety-and-health",
      },
      {
        id: "ny-scaffold",
        standard: "NY Labor Law §240",
        title: "Scaffold Law — Absolute Liability",
        summary: "New York's unique 'Scaffold Law' imposes absolute liability on property owners and contractors for gravity-related injuries on scaffolds and ladders.",
        stricter: true,
        applicability: "Construction — fall protection",
        reference: "NY Labor Law §240 / §241",
        referenceUrl: "https://www.nysenate.gov/legislation/laws/LAB/240",
      },
    ],
  },
  WA: {
    name: "Washington",
    planUrl: "https://lni.wa.gov/safety-health/",
    requirements: [
      {
        id: "wa-l-i",
        standard: "WAC 296 series",
        title: "Washington L&I WISHA",
        summary: "Washington operates its own State Plan (WISHA) under WA L&I. Generally stricter than federal OSHA in many areas.",
        stricter: true,
        applicability: "All employers",
        reference: "WAC 296 series",
        referenceUrl: "https://apps.leg.wa.gov/wac/default.aspx?cite=296",
      },
      {
        id: "wa-heat",
        standard: "WAC 296-62-095",
        title: "Outdoor Heat Exposure",
        summary: "Washington has a specific outdoor heat illness prevention rule requiring shade, water, rest, and training when temps exceed 89°F.",
        stricter: true,
        applicability: "Outdoor workers",
        reference: "WAC 296-62-095",
        referenceUrl: "https://apps.leg.wa.gov/wac/default.aspx?cite=296-62-095",
      },
    ],
  },
  OR: {
    name: "Oregon",
    planUrl: "https://osha.oregon.gov/",
    requirements: [
      {
        id: "or-heat",
        standard: "OAR 437-002-0156",
        title: "Heat Illness Prevention",
        summary: "Oregon OSHA requires access to shade, water, first-aid, and acclimatization for new workers when temperatures reach 80°F.",
        stricter: true,
        applicability: "All workplaces with heat exposure",
        reference: "OAR 437-002-0156",
        referenceUrl: "https://osha.oregon.gov/OSHARules/div2/div2Z-HeatIllness.pdf",
      },
    ],
  },
  FL: {
    name: "Florida",
    planUrl: "https://www.osha.gov/dcsp/osp/stateprogs/florida.html",
    requirements: [
      {
        id: "fl-fed",
        standard: "Federal OSHA",
        title: "Federal OSHA Applies",
        summary: "Florida operates under Federal OSHA for private-sector workers. State OSHA plan only covers public employees.",
        stricter: false,
        applicability: "Private sector — all employers",
        reference: "29 CFR 1910 / 1926",
        referenceUrl: "https://www.osha.gov",
      },
    ],
  },
};

const DEFAULT_STATE = {
  name: "Your State",
  planUrl: "https://www.osha.gov/dcsp/osp/",
  requirements: [
    {
      id: "default-fed",
      standard: "Federal OSHA",
      title: "Federal OSHA Applies",
      summary: "This state operates under Federal OSHA jurisdiction. All 29 CFR Part 1910 / 1926 standards apply.",
      stricter: false,
      applicability: "All employers",
      reference: "29 CFR 1910 / 1926",
      referenceUrl: "https://www.osha.gov",
    },
  ],
};

export default async function StateRequirementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenants[0].tenantId } });
  const usState = tenant?.usState ?? "";

  const stateData = STATE_PLANS[usState] ?? DEFAULT_STATE;
  const stricterCount = stateData.requirements.filter((r) => r.stricter).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">State-Specific Requirements</h1>
          <p className="text-muted-foreground">
            {usState
              ? `Requirements specific to ${stateData.name} — beyond Federal OSHA`
              : "Configure your state in tenant settings to see state-specific guidance"}
          </p>
        </div>
        {usState && (
          <Button asChild variant="outline" size="sm">
            <a href={stateData.planUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3 w-3 mr-2" />
              {stateData.name} OSHA Website
            </a>
          </Button>
        )}
      </div>

      {!usState && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 p-4">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-900">
            Your tenant does not have a US state configured. Go to{" "}
            <Link href="/dashboard/settings" className="font-medium underline">Settings → Company Profile</Link> and set your state.
          </p>
        </div>
      )}

      {stricterCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>{stateData.name}</strong> has <strong>{stricterCount}</strong> requirement(s) that are stricter than Federal OSHA.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">State</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">{usState || "Not Set"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requirements</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stateData.requirements.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stricter than Federal</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stricterCount > 0 ? "text-amber-600" : "text-green-600"}`}>
              {stricterCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {stateData.requirements.map((req) => (
          <Card key={req.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{req.standard}</span>
                    {req.stricter && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Stricter than Federal</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold">{req.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{req.summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Applies to:</strong> {req.applicability}
                  </p>
                </div>
                <a
                  href={req.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  {req.reference}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 border p-5">
        <h3 className="font-semibold mb-2">🗺️ Supported State Plans</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Full state-specific guidance is currently available for: <strong>CA, TX, NY, WA, OR, FL</strong>.
          Other states default to Federal OSHA.
        </p>
        <div className="grid grid-cols-6 gap-2 text-sm">
          {Object.entries(STATE_PLANS).map(([abbr, data]) => (
            <div key={abbr} className={`rounded border px-3 py-2 text-center ${usState === abbr ? "border-blue-400 bg-blue-50 font-medium" : "border-border bg-white"}`}>
              <div className="font-mono text-xs text-muted-foreground">{abbr}</div>
              <div className="text-xs">{data.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

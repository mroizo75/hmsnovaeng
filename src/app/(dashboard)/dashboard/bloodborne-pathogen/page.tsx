import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Droplets } from "lucide-react";
import { HepBVaccineStatus } from "@prisma/client";
import { BbpProgramForm } from "@/features/bloodborne-pathogen/components/bbp-program-form";
import { BbpVaccinationForm } from "@/features/bloodborne-pathogen/components/bbp-vaccination-form";

const VACCINE_STYLE: Record<HepBVaccineStatus, string> = {
  OFFERED:   "bg-blue-100 text-blue-800 border-blue-300",
  ACCEPTED:  "bg-yellow-100 text-yellow-800 border-yellow-300",
  DECLINED:  "bg-red-100 text-red-800 border-red-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
};

const VACCINE_LABEL: Record<HepBVaccineStatus, string> = {
  OFFERED:   "Offered",
  ACCEPTED:  "Accepted — In Progress",
  DECLINED:  "Declined",
  COMPLETED: "Completed",
};

export default async function BloodbornePathogenPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [programs, vaccinations, tenantUsers] = await Promise.all([
    prisma.bloodbornePathogenProgram.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.bbpVaccinationRecord.findMany({
      where: { program: { tenantId } },
      orderBy: { offeredAt: "desc" },
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  // Most recent program is the active one — model has no isActive field
  const activeProgram = programs[0] ?? null;

  const declinedCount = vaccinations.filter((v) => v.status === "DECLINED").length;
  const pendingCount  = vaccinations.filter((v) => v.status === "OFFERED" || v.status === "ACCEPTED").length;
  const completedCount = vaccinations.filter((v) => v.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bloodborne Pathogens Program</h1>
        <p className="text-muted-foreground">29 CFR 1910.1030 — Exposure Control Plan &amp; Hepatitis B Vaccination Records</p>
      </div>

      {!activeProgram && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Exposure Control Plan Required</p>
            <p className="text-sm text-amber-800">
              29 CFR 1910.1030 requires a written Exposure Control Plan for any employee with occupational exposure to blood or OPIM.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Exposure Control Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {activeProgram
                ? <><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-semibold text-green-700">Active</span></>
                : <><AlertCircle className="h-5 w-5 text-red-500" /><span className="text-red-700 font-semibold">Not Created</span></>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hep B Records</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaccinations.length}</div>
            <p className="text-xs text-muted-foreground">{completedCount} completed · {pendingCount} pending · {declinedCount} declined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Annual Review</CardTitle></CardHeader>
          <CardContent>
            {activeProgram?.reviewedAt ? (
              <div className="text-sm font-medium">
                {new Date(activeProgram.reviewedAt).toLocaleDateString("en-US")}
              </div>
            ) : (
              <div className="text-sm text-amber-700">Not yet reviewed</div>
            )}
            <p className="text-xs text-muted-foreground">Required annually</p>
          </CardContent>
        </Card>
      </div>

      {/* Exposure Control Plan */}
      <Card>
        <CardHeader><CardTitle>Exposure Control Plan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <BbpProgramForm
            tenantId={tenantId}
            activeProgram={activeProgram ? {
              id: activeProgram.id,
              exposedPositions: activeProgram.exposedPositions as { jobTitle: string; tasks: string[] }[],
              engineeringControls: activeProgram.engineeringControls as { control: string; location: string }[],
              workPracticeControls: activeProgram.workPracticeControls as string[],
              ppe: activeProgram.ppe as { item: string; when: string }[],
              decontaminationPlan: activeProgram.decontaminationPlan,
              wasteDisposalPlan: activeProgram.wasteDisposalPlan,
              notes: activeProgram.notes,
            } : null}
          />
          {activeProgram && (
            <div className="mt-4 p-3 bg-muted/30 rounded space-y-1 text-sm">
              <p className="text-xs text-muted-foreground">
                Effective: {new Date(activeProgram.effectiveDate).toLocaleDateString("en-US")}
                {activeProgram.reviewedAt && ` · Last reviewed: ${new Date(activeProgram.reviewedAt).toLocaleDateString("en-US")}`}
              </p>
              {activeProgram.notes && <p><span className="font-medium">Notes:</span> {activeProgram.notes}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vaccination Records */}
      <Card>
        <CardHeader>
          <CardTitle>Hepatitis B Vaccination Records</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Employer must offer Hep B vaccine at no cost to all employees with occupational exposure
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeProgram && <BbpVaccinationForm programId={activeProgram.id} />}

          {vaccinations.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Droplets className="h-8 w-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No vaccination records yet.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {vaccinations.map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <span className="font-medium text-sm">{userMap[v.userId] ?? v.userId}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Offered: {new Date(v.offeredAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${VACCINE_STYLE[v.status]}`}>
                      {VACCINE_LABEL[v.status]}
                    </Badge>
                    {v.respondedAt && (
                      <span className="text-xs text-muted-foreground">
                        Responded: {new Date(v.respondedAt).toLocaleDateString("en-US")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Bloodborne Pathogens — 29 CFR 1910.1030</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Written Exposure Control Plan required</li>
            <li>Review and update plan annually</li>
            <li>Offer Hepatitis B vaccine at no cost to exposed employees</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Annual training for all exposed employees</li>
            <li>Post-exposure evaluation and follow-up procedures</li>
            <li>Sharps injury log maintained for 5 years</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

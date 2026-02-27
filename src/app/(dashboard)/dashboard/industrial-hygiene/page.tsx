import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FlaskConical, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const HAZARD_ICONS: Record<string, string> = {
  CHEMICAL: "🧪",
  NOISE: "🔊",
  HEAT: "🌡️",
  RADIATION: "☢️",
  BIOLOGICAL: "🦠",
  ERGONOMIC: "⚙️",
  DUST: "💨",
  VIBRATION: "📳",
};

export default async function IhPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenantId = user.tenants[0].tenantId;

  const programs = await prisma.ihMonitoringProgram.findMany({
    where: { tenantId },
    include: {
      samples: {
        orderBy: { sampledAt: "desc" },
        take: 1,
      },
      _count: { select: { samples: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pelExceedances = programs.reduce((sum, p) => {
    const latest = p.samples[0];
    return sum + (latest?.exceedsPel ? 1 : 0);
  }, 0);
  const alExceedances = programs.reduce((sum, p) => {
    const latest = p.samples[0];
    return sum + (latest?.exceedsAl && !latest?.exceedsPel ? 1 : 0);
  }, 0);
  const totalSamples = programs.reduce((sum, p) => sum + p._count.samples, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industrial Hygiene</h1>
          <p className="text-muted-foreground">Exposure monitoring programs — track against OSHA PELs &amp; Action Levels</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/industrial-hygiene/new">+ New Program</Link>
        </Button>
      </div>

      {pelExceedances > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-900">
            <strong>{pelExceedances}</strong> program(s) have latest samples <strong>exceeding the PEL</strong> — immediate engineering controls required.
          </p>
        </div>
      )}
      {alExceedances > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-3">
          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
          <p className="text-sm text-orange-900">
            <strong>{alExceedances}</strong> program(s) exceed the Action Level — medical surveillance &amp; increased monitoring required.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Programs</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.filter((p) => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{programs.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Samples</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSamples}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">PEL Exceedances</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pelExceedances > 0 ? "text-red-600" : "text-green-600"}`}>
              {pelExceedances}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <FlaskConical className="h-10 w-10 opacity-30 mb-3" />
              <p className="text-sm">No monitoring programs created yet.</p>
              <p className="text-xs mt-1">Create programs for chemical, noise, and heat exposure tracking.</p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/dashboard/industrial-hygiene/new">Create First Program</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          programs.map((p) => {
            const latest = p.samples[0];
            const status = latest?.exceedsPel
              ? "pel"
              : latest?.exceedsAl
              ? "al"
              : latest
              ? "ok"
              : "no-data";

            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{HAZARD_ICONS[p.hazardType] ?? "⚗️"}</div>
                    <div>
                      <p className="font-semibold">{p.programName}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.agentName}
                        {p.oshaStandard && ` · ${p.oshaStandard}`}
                      </p>
                      {p.pel && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          PEL: {p.pel} {p.unit}
                          {p.al && ` · AL: ${p.al} ${p.unit}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{p._count.samples} sample{p._count.samples !== 1 ? "s" : ""}</p>
                      {latest && (
                        <p className="text-xs text-muted-foreground">
                          Latest: {latest.result} {p.unit} ({new Date(latest.sampledAt).toLocaleDateString("en-US")})
                        </p>
                      )}
                    </div>
                    {status === "pel" && <Badge className="bg-red-100 text-red-800 border-red-300">Exceeds PEL</Badge>}
                    {status === "al" && <Badge className="bg-orange-100 text-orange-800 border-orange-300">Exceeds AL</Badge>}
                    {status === "ok" && <Badge className="bg-green-100 text-green-800 border-green-300">Below AL</Badge>}
                    {status === "no-data" && <Badge variant="outline" className="text-muted-foreground">No Samples</Badge>}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/industrial-hygiene/${p.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📖 OSHA Exposure Limits Reference</h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm text-blue-800">
          <div><strong>Noise:</strong> PEL 90 dBA TWA · AL 85 dBA (29 CFR 1910.95)</div>
          <div><strong>Silica (resp.):</strong> PEL 50 µg/m³ TWA (29 CFR 1910.1053)</div>
          <div><strong>Lead:</strong> PEL 50 µg/m³ · AL 30 µg/m³ (29 CFR 1910.1025)</div>
          <div><strong>Benzene:</strong> PEL 1 ppm · AL 0.5 ppm (29 CFR 1910.1028)</div>
          <div><strong>CO:</strong> PEL 50 ppm · STEL 200 ppm (29 CFR 1910.1000)</div>
          <div><strong>Heat:</strong> NIOSH REL — WBGT 27–30°C varies by workload</div>
        </div>
      </div>
    </div>
  );
}

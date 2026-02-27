import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IhSampleForm } from "@/features/industrial-hygiene/components/ih-sample-form";

export default async function IhProgramDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) redirect("/dashboard");

  const program = await prisma.ihMonitoringProgram.findFirst({
    where: { id: params.id, tenantId: user.tenants[0].tenantId },
    include: {
      samples: { orderBy: { sampledAt: "desc" } },
    },
  });

  if (!program) notFound();

  const pelExceedances = program.samples.filter((s) => s.exceedsPel).length;
  const alExceedances = program.samples.filter((s) => s.exceedsAl && !s.exceedsPel).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard/industrial-hygiene" className="hover:underline">Industrial Hygiene</Link>
            <span>›</span>
            <span>{program.programName}</span>
          </div>
          <h1 className="text-2xl font-bold">{program.programName}</h1>
          <p className="text-muted-foreground">
            {program.agentName} · {program.hazardType.replace(/_/g, " ")}
            {program.oshaStandard && ` · ${program.oshaStandard}`}
          </p>
        </div>
        <Badge className={program.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-600"}>
          {program.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">PEL</p>
          <p className="text-xl font-bold">{program.pel ?? "N/A"} <span className="text-sm font-normal text-muted-foreground">{program.unit}</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Action Level</p>
          <p className="text-xl font-bold">{program.al ?? "N/A"} <span className="text-sm font-normal text-muted-foreground">{program.unit}</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">PEL Exceedances</p>
          <p className={`text-xl font-bold ${pelExceedances > 0 ? "text-red-600" : "text-green-600"}`}>{pelExceedances}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">AL Exceedances</p>
          <p className={`text-xl font-bold ${alExceedances > 0 ? "text-orange-600" : "text-green-600"}`}>{alExceedances}</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <IhSampleForm
            programId={program.id}
            pel={program.pel}
            al={program.al}
            unit={program.unit}
          />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Sample History ({program.samples.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {program.samples.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No samples recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Area</th>
                      <th className="p-3 text-left">Result</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {program.samples.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">{new Date(s.sampledAt).toLocaleDateString("en-US")}</td>
                        <td className="p-3">{s.workArea}</td>
                        <td className="p-3 font-medium">
                          {s.result} <span className="text-muted-foreground font-normal">{program.unit}</span>
                        </td>
                        <td className="p-3 text-muted-foreground capitalize">{s.sampleType}</td>
                        <td className="p-3">
                          {s.exceedsPel
                            ? <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Exceeds PEL</Badge>
                            : s.exceedsAl
                            ? <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">Exceeds AL</Badge>
                            : <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Acceptable</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

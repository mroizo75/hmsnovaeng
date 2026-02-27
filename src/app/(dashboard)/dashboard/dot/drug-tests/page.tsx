import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DotDrugTestForm } from "@/features/dot/components/dot-drug-test-form";

export default async function DotDrugTestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [tests, drivers] = await Promise.all([
    prisma.dotDrugTest.findMany({
      where: { tenantId },
      include: { driver: { select: { employeeName: true } } },
      orderBy: { testedAt: "desc" },
      take: 50,
    }),
    prisma.dotDriver.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, employeeName: true },
      orderBy: { employeeName: "asc" },
    }),
  ]);

  const resultColor = (r: string) => {
    if (r === "NEGATIVE") return "bg-green-100 text-green-800 border-green-300";
    if (r === "POSITIVE") return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drug &amp; Alcohol Testing</h1>
        <p className="text-muted-foreground">49 CFR 382 — Pre-employment, random, post-accident, and follow-up tests</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DotDrugTestForm tenantId={tenantId} drivers={drivers} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Test Records</CardTitle></CardHeader>
            <CardContent className="p-0">
              {tests.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No tests recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">Driver</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Result</th>
                      <th className="p-3 text-left">MRO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">{t.driver.employeeName}</td>
                        <td className="p-3 text-muted-foreground">{t.testType.replace(/_/g, " ")}</td>
                        <td className="p-3">{new Date(t.testedAt).toLocaleDateString("en-US")}</td>
                        <td className="p-3">
                          <Badge className={`${resultColor(t.result)} text-xs`}>{t.result}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{t.mroName ?? "—"}</td>
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

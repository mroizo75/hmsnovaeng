import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No access</div>;

  const tenantId = user.tenants[0].tenantId;

  const inspections = await prisma.dotVehicleInspection.findMany({
    where: { tenantId },
    orderBy: { inspectedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Inspections</h1>
          <p className="text-muted-foreground">49 CFR 396 — Pre/post-trip, annual, and roadside inspections</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/dot/inspections/new">+ Log Inspection</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {inspections.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">No inspections logged yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Unit</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Inspector</th>
                  <th className="p-3 text-left">Next Due</th>
                  <th className="p-3 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((i) => {
                  const overdue = i.nextDue && new Date(i.nextDue) < new Date();
                  return (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">Unit {i.vehicleUnit}</td>
                      <td className="p-3 text-muted-foreground">{i.inspType.replace(/_/g, " ")}</td>
                      <td className="p-3">{new Date(i.inspectedAt).toLocaleDateString("en-US")}</td>
                      <td className="p-3">{i.inspectedBy}</td>
                      <td className={`p-3 ${overdue ? "text-red-600 font-medium" : ""}`}>
                        {i.nextDue ? new Date(i.nextDue).toLocaleDateString("en-US") : "—"}
                      </td>
                      <td className="p-3">
                        {i.passed
                          ? <Badge className="bg-green-100 text-green-800 border-green-300">Passed</Badge>
                          : <Badge className="bg-red-100 text-red-800 border-red-300">Defects</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

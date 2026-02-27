import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DriversPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const today = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const drivers = await prisma.dotDriver.findMany({
    where: { tenantId },
    include: { _count: { select: { drugTests: true, violations: true } } },
    orderBy: [{ isActive: "desc" }, { employeeName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Qualification Files</h1>
          <p className="text-muted-foreground">49 CFR 391 — Driver records, CDL & medical certificate tracking</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/dot/drivers/new">+ Add Driver</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {drivers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No drivers registered yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Driver</th>
                  <th className="p-3 text-left">CDL</th>
                  <th className="p-3 text-left">CDL Expires</th>
                  <th className="p-3 text-left">Med Cert Expires</th>
                  <th className="p-3 text-left">Tests</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const cdlExpired = d.cdlExpires && new Date(d.cdlExpires) < today;
                  const cdlExpiring = d.cdlExpires && new Date(d.cdlExpires) <= in30 && !cdlExpired;
                  const medExpired = d.medicalCertExpires && new Date(d.medicalCertExpires) < today;
                  const medExpiring = d.medicalCertExpires && new Date(d.medicalCertExpires) <= in30 && !medExpired;
                  return (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{d.employeeName}</div>
                        {d.employeeId && <div className="text-xs text-muted-foreground">ID: {d.employeeId}</div>}
                      </td>
                      <td className="p-3">
                        {d.cdlNumber
                          ? <span>CDL-{d.cdlClass} {d.cdlState && `(${d.cdlState})`}</span>
                          : <span className="text-muted-foreground">N/A</span>}
                        {d.hazmatEndorsement && <Badge className="ml-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">HazMat</Badge>}
                      </td>
                      <td className="p-3">
                        {d.cdlExpires ? (
                          <span className={cdlExpired ? "text-red-600 font-medium" : cdlExpiring ? "text-orange-600 font-medium" : ""}>
                            {new Date(d.cdlExpires).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3">
                        {d.medicalCertExpires ? (
                          <span className={medExpired ? "text-red-600 font-medium" : medExpiring ? "text-orange-600 font-medium" : ""}>
                            {new Date(d.medicalCertExpires).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3">
                        <span className="text-muted-foreground">{d._count.drugTests} tests</span>
                        {d._count.violations > 0 && (
                          <Badge className="ml-2 bg-red-100 text-red-800 border-red-300 text-xs">{d._count.violations} violations</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {d.isActive
                          ? <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                          : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>}
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

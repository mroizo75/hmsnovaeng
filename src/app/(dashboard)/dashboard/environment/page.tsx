import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, AlertTriangle, TimerReset, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { EnvironmentReportButton } from "@/features/environment/components/environment-report-button";
import { EnvironmentAspectList } from "@/features/environment/components/environment-aspect-list";
import { CO2CalculatorCard } from "@/features/environment/components/co2-calculator-card";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function EnvironmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.tenants.length === 0) {
    return <div>No tenant access</div>;
  }

  const tenantId = user.tenants[0].tenantId;
  const tenant = user.tenants[0].tenant;

  const [aspects, nonCompliantCount, allMeasurements] = await Promise.all([
    prisma.environmentalAspect.findMany({
      where: { tenantId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        goal: { select: { id: true, title: true } },
        measurements: {
          orderBy: { measurementDate: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { significanceScore: "desc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.environmentalMeasurement.count({
      where: { tenantId, status: "NON_COMPLIANT" },
    }),
    prisma.environmentalMeasurement.findMany({
      where: {
        tenantId,
        measurementDate: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
      include: {
        aspect: {
          select: {
            category: true,
            title: true,
          },
        },
      },
      orderBy: { measurementDate: "desc" },
    }),
  ]);

  const total = aspects.length;
  const critical = aspects.filter((aspect) => aspect.significanceScore >= 20).length;
  const now = new Date();
  const overdueReviews = aspects.filter(
    (aspect) => aspect.nextReviewDate && new Date(aspect.nextReviewDate) < now
  ).length;
  const activeMonitoring = aspects.filter((aspect) => aspect.status !== "CLOSED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-muted-foreground">ISO 14001</p>
            <h1 className="text-3xl font-bold">Environmental Management</h1>
            <p className="text-muted-foreground">
              Overview of environmental aspects, measurements, and follow-up
            </p>
          </div>
          <PageHelpDialog content={helpContent.environment} />
        </div>
        <div className="flex gap-2">
          <EnvironmentReportButton />
          <Button asChild>
            <Link href="/dashboard/environment/new">New Environmental Aspect</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Aspects</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Total in environmental registry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{critical}</div>
            <p className="text-xs text-muted-foreground">Significance &ge; 20</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant Measurements</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{nonCompliantCount}</div>
            <p className="text-xs text-muted-foreground">Requires corrective actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
            <TimerReset className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overdueReviews}</div>
            <p className="text-xs text-muted-foreground">Missing updated assessment</p>
          </CardContent>
        </Card>
      </div>

      {/* CO2 Calculator */}
      <CO2CalculatorCard 
        measurements={allMeasurements} 
        companyName={tenant.name}
      />

      <EnvironmentAspectList aspects={aspects} />
    </div>
  );
}

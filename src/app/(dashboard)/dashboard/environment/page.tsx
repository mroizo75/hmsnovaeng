import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, AlertTriangle, TimerReset, Activity } from "lucide-react";
import Link from "next/link";
import { EnvironmentAspectList } from "@/features/environment/components/environment-aspect-list";

export default async function EnvironmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    return <div>Ingen tilgang til tenant</div>;
  }

  const tenantId = user.tenants[0].tenantId;

  const [aspects, nonCompliantCount] = await Promise.all([
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
        <div>
          <p className="text-sm text-muted-foreground">ISO 14001</p>
          <h1 className="text-3xl font-bold">Miljøstyring</h1>
          <p className="text-muted-foreground">
            Oversikt over miljøaspekter, målinger og oppfølging
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/environment/new">Nytt miljøaspekt</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrerte aspekter</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Totalt i miljoregisteret</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritiske</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{critical}</div>
            <p className="text-xs text-muted-foreground">Betydning &ge; 20</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Målinger i avvik</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{nonCompliantCount}</div>
            <p className="text-xs text-muted-foreground">Krever korrigerende tiltak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue revisjoner</CardTitle>
            <TimerReset className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overdueReviews}</div>
            <p className="text-xs text-muted-foreground">Mangler oppdatert vurdering</p>
          </CardContent>
        </Card>
      </div>

      <EnvironmentAspectList aspects={aspects} />
    </div>
  );
}


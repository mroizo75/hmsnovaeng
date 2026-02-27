import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentList } from "@/features/incidents/components/incident-list";
import { Plus, AlertCircle, Clock, CheckCircle, FileSearch } from "lucide-react";
import Link from "next/link";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    return <div>No tenant access</div>;
  }

  const tenantId = user.tenants[0].tenantId;

  const incidents = await prisma.incident.findMany({
    where: { tenantId },
    include: {
      measures: true,
      risk: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === "OPEN").length,
    investigating: incidents.filter(i => i.status === "INVESTIGATING").length,
    actionTaken: incidents.filter(i => i.status === "ACTION_TAKEN").length,
    closed: incidents.filter(i => i.status === "CLOSED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Incidents and Deviations</h1>
            <p className="text-muted-foreground">
              ISO 9001: Report and follow up on incidents systematically
            </p>
          </div>
          <PageHelpDialog content={helpContent.incidents} />
        </div>
        <Button asChild>
          <Link href="/dashboard/incidents/new">
            <Plus className="mr-2 h-4 w-4" />
            Report Incident
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Awaiting investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Being Handled</CardTitle>
            <FileSearch className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.investigating + stats.actionTaken}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.investigating} investigating, {stats.actionTaken} action taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">Closed incidents</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentList incidents={incidents} />
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 ISO 9001 - 10.2 Nonconformities and Corrective Actions</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">The organization shall:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>React to nonconformities (immediate actions)</li>
              <li>Assess the need for corrective actions</li>
              <li>Implement necessary actions</li>
              <li>Review the effectiveness of actions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Documentation:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Nature of nonconformity and subsequent actions</li>
              <li>Results of corrective actions</li>
              <li>Root cause analysis</li>
              <li>Learning points for improvement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

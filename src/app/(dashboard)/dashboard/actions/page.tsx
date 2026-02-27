import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeasureForm } from "@/features/measures/components/measure-form";
import { MeasureList } from "@/features/measures/components/measure-list";
import { ListTodo, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function ActionsPage() {
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

  const measures = await prisma.measure.findMany({
    where: { tenantId },
    include: {
      risk: { select: { id: true, title: true } },
    },
    orderBy: [
      { status: "asc" },
      { dueAt: "asc" },
    ],
  });

  const tenantUsers = await prisma.user.findMany({
    where: {
      tenants: {
        some: { tenantId },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const now = new Date();
  const stats = {
    total: measures.length,
    pending: measures.filter((m: any) => m.status === "PENDING").length,
    inProgress: measures.filter((m: any) => m.status === "IN_PROGRESS").length,
    done: measures.filter((m: any) => m.status === "DONE").length,
    overdue: measures.filter((m: any) => m.status !== "DONE" && new Date(m.dueAt) < now).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Actions</h1>
            <p className="text-muted-foreground">
              ISO 9001: Planned actions with responsible parties and timelines
            </p>
          </div>
          <PageHelpDialog content={helpContent.actions} />
        </div>
        <MeasureForm tenantId={tenantId} users={tenantUsers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pending + stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} not started, {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Completed actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <MeasureList measures={measures} />
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 ISO 9001 Requirements for Actions</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Planning:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>All risks must have planned actions</li>
              <li>Actions must have a clear description</li>
              <li>Responsible person must be defined</li>
              <li>Timeline/deadline must be realistic</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Follow-up:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Actions must be followed up regularly</li>
              <li>Status must be updated continuously</li>
              <li>Actions must be evaluated when completed</li>
              <li>Documentation must be retained</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

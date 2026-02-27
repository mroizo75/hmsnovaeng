import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getIncidentStatusColor, getIncidentStatusLabel } from "@/features/incidents/schemas/incident.schema";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ComplaintsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    redirect("/login");
  }

  const tenantId = user.tenants[0].tenantId;

  const complaints = await prisma.incident.findMany({
    where: { tenantId, type: "CUSTOMER" },
    include: {
      measures: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  const openComplaints = complaints.filter((incident) => incident.status !== "CLOSED");
  const overdue = complaints.filter(
    (incident) =>
      incident.responseDeadline &&
      incident.status !== "CLOSED" &&
      incident.responseDeadline < new Date(),
  );
  const satisfactionValues = complaints
    .map((incident) => incident.customerSatisfaction)
    .filter((value): value is number => typeof value === "number");
  const avgSatisfaction =
    satisfactionValues.length > 0
      ? (satisfactionValues.reduce((sum, current) => sum + current, 0) / satisfactionValues.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Customer Complaints</h1>
            <p className="text-muted-foreground">
              ISO 10002: Collect, assess, and close customer feedback in a structured manner
            </p>
          </div>
          <PageHelpDialog content={helpContent.complaints} />
        </div>
        <Button asChild>
          <Link href="/dashboard/incidents/new?type=CUSTOMER">Register Complaint</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Open Complaints</CardTitle>
            <CardDescription>Requiring follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{openComplaints.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Satisfaction</CardTitle>
            <CardDescription>Reported by customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{avgSatisfaction ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
            <CardDescription>Requires quick response</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total last 12 months</CardTitle>
            <CardDescription>All registered complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{complaints.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Customer Complaints</CardTitle>
          <CardDescription>Sort by status and response deadline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {complaints.length === 0 && (
            <p className="text-sm text-muted-foreground">No customer complaints registered.</p>
          )}
          {complaints.map((complaint) => {
            const statusColor = getIncidentStatusColor(complaint.status);
            const statusLabel = getIncidentStatusLabel(complaint.status);
            return (
              <div key={complaint.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{complaint.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                    <p className="text-xs text-purple-800 mt-2">
                      Customer: {complaint.customerName || "Unknown"}{" "}
                      {complaint.customerEmail && `• ${complaint.customerEmail}`}
                      {complaint.customerPhone && ` • ${complaint.customerPhone}`}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={statusColor}>{statusLabel}</Badge>
                    {complaint.customerSatisfaction && (
                      <p className="text-xs text-muted-foreground">
                        Satisfaction: {complaint.customerSatisfaction}/5
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Registered {formatDate(complaint.occurredAt)}</span>
                  <span>Due {formatDate(complaint.responseDeadline)}</span>
                  {complaint.customerTicketId && <span>Case: {complaint.customerTicketId}</span>}
                  <span>
                    Actions: {complaint.measures.filter((measure) => measure.status === "DONE").length}/
                    {complaint.measures.length}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/incidents/${complaint.id}`}>Open case</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

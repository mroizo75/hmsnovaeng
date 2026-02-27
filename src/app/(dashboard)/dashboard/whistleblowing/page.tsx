import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getPermissions } from "@/lib/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Shield, AlertCircle, MessageSquare, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhistleblowStatus, WhistleblowCategory, WhistleblowSeverity } from "@prisma/client";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

async function getWhistleblowings(tenantId: string) {
  return await db.whistleblowing.findMany({
    where: { tenantId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { receivedAt: "desc" },
  });
}

function getStatusBadge(status: WhistleblowStatus) {
  switch (status) {
    case "RECEIVED":
      return <Badge variant="secondary">Received</Badge>;
    case "ACKNOWLEDGED":
      return <Badge className="bg-blue-500 hover:bg-blue-500">Acknowledged</Badge>;
    case "UNDER_INVESTIGATION":
      return <Badge className="bg-purple-500 hover:bg-purple-500">Under Investigation</Badge>;
    case "ACTION_TAKEN":
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Action Taken</Badge>;
    case "RESOLVED":
      return <Badge className="bg-green-600 hover:bg-green-600">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="outline">Closed</Badge>;
    case "DISMISSED":
      return <Badge variant="destructive">Dismissed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getSeverityBadge(severity: WhistleblowSeverity) {
  switch (severity) {
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    case "MEDIUM":
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Medium</Badge>;
    case "HIGH":
      return <Badge className="bg-orange-500 hover:bg-orange-500">High</Badge>;
    case "CRITICAL":
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
}

function getCategoryLabel(category: WhistleblowCategory) {
  switch (category) {
    case "HARASSMENT":
      return "Harassment";
    case "DISCRIMINATION":
      return "Discrimination";
    case "WORK_ENVIRONMENT":
      return "Work Environment";
    case "SAFETY":
      return "EHS/Safety";
    case "CORRUPTION":
      return "Corruption";
    case "ETHICS":
      return "Ethics";
    case "LEGAL":
      return "Legal Violation";
    case "OTHER":
      return "Other";
    default:
      return category;
  }
}

export default async function WhistleblowingListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !session.user.tenantId) {
    return notFound();
  }

  const permissions = getPermissions(session.user.role);

  if (!permissions.canViewWhistleblowing) {
    redirect("/dashboard");
  }

  const cases = await getWhistleblowings(session.user.tenantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Whistleblowing</h1>
            <p className="text-muted-foreground">
              Case management for received reports
            </p>
          </div>
          <PageHelpDialog content={helpContent.whistleblowing} />
        </div>
        <Button asChild variant="outline">
          <Link href="/varsling">
          <Shield className="mr-2 h-4 w-4" />
          Public Reporting Page
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter((c) => c.status === "RECEIVED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                cases.filter(
                  (c) =>
                    c.status === "ACKNOWLEDGED" ||
                    c.status === "UNDER_INVESTIGATION" ||
                    c.status === "ACTION_TAKEN"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No reports</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            No reports have been received yet.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.caseNumber}</TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(c.category)}</Badge>
                  </TableCell>
                  <TableCell>{getSeverityBadge(c.severity)}</TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(c.receivedAt), "MMM d, yyyy", { locale: enUS })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/whistleblowing/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Process
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


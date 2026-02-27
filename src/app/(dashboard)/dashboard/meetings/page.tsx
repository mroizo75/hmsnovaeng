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
import { PlusCircle, Calendar, Users, FileText, Video } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MeetingStatus, MeetingType } from "@prisma/client";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

async function getMeetings(tenantId: string) {
  return await db.meeting.findMany({
    where: { tenantId },
    include: {
      participants: true,
      decisions: true,
    },
    orderBy: { scheduledDate: "desc" },
  });
}

function getStatusBadge(status: MeetingStatus) {
  switch (status) {
    case "PLANNED":
      return <Badge variant="secondary">Planned</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-blue-500 hover:bg-blue-500">In Progress</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getTypeBadge(type: MeetingType) {
  switch (type) {
    case "AMU":
      return <Badge variant="outline">EHS Committee</Badge>;
    case "VO":
      return <Badge variant="outline">Safety Rep</Badge>;
    case "BHT":
      return <Badge variant="outline">Occupational Health</Badge>;
    case "HMS_COMMITTEE":
      return <Badge variant="outline">EHS Committee</Badge>;
    case "OTHER":
      return <Badge variant="outline">Other</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !session.user.tenantId) {
    return notFound();
  }

  const permissions = getPermissions(session.user.role);

  if (!permissions.canReadMeetings) {
    redirect("/dashboard");
  }

  const meetings = await getMeetings(session.user.tenantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings (EHS/Safety)</h1>
            <p className="text-muted-foreground">
              EHS committees, safety representative meetings, and occupational health
            </p>
          </div>
          <PageHelpDialog content={helpContent.meetings} />
        </div>
        {permissions.canCreateMeetings && (
          <Link href="/dashboard/meetings/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter((m) => m.status === "PLANNED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter((m) => m.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisions</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.reduce((sum, m) => sum + m.decisions.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No meetings</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first meeting to get started.
          </p>
          {permissions.canCreateMeetings && (
            <Button asChild>
              <Link href="/dashboard/meetings/new">Create Meeting</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Decisions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{getTypeBadge(meeting.type)}</TableCell>
                  <TableCell>
                    {format(new Date(meeting.scheduledDate), "MMM d, yyyy HH:mm", { locale: enUS })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{meeting.participants.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{meeting.decisions.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/meetings/${meeting.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
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


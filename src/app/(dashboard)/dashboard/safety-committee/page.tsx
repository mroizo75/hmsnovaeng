import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, Users, FileText, AlertCircle } from "lucide-react";

export default async function SafetyCommitteePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const meetings = await prisma.meeting.findMany({
    where: { tenantId },
    orderBy: { scheduledDate: "desc" },
    take: 20,
  });

  const meetingsThisYear = meetings.filter((m) => new Date(m.scheduledDate) >= yearStart).length;
  const lastMeeting = meetings[0];
  const daysSinceLast = lastMeeting
    ? Math.floor((Date.now() - new Date(lastMeeting.scheduledDate).getTime()) / 86400000)
    : null;

  const overdue = daysSinceLast !== null && daysSinceLast > 90;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Committee</h1>
          <p className="text-muted-foreground">Meeting minutes, action items &amp; attendance records</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/safety-committee/new">
            <Plus className="mr-2 h-4 w-4" /> New Meeting
          </Link>
        </Button>
      </div>

      {overdue && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Safety Committee Meeting Overdue</p>
            <p className="text-sm text-amber-800">
              Last meeting was {daysSinceLast} days ago. OSHA and ISO 45001 recommend meeting at least quarterly.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meetings This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingsThisYear}</div>
            <p className="text-xs text-muted-foreground">
              {meetingsThisYear >= 4 ? "✓ Quarterly target met" : `${4 - meetingsThisYear} more to meet quarterly target`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            {lastMeeting ? (
              <>
                <div className="text-lg font-bold">{daysSinceLast}d ago</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastMeeting.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No meetings yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Meeting Minutes</CardTitle></CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-3">
              <Users className="h-10 w-10 mx-auto opacity-30" />
              <p>No safety committee meetings recorded yet.</p>
              <p className="text-xs">Document committee meetings to demonstrate management commitment to safety (ISO 45001, ANSI Z10).</p>
              <Button asChild>
                <Link href="/dashboard/safety-committee/new">Schedule First Meeting</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between border rounded p-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{meeting.title}</span>
                      {meeting.status === "COMPLETED" && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Minutes Filed</Badge>
                      )}
                      {meeting.status === "PLANNED" && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">Scheduled</Badge>
                      )}
                      {meeting.status === "IN_PROGRESS" && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(meeting.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/meetings/${meeting.id}`}>
                      <FileText className="mr-1 h-3 w-3" /> View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Safety Committee — Best Practice</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Meet at least <strong>quarterly</strong> (monthly recommended)</li>
            <li>Include both management and frontline employees</li>
            <li>Review incident reports and near misses</li>
            <li>Track open action items to closure</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Document attendance and minutes</li>
            <li>Review OSHA recordkeeping (300 Log)</li>
            <li>Discuss upcoming inspections and audits</li>
            <li>Required in some states (CA, WA, OR, MN)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

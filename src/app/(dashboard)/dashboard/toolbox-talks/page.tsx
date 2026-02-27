import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, BookOpen, Users, TrendingUp, CalendarDays } from "lucide-react";

export default async function ToolboxTalksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [talks, totalAttendance, tenantUsers] = await Promise.all([
    prisma.toolboxTalk.findMany({
      where: { tenantId },
      include: {
        _count: { select: { attendances: true } },
      },
      orderBy: { conductedAt: "desc" },
      take: 50,
    }),
    prisma.toolboxAttendance.count({
      where: { talk: { tenantId, conductedAt: { gte: yearStart } } },
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  const talksThisYear = talks.filter((t) => new Date(t.conductedAt) >= yearStart).length;
  const talksByMonth = talks
    .filter((t) => new Date(t.conductedAt) >= yearStart)
    .reduce<Record<string, number>>((acc, t) => {
      const m = new Date(t.conductedAt).toLocaleString("en-US", { month: "short" });
      acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Toolbox Talks</h1>
          <p className="text-muted-foreground">Daily / weekly safety briefings with attendance records</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/toolbox-talks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Toolbox Talk
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Talks This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talksThisYear}</div>
            <p className="text-xs text-muted-foreground">Avg {(talksThisYear / Math.max(new Date().getMonth() + 1, 1)).toFixed(1)}/month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendees YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance}</div>
            <p className="text-xs text-muted-foreground">Total attendance records signed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Talks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talks.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toolbox Talks</CardTitle>
        </CardHeader>
        <CardContent>
          {talks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-3">
              <BookOpen className="h-10 w-10 mx-auto opacity-30" />
              <p>No toolbox talks recorded yet.</p>
              <Button asChild>
                <Link href="/dashboard/toolbox-talks/new">Record First Toolbox Talk</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {talks.map((talk) => (
                <div key={talk.id} className="flex items-center justify-between border rounded p-3 hover:bg-muted/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{talk.topic}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(talk.conductedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      {" · "}{userMap[talk.conductedBy] ?? talk.conductedBy}
                      {" · "}<span className="font-medium">{talk._count.attendances} attendees</span>
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/toolbox-talks/${talk.id}`}>View →</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

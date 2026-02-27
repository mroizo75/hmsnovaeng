import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Clock, Download } from "lucide-react";
import { AttendanceSignForm } from "@/features/toolbox-talks/components/attendance-sign-form";

export default async function ToolboxTalkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const [talk, tenantUsers] = await Promise.all([
    prisma.toolboxTalk.findFirst({
      where: { id, tenantId },
      include: {
        attendances: { orderBy: { signedAt: "asc" } },
      },
    }),
    prisma.userTenant.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const userMap = Object.fromEntries(
    tenantUsers.map((t) => [t.userId, t.user.name ?? t.user.email ?? t.userId])
  );

  if (!talk) redirect("/dashboard/toolbox-talks");

  const signed = talk.attendances.filter((a) => a.signedAt);
  const unsigned = talk.attendances.filter((a) => !a.signedAt);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/toolbox-talks" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" />
          Toolbox Talks
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{talk.topic}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(talk.conductedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" · Conducted by "}{userMap[talk.conductedBy] ?? talk.conductedBy}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/toolbox-talks/pdf?id=${talk.id}`}>
              <Download className="mr-1 h-3 w-3" />
              Download PDF
            </Link>
          </Button>
        </div>
      </div>

      {talk.content && (
        <Card>
          <CardHeader><CardTitle>Talk Content</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{talk.content}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Attendees</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{talk.attendances.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Signed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{signed.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unsigned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{unsigned.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance Record</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <AttendanceSignForm talkId={talk.id} />
          {talk.attendances.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No attendees added yet.</p>
          ) : (
            <div className="space-y-2 mt-4">
              {talk.attendances.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="text-sm font-medium">{a.guestName ?? a.userId ?? "Unknown"}</p>
                  {a.signedAt ? (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Signed {new Date(a.signedAt).toLocaleDateString("en-US")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                      <Clock className="h-3 w-3" />
                      Not signed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

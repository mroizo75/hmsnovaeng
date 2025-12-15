import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function BcmPage() {
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

  const [bcmDocuments, auditsRaw] = await Promise.all([
    prisma.document.findMany({
      where: {
        tenantId,
        template: {
          category: "BCM",
        },
      },
      select: {
        id: true,
        title: true,
        version: true,
        status: true,
        updatedAt: true,
        nextReviewDate: true,
        template: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.audit.findMany({
      where: {
        tenantId,
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        status: true,
        leadAuditorId: true,
        area: true,
      },
      orderBy: { scheduledDate: "asc" },
    }),
  ]);

  const continuityAudits = auditsRaw.filter((audit) => {
    const areaValue = audit.area?.toLowerCase() ?? "";
    const titleValue = audit.title.toLowerCase();
    return (
      areaValue.includes("kontinuitet") ||
      titleValue.includes("bcm") ||
      titleValue.includes("kontinuitet")
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beredskap og kontinuitet</h1>
          <p className="text-muted-foreground">
            ISO 22301: Følg opp BCM-planer, krisehåndbok og øvelser
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/documents">Åpne dokumenter</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/audits/new">Planlegg øvelse</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>BCM-planer og dokumenter</CardTitle>
            <CardDescription>Planer, krisehåndbøker og gjenopprettingsstrategier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bcmDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground">Ingen BCM-dokumenter registrert enda.</p>
            )}
            {bcmDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.template?.name || "Plan"} · Revidert {formatDate(doc.updatedAt)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline">{doc.status}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Neste gjennomgang: {formatDate(doc.nextReviewDate)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontinuitetsøvelser og tester</CardTitle>
            <CardDescription>Planlagte og fullførte øvelser med fokus på gjenoppretting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {continuityAudits.length === 0 && (
              <p className="text-sm text-muted-foreground">Ingen øvelser planlagt.</p>
            )}
            {continuityAudits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{audit.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {audit.area || "Kontinuitet"} · {formatDate(audit.scheduledDate)}
                  </p>
                </div>
                <Badge variant="outline">{audit.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


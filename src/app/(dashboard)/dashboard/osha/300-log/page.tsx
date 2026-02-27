import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, AlertCircle, Download } from "lucide-react";
import { OshaLog300Table } from "@/features/osha-recordkeeping/components/osha-log-300-table";
import { Osha300AForm } from "@/features/osha-recordkeeping/components/osha-300a-form";

export default async function Osha300LogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;
  const year = new Date().getFullYear();

  const [incidents, log, tenant] = await Promise.all([
    prisma.incident.findMany({
      where: { tenantId, oshaRecordable: true, osha300LogYear: year },
      orderBy: { occurredAt: "asc" },
      select: {
        id: true,
        avviksnummer: true,
        title: true,
        occurredAt: true,
        reportedBy: true,
        location: true,
        oshaClassification: true,
        eventType: true,
        illnessType: true,
        daysAwayFromWork: true,
        daysOnRestriction: true,
        daysOnTransfer: true,
        bodyPartAffected: true,
        natureOfInjury: true,
        privacyCaseFlag: true,
        osha301CompletedAt: true,
      },
    }),
    prisma.oshaLog.findUnique({ where: { tenantId_year: { tenantId, year } } }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, totalHoursWorkedYtd: true, avgEmployeeCount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OSHA 300 Log — {year}</h1>
          <p className="text-muted-foreground">Log of Work-Related Injuries and Illnesses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/api/osha/pdf?form=300&year=${year}`}>
              <Download className="mr-2 h-4 w-4" />
              Form 300 PDF
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/api/osha/pdf?form=300A&year=${year}`}>
              <Download className="mr-2 h-4 w-4" />
              Form 300A PDF
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/incidents/new">+ Report Incident</Link>
          </Button>
        </div>
      </div>

      {/* 300 Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form 300 — Recordable Cases ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <OshaLog300Table incidents={incidents} />
        </CardContent>
      </Card>

      {/* 300A Summary */}
      <Osha300AForm
        tenantId={tenantId}
        tenantName={tenant?.name ?? ""}
        year={year}
        log={log}
        totalHoursDefault={tenant?.totalHoursWorkedYtd ?? 0}
        avgEmployeeDefault={tenant?.avgEmployeeCount ?? 0}
        incidents={incidents}
      />
    </div>
  );
}

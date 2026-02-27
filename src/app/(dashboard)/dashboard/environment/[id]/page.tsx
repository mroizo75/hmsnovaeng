import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnvironmentMeasurementForm } from "@/features/environment/components/environment-measurement-form";
import { EnvironmentMeasurementList } from "@/features/environment/components/environment-measurement-list";
import { EnvironmentAspectForm } from "@/features/environment/components/environment-aspect-form";

const getSignificanceMeta = (score: number) => {
  if (score >= 20) return { label: "Critical", className: "bg-red-100 text-red-900 border-red-300" };
  if (score >= 12) return { label: "High", className: "bg-orange-100 text-orange-900 border-orange-300" };
  if (score >= 6) return { label: "Moderate", className: "bg-yellow-100 text-yellow-900 border-yellow-300" };
  return { label: "Low", className: "bg-green-100 text-green-900 border-green-300" };
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  MONITORED: "Monitored",
  CLOSED: "Closed",
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default async function EnvironmentAspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const aspect = await prisma.environmentalAspect.findUnique({
    where: { id, tenantId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      goal: { select: { id: true, title: true } },
      measurements: {
        orderBy: { measurementDate: "desc" },
        include: {
          responsible: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!aspect) {
    return <div>Environmental aspect not found</div>;
  }

  const [users, goals] = await Promise.all([
    prisma.user.findMany({
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
      orderBy: { name: "asc" },
    }),
    prisma.goal.findMany({
      where: { tenantId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const significanceMeta = getSignificanceMeta(aspect.significanceScore);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/environment">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">ISO 14001</p>
            <h1 className="text-3xl font-bold">{aspect.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{aspect.category}</Badge>
              <Badge variant="outline" className={significanceMeta.className}>
                Significance: {aspect.significanceScore} · {significanceMeta.label}
              </Badge>
              <Badge variant="outline">{statusLabels[aspect.status] ?? aspect.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Overview of context and responsibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Process</p>
              <p className="font-medium">{aspect.process || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{aspect.location || "Not set"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Responsible</p>
              <p className="font-medium">
                {aspect.owner?.name || aspect.owner?.email || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Linked Goal</p>
              <p className="font-medium">{aspect.goal?.title || "None"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Next Review</p>
              <p className="font-medium">{formatDateTime(aspect.nextReviewDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Measurement Date</p>
              <p className="font-medium">{formatDateTime(aspect.lastMeasurementDate)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Legal Requirement</p>
              <p className="text-sm">
                {aspect.legalRequirement || "Not documented"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Control Measures</p>
              <p className="text-sm">
                {aspect.controlMeasures || "Not documented"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Monitoring Method</p>
            <p className="text-sm">{aspect.monitoringMethod || "Not defined"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurements</CardTitle>
          <CardDescription>Register environmental data and track status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EnvironmentMeasurementForm aspectId={aspect.id} users={users} />
          <EnvironmentMeasurementList measurements={aspect.measurements} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Environmental Aspect</CardTitle>
          <CardDescription>Update classification and responsibility</CardDescription>
        </CardHeader>
        <CardContent>
          <EnvironmentAspectForm
            tenantId={tenantId}
            users={users}
            goals={goals}
            aspect={aspect}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Download,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { InspectionFindingForm } from "@/features/inspections/components/inspection-finding-form";
import { InspectionFindingList } from "@/features/inspections/components/inspection-finding-list";
import { UpdateInspectionStatusForm } from "@/features/inspections/components/update-inspection-status-form";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  const variants: Record<
    string,
    { className: string; label: string }
  > = {
    PLANNED: { className: "bg-blue-100 text-blue-800", label: "Planned" },
    IN_PROGRESS: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
    COMPLETED: { className: "bg-green-100 text-green-800", label: "Completed" },
    CANCELLED: { className: "bg-red-100 text-red-800", label: "Cancelled" },
  };
  const config = variants[status] || variants.PLANNED;
  return <Badge className={config.className}>{config.label}</Badge>;
}

function getTypeBadge(type: string) {
  const labels: Record<string, string> = {
    VERNERUNDE: "Safety Inspection",
    HMS_INSPEKSJON: "H&S Inspection",
    BRANNØVELSE: "Fire Drill",
    SHA_PLAN: "SHA Plan",
    SIKKERHETSVANDRING: "Safety Walk",
    ANDRE: "Other",
  };
  return <Badge variant="outline">{labels[type] || type}</Badge>;
}

function getSeverityBadge(severity: number) {
  const config: Record<number, { className: string; label: string }> = {
    1: { className: "bg-blue-100 text-blue-800", label: "Low" },
    2: { className: "bg-green-100 text-green-800", label: "Moderate" },
    3: { className: "bg-yellow-100 text-yellow-800", label: "Significant" },
    4: { className: "bg-orange-100 text-orange-800", label: "High" },
    5: { className: "bg-red-100 text-red-800", label: "Critical" },
  };
  const severityConfig = config[severity] || config[1];
  return <Badge className={severityConfig.className}>{severityConfig.label}</Badge>;
}

function getFindingStatusBadge(status: string) {
  const config: Record<string, { className: string; label: string }> = {
    OPEN: { className: "bg-red-100 text-red-800", label: "Open" },
    IN_PROGRESS: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
    RESOLVED: { className: "bg-green-100 text-green-800", label: "Resolved" },
    CLOSED: { className: "bg-gray-100 text-gray-800", label: "Closed" },
  };
  return <Badge className={config[status]?.className || config.OPEN.className}>
    {config[status]?.label || status}
  </Badge>;
}

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!currentUser || currentUser.tenants.length === 0) {
    return <div>No tenant access</div>;
  }

  const tenantId = currentUser.tenants[0].tenantId;

  const inspection = await prisma.inspection.findUnique({
    where: { id, tenantId },
    include: {
      findings: {
        orderBy: { createdAt: "desc" },
      },
      formTemplate: {
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      },
      formSubmission: {
        include: {
          fieldValues: true,
        },
      },
    },
  });

  if (!inspection) {
    return <div>Inspection not found</div>;
  }

  const conductedByUser = await prisma.user.findUnique({
    where: { id: inspection.conductedBy },
    select: { id: true, name: true, email: true },
  });

  const participantIds = inspection.participants ? JSON.parse(inspection.participants) : [];
  const participants = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, name: true, email: true },
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

  const findingStats = {
    total: inspection.findings.length,
    open: inspection.findings.filter((f) => f.status === "OPEN").length,
    inProgress: inspection.findings.filter((f) => f.status === "IN_PROGRESS").length,
    resolved: inspection.findings.filter((f) => f.status === "RESOLVED").length,
    closed: inspection.findings.filter((f) => f.status === "CLOSED").length,
    critical: inspection.findings.filter((f) => f.severity === 5).length,
    high: inspection.findings.filter((f) => f.severity === 4).length,
    medium: inspection.findings.filter((f) => f.severity === 3).length,
    low: inspection.findings.filter((f) => f.severity <= 2).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/inspections">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inspections
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{inspection.title}</h1>
            <p className="text-muted-foreground">Inspection details</p>
          </div>
          <div className="flex items-center gap-2">
            {getTypeBadge(inspection.type)}
            {getStatusBadge(inspection.status)}
            <UpdateInspectionStatusForm inspectionId={inspection.id} currentStatus={inspection.status} />
            <Link href={`/dashboard/inspections/${inspection.id}/mobil`}>
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <Smartphone className="mr-2 h-4 w-4" />
                Mobile View
              </Button>
            </Link>
            <Link href={`/dashboard/inspections/${inspection.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href={`/api/inspections/${inspection.id}/report`} target="_blank">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form if available */}
      {inspection.formTemplate && (
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="flex-1">
                <CardTitle>{inspection.formTemplate.title}</CardTitle>
                {inspection.formTemplate.description && (
                  <p className="text-sm text-muted-foreground mt-1">{inspection.formTemplate.description}</p>
                )}
              </div>
              {inspection.formSubmission && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {inspection.formSubmission ? (
              <div className="flex gap-3">
                <Link href={`/dashboard/forms/${inspection.formTemplate.id}/fill?inspectionId=${id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Completed Form
                  </Button>
                </Link>
                <Link href={`/api/forms/${inspection.formSubmissionId}/pdf`} target="_blank">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Form must be filled out to complete the inspection</span>
                </div>
                <Link href={`/dashboard/forms/${inspection.formTemplate.id}/fill?inspectionId=${id}`}>
                  <Button className="w-full">
                    Fill Out Form Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {format(new Date(inspection.scheduledDate), "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {inspection.completedDate && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="font-medium">
                    {format(new Date(inspection.completedDate), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            {inspection.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="font-medium">{inspection.location}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle>Conducted by</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Responsible</p>
                <p className="font-medium">{conductedByUser?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{conductedByUser?.email}</p>
              </div>
            </div>

            {participants.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Participants</p>
                  {participants.map((participant) => (
                    <div key={participant.id} className="mt-1">
                      <p className="font-medium">{participant.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {inspection.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{inspection.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Finding Statistics */}
      {findingStats.total > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Inspection Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-orange-900">Critical</p>
                <p className="text-3xl font-bold text-red-600">{findingStats.critical}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">High</p>
                <p className="text-3xl font-bold text-orange-600">{findingStats.high}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Moderate</p>
                <p className="text-3xl font-bold text-yellow-600">{findingStats.medium}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Low</p>
                <p className="text-3xl font-bold text-green-600">{findingStats.low}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="grid gap-4 md:grid-cols-4 text-sm">
                <div>
                  <p className="text-orange-900 font-medium">Open</p>
                  <p className="text-2xl font-bold">{findingStats.open}</p>
                </div>
                <div>
                  <p className="text-orange-900 font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{findingStats.inProgress}</p>
                </div>
                <div>
                  <p className="text-orange-900 font-medium">Resolved</p>
                  <p className="text-2xl font-bold">{findingStats.resolved}</p>
                </div>
                <div>
                  <p className="text-orange-900 font-medium">Closed</p>
                  <p className="text-2xl font-bold">{findingStats.closed}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Findings and Observations</CardTitle>
              <CardDescription>
                {findingStats.total > 0
                  ? `${findingStats.total} findings registered`
                  : "Document deviations, observations, or areas for improvement"}
              </CardDescription>
            </div>
            <InspectionFindingForm inspectionId={inspection.id} users={tenantUsers} />
          </div>
        </CardHeader>
        <CardContent>
          {inspection.findings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No findings registered yet</p>
              <p className="text-sm mt-1">Use the button above to add findings</p>
            </div>
          ) : (
            <InspectionFindingList findings={inspection.findings} />
          )}
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 H&S Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Inspection planned and documented</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Responsible person appointed</span>
          </div>
          <div className="flex items-center gap-2">
            {inspection.completedDate ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span>
              Inspection {inspection.completedDate ? "completed" : "not yet completed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {findingStats.total > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span>
              {findingStats.total > 0
                ? `${findingStats.total} findings documented`
                : "No findings documented"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {findingStats.open === 0 && findingStats.total > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : findingStats.open > 0 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            )}
            <span>
              {findingStats.open > 0
                ? `${findingStats.open} open findings (require follow-up)`
                : findingStats.total > 0
                ? "All findings are closed"
                : "No findings"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

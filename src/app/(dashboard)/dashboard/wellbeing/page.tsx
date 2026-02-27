import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Eye,
  Heart,
  BarChart3,
  MessageSquare,
  Copy
} from "lucide-react";
import Link from "next/link";
import { CopyFormButton } from "@/components/forms/copy-form-button";
import { WellbeingReport } from "@/components/wellbeing/wellbeing-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function WellbeingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const userRole = session.user.role;
  const tenantId = session.user.tenantId;

  // Hent alle WELLBEING-skjemaer (globale + tenant-spesifikke)
  const wellbeingForms = await prisma.formTemplate.findMany({
    where: {
      OR: [
        { tenantId, category: "WELLBEING" },
        { isGlobal: true, category: "WELLBEING" },
      ],
      isActive: true,
    },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          submissions: {
            where: {
              tenantId, // VIKTIG: Kun tenant-spesifikke submissions
            },
          },
        },
      },
      submissions: {
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Hent alle submissions for statistikk
  const allSubmissions = await prisma.formSubmission.findMany({
    where: {
      tenantId,
      formTemplate: {
        category: "WELLBEING",
      },
    },
    include: {
      fieldValues: {
        include: {
          field: true,
        },
      },
      formTemplate: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Hent risikoer generert fra psykososiale skjemaer
  const wellbeingRisks = await prisma.risk.findMany({
    where: {
      tenantId,
      category: "HEALTH",
      title: {
        contains: "psykososial",
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Beregn statistikk
  const totalSubmissions = allSubmissions.length;
  const submissionsThisMonth = allSubmissions.filter((s) => {
    const date = new Date(s.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // Beregn gjennomsnittlig score for Likert-felt
  const likertValues = allSubmissions.flatMap((s) =>
    s.fieldValues
      .filter((fv) => fv.field.fieldType === "LIKERT_SCALE")
      .map((fv) => parseInt(fv.value || "0"))
      .filter((v) => v > 0)
  );

  const averageScore = likertValues.length > 0
    ? (likertValues.reduce((sum, val) => sum + val, 0) / likertValues.length).toFixed(1)
    : null;

  // Tell kritiske hendelser (fra RADIO-felt med "Ofte")
  const criticalIncidents = allSubmissions.filter((s) =>
    s.fieldValues.some(
      (fv) =>
        fv.field.fieldType === "RADIO" &&
        fv.value === "Ofte"
    )
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Psychosocial Work Environment</h1>
          <p className="text-muted-foreground mt-1">
            Mapping and follow-up of psychosocial work environment in accordance with OSHA requirements
          </p>
        </div>
        <PageHelpDialog content={helpContent.wellbeing} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <Heart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="report">
            <BarChart3 className="h-4 w-4 mr-2" />
            Annual Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Info box */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-blue-700 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>About psychosocial mapping:</strong> Employers are required to assess the psychosocial work environment annually (OSHA 29 CFR 1904). The forms below are developed in accordance with ISO 45003 and OSHA guidelines.
              </p>
              {(userRole === "ADMIN" || userRole === "LEDER") && (
                <p className="text-sm text-blue-900 mt-2">
                  💡 <strong>Management:</strong> You can send forms to employees and follow up on the results here.
                  All responses are treated confidentially.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total responses
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">All assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average score
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageScore || "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {averageScore ? (parseFloat(averageScore) >= 3.5 ? "Good score" : parseFloat(averageScore) >= 2.5 ? "Moderate" : "Low score") : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card className={criticalIncidents > 0 ? "border-red-200" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical incidents
              </CardTitle>
              <AlertTriangle className={`h-4 w-4 ${criticalIncidents > 0 ? "text-red-600" : "text-muted-foreground"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalIncidents > 0 ? "text-red-600" : ""}`}>
              {criticalIncidents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalIncidents > 0 ? "Requires follow-up" : "None reported"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available forms */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assessment Forms</CardTitle>
          <CardDescription>
            Select the appropriate form based on position type. All forms are aligned with OSHA guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wellbeingForms.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No psychosocial forms available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact system administrator to activate standard forms
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Field count</TableHead>
                  <TableHead className="text-right">Completions</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wellbeingForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{form.title}</p>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {form.isGlobal ? (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Global
                        </Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{form.fields.length}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">{form._count.submissions}</span>
                        {form._count.submissions > 0 && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {form.submissions.length > 0 ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(form.submissions[0].createdAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/forms/${form.id}`}>
                          <Button variant="ghost" size="sm" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {form.isGlobal ? (
                          <CopyFormButton formId={form.id} formTitle={form.title} />
                        ) : (
                          <Link href={`/dashboard/forms/${form.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/dashboard/forms/${form.id}/fill`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <FileText className="h-4 w-4 mr-1" />
                            Fill Out
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Latest submissions and risks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Latest assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Assessments</CardTitle>
            <CardDescription>Recently submitted psychosocial forms</CardDescription>
          </CardHeader>
          <CardContent>
            {allSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No assessments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allSubmissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{submission.formTemplate.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        submission.status === "SUBMITTED" || submission.status === "APPROVED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {submission.status === "SUBMITTED" ? "Submitted" : 
                       submission.status === "APPROVED" ? "Approved" : 
                       submission.status === "DRAFT" ? "Draft" : "Rejected"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated risks */}
        <Card>
          <CardHeader>
            <CardTitle>Identified Risks</CardTitle>
            <CardDescription>Automatically generated risks from assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {wellbeingRisks.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No risks identified</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Risks are automatically generated for low scores or critical incidents
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {wellbeingRisks.map((risk) => (
                  <Link
                    key={risk.id}
                    href={`/dashboard/risks/${risk.id}`}
                    className="block p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">{risk.title}</p>
                        <p className="text-xs text-red-700 mt-1 line-clamp-2">
                          {risk.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="destructive" className="text-xs">
                            Risk: {risk.score}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(risk.createdAt).toLocaleDateString("en-US")}
                          </span>
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="report">
          <WellbeingReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}

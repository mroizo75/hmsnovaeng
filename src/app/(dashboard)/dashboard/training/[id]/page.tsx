import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrainingEvaluationForm } from "@/features/training/components/training-evaluation-form";
import {
  getTrainingStatus,
  getTrainingStatusLabel,
  getTrainingStatusColor,
} from "@/features/training/schemas/training.schema";
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const training = await prisma.training.findUnique({
    where: { id, tenantId },
  });

  if (!training) {
    return <div>Training not found</div>;
  }

  const trainedUser = await prisma.user.findUnique({
    where: { id: training.userId },
    select: { id: true, name: true, email: true },
  });

  const status = getTrainingStatus(training);
  const statusLabel = getTrainingStatusLabel(status);
  const statusColor = getTrainingStatusColor(status);

  const daysUntilExpiry = training.validUntil
    ? Math.ceil((new Date(training.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/training">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Training
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{training.title}</h1>
            <p className="text-muted-foreground">Training details</p>
          </div>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
      </div>

      {/* Warning if expiring or expired */}
      {(status === "EXPIRING_SOON" || status === "EXPIRED") && (
        <Card className={status === "EXPIRED" ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}>
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className={status === "EXPIRED" ? "h-5 w-5 text-red-600" : "h-5 w-5 text-yellow-600"} />
            <div>
              <p className={`font-semibold ${status === "EXPIRED" ? "text-red-900" : "text-yellow-900"}`}>
                {status === "EXPIRED" ? "⚠️ Training has expired" : "⏰ Training expiring soon"}
              </p>
              <p className={status === "EXPIRED" ? "text-red-800" : "text-yellow-800"}>
                {status === "EXPIRED"
                  ? "This training must be renewed as soon as possible."
                  : `Training expires in ${daysUntilExpiry} days. Plan renewal.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provider</p>
                <p className="font-medium">{training.provider}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee</p>
                <p className="font-medium">{trainedUser?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{trainedUser?.email}</p>
              </div>
            </div>

            {training.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{training.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {training.isRequired && (
                <Badge variant="destructive">Required course</Badge>
              )}
              {!training.isRequired && (
                <Badge variant="outline">Optional course</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Dates and Validity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed date</p>
                <p className="font-medium">
                  {training.completedAt
                    ? new Date(training.completedAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not completed yet"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid until</p>
                <p className="font-medium">
                  {training.validUntil ? (
                    <>
                      {new Date(training.validUntil).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({daysUntilExpiry} days remaining)
                        </span>
                      )}
                    </>
                  ) : (
                    "Does not expire"
                  )}
                </p>
              </div>
            </div>

            {training.proofDocKey && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documented proof</p>
                  <Button variant="link" className="h-auto p-0">
                    Download certificate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Effectiveness Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Effectiveness Evaluation (ISO 9001 - 7.2c)
          </CardTitle>
          <CardDescription>
            Evaluate whether the training has achieved the desired competence and effect
          </CardDescription>
        </CardHeader>
        <CardContent>
          {training.effectiveness ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  ✅ Training has been evaluated
                </p>
                <p className="text-sm text-green-800 whitespace-pre-wrap">
                  {training.effectiveness}
                </p>
              </div>
              {training.evaluatedAt && (
                <p className="text-sm text-muted-foreground">
                  Evaluated {new Date(training.evaluatedAt).toLocaleDateString("en-US")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Training has not been evaluated yet. Evaluate effectiveness to meet ISO 9001 requirements.
              </p>
              <TrainingEvaluationForm
                trainingId={training.id}
                trainingTitle={training.title}
                userId={currentUser.id}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ISO 9001 Compliance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 ISO 9001 Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Competence documented based on training</span>
          </div>
          <div className="flex items-center gap-2">
            {training.proofDocKey ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span>Documented proof (certificate) {training.proofDocKey ? "uploaded" : "missing"}</span>
          </div>
          <div className="flex items-center gap-2">
            {training.effectiveness ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span>Effectiveness {training.effectiveness ? "evaluated" : "not evaluated"}</span>
          </div>
          <div className="flex items-center gap-2">
            {status === "VALID" || status === "COMPLETED" ? (
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span>Status: {statusLabel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingForm } from "@/features/training/components/training-form";
import { TrainingList } from "@/features/training/components/training-list";
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Target,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function TrainingPage() {
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

  // Fetch all training with user information
  const trainings = await prisma.training.findMany({
    where: { tenantId },
    include: {
      tenant: {
        select: {
          users: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map trainings to include user info directly
  const trainingsWithUser = (await Promise.all(
    trainings.map(async (training) => {
      const user = await prisma.user.findUnique({
        where: { id: training.userId },
        select: { id: true, name: true, email: true },
      });
      return user ? { ...training, user } : null;
    })
  )).filter((t): t is NonNullable<typeof t> => t !== null);

  // Hent alle brukere for tenant
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

  // Hent kursmaler (globale + tenant-spesifikke)
  const courseTemplates = await prisma.courseTemplate.findMany({
    where: {
      OR: [
        { tenantId, isActive: true },
        { isGlobal: true, isActive: true },
      ],
    },
    orderBy: { title: "asc" },
  });

  // Calculate statistics
  const now = new Date();
  const completed = trainings.filter((t) => t.completedAt).length;
  const notStarted = trainings.filter((t) => !t.completedAt).length;

  const expiringSoon = trainings.filter((t) => {
    if (!t.validUntil) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(t.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;

  const expired = trainings.filter((t) => {
    if (!t.validUntil) return false;
    return new Date(t.validUntil) < now;
  }).length;

  const evaluated = trainings.filter((t) => t.effectiveness).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Training & Competence
            </h1>
            <p className="text-muted-foreground">
              ISO 9001 - 7.2: Document and manage competence
            </p>
          </div>
          <PageHelpDialog content={helpContent.training} />
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/goals?category=COMPETENCE">
            <Button variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Competence Goals
            </Button>
          </Link>
          <Link href="/dashboard/training/courses">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Course Templates
            </Button>
          </Link>
          <Link href="/dashboard/training/matrix">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Competence Matrix
            </Button>
          </Link>
          <TrainingForm tenantId={tenantId} users={tenantUsers} courseTemplates={courseTemplates} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings.length}</div>
            <p className="text-xs text-muted-foreground">Registered trainings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <p className="text-xs text-muted-foreground">
              {trainings.length > 0
                ? `${Math.round((completed / trainings.length) * 100)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
            <p className="text-xs text-muted-foreground">Must be renewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{evaluated}</div>
            <p className="text-xs text-muted-foreground">
              {completed > 0
                ? `${Math.round((evaluated / completed) * 100)}% of completed`
                : "0% of completed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ISO 9001 Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 ISO 9001 - 7.2 Competence</CardTitle>
          <CardDescription className="text-blue-800">
            Competence management requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">a) Determine competence:</p>
              <p>Define required competence for work that affects quality</p>
            </div>
            <div>
              <p className="font-semibold mb-1">b) Ensure competence:</p>
              <p>Document education, training, or experience</p>
            </div>
            <div>
              <p className="font-semibold mb-1">c) Evaluate effectiveness:</p>
              <p>Assess whether training has achieved desired competence</p>
            </div>
            <div>
              <p className="font-semibold mb-1">d) Documented information:</p>
              <p>Retain evidence of competence (certificates, course records)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training List */}
      <Card>
        <CardHeader>
          <CardTitle>All Trainings</CardTitle>
          <CardDescription>
            Overview of registered competence for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrainingList trainings={trainingsWithUser} />
        </CardContent>
      </Card>
    </div>
  );
}

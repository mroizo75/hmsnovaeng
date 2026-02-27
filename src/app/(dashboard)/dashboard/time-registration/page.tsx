import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Clock, Car } from "lucide-react";
import {
  getProjects,
  getTimeRegistrationOverview,
  getTimeRegistrationConfig,
} from "@/server/actions/time-registration.actions";
import { TimeRegistrationOverview } from "@/features/time-registration/components/time-registration-overview";
import { TimeEntryForm } from "@/features/time-registration/components/time-entry-form";
import { MileageEntryForm } from "@/features/time-registration/components/mileage-entry-form";
import { ProjectsList } from "@/features/time-registration/components/projects-list";
import { ReportExportDropdown } from "@/features/time-registration/components/report-export-dropdown";
import { TimeRegistrationEnableCard } from "@/features/time-registration/components/time-registration-enable-card";
import { TimeRegistrationSettings } from "@/features/time-registration/components/time-registration-settings";

export default async function TimeRegistrationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const permissions = getPermissions(session.user.role!);

  if (!permissions.canAccessTimeRegistration) {
    redirect("/dashboard");
  }

  const tenantId = session.user.tenantId;
  const role = session.user.role!;
  const isAdmin = ["ADMIN", "HMS", "LEDER"].includes(role);

  const [configRes, projectsRes] = await Promise.all([
    getTimeRegistrationConfig(tenantId),
    getProjects(tenantId, false),
  ]);

  const config = configRes.success ? configRes.data : null;
  const projects = projectsRes.success ? projectsRes.data : [];
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");

  const enabled = config?.timeRegistrationEnabled ?? false;

  if (!enabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">
            Projects, hours, and mileage – export to Excel and PDF
          </p>
        </div>
        <TimeRegistrationEnableCard
          tenantId={tenantId}
          canEdit={role === "ADMIN"}
        />
      </div>
    );
  }

  const overviewRes = await getTimeRegistrationOverview(tenantId, {
    period: "month",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const overviewData = overviewRes.success ? overviewRes.data : null;

  if (!overviewData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              Could not load overview. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">
            Projects, hours, and mileage – export to Excel and PDF for accounting
          </p>
        </div>
        <ReportExportDropdown />
      </div>

      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects</CardTitle>
              <CardDescription>
                Admin can create and edit projects. Employees register hours and mileage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectsList
                tenantId={tenantId}
                projects={projects}
              />
            </CardContent>
          </Card>
          <TimeRegistrationSettings
            tenantId={tenantId}
            weeklyHoursNorm={config?.weeklyHoursNorm ?? 37.5}
            lunchBreakMinutes={config?.lunchBreakMinutes ?? 30}
            eveningOvertimeFromHour={config?.eveningOvertimeFromHour ?? null}
          />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Register Hours
          </CardTitle>
          <CardDescription>
            Enter hours and travel only – regular and overtime are calculated automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeEntryForm
            tenantId={tenantId}
            projects={activeProjects}
            lunchBreakMinutes={config?.lunchBreakMinutes ?? 30}
            eveningOvertimeFromHour={config?.eveningOvertimeFromHour ?? undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Mileage Reimbursement
          </CardTitle>
          <CardDescription>
            Miles and rate – amount calculated automatically for reimbursement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MileageEntryForm
            tenantId={tenantId}
            projects={activeProjects}
            defaultKmRate={config?.defaultKmRate ?? 4.5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            All entries – filter by period, project, and employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeRegistrationOverview
            initialData={overviewData}
            tenantId={tenantId}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}

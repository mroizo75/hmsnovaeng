import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Car, ArrowLeft } from "lucide-react";
import {
  getProjects,
  getTimeRegistrationOverview,
  getTimeRegistrationConfig,
} from "@/server/actions/time-registration.actions";
import { TimeRegistrationOverview } from "@/features/time-registration/components/time-registration-overview";
import { TimeEntryForm } from "@/features/time-registration/components/time-entry-form";
import { MileageEntryForm } from "@/features/time-registration/components/mileage-entry-form";

export default async function AnsattTimeregistreringPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenantId = session.user.tenantId;
  const userId = session.user.id;

  const [configRes, projectsRes] = await Promise.all([
    getTimeRegistrationConfig(tenantId),
    getProjects(tenantId, true),
  ]);

  const config = configRes.success ? configRes.data : null;
  const projects = projectsRes.success ? projectsRes.data : [];
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");

  const enabled = config?.timeRegistrationEnabled ?? false;

  if (!enabled) {
    return (
      <div className="space-y-6">
        <Link
          href="/ansatt"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Time tracking is not enabled</h2>
            <p className="text-sm text-muted-foreground">
              Contact your manager or administrator to enable time tracking for the company.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overviewRes = await getTimeRegistrationOverview(tenantId, {
    period: "month",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    userId,
  });

  const overviewData = overviewRes.success ? overviewRes.data : null;

  if (!overviewData) {
    return (
      <div className="space-y-6">
        <Link
          href="/ansatt"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
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
      <Link
        href="/ansatt"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to overview
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Time Tracking</h1>
        <p className="text-muted-foreground">
          Register hours and mileage reimbursement per project
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Register hours
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
            Mileage reimbursement
          </CardTitle>
          <CardDescription>
            Miles – rate is set by manager. Only if agreed with employer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MileageEntryForm
            tenantId={tenantId}
            projects={activeProjects}
            defaultKmRate={config?.defaultKmRate ?? 4.5}
            rateEditable={false}
            showDisclaimer={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My registrations</CardTitle>
          <CardDescription>
            Regular hours and overtime for the current month – payroll overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeRegistrationOverview
            initialData={overviewData}
            tenantId={tenantId}
            isAdmin={false}
            restrictToUserId={userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

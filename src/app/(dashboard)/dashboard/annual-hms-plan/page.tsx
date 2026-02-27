import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPermissions } from "@/lib/permissions";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";
import { getAnnualPlanChecklist, serializeAnnualPlanData } from "@/server/actions/annual-hms-plan.actions";
import { AnnualPlanChecklist } from "@/features/annual-hms-plan/components/annual-plan-checklist";

export default async function AnnualHmsPlanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId || !session.user.role) {
    redirect("/login");
  }

  const permissions = getPermissions(session.user.role);

  if (!permissions.canReadManagementReviews && !permissions.canReadDocuments) {
    redirect("/dashboard");
  }

  const year = new Date().getFullYear();
  const result = await getAnnualPlanChecklist(session.user.tenantId, year);

  if (!result.success) {
    redirect("/dashboard");
  }

  const serialized = await serializeAnnualPlanData(result.data);

  const canEdit =
    permissions.canCreateManagementReviews ||
    permissions.canUpdateSettings ||
    permissions.canApproveManagementReviews;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Annual H&S Plan</h1>
            <p className="text-muted-foreground mt-1">
              Step-by-step checklist for this year's H&S requirements. Check off each step when completed – when the list is complete,
              you have documented that the requirements are fulfilled.
            </p>
          </div>
          <PageHelpDialog content={helpContent["annual-hms-plan"]} />
        </div>
      </div>

      <AnnualPlanChecklist
        initialData={serialized}
        tenantId={session.user.tenantId}
        userId={session.user.id ?? null}
        canEdit={canEdit}
      />
    </div>
  );
}

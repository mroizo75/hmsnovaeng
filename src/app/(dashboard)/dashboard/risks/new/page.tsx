import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RiskAssessmentForm } from "@/features/risks/components/risk-assessment-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewRiskAssessmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    return <div>No tenant access</div>;
  }

  const tenantId = user.tenants[0].tenantId;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/risks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Risk Assessment
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Risk Assessment</h1>
        <p className="text-muted-foreground">
          Create a risk assessment for a year (e.g. 2026). Then add risk items in the list below – ISO 45001.
        </p>
      </div>

      <RiskAssessmentForm tenantId={tenantId} defaultYear={currentYear} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PpeAssessmentForm } from "@/features/ppe/components/ppe-assessment-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewPpeAssessmentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/dashboard/ppe" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to PPE Management
        </Link>
        <h1 className="text-3xl font-bold">PPE Hazard Assessment</h1>
        <p className="text-muted-foreground">29 CFR 1910.132(d) — Written certification required for each job title / work area</p>
      </div>
      <PpeAssessmentForm tenantId={tenantId} assessedBy={user.name ?? user.email} />
    </div>
  );
}

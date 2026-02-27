import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InsurancePolicyForm } from "@/features/insurance/components/insurance-policy-form";

export default async function NewInsurancePolicyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Insurance Policy</h1>
        <p className="text-muted-foreground">Record policy details, coverage limits, and agent contact information</p>
      </div>
      <InsurancePolicyForm tenantId={user.tenants[0].tenantId} />
    </div>
  );
}

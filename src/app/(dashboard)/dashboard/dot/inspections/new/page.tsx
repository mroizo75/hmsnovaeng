import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DotInspectionForm } from "@/features/dot/components/dot-inspection-form";

export default async function NewInspectionPage() {
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
        <h1 className="text-2xl font-bold">Log Vehicle Inspection</h1>
        <p className="text-muted-foreground">Record a pre-trip, annual, or roadside inspection (49 CFR 396)</p>
      </div>
      <DotInspectionForm tenantId={user.tenants[0].tenantId} />
    </div>
  );
}

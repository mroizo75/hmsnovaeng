import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DotDriverForm } from "@/features/dot/components/dot-driver-form";

export default async function NewDriverPage() {
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
        <h1 className="text-2xl font-bold">Add Driver</h1>
        <p className="text-muted-foreground">Create a new Driver Qualification File (49 CFR 391)</p>
      </div>
      <DotDriverForm tenantId={user.tenants[0].tenantId} />
    </div>
  );
}

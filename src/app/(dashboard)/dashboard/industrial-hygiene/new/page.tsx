import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IhProgramForm } from "@/features/industrial-hygiene/components/ih-program-form";

export default async function NewIhProgramPage() {
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
        <h1 className="text-2xl font-bold">New Monitoring Program</h1>
        <p className="text-muted-foreground">Define the agent, OSHA exposure limits, and sampling frequency</p>
      </div>
      <IhProgramForm tenantId={user.tenants[0].tenantId} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EapForm } from "@/features/eap/components/eap-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewEapPage() {
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
        <Link href="/dashboard/eap" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Emergency Action Plans
        </Link>
        <h1 className="text-3xl font-bold">New Emergency Action Plan</h1>
        <p className="text-muted-foreground">29 CFR 1910.38 — Define evacuation routes, emergency contacts, and responsibilities</p>
      </div>
      <EapForm tenantId={tenantId} createdBy={user.name ?? user.email} />
    </div>
  );
}

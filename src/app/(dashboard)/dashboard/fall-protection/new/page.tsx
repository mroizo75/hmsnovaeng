import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FallProtectionForm } from "@/features/fall-protection/components/fall-protection-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewFallProtectionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/fall-protection" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Fall Protection
        </Link>
        <h1 className="text-3xl font-bold">New Fall Protection Program</h1>
        <p className="text-muted-foreground">29 CFR 1926.502 / 1910.28 — Document hazards, controls, and equipment</p>
      </div>
      <FallProtectionForm tenantId={tenantId} createdBy={user.name ?? user.email} />
    </div>
  );
}

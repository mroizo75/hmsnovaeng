import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LotoProgramForm } from "@/features/loto/components/loto-program-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewLotoProgramPage() {
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
        <Link href="/dashboard/loto" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to LOTO
        </Link>
        <h1 className="text-3xl font-bold">New Energy Control Program</h1>
        <p className="text-muted-foreground">29 CFR 1910.147 — Document the scope, rules, and techniques of your LOTO program</p>
      </div>
      <LotoProgramForm tenantId={tenantId} createdBy={user.name ?? user.email} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ToolboxTalkForm } from "@/features/toolbox-talks/components/toolbox-talk-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewToolboxTalkPage() {
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
        <Link href="/dashboard/toolbox-talks" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Toolbox Talks
        </Link>
        <h1 className="text-3xl font-bold">New Toolbox Talk</h1>
        <p className="text-muted-foreground">Record a safety briefing and capture attendance signatures</p>
      </div>
      <ToolboxTalkForm tenantId={tenantId} conductedBy={user.name ?? user.email} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DoorOpen, AlertCircle } from "lucide-react";
import { ConfinedSpaceForm } from "@/features/confined-space/components/confined-space-form";

export default async function ConfinedSpacePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const spaces = await prisma.confinedSpace.findMany({
    where: { tenantId },
    include: {
      entryPermits: {
        where: { status: "OPEN" },
        orderBy: { issuedAt: "desc" },
      },
      _count: { select: { entryPermits: true } },
    },
    orderBy: { spaceName: "asc" },
  });

  const openPermits = spaces.flatMap((s) => s.entryPermits);
  const permittedSpaces = spaces.filter((s) => s.permitRequired);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Confined Space Program</h1>
        <p className="text-muted-foreground">29 CFR 1910.146 — Space inventory &amp; entry permit system</p>
      </div>

      {openPermits.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">{openPermits.length} Open Entry Permit(s)</p>
            <p className="text-sm text-amber-800">Active permits must be closed when entry is complete.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spaces Inventoried</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{spaces.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Permit-Required Spaces</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permittedSpaces.length}</div>
            <p className="text-xs text-muted-foreground">Require entry permit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Permits</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${openPermits.length > 0 ? "text-amber-600" : "text-green-600"}`}>
              {openPermits.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Confined Space Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ConfinedSpaceForm tenantId={tenantId} />

          {spaces.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <DoorOpen className="h-10 w-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No confined spaces inventoried yet.</p>
              <p className="text-xs mt-1">OSHA requires employers to identify and evaluate all permit-required confined spaces.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {spaces.map((space) => (
                <div key={space.id} className="flex items-center justify-between border rounded p-3 hover:bg-muted/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{space.spaceName}</span>
                      {space.permitRequired
                        ? <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">Permit Required</Badge>
                        : <Badge variant="outline" className="text-xs">Non-Permit</Badge>}
                      {space.entryPermits.length > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                          {space.entryPermits.length} Open Permit
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {space.location} · {space._count.entryPermits} total permit(s)
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/confined-space/${space.id}`}>Permits →</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Confined Space — 29 CFR 1910.146</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
          <ul className="space-y-1 list-disc list-inside">
            <li>Identify and evaluate all permit-required confined spaces</li>
            <li>Issue entry permits before each entry</li>
            <li>Test atmospheric conditions before and during entry</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Trained entry supervisor, entrant, and attendant required</li>
            <li>Rescue procedures must be established</li>
            <li>Retain completed permits for at least 1 year</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

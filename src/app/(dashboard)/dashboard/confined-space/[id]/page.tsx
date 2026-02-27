import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { ConfinedSpacePermitForm } from "@/features/confined-space/components/confined-space-permit-form";
import { PermitStatus } from "@prisma/client";

const STATUS_STYLE: Record<PermitStatus, string> = {
  OPEN:      "bg-amber-100 text-amber-800 border-amber-300",
  CLOSED:    "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-300",
};

export default async function ConfinedSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  if (!user || user.tenants.length === 0) return <div>No tenant access</div>;

  const tenantId = user.tenants[0].tenantId;

  const space = await prisma.confinedSpace.findFirst({
    where: { id, tenantId },
    include: {
      entryPermits: { orderBy: { issuedAt: "desc" } },
    },
  });

  if (!space) redirect("/dashboard/confined-space");

  const hazards = (space.hazards as Array<{ type: string; description: string }>) ?? [];
  const openPermit = space.entryPermits.find((p) => p.status === "OPEN");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/confined-space" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" />
          Confined Space Inventory
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{space.spaceName}</h1>
          {space.permitRequired
            ? <Badge className="bg-orange-100 text-orange-800 border-orange-300">Permit Required</Badge>
            : <Badge variant="outline">Non-Permit</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{space.location}</p>
      </div>

      {hazards.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Known Hazards</p>
            <ul className="text-sm text-red-800 list-disc list-inside mt-1 space-y-0.5">
              {hazards.map((h, i) => (
                <li key={i}><strong>{h.type}:</strong> {h.description}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {openPermit && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Active Entry Permit — #{openPermit.permitNumber}</p>
            <p className="text-sm text-amber-800">
              Permit expires: {new Date(openPermit.expiresAt).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Entry Permits</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {space.permitRequired && (
            <ConfinedSpacePermitForm spaceId={space.id} issuedBy={user.name ?? user.email ?? ""} />
          )}

          {space.entryPermits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No entry permits issued yet.</p>
          ) : (
            <div className="space-y-3 mt-4">
              {space.entryPermits.map((permit) => {
                const entrants = (permit.authorizedEntrants as Array<{ name: string }>) ?? [];
                const attendants = (permit.attendants as Array<{ name: string }>) ?? [];
                const supervisors = (permit.supervisors as Array<{ name: string }>) ?? [];
                return (
                  <div key={permit.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">#{permit.permitNumber}</span>
                        <Badge className={`text-xs border ${STATUS_STYLE[permit.status]}`}>{permit.status}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(permit.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <p><span className="font-medium text-foreground">Entrants:</span> {entrants.map((e) => e.name).join(", ") || "—"}</p>
                      <p><span className="font-medium text-foreground">Attendants:</span> {attendants.map((a) => a.name).join(", ") || "—"}</p>
                      <p><span className="font-medium text-foreground">Supervisors:</span> {supervisors.map((s) => s.name).join(", ") || "—"}</p>
                    </div>
                    {permit.closedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Closed {new Date(permit.closedAt).toLocaleDateString("en-US")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

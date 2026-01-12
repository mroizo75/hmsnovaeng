import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SecuritySummaryCards } from "@/features/security/components/security-summary-cards";
import { SecurityAssetForm } from "@/features/security/components/security-asset-form";
import { SecurityAssetList } from "@/features/security/components/security-asset-list";
import { SecurityControlForm } from "@/features/security/components/security-control-form";
import { SecurityControlList } from "@/features/security/components/security-control-list";
import { SecurityEvidenceForm } from "@/features/security/components/security-evidence-form";
import { SecurityAccessReviewForm } from "@/features/security/components/security-access-review-form";
import { SecurityAccessReviewList } from "@/features/security/components/security-access-review-list";
import { Button } from "@/components/ui/button";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    redirect("/login");
  }

  const tenantId = user.tenants[0].tenantId;

  const [assets, controls, reviews, documents, risks, usersList] = await Promise.all([
    prisma.securityAsset.findMany({
      where: { tenantId },
      include: {
        owner: { select: { name: true, email: true } },
        controls: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.securityControl.findMany({
      where: { tenantId },
      include: {
        owner: { select: { name: true, email: true } },
        linkedAsset: { select: { name: true } },
        documents: {
          include: {
            document: { select: { title: true } },
          },
        },
        evidences: { select: { id: true } },
      },
      orderBy: [{ status: "asc" }, { code: "asc" }],
    }),
    prisma.accessReview.findMany({
      where: { tenantId },
      include: {
        owner: { select: { name: true, email: true } },
        entries: {
          select: {
            id: true,
            userName: true,
            userEmail: true,
            role: true,
            decision: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.findMany({
      where: { tenantId, status: "APPROVED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
      take: 200,
    }),
    prisma.risk.findMany({
      where: { tenantId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: {
        tenants: { some: { tenantId } },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const evidenceCount = await prisma.securityEvidence.count({ where: { tenantId } });
  const controlsImplemented = controls.filter((control) => control.status === "LIVE" || control.status === "IMPLEMENTED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Informasjonssikkerhet (ISO 27001)</h1>
            <p className="text-muted-foreground">Kontroller, evidens og tilgangsgjennomganger for ISMS-et</p>
          </div>
          <PageHelpDialog content={helpContent.security} />
        </div>
        <Button variant="outline" asChild>
          <a href="/dashboard/documents?filter=ISMS">ISMS-dokumenter</a>
        </Button>
      </div>

      <SecuritySummaryCards
        controls={controls.length}
        controlsImplemented={controlsImplemented}
        evidenceCount={evidenceCount}
        assets={assets.length}
        reviewsOpen={reviews.filter((review) => review.status !== "COMPLETED").length}
      />

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Sikkerhetsobjekter</CardTitle>
            <CardDescription>Beskyttede systemer, enheter og informasjon</CardDescription>
          </div>
          <SecurityAssetForm users={usersList} />
        </CardHeader>
        <CardContent>
          <SecurityAssetList assets={assets} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Sikkerhetskontroller</CardTitle>
            <CardDescription>Følg opp Annex A-kontroller og implementering</CardDescription>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <SecurityEvidenceForm controls={controls.map((control) => ({ id: control.id, code: control.code, title: control.title }))} />
            <SecurityControlForm
              users={usersList}
              assets={assets.map((asset) => ({ id: asset.id, name: asset.name }))}
              risks={risks}
              documents={documents}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecurityControlList controls={controls} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Tilgangsgjennomganger</CardTitle>
            <CardDescription>Planlegg og dokumenter periodiske tilgangsrevisjoner</CardDescription>
          </div>
          <SecurityAccessReviewForm />
        </CardHeader>
        <CardContent>
          <SecurityAccessReviewList reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}


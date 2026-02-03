import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RiskAssessmentItemForm } from "@/features/risks/components/risk-assessment-item-form";
import { RiskAssessmentItemList } from "@/features/risks/components/risk-assessment-item-list";

export default async function RiskAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    return <div>Ingen tilgang til tenant</div>;
  }

  const tenantId = user.tenants[0].tenantId;

  const assessment = await prisma.riskAssessment.findFirst({
    where: { id, tenantId },
    include: {
      risks: {
        orderBy: [{ score: "desc" }, { assessmentDate: "desc" }, { createdAt: "asc" }],
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!assessment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/risks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til risikovurdering
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{assessment.title}</h1>
        <p className="text-muted-foreground">
          Legg inn risikopunkter nedover (beskrivelse, nivå, kategori, dato). ISO 45001: systematisk identifikasjon og vurdering.
        </p>
      </div>

      <RiskAssessmentItemForm
        riskAssessmentId={assessment.id}
        tenantId={tenantId}
        ownerId={user.id}
      />

      <Card>
        <CardHeader>
          <CardTitle>Risikopunkter i denne vurderingen</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskAssessmentItemList risks={assessment.risks} />
        </CardContent>
      </Card>
    </div>
  );
}

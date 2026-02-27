import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, CheckCircle, AlertTriangle, Calendar, MapPin, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { normalizePpeFile } from "@/lib/pictograms";
import { IsocyanateWarning } from "@/components/isocyanate-warning";
import { ChemicalRiskSuggestions } from "@/components/chemical-risk-suggestions";

export default async function ChemicalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!user || user.tenants.length === 0) {
    return <div>You are not associated with a tenant.</div>;
  }

  const tenantId = user.tenants[0].tenantId;

  const chemical = await prisma.chemical.findUnique({
    where: { id, tenantId },
  });

  if (!chemical) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 border-green-200">In Use</Badge>;
      case "PHASED_OUT":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Being Phased Out</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = chemical.nextReviewDate && new Date(chemical.nextReviewDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/chemicals">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chemical Registry
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{chemical.productName}</h1>
              {getStatusBadge(chemical.status)}
            </div>
            {chemical.supplier && (
              <p className="text-muted-foreground">Supplier: {chemical.supplier}</p>
            )}
          </div>
          <Link href={`/dashboard/chemicals/${chemical.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue review warning */}
      {isOverdue && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Review Overdue!</p>
                <p className="text-sm text-red-800">
                  This chemical has a past review date. Please review and update
                  the safety data sheet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diisocyanate warning */}
      {chemical.containsIsocyanates && (
        <IsocyanateWarning details={chemical.aiExtractedData ? (() => {
          try {
            const data = JSON.parse(chemical.aiExtractedData);
            return data.isocyanateDetails;
          } catch {
            return undefined;
          }
        })() : undefined} />
      )}

      {/* Suggested risk assessments */}
      <ChemicalRiskSuggestions
        chemicalId={chemical.id}
        chemicalName={chemical.productName}
        isCMR={chemical.isCMR}
        isSVHC={chemical.isSVHC}
        containsIsocyanates={chemical.containsIsocyanates}
        hazardLevel={chemical.hazardLevel}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chemical.casNumber && (
              <div>
                <p className="text-sm text-muted-foreground">CAS Number</p>
                <p className="font-medium">{chemical.casNumber}</p>
              </div>
            )}

            {chemical.location && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Storage Location
                </p>
                <p className="font-medium">{chemical.location}</p>
              </div>
            )}

            {chemical.quantity && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Quantity
                </p>
                <p className="font-medium">
                  {chemical.quantity} {chemical.unit || ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazard Pictograms */}
        <Card>
          <CardHeader>
            <CardTitle>Hazard Labeling</CardTitle>
            <CardDescription>GHS/CLP Classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chemical.hazardStatements && (
              <div>
                <p className="text-sm text-muted-foreground">H-statements</p>
                <p className="font-medium whitespace-pre-wrap">{chemical.hazardStatements}</p>
              </div>
            )}

            {chemical.warningPictograms && (() => {
              try {
                const pictograms = JSON.parse(chemical.warningPictograms);
                return pictograms.length > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Hazard Symbols</p>
                    <div className="flex flex-wrap gap-3">
                      {pictograms.map((file: string, idx: number) => (
                        <div key={idx} className="relative w-20 h-20 border-2 border-orange-200 rounded-lg p-1">
                          <Image
                            src={`/faremerker/${file}`}
                            alt="Hazard symbol"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              } catch {
                return null;
              }
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Personal Protective Equipment */}
      {chemical.requiredPPE && (() => {
        try {
          const ppeList = JSON.parse(chemical.requiredPPE);
          return ppeList.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Required Personal Protective Equipment (PPE)</CardTitle>
                <CardDescription>ISO 7010 - Equipment required for use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {ppeList.map((file: string, idx: number) => {
                    const normalizedFile = normalizePpeFile(file);
                    if (!normalizedFile) return null;
                    return (
                      <div key={idx} className="relative w-16 h-16 border-2 border-blue-200 rounded-lg p-1 bg-blue-50">
                        <Image
                          src={`/ppe/${normalizedFile}`}
                          alt="PPE requirement"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null;
        } catch {
          return null;
        }
      })()}

      {/* Safety Data Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Data Sheet (SDS)</CardTitle>
          <CardDescription>Documentation and reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {chemical.sdsVersion && (
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">{chemical.sdsVersion}</p>
              </div>
            )}

            {chemical.sdsDate && (
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(chemical.sdsDate).toLocaleDateString("en-US")}
                </p>
              </div>
            )}

            {chemical.nextReviewDate && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next Review
                </p>
                <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                  {new Date(chemical.nextReviewDate).toLocaleDateString("en-US")}
                  {isOverdue && " (Overdue!)"}
                </p>
              </div>
            )}
          </div>

          {chemical.sdsKey ? (
            <div>
              <Link href={`/api/chemicals/${chemical.id}/download-sds`} target="_blank">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Safety Data Sheet
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <p className="text-sm text-amber-800">
                  ⚠️ Safety data sheet missing – please upload
                </p>
              </CardContent>
            </Card>
          )}

          {chemical.lastVerifiedAt && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  Last verified: {new Date(chemical.lastVerifiedAt).toLocaleDateString("en-US")}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Additional Info – Notes */}
      {chemical.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Info</CardTitle>
            <CardDescription>Notes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{chemical.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

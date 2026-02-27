import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, AlertTriangle, Calendar, MapPin, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { normalizePpeFile } from "@/lib/pictograms";
import { IsocyanateWarning } from "@/components/isocyanate-warning";

export default async function AnsattChemicalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const chemical = await prisma.chemical.findUnique({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: "ACTIVE", // Only active chemicals for employees
    },
  });

  if (!chemical) {
    notFound();
  }

  const isOverdue = chemical.nextReviewDate && new Date(chemical.nextReviewDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/ansatt/stoffkartotek">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chemical Registry
          </Button>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{chemical.productName}</h1>
              {chemical.supplier && (
                <p className="text-muted-foreground">Supplier: {chemical.supplier}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue review warning */}
      {isOverdue && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">⚠️ Warning</p>
                <p className="text-sm text-red-800">
                  This chemical has an overdue review date. Contact EHS coordinator before use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Isocyanate warning – important for employees! */}
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

      {/* Safety Data Sheet – prioritized for employees */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Safety Data Sheet (SDS)
          </CardTitle>
          <CardDescription>Always read the Safety Data Sheet before use!</CardDescription>
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
                  Next review
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
                <Button size="lg" className="w-full md:w-auto">
                  <Download className="mr-2 h-5 w-5" />
                  Download Safety Data Sheet (PDF)
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <p className="text-sm text-amber-800">
                  ⚠️ Safety Data Sheet missing – contact EHS coordinator
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Details about the product</CardDescription>
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
                  Storage location
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

        {/* Hazard labeling */}
        <Card>
          <CardHeader>
            <CardTitle>Hazard Classification</CardTitle>
            <CardDescription>GHS/HazCom classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chemical.hazardStatements && (
              <div>
                <p className="text-sm text-muted-foreground">H-Statements (Hazard Statements)</p>
                <p className="font-medium text-sm whitespace-pre-wrap">
                  {chemical.hazardStatements}
                </p>
              </div>
            )}

            {chemical.warningPictograms && (() => {
              try {
                const pictograms = JSON.parse(chemical.warningPictograms);
                return pictograms.length > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Hazard symbols</p>
                    <div className="flex flex-wrap gap-3">
                      {pictograms.map((file: string, idx: number) => (
                        <div key={idx} className="relative w-20 h-20 border-2 border-orange-200 rounded-lg p-1 bg-white">
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

      {/* Required PPE – important for employees! */}
      {chemical.requiredPPE && (() => {
        try {
          const ppeList = JSON.parse(chemical.requiredPPE);
          return ppeList.length > 0 ? (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">
                  🛡️ Required Personal Protective Equipment (PPE)
                </CardTitle>
                <CardDescription className="text-green-700">
                  This PPE MUST be used when working with this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {ppeList.map((file: string, idx: number) => {
                    const normalizedFile = normalizePpeFile(file);
                    if (!normalizedFile) return null;
                    return (
                      <div key={idx} className="relative w-20 h-20 border-2 border-green-300 rounded-lg p-2 bg-white">
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

      {/* Additional info – Notes (visible for employees) */}
      {chemical.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Notes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{chemical.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Remember:</strong> When in doubt or have questions, contact the EHS coordinator before use.
            Always read the Safety Data Sheet thoroughly!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

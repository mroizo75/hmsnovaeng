import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Download, Edit, Clock, CheckCircle2, AlertCircle, Calendar, User, Tag } from "lucide-react";

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "OBSOLETE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Utkast",
    UNDER_REVIEW: "Under gjennomgang",
    APPROVED: "Godkjent",
    OBSOLETE: "Utgått",
  };
  return labels[status] || status;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    redirect("/login");
  }

  const tenantId = user.tenants[0].tenantId;

  const document = await prisma.document.findUnique({
    where: {
      id,
      tenantId,
    },
    include: {
      template: true,
      versions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      approvedByUser: {
        select: { name: true, email: true },
      },
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  if (!document) {
    redirect("/dashboard/documents");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <p className="text-muted-foreground">Versjon {document.version}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/documents/${document.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Rediger
            </Link>
          </Button>
          <Button asChild>
            <a href={`/api/documents/${document.id}/download`} download>
              <Download className="h-4 w-4 mr-2" />
              Last ned
            </a>
          </Button>
        </div>
      </div>

      {/* Status og metadata */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(document.status)}>
              {getStatusLabel(document.status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dokumenttype</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{document.template?.name || document.kind || "Dokument"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{document.template?.category || "GENERAL"}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detaljer */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumentdetaljer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Eier</p>
                <p className="text-sm text-muted-foreground">
                  {document.owner?.name || document.owner?.email || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Opprettet {formatDate(document.createdAt)}</p>
              </div>
            </div>

            {document.approvedBy && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Godkjent av</p>
                  <p className="text-sm text-muted-foreground">
                    {document.approvedByUser?.name || document.approvedByUser?.email || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(document.approvedAt)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Sist oppdatert</p>
                <p className="text-sm text-muted-foreground">{formatDate(document.updatedAt)}</p>
              </div>
            </div>

            {document.nextReviewDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Neste gjennomgang</p>
                  <p className="text-sm text-muted-foreground">{formatDate(document.nextReviewDate)}</p>
                  {document.reviewIntervalMonths && (
                    <p className="text-xs text-muted-foreground">
                      (Hvert {document.reviewIntervalMonths} måned)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Versjonshistorikk */}
      {document.versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Versjonshistorikk</CardTitle>
            <CardDescription>Siste {document.versions.length} versjoner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {document.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">Versjon {version.version}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(version.createdAt)}
                      {version.changeComment && ` · ${version.changeComment}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/api/documents/versions/${version.id}/download`} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
            {document.versions.length >= 5 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Viser kun de 5 siste versjonene
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

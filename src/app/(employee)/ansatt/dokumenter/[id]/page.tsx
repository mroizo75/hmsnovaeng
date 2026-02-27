import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Clock, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import { getStorage } from "@/lib/storage";

export default async function AnsattDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  // Fetch user role
  const userTenant = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    },
    select: {
      role: true,
    },
  });

  const userRole = userTenant?.role || "ANSATT";

  // Fetch document
  const document = await prisma.document.findUnique({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: "APPROVED", // Only approved documents for employees
    },
    include: {
      approvedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  // Check access based on roles
  if (document.visibleToRoles) {
    try {
      const roles = typeof document.visibleToRoles === "string" 
        ? JSON.parse(document.visibleToRoles) 
        : document.visibleToRoles;
      
      if (Array.isArray(roles) && roles.length > 0 && !roles.includes(userRole)) {
        notFound(); // User does not have access to this document
      }
    } catch (error) {
      console.error("Error parsing visibleToRoles:", error);
    }
  }

  const storage = getStorage();
  const downloadUrl = await storage.getUrl(document.fileKey, 3600);

  const isWord =
    document.mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    document.mime === "application/msword";
  const viewUrl = `/api/documents/${document.id}/view`;

  const getKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      LAW: "⚖️ Laws and Regulations",
      PROCEDURE: "📋 Procedure (ISO 9001)",
      CHECKLIST: "✅ Checklist",
      FORM: "📝 Form",
      SDS: "⚠️ Safety Data Sheet (SDS)",
      PLAN: "📖 EHS Handbook / Plan",
      OTHER: "📄 Other",
    };
    return labels[kind] || kind;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/ansatt/dokumenter">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{getKindLabel(document.kind)}</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  ✓ Approved
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View / Download document */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Document
          </CardTitle>
          <CardDescription>
            {isWord
              ? "Open the document as PDF in the browser, or download the original Word file."
              : "Open in browser or download."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href={viewUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full md:w-auto">
              <Eye className="mr-2 h-5 w-5" />
              View document {isWord ? "(PDF)" : ""}
            </Button>
          </Link>
          <Link href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full md:w-auto">
              <Download className="mr-2 h-5 w-5" />
              Download {isWord ? "original (.docx)" : "document"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Document information */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>Metadata and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Version
              </p>
              <p className="font-medium">{document.version}</p>
            </div>

            {document.approvedByUser && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Approved by
                </p>
                <p className="font-medium">
                  {document.approvedByUser.name || document.approvedByUser.email}
                </p>
              </div>
            )}

            {document.approvedAt && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Approval date
                </p>
                <p className="font-medium">
                  {new Date(document.approvedAt).toLocaleDateString("en-US")}
                </p>
              </div>
            )}

            {document.nextReviewDate && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next review
                </p>
                <p className="font-medium">
                  {new Date(document.nextReviewDate).toLocaleDateString("en-US")}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">
                Last updated
              </p>
              <p className="font-medium">
                {new Date(document.updatedAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tips:</strong> This is an approved document that you can download and use.
            If you have questions about the document, contact the EHS coordinator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

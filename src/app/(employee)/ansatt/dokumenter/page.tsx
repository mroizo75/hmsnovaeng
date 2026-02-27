import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Clock } from "lucide-react";
import Link from "next/link";

export default async function AnsattDokumenter() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  // Fetch user role for this tenant
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

  // Fetch all approved documents for this tenant
  const allDocuments = await prisma.document.findMany({
    where: {
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
    orderBy: {
      updatedAt: "desc",
    },
    take: 200, // Fetch more to allow filtering
  });

  // Filter based on roles in JavaScript (since JSON filtering in Prisma is complex)
  const documents = allDocuments.filter((doc) => {
    if (!doc.visibleToRoles) {
      // No role restrictions = visible to all
      return true;
    }
    try {
      const roles = typeof doc.visibleToRoles === "string" 
        ? JSON.parse(doc.visibleToRoles) 
        : doc.visibleToRoles;
      
      if (!Array.isArray(roles) || roles.length === 0) {
        // Empty array or not an array = visible to all
        return true;
      }
      
      // Check if user role is in the list
      return roles.includes(userRole);
    } catch (error) {
      console.error("Error parsing visibleToRoles:", error);
      return true; // Show document if there is an error in the data
    }
  }).slice(0, 50); // Limit to 50 documents

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">📄 Documents</h1>
        <p className="text-muted-foreground">
          EHS documents and procedures you have access to
        </p>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No documents available yet
              </p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Link key={doc.id} href={`/ansatt/dokumenter/${doc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">
                        {doc.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.kind === "LAW" && "⚖️ Laws and Regulations"}
                          {doc.kind === "PROCEDURE" && "📋 Procedure (ISO 9001)"}
                          {doc.kind === "CHECKLIST" && "✅ Checklist"}
                          {doc.kind === "FORM" && "📝 Form"}
                          {doc.kind === "SDS" && "⚠️ Safety Data Sheet (SDS)"}
                          {doc.kind === "PLAN" && "📖 EHS Handbook / Plan"}
                          {doc.kind === "OTHER" && "📄 Other"}
                        </Badge>
                        
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          ✓ Approved
                        </Badge>
                        {doc.approvedByUser && (
                          <span className="text-xs text-muted-foreground">
                            by {doc.approvedByUser.name || doc.approvedByUser.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action icons */}
                    <div className="flex flex-col gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Info box */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tips:</strong> Tap a document to read or download it.
            All documents are approved and up to date.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

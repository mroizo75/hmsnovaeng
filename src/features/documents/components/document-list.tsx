"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Edit, ExternalLink, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteDocument, approveDocument } from "@/server/actions/document.actions";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@prisma/client";

interface DocumentListProps {
  documents: (Document & {
    owner?: { id: string; name: string | null; email: string } | null;
  })[];
  currentUserId: string;
  currentUserRole: string;
}

const kindLabels: Record<string, string> = {
  LAW: "Law",
  PLAN: "Plan",
  PROCEDURE: "Procedure",
  CHECKLIST: "Checklist",
  FORM: "Form",
  SDS: "SDS",
  OTHER: "Other",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  ARCHIVED: "bg-gray-100 text-gray-700 border-gray-300",
};

const formatDate = (date?: Date | null) => {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function DocumentList({ documents, currentUserId, currentUserRole }: DocumentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const canApprove = ["ADMIN", "HMS", "LEDER"].includes(currentUserRole);
  const canDelete = ["ADMIN", "HMS"].includes(currentUserRole);

  const handleApprove = async (id: string, title: string) => {
    setLoading(id);
    const result = await approveDocument({ id, approvedById: currentUserId });

    if (result.success) {
      toast({
        title: "✅ Document approved",
        description: `"${title}" has been set to approved`,
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not approve document",
      });
    }
    setLoading(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis cannot be undone.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteDocument(id);

    if (result.success) {
      toast({
        title: "🗑️ Document deleted",
        description: `"${title}" has been removed`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not delete document",
      });
    }
    setLoading(null);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No documents</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload your first document to get started
        </p>
        <Button asChild>
          <Link href="/dashboard/documents/new">Upload document</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop - Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Review</TableHead>
            <TableHead className="text-right">Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isOverdue =
              doc.nextReviewDate && new Date(doc.nextReviewDate) < new Date();

            return (
              <TableRow key={doc.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    {doc.approvedAt && (
                      <div className="text-xs text-muted-foreground">
                        Approved: {formatDate(doc.approvedAt)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{kindLabels[doc.kind] || doc.kind}</Badge>
                </TableCell>
                <TableCell className="text-sm">{doc.version}</TableCell>
                <TableCell className="text-sm">
                  {doc.owner?.name || doc.owner?.email || "–"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[doc.status] || ""}
                  >
                    {statusLabels[doc.status] || doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {doc.nextReviewDate ? (
                    <span className={isOverdue ? "text-red-600 font-semibold text-sm" : "text-sm"}>
                      {formatDate(doc.nextReviewDate)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">–</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {doc.fileKey && (
                      <Button variant="ghost" size="sm" asChild title="View file">
                        <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild title="Details">
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild title="Edit">
                      <Link href={`/dashboard/documents/${doc.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {canApprove && doc.status === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(doc.id, doc.title)}
                        disabled={loading === doc.id}
                        title="Approve"
                      >
                        ✅
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={loading === doc.id}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      {/* Mobile - Cards */}
      <div className="md:hidden space-y-3">
        {documents.map((doc) => {
          const isOverdue =
            doc.nextReviewDate && new Date(doc.nextReviewDate) < new Date();

          return (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">{doc.title}</h3>
                      {doc.approvedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Approved {formatDate(doc.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{kindLabels[doc.kind] || doc.kind}</Badge>
                    <Badge className={statusColors[doc.status] || ""}>
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                    <Badge variant="secondary">{doc.version}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Owner: {doc.owner?.name || doc.owner?.email || "–"}
                  </div>

                  {doc.nextReviewDate && (
                    <div className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : ""}`}>
                      Review: {formatDate(doc.nextReviewDate)}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/documents/${doc.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    {doc.fileKey && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={loading === doc.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

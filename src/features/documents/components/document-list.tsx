"use client";

import { Document } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, CheckCircle, Trash2, Upload, Calendar, Edit } from "lucide-react";
import Link from "next/link";
import { deleteDocument, getDocumentDownloadUrl, approveDocument } from "@/server/actions/document.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type DocumentWithMeta = Document & {
  owner?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  template?: {
    id: string;
    name: string;
  } | null;
};

interface DocumentListProps {
  documents: DocumentWithMeta[];
  tenantId: string;
  currentUserId?: string;
}

const kindLabels: Record<string, string> = {
  LAW: "Lov",
  PROCEDURE: "Prosedyre",
  CHECKLIST: "Sjekkliste",
  FORM: "Skjema",
  SDS: "Sikkerhetsdatablad",
  PLAN: "Plan",
  OTHER: "Annet",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  APPROVED: "default",
  ARCHIVED: "destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Utkast",
  APPROVED: "Godkjent",
  ARCHIVED: "Arkivert",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  HMS: "HMS",
  LEDER: "Leder",
  VERNEOMBUD: "Verneombud",
  ANSATT: "Ansatt",
  BHT: "BHT",
  REVISOR: "Revisor",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("no-NO");
};

export function DocumentList({ documents, tenantId, currentUserId }: DocumentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    const result = await getDocumentDownloadUrl(id);
    if (result.success && result.data) {
      window.open(result.data.url, "_blank");
      toast({
        title: "Dokument lastes ned",
        description: "Filen åpnes i en ny fane",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Nedlasting feilet",
        description: result.error || "Kunne ikke laste ned dokument",
      });
    }
  };

  const handleApprove = async (id: string, title: string) => {
    if (!confirm(`Godkjenn "${title}"?\n\nDette vil aktivere dokumentet for bruk.`)) {
      return;
    }

    setLoading(id);
    const result = await approveDocument({
      id,
      approvedBy: currentUserId || "system",
    });

    if (result.success) {
      toast({
        title: "✅ Dokument godkjent",
        description: `"${title}" er nå aktivert for bruk`,
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Godkjenning feilet",
        description: result.error || "Kunne ikke godkjenne dokument",
      });
    }
    setLoading(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${title}"?\n\nDette kan ikke angres.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteDocument(id);
    if (result.success) {
      toast({
        title: "🗑️ Dokument slettet",
        description: `"${title}" er permanent fjernet`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Sletting feilet",
        description: result.error || "Kunne ikke slette dokument",
      });
    }
    setLoading(null);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Ingen dokumenter</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Last opp ditt første dokument for å komme i gang
        </p>
        <Button asChild>
          <Link href={`/dashboard/documents/new`}>Last opp dokument</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop - Tabell */}
      <div className="hidden md:block rounded-lg border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tittel</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Versjon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prosesseier</TableHead>
            <TableHead>Neste revisjon</TableHead>
            <TableHead>Synlig for</TableHead>
            <TableHead>Godkjent</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const nextReviewDate = doc.nextReviewDate ? new Date(doc.nextReviewDate) : null;
            const isReviewOverdue = nextReviewDate ? nextReviewDate < new Date() : false;

            return (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{doc.title}</span>
                  {doc.template?.name && (
                    <Badge variant="outline" className="text-xs">
                      {doc.template.name}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{kindLabels[doc.kind]}</Badge>
              </TableCell>
              <TableCell>{doc.version}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[doc.status]}>
                  {statusLabels[doc.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.owner?.name || doc.owner?.email ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {doc.owner?.name || doc.owner?.email}
                    </span>
                    {doc.owner?.email && doc.owner?.name && (
                      <span className="text-xs text-muted-foreground">{doc.owner.email}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Ikke satt</span>
                )}
              </TableCell>
              <TableCell>
                {nextReviewDate ? (
                  <span className={`text-sm ${isReviewOverdue ? "text-destructive font-medium" : ""}`}>
                    {formatDate(nextReviewDate)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {(() => {
                  try {
                    const roles = doc.visibleToRoles ? (typeof doc.visibleToRoles === "string" ? JSON.parse(doc.visibleToRoles) : doc.visibleToRoles) : null;
                    if (!roles || roles.length === 0) {
                      return <span className="text-sm text-muted-foreground">Alle</span>;
                    }
                    return (
                      <div className="flex flex-wrap gap-1">
                        {roles.slice(0, 2).map((role: string) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {roleLabels[role] || role}
                          </Badge>
                        ))}
                        {roles.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{roles.length - 2}</span>
                        )}
                      </div>
                    );
                  } catch {
                    return <span className="text-sm text-muted-foreground">Alle</span>;
                  }
                })()}
              </TableCell>
              <TableCell>
                {doc.approvedAt ? (
                  <span className="text-sm text-muted-foreground">{formatDate(doc.approvedAt)}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{formatDate(doc.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.id)}
                    title="Last ned"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    title="Rediger dokument"
                  >
                    <Link href={`/dashboard/documents/${doc.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  {doc.status === "DRAFT" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(doc.id, doc.title)}
                      disabled={loading === doc.id}
                      title="Godkjenn dokument"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}

                  {doc.status === "APPROVED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      title="Last opp ny versjon"
                    >
                      <Link href={`/dashboard/documents/${doc.id}/new-version`}>
                        <Upload className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={doc.kind === "LAW" || loading === doc.id}
                    title={doc.kind === "LAW" ? "Lovdokumenter kan ikke slettes" : "Slett"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      {/* Mobile - Kort */}
      <div className="md:hidden space-y-3">
        {documents.map((doc) => {
          const nextReviewDate = doc.nextReviewDate ? new Date(doc.nextReviewDate) : null;
          const isReviewOverdue = nextReviewDate ? nextReviewDate < new Date() : false;

          return (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h3 className="font-medium line-clamp-2">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>v{doc.version}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusVariants[doc.status]} className="shrink-0">
                    {statusLabels[doc.status]}
                  </Badge>
                </div>

            <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{kindLabels[doc.kind]}</Badge>
                {doc.template?.name && (
                  <Badge variant="secondary" className="text-xs">
                    {doc.template.name}
                  </Badge>
                )}
                  {doc.approvedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                    Godkjent {formatDate(doc.approvedAt)}
                    </div>
                  )}
                </div>

                {/* Synlig for roller */}
                <div className="mt-2">
                  {(() => {
                    try {
                      const roles = doc.visibleToRoles ? (typeof doc.visibleToRoles === "string" ? JSON.parse(doc.visibleToRoles) : doc.visibleToRoles) : null;
                      if (!roles || roles.length === 0) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            👥 Synlig for alle
                          </span>
                        );
                      }
                      return (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">👥</span>
                          {roles.map((role: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {roleLabels[role] || role}
                            </Badge>
                          ))}
                        </div>
                      );
                    } catch {
                      return (
                        <span className="text-xs text-muted-foreground">
                          👥 Synlig for alle
                        </span>
                      );
                    }
                  })()}
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="text-xs text-muted-foreground">Prosesseier</p>
                  <p className="font-medium">
                    {doc.owner?.name || doc.owner?.email || "Ikke satt"}
                  </p>
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="text-xs text-muted-foreground">Neste revisjon</p>
                  <p className={`font-medium ${isReviewOverdue ? "text-destructive" : ""}`}>
                    {formatDate(nextReviewDate) ?? "Ikke satt"}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Last ned
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/documents/${doc.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rediger
                    </Link>
                  </Button>
                  
                  {doc.status === "DRAFT" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(doc.id, doc.title)}
                      disabled={loading === doc.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Godkjenn
                    </Button>
                  )}

                  {doc.status === "APPROVED" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/documents/${doc.id}/new-version`}>
                        <Upload className="h-4 w-4 mr-2" />
                        Ny versjon
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={doc.kind === "LAW" || loading === doc.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

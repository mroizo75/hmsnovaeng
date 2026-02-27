"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { linkDocumentToRisk, unlinkDocumentFromRisk } from "@/server/actions/risk-register.actions";
import { useToast } from "@/hooks/use-toast";
import type { RiskDocumentLink, RiskDocumentRelation } from "@prisma/client";
import { Trash2 } from "lucide-react";

const relationLabels: Record<RiskDocumentRelation, string> = {
  SUPPORTING: "Supporting",
  POLICY: "Policy",
  PROCEDURE: "Procedure",
  CONTROL_REPORT: "Control Report",
  WORK_INSTRUCTION: "Work Instruction",
  OTHER: "Other",
};

interface RiskDocumentLinksProps {
  riskId: string;
  documents: Array<{ id: string; title: string; status?: string }>;
  links: Array<
    RiskDocumentLink & {
      document: { id: string; title: string; status: string };
    }
  >;
}

export function RiskDocumentLinks({ riskId, documents, links }: RiskDocumentLinksProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedDocument, setSelectedDocument] = useState<string>(documents[0]?.id ?? "");
  const [relation, setRelation] = useState<RiskDocumentRelation>("SUPPORTING");
  const [note, setNote] = useState("");

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDocument) return;

    startTransition(async () => {
      const result = await linkDocumentToRisk({
        riskId,
        documentId: selectedDocument,
        relation,
        note,
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not link document",
        });
      } else {
        toast({
          title: "Document linked",
          description: "The document is now part of the risk register",
        });
        setNote("");
      }
    });
  };

  const handleRemove = (linkId: string) => {
    startTransition(async () => {
      const result = await unlinkDocumentFromRisk(linkId);

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not remove link",
        });
      } else {
        toast({
          title: "Link removed",
          description: "The document has been removed from the risk",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Document</Label>
          <Select
            value={selectedDocument}
            onValueChange={setSelectedDocument}
            disabled={isPending || documents.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={documents.length ? "Select document" : "No documents available"} />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Relation</Label>
          <Select value={relation} onValueChange={(value: RiskDocumentRelation) => setRelation(value)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(relationLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Note</Label>
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
            disabled={isPending}
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" disabled={isPending || !selectedDocument}>
            {isPending ? "Linking..." : "Link document"}
          </Button>
        </div>
      </form>

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents are linked to this risk.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{link.document.title}</p>
                      <p className="text-xs text-muted-foreground">{link.document.status}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{relationLabels[link.relation]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {link.note ? link.note : <span className="text-xs text-muted-foreground">None</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(link.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

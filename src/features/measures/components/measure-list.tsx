"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeMeasure, deleteMeasure } from "@/server/actions/measure.actions";
import { getMeasureStatusLabel, getMeasureStatusColor } from "@/features/measures/schemas/measure.schema";
import { useToast } from "@/hooks/use-toast";
import type { ActionEffectiveness, Measure } from "@prisma/client";

interface MeasureListProps {
  measures: (Measure & {
    risk?: { id: string; title: string } | null;
  })[];
}

export function MeasureList({ measures }: MeasureListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [completeModal, setCompleteModal] = useState<{ id: string; title: string } | null>(null);
  const [effectiveness, setEffectiveness] = useState<ActionEffectiveness>("EFFECTIVE");
  const [completionNote, setCompletionNote] = useState("");

  const openCompleteDialog = (id: string, title: string) => {
    setCompleteModal({ id, title });
    setEffectiveness("EFFECTIVE");
    setCompletionNote("");
  };

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!completeModal) return;
    setLoading(completeModal.id);
    const result = await completeMeasure({
      id: completeModal.id,
      completedAt: new Date().toISOString(),
      completionNote,
      effectiveness,
    });

    if (result.success) {
      toast({
        title: "✅ Tiltak fullført",
        description: `"${completeModal.title}" er nå markert som fullført`,
        className: "bg-green-50 border-green-200",
      });
      setCompleteModal(null);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Kunne ikke fullføre tiltak",
      });
    }
    setLoading(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${title}"?\n\nDette kan ikke angres.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteMeasure(id);

    if (result.success) {
      toast({
        title: "🗑️ Tiltak slettet",
        description: `"${title}" er fjernet`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Kunne ikke slette tiltak",
      });
    }
    setLoading(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (dueAt: Date, status: string) => {
    if (status === "DONE") return false;
    return new Date() > new Date(dueAt);
  };

  if (measures.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Ingen tiltak registrert</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiltak</TableHead>
            <TableHead>Knyttet til</TableHead>
            <TableHead>Detaljer</TableHead>
            <TableHead>Frist</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measures.map((measure) => {
            const statusLabel = getMeasureStatusLabel(measure.status);
            const statusColor = getMeasureStatusColor(measure.status);
            const overdue = isOverdue(measure.dueAt, measure.status);
            const categoryLabels: Record<string, string> = {
              CORRECTIVE: "Korrigerende",
              PREVENTIVE: "Forebyggende",
              IMPROVEMENT: "Forbedring",
              MITIGATION: "Mitigering",
            };
            const frequencyLabels: Record<string, string> = {
              WEEKLY: "Ukentlig",
              MONTHLY: "Månedlig",
              QUARTERLY: "Kvartalsvis",
              ANNUAL: "Årlig",
              BIENNIAL: "Annet hvert år",
            };
            const effectivenessLabels: Record<ActionEffectiveness, string> = {
              EFFECTIVE: "Effektivt",
              PARTIALLY_EFFECTIVE: "Delvis",
              INEFFECTIVE: "Ikke effekt",
              NOT_EVALUATED: "Ikke evaluert",
            };

            return (
              <TableRow key={measure.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{measure.title}</div>
                    {measure.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {measure.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      {categoryLabels[measure.category] || measure.category}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Oppfølging:</span>{" "}
                      {frequencyLabels[measure.followUpFrequency || "ANNUAL"]}
                    </div>
                    {measure.costEstimate && (
                      <div>
                        <span className="text-muted-foreground">Kost:</span>{" "}
                        {measure.costEstimate.toLocaleString("no-NO")} kr
                      </div>
                    )}
                    {measure.benefitEstimate && (
                      <div>
                        <span className="text-muted-foreground">Effekt:</span>{" "}
                        {measure.benefitEstimate}
                      </div>
                    )}
                    {measure.effectiveness !== "NOT_EVALUATED" && (
                      <div>
                        <span className="text-muted-foreground">Evaluering:</span>{" "}
                        {effectivenessLabels[measure.effectiveness]}
                      </div>
                    )}
                    {measure.risk && (
                      <div>
                        <span className="text-muted-foreground">Risiko:</span>{" "}
                        {measure.risk.title}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {overdue && <Clock className="h-4 w-4 text-red-600" />}
                    <span className={overdue ? "text-red-600 font-semibold" : ""}>
                      {formatDate(measure.dueAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {measure.status !== "DONE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCompleteDialog(measure.id, measure.title)}
                        disabled={loading === measure.id}
                        title="Marker som fullført"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(measure.id, measure.title)}
                      disabled={loading === measure.id}
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

      <Dialog open={Boolean(completeModal)} onOpenChange={(open) => {
      if (!open) {
        setCompleteModal(null);
        setCompletionNote("");
      }
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fullfør tiltak</DialogTitle>
          <DialogDescription>
            Evaluer effekt og skriv kort evaluering før du lukker tiltaket
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleComplete} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="effectiveness">Effekt av tiltak</Label>
            <Select
              value={effectiveness}
              onValueChange={(value: ActionEffectiveness) => setEffectiveness(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg effekt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFFECTIVE">Effektivt</SelectItem>
                <SelectItem value="PARTIALLY_EFFECTIVE">Delvis effektivt</SelectItem>
                <SelectItem value="INEFFECTIVE">Ikke effektivt</SelectItem>
                <SelectItem value="NOT_EVALUATED">Ikke evaluert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionNote">Evaluering</Label>
            <Textarea
              id="completionNote"
              name="completionNote"
              placeholder="Beskriv resultat, læringspunkter eller behov for oppfølging"
              value={completionNote}
              onChange={(event) => setCompletionNote(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompleteModal(null)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={!completeModal || loading === completeModal?.id}>
              {loading === completeModal?.id ? "Fullfører..." : "Fullfør tiltak"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
   </>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { deleteIncident } from "@/server/actions/incident.actions";
import {
  getIncidentTypeLabel,
  getIncidentTypeColor,
  getSeverityInfo,
  getIncidentStatusLabel,
  getIncidentStatusColor,
  getIncidentStageLabel,
} from "@/features/incidents/schemas/incident.schema";
import { useToast } from "@/hooks/use-toast";
import type { Incident, Measure } from "@prisma/client";

interface IncidentListProps {
  incidents: (Incident & { measures: Measure[]; risk?: { id: string; title: string; category: string | null } | null })[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${title}"?\n\nDette kan ikke angres.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteIncident(id);

    if (result.success) {
      toast({
        title: "🗑️ Avvik slettet",
        description: `"${title}" er fjernet`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Kunne ikke slette avvik",
      });
    }
    setLoading(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stageColors: Record<string, string> = {
    REPORTED: "bg-gray-100 text-gray-800 border-gray-200",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ROOT_CAUSE: "bg-blue-100 text-blue-800 border-blue-300",
    ACTIONS_DEFINED: "bg-indigo-100 text-indigo-800 border-indigo-300",
    ACTIONS_COMPLETE: "bg-green-100 text-green-800 border-green-300",
    VERIFIED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  };

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Ingen avvik registrert</p>
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
            <TableHead className="w-[100px]">Nr</TableHead>
            <TableHead>Avvik</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Alvorlighet</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Skade</TableHead>
            <TableHead>Dato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Tiltak</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => {
            const typeLabel = getIncidentTypeLabel(incident.type);
            const typeColor = getIncidentTypeColor(incident.type);
            const { label: severityLabel, bgColor: severityColor, textColor: severityTextColor } = getSeverityInfo(incident.severity);
            const statusLabel = getIncidentStatusLabel(incident.status);
            const statusColor = getIncidentStatusColor(incident.status);
            const stageLabel = getIncidentStageLabel(incident.stage as any);
            const stageColor = stageColors[incident.stage] || stageColors.REPORTED;
            const completedMeasures = incident.measures.filter(m => m.status === "DONE").length;
            const totalMeasures = incident.measures.length;

            return (
              <TableRow key={incident.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {incident.avviksnummer || "–"}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {incident.description}
                    </div>
                    {incident.risk && (
                      <div className="text-xs text-muted-foreground">
                        Risiko: {incident.risk.title}
                      </div>
                    )}
                {incident.type === "CUSTOMER" && (
                  <div className="text-xs text-purple-800 space-y-1">
                    <div>Kunde: {incident.customerName || "Ukjent"}</div>
                    {(incident.customerEmail || incident.customerPhone) && (
                      <div>
                        {incident.customerEmail && <span>{incident.customerEmail}</span>}
                        {incident.customerEmail && incident.customerPhone && " · "}
                        {incident.customerPhone}
                      </div>
                    )}
                    {typeof incident.customerSatisfaction === "number" && (
                      <div>Tilfredshet {incident.customerSatisfaction}/5</div>
                    )}
                    {incident.responseDeadline && (
                      <div>Frist {formatDate(incident.responseDeadline)}</div>
                    )}
                  </div>
                )}
                    {incident.type === "CUSTOMER" && (
                      <div className="text-xs text-purple-800 space-x-1 mt-1">
                        <span>Kunde: {incident.customerName || "Ukjent"}</span>
                        {incident.customerEmail && <span>• {incident.customerEmail}</span>}
                        {incident.customerPhone && <span>• {incident.customerPhone}</span>}
                        {typeof incident.customerSatisfaction === "number" && (
                          <span>• Tilfredshet {incident.customerSatisfaction}/5</span>
                        )}
                        {incident.responseDeadline && (
                          <span>• Frist {formatDate(incident.responseDeadline)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={typeColor}>{typeLabel}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${severityColor} ${severityTextColor}`}>
                    {incident.severity} - {severityLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={stageColor}>{stageLabel}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div>{incident.injuryType || "Ingen skade registrert"}</div>
                    <div className="text-xs text-muted-foreground">
                      {incident.medicalAttentionRequired ? "Legebehandling" : "Ingen legebehandling"}
                    </div>
                    {typeof incident.lostTimeMinutes === "number" && (
                      <div className="text-xs text-muted-foreground">
                        Tapt tid: {incident.lostTimeMinutes} min
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(incident.occurredAt)}
                </TableCell>
                <TableCell>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {totalMeasures > 0 ? (
                    <span className="text-sm">
                      {completedMeasures}/{totalMeasures}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/incidents/${incident.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(incident.id, incident.title)}
                      disabled={loading === incident.id}
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
        {incidents.map((incident) => {
          const typeLabel = getIncidentTypeLabel(incident.type);
          const typeColor = getIncidentTypeColor(incident.type);
          const { label: severityLabel, bgColor: severityColor, textColor: severityTextColor } = getSeverityInfo(incident.severity);
          const statusLabel = getIncidentStatusLabel(incident.status);
          const statusColor = getIncidentStatusColor(incident.status);
          const stageLabel = getIncidentStageLabel(incident.stage as any);
          const stageColor = stageColors[incident.stage] || stageColors.REPORTED;
          const completedMeasures = incident.measures.filter(m => m.status === "DONE").length;
          const totalMeasures = incident.measures.length;

          return (
            <Card key={incident.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {incident.avviksnummer && (
                        <p className="text-xs font-mono text-muted-foreground mb-1">
                          {incident.avviksnummer}
                        </p>
                      )}
                      <h3 className="font-medium line-clamp-1">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {incident.description}
                      </p>
                    </div>
                    <Badge className={`${severityColor} ${severityTextColor} shrink-0`}>
                      {incident.severity}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={typeColor}>{typeLabel}</Badge>
                    <Badge className={statusColor}>{statusLabel}</Badge>
                    <Badge className={stageColor}>{stageLabel}</Badge>
                  </div>

                  {incident.risk && (
                    <div className="text-xs text-muted-foreground">
                      Risiko: {incident.risk.title}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {incident.injuryType || "Ingen skade registrert"} ·{" "}
                    {incident.medicalAttentionRequired ? "Legebehandling" : "Ingen legebehandling"}
                    {typeof incident.lostTimeMinutes === "number" && ` · ${incident.lostTimeMinutes} min tap`}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(incident.occurredAt)}
                    </div>
                    {totalMeasures > 0 && (
                      <span>
                        Tiltak: {completedMeasures}/{totalMeasures}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/incidents/${incident.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Se detaljer
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(incident.id, incident.title)}
                      disabled={loading === incident.id}
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


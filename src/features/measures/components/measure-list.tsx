"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Pencil, Trash2, Clock } from "lucide-react";
import { deleteMeasure } from "@/server/actions/measure.actions";
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis cannot be undone.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteMeasure(id);

    if (result.success) {
      toast({
        title: "🗑️ Action deleted",
        description: `"${title}" has been removed`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not delete action",
      });
    }
    setLoading(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
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
        <p>No actions registered</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead className="hidden md:table-cell">Details</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measures.map((measure) => {
            const statusLabel = getMeasureStatusLabel(measure.status);
            const statusColor = getMeasureStatusColor(measure.status);
            const overdue = isOverdue(measure.dueAt, measure.status);
            const categoryLabels: Record<string, string> = {
              CORRECTIVE: "Corrective",
              PREVENTIVE: "Preventive",
              IMPROVEMENT: "Improvement",
              MITIGATION: "Mitigation",
            };
            const frequencyLabels: Record<string, string> = {
              WEEKLY: "Weekly",
              MONTHLY: "Monthly",
              QUARTERLY: "Quarterly",
              ANNUAL: "Annual",
              BIENNIAL: "Biennial",
            };
            const effectivenessLabels: Record<ActionEffectiveness, string> = {
              EFFECTIVE: "Effective",
              PARTIALLY_EFFECTIVE: "Partial",
              INEFFECTIVE: "Ineffective",
              NOT_EVALUATED: "Not evaluated",
            };

            return (
              <TableRow key={measure.id}>
                <TableCell>
                  <div>
                    <Link
                      href={`/dashboard/measures/${measure.id}`}
                      className="font-medium hover:underline"
                    >
                      {measure.title}
                    </Link>
                    {measure.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {measure.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      {categoryLabels[measure.category] || measure.category}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Follow-up:</span>{" "}
                      {frequencyLabels[measure.followUpFrequency || "ANNUAL"]}
                    </div>
                    {measure.costEstimate && (
                      <div>
                        <span className="text-muted-foreground">Cost:</span>{" "}
                        ${measure.costEstimate.toLocaleString("en-US")}
                      </div>
                    )}
                    {measure.benefitEstimate && (
                      <div>
                        <span className="text-muted-foreground">Benefit:</span>{" "}
                        {measure.benefitEstimate}
                      </div>
                    )}
                    {measure.effectiveness !== "NOT_EVALUATED" && (
                      <div>
                        <span className="text-muted-foreground">Evaluation:</span>{" "}
                        {effectivenessLabels[measure.effectiveness]}
                      </div>
                    )}
                    {measure.risk && (
                      <div>
                        <span className="text-muted-foreground">Risk:</span>{" "}
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
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/measures/${measure.id}`}
                        title="Edit and update status"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
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
    </>
  );
}


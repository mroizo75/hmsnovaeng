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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Trash2, Edit } from "lucide-react";
import { deleteFinding, updateFinding, verifyFinding } from "@/server/actions/audit.actions";
import { useToast } from "@/hooks/use-toast";
import {
  getFindingTypeLabel,
  getFindingTypeColor,
  getFindingStatusLabel,
  getFindingStatusColor,
} from "@/features/audits/schemas/audit.schema";
import type { AuditFinding } from "@prisma/client";

interface FindingListProps {
  findings: AuditFinding[];
}

export function FindingList({ findings }: FindingListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingFinding, setEditingFinding] = useState<AuditFinding | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this finding?\n\nThis cannot be undone.")) {
      return;
    }

    setLoading(id);
    const result = await deleteFinding(id);
    if (result.success) {
      toast({
        title: "🗑️ Finding deleted",
        description: "The audit finding has been removed",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error || "Could not delete finding",
      });
    }
    setLoading(null);
  };

  const handleUpdateStatus = async (finding: AuditFinding, status: string) => {
    setLoading(finding.id);
    const result = await updateFinding({ id: finding.id, status });
    if (result.success) {
      toast({
        title: "✅ Status updated",
        description: `The finding is now "${getFindingStatusLabel(status)}"`,
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not update status",
      });
    }
    setLoading(null);
  };

  const handleVerify = async (id: string) => {
    if (!confirm("Are you sure this finding has been resolved and verified?")) {
      return;
    }

    setLoading(id);
    const result = await verifyFinding(id);
    if (result.success) {
      toast({
        title: "✅ Finding verified",
        description: "The finding is now closed and verified",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not verify finding",
      });
    }
    setLoading(null);
  };

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
        <h3 className="text-xl font-semibold">No findings registered</h3>
        <p className="text-muted-foreground">
          No nonconformities or observations have been documented for this audit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const typeLabel = getFindingTypeLabel(finding.findingType);
        const typeColor = getFindingTypeColor(finding.findingType);
        const statusLabel = getFindingStatusLabel(finding.status);
        const statusColor = getFindingStatusColor(finding.status);

        const isOverdue =
          finding.dueDate &&
          new Date(finding.dueDate) < new Date() &&
          finding.status !== "VERIFIED";

        return (
          <Card key={finding.id} className={isOverdue ? "border-red-300" : ""}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={typeColor}>{typeLabel}</Badge>
                      <Badge className={statusColor}>{statusLabel}</Badge>
                      <Badge variant="outline">Clause {finding.clause}</Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {finding.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Deadline: {new Date(finding.dueDate).toLocaleDateString("en-US")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Update finding</DialogTitle>
                          <DialogDescription>
                            Add corrective actions and root cause analysis
                          </DialogDescription>
                        </DialogHeader>
                        <CorrectiveActionForm finding={finding} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(finding.id)}
                      disabled={loading === finding.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description:</p>
                    <p className="text-sm">{finding.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evidence:</p>
                    <p className="text-sm">{finding.evidence}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requirement:</p>
                    <p className="text-sm">{finding.requirement}</p>
                  </div>
                </div>

                {finding.correctiveAction && (
                  <div className="space-y-2 border-t pt-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Corrective action:
                      </p>
                      <p className="text-sm">{finding.correctiveAction}</p>
                    </div>
                    {finding.rootCause && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Root cause analysis:
                        </p>
                        <p className="text-sm">{finding.rootCause}</p>
                      </div>
                    )}
                  </div>
                )}

                {finding.status !== "VERIFIED" && (
                  <div className="flex gap-2 border-t pt-4">
                    {finding.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(finding, "IN_PROGRESS")}
                        disabled={loading === finding.id}
                      >
                        Start work
                      </Button>
                    )}
                    {finding.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(finding, "RESOLVED")}
                        disabled={loading === finding.id}
                      >
                        Mark as resolved
                      </Button>
                    )}
                    {finding.status === "RESOLVED" && (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(finding.id)}
                        disabled={loading === finding.id}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify closure
                      </Button>
                    )}
                  </div>
                )}

                {finding.status === "VERIFIED" && finding.verifiedAt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900">
                      ✅ Verified closed
                    </p>
                    <p className="text-sm text-green-800">
                      {new Date(finding.verifiedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CorrectiveActionForm({ finding }: { finding: AuditFinding }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: finding.id,
      correctiveAction: formData.get("correctiveAction") as string,
      rootCause: formData.get("rootCause") as string,
    };

    const result = await updateFinding(data);

    if (result.success) {
      toast({
        title: "✅ Finding updated",
        description: "Corrective action has been documented",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not update finding",
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correctiveAction">Corrective action (ISO 9001) *</Label>
        <Textarea
          id="correctiveAction"
          name="correctiveAction"
          rows={4}
          placeholder="Describe what actions are/will be taken to close the finding..."
          required
          disabled={loading}
          minLength={20}
          defaultValue={finding.correctiveAction || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rootCause">Root cause analysis (ISO 9001)</Label>
        <Textarea
          id="rootCause"
          name="rootCause"
          rows={3}
          placeholder="What is the root cause of the nonconformity?"
          disabled={loading}
          defaultValue={finding.rootCause || ""}
        />
        <p className="text-sm text-muted-foreground">
          ISO 9001: Identify and eliminate the root cause
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-900">
            ISO 9001: Corrective actions shall eliminate the cause of the nonconformity to prevent
            recurrence.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save action"}
        </Button>
      </div>
    </form>
  );
}

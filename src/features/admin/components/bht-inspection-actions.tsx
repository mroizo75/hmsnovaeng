"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateBhtInspection } from "@/server/actions/bht.actions";
import { Loader2, CheckCircle2, Calendar, AlertTriangle, Lightbulb } from "lucide-react";

interface BhtInspectionActionsProps {
  inspectionId: string;
  bhtClientId: string;
  currentStatus: string;
}

export function BhtInspectionActions({
  inspectionId,
  bhtClientId,
  currentStatus,
}: BhtInspectionActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [findings, setFindings] = useState("");
  const [improvements, setImprovements] = useState("");

  async function handleSchedule() {
    if (!inspectionDate) {
      toast({ variant: "destructive", title: "Select date" });
      return;
    }

    setLoading(true);
    try {
      const result = await updateBhtInspection({
        inspectionId,
        inspectionDate: new Date(inspectionDate),
        status: "PREPARED",
      });

      if (result.success) {
        toast({ title: "✅ Safety walk scheduled" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveFindings() {
    setLoading(true);
    try {
      // Parse findings as JSON array
      const findingsArray = findings
        .split("\n")
        .filter((f) => f.trim())
        .map((f) => ({ description: f.trim() }));

      const improvementsArray = improvements
        .split("\n")
        .filter((i) => i.trim())
        .map((i) => ({ suggestion: i.trim() }));

      const result = await updateBhtInspection({
        inspectionId,
        findings: JSON.stringify(findingsArray),
        improvements: JSON.stringify(improvementsArray),
        status: "REPORT_DONE",
      });

      if (result.success) {
        toast({ title: "✅ Findings saved" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const result = await updateBhtInspection({
        inspectionId,
        status: "COMPLETED",
      });

      if (result.success) {
        toast({ title: "✅ Safety walk completed" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span>The safety walk is completed and documented</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule safety walk */}
      {currentStatus === "PLANNED" && (
        <div className="space-y-3">
          <Label htmlFor="inspectionDate">Schedule date for safety walk</Label>
          <div className="flex gap-4">
            <Input
              id="inspectionDate"
              type="datetime-local"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleSchedule} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Set date
            </Button>
          </div>
        </div>
      )}

      {/* Register findings */}
      {(currentStatus === "PREPARED" || currentStatus === "CONDUCTED") && (
        <>
          <div className="space-y-3">
            <Label htmlFor="findings" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Register findings and deviations (one per line)
            </Label>
            <Textarea
              id="findings"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Enter findings, one per line..."
              rows={5}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="improvements" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              Improvement suggestions (one per line)
            </Label>
            <Textarea
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Enter improvement suggestions, one per line..."
              rows={5}
            />
          </div>

          <Button onClick={handleSaveFindings} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Save findings and improvement suggestions
          </Button>
        </>
      )}

      {/* Complete */}
      {currentStatus === "REPORT_DONE" && (
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark as completed
        </Button>
      )}
    </div>
  );
}


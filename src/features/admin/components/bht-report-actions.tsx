"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  updateBhtAnnualReport,
  markManagementReview,
} from "@/server/actions/bht.actions";
import { Loader2, CheckCircle2, FileText, UserCheck } from "lucide-react";

interface BhtReportActionsProps {
  reportId: string;
  bhtClientId: string;
  currentStatus: string;
  hasManagementReview: boolean;
}

export function BhtReportActions({
  reportId,
  bhtClientId,
  currentStatus,
  hasManagementReview,
}: BhtReportActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState("");

  async function handleSaveAdjustments() {
    setLoading("save");
    try {
      const result = await updateBhtAnnualReport({
        reportId,
        bhtAdjustments: adjustments,
        status: "BHT_REVIEWED",
      });

      if (result.success) {
        toast({ title: "✅ Adjustments saved" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleFinalize() {
    setLoading("finalize");
    try {
      const result = await updateBhtAnnualReport({
        reportId,
        status: "FINAL",
      });

      if (result.success) {
        toast({ title: "✅ Report finalized" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleManagementReview() {
    setLoading("management");
    try {
      const result = await markManagementReview({ reportId });

      if (result.success) {
        toast({ title: "✅ Management review registered" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span>The annual report is completed and archived</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OHS adjustments */}
      {(currentStatus === "AI_GENERATED" || currentStatus === "DRAFT") && (
        <div className="space-y-3">
          <Label htmlFor="adjustments">OHS adjustments and comments</Label>
          <Textarea
            id="adjustments"
            value={adjustments}
            onChange={(e) => setAdjustments(e.target.value)}
            placeholder="Add adjustments to the AI draft..."
            rows={4}
          />
          <Button onClick={handleSaveAdjustments} disabled={loading !== null}>
            {loading === "save" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Save OHS adjustments
          </Button>
        </div>
      )}

      {/* Finalize */}
      {currentStatus === "BHT_REVIEWED" && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleFinalize}
            disabled={loading !== null}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading === "finalize" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Finalize report
          </Button>
          <span className="text-sm text-muted-foreground">
            Prepares the report for management review
          </span>
        </div>
      )}

      {/* Management review */}
      {currentStatus === "FINAL" && !hasManagementReview && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleManagementReview}
            disabled={loading !== null}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading === "management" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            Confirm management review
          </Button>
          <span className="text-sm text-muted-foreground">
            Marks that management has reviewed the report
          </span>
        </div>
      )}
    </div>
  );
}


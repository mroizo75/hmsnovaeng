"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApproveAuditButtonProps {
  auditId: string;
  canApprove: boolean;
  documentsCount: number;
}

export function ApproveAuditButton({
  auditId,
  canApprove,
  documentsCount,
}: ApproveAuditButtonProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch(`/api/audits/${auditId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not approve the audit");
      }

      toast.success("Audit approved!", {
        description: `${data.documentsUpdated} documents updated with new review date`,
      });

      router.refresh();
    } catch (error: any) {
      toast.error("Error approving audit", {
        description: error.message,
      });
    } finally {
      setApproving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="bg-green-600 hover:bg-green-700"
          disabled={!canApprove || approving}
        >
          {approving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve audit
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve audit?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will approve the audit and update all associated documents.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mt-3">
              <p className="text-sm text-blue-900 font-medium">
                📋 {documentsCount} document(s) will be:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                <li>Set to status &quot;Approved&quot;</li>
                <li>Assigned a new review date based on their interval</li>
                <li>Registered with you as approver</li>
              </ul>
            </div>
            {!canApprove && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ The audit must be in status &quot;Completed&quot; before it can be approved.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={!canApprove}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

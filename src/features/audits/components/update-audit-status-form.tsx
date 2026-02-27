"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { updateAudit } from "@/server/actions/audit.actions";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface UpdateAuditStatusFormProps {
  auditId: string;
  currentStatus: string;
  trigger?: React.ReactNode;
}

export function UpdateAuditStatusForm({
  auditId,
  currentStatus,
  trigger,
}: UpdateAuditStatusFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;

    const data = {
      id: auditId,
      status: newStatus as "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    };

    const result = await updateAudit(data);

    if (result.success) {
      toast({
        title: "✅ Status updated",
        description: `The audit status has been changed to "${getStatusLabel(newStatus)}"`,
        className: "bg-green-50 border-green-200",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not update status",
      });
    }

    setLoading(false);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PLANNED: "Planned",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Change status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change audit status</DialogTitle>
          <DialogDescription>
            Update the status for the audit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New status *</Label>
            <Select name="status" required disabled={loading} defaultValue={currentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Use the "Complete audit" button to add
                summary and conclusion when the audit is finished.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

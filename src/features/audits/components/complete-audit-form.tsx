"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle2 } from "lucide-react";

interface CompleteAuditFormProps {
  auditId: string;
  currentSummary?: string | null;
  currentConclusion?: string | null;
  trigger?: React.ReactNode;
}

export function CompleteAuditForm({
  auditId,
  currentSummary,
  currentConclusion,
  trigger,
}: CompleteAuditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: auditId,
      status: "COMPLETED" as const,
      completedAt: new Date(),
      summary: formData.get("summary") as string,
      conclusion: formData.get("conclusion") as string,
    };

    const result = await updateAudit(data);

    if (result.success) {
      toast({
        title: "✅ Audit completed",
        description: "The audit has been marked as completed with summary and conclusion",
        className: "bg-green-50 border-green-200",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not complete audit",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete audit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete audit</DialogTitle>
          <DialogDescription>
            ISO 9001: Report results to relevant management
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Audit summary *</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={6}
              placeholder="Summarize what was reviewed, which areas were audited, and main findings. E.g. 'The audit covered the HSE system for the production department. 4 findings were recorded: 1 major NC, 1 minor NC, 1 observation, and 1 strength.'"
              required
              disabled={loading}
              minLength={50}
              defaultValue={currentSummary || ""}
            />
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters. Provide a thorough overview of the audit.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conclusion">Conclusion and recommendations *</Label>
            <Textarea
              id="conclusion"
              name="conclusion"
              rows={6}
              placeholder="Conclude whether the management system conforms to requirements and provide recommendations. E.g. 'The management system largely conforms to ISO 9001. Corrective actions are effective. Recommend implementing the same solution in other departments.'"
              required
              disabled={loading}
              minLength={50}
              defaultValue={currentConclusion || ""}
            />
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters. ISO 9001: Assess whether the system is effectively implemented.
            </p>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📋 ISO 9001 - 9.2 Reporting
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Summarize scope and findings from the audit</li>
                <li>Assess whether the management system conforms to requirements</li>
                <li>Evaluate whether the system is effectively implemented</li>
                <li>Report results to relevant management</li>
                <li>Recommend areas for improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-900 mb-2">
                💡 Tips for summary:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Which areas/departments were audited?</li>
                <li>Which ISO 9001 clauses were covered?</li>
                <li>Number of findings (major/minor NCs, observations, strengths)</li>
                <li>General impression of the HSE culture</li>
                <li>Positive observations and areas for improvement</li>
              </ul>
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
              {loading ? "Completing..." : "Complete audit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

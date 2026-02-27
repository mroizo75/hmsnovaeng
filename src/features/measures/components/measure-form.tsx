"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createMeasure } from "@/server/actions/measure.actions";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { ControlFrequency, MeasureCategory } from "@prisma/client";

const categoryOptions: Array<{ value: MeasureCategory; label: string }> = [
  { value: "CORRECTIVE", label: "Corrective" },
  { value: "PREVENTIVE", label: "Preventive" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "MITIGATION", label: "Risk Mitigation" },
];

const frequencyOptions: Array<{ value: ControlFrequency; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "BIENNIAL", label: "Every Two Years" },
];

interface MeasureFormProps {
  tenantId: string;
  riskId?: string;
  incidentId?: string;
  auditId?: string;
  goalId?: string;
  users: Array<{ id: string; name: string | null; email: string }>;
  trigger?: React.ReactNode;
}

export function MeasureForm({ tenantId, riskId, incidentId, auditId, goalId, users, trigger }: MeasureFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId,
      riskId,
      incidentId,
      auditId,
      goalId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      dueAt: formData.get("dueAt") as string,
      responsibleId: formData.get("responsibleId") as string,
      status: "PENDING",
      category: formData.get("category") as string,
      followUpFrequency: formData.get("followUpFrequency") as string,
      costEstimate: formData.get("costEstimate") as string,
      benefitEstimate: formData.get("benefitEstimate") as string,
    };

    try {
      const result = await createMeasure(data);

      if (result.success) {
        toast({
          title: "✅ Action created",
          description: "The action has been added and the responsible person will be notified",
          className: "bg-green-50 border-green-200",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not create action",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Action
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>New Corrective Action</DialogTitle>
          <DialogDescription>
            ISO 9001: Actions must have a responsible person, deadline, and clear description
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Install roof railing"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what needs to be done, how, and any resources required"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Action Type *</Label>
              <Select name="category" defaultValue="CORRECTIVE" disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpFrequency">Follow-up Frequency *</Label>
              <Select name="followUpFrequency" defaultValue="ANNUAL" disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="costEstimate">Cost Estimate (USD)</Label>
              <Input
                id="costEstimate"
                name="costEstimate"
                placeholder="e.g. 5000"
                type="number"
                min={0}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefitEstimate">Expected Benefit (points)</Label>
              <Input
                id="benefitEstimate"
                name="benefitEstimate"
                placeholder="e.g. 30"
                type="number"
                min={0}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responsibleId">Responsible Person *</Label>
              <Select name="responsibleId" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueAt">Due Date *</Label>
              <Input
                id="dueAt"
                name="dueAt"
                type="date"
                required
                disabled={loading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">ℹ️ ISO 9001 Compliance</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>All actions must have a <strong>responsible person</strong></li>
              <li>Actions must have a realistic <strong>deadline</strong></li>
              <li>Actions must be <strong>documented</strong> and followed up</li>
              <li>Actions must be <strong>evaluated</strong> when completed</li>
            </ul>
          </div>

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
              {loading ? "Creating..." : "Create Action"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMeasure } from "@/server/actions/measure.actions";
import { useToast } from "@/hooks/use-toast";
import type { ActionEffectiveness, ActionStatus, ControlFrequency, MeasureCategory } from "@prisma/client";
import type { Measure } from "@prisma/client";

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

const statusOptions: Array<{ value: ActionStatus; label: string }> = [
  { value: "PENDING", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Completed" },
];

const effectivenessOptions: Array<{ value: ActionEffectiveness; label: string }> = [
  { value: "EFFECTIVE", label: "Effective" },
  { value: "PARTIALLY_EFFECTIVE", label: "Partially Effective" },
  { value: "INEFFECTIVE", label: "Ineffective" },
  { value: "NOT_EVALUATED", label: "Not Evaluated" },
];

interface MeasureEditFormProps {
  measure: Measure & {
    risk?: { id: string; title: string } | null;
    responsible?: { id: string; name: string | null; email: string } | null;
  };
  users: Array<{ id: string; name: string | null; email: string }>;
}

function formatDateInput(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function MeasureEditForm({ measure, users }: MeasureEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(measure.title);
  const [description, setDescription] = useState(measure.description || "");
  const [dueAt, setDueAt] = useState(formatDateInput(measure.dueAt));
  const [responsibleId, setResponsibleId] = useState(measure.responsibleId);
  const [status, setStatus] = useState<ActionStatus>(measure.status);
  const [category, setCategory] = useState<MeasureCategory>(measure.category);
  const [followUpFrequency, setFollowUpFrequency] = useState<ControlFrequency>(
    measure.followUpFrequency || "ANNUAL"
  );
  const [costEstimate, setCostEstimate] = useState(
    measure.costEstimate?.toString() ?? ""
  );
  const [benefitEstimate, setBenefitEstimate] = useState(
    measure.benefitEstimate?.toString() ?? ""
  );
  const [effectiveness, setEffectiveness] = useState<ActionEffectiveness>(
    measure.effectiveness || "NOT_EVALUATED"
  );
  const [effectivenessNote, setEffectivenessNote] = useState(
    measure.effectivenessNote || ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: measure.id,
      title,
      description: description || undefined,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      responsibleId,
      status,
      category,
      followUpFrequency,
      costEstimate: costEstimate ? parseInt(costEstimate, 10) : undefined,
      benefitEstimate: benefitEstimate ? parseInt(benefitEstimate, 10) : undefined,
      effectiveness: status === "DONE" ? effectiveness : undefined,
      effectivenessNote: status === "DONE" ? effectivenessNote : undefined,
      completedAt: status === "DONE" ? new Date().toISOString() : undefined,
    };

    try {
      const result = await updateMeasure(payload);

      if (result.success) {
        toast({
          title: "✅ Action updated",
          description: "Changes have been saved",
          className: "bg-green-50 border-green-200",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not update action",
        });
      }
    } catch {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Title, description, and responsible person
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Describe the action and what needs to be done"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responsibleId">Responsible Person *</Label>
              <Select
                value={responsibleId}
                onValueChange={setResponsibleId}
                required
                disabled={loading}
              >
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
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status and Follow-up</CardTitle>
          <CardDescription>
            Update status and document progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(v: ActionStatus) => setStatus(v)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Action Type</Label>
              <Select
                value={category}
                onValueChange={(v: MeasureCategory) => setCategory(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpFrequency">Follow-up Frequency</Label>
              <Select
                value={followUpFrequency}
                onValueChange={(v: ControlFrequency) => setFollowUpFrequency(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="costEstimate">Cost Estimate (USD)</Label>
              <Input
                id="costEstimate"
                type="number"
                min={0}
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefitEstimate">Expected Benefit (points)</Label>
              <Input
                id="benefitEstimate"
                type="number"
                min={0}
                value={benefitEstimate}
                onChange={(e) => setBenefitEstimate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {status === "DONE" && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluation</CardTitle>
            <CardDescription>
              Document the effect and outcome when the action is completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveness">Action Effectiveness</Label>
              <Select
                value={effectiveness}
                onValueChange={(v: ActionEffectiveness) => setEffectiveness(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {effectivenessOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectivenessNote">Evaluation / Notes</Label>
              <Textarea
                id="effectivenessNote"
                value={effectivenessNote}
                onChange={(e) => setEffectivenessNote(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="Describe results, lessons learned, or need for follow-up"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

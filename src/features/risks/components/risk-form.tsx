'use client';

import { useEffect, useMemo, useState } from "react";
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
import { createRisk, updateRisk } from "@/server/actions/risk.actions";
import { calculateRiskScore } from "@/features/risks/schemas/risk.schema";
import { useToast } from "@/hooks/use-toast";
import type {
  ControlFrequency,
  Risk,
  RiskCategory,
  RiskResponseStrategy,
  RiskTrend,
} from "@prisma/client";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lightbulb } from "lucide-react";

interface RiskFormProps {
  tenantId: string;
  userId: string;
  risk?: Risk;
  mode?: "create" | "edit";
  owners: Array<{ id: string; name?: string | null; email?: string | null }>;
  goalOptions?: Array<{ id: string; title: string }>;
  templateOptions?: Array<{ id: string; name: string }>;
  /** Slot displayed between Risk Level and Residual Risk (e.g. Actions to reduce risk). Edit mode only. */
  slotBetweenRisikonivaAndResidual?: React.ReactNode;
}

// ISO 45001/31000 – status for risk assessment
const statusOptions = [
  { value: "OPEN", label: "Identified" },
  { value: "MITIGATING", label: "Actions implemented" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "CLOSED", label: "Closed" },
];

const categoryOptions: Array<{ value: RiskCategory; label: string }> = [
  { value: "OPERATIONAL", label: "Operational" },
  { value: "SAFETY", label: "Safety" },
  { value: "HEALTH", label: "Health" },
  { value: "ENVIRONMENTAL", label: "Environmental" },
  { value: "INFORMATION_SECURITY", label: "Information Security" },
  { value: "LEGAL", label: "Legal/Compliance" },
  { value: "STRATEGIC", label: "Strategic" },
  { value: "PSYCHOSOCIAL", label: "Psychosocial" },
  { value: "ERGONOMIC", label: "Ergonomic" },
  { value: "ORGANISATIONAL", label: "Organizational" },
  { value: "PHYSICAL", label: "Physical" },
];

const frequencyOptions: Array<{ value: ControlFrequency; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "BIENNIAL", label: "Every other year" },
];

const responseOptions: Array<{ value: RiskResponseStrategy; label: string; description: string }> = [
  { value: "AVOID", label: "Avoid", description: "Stop the activity or change the process to eliminate the risk" },
  { value: "REDUCE", label: "Reduce", description: "Implement controls to lower likelihood or consequence" },
  { value: "TRANSFER", label: "Transfer", description: "Shift risk via insurance, contracts, or suppliers" },
  { value: "ACCEPT", label: "Accept", description: "Accept the risk within defined tolerance" },
];

const trendOptions: Array<{ value: RiskTrend; label: string }> = [
  { value: "INCREASING", label: "Increasing" },
  { value: "STABLE", label: "Stable" },
  { value: "DECREASING", label: "Decreasing" },
];

const NO_GOAL_VALUE = "__none_goal__";
const NO_TEMPLATE_VALUE = "__none_template__";

const formatDateInput = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getDefaultNextReview = (frequency: ControlFrequency) => {
  const now = new Date();
  switch (frequency) {
    case "WEEKLY":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "MONTHLY":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "QUARTERLY":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case "ANNUAL":
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    case "BIENNIAL":
      return new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }
};

export function RiskForm({
  tenantId,
  userId,
  risk,
  mode = "create",
  owners,
  goalOptions = [],
  templateOptions = [],
  slotBetweenRisikonivaAndResidual,
}: RiskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [likelihood, setLikelihood] = useState(risk?.likelihood || 3);
  const [consequence, setConsequence] = useState(risk?.consequence || 3);
  const [ownerId, setOwnerId] = useState(risk?.ownerId || userId);
  const [category, setCategory] = useState<RiskCategory>(risk?.category || "OPERATIONAL");
  const [controlFrequency, setControlFrequency] = useState<ControlFrequency>(
    risk?.controlFrequency || "ANNUAL"
  );
  const [nextReviewTouched, setNextReviewTouched] = useState(Boolean(risk?.nextReviewDate));
  const [nextReviewDate, setNextReviewDate] = useState(
    formatDateInput(risk?.nextReviewDate ?? getDefaultNextReview(controlFrequency))
  );
  const [residualLikelihood, setResidualLikelihood] = useState<number | null>(
    risk?.residualLikelihood ?? null
  );
  const [residualConsequence, setResidualConsequence] = useState<number | null>(
    risk?.residualConsequence ?? null
  );
  const [selectedGoal, setSelectedGoal] = useState(risk?.kpiId ?? NO_GOAL_VALUE);
  const [selectedTemplate, setSelectedTemplate] = useState(
    risk?.inspectionTemplateId ?? NO_TEMPLATE_VALUE
  );
  const [riskAppetite, setRiskAppetite] = useState(risk?.riskAppetite ?? "");
  const [riskTolerance, setRiskTolerance] = useState(risk?.riskTolerance ?? "");
  const [responseStrategy, setResponseStrategy] = useState<RiskResponseStrategy>(
    risk?.responseStrategy ?? "REDUCE"
  );
  const [trend, setTrend] = useState<RiskTrend>(risk?.trend ?? "STABLE");
  const [reviewedAt, setReviewedAt] = useState(formatDateInput(risk?.reviewedAt));

  useEffect(() => {
    if (!nextReviewTouched) {
      const updated = getDefaultNextReview(controlFrequency);
      setNextReviewDate(formatDateInput(updated));
    }
  }, [controlFrequency, nextReviewTouched]);

  const { score, level, color, bgColor } = calculateRiskScore(likelihood, consequence);

  const residualScore = useMemo(() => {
    if (!residualLikelihood || !residualConsequence) return null;
    return calculateRiskScore(residualLikelihood, residualConsequence);
  }, [residualLikelihood, residualConsequence]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title") as string,
      context: formData.get("context") as string,
      likelihood,
      consequence,
      ownerId,
      status: (formData.get("status") as string) || "OPEN",
      category,
      location: formData.get("location") as string,
      area: formData.get("area") as string,
      description: formData.get("description") as string,
      existingControls: formData.get("existingControls") as string,
      controlFrequency,
      nextReviewDate: nextReviewDate || undefined,
      riskStatement: formData.get("riskStatement") as string,
      residualLikelihood,
      residualConsequence,
      kpiId: selectedGoal === NO_GOAL_VALUE ? undefined : selectedGoal,
      inspectionTemplateId: selectedTemplate === NO_TEMPLATE_VALUE ? undefined : selectedTemplate,
      linkedProcess: formData.get("linkedProcess") as string,
      riskAppetite,
      riskTolerance,
      responseStrategy,
      trend,
      reviewedAt: reviewedAt || undefined,
    };

    try {
      const result =
        mode === "create"
          ? await createRisk({ ...payload, tenantId })
          : await updateRisk({ ...payload, id: risk!.id });

      if (result.success) {
        toast({
          title: mode === "create" ? "✅ Risk created" : "✅ Risk updated",
          description: `Risk level: ${level} (${score})`,
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/risks");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not save risk",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Describe the risk and who owns it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="E.g. Fall from height while working on roof"
                defaultValue={risk?.title}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(val: RiskCategory) => setCategory(val)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Risk owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name || owner.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={risk?.status || "OPEN"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="E.g. Production Hall A"
                defaultValue={risk?.location ?? ""}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area / Process</Label>
              <Input
                id="area"
                name="area"
                placeholder="Construction site, warehouse, etc."
                defaultValue={risk?.area ?? ""}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedProcess">Linked to process</Label>
              <Input
                id="linkedProcess"
                name="linkedProcess"
                placeholder="E.g. Maintenance, Assembly"
                defaultValue={risk?.linkedProcess ?? ""}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description and consequence</CardTitle>
          <CardDescription>
            Describe the situation and what can happen (consequence). Existing controls and notes below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Description *</Label>
            <Textarea
              id="context"
              name="context"
              placeholder="Describe the situation, where it can occur, who is at risk, etc."
              defaultValue={risk?.context}
              required
              disabled={loading}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="riskStatement">Consequence</Label>
            <Textarea
              id="riskStatement"
              name="riskStatement"
              placeholder="What could happen if the risk scenario occurs? Describe the consequence."
              defaultValue={risk?.riskStatement ?? ""}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingControls">Existing controls</Label>
            <Textarea
              id="existingControls"
              name="existingControls"
              placeholder="What barriers or controls exist today?"
              defaultValue={risk?.existingControls ?? ""}
              disabled={loading}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional notes</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Other relevant details, references, or observations"
              defaultValue={risk?.description ?? ""}
              disabled={loading}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Risk level</CardTitle>
            {(level === "MEDIUM" || level === "HIGH" || level === "CRITICAL") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Tips"
                  >
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-w-sm p-4"
                  sideOffset={8}
                >
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Tips for {level === "CRITICAL" ? "critical" : level === "HIGH" ? "high" : "medium"} risk
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mode === "edit"
                      ? "ISO 45001 recommends actions to reduce the risk. Scroll down to 'Actions to reduce risk' and add concrete actions with a responsible person and deadline."
                      : "After saving, you can add actions to reduce the risk. ISO 45001 requires planned actions for medium and high risk."}
                  </p>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <CardDescription>
            {risk?.riskAssessmentId
              ? "Set when the risk item was added. Change on the overview page if needed."
              : "Likelihood and consequence (1–5). The risk matrix is shown on the overview page /dashboard/risks"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {risk?.riskAssessmentId ? (
            <div className={`rounded-lg border-2 p-4 ${bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl font-bold ${color}`}>{level}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Likelihood: {likelihood} × Consequence: {consequence} = {score}
                  </div>
                </div>
                <div className={`text-4xl font-bold ${color}`}>{score}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Likelihood (1–5)</Label>
                  <Select
                    value={String(likelihood)}
                    onValueChange={(v) => setLikelihood(Number(v))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consequence (1–5)</Label>
                  <Select
                    value={String(consequence)}
                    onValueChange={(v) => setConsequence(Number(v))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className={`rounded-lg border-2 p-4 ${bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xl font-bold ${color}`}>{level}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Likelihood: {likelihood} × Consequence: {consequence} = {score}
                    </div>
                  </div>
                  <div className={`text-4xl font-bold ${color}`}>{score}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {mode === "edit" && slotBetweenRisikonivaAndResidual}

      <Card>
        <CardHeader>
          <CardTitle>Residual risk after actions</CardTitle>
          <CardDescription>
            Assess residual risk after actions are implemented — should be lower after controls are in place (ISO 45001).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Residual Likelihood</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[residualLikelihood ?? 3]}
                onValueChange={([value]) => setResidualLikelihood(value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {residualLikelihood ? `Value: ${residualLikelihood}` : "Select a value 1-5"}
              </p>
            </div>
            <div>
              <Label>Residual Consequence</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[residualConsequence ?? 3]}
                onValueChange={([value]) => setResidualConsequence(value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {residualConsequence ? `Value: ${residualConsequence}` : "Select a value 1-5"}
              </p>
            </div>
          </div>
          {residualScore && (
            <div className={`p-4 rounded-lg border ${residualScore.bgColor}`}>
              <p className={`font-semibold ${residualScore.color}`}>
                Residual level: {residualScore.level} ({residualScore.score})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up and links</CardTitle>
          <CardDescription>Link the risk to KPIs and inspection templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="controlFrequency">Review frequency *</Label>
              <Select
                value={controlFrequency}
                onValueChange={(value: ControlFrequency) => {
                  setControlFrequency(value);
                }}
                disabled={loading}
              >
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
            <div className="space-y-2">
              <Label htmlFor="nextReviewDate">Next review *</Label>
              <Input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                value={nextReviewDate}
                onChange={(event) => {
                  setNextReviewTouched(true);
                  setNextReviewDate(event.target.value);
                }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kpiId">Link to goal/KPI</Label>
              <Select
                value={selectedGoal}
                onValueChange={setSelectedGoal}
                disabled={goalOptions.length === 0 || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={goalOptions.length ? "Select goal (optional)" : "No goals available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GOAL_VALUE}>None</SelectItem>
                  {goalOptions.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspectionTemplateId">Inspection template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={templateOptions.length === 0 || loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={templateOptions.length ? "Select template (optional)" : "No templates available"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TEMPLATE_VALUE}>None</SelectItem>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk appetite and strategy</CardTitle>
          <CardDescription>ISO 31000: Document tolerance limits and chosen response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="riskAppetite">Risk appetite</Label>
              <Textarea
                id="riskAppetite"
                name="riskAppetite"
                placeholder="Describe what level of risk the organization accepts"
                value={riskAppetite}
                onChange={(event) => setRiskAppetite(event.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk tolerance</Label>
              <Textarea
                id="riskTolerance"
                name="riskTolerance"
                placeholder="Describe what deviations/indicators trigger actions"
                value={riskTolerance}
                onChange={(event) => setRiskTolerance(event.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Response strategy *</Label>
              <Select
                value={responseStrategy}
                onValueChange={(value: RiskResponseStrategy) => setResponseStrategy(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {responseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trend *</Label>
              <Select value={trend} onValueChange={(value: RiskTrend) => setTrend(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trend" />
                </SelectTrigger>
                <SelectContent>
                  {trendOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewedAt">Last reviewed</Label>
              <Input
                id="reviewedAt"
                name="reviewedAt"
                type="date"
                value={reviewedAt}
                onChange={(event) => setReviewedAt(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep appetite, tolerance and strategy up to date — used in management reviews, audits and reports.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create risk" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

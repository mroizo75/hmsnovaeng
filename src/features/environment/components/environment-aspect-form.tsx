"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ControlFrequency,
  EnvironmentalAspect,
  EnvironmentalAspectCategory,
  EnvironmentalAspectStatus,
  EnvironmentalImpactType,
} from "@prisma/client";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  createEnvironmentalAspect,
  updateEnvironmentalAspect,
} from "@/server/actions/environment.actions";

type UserOption = { id: string; name: string | null; email: string | null };
type GoalOption = { id: string; title: string };

interface EnvironmentAspectFormProps {
  tenantId: string;
  users: UserOption[];
  goals: GoalOption[];
  aspect?: EnvironmentalAspect;
  mode?: "create" | "edit";
  defaultOwnerId?: string;
}

const categoryOptions: Array<{ value: EnvironmentalAspectCategory; label: string }> = [
  { value: "RESOURCE_USE", label: "Resource Use" },
  { value: "ENERGY", label: "Energy" },
  { value: "WATER", label: "Water" },
  { value: "WASTE", label: "Waste" },
  { value: "EMISSIONS", label: "Emissions" },
  { value: "BIODIVERSITY", label: "Biodiversity" },
  { value: "OTHER", label: "Other" },
];

const impactOptions: Array<{ value: EnvironmentalImpactType; label: string }> = [
  { value: "NEGATIVE", label: "Negative Impact" },
  { value: "POSITIVE", label: "Positive Impact" },
];

const frequencyOptions: Array<{ value: ControlFrequency; label: string }> = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "BIENNIAL", label: "Every Two Years" },
];

const statusOptions: Array<{ value: EnvironmentalAspectStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "MONITORED", label: "Monitored" },
  { value: "CLOSED", label: "Closed" },
];

const NO_OWNER_VALUE = "__none_owner__";
const NO_GOAL_VALUE = "__none_goal__";
const NO_MONITORING_VALUE = "__none_frequency__";

const getSignificanceMeta = (score: number) => {
  if (score >= 20) {
    return { label: "Critical Impact", color: "text-red-900", bg: "bg-red-100 border-red-300" };
  }
  if (score >= 12) {
    return { label: "High Impact", color: "text-orange-900", bg: "bg-orange-100 border-orange-300" };
  }
  if (score >= 6) {
    return { label: "Moderate Impact", color: "text-yellow-900", bg: "bg-yellow-100 border-yellow-300" };
  }
  return { label: "Low Impact", color: "text-green-900", bg: "bg-green-100 border-green-300" };
};

const toISODate = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const emptyToUndefined = (value: FormDataEntryValue | null) => {
  if (!value) return undefined;
  const str = value.toString().trim();
  return str.length ? str : undefined;
};

export function EnvironmentAspectForm({
  tenantId,
  users,
  goals,
  aspect,
  mode = "create",
  defaultOwnerId,
}: EnvironmentAspectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState(aspect?.severity ?? 3);
  const [likelihood, setLikelihood] = useState(aspect?.likelihood ?? 3);
  const [impactType, setImpactType] = useState<EnvironmentalImpactType>(aspect?.impactType ?? "NEGATIVE");
  const [category, setCategory] = useState<EnvironmentalAspectCategory>(
    aspect?.category ?? "RESOURCE_USE"
  );
  const [status, setStatus] = useState<EnvironmentalAspectStatus>(aspect?.status ?? "ACTIVE");
  const [ownerId, setOwnerId] = useState(aspect?.ownerId ?? defaultOwnerId ?? NO_OWNER_VALUE);
  const [goalId, setGoalId] = useState(aspect?.goalId ?? NO_GOAL_VALUE);
  const [monitoringFrequency, setMonitoringFrequency] = useState<
    ControlFrequency | typeof NO_MONITORING_VALUE
  >(aspect?.monitoringFrequency ?? NO_MONITORING_VALUE);

  const significanceScore = severity * likelihood;
  const significanceMeta = getSignificanceMeta(significanceScore);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title") as string,
      description: emptyToUndefined(formData.get("description")),
      process: emptyToUndefined(formData.get("process")),
      location: emptyToUndefined(formData.get("location")),
      legalRequirement: emptyToUndefined(formData.get("legalRequirement")),
      controlMeasures: emptyToUndefined(formData.get("controlMeasures")),
      monitoringMethod: emptyToUndefined(formData.get("monitoringMethod")),
      severity,
      likelihood,
      category,
      impactType,
      monitoringFrequency: monitoringFrequency === NO_MONITORING_VALUE ? undefined : monitoringFrequency,
      ownerId: ownerId === NO_OWNER_VALUE ? undefined : ownerId,
      goalId: goalId === NO_GOAL_VALUE ? undefined : goalId,
      nextReviewDate: emptyToUndefined(formData.get("nextReviewDate")),
      status: mode === "edit" ? status : undefined,
    };

    try {
      const result =
        mode === "create"
          ? await createEnvironmentalAspect({ ...payload, tenantId })
          : await updateEnvironmentalAspect({ ...payload, id: aspect!.id });

      if (!result.success) {
        throw new Error(result.error || "Could not save environmental aspect");
      }

      toast({
        title: mode === "create" ? "✅ Environmental aspect created" : "✅ Environmental aspect updated",
        description: mode === "create"
          ? "The environmental aspect has been registered and is ready for follow-up"
          : "Changes have been saved",
      });

      if (mode === "create" && result.data) {
        router.push(`/dashboard/environment/${result.data.id}`);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
          <CardDescription>Classify the environmental aspect and assess its significance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Energy consumption during night shift"
                defaultValue={aspect?.title}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value: EnvironmentalAspectCategory) => setCategory(value)} disabled={loading}>
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
              <Label htmlFor="impactType">Impact Type *</Label>
              <Select value={impactType} onValueChange={(value: EnvironmentalImpactType) => setImpactType(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  {impactOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner</Label>
              <Select value={ownerId} onValueChange={setOwnerId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER_VALUE}>Not set</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goalId">Link to environmental goal</Label>
              <Select value={goalId} onValueChange={setGoalId} disabled={loading || goals.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={goals.length ? "Select goal (optional)" : "No goals available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GOAL_VALUE}>Not set</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextReviewDate">Next Review</Label>
              <Input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                defaultValue={toISODate(aspect?.nextReviewDate)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Severity (1-5)</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[severity]}
                onValueChange={([value]) => setSeverity(value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">Value: {severity}</p>
            </div>
            <div className="space-y-2">
              <Label>Likelihood (1-5)</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[likelihood]}
                onValueChange={([value]) => setLikelihood(value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">Value: {likelihood}</p>
            </div>
          </div>

          <div className={`rounded-lg border p-4 ${significanceMeta.bg}`}>
            <p className={`text-sm font-medium ${significanceMeta.color}`}>
              Significance: {significanceScore} ({significanceMeta.label})
            </p>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: EnvironmentalAspectStatus) => setStatus(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description and Context</CardTitle>
          <CardDescription>Where does the impact occur and which processes are affected?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what causes the impact and which resources are affected"
              defaultValue={aspect?.description ?? ""}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="process">Process</Label>
              <Input
                id="process"
                name="process"
                placeholder="e.g. Production, Logistics"
                defaultValue={aspect?.process ?? ""}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Building A, Warehouse 2"
                defaultValue={aspect?.location ?? ""}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controls and Monitoring</CardTitle>
          <CardDescription>Define measures and how the impact is measured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legalRequirement">Regulatory Requirements</Label>
            <Textarea
              id="legalRequirement"
              name="legalRequirement"
              placeholder="Reference applicable laws, regulations, or other obligations"
              defaultValue={aspect?.legalRequirement ?? ""}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="controlMeasures">Control Measures</Label>
            <Textarea
              id="controlMeasures"
              name="controlMeasures"
              placeholder="What barriers and routines reduce the impact?"
              defaultValue={aspect?.controlMeasures ?? ""}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monitoringMethod">Monitoring Method</Label>
              <Input
                id="monitoringMethod"
                name="monitoringMethod"
                placeholder="e.g. Energy meter, Lab analysis, Visual inspection"
                defaultValue={aspect?.monitoringMethod ?? ""}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monitoringFrequency">Monitoring Frequency</Label>
              <Select
                value={monitoringFrequency}
                onValueChange={(value) => setMonitoringFrequency(value as ControlFrequency | typeof NO_MONITORING_VALUE)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MONITORING_VALUE}>Not set</SelectItem>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Environmental Aspect" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

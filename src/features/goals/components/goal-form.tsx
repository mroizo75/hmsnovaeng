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
import { Card, CardContent } from "@/components/ui/card";
import { createGoal, updateGoal } from "@/server/actions/goal.actions";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@prisma/client";

interface GoalFormProps {
  tenantId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
  goal?: Goal;
  mode?: "create" | "edit";
}

export function GoalForm({ tenantId, users, goal, mode = "create" }: GoalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const targetValueStr = formData.get("targetValue") as string;
    const targetValue = targetValueStr && targetValueStr.trim() !== "" 
      ? parseFloat(targetValueStr) 
      : undefined;
    
    const currentValueStr = formData.get("currentValue") as string;
    const currentValue = currentValueStr && currentValueStr.trim() !== "" 
      ? parseFloat(currentValueStr) 
      : 0;
    
    const baselineStr = formData.get("baseline") as string;
    const baseline = baselineStr && baselineStr.trim() !== "" 
      ? parseFloat(baselineStr) 
      : undefined;
    
    const quarterValue = formData.get("quarter") as string;
    let quarter: number | undefined = undefined;
    if (quarterValue && quarterValue !== "NONE") {
      const parsed = parseInt(quarterValue);
      if (!isNaN(parsed)) {
        quarter = parsed;
      }
    }
    
    const data = {
      tenantId,
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      category: formData.get("category") as string,
      targetValue: !isNaN(targetValue as number) ? targetValue : undefined,
      currentValue: !isNaN(currentValue as number) ? currentValue : 0,
      unit: formData.get("unit") as string || undefined,
      baseline: !isNaN(baseline as number) ? baseline : undefined,
      year: parseInt(formData.get("year") as string),
      quarter,
      startDate: formData.get("startDate") as string || undefined,
      deadline: formData.get("deadline") as string || undefined,
      ownerId: formData.get("ownerId") as string,
      status: formData.get("status") as string,
    };

    try {
      const result =
        mode === "edit" && goal
          ? await updateGoal({ id: goal.id, ...data })
          : await createGoal(data);

      if (result.success) {
        toast({
          title: mode === "edit" ? "✅ Goal updated" : "✅ Goal created",
          description: mode === "edit" ? "Changes have been saved" : "The goal has been created",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/goals");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not save goal",
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
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Reduce workplace injuries by 50%"
              required
              disabled={loading}
              defaultValue={goal?.title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe the goal in detail..."
              disabled={loading}
              defaultValue={goal?.description || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" required disabled={loading} defaultValue={goal?.category || "QUALITY"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUALITY">Quality</SelectItem>
                  <SelectItem value="HMS">EHS</SelectItem>
                  <SelectItem value="ENVIRONMENT">Environment</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="EFFICIENCY">Efficiency</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="COMPETENCE">Competence</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" required disabled={loading} defaultValue={goal?.status || "ACTIVE"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ACHIEVED">Achieved</SelectItem>
                  <SelectItem value="AT_RISK">At Risk</SelectItem>
                  <SelectItem value="FAILED">Not Achieved</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="baseline">Baseline</Label>
              <Input
                id="baseline"
                name="baseline"
                type="number"
                step="0.01"
                placeholder="Starting point"
                disabled={loading}
                defaultValue={goal?.baseline || ""}
              />
              <p className="text-sm text-muted-foreground">
                Current value before improvement
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                name="targetValue"
                type="number"
                step="0.01"
                placeholder="Desired value"
                disabled={loading}
                defaultValue={goal?.targetValue || ""}
              />
              <p className="text-sm text-muted-foreground">
                Value we want to achieve
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="%, count, USD, etc"
                disabled={loading}
                defaultValue={goal?.unit || ""}
              />
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value</Label>
              <Input
                id="currentValue"
                name="currentValue"
                type="number"
                step="0.01"
                placeholder="Updated by measurements"
                disabled={loading}
                defaultValue={goal?.currentValue || ""}
              />
              <p className="text-sm text-muted-foreground">
                Automatically updated by measurements
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="2020"
                max="2100"
                required
                disabled={loading}
                defaultValue={goal?.year || currentYear}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter (optional)</Label>
              <Select name="quarter" disabled={loading} defaultValue={goal?.quarter?.toString() || "NONE"}>
                <SelectTrigger>
                  <SelectValue placeholder="Full year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Full Year</SelectItem>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner *</Label>
              <Select name="ownerId" required disabled={loading} defaultValue={goal?.ownerId}>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                disabled={loading}
                defaultValue={
                  goal?.startDate ? new Date(goal.startDate).toISOString().split("T")[0] : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                disabled={loading}
                defaultValue={
                  goal?.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            📋 ISO 9001 - 6.2 Quality Objectives
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Goals must be measurable</li>
            <li>Goals must be relevant to the organization</li>
            <li>Goals must be monitored and measured regularly</li>
            <li>Goals must be communicated to relevant personnel</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}

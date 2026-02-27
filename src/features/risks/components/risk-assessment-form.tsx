"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRiskAssessment } from "@/server/actions/risk.actions";
import { useToast } from "@/hooks/use-toast";

interface RiskAssessmentFormProps {
  tenantId: string;
  defaultYear: number;
}

export function RiskAssessmentForm({ tenantId, defaultYear }: RiskAssessmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(`Risk Assessment ${defaultYear}`);
  const [year, setYear] = useState(defaultYear);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createRiskAssessment({ tenantId, title: title.trim(), assessmentYear: year });
      if (result.success && result.data) {
        toast({
          title: "Risk assessment created",
          description: `You can now add risk items for ${year}.`,
          className: "bg-green-50 border-green-200",
        });
        router.push(`/dashboard/risks/assessment/${result.data.id}`);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error ?? "Could not create" });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Risk assessment for a year</CardTitle>
          <CardDescription>
            Title and year for the annual risk assessment. After creation, add risk items (description, level, category, date).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Risk Assessment 2026"
                required
                minLength={3}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || defaultYear)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create risk assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

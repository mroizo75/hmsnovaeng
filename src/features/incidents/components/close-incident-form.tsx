"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { closeIncident } from "@/server/actions/incident.actions";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

interface CloseIncidentFormProps {
  incidentId: string;
  userId: string;
}

export function CloseIncidentForm({ incidentId, userId }: CloseIncidentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: incidentId,
      closedBy: userId,
      effectivenessReview: formData.get("effectivenessReview") as string,
      lessonsLearned: formData.get("lessonsLearned") as string || undefined,
      measureEffectiveness: formData.get("measureEffectiveness") as string,
    };

    try {
      const result = await closeIncident(data);

      if (result.success) {
        toast({
          title: "✅ Incident closed",
          description: "The incident has been fully handled and documented",
          className: "bg-green-50 border-green-200",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not close incident",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Close incident
        </CardTitle>
        <CardDescription>
          ISO 9001: Review the effectiveness of corrective actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
            <p className="text-sm font-medium text-green-900 mb-2">✅ Ready for closure</p>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Root cause analysis is complete</li>
              <li>All corrective actions have been implemented</li>
              <li>Now evaluate whether the actions were effective</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectivenessReview">Effectiveness review *</Label>
            <Textarea
              id="effectivenessReview"
              name="effectivenessReview"
              placeholder="Have the actions eliminated the root cause? Can similar incidents be prevented now? Describe the evaluation."
              required
              disabled={loading}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Assess whether the corrective actions have been effective
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measureEffectiveness">Action effectiveness</Label>
            <Select
              name="measureEffectiveness"
              defaultValue="EFFECTIVE"
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFFECTIVE">Actions were effective</SelectItem>
                <SelectItem value="PARTIALLY_EFFECTIVE">Partially effective</SelectItem>
                <SelectItem value="INEFFECTIVE">Not effective</SelectItem>
                <SelectItem value="NOT_EVALUATED">Not evaluated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonsLearned">Lessons learned</Label>
            <Textarea
              id="lessonsLearned"
              name="lessonsLearned"
              placeholder="What have we learned from this incident? What can we improve in the future?"
              disabled={loading}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Document learnings for future improvement
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">📋 ISO 9001 Compliance</p>
            <p className="text-sm text-blue-800">
              By closing the incident you confirm that:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside ml-2">
              <li>The root cause has been identified and documented</li>
              <li>Corrective actions have been implemented</li>
              <li>The effectiveness of the actions has been assessed</li>
              <li>Documentation is complete and retained</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Closing..." : "Close incident"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

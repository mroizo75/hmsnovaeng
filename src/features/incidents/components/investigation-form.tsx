"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { investigateIncident } from "@/server/actions/incident.actions";
import { useToast } from "@/hooks/use-toast";
import { FileSearch } from "lucide-react";

interface InvestigationFormProps {
  incidentId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
}

export function InvestigationForm({ incidentId, users }: InvestigationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: incidentId,
      rootCause: formData.get("rootCause") as string,
      contributingFactors: formData.get("contributingFactors") as string || undefined,
      investigatedBy: formData.get("investigatedBy") as string,
    };

    try {
      const result = await investigateIncident(data);

      if (result.success) {
        toast({
          title: "✅ Root cause analysis complete",
          description: "You can now plan corrective actions",
          className: "bg-green-50 border-green-200",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not save root cause analysis",
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
          <FileSearch className="h-5 w-5" />
          Root Cause Analysis
        </CardTitle>
        <CardDescription>
          ISO 9001: Assess the need for actions to eliminate the cause
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">🔍 The 5 Whys method</p>
            <p className="text-sm text-yellow-800">
              Ask "why" repeatedly to find the root cause. Example:
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside ml-2">
              <li>Why did the accident happen? → The person fell from a ladder</li>
              <li>Why did the person fall? → The ladder was unstable</li>
              <li>Why was the ladder unstable? → The floor was slippery/uneven</li>
              <li>Why was the floor slippery? → No risk assessment performed</li>
              <li><strong>Root cause: Inadequate planning and risk assessment</strong></li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootCause">Root Cause *</Label>
            <Textarea
              id="rootCause"
              name="rootCause"
              placeholder="What is the underlying cause of this incident? Use the 5 Whys method."
              required
              disabled={loading}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Describe the root cause, not just the symptom
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributingFactors">Contributing factors</Label>
            <Textarea
              id="contributingFactors"
              name="contributingFactors"
              placeholder="Other factors that contributed to the incident (e.g. time pressure, lack of training, poor communication)"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatedBy">Investigated by *</Label>
            <Select name="investigatedBy" required disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select responsible for investigation" />
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

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Complete root cause analysis"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

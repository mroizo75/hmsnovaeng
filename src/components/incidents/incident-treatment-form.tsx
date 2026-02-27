"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface IncidentTreatmentFormProps {
  incidentId: string;
  currentStatus: string;
  currentSeverity: number;
  currentResponsibleId: string | null;
  users: Array<{ id: string; name: string | null; email: string }>;
}

export function IncidentTreatmentForm({
  incidentId,
  currentStatus,
  currentSeverity,
  currentResponsibleId,
  users,
}: IncidentTreatmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [severity, setSeverity] = useState(currentSeverity.toString());
  const [responsibleId, setResponsibleId] = useState(currentResponsibleId || "NONE");

  async function handleUpdate() {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/incidents/${incidentId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          severity: parseInt(severity, 10),
          responsibleId: responsibleId === "NONE" ? null : responsibleId,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke oppdatere avvik");
      }

      toast({
        title: "✅ Updated",
        description: "The incident has been updated",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Could not update incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const hasChanges =
    status !== currentStatus ||
    severity !== currentSeverity.toString() ||
    responsibleId !== (currentResponsibleId || "NONE");

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="INVESTIGATING">Under investigation</SelectItem>
              <SelectItem value="ACTION_TAKEN">Action taken</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Negligible</SelectItem>
              <SelectItem value="2">2 - Minor</SelectItem>
              <SelectItem value="3">3 - Moderate</SelectItem>
              <SelectItem value="4">4 - Serious</SelectItem>
              <SelectItem value="5">5 - Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Responsible for follow-up</Label>
        <Select value={responsibleId} onValueChange={setResponsibleId}>
          <SelectTrigger>
            <SelectValue placeholder="Select responsible..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">None assigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasChanges && (
        <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "💾 Save changes"
          )}
        </Button>
      )}
    </div>
  );
}


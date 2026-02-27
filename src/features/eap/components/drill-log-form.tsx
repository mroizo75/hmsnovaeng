"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logEmergencyDrill } from "@/server/actions/eap.actions";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";

export function DrillLogForm({ planId, conductedBy }: { planId: string; conductedBy: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drillType, setDrillType] = useState("Fire Evacuation");
  const [conductedAt, setConductedAt] = useState(new Date().toISOString().slice(0, 10));
  const [participantCount, setParticipantCount] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [findings, setFindings] = useState("");
  const [correctiveActions, setCorrectiveActions] = useState("");

  async function handleSubmit() {
    if (!participantCount) return;
    setSaving(true);
    try {
      await logEmergencyDrill({
        planId,
        drillType,
        conductedAt: new Date(conductedAt),
        conductedBy,
        participantCount: parseInt(participantCount, 10),
        durationMin: durationMin ? parseInt(durationMin, 10) : undefined,
        findings: findings || undefined,
        correctiveActions: correctiveActions || undefined,
      });
      router.refresh();
      setOpen(false);
      setParticipantCount(""); setDurationMin(""); setFindings(""); setCorrectiveActions("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CalendarCheck className="mr-2 h-4 w-4" />
        Log Drill
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-4 bg-muted/30">
      <h4 className="font-semibold text-sm">Log Emergency Drill</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Drill Type</Label>
          <select className="w-full border rounded px-2 py-2 text-sm bg-background" value={drillType} onChange={(e) => setDrillType(e.target.value)}>
            <option>Fire Evacuation</option>
            <option>Shelter-in-Place</option>
            <option>Chemical Spill</option>
            <option>Medical Emergency</option>
            <option>Active Threat</option>
            <option>Earthquake</option>
            <option>Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date Conducted</Label>
          <Input type="date" value={conductedAt} onChange={(e) => setConductedAt(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Number of Participants *</Label>
          <Input type="number" value={participantCount} onChange={(e) => setParticipantCount(e.target.value)} placeholder="e.g. 45" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Duration (minutes)</Label>
          <Input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="e.g. 4" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Findings / Observations</Label>
        <Textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={2} placeholder="Observations from the drill…" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Corrective Actions Required</Label>
        <Textarea value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)} rows={2} placeholder="Any corrective actions needed…" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !participantCount}>
          {saving ? "Saving…" : "Save Drill Record"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

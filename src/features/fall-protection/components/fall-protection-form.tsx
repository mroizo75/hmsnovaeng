"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createFallProtectionProgram } from "@/server/actions/fall-protection.actions";
import { FALL_CONTROL_TYPES } from "@/features/fall-protection/schemas/fall-protection.schema";

const HAZARD_OPTIONS = [
  "Open floor holes / skylights", "Floor / wall openings", "Leading edge work",
  "Roof work", "Scaffolding", "Ladders", "Elevated platforms", "Steel erection",
  "Excavations / trenches", "Ramps / runways",
];

export function FallProtectionForm({ tenantId }: { tenantId: string; createdBy: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [rescuePlan, setRescuePlan] = useState("");
  const [hazards, setHazards] = useState<string[]>([]);
  const [controls, setControls] = useState<string[]>([]);

  function toggleHazard(item: string) {
    setHazards((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }
  function toggleControl(item: string) {
    setControls((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  async function handleSubmit() {
    if (hazards.length === 0 || controls.length === 0) return;
    setSaving(true);
    try {
      const program = await createFallProtectionProgram({
        tenantId,
        effectiveDate: new Date(effectiveDate),
        hazards: hazards.map((h) => ({ hazard: h, location: "General facility", height: "Varies" })),
        controls: controls.map((c) => {
          const found = FALL_CONTROL_TYPES.find((t) => t.label === c);
          return { type: found?.value ?? "OTHER" as (typeof FALL_CONTROL_TYPES)[number]["value"], description: c };
        }),
        rescuePlan: rescuePlan || undefined,
      });
      if (program?.id) {
        router.push("/dashboard/fall-protection");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Effective Date *</Label>
            <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Rescue Plan</Label>
            <Textarea value={rescuePlan} onChange={(e) => setRescuePlan(e.target.value)} rows={3} placeholder="Describe the rescue plan for fallen workers…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fall Hazards Identified *</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {HAZARD_OPTIONS.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <Checkbox id={`h-${h}`} checked={hazards.includes(h)} onCheckedChange={() => toggleHazard(h)} />
                <Label htmlFor={`h-${h}`} className="text-sm font-normal cursor-pointer">{h}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Control Measures *</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {FALL_CONTROL_TYPES.map((c) => (
              <div key={c.value} className="flex items-center gap-2">
                <Checkbox id={`c-${c.value}`} checked={controls.includes(c.label)} onCheckedChange={() => toggleControl(c.label)} />
                <Label htmlFor={`c-${c.value}`} className="text-sm font-normal cursor-pointer">{c.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving || hazards.length === 0 || controls.length === 0}>
          {saving ? "Creating…" : "Create Program"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/fall-protection")}>Cancel</Button>
      </div>
    </div>
  );
}

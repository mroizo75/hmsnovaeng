"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createConfinedSpace } from "@/server/actions/confined-space.actions";
import { Plus } from "lucide-react";

export function ConfinedSpaceForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [location, setLocation] = useState("");
  const [permitRequired, setPermitRequired] = useState(true);
  const [hazardText, setHazardText] = useState("");

  async function handleSubmit() {
    if (!spaceName || !location) return;
    setSaving(true);
    try {
      const hazards = hazardText
        ? hazardText.split("\n").filter(Boolean).map((h) => ({ type: "Identified", description: h.trim() }))
        : [];
      await createConfinedSpace({
        tenantId,
        spaceName,
        location,
        permitRequired,
        hazards,
      });
      router.refresh();
      setOpen(false);
      setSpaceName(""); setLocation(""); setHazardText(""); setPermitRequired(true);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add Confined Space
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Add Confined Space</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Space Name *</Label>
          <Input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="e.g. Boiler Room, Tank 3" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Location *</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Building A, Room 104" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Known Hazards (one per line)</Label>
        <Textarea
          value={hazardText}
          onChange={(e) => setHazardText(e.target.value)}
          rows={2}
          placeholder="Atmospheric hazard&#10;Engulfment risk&#10;Entrapment hazard"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={permitRequired} onCheckedChange={setPermitRequired} />
        <Label className="text-sm">{permitRequired ? "Permit-Required Confined Space" : "Non-Permit Confined Space"}</Label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !spaceName || !location}>
          {saving ? "Adding…" : "Add Space"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

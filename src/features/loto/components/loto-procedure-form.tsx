"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLotoProcedure } from "@/server/actions/loto.actions";
import { Plus } from "lucide-react";
import { LOTO_ENERGY_TYPES } from "@/features/loto/schemas/loto.schema";

export function LotoProcedureForm({ programId }: { programId: string; createdBy: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [location, setLocation] = useState("");
  const [energyType, setEnergyType] = useState<string>(LOTO_ENERGY_TYPES[0]);
  const [energyMagnitude, setEnergyMagnitude] = useState("");
  const [energyLocation, setEnergyLocation] = useState("");
  const [authorizedUser, setAuthorizedUser] = useState("");

  async function handleSubmit() {
    if (!equipmentName || !energyMagnitude || !authorizedUser) return;
    setSaving(true);
    try {
      await createLotoProcedure({
        programId,
        equipmentName,
        equipmentId: equipmentId || undefined,
        location: location || undefined,
        energySources: [{ type: energyType as (typeof LOTO_ENERGY_TYPES)[number], magnitude: energyMagnitude, location: energyLocation || location || "N/A" }],
        steps: [
          { stepNumber: 1, action: "Notify affected employees that equipment will be shut down", responsible: authorizedUser },
          { stepNumber: 2, action: "Shut down and isolate all energy sources", responsible: authorizedUser },
          { stepNumber: 3, action: "Apply lockout/tagout device and verify zero energy state", responsible: authorizedUser },
        ],
        authorizedUsers: [authorizedUser],
      });
      router.refresh();
      setOpen(false);
      setEquipmentName(""); setEquipmentId(""); setLocation(""); setEnergyMagnitude(""); setEnergyLocation(""); setAuthorizedUser("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add Machine Procedure
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Add Machine-Specific Procedure</h4>
      <p className="text-xs text-muted-foreground">A minimal procedure will be created — edit the full procedure details via the API or by expanding this form.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Equipment Name *</Label>
          <Input value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} placeholder="e.g. Hydraulic Press #3" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Equipment / Asset ID</Label>
          <Input value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} placeholder="e.g. EQ-0042" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Building B, Bay 3" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Primary Energy Source Type *</Label>
          <select className="w-full border rounded px-2 py-2 text-sm bg-background" value={energyType} onChange={(e) => setEnergyType(e.target.value)}>
            {LOTO_ENERGY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Energy Magnitude *</Label>
          <Input value={energyMagnitude} onChange={(e) => setEnergyMagnitude(e.target.value)} placeholder="e.g. 480V, 100 psi" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Authorized Technician *</Label>
          <Input value={authorizedUser} onChange={(e) => setAuthorizedUser(e.target.value)} placeholder="Employee name / ID" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !equipmentName || !energyMagnitude || !authorizedUser}>
          {saving ? "Adding…" : "Add Procedure"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

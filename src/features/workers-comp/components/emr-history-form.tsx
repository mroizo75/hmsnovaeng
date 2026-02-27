"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordEmr } from "@/server/actions/workers-comp.actions";
import { Plus } from "lucide-react";

export function EmrHistoryForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [emrValue, setEmrValue] = useState("");
  const [carrier, setCarrier] = useState("");

  async function handleSubmit() {
    if (!year || !emrValue) return;
    setSaving(true);
    try {
      await recordEmr({
        tenantId,
        year: parseInt(year, 10),
        emrValue: parseFloat(emrValue),
        carrier: carrier || undefined,
      });
      router.refresh();
      setOpen(false);
      setEmrValue(""); setCarrier("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add EMR Year
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Record EMR</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Policy Year *</Label>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">EMR Value *</Label>
          <Input type="number" step="0.01" value={emrValue} onChange={(e) => setEmrValue(e.target.value)} placeholder="e.g. 0.87" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Carrier</Label>
          <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Insurance carrier name" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !year || !emrValue}>{saving ? "Saving…" : "Save EMR"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

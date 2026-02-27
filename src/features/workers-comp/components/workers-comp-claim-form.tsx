"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkersCompClaim } from "@/server/actions/workers-comp.actions";
import { Plus } from "lucide-react";

export function WorkersCompClaimForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [claimantName, setClaimantName] = useState("");
  const [claimNumber, setClaimNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [injuryDate, setInjuryDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().slice(0, 10));

  async function handleSubmit() {
    if (!claimantName || !claimNumber || !carrierName) return;
    setSaving(true);
    try {
      await createWorkersCompClaim({
        tenantId,
        claimantName,
        claimNumber,
        carrierName,
        injuryDate: new Date(injuryDate),
        reportedDate: new Date(reportedDate),
      });
      router.refresh();
      setOpen(false);
      setClaimantName(""); setClaimNumber(""); setCarrierName("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> File New Claim
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">New Workers&apos; Compensation Claim</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Claimant Name *</Label>
          <Input value={claimantName} onChange={(e) => setClaimantName(e.target.value)} placeholder="Employee full name" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Claim Number *</Label>
          <Input value={claimNumber} onChange={(e) => setClaimNumber(e.target.value)} placeholder="Assigned by carrier" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Insurance Carrier *</Label>
          <Input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} placeholder="e.g. Liberty Mutual, Travelers" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date of Injury *</Label>
          <Input type="date" value={injuryDate} onChange={(e) => setInjuryDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date Reported *</Label>
          <Input type="date" value={reportedDate} onChange={(e) => setReportedDate(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !claimantName || !claimNumber || !carrierName}>
          {saving ? "Saving…" : "File Claim"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

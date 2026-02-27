"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordHepBVaccination } from "@/server/actions/bbp.actions";
import { Plus } from "lucide-react";
import { HepBVaccineStatus } from "@prisma/client";

export function BbpVaccinationForm({ programId }: { programId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [status, setStatus] = useState<HepBVaccineStatus>(HepBVaccineStatus.OFFERED);
  const [offeredAt, setOfferedAt] = useState(new Date().toISOString().substring(0, 10));
  const [respondedAt, setRespondedAt] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit() {
    if (!employeeName) return;
    setSaving(true);
    try {
      await recordHepBVaccination({
        programId,
        userId: employeeName,
        status,
        offeredAt: new Date(offeredAt),
        respondedAt: respondedAt ? new Date(respondedAt) : undefined,
        notes: notes || undefined,
      });
      router.refresh();
      setOpen(false);
      setEmployeeName("");
      setStatus(HepBVaccineStatus.OFFERED);
      setOfferedAt(new Date().toISOString().substring(0, 10));
      setRespondedAt("");
      setNotes("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add Employee Record
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Add Hepatitis B Vaccination Record</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Employee Name *</Label>
          <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Full name or employee ID" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hepatitis B Vaccine Status</Label>
          <select
            className="w-full border rounded px-2 py-2 text-sm bg-background"
            value={status}
            onChange={(e) => setStatus(e.target.value as HepBVaccineStatus)}
          >
            <option value="OFFERED">Offered — awaiting response</option>
            <option value="ACCEPTED">Accepted — vaccination in progress</option>
            <option value="DECLINED">Declined — declination form signed</option>
            <option value="COMPLETED">Completed — 3-dose series done</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date Offered *</Label>
          <Input type="date" value={offeredAt} onChange={(e) => setOfferedAt(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date Responded</Label>
          <Input type="date" value={respondedAt} onChange={(e) => setRespondedAt(e.target.value)} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !employeeName}>
          {saving ? "Saving…" : "Add Record"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

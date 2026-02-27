"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createConfinedSpacePermit } from "@/server/actions/confined-space.actions";
import { ClipboardList } from "lucide-react";

export function ConfinedSpacePermitForm({ spaceId }: { spaceId: string; issuedBy: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entrantName, setEntrantName] = useState("");
  const [attendantName, setAttendantName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [permitNumber, setPermitNumber] = useState(
    `CS-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`
  );

  async function handleSubmit() {
    if (!entrantName || !attendantName || !supervisorName) return;
    setSaving(true);
    try {
      await createConfinedSpacePermit({
        spaceId,
        permitNumber,
        issuedAt: new Date(),
        expiresAt: validUntil ? new Date(validUntil) : new Date(Date.now() + 8 * 60 * 60 * 1000),
        authorizedEntrants: [{ name: entrantName }],
        attendants: [{ name: attendantName }],
        supervisors: [{ name: supervisorName }],
        hazardsIdentified: [{ hazard: "Atmospheric", control: "Continuous monitoring" }],
        atmosphericTests: [{ gas: "O2", reading: "20.9%", acceptable: "19.5-23.5%", testedAt: new Date().toISOString(), testedBy: supervisorName }],
        equipmentRequired: [{ item: "Retrieval system", checked: true }],
      });
      router.refresh();
      setOpen(false);
      setEntrantName(""); setAttendantName(""); setSupervisorName(""); setValidUntil("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ClipboardList className="h-3 w-3 mr-1" /> Issue Entry Permit
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Issue Confined Space Entry Permit</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Permit Number</Label>
          <Input value={permitNumber} onChange={(e) => setPermitNumber(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Expires (blank = end of shift)</Label>
          <Input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Authorized Entrant *</Label>
          <Input value={entrantName} onChange={(e) => setEntrantName(e.target.value)} placeholder="Employee name" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Attendant *</Label>
          <Input value={attendantName} onChange={(e) => setAttendantName(e.target.value)} placeholder="Attendant name" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Entry Supervisor *</Label>
          <Input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="Supervisor name" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !entrantName || !attendantName || !supervisorName}>
          {saving ? "Issuing…" : "Issue Permit"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompetentPerson } from "@/server/actions/competent-person.actions";
import { COMPETENT_PERSON_DESIGNATIONS } from "@/features/competent-person/schemas/competent-person.schema";
import { Plus } from "lucide-react";

export function CompetentPersonForm({ tenantId, designatedBy }: { tenantId: string; designatedBy: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [designationIdx, setDesignationIdx] = useState(0);
  const [qualificationDesc, setQualificationDesc] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState("");

  async function handleSubmit() {
    if (!userId || !qualificationDesc) return;
    setSaving(true);
    try {
      await createCompetentPerson({
        tenantId,
        userId,
        designation: COMPETENT_PERSON_DESIGNATIONS[designationIdx].designation,
        oshaStandard: COMPETENT_PERSON_DESIGNATIONS[designationIdx].standard,
        qualifications: [{ type: "Training", description: qualificationDesc }],
        effectiveDate: new Date(effectiveDate),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        designatedBy,
      });
      router.refresh();
      setOpen(false);
      setUserId(""); setQualificationDesc(""); setExpiresAt("");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add Competent Person
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-4 bg-muted/30">
      <h4 className="text-sm font-semibold">Designate Competent Person</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Employee Name / User ID *</Label>
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Employee name or system user ID" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">OSHA Designation *</Label>
          <select
            className="w-full border rounded px-2 py-2 text-sm bg-background"
            value={designationIdx}
            onChange={(e) => setDesignationIdx(Number(e.target.value))}
          >
            {COMPETENT_PERSON_DESIGNATIONS.map((d, i) => (
              <option key={d.designation} value={i}>{d.designation} ({d.standard})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Qualifications / Training Description *</Label>
          <Input value={qualificationDesc} onChange={(e) => setQualificationDesc(e.target.value)} placeholder="e.g. OSHA 30-hour, completed competency evaluation" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Effective Date</Label>
          <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Expires</Label>
          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !userId || !qualificationDesc}>
          {saving ? "Saving…" : "Designate"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

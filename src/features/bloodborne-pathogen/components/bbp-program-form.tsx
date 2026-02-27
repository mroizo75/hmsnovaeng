"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBbpProgram, updateBbpProgram } from "@/server/actions/bbp.actions";
import { Plus, Pencil } from "lucide-react";

type Program = {
  id: string;
  exposedPositions: { jobTitle: string; tasks: string[] }[];
  engineeringControls: { control: string; location: string }[];
  workPracticeControls: string[];
  ppe: { item: string; when: string }[];
  decontaminationPlan: string | null;
  wasteDisposalPlan: string | null;
  notes: string | null;
} | null;

export function BbpProgramForm({ tenantId, activeProgram }: { tenantId: string; activeProgram: Program }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simple text-area driven fields for usability
  const [exposedPositions, setExposedPositions] = useState(
    activeProgram?.exposedPositions.map((p) => `${p.jobTitle}: ${p.tasks.join(", ")}`).join("\n") ?? ""
  );
  const [engineeringControls, setEngineeringControls] = useState(
    activeProgram?.engineeringControls.map((c) => `${c.control} @ ${c.location}`).join("\n") ?? ""
  );
  const [workPracticeControls, setWorkPracticeControls] = useState(
    activeProgram?.workPracticeControls.join("\n") ?? ""
  );
  const [ppeItems, setPpeItems] = useState(
    activeProgram?.ppe.map((p) => `${p.item}: ${p.when}`).join("\n") ?? ""
  );
  const [decontaminationPlan, setDecontaminationPlan] = useState(activeProgram?.decontaminationPlan ?? "");
  const [wasteDisposalPlan, setWasteDisposalPlan] = useState(activeProgram?.wasteDisposalPlan ?? "");
  const [notes, setNotes] = useState(activeProgram?.notes ?? "");

  function parseExposedPositions(raw: string) {
    return raw.split("\n").filter(Boolean).map((line) => {
      const [jobTitle, ...rest] = line.split(":");
      const tasks = rest.join(":").split(",").map((t) => t.trim()).filter(Boolean);
      return { jobTitle: jobTitle.trim(), tasks: tasks.length ? tasks : ["General exposure tasks"] };
    });
  }

  function parseEngineeringControls(raw: string) {
    return raw.split("\n").filter(Boolean).map((line) => {
      const parts = line.split("@");
      return { control: parts[0].trim(), location: (parts[1] ?? "General area").trim() };
    });
  }

  function parsePpe(raw: string) {
    return raw.split("\n").filter(Boolean).map((line) => {
      const parts = line.split(":");
      return { item: parts[0].trim(), when: (parts[1] ?? "When exposure risk exists").trim() };
    });
  }

  async function handleSubmit() {
    const positions = parseExposedPositions(exposedPositions);
    const controls = parseEngineeringControls(engineeringControls);
    const wpc = workPracticeControls.split("\n").filter(Boolean);
    const ppe = parsePpe(ppeItems);

    if (!positions.length || !controls.length || !wpc.length) return;

    setSaving(true);
    try {
      if (activeProgram) {
        await updateBbpProgram({
          id: activeProgram.id,
          exposedPositions: positions,
          engineeringControls: controls,
          workPracticeControls: wpc,
          ppe,
          decontaminationPlan: decontaminationPlan || undefined,
          wasteDisposalPlan: wasteDisposalPlan || undefined,
          notes: notes || undefined,
        });
      } else {
        await createBbpProgram({
          tenantId,
          effectiveDate: new Date(),
          exposedPositions: positions,
          engineeringControls: controls,
          workPracticeControls: wpc,
          ppe,
          decontaminationPlan: decontaminationPlan || undefined,
          wasteDisposalPlan: wasteDisposalPlan || undefined,
          notes: notes || undefined,
        });
      }
      router.refresh();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {activeProgram
          ? <><Pencil className="h-3 w-3 mr-1" /> Edit Plan</>
          : <><Plus className="h-3 w-3 mr-1" /> Create Exposure Control Plan</>}
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-4 bg-muted/30">
      <h4 className="text-sm font-semibold">{activeProgram ? "Update" : "Create"} Exposure Control Plan</h4>
      <p className="text-xs text-muted-foreground">
        Use one entry per line. Format: <em>JobTitle: task1, task2</em> for positions; <em>Control @ Location</em> for engineering controls; <em>PPE item: when to use</em> for PPE.
      </p>
      <div className="space-y-1">
        <Label className="text-xs">Exposed Job Positions * (one per line: "Nurse: patient care, phlebotomy")</Label>
        <Textarea value={exposedPositions} onChange={(e) => setExposedPositions(e.target.value)} rows={3}
          placeholder={"Nurse: patient care, phlebotomy\nLab Technician: specimen handling"} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Engineering Controls * (one per line: "Sharps container @ Patient room")</Label>
        <Textarea value={engineeringControls} onChange={(e) => setEngineeringControls(e.target.value)} rows={3}
          placeholder={"Sharps containers @ All patient rooms\nBiohazard waste bins @ Lab"} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Work Practice Controls * (one per line)</Label>
        <Textarea value={workPracticeControls} onChange={(e) => setWorkPracticeControls(e.target.value)} rows={3}
          placeholder={"Prohibit recapping of needles\nWash hands immediately after removing gloves\nProhibit eating or drinking in work area"} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">PPE Required (one per line: "Gloves: when handling specimens")</Label>
        <Textarea value={ppeItems} onChange={(e) => setPpeItems(e.target.value)} rows={2}
          placeholder={"Gloves: when handling specimens\nFace shield: during procedures with splash risk"} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Decontamination Plan</Label>
          <Textarea value={decontaminationPlan} onChange={(e) => setDecontaminationPlan(e.target.value)} rows={2}
            placeholder="Describe decontamination procedures…" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Waste Disposal Plan</Label>
          <Textarea value={wasteDisposalPlan} onChange={(e) => setWasteDisposalPlan(e.target.value)} rows={2}
            placeholder="Describe regulated waste disposal procedures…" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes…" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={saving || !exposedPositions || !engineeringControls || !workPracticeControls}>
          {saving ? "Saving…" : "Save Plan"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

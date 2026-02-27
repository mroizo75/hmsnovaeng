"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createPpeAssessment } from "@/server/actions/ppe.actions";
import { FileAttachment, type UploadedFile } from "@/components/ui/file-attachment";

const HAZARD_OPTIONS = [
  "Impact / struck-by", "Penetration", "Compression", "Chemical exposure",
  "Heat / burns", "Electrical", "Noise / hearing loss", "Radiation",
  "Biological / bloodborne", "Falling objects", "Fall from elevation",
  "Respiratory hazards", "Eye / face hazards",
];

const PPE_OPTIONS = [
  "Hard hat (Type I / II)", "Safety glasses", "Safety goggles", "Face shield",
  "Hearing protection (plugs)", "Hearing protection (muffs)", "Gloves (leather)",
  "Gloves (chemical resistant)", "Safety footwear (steel toe)", "High-vis vest",
  "Fall arrest harness", "Respirator (N95)", "Respirator (half-face)", "Chemical-resistant apron",
  "Flame-resistant clothing", "Arc flash PPE",
];

export function PpeAssessmentForm({ tenantId, assessedBy }: { tenantId: string; assessedBy: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [hazards, setHazards] = useState<string[]>([]);
  const [required, setRequired] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function handleSubmit() {
    if (!workArea || hazards.length === 0 || required.length === 0) return;
    setSaving(true);
    try {
      await createPpeAssessment({
        tenantId,
        jobTitle: jobTitle || undefined,
        workArea,
        hazardsFound: hazards.map((h) => ({
          hazard: h,
          type: h.toLowerCase().includes("chemical") ? "CHEMICAL" as const
            : h.toLowerCase().includes("electrical") ? "ELECTRICAL" as const
            : h.toLowerCase().includes("biological") ? "BIOLOGICAL" as const
            : "PHYSICAL" as const,
        })),
        ppeRequired: required.map((p) => ({ type: p })),
        assessedBy,
        assessedAt: new Date(),
      });
      router.push("/dashboard/ppe");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Assessment Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Job Title / Classification *</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Maintenance Technician" />
            </div>
            <div className="space-y-1">
              <Label>Work Area / Department *</Label>
              <Input value={workArea} onChange={(e) => setWorkArea(e.target.value)} placeholder="e.g. Production Floor, Building A" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hazards Identified</CardTitle>
          <p className="text-xs text-muted-foreground">Select all applicable hazards present in this work area</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {HAZARD_OPTIONS.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <Checkbox
                  id={`hazard-${h}`}
                  checked={hazards.includes(h)}
                  onCheckedChange={() => toggleItem(hazards, h, setHazards)}
                />
                <Label htmlFor={`hazard-${h}`} className="text-sm font-normal cursor-pointer">{h}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PPE Required</CardTitle>
          <p className="text-xs text-muted-foreground">Select all PPE required for this job title based on hazards above</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PPE_OPTIONS.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <Checkbox
                  id={`ppe-${p}`}
                  checked={required.includes(p)}
                  onCheckedChange={() => toggleItem(required, p, setRequired)}
                />
                <Label htmlFor={`ppe-${p}`} className="text-sm font-normal cursor-pointer">{p}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <p className="text-xs text-muted-foreground">Optional: attach the signed certification or supporting documents</p>
        </CardHeader>
        <CardContent>
          <FileAttachment
            folder="ppe"
            label="Attach Certification"
            onUpload={(f) => setAttachments((prev) => [...prev, f])}
            onRemove={(key) => setAttachments((prev) => prev.filter((f) => f.key !== key))}
            existingFiles={attachments}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving || !jobTitle || !workArea}>
          {saving ? "Saving…" : "Create & Certify Assessment"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/ppe")}>Cancel</Button>
      </div>
    </div>
  );
}

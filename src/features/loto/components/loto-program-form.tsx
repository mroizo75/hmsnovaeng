"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLotoProgram } from "@/server/actions/loto.actions";
import { FileAttachment, type UploadedFile } from "@/components/ui/file-attachment";

export function LotoProgramForm({ tenantId }: { tenantId: string; createdBy: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [programName, setProgramName] = useState("");
  const [scope, setScope] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  async function handleSubmit() {
    if (!programName || !scope) return;
    setSaving(true);
    try {
      const program = await createLotoProgram({
        tenantId,
        programName,
        effectiveDate: new Date(effectiveDate),
        scope,
        notes: notes || undefined,
      });
      if (program?.id) {
        router.push(`/dashboard/loto/${program.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Program Name *</Label>
          <Input value={programName} onChange={(e) => setProgramName(e.target.value)} placeholder="e.g. Facility Energy Control Program" />
        </div>
        <div className="space-y-1">
          <Label>Effective Date *</Label>
          <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Scope / Purpose *</Label>
          <Textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={4}
            placeholder="Describe the purpose and scope of this LOTO program, which equipment is covered, and the specific energy control procedures and techniques…"
          />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes or references…" />
        </div>
        <div className="space-y-1">
          <Label>Attachments (Written program document, SOP)</Label>
          <FileAttachment
            folder="loto"
            label="Attach Document"
            onUpload={(f) => setAttachments((prev) => [...prev, f])}
            onRemove={(key) => setAttachments((prev) => prev.filter((f) => f.key !== key))}
            existingFiles={attachments}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={saving || !programName || !scope}>
            {saving ? "Creating…" : "Create Program"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/loto")}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

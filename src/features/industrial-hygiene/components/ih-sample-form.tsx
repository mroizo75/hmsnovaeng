"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileAttachment, type UploadedFile } from "@/components/ui/file-attachment";

type Props = { programId: string; pel?: number | null; al?: number | null; unit?: string | null };

export function IhSampleForm({ programId, pel, al, unit }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [report, setReport] = useState<UploadedFile | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const form = e.currentTarget;
    const data = new FormData(form);
    const result = Number(data.get("result"));

    const payload = {
      programId,
      sampledAt: data.get("sampledAt") as string,
      sampledBy: data.get("sampledBy") as string,
      employeeName: (data.get("employeeName") as string) || undefined,
      jobTitle: (data.get("jobTitle") as string) || undefined,
      workArea: data.get("workArea") as string,
      sampleType: data.get("sampleType") as string,
      result,
      exceedsPel: pel != null ? result > pel : false,
      exceedsAl: al != null ? result > al : false,
      labName: (data.get("labName") as string) || undefined,
      labSampleId: (data.get("labSampleId") as string) || undefined,
      reportKey: report?.key,
      notes: (data.get("notes") as string) || undefined,
    };

    const res = await fetch(`/api/industrial-hygiene/programs/${programId}/samples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save sample.");
      return;
    }

    setSuccess(true);
    form.reset();
    setReport(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Sample Result</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {error && <div className="sm:col-span-2 rounded bg-red-50 border border-red-300 p-3 text-xs text-red-800">{error}</div>}
          {success && <div className="sm:col-span-2 rounded bg-green-50 border border-green-300 p-3 text-xs text-green-800">Sample recorded.</div>}

          <div className="space-y-1">
            <Label htmlFor="sampledAt">Sample Date *</Label>
            <Input id="sampledAt" name="sampledAt" type="date" required defaultValue={new Date().toISOString().substring(0, 10)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sampledBy">Sampled By *</Label>
            <Input id="sampledBy" name="sampledBy" required placeholder="Industrial Hygienist name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="workArea">Work Area *</Label>
            <Input id="workArea" name="workArea" required placeholder="e.g. Grinding Station A" />
          </div>
          <div className="space-y-1">
            <Label>Sample Type *</Label>
            <Select name="sampleType" required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal (worker-worn)</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bulk">Bulk / Wipe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="employeeName">Employee Sampled</Label>
            <Input id="employeeName" name="employeeName" placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" name="jobTitle" placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="result">Result {unit ? `(${unit})` : ""} *</Label>
            <Input id="result" name="result" type="number" step="any" required placeholder="0.00" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            {pel != null && (
              <p className="text-xs text-muted-foreground">
                PEL: {pel} {unit} — values above this require immediate corrective action.
                {al != null && ` Action Level: ${al} ${unit}.`}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="labName">Laboratory</Label>
            <Input id="labName" name="labName" placeholder="e.g. Bureau Veritas" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="labSampleId">Lab Sample ID</Label>
            <Input id="labSampleId" name="labSampleId" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Attach Lab Report</Label>
            <FileAttachment
              folder="osha"
              label="Attach Lab Report"
              onUpload={(f) => setReport(f)}
              onRemove={() => setReport(null)}
              existingFiles={report ? [report] : []}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving…" : "Record Sample"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

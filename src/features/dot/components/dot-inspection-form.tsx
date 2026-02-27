"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileAttachment, type UploadedFile } from "@/components/ui/file-attachment";

type Props = { tenantId: string };

const INSP_TYPES = [
  { value: "PRE_TRIP", label: "Pre-Trip" },
  { value: "POST_TRIP", label: "Post-Trip" },
  { value: "ANNUAL", label: "Annual (49 CFR 396.17)" },
  { value: "ROADSIDE", label: "Roadside" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export function DotInspectionForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passed, setPassed] = useState(true);
  const [attachment, setAttachment] = useState<UploadedFile | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      tenantId,
      vehicleUnit: data.get("vehicleUnit") as string,
      vin: (data.get("vin") as string) || undefined,
      inspType: data.get("inspType") as string,
      inspectedAt: data.get("inspectedAt") as string,
      inspectedBy: data.get("inspectedBy") as string,
      passed,
      odometer: data.get("odometer") ? Number(data.get("odometer")) : undefined,
      nextDue: (data.get("nextDue") as string) || undefined,
      notes: (data.get("notes") as string) || undefined,
      documentKey: attachment?.key,
    };

    const res = await fetch("/api/dot/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save inspection.");
      return;
    }

    router.push("/dashboard/dot/inspections");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-800">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Vehicle Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="vehicleUnit">Unit Number *</Label>
            <Input id="vehicleUnit" name="vehicleUnit" required placeholder="Unit 101" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" name="vin" placeholder="1HGCM82633A004352" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="odometer">Odometer (miles)</Label>
            <Input id="odometer" name="odometer" type="number" min={0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Inspection Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Inspection Type *</Label>
            <Select name="inspType" required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {INSP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="inspectedAt">Inspection Date *</Label>
            <Input id="inspectedAt" name="inspectedAt" type="date" required defaultValue={new Date().toISOString().substring(0, 10)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inspectedBy">Inspected By *</Label>
            <Input id="inspectedBy" name="inspectedBy" required placeholder="Inspector name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="nextDue">Next Inspection Due</Label>
            <Input id="nextDue" name="nextDue" type="date" />
          </div>
          <div className="flex items-center gap-3 pt-1 sm:col-span-2">
            <Switch checked={passed} onCheckedChange={setPassed} id="passed" />
            <Label htmlFor="passed">{passed ? "Passed — no defects" : "Failed — defects found"}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes &amp; Defects</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea name="notes" placeholder="Describe any defects, repairs needed, or additional notes…" rows={4} />
          <div className="space-y-1">
            <Label>Attach Inspection Report</Label>
            <FileAttachment
              folder="dot"
              label="Attach Report"
              onUpload={(f) => setAttachment(f)}
              onRemove={() => setAttachment(null)}
              existingFiles={attachment ? [attachment] : []}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Inspection"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

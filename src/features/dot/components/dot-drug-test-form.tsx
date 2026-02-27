"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Driver = { id: string; employeeName: string };
type Props = { tenantId: string; drivers: Driver[] };

const TEST_TYPES = [
  { value: "PRE_EMPLOYMENT", label: "Pre-Employment" },
  { value: "RANDOM", label: "Random" },
  { value: "POST_ACCIDENT", label: "Post-Accident" },
  { value: "REASONABLE_SUSPICION", label: "Reasonable Suspicion" },
  { value: "RETURN_TO_DUTY", label: "Return to Duty" },
  { value: "FOLLOW_UP", label: "Follow-Up" },
];

const TEST_RESULTS = [
  { value: "NEGATIVE", label: "Negative" },
  { value: "POSITIVE", label: "Positive" },
  { value: "REFUSED", label: "Refused" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "INVALID", label: "Invalid" },
];

export function DotDrugTestForm({ tenantId, drivers }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      tenantId,
      driverId: data.get("driverId") as string,
      testType: data.get("testType") as string,
      testedAt: data.get("testedAt") as string,
      result: data.get("result") as string,
      substanceTested: (data.get("substanceTested") as string) || undefined,
      specimenId: (data.get("specimenId") as string) || undefined,
      mroName: (data.get("mroName") as string) || undefined,
      collectionSite: (data.get("collectionSite") as string) || undefined,
      notes: (data.get("notes") as string) || undefined,
    };

    const res = await fetch("/api/dot/drug-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save test record.");
      return;
    }

    setSuccess(true);
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Record Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="rounded bg-red-50 border border-red-300 p-3 text-xs text-red-800">{error}</div>}
          {success && <div className="rounded bg-green-50 border border-green-300 p-3 text-xs text-green-800">Test recorded successfully.</div>}

          <div className="space-y-1">
            <Label>Driver *</Label>
            <Select name="driverId" required>
              <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.employeeName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Test Type *</Label>
            <Select name="testType" required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="testedAt">Test Date *</Label>
            <Input id="testedAt" name="testedAt" type="date" required defaultValue={new Date().toISOString().substring(0, 10)} />
          </div>
          <div className="space-y-1">
            <Label>Result *</Label>
            <Select name="result" required>
              <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
              <SelectContent>
                {TEST_RESULTS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="substanceTested">Substances Tested</Label>
            <Input id="substanceTested" name="substanceTested" placeholder="DOT 5-Panel" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="specimenId">Specimen ID</Label>
            <Input id="specimenId" name="specimenId" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mroName">Medical Review Officer (MRO)</Label>
            <Input id="mroName" name="mroName" placeholder="Dr. Jane Doe" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="collectionSite">Collection Site</Label>
            <Input id="collectionSite" name="collectionSite" placeholder="Quest Diagnostics — 123 Main St" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save Test Record"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

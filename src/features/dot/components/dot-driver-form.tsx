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

type Props = { tenantId: string };

const CDL_CLASSES = ["A", "B", "C"];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export function DotDriverForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hazmat, setHazmat] = useState(false);
  const [drugEnrolled, setDrugEnrolled] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      tenantId,
      employeeName: data.get("employeeName") as string,
      employeeId: (data.get("employeeId") as string) || undefined,
      cdlNumber: (data.get("cdlNumber") as string) || undefined,
      cdlClass: (data.get("cdlClass") as string) || undefined,
      cdlState: (data.get("cdlState") as string) || undefined,
      cdlExpires: (data.get("cdlExpires") as string) || undefined,
      medicalCertExpires: (data.get("medicalCertExpires") as string) || undefined,
      hireDate: (data.get("hireDate") as string) || undefined,
      drugTestingEnrolled: drugEnrolled,
      hazmatEndorsement: hazmat,
      notes: (data.get("notes") as string) || undefined,
    };

    const res = await fetch("/api/dot/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save driver.");
      return;
    }

    router.push("/dashboard/dot/drivers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-800">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Driver Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="employeeName">Full Name *</Label>
            <Input id="employeeName" name="employeeName" required placeholder="John Smith" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="employeeId">Employee / Badge ID</Label>
            <Input id="employeeId" name="employeeId" placeholder="EMP-001" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hireDate">Hire Date</Label>
            <Input id="hireDate" name="hireDate" type="date" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Commercial Driver's License (CDL)</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="cdlNumber">CDL Number</Label>
            <Input id="cdlNumber" name="cdlNumber" placeholder="D123456789" />
          </div>
          <div className="space-y-1">
            <Label>CDL Class</Label>
            <Select name="cdlClass">
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {CDL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Issuing State</Label>
            <Select name="cdlState">
              <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cdlExpires">CDL Expiration Date</Label>
            <Input id="cdlExpires" name="cdlExpires" type="date" />
          </div>
          <div className="flex items-center gap-3 pt-1 sm:col-span-2">
            <Switch checked={hazmat} onCheckedChange={setHazmat} id="hazmat" />
            <Label htmlFor="hazmat">HazMat Endorsement</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>DOT Medical Certificate</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="medicalCertExpires">Medical Certificate Expiration</Label>
            <Input id="medicalCertExpires" name="medicalCertExpires" type="date" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch checked={drugEnrolled} onCheckedChange={setDrugEnrolled} id="drugEnrolled" />
            <Label htmlFor="drugEnrolled">Enrolled in Drug &amp; Alcohol Testing Program</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea name="notes" placeholder="Additional qualifications, endorsements, or notes…" rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Driver"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

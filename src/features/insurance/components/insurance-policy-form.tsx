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

type Props = { tenantId: string };

const POLICY_TYPES = [
  { value: "workers_comp", label: "Workers' Compensation" },
  { value: "general_liability", label: "General Liability" },
  { value: "property", label: "Commercial Property" },
  { value: "umbrella", label: "Umbrella / Excess Liability" },
  { value: "auto", label: "Commercial Auto" },
  { value: "professional_liability", label: "Professional Liability (E&O)" },
  { value: "cyber", label: "Cyber Liability" },
  { value: "epli", label: "EPLI (Employment Practices)" },
];

export function InsurancePolicyForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<UploadedFile | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      tenantId,
      carrier: data.get("carrier") as string,
      policyNumber: data.get("policyNumber") as string,
      policyType: data.get("policyType") as string,
      effectiveDate: data.get("effectiveDate") as string,
      expirationDate: data.get("expirationDate") as string,
      premiumAmount: data.get("premiumAmount") ? Number(data.get("premiumAmount")) : undefined,
      deductible: data.get("deductible") ? Number(data.get("deductible")) : undefined,
      coverageLimit: data.get("coverageLimit") ? Number(data.get("coverageLimit")) : undefined,
      agentName: (data.get("agentName") as string) || undefined,
      agentPhone: (data.get("agentPhone") as string) || undefined,
      agentEmail: (data.get("agentEmail") as string) || undefined,
      notes: (data.get("notes") as string) || undefined,
      documentKey: document?.key,
    };

    const res = await fetch("/api/insurance/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save policy.");
      return;
    }

    router.push("/dashboard/insurance");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded bg-red-50 border border-red-300 p-3 text-sm text-red-800">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Policy Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="carrier">Insurance Carrier *</Label>
            <Input id="carrier" name="carrier" required placeholder="e.g. Travelers, Liberty Mutual" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="policyNumber">Policy Number *</Label>
            <Input id="policyNumber" name="policyNumber" required placeholder="WC-123456-00" />
          </div>
          <div className="space-y-1">
            <Label>Policy Type *</Label>
            <Select name="policyType" required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {POLICY_TYPES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1" />
          <div className="space-y-1">
            <Label htmlFor="effectiveDate">Effective Date *</Label>
            <Input id="effectiveDate" name="effectiveDate" type="date" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="expirationDate">Expiration Date *</Label>
            <Input id="expirationDate" name="expirationDate" type="date" required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Financial Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="premiumAmount">Annual Premium ($)</Label>
            <Input id="premiumAmount" name="premiumAmount" type="number" step="0.01" min={0} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductible">Deductible ($)</Label>
            <Input id="deductible" name="deductible" type="number" step="0.01" min={0} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="coverageLimit">Coverage Limit ($)</Label>
            <Input id="coverageLimit" name="coverageLimit" type="number" step="0.01" min={0} placeholder="0.00" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Agent / Broker Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-3">
            <Label htmlFor="agentName">Agent / Broker Name</Label>
            <Input id="agentName" name="agentName" placeholder="John Smith" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="agentPhone">Phone</Label>
            <Input id="agentPhone" name="agentPhone" type="tel" placeholder="(555) 000-0000" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="agentEmail">Email</Label>
            <Input id="agentEmail" name="agentEmail" type="email" placeholder="agent@example.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes &amp; Documents</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea name="notes" placeholder="Coverage notes, exclusions, endorsements…" rows={3} />
          <div className="space-y-1">
            <Label>Attach Policy Document</Label>
            <FileAttachment
              folder="incidents"
              label="Attach Policy PDF"
              onUpload={(f) => setDocument(f)}
              onRemove={() => setDocument(null)}
              existingFiles={document ? [document] : []}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Policy"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

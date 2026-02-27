"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = { tenantId: string };

const HAZARD_TYPES = [
  { value: "CHEMICAL", label: "Chemical" },
  { value: "NOISE", label: "Noise" },
  { value: "HEAT", label: "Heat Stress" },
  { value: "RADIATION", label: "Radiation" },
  { value: "BIOLOGICAL", label: "Biological" },
  { value: "ERGONOMIC", label: "Ergonomic" },
  { value: "DUST", label: "Dust / Particulates" },
  { value: "VIBRATION", label: "Vibration" },
];

const FREQUENCIES = [
  "Monthly", "Quarterly", "Semi-Annual", "Annual", "Biennial", "As needed",
];

const COMMON_AGENTS = {
  CHEMICAL: ["Benzene", "Lead", "Silica (crystalline)", "Asbestos", "Hexavalent Chromium", "Isocyanates", "Methylene Chloride", "Formaldehyde"],
  NOISE: ["Occupational Noise (8-hr TWA)"],
  HEAT: ["WBGT (Wet Bulb Globe Temperature)", "Heat Index"],
  RADIATION: ["Ionizing Radiation", "UV Radiation"],
  BIOLOGICAL: ["Bloodborne Pathogens", "Mold / Fungi", "Bacteria"],
  ERGONOMIC: ["Manual Lifting", "Repetitive Motion"],
  DUST: ["Respirable Dust", "Total Dust", "Coal Dust", "Wood Dust"],
  VIBRATION: ["Hand-Arm Vibration", "Whole-Body Vibration"],
};

export function IhProgramForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hazardType, setHazardType] = useState<keyof typeof COMMON_AGENTS>("CHEMICAL");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      tenantId,
      programName: data.get("programName") as string,
      hazardType: data.get("hazardType") as string,
      agentName: data.get("agentName") as string,
      oshaStandard: (data.get("oshaStandard") as string) || undefined,
      pel: data.get("pel") ? Number(data.get("pel")) : undefined,
      al: data.get("al") ? Number(data.get("al")) : undefined,
      stel: data.get("stel") ? Number(data.get("stel")) : undefined,
      unit: (data.get("unit") as string) || undefined,
      frequency: (data.get("frequency") as string) || undefined,
    };

    const res = await fetch("/api/industrial-hygiene/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to create program.");
      return;
    }

    router.push("/dashboard/industrial-hygiene");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded bg-red-50 border border-red-300 p-3 text-sm text-red-800">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Program Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="programName">Program Name *</Label>
            <Input id="programName" name="programName" required placeholder="e.g. Silica Monitoring Program" />
          </div>
          <div className="space-y-1">
            <Label>Hazard Type *</Label>
            <Select name="hazardType" required onValueChange={(v) => setHazardType(v as keyof typeof COMMON_AGENTS)}>
              <SelectTrigger><SelectValue placeholder="Select hazard type" /></SelectTrigger>
              <SelectContent>
                {HAZARD_TYPES.map((h) => (
                  <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Agent / Substance *</Label>
            <Select name="agentName" required>
              <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
              <SelectContent>
                {(COMMON_AGENTS[hazardType] ?? []).map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="oshaStandard">OSHA Standard (CFR)</Label>
            <Input id="oshaStandard" name="oshaStandard" placeholder="e.g. 29 CFR 1910.1053" />
          </div>
          <div className="space-y-1">
            <Label>Monitoring Frequency</Label>
            <Select name="frequency">
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Exposure Limits</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="unit">Unit of Measurement</Label>
            <Input id="unit" name="unit" placeholder="e.g. mg/m³, ppm, dBA, °F" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pel">PEL (Permissible Exposure Limit)</Label>
            <Input id="pel" name="pel" type="number" step="any" placeholder="e.g. 50" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al">Action Level (AL)</Label>
            <Input id="al" name="al" type="number" step="any" placeholder="e.g. 25" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stel">STEL (Short-Term Exposure Limit)</Label>
            <Input id="stel" name="stel" type="number" step="any" placeholder="e.g. 250" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Create Program"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

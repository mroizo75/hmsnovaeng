"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMileageEntry } from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  code: string | null;
}

interface MileageEntryFormProps {
  tenantId: string;
  projects: Project[];
  defaultKmRate: number;
  defaultDate?: Date;
  rateEditable?: boolean;
  showDisclaimer?: boolean;
}

export function MileageEntryForm({
  tenantId,
  projects,
  defaultKmRate,
  defaultDate = new Date(),
  rateEditable = true,
  showDisclaimer = false,
}: MileageEntryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(format(defaultDate, "yyyy-MM-dd"));
  const [projectId, setProjectId] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [ratePerKm, setRatePerKm] = useState(String(defaultKmRate));
  const [comment, setComment] = useState("");

  const km = parseFloat(kilometers.replace(",", ".")) || 0;
  const rate = parseFloat(ratePerKm.replace(",", ".")) || defaultKmRate;
  const estimatedTotal = km > 0 ? (km * rate).toFixed(2) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast({ variant: "destructive", title: "Please select a project" });
      return;
    }
    if (isNaN(km) || km <= 0) {
      toast({ variant: "destructive", title: "Please enter valid mileage" });
      return;
    }
    setLoading(true);
    try {
      const res = await createMileageEntry({
        tenantId,
        projectId,
        date: new Date(date),
        kilometers: km,
        ratePerKm: rateEditable ? rate : defaultKmRate,
        comment: comment.trim() || undefined,
      });
      if (!res.success) throw new Error(res.error);
      toast({
        title: "Mileage registered",
        description: estimatedTotal ? `${km} mi · Est. $${estimatedTotal}` : `${km} miles`,
      });
      router.refresh();
      setDate(format(new Date(), "yyyy-MM-dd"));
      setProjectId("");
      setKilometers("");
      setComment("");
    } catch (err) {
      toast({ variant: "destructive", title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showDisclaimer && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 leading-relaxed">
          Mileage reimbursement is only applicable if agreed upon with your employer. Only enter mileage if this arrangement has been confirmed.
        </div>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 text-base w-full"
        />
      </div>

      {/* Project */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          Project <span className="text-red-500">*</span>
        </Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="h-12 text-base w-full">
            <SelectValue placeholder="Select project…" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.code ? `${p.code} – ` : ""}
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Miles + rate row */}
      <div className={rateEditable ? "grid grid-cols-2 gap-3" : ""}>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            Miles <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            value={kilometers}
            onChange={(e) => setKilometers(e.target.value)}
            placeholder="120"
            min="0.1"
            step="0.1"
            className="h-12 text-base"
          />
        </div>
        {rateEditable && (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Rate ($/mi)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={ratePerKm}
              onChange={(e) => setRatePerKm(e.target.value)}
              placeholder={String(defaultKmRate)}
              min="0.01"
              step="0.01"
              className="h-12 text-base"
            />
          </div>
        )}
      </div>

      {/* Estimated total */}
      {estimatedTotal && (
        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-sm text-green-800 font-medium">Estimated reimbursement</span>
          <span className="text-base font-bold text-green-700">${estimatedTotal}</span>
        </div>
      )}

      {!rateEditable && (
        <p className="text-xs text-muted-foreground">
          Rate: ${defaultKmRate}/mi — set by manager
        </p>
      )}

      {/* Comment */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          Comment <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </Label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="E.g.: Client visit – downtown office"
          className="h-12 text-base"
        />
      </div>

      <Button type="submit" variant="outline" disabled={loading} className="w-full h-12 text-base">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registering…
          </>
        ) : (
          "Register Mileage"
        )}
      </Button>
    </form>
  );
}

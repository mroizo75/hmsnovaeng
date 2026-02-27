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
  /** When false: hides $/mile (admin has set rate), for employee */
  rateEditable?: boolean;
  /** Show explanation that mileage reimbursement is an add-on that must be agreed upon */
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(kilometers.replace(",", "."));
    if (!projectId || isNaN(km) || km <= 0) {
      toast({ variant: "destructive", title: "Please fill in project and mileage" });
      return;
    }
    setLoading(true);
    try {
      const res = await createMileageEntry({
        tenantId,
        projectId,
        date: new Date(date),
        kilometers: km,
        ratePerKm: rateEditable
          ? parseFloat(ratePerKm.replace(",", ".")) || undefined
          : defaultKmRate,
        comment: comment.trim() || undefined,
      });
      if (!res.success) throw new Error(res.error);
      toast({ title: "Mileage reimbursement registered" });
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
    <div className="space-y-3">
      {showDisclaimer && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
          Mileage reimbursement is an add-on that must be agreed upon with your employer. Only enter mileage if this has been agreed upon.
        </p>
      )}
      {!rateEditable && (
        <p className="text-xs text-muted-foreground">
          Rate: ${defaultKmRate}/mi (set by manager)
        </p>
      )}
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-36"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Project</Label>
        <Select value={projectId} onValueChange={setProjectId} required>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.code ? `${p.code} – ` : ""}{p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Miles</Label>
        <Input
          type="text"
          value={kilometers}
          onChange={(e) => setKilometers(e.target.value)}
          placeholder="120"
          className="w-24"
        />
      </div>
      {rateEditable && (
        <div className="space-y-1">
          <Label className="text-xs">$/mile</Label>
          <Input
            type="text"
            value={ratePerKm}
            onChange={(e) => setRatePerKm(e.target.value)}
            placeholder={String(defaultKmRate)}
            className="w-20"
          />
        </div>
      )}
      <div className="space-y-1 flex-1 min-w-[120px]">
        <Label className="text-xs">Comment</Label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={loading}>
        {loading ? "..." : "Register mileage"}
      </Button>
    </form>
    </div>
  );
}

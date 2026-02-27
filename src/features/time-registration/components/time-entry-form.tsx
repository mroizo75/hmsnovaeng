"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTimeEntry } from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Briefcase, Car, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  code: string | null;
}

interface TimeEntryFormProps {
  tenantId: string;
  projects: Project[];
  defaultDate?: Date;
  lunchBreakMinutes?: number;
  eveningOvertimeFromHour?: number | null;
}

export function TimeEntryForm({
  tenantId,
  projects,
  defaultDate = new Date(),
  lunchBreakMinutes = 30,
  eveningOvertimeFromHour,
}: TimeEntryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"work" | "travel">("work");
  const [date, setDate] = useState(format(defaultDate, "yyyy-MM-dd"));
  const [projectId, setProjectId] = useState("");
  const [hours, setHours] = useState("8");
  const [workedAfterEvening, setWorkedAfterEvening] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours.replace(",", "."));
    if (!projectId) {
      toast({ variant: "destructive", title: "Please select a project" });
      return;
    }
    if (isNaN(h) || h <= 0) {
      toast({ variant: "destructive", title: "Please enter valid hours" });
      return;
    }
    setLoading(true);
    try {
      const res = await createTimeEntry({
        tenantId,
        projectId,
        date: new Date(date),
        hours: h,
        mode,
        workedUntilHour:
          mode === "work" && workedAfterEvening && eveningOvertimeFromHour != null
            ? eveningOvertimeFromHour
            : undefined,
        comment: comment.trim() || undefined,
      });
      if (!res.success) throw new Error(res.error);
      toast({
        title:
          mode === "work"
            ? "Hours registered"
            : "Travel time registered",
        description:
          mode === "work"
            ? `${h}h — regular & overtime distributed automatically`
            : `${h}h travel time`,
      });
      router.refresh();
      setDate(format(new Date(), "yyyy-MM-dd"));
      setProjectId("");
      setHours(mode === "work" ? "8" : "0.5");
      setComment("");
      setWorkedAfterEvening(false);
    } catch (err) {
      toast({ variant: "destructive", title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => { setMode("work"); setHours("8"); }}
          className={cn(
            "flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all",
            mode === "work"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Briefcase className="h-4 w-4" />
          Work Hours
        </button>
        <button
          type="button"
          onClick={() => { setMode("travel"); setHours("0.5"); }}
          className={cn(
            "flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all",
            mode === "travel"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Car className="h-4 w-4" />
          Travel / Drive
        </button>
      </div>

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

      {/* Hours */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          {mode === "travel" ? "Travel Hours" : "Hours"}
          {mode === "work" && (
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (lunch {lunchBreakMinutes}min deducted automatically)
            </span>
          )}
        </Label>
        <Input
          type="number"
          inputMode="decimal"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder={mode === "work" ? "8" : "0.5"}
          min="0.25"
          max="24"
          step="0.25"
          className="h-12 text-base w-full"
        />
      </div>

      {/* Evening overtime checkbox */}
      {mode === "work" && eveningOvertimeFromHour != null && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <Checkbox
            id="workedAfterEvening"
            checked={workedAfterEvening}
            onCheckedChange={(c) => setWorkedAfterEvening(!!c)}
            className="h-5 w-5"
          />
          <Label
            htmlFor="workedAfterEvening"
            className="text-sm font-medium cursor-pointer leading-snug"
          >
            Worked past {eveningOvertimeFromHour}:00
            <span className="block text-xs text-muted-foreground font-normal">
              Hours after this time count as 100% overtime
            </span>
          </Label>
        </div>
      )}

      {/* Comment */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          Comment <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </Label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="E.g.: Site work, client meeting…"
          className="h-12 text-base"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-base">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registering…
          </>
        ) : mode === "work" ? (
          "Register Hours"
        ) : (
          "Register Travel Time"
        )}
      </Button>
    </form>
  );
}

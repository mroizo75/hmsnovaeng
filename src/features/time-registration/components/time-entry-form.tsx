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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTimeEntry } from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Briefcase, Car, HelpCircle } from "lucide-react";

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
  /** From this hour (Mon–Fri) = 100% overtime. Null = all 50% */
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
  const [hours, setHours] = useState("7.5");
  const [workedAfterEvening, setWorkedAfterEvening] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours.replace(",", "."));
    if (!projectId || isNaN(h) || h <= 0) {
      toast({ variant: "destructive", title: "Please fill in project and hours" });
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
            ? "Hours registered (regular + overtime automatically distributed)"
            : "Travel time registered",
      });
      router.refresh();
      setDate(format(new Date(), "yyyy-MM-dd"));
      setProjectId("");
      setHours(mode === "work" ? "8" : "0.5");
      setComment("");
    } catch (err) {
      toast({ variant: "destructive", title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "work" | "travel")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="work" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            Work
          </TabsTrigger>
          <TabsTrigger value="travel" className="gap-1.5">
            <Car className="h-4 w-4" />
            Travel/driving
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-end gap-3">
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
          <Label className="text-xs flex items-center gap-1">
            {mode === "travel" ? "Travel Hours" : "Clock Hours"}
            {mode === "work" && (
              <span
                title={`8–16 = 8h, 8–20 = 12h. Lunch (${lunchBreakMinutes} min) deducted automatically.`}
                className="cursor-help inline-flex"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
          </Label>
          <Input
            type="text"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={mode === "work" ? "8" : "0.5"}
            className="w-20"
          />
        </div>
        {mode === "work" && eveningOvertimeFromHour != null && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="workedAfterEvening"
              checked={workedAfterEvening}
              onCheckedChange={(c) => setWorkedAfterEvening(!!c)}
            />
            <Label
              htmlFor="workedAfterEvening"
              className="text-xs font-normal cursor-pointer"
            >
              Work after {eveningOvertimeFromHour}:00 (100% overtime)
            </Label>
          </div>
        )}
        <div className="space-y-1 flex-1 min-w-[140px]">
          <Label className="text-xs">Comment</Label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "..." : "Register"}
        </Button>
      </div>
    </form>
  );
}

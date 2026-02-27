"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { updateTimeRegistrationConfig } from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";
import { Settings2 } from "lucide-react";

interface TimeRegistrationSettingsProps {
  tenantId: string;
  weeklyHoursNorm: number;
  lunchBreakMinutes: number;
  eveningOvertimeFromHour: number | null;
}

export function TimeRegistrationSettings({
  tenantId,
  weeklyHoursNorm,
  lunchBreakMinutes,
  eveningOvertimeFromHour,
}: TimeRegistrationSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lunch, setLunch] = useState(String(lunchBreakMinutes));
  const [eveningHour, setEveningHour] = useState<string>(
    eveningOvertimeFromHour != null ? String(eveningOvertimeFromHour) : "__none__"
  );

  useEffect(() => {
    setLunch(String(lunchBreakMinutes));
  }, [lunchBreakMinutes]);
  useEffect(() => {
    setEveningHour(
      eveningOvertimeFromHour != null ? String(eveningOvertimeFromHour) : "__none__"
    );
  }, [eveningOvertimeFromHour]);

  const handleSave = async () => {
    const lunchVal = parseInt(lunch, 10);
    if (isNaN(lunchVal) || lunchVal < 0 || lunchVal > 480) {
      toast({ variant: "destructive", title: "Lunch break must be 0–480 minutes" });
      return;
    }
    setLoading(true);
    try {
      const res = await updateTimeRegistrationConfig(tenantId, {
        lunchBreakMinutes: lunchVal,
        eveningOvertimeFromHour:
          eveningHour === "__none__" ? null : parseInt(eveningHour, 10),
      });
      if (!res.success) throw new Error(res.error);
      toast({ title: "Settings saved" });
      router.refresh();
    } catch (err) {
      toast({ variant: "destructive", title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5" />
          Overtime Rules
        </CardTitle>
        <CardDescription>
          Define how overtime is calculated. Employees only enter hours and travel – the system calculates the type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-xs">Lunch (min) – deducted from clock hours</Label>
          <Input
            type="number"
            min={0}
            max={480}
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            className="w-24"
          />
          <p className="text-xs text-muted-foreground">
            8–16 = 8h clock − 30 min lunch = 7.5h. 8–20 = 12h − 30 min = 11.5h (7.5 regular + 4 overtime).
          </p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Evening overtime 100% from</Label>
          <Select value={eveningHour} onValueChange={setEveningHour}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">All overtime 50%</SelectItem>
              <SelectItem value="18">18:00</SelectItem>
              <SelectItem value="19">19:00</SelectItem>
              <SelectItem value="20">20:00</SelectItem>
              <SelectItem value="21">21:00</SelectItem>
              <SelectItem value="22">22:00</SelectItem>
              <SelectItem value="23">23:00</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Work after selected time (Mon–Fri) = 100% overtime. Otherwise 50%. Weekend = 100%.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Daily norm: {weeklyHoursNorm / 5}h (from {weeklyHoursNorm}h/week)
        </div>
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? "..." : "Save rules"}
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { createMeasurement } from "@/server/actions/goal.actions";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";

interface MeasurementFormProps {
  goalId: string;
  goalTitle: string;
  unit?: string | null;
  userId: string;
  trigger?: React.ReactNode;
}

export function MeasurementForm({
  goalId,
  goalTitle,
  unit,
  userId,
  trigger,
}: MeasurementFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      goalId,
      value: parseFloat(formData.get("value") as string),
      measurementDate: formData.get("measurementDate") as string,
      measurementType: formData.get("measurementType") as string,
      comment: formData.get("comment") as string || undefined,
      measuredById: userId,
    };

    const result = await createMeasurement(data);

    if (result.success) {
      toast({
        title: "✅ Measurement recorded",
        description: "KPI value has been updated",
        className: "bg-green-50 border-green-200",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not record measurement",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Record Measurement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record KPI Measurement</DialogTitle>
          <DialogDescription>
            ISO 9001 - 9.1: Monitor and measure progress towards the goal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                📊 Goal: {goalTitle}
              </p>
              {unit && (
                <p className="text-sm text-blue-800">
                  Unit: {unit}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">Measured Value *</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                placeholder="e.g. 25.5"
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                The value that was measured
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurementDate">Measurement Date *</Label>
              <Input
                id="measurementDate"
                name="measurementDate"
                type="date"
                required
                disabled={loading}
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurementType">Measurement Type *</Label>
            <Select name="measurementType" required disabled={loading} defaultValue="MANUAL">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                <SelectItem value="CALCULATED">Calculated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              name="comment"
              rows={3}
              placeholder="Additional comments about the measurement..."
              disabled={loading}
            />
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-900 mb-2">
                💡 Tips:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Record measurements regularly to track progress</li>
                <li>Status is automatically updated based on progress</li>
                <li>Add a comment if the value is unexpected</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Measurement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { linkChemicalToRisk } from "@/server/actions/risk-chemical.actions";
import { Loader2 } from "lucide-react";

interface AddChemicalToRiskDialogProps {
  riskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChemicalToRiskDialog({
  riskId,
  open,
  onOpenChange,
}: AddChemicalToRiskDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [loadingChemicals, setLoadingChemicals] = useState(true);

  const [formData, setFormData] = useState({
    chemicalId: "",
    exposure: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    ppRequired: false,
    note: "",
  });

  useEffect(() => {
    if (open) {
      loadChemicals();
    }
  }, [open]);

  const loadChemicals = async () => {
    try {
      setLoadingChemicals(true);
      const response = await fetch("/api/chemicals");
      if (response.ok) {
        const data = await response.json();
        setChemicals(data.chemicals || []);
      }
    } catch (error) {
      console.error("Failed to load chemicals:", error);
    } finally {
      setLoadingChemicals(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chemicalId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Select a chemical",
      });
      return;
    }

    setLoading(true);

    const result = await linkChemicalToRisk({
      riskId,
      ...formData,
    });

    if (result.success) {
      toast({
        title: "✅ Chemical linked",
        description: "The chemical is now linked to the risk",
        className: "bg-green-50 border-green-200",
      });
      setFormData({
        chemicalId: "",
        exposure: "MEDIUM",
        ppRequired: false,
        note: "",
      });
      onOpenChange(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not link chemical",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add chemical</DialogTitle>
          <DialogDescription>
            Link a hazardous substance to this risk assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chemical">Chemical</Label>
            {loadingChemicals ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select
                value={formData.chemicalId}
                onValueChange={(value) =>
                  setFormData({ ...formData, chemicalId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chemical" />
                </SelectTrigger>
                <SelectContent>
                  {chemicals.map((chemical) => (
                    <SelectItem key={chemical.id} value={chemical.id}>
                      {chemical.productName}
                      {chemical.isCMR && " [CMR]"}
                      {chemical.containsIsocyanates && " [Diisocyanates]"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exposure">Exposure level</Label>
            <Select
              value={formData.exposure}
              onValueChange={(value: any) =>
                setFormData({ ...formData, exposure: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low - Minimal exposure</SelectItem>
                <SelectItem value="MEDIUM">Moderate - Standard safety measures</SelectItem>
                <SelectItem value="HIGH">High - Requires extra measures</SelectItem>
                <SelectItem value="CRITICAL">Critical - CMR/Diisocyanates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ppRequired"
              checked={formData.ppRequired}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, ppRequired: checked as boolean })
              }
            />
            <Label htmlFor="ppRequired" className="cursor-pointer">
              Personal protective equipment required
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Special precautions, area of use, etc."
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingChemicals}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

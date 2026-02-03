"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRiskAssessment } from "@/server/actions/risk.actions";
import { useToast } from "@/hooks/use-toast";

interface RiskAssessmentFormProps {
  tenantId: string;
  defaultYear: number;
}

export function RiskAssessmentForm({ tenantId, defaultYear }: RiskAssessmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(`Risikovurdering ${defaultYear}`);
  const [year, setYear] = useState(defaultYear);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createRiskAssessment({ tenantId, title: title.trim(), assessmentYear: year });
      if (result.success && result.data) {
        toast({
          title: "Risikovurdering opprettet",
          description: `Du kan nå legge inn risikopunkter for ${year}.`,
          className: "bg-green-50 border-green-200",
        });
        router.push(`/dashboard/risks/assessment/${result.data.id}`);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Feil", description: result.error ?? "Kunne ikke opprette" });
      }
    } catch {
      toast({ variant: "destructive", title: "Feil", description: "Noe gikk galt" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Risikovurdering for et år</CardTitle>
          <CardDescription>
            Tittel og år for den årlige risikovurderingen. Etter opprettelse legger du inn risikopunkter (beskrivelse, nivå, kategori, dato).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tittel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Risikovurdering 2026"
                required
                minLength={3}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">År *</Label>
              <Input
                id="year"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || defaultYear)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Oppretter..." : "Opprett risikovurdering"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

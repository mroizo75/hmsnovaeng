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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { addRiskAssessmentItem } from "@/server/actions/risk.actions";
import { useToast } from "@/hooks/use-toast";
import type { RiskCategory } from "@prisma/client";

const LEVEL_OPTIONS = [
  { value: "LOW", label: "Lav" },
  { value: "MEDIUM", label: "Moderat" },
  { value: "HIGH", label: "Høy" },
  { value: "CRITICAL", label: "Kritisk" },
] as const;

const WORKPLACE_CATEGORY_OPTIONS: Array<{ value: RiskCategory; label: string }> = [
  { value: "PSYCHOSOCIAL", label: "Psykososialt" },
  { value: "ERGONOMIC", label: "Ergonomisk" },
  { value: "ORGANISATIONAL", label: "Organisatorisk" },
  { value: "PHYSICAL", label: "Fysisk" },
  { value: "SAFETY", label: "Sikkerhet" },
  { value: "HEALTH", label: "Helse" },
  { value: "OPERATIONAL", label: "Operasjonell" },
  { value: "ENVIRONMENTAL", label: "Miljø" },
];

interface RiskAssessmentItemFormProps {
  riskAssessmentId: string;
  tenantId: string;
  ownerId: string;
  onAdded?: () => void;
}

export function RiskAssessmentItemForm({
  riskAssessmentId,
  tenantId,
  ownerId,
  onAdded,
}: RiskAssessmentItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [category, setCategory] = useState<RiskCategory>("PSYCHOSOCIAL");
  const [assessmentDate, setAssessmentDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nextReviewDate, setNextReviewDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [beskrivelse, setBeskrivelse] = useState("");
  const [konsekvens, setKonsekvens] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      toast({ variant: "destructive", title: "Tittel må være minst 3 tegn" });
      return;
    }
    setLoading(true);
    try {
      const result = await addRiskAssessmentItem({
        riskAssessmentId,
        tenantId,
        ownerId,
        title: trimmed,
        level,
        category,
        assessmentDate: assessmentDate || null,
        nextReviewDate: nextReviewDate || null,
        beskrivelse: beskrivelse.trim() || null,
        konsekvens: konsekvens.trim() || null,
      });
      if (result.success) {
        toast({ title: "Risikopunkt lagt til", className: "bg-green-50 border-green-200" });
        setTitle("");
        setBeskrivelse("");
        setKonsekvens("");
        onAdded?.();
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Feil", description: result.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Feil", description: "Kunne ikke legge til" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legg til risikopunkt</CardTitle>
        <CardDescription>
          Tittel, beskrivelse, konsekvens, nivå, kategori og dato (ISO 45001)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="item-title">Tittel / kort beskrivelse *</Label>
              <Input
                id="item-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Manglende medvirkning i beslutningsprosesser"
                minLength={3}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-date">Vurderingsdato</Label>
              <Input
                id="item-date"
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-next-review">Neste revisjon</Label>
              <Input
                id="item-next-review"
                type="date"
                value={nextReviewDate}
                onChange={(e) => setNextReviewDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-beskrivelse">Beskrivelse</Label>
            <Textarea
              id="item-beskrivelse"
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              placeholder="Beskriv situasjonen, hvor det kan skje, hvem som er utsatt, etc."
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-konsekvens">Konsekvens</Label>
            <Textarea
              id="item-konsekvens"
              value={konsekvens}
              onChange={(e) => setKonsekvens(e.target.value)}
              placeholder="Hva kan skje dersom risikoscenarioet inntreffer? Beskriv konsekvensen."
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nivå</Label>
              <Select
                value={level}
                onValueChange={(v) => setLevel(v as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v: RiskCategory) => setCategory(v)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKPLACE_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Legger til..." : "Legg til risikopunkt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

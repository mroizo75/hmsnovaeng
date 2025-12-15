"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createDocument } from "@/server/actions/document.actions";
import { Upload } from "lucide-react";

interface DocumentFormProps {
  tenantId: string;
  owners: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
    defaultReviewIntervalMonths: number;
    isGlobal: boolean;
    pdcaGuidance?: Record<string, string> | null;
  }>;
}

const documentKinds = [
  { value: "LAW", label: "Lov" },
  { value: "PROCEDURE", label: "Prosedyre" },
  { value: "CHECKLIST", label: "Sjekkliste" },
  { value: "FORM", label: "Skjema" },
  { value: "SDS", label: "Sikkerhetsdatablad" },
  { value: "PLAN", label: "Plan" },
  { value: "OTHER", label: "Annet" },
];

const userRoles = [
  { value: "ADMIN", label: "Admin" },
  { value: "HMS", label: "HMS-leder" },
  { value: "LEDER", label: "Leder" },
  { value: "VERNEOMBUD", label: "Verneombud" },
  { value: "ANSATT", label: "Ansatt" },
  { value: "BHT", label: "BHT" },
  { value: "REVISOR", label: "Revisor" },
];

const NO_OWNER_VALUE = "__none_owner__";
const NO_TEMPLATE_VALUE = "__none_template__";

export function DocumentForm({ tenantId, owners, templates }: DocumentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>(NO_OWNER_VALUE);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(NO_TEMPLATE_VALUE);
  const [reviewInterval, setReviewInterval] = useState("12");
  const [reviewIntervalTouched, setReviewIntervalTouched] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [pdca, setPdca] = useState({
    plan: "",
    do: "",
    check: "",
    act: "",
  });

  const templateMap = useMemo(() => {
    const map = new Map<string, (typeof templates)[number]>();
    templates.forEach((template) => map.set(template.id, template));
    return map;
  }, [templates]);

  // Maks 50MB for dokumenter
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value === NO_TEMPLATE_VALUE) {
      return;
    }

    const template = templateMap.get(value);
    if (!template) {
      return;
    }

    if (!reviewIntervalTouched && template.defaultReviewIntervalMonths) {
      setReviewInterval(String(template.defaultReviewIntervalMonths));
    }

    const guidance = template.pdcaGuidance || {};
    setPdca((prev) => ({
      plan: prev.plan || guidance.plan || "",
      do: prev.do || guidance.do || "",
      check: prev.check || guidance.check || "",
      act: prev.act || guidance.act || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "⚠️ Filen er for stor",
        description: `Maksimal filstørrelse er 50 MB. Din fil er ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB.`,
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);
    formData.append("changeComment", "Første versjon opprettet");
    formData.delete("ownerId");
    formData.delete("templateId");

    if (selectedOwner !== NO_OWNER_VALUE) {
      formData.append("ownerId", selectedOwner);
    }

    if (selectedTemplate !== NO_TEMPLATE_VALUE) {
      formData.append("templateId", selectedTemplate);
    }

    if (selectedRoles.length > 0) {
      formData.append("visibleToRoles", JSON.stringify(selectedRoles));
    }

    try {
      const result = await createDocument(formData);

      if (result.success) {
        toast({
          title: "📄 Dokument opprettet",
          description: "Dokumentet er lastet opp og venter på godkjenning",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/documents");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Opplasting feilet",
          description: result.error || "Kunne ikke laste opp dokument",
        });
      }
    } catch (error: any) {
      if (error?.message?.includes("413") || error?.status === 413) {
        toast({
          variant: "destructive",
          title: "⚠️ Filen er for stor",
          description: "Maksimal filstørrelse er 50 MB. Prøv å komprimere filen eller last opp en mindre versjon.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uventet feil",
          description: "Noe gikk galt ved opplasting av dokument. Prøv igjen senere.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last opp nytt dokument</CardTitle>
        <CardDescription>
          Dokumentet vil få status UTKAST og må godkjennes før bruk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              name="title"
              placeholder="F.eks. HMS-håndbok 2025"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kind">Type dokument *</Label>
              <Select name="kind" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  {documentKinds.map((kind) => (
                    <SelectItem key={kind.value} value={kind.value}>
                      {kind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Versjon</Label>
              <Input
                id="version"
                name="version"
                placeholder="v1.0"
                defaultValue="v1.0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Prosesseier</Label>
              <Select
                name="ownerId"
                value={selectedOwner}
                onValueChange={setSelectedOwner}
                disabled={loading || owners.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={owners.length ? "Velg ansvarlig" : "Ingen brukere tilgjengelig"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER_VALUE}>Ingen</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name || owner.email} ({owner.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">Dokumentmal</Label>
              <Select
                name="templateId"
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={loading || templates.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={templates.length ? "Velg mal (valgfritt)" : "Ingen maler tilgjengelig"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TEMPLATE_VALUE}>Ingen</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.isGlobal ? "• Global" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate !== NO_TEMPLATE_VALUE && (
                <p className="text-xs text-muted-foreground">
                  {templateMap.get(selectedTemplate)?.description ?? "Mal valgt"}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reviewIntervalMonths">Revisjonsintervall (måneder)</Label>
              <Input
                id="reviewIntervalMonths"
                name="reviewIntervalMonths"
                type="number"
                min={1}
                max={36}
                value={reviewInterval}
                onChange={(event) => {
                  setReviewIntervalTouched(true);
                  setReviewInterval(event.target.value);
                }}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Gyldig fra</Label>
              <Input
                id="effectiveFrom"
                name="effectiveFrom"
                type="date"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveTo">Gyldig til</Label>
              <Input
                id="effectiveTo"
                name="effectiveTo"
                type="date"
                value={effectiveTo}
                onChange={(event) => setEffectiveTo(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fil *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                name="file"
                type="file"
                required
                disabled={loading}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Valgt: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Støttede formater: PDF, Word, Excel, TXT • Maks 50 MB
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planSummary">Plan (Plan)</Label>
              <Textarea
                id="planSummary"
                name="planSummary"
                value={pdca.plan}
                onChange={(event) => setPdca((prev) => ({ ...prev, plan: event.target.value }))}
                placeholder="Hva er hensikten og rammen for prosessen?"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doSummary">Gjør (Do)</Label>
              <Textarea
                id="doSummary"
                name="doSummary"
                value={pdca.do}
                onChange={(event) => setPdca((prev) => ({ ...prev, do: event.target.value }))}
                placeholder="Hvordan utføres prosessen i praksis?"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkSummary">Kontroller (Check)</Label>
              <Textarea
                id="checkSummary"
                name="checkSummary"
                value={pdca.check}
                onChange={(event) => setPdca((prev) => ({ ...prev, check: event.target.value }))}
                placeholder="Hvordan følger vi opp at prosessen fungerer?"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actSummary">Forbedre (Act)</Label>
              <Textarea
                id="actSummary"
                name="actSummary"
                value={pdca.act}
                onChange={(event) => setPdca((prev) => ({ ...prev, act: event.target.value }))}
                placeholder="Hvilke forbedringer eller korrigerende tiltak planlegges?"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Hvem skal se dokumentet?</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Velg hvilke roller som skal ha tilgang. Ingen valg = synlig for alle.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userRoles.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.value}
                    checked={selectedRoles.includes(role.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoles([...selectedRoles, role.value]);
                      } else {
                        setSelectedRoles(selectedRoles.filter((r) => r !== role.value));
                      }
                    }}
                    disabled={loading}
                  />
                  <Label
                    htmlFor={role.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedRoles.length > 0 && (
              <p className="text-sm text-blue-600">
                ✓ Valgt: {selectedRoles.map((role) => userRoles.find((r) => r.value === role)?.label).join(", ")}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">ℹ️ Viktig informasjon</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Dokumentet får status <strong>UTKAST</strong> etter opplasting</li>
              <li>Må <strong>godkjennes</strong> av HMS-leder/Admin før bruk</li>
              <li>Alle versjoner lagres permanent for sporbarhet</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Laster opp...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Last opp dokument
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Avbryt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

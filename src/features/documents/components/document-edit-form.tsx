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
import { updateDocument } from "@/server/actions/document.actions";
import { Save } from "lucide-react";
import { Document } from "@prisma/client";

interface DocumentEditFormProps {
  document: Document;
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

const formatDateInput = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export function DocumentEditForm({ document, owners, templates }: DocumentEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const initialRoles = (() => {
    try {
      if (!document.visibleToRoles) return [];
      const roles =
        typeof document.visibleToRoles === "string"
          ? JSON.parse(document.visibleToRoles)
          : document.visibleToRoles;
      return Array.isArray(roles) ? roles : [];
    } catch {
      return [];
    }
  })();

  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const [title, setTitle] = useState(document.title);
  const [kind, setKind] = useState(document.kind);
  const [version, setVersion] = useState(document.version);
  const [selectedOwner, setSelectedOwner] = useState(document.ownerId ?? NO_OWNER_VALUE);
  const [selectedTemplate, setSelectedTemplate] = useState(document.templateId ?? NO_TEMPLATE_VALUE);
  const [reviewInterval, setReviewInterval] = useState(
    String(document.reviewIntervalMonths ?? 12)
  );
  const [reviewIntervalTouched, setReviewIntervalTouched] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState(formatDateInput(document.effectiveFrom));
  const [effectiveTo, setEffectiveTo] = useState(formatDateInput(document.effectiveTo));
  const [pdca, setPdca] = useState({
    plan: document.planSummary ?? "",
    do: document.doSummary ?? "",
    check: document.checkSummary ?? "",
    act: document.actSummary ?? "",
  });

  const templateMap = useMemo(() => {
    const map = new Map<string, (typeof templates)[number]>();
    templates.forEach((template) => map.set(template.id, template));
    return map;
  }, [templates]);

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
    setLoading(true);

    try {
      const result = await updateDocument({
        id: document.id,
        title,
        kind,
        version,
        visibleToRoles: selectedRoles.length > 0 ? selectedRoles : null,
        ownerId: selectedOwner === NO_OWNER_VALUE ? null : selectedOwner,
        templateId: selectedTemplate === NO_TEMPLATE_VALUE ? null : selectedTemplate,
        reviewIntervalMonths: reviewInterval,
        effectiveFrom: effectiveFrom || null,
        effectiveTo: effectiveTo || null,
        planSummary: pdca.plan,
        doSummary: pdca.do,
        checkSummary: pdca.check,
        actSummary: pdca.act,
      });

      if (result.success) {
        toast({
          title: "✅ Dokument oppdatert",
          description: "Endringene er lagret",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/documents");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Oppdatering feilet",
          description: result.error || "Kunne ikke oppdatere dokument",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uventet feil",
        description: "Noe gikk galt ved oppdatering av dokument",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rediger dokument</CardTitle>
        <CardDescription>
          Oppdater metadata og tilgangskontroll. For å endre fil, bruk "Last opp ny versjon".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. HMS-håndbok 2025"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kind">Type dokument *</Label>
              <Select value={kind} onValueChange={(value: any) => setKind(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  {documentKinds.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
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
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Prosesseier</Label>
              <Select
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planSummary">Plan (Plan)</Label>
              <Textarea
                id="planSummary"
                name="planSummary"
                value={pdca.plan}
                onChange={(event) => setPdca((prev) => ({ ...prev, plan: event.target.value }))}
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
            {selectedRoles.length > 0 ? (
              <p className="text-sm text-blue-600">
                ✓ Valgt: {selectedRoles.map((role) => userRoles.find((r) => r.value === role)?.label).join(", ")}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">📢 Synlig for alle roller</p>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">ℹ️ Viktig informasjon</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Endringer påvirker kun metadata og tilgangskontroll</li>
              <li>For å endre selve filen, bruk <strong>"Last opp ny versjon"</strong></li>
              <li>Status og godkjenning endres ikke her</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Lagrer...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lagre endringer
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

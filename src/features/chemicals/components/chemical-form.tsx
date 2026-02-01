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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createChemical, updateChemical } from "@/server/actions/chemical.actions";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import type { Chemical } from "@prisma/client";
import { HazardPictogramSelector } from "./hazard-pictogram-selector";
import { PPESelector } from "./ppe-selector";

interface ChemicalFormProps {
  chemical?: Chemical;
  mode?: "create" | "edit";
}

export function ChemicalForm({ chemical, mode = "create" }: ChemicalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sdsFile, setSdsFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  // Håndter SDS-opplasting med AI-parsing
  const handleSDSUpload = async (file: File) => {
    setSdsFile(file);
    setParsing(true);

    try {
      // Last opp fil til storage
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/chemicals/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Filopplasting feilet");
      }

      const { key } = await uploadRes.json();

      // Parse SDS med AI
      toast({
        title: "🤖 AI analyserer sikkerhetsdatablad",
        description: "Adobe ekstraher tekst + OpenAI analyserer innhold...",
      });

      const parseRes = await fetch("/api/chemicals/parse-sds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdsKey: key }),
      });

      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || "AI-parsing feilet");
      }

      const { data } = await parseRes.json();
      setAiData(data);

      toast({
        title: "✅ AI-analyse fullført",
        description: `Feltene er fylt ut automatisk - sjekk og juster`,
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Feil ved AI-parsing",
        description: error.message || "Kunne ikke analysere sikkerhetsdatabladet. Fyll ut manuelt.",
      });
      // Behold filen selv om parsing feiler
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Last opp SDS-fil først hvis den finnes
      let sdsKey: string | undefined;
      if (sdsFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", sdsFile);

        const uploadRes = await fetch("/api/chemicals/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Filopplasting feilet");
        }

        const uploadData = await uploadRes.json();
        sdsKey = uploadData.key;
      }

      const data = {
        productName: formData.get("productName") as string,
        supplier: formData.get("supplier") as string || undefined,
        casNumber: formData.get("casNumber") as string || undefined,
        hazardClass: formData.get("hazardClass") as string || undefined,
        hazardStatements: formData.get("hazardStatements") as string || undefined,
        warningPictograms: formData.get("warningPictograms") as string || undefined,
        requiredPPE: formData.get("requiredPPE") as string || undefined,
        containsIsocyanates: formData.get("containsIsocyanates") === "on",
        sdsKey: sdsKey || undefined,
        sdsVersion: formData.get("sdsVersion") as string || undefined,
        sdsDate: formData.get("sdsDate") as string || undefined,
        nextReviewDate: formData.get("nextReviewDate") as string || undefined,
        location: formData.get("location") as string || undefined,
        quantity: formData.get("quantity") as string || undefined,
        unit: formData.get("unit") as string || undefined,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string || undefined,
      };

      const result =
        mode === "edit" && chemical
          ? await updateChemical(chemical.id, data)
          : await createChemical(data);

      if (result.success) {
        toast({
          title: mode === "edit" ? "✅ Kjemikalie oppdatert" : "✅ Kjemikalie registrert",
          description: mode === "edit" ? "Endringene er lagret" : "Produktet er lagt til i stoffkartoteket",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/chemicals");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Feil",
          description: result.error || "Kunne ikke lagre kjemikalie",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: error.message || "Noe gikk galt",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Steg 1: Sikkerhetsdatablad – last opp først så AI fyller ut */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Steg 1: Last opp sikkerhetsdatablad
          </CardTitle>
          <CardDescription>
            Last opp PDF – AI analyserer og fyller ut feltene under automatisk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sdsFile" className="flex items-center gap-2">
              Datablad (PDF) {mode === "create" && "*"}
              {parsing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="sdsFile"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleSDSUpload(file);
                  }
                }}
                disabled={loading || parsing}
              />
              {chemical?.sdsKey && !sdsFile && (
                <Button variant="outline" size="sm" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Eksisterende
                </Button>
              )}
            </div>
            {parsing && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-900">
                  AI analyserer sikkerhetsdatablad... Dette tar ca. 30-60 sekunder
                </p>
              </div>
            )}
            {!chemical?.sdsKey && mode === "create" && !parsing && (
              <p className="text-xs text-blue-600">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI vil automatisk fylle ut feltene når du laster opp sikkerhetsdatabladet
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sdsVersion">Versjon</Label>
              <Input
                id="sdsVersion"
                name="sdsVersion"
                placeholder="F.eks. 3.2"
                disabled={loading}
                defaultValue={chemical?.sdsVersion || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sdsDate">Dato for datablad</Label>
              <Input
                id="sdsDate"
                name="sdsDate"
                type="date"
                disabled={loading}
                defaultValue={
                  chemical?.sdsDate
                    ? new Date(chemical.sdsDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextReviewDate">Neste revisjon</Label>
              <Input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                disabled={loading}
                defaultValue={
                  chemical?.nextReviewDate
                    ? new Date(chemical.nextReviewDate).toISOString().split("T")[0]
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                }
              />
              <p className="text-xs text-muted-foreground">
                Anbefalt: Årlig gjennomgang
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steg 2: Produktinformasjon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Produktinformasjon
          </CardTitle>
          <CardDescription>Grunnleggende informasjon om kjemikaliet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">AI har fylt ut feltene automatisk</p>
                <p className="text-xs text-green-700">
                  Sjekk og juster informasjonen om nødvendig
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productName">
              Produktnavn * {aiData?.productName && <Badge variant="secondary" className="ml-2 text-xs">AI-fylt</Badge>}
            </Label>
            <Input
              id="productName"
              name="productName"
              placeholder="F.eks. Rengjøringsmiddel XYZ"
              required
              disabled={loading}
              key={aiData?.productName || "default"}
              defaultValue={aiData?.productName || chemical?.productName || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Leverandør {aiData?.supplier && <Badge variant="secondary" className="ml-2 text-xs">AI-fylt</Badge>}
              </Label>
              <Input
                id="supplier"
                name="supplier"
                placeholder="Leverandørnavn"
                disabled={loading}
                key={aiData?.supplier || "default"}
                defaultValue={aiData?.supplier || chemical?.supplier || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="casNumber">
                CAS-nummer {aiData?.casNumber && <Badge variant="secondary" className="ml-2 text-xs">AI-fylt</Badge>}
              </Label>
              <Input
                id="casNumber"
                name="casNumber"
                placeholder="000-00-0"
                disabled={loading}
                key={aiData?.casNumber || "default"}
                defaultValue={aiData?.casNumber || chemical?.casNumber || ""}
              />
              <p className="text-xs text-muted-foreground">
                Unikt identifikasjonsnummer for kjemisk stoff
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Lagringssted</Label>
              <Input
                id="location"
                name="location"
                placeholder="F.eks. Lager A, hylle 3"
                disabled={loading}
                defaultValue={chemical?.location || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" required disabled={loading} defaultValue={chemical?.status || "ACTIVE"}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">I bruk</SelectItem>
                  <SelectItem value="PHASED_OUT">Utfases</SelectItem>
                  <SelectItem value="ARCHIVED">Arkivert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Mengde</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                placeholder="10"
                disabled={loading}
                defaultValue={chemical?.quantity || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Enhet</Label>
              <Select name="unit" disabled={loading} defaultValue={chemical?.unit || "liter"}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg enhet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="stk">Stykk</SelectItem>
                  <SelectItem value="m3">Kubikkmeter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steg 3: Farepiktogrammer og klassifisering */}
      <Card>
        <CardHeader>
          <CardTitle>Steg 3: Faremarkering (GHS/CLP)</CardTitle>
          <CardDescription>H-setninger og varslingspiktogrammer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hazardStatements">
              H-setninger {aiData?.hazardStatements && <Badge variant="secondary" className="ml-2 text-xs">AI-fylt</Badge>}
            </Label>
            <Textarea
              id="hazardStatements"
              name="hazardStatements"
              rows={3}
              placeholder="F.eks. H226 (Brannfarlig væske og damp), H315 (Irriterer huden)"
              disabled={loading}
              key={aiData?.hazardStatements || "default"}
              defaultValue={aiData?.hazardStatements || chemical?.hazardStatements || ""}
            />
            <p className="text-xs text-muted-foreground">
              Faresetninger (Hazard statements)
            </p>
          </div>

          <div>
            {aiData?.warningPictograms && <Badge variant="secondary" className="mb-2 text-xs">AI-fylt</Badge>}
            <HazardPictogramSelector 
              key={aiData?.warningPictograms || "default"}
              defaultValue={aiData?.warningPictograms || chemical?.warningPictograms || ""} 
            />
          </div>

          {/* Diisocyanater advarsel */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center h-5">
              <Checkbox 
                id="containsIsocyanates" 
                name="containsIsocyanates"
                disabled={loading}
                key={aiData?.containsIsocyanates?.toString() || "default"}
                defaultChecked={aiData?.containsIsocyanates || chemical?.containsIsocyanates || false}
              />
            </div>
            <div className="flex-1">
              <Label 
                htmlFor="containsIsocyanates" 
                className="text-sm font-medium text-orange-900 flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4" />
                Inneholder diisocyanater
                {aiData?.containsIsocyanates && <Badge variant="secondary" className="ml-2 text-xs">AI-oppdaget</Badge>}
              </Label>
              <p className="text-xs text-orange-800 mt-1">
                Produkter med diisocyanater krever obligatorisk opplæring (EU-forordning 2020/1149). 
                AI detekterer dette automatisk ved SDS-analyse.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steg 4: Personlig verneutstyr */}
      <Card>
        <CardHeader>
          <CardTitle>Steg 4: Personlig verneutstyr (PPE)</CardTitle>
          <CardDescription>Påkrevd verneutstyr ved håndtering (ISO 7010)</CardDescription>
        </CardHeader>
        <CardContent>
          {aiData?.requiredPPE && <Badge variant="secondary" className="mb-2 text-xs">AI-foreslått</Badge>}
          <PPESelector 
            key={aiData?.requiredPPE || "default"}
            defaultValue={aiData?.requiredPPE || chemical?.requiredPPE || ""} 
          />
        </CardContent>
      </Card>

      {/* Notater */}
      <Card>
        <CardHeader>
          <CardTitle>Tilleggsinfo</CardTitle>
          <CardDescription>Notater og kommentarer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notater</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Spesielle håndteringsinstruksjoner, restriksjoner, etc..."
              disabled={loading}
              defaultValue={chemical?.notes || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* ISO 9001 Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-blue-900 mb-2">
            📋 HMS-krav og beste praksis
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Alle kjemikalier må ha oppdatert sikkerhetsdatablad</li>
            <li>Gjennomgå databladene minimum årlig</li>
            <li>Sikre at ansatte har tilgang til relevante sikkerhetsdatablad</li>
            <li>Dokumenter opplæring i sikker håndtering</li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={loading || (mode === "create" && !sdsFile)}>
          {loading ? "Lagrer..." : mode === "edit" ? "Lagre endringer" : "Registrer kjemikalie"}
        </Button>
      </div>
    </form>
  );
}


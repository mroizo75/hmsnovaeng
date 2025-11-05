"use client";

import { useState } from "react";
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
import { updateDocument } from "@/server/actions/document.actions";
import { Save } from "lucide-react";
import { Document } from "@prisma/client";

interface DocumentEditFormProps {
  document: Document;
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

export function DocumentEditForm({ document }: DocumentEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Parse existing visibleToRoles
  const initialRoles = (() => {
    try {
      if (!document.visibleToRoles) return [];
      const roles = typeof document.visibleToRoles === "string" 
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
              <Select 
                value={kind} 
                onValueChange={(value: any) => setKind(value)}
                disabled={loading}
              >
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
                ✓ Valgt: {selectedRoles.map(r => userRoles.find(ur => ur.value === r)?.label).join(", ")}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                📢 Synlig for alle roller
              </p>
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


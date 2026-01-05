"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Cloud, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import type { Tenant } from "@prisma/client";
import { updateAzureAdSettings } from "@/server/actions/azure-ad.actions";

interface AzureAdIntegrationProps {
  tenant: Tenant & {
    azureAdTenantId?: string | null;
    azureAdEnabled?: boolean;
    azureAdSyncEnabled?: boolean;
    azureAdLastSync?: Date | null;
    azureAdDomain?: string | null;
    azureAdAutoRole?: string | null;
  };
  isAdmin: boolean;
}

export function AzureAdIntegration({ tenant, isAdmin }: AzureAdIntegrationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(tenant.azureAdEnabled || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Ingen tilgang",
        description: "Kun administratorer kan endre Azure AD-innstillinger",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      azureAdEnabled: enabled,
      azureAdDomain: formData.get("azureAdDomain") as string || undefined,
      azureAdAutoRole: formData.get("azureAdAutoRole") as string || undefined,
    };

    const result = await updateAzureAdSettings(data);

    if (result.success) {
      toast({
        title: "✅ Office 365 SSO aktivert!",
        description: "Ansatte kan nå logge inn med sine Microsoft-kontoer",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Kunne ikke lagre innstillinger",
      });
    }

    setLoading(false);
  };

  const isConfigured = !!tenant.azureAdDomain && tenant.azureAdEnabled;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Microsoft Azure AD / Office 365</CardTitle>
                <CardDescription>
                  Koble bedriftens Office 365-kontoer til HMS Nova
                </CardDescription>
              </div>
            </div>
            {isConfigured ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Aktiv
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Ikke konfigurert
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tenant.azureAdLastSync && (
            <p className="text-sm text-muted-foreground">
              Sist synkronisert: {new Date(tenant.azureAdLastSync).toLocaleString("nb-NO")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-green-900">
                ✨ Så enkelt er det!
              </p>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li className="font-medium">Skriv inn ditt e-postdomene (f.eks. "bedrift.no")</li>
                <li>Velg standard rolle for nye ansatte</li>
                <li>Aktiver SSO med én klikk</li>
                <li className="text-green-900 font-semibold">✅ FERDIG! Alle ansatte kan nå logge inn!</li>
              </ol>
              <div className="bg-white rounded-md p-3 mt-3 border border-green-200">
                <p className="text-green-900 font-medium mb-1">🔐 Hvordan fungerer det?</p>
                <p className="text-green-700 text-xs">
                  Når en ansatt logger inn med Microsoft for første gang, opprettes kontoen deres automatisk i HMS Nova. 
                  Ingen komplisert oppsett i Azure Portal nødvendig!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Office 365 / Microsoft 365 SSO</CardTitle>
            <CardDescription>
              La alle ansatte logge inn med sine eksisterende Microsoft-kontoer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Domain */}
            <div className="space-y-2">
              <Label htmlFor="azureAdDomain" className="text-base">
                E-postdomene for bedriften *
              </Label>
              <Input
                id="azureAdDomain"
                name="azureAdDomain"
                placeholder="bedrift.no"
                defaultValue={tenant.azureAdDomain || ""}
                disabled={!isAdmin || loading}
                required
                className="text-lg"
              />
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
                <p className="text-sm text-blue-900">
                  💡 <strong>Eksempel:</strong> Hvis ansatte har e-poster som <code className="bg-blue-100 px-1 rounded">ansatt@bedrift.no</code>, 
                  skriv kun <code className="bg-blue-100 px-1 rounded">bedrift.no</code> (uten @)
                </p>
              </div>
            </div>

            {/* Default Role for new users */}
            <div className="space-y-2">
              <Label htmlFor="azureAdAutoRole" className="text-base">
                Standard rolle for nye ansatte
              </Label>
              <Select
                name="azureAdAutoRole"
                defaultValue={tenant.azureAdAutoRole || "ANSATT"}
                disabled={!isAdmin || loading}
              >
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANSATT">👤 Ansatt</SelectItem>
                  <SelectItem value="LEDER">👔 Leder</SelectItem>
                  <SelectItem value="ADMIN">⚙️ Administrator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Hvilken rolle skal ansatte få automatisk når de logger inn første gang?
                <br />
                <span className="text-xs">💡 Du kan endre roller manuelt senere under "Brukere"</span>
              </p>
            </div>

            {/* Enable SSO */}
            <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50/50 p-4">
              <div className="space-y-1">
                <Label htmlFor="azureAdEnabled" className="text-base font-semibold text-green-900">
                  ✨ Aktiver Microsoft SSO
                </Label>
                <p className="text-sm text-green-700">
                  La alle ansatte logge inn med sine @{tenant.azureAdDomain || "bedrift.no"} kontoer
                </p>
              </div>
              <Switch
                id="azureAdEnabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={!isAdmin || loading}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            {!isAdmin && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                ⚠️ Kun administratorer kan endre Azure AD-innstillinger
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {isAdmin && (
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700">
              {loading ? "Lagrer..." : enabled ? "✅ Lagre og aktiver SSO" : "Lagre innstillinger"}
            </Button>
            
            {isConfigured && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Microsoft SSO er aktivert!</p>
                    <p className="text-green-700 mt-1">
                      Ansatte kan nå gå til <strong>hmsnova.com/login</strong> og klikke 
                      <strong> "Logg inn med Microsoft"</strong> for å logge inn automatisk.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* FAQ Card */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">❓ Vanlige spørsmål</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-1">Må vi gjøre noe i Azure Portal eller Microsoft 365 Admin?</p>
            <p className="text-gray-600">Nei! Du trenger kun å skrive inn domenet ditt her. Ingen teknisk konfigurasjon nødvendig.</p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">Hva skjer når en ansatt logger inn første gang?</p>
            <p className="text-gray-600">
              Kontoen deres opprettes automatisk i HMS Nova med rollen du har valgt. 
              De får umiddelbar tilgang til systemet.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">Kan ansatte fortsatt bruke passord?</p>
            <p className="text-gray-600">
              Ja! SSO er et tillegg. Ansatte kan velge mellom Microsoft-innlogging eller vanlig passord.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">Hva hvis en ansatt slutter?</p>
            <p className="text-gray-600">
              Deaktiver eller slett brukeren under "Brukere" i HMS Nova. 
              Hvis de deaktiveres i Microsoft 365, kan de heller ikke logge inn via SSO.
            </p>
          </div>

          <p className="text-muted-foreground mt-4 pt-4 border-t">
            💡 Trenger du hjelp? Kontakt <strong>support@hmsnova.com</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


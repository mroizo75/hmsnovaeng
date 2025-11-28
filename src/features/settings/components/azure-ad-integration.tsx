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
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Users, Info } from "lucide-react";
import type { Tenant } from "@prisma/client";
import { updateAzureAdSettings, syncAzureAdUsers } from "@/server/actions/azure-ad.actions";

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
  const [syncing, setSyncing] = useState(false);
  const [enabled, setEnabled] = useState(tenant.azureAdEnabled || false);
  const [syncEnabled, setSyncEnabled] = useState(tenant.azureAdSyncEnabled || false);

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
      azureAdTenantId: formData.get("azureAdTenantId") as string || undefined,
      azureAdEnabled: enabled,
      azureAdSyncEnabled: syncEnabled,
      azureAdDomain: formData.get("azureAdDomain") as string || undefined,
      azureAdAutoRole: formData.get("azureAdAutoRole") as string || undefined,
    };

    const result = await updateAzureAdSettings(data);

    if (result.success) {
      toast({
        title: "✅ Azure AD konfigurert",
        description: "Office 365-integrasjonen er oppdatert",
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

  const handleSync = async () => {
    if (!isAdmin) return;
    if (!tenant.azureAdTenantId || !tenant.azureAdEnabled) {
      toast({
        variant: "destructive",
        title: "Azure AD ikke konfigurert",
        description: "Du må først konfigurere Azure AD-integrasjonen",
      });
      return;
    }

    setSyncing(true);

    const result = await syncAzureAdUsers();

    if (result.success) {
      toast({
        title: "✅ Synkronisering fullført",
        description: `${result.data?.created || 0} nye brukere opprettet`,
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Synkronisering feilet",
        description: result.error || "Kunne ikke synkronisere brukere",
      });
    }

    setSyncing(false);
  };

  const isConfigured = !!tenant.azureAdTenantId && tenant.azureAdEnabled;

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
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">
                Hvordan fungerer Office 365-integrasjonen?
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Admin konfigurerer Azure AD Tenant ID (hentes fra Azure Portal)</li>
                <li>Alle ansatte med @{tenant.azureAdDomain || "bedrift.no"}-kontoer kan logge inn</li>
                <li>Brukere opprettes automatisk første gang de logger inn</li>
                <li>Valgfritt: Auto-synkroniser alle brukere fra Office 365</li>
              </ol>
              <p className="text-blue-700 mt-3">
                📚 <a href="/docs/azure-ad-setup" className="underline hover:text-blue-900" target="_blank">
                  Les full guide for oppsett av Azure AD →
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasjon</CardTitle>
            <CardDescription>
              Koble din bedrifts Office 365 / Azure AD organisasjon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Azure AD Tenant ID */}
            <div className="space-y-2">
              <Label htmlFor="azureAdTenantId">
                Azure AD Tenant ID *
              </Label>
              <Input
                id="azureAdTenantId"
                name="azureAdTenantId"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                defaultValue={tenant.azureAdTenantId || ""}
                disabled={!isAdmin || loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Finnes i Azure Portal → Azure Active Directory → Overview
              </p>
            </div>

            {/* Primary Domain */}
            <div className="space-y-2">
              <Label htmlFor="azureAdDomain">
                Primært e-postdomene *
              </Label>
              <Input
                id="azureAdDomain"
                name="azureAdDomain"
                placeholder="bedrift.no"
                defaultValue={tenant.azureAdDomain || ""}
                disabled={!isAdmin || loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Kun brukere med @bedrift.no kan logge inn
              </p>
            </div>

            {/* Default Role for new users */}
            <div className="space-y-2">
              <Label htmlFor="azureAdAutoRole">
                Standard rolle for nye brukere
              </Label>
              <Select
                name="azureAdAutoRole"
                defaultValue={tenant.azureAdAutoRole || "ANSATT"}
                disabled={!isAdmin || loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANSATT">Ansatt</SelectItem>
                  <SelectItem value="LEDER">Leder</SelectItem>
                  <SelectItem value="HMS">HMS</SelectItem>
                  <SelectItem value="VERNEOMBUD">Verneombud</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Hvilken rolle skal nye brukere få automatisk?
              </p>
            </div>

            {/* Enable SSO */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="azureAdEnabled">Aktiver SSO med Microsoft</Label>
                <p className="text-sm text-muted-foreground">
                  La ansatte logge inn med Office 365-kontoene sine
                </p>
              </div>
              <Switch
                id="azureAdEnabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={!isAdmin || loading}
              />
            </div>

            {/* Enable Auto-Sync */}
            {enabled && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="azureAdSyncEnabled">Automatisk synkronisering</Label>
                  <p className="text-sm text-muted-foreground">
                    Synkroniser alle brukere fra Azure AD automatisk (daglig)
                  </p>
                </div>
                <Switch
                  id="azureAdSyncEnabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                  disabled={!isAdmin || loading}
                />
              </div>
            )}

            {!isAdmin && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                ⚠️ Kun administratorer kan endre Azure AD-innstillinger
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Lagrer..." : "Lagre innstillinger"}
            </Button>
            {isConfigured && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSync}
                disabled={syncing || loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Synkroniserer..." : "Synkroniser brukere nå"}
              </Button>
            )}
          </div>
        )}
      </form>

      {/* Instructions Card */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">Hvordan få Azure AD Tenant ID?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Gå til <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Azure Portal</a></li>
            <li>Velg <strong>Azure Active Directory</strong> fra menyen</li>
            <li>Under "Overview", finn <strong>Tenant ID</strong></li>
            <li>Kopier ID-en og lim inn over</li>
          </ol>
          <p className="text-muted-foreground mt-4">
            💡 Trenger du hjelp? Kontakt support@hmsnova.com for assistanse med oppsett.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


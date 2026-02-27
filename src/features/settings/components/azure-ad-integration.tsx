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
        title: "No access",
        description: "Only administrators can change Azure AD settings",
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
        title: "✅ Office 365 SSO enabled!",
        description: "Employees can now sign in with their Microsoft accounts",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not save settings",
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
                  Connect your company&apos;s Office 365 accounts to EHS Nova
                </CardDescription>
              </div>
            </div>
            {isConfigured ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tenant.azureAdLastSync && (
            <p className="text-sm text-muted-foreground">
              Last synced: {new Date(tenant.azureAdLastSync).toLocaleString("en-US")}
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
                ✨ It&apos;s that simple!
              </p>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li className="font-medium">Enter your email domain (e.g. &quot;company.com&quot;)</li>
                <li>Choose the default role for new employees</li>
                <li>Enable SSO with one click</li>
                <li className="text-green-900 font-semibold">✅ DONE! All employees can now sign in!</li>
              </ol>
              <div className="bg-white rounded-md p-3 mt-3 border border-green-200">
                <p className="text-green-900 font-medium mb-1">🔐 How does it work?</p>
                <p className="text-green-700 text-xs">
                  When an employee signs in with Microsoft for the first time, their account is automatically created in EHS Nova.
                  No complex setup in Azure Portal required!
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
              Let all employees sign in with their existing Microsoft accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Domain */}
            <div className="space-y-2">
              <Label htmlFor="azureAdDomain" className="text-base">
                Company email domain *
              </Label>
              <Input
                id="azureAdDomain"
                name="azureAdDomain"
                placeholder="company.com"
                defaultValue={tenant.azureAdDomain || ""}
                disabled={!isAdmin || loading}
                required
                className="text-lg"
              />
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
                <p className="text-sm text-blue-900">
                  💡 <strong>Example:</strong> If employees have emails like <code className="bg-blue-100 px-1 rounded">employee@company.com</code>,
                  enter only <code className="bg-blue-100 px-1 rounded">company.com</code> (without @)
                </p>
              </div>
            </div>

            {/* Default Role for new users */}
            <div className="space-y-2">
              <Label htmlFor="azureAdAutoRole" className="text-base">
                Default role for new employees
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
                  <SelectItem value="ANSATT">👤 Employee</SelectItem>
                  <SelectItem value="LEDER">👔 Manager</SelectItem>
                  <SelectItem value="HMS">🦺 EHS Coordinator</SelectItem>
                  <SelectItem value="VERNEOMBUD">🛡️ Safety Representative</SelectItem>
                  <SelectItem value="BHT">🩺 Occupational Health</SelectItem>
                  <SelectItem value="REVISOR">📋 Auditor</SelectItem>
                  <SelectItem value="ADMIN">⚙️ Administrator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Which role should employees automatically get when they sign in for the first time?
                <br />
                <span className="text-xs">💡 You can change roles manually later under &quot;Users&quot;</span>
              </p>
            </div>

            {/* Enable SSO */}
            <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50/50 p-4">
              <div className="space-y-1">
                <Label htmlFor="azureAdEnabled" className="text-base font-semibold text-green-900">
                  ✨ Enable Microsoft SSO
                </Label>
                <p className="text-sm text-green-700">
                  Let all employees sign in with their @{tenant.azureAdDomain || "company.com"} accounts
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
                ⚠️ Only administrators can change Azure AD settings
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {isAdmin && (
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700">
              {loading ? "Saving..." : enabled ? "✅ Save and enable SSO" : "Save settings"}
            </Button>
            
            {isConfigured && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Microsoft SSO is enabled!</p>
                    <p className="text-green-700 mt-1">
                      Employees can now go to <strong>hmsnova.com/login</strong> and click
                      <strong> &quot;Sign in with Microsoft&quot;</strong> to sign in automatically.
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
          <CardTitle className="text-base">❓ Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-1">Do we need to do anything in Azure Portal or Microsoft 365 Admin?</p>
            <p className="text-gray-600">No! You only need to enter your domain here. No technical configuration required.</p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">What happens when an employee signs in for the first time?</p>
            <p className="text-gray-600">
              Their account is automatically created in EHS Nova with the role you have selected.
              They get immediate access to the system.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">Can employees still use a password?</p>
            <p className="text-gray-600">
              Yes! SSO is an addition. Employees can choose between Microsoft sign-in or regular password.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 mb-1">What if an employee leaves?</p>
            <p className="text-gray-600">
              Deactivate or delete the user under &quot;Users&quot; in EHS Nova.
              If they are deactivated in Microsoft 365, they also cannot sign in via SSO.
            </p>
          </div>

          <p className="text-muted-foreground mt-4 pt-4 border-t">
            💡 Need help? Contact <strong>support@hmsnova.com</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

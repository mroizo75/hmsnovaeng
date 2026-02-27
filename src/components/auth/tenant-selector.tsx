"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  employeeCount: number | null;
  industry: string | null;
}

interface TenantSelectorProps {
  userId: string;
  tenants: Tenant[];
  lastTenantId: string | null;
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrator",
    HMS: "EHS Coordinator",
    LEDER: "Manager",
    VERNEOMBUD: "Safety Representative",
    ANSATT: "Employee",
    BHT: "Occupational Health Service",
    REVISOR: "Auditor",
  };
  return labels[role] || role;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-300",
    TRIAL: "bg-blue-100 text-blue-800 border-blue-300",
    SUSPENDED: "bg-yellow-100 text-yellow-800 border-yellow-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    TRIAL: "Trial period",
    SUSPENDED: "Suspended",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}

export function TenantSelector({ userId, tenants, lastTenantId }: TenantSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const handleSelectTenant = async (tenantId: string) => {
    setLoading(true);
    setSelectedTenantId(tenantId);

    try {
      const response = await fetch("/api/user/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      if (!response.ok) {
        throw new Error("Could not switch company");
      }

      // Refresh session and redirect
      window.location.href = "/dashboard";
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not switch company",
        variant: "destructive",
      });
      setLoading(false);
      setSelectedTenantId(null);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Select company</CardTitle>
        <CardDescription>
          You have access to multiple companies. Select which company you want to work with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleSelectTenant(tenant.id)}
              disabled={loading || tenant.status === "CANCELLED" || tenant.status === "SUSPENDED"}
              className={`w-full text-left border rounded-lg p-4 transition-all ${
                loading && selectedTenantId === tenant.id
                  ? "border-blue-500 bg-blue-50"
                  : tenant.status === "ACTIVE" || tenant.status === "TRIAL"
                  ? "hover:border-blue-500 hover:shadow-md"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Building2 className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{tenant.name}</h3>
                      {lastTenantId === tenant.id && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Last used
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {getRoleLabel(tenant.role)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(tenant.status)}`}>
                        {getStatusLabel(tenant.status)}
                      </Badge>
                      {tenant.employeeCount && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {tenant.employeeCount} employees
                        </Badge>
                      )}
                      {tenant.industry && (
                        <Badge variant="outline" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {tenant.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {(tenant.status === "ACTIVE" || tenant.status === "TRIAL") && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

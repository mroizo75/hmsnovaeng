"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateTimeRegistrationConfig } from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";

interface TimeRegistrationEnableCardProps {
  tenantId: string;
  canEdit: boolean;
}

export function TimeRegistrationEnableCard({
  tenantId,
  canEdit,
}: TimeRegistrationEnableCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEnable = async (enabled: boolean) => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const res = await updateTimeRegistrationConfig(tenantId, {
        timeRegistrationEnabled: enabled,
      });
      if (!res.success) throw new Error(res.error);
      toast({ title: enabled ? "Time tracking enabled" : "Time tracking disabled" });
      window.location.reload();
    } catch (err) {
      toast({ variant: "destructive", title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enable Module</CardTitle>
        <CardDescription>
          Time tracking lets employees register hours and mileage per project.
          Manage projects, get an overview and export to Excel/PDF for accounting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="enable"
              disabled={loading}
              onCheckedChange={handleEnable}
            />
            <Label htmlFor="enable">
              Enable time tracking for this organization
            </Label>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask the administrator to enable time tracking in settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

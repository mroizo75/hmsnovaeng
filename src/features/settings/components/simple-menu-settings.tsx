"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { updateTenantSimpleMenuItems } from "@/server/actions/settings.actions";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import {
  DASHBOARD_NAV_CONFIG,
  DEFAULT_SIMPLE_MENU_HREFS,
} from "@/lib/dashboard-nav-config";
import { PanelLeft, RotateCcw } from "lucide-react";

interface SimpleMenuSettingsProps {
  initialSimpleMenuItems: string[] | null;
  isAdmin: boolean;
}

export function SimpleMenuSettings({
  initialSimpleMenuItems,
  isAdmin,
}: SimpleMenuSettingsProps) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const { visibleNavItems } = usePermissions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const eligibleItems = DASHBOARD_NAV_CONFIG.filter(
    (item) => visibleNavItems[item.permission as keyof typeof visibleNavItems]
  );

  useEffect(() => {
    const hrefs =
      initialSimpleMenuItems && Array.isArray(initialSimpleMenuItems)
        ? initialSimpleMenuItems
        : DEFAULT_SIMPLE_MENU_HREFS;
    setSelected(new Set(hrefs));
  }, [initialSimpleMenuItems]);

  const toggle = (href: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const resetToDefault = () => {
    setSelected(new Set(DEFAULT_SIMPLE_MENU_HREFS));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Ingen tilgang",
        description: "Kun administratorer kan endre enkel meny",
      });
      return;
    }
    setLoading(true);
    const hrefs = Array.from(selected);
    const result = await updateTenantSimpleMenuItems(hrefs);
    setLoading(false);
    if (result.success) {
      toast({
        title: "Enkel meny lagret",
        description: "Menyvalgene gjelder når brukere velger «Enkel» modus i dashboard.",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Kunne ikke lagre",
        description: result.error,
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Kun administratorer kan velge hvilke menypunkter som vises i enkel modus.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PanelLeft className="h-5 w-5" />
          Enkel meny
        </CardTitle>
        <CardDescription>
          Velg hvilke menypunkter som skal vises når brukere har «Enkel» modus aktivert i
          dashboard. Avansert modus viser alltid alle punkter du har tilgang til.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {eligibleItems.map((item) => (
            <div
              key={item.href}
              className="flex items-center space-x-2 rounded-lg border p-3"
            >
              <Checkbox
                id={`simple-${item.href}`}
                checked={selected.has(item.href)}
                onCheckedChange={() => toggle(item.href)}
              />
              <Label
                htmlFor={`simple-${item.href}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                {t(item.label)}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Lagrer…" : "Lagre valg"}
          </Button>
          <Button variant="outline" onClick={resetToDefault} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Tilbakestill til standard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

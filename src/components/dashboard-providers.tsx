"use client";

import { SimpleModeProvider } from "@/hooks/use-simple-mode";
import { SimpleMenuConfigProvider, type SimpleMenuItemsConfig } from "@/hooks/use-simple-menu-config";

interface DashboardProvidersProps {
  children: React.ReactNode;
  simpleMenuItems?: SimpleMenuItemsConfig;
}

export function DashboardProviders({ children, simpleMenuItems = null }: DashboardProvidersProps) {
  return (
    <SimpleMenuConfigProvider simpleMenuItems={simpleMenuItems ?? undefined}>
      <SimpleModeProvider>
        {children}
      </SimpleModeProvider>
    </SimpleMenuConfigProvider>
  );
}


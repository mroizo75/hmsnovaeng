"use client";

import { SimpleModeProvider } from "@/hooks/use-simple-mode";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <SimpleModeProvider>
      {children}
    </SimpleModeProvider>
  );
}


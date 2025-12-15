"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecuritySummaryCardsProps {
  controls: number;
  controlsImplemented: number;
  evidenceCount: number;
  assets: number;
  reviewsOpen: number;
}

export function SecuritySummaryCards({
  controls,
  controlsImplemented,
  evidenceCount,
  assets,
  reviewsOpen,
}: SecuritySummaryCardsProps) {
  const stats = [
    {
      title: "Kontroller",
      value: controls,
      subtitle: `${controlsImplemented} implementert`,
    },
    {
      title: "Evidens",
      value: evidenceCount,
      subtitle: "Siste 12 mnd",
    },
    {
      title: "Sikkerhetsobjekter",
      value: assets,
      subtitle: "Kritiske ressurser",
    },
    {
      title: "Tilgangsrevisjoner",
      value: reviewsOpen,
      subtitle: "Åpne runder",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


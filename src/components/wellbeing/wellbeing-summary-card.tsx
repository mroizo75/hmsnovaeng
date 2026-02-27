"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface WellbeingSummaryProps {
  year: number;
  onDataLoaded?: (summary: string) => void;
}

interface WellbeingSummaryData {
  year: number;
  totalResponses: number;
  overallScore: number;
  trend?: {
    previousYear: number;
    change: number;
    improving: boolean;
  };
  criticalIncidents: {
    mobbing: number;
    trakassering: number;
    press: number;
    konflikter: number;
  };
  topConcerns: string[];
  generatedRisks: number;
  implementedMeasures: number;
}

export function WellbeingSummaryCard({ year, onDataLoaded }: WellbeingSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WellbeingSummaryData | null>(null);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wellbeing/report/${year}`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        
        // Generate summary text for management review
        if (onDataLoaded) {
          const summary = generateSummaryText(result.data);
          onDataLoaded(summary);
        }
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching wellbeing data:", error);
      toast.error("Could not load psychosocial work environment data");
    } finally {
      setLoading(false);
    }
  };

  const generateSummaryText = (data: WellbeingSummaryData): string => {
    const totalCritical =
      data.criticalIncidents.mobbing +
      data.criticalIncidents.trakassering +
      data.criticalIncidents.press +
      data.criticalIncidents.konflikter;

    let text = `# Psychosocial Work Environment ${data.year}\n\n`;
    text += `**Total responses:** ${data.totalResponses}\n`;
    text += `**Overall score:** ${data.overallScore.toFixed(2)}/5.0\n\n`;

    if (data.trend) {
      const emoji = data.trend.improving ? "📈" : "📉";
      text += `**Trend:** ${emoji} ${data.trend.change > 0 ? "+" : ""}${data.trend.change.toFixed(2)} from ${year - 1} (${data.trend.previousYear.toFixed(2)})\n\n`;
    }

    if (totalCritical > 0) {
      text += `## ⚠️ Critical incidents reported: ${totalCritical}\n`;
      if (data.criticalIncidents.mobbing > 0) text += `- Bullying: ${data.criticalIncidents.mobbing}\n`;
      if (data.criticalIncidents.trakassering > 0) text += `- Harassment: ${data.criticalIncidents.trakassering}\n`;
      if (data.criticalIncidents.press > 0) text += `- Undue pressure: ${data.criticalIncidents.press}\n`;
      if (data.criticalIncidents.konflikter > 0) text += `- Unresolved conflicts: ${data.criticalIncidents.konflikter}\n`;
      text += `\n**IMPORTANT:** These issues require immediate follow-up in accordance with OSHA 29 CFR 1904.\n\n`;
    }

    if (data.topConcerns.length > 0) {
      text += `## Main Concerns\n`;
      data.topConcerns.forEach((concern) => {
        text += `- ${concern}\n`;
      });
      text += `\n`;
    }

    text += `## Actions\n`;
    text += `- Risk assessments created: ${data.generatedRisks}\n`;
    text += `- Actions implemented: ${data.implementedMeasures}\n\n`;

    if (data.overallScore >= 3.5) {
      text += `**Assessment:** The psychosocial work environment is assessed as satisfactory. Keep up the good work.\n`;
    } else if (data.overallScore >= 2.5) {
      text += `**Assessment:** The psychosocial work environment has areas for improvement that must be followed up.\n`;
    } else {
      text += `**Assessment:** ⚠️ The psychosocial work environment requires immediate follow-up and action.\n`;
    }

    return text;
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return "text-green-600";
    if (score >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 3.5) return "🟢";
    if (score >= 2.5) return "🟡";
    return "🔴";
  };

  const totalCritical = data
    ? data.criticalIncidents.mobbing +
      data.criticalIncidents.trakassering +
      data.criticalIncidents.press +
      data.criticalIncidents.konflikter
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Psychosocial Work Environment
          </CardTitle>
          <CardDescription>Summary for {year}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Psychosocial Work Environment
          </CardTitle>
          <CardDescription>Summary for {year}</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No psychosocial assessments for {year}</p>
            <p className="text-sm mt-1">Complete assessments to show data here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={totalCritical > 0 ? "border-red-200" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Psychosocial Work Environment
            </CardTitle>
            <CardDescription>Summary for {year}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main statistics */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Responses</div>
            <div className="text-2xl font-bold">{data.totalResponses}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Overall score</div>
            <div className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore.toFixed(2)} {getScoreEmoji(data.overallScore)}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${totalCritical > 0 ? "bg-red-50" : "bg-muted/50"}`}>
            <div className="text-sm text-muted-foreground">Critical incidents</div>
            <div className={`text-2xl font-bold ${totalCritical > 0 ? "text-red-600" : ""}`}>
              {totalCritical}
            </div>
          </div>
        </div>

        {/* Trend */}
        {data.trend && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
            {data.trend.improving ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm">
              <strong>Trend:</strong> {data.trend.change > 0 ? "+" : ""}
              {data.trend.change.toFixed(2)} from {year - 1}
            </span>
          </div>
        )}

        {/* Critical incidents */}
        {totalCritical > 0 && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Critical incidents reported</span>
            </div>
            <div className="space-y-1 text-sm text-red-800">
              {data.criticalIncidents.mobbing > 0 && <div>• Bullying: {data.criticalIncidents.mobbing}</div>}
              {data.criticalIncidents.trakassering > 0 && <div>• Harassment: {data.criticalIncidents.trakassering}</div>}
              {data.criticalIncidents.press > 0 && <div>• Undue pressure: {data.criticalIncidents.press}</div>}
              {data.criticalIncidents.konflikter > 0 && <div>• Unresolved conflicts: {data.criticalIncidents.konflikter}</div>}
            </div>
          </div>
        )}

        {/* Main concerns */}
        {data.topConcerns.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="font-medium text-yellow-900 mb-1">Main concerns</div>
            <ul className="text-sm text-yellow-800 space-y-1">
              {data.topConcerns.slice(0, 3).map((concern, idx) => (
                <li key={idx}>• {concern}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-blue-50 text-center">
            <div className="font-bold text-lg text-blue-600">{data.generatedRisks}</div>
            <div className="text-blue-700">Risks identified</div>
          </div>
          <div className="p-2 rounded bg-green-50 text-center">
            <div className="font-bold text-lg text-green-600">{data.implementedMeasures}</div>
            <div className="text-green-700">Actions implemented</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

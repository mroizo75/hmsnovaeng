"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WellbeingReportData {
  year: number;
  totalResponses: number;
  overallScore: number;
  sectionAverages: Array<{
    section: string;
    average: number;
    responseCount: number;
    trend?: number;
  }>;
  criticalIncidents: {
    mobbing: number;
    trakassering: number;
    press: number;
    konflikter: number;
  };
  topConcerns: string[];
  trend?: {
    previousYear: number;
    change: number;
    improving: boolean;
  };
  generatedRisks: number;
  implementedMeasures: number;
}

export function WellbeingReport() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [report, setReport] = useState<WellbeingReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Generate year list (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch report when year changes
  useEffect(() => {
    fetchReport(selectedYear);
  }, [selectedYear]);

  const fetchReport = async (year: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wellbeing/report/${year}`);
      const data = await response.json();

      if (data.success) {
        setReport(data.data);
      } else {
        setReport(null);
        if (data.error) {
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Could not load report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/wellbeing/report/${selectedYear}/pdf`);
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Could not generate PDF");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Psychosocial-Report-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Could not download PDF");
    } finally {
      setDownloading(false);
    }
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

  const getTrendIcon = (trend?: number) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const totalCritical =
    (report?.criticalIncidents.mobbing || 0) +
    (report?.criticalIncidents.trakassering || 0) +
    (report?.criticalIncidents.press || 0) +
    (report?.criticalIncidents.konflikter || 0);

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Annual Report – Psychosocial Work Environment</CardTitle>
              <CardDescription>
                Aggregated report based on all psychosocial assessments
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {report && (
                <Button onClick={downloadPDF} disabled={downloading}>
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading report...</span>
          </CardContent>
        </Card>
      ) : !report || report.totalResponses === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-muted-foreground text-center">
              No psychosocial assessments found for {selectedYear}
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Complete assessments to generate a report
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report.totalResponses}</div>
                <p className="text-xs text-muted-foreground mt-1">Total count</p>
              </CardContent>
            </Card>

            <Card className={totalCritical > 0 ? "border-red-200" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore.toFixed(2)} {getScoreEmoji(report.overallScore)}
                </div>
                {report.trend && (
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(report.trend.change)}
                    <span className="text-xs text-muted-foreground">
                      {report.trend.change > 0 ? "+" : ""}
                      {report.trend.change.toFixed(2)} from {selectedYear - 1}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={totalCritical > 0 ? "border-red-200 bg-red-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${totalCritical > 0 ? "text-red-600" : ""}`}>
                  {totalCritical}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCritical > 0 ? "Requires follow-up" : "None reported"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Critical incident details */}
          {totalCritical > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">🚨 Critical Incidents Reported</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {report.criticalIncidents.mobbing > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Bullying</span>
                      <span className="text-lg font-bold text-red-600">
                        {report.criticalIncidents.mobbing}
                      </span>
                    </div>
                  )}
                  {report.criticalIncidents.trakassering > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Harassment</span>
                      <span className="text-lg font-bold text-red-600">
                        {report.criticalIncidents.trakassering}
                      </span>
                    </div>
                  )}
                  {report.criticalIncidents.press > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Undue pressure</span>
                      <span className="text-lg font-bold text-red-600">
                        {report.criticalIncidents.press}
                      </span>
                    </div>
                  )}
                  {report.criticalIncidents.konflikter > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Unresolved conflicts</span>
                      <span className="text-lg font-bold text-red-600">
                        {report.criticalIncidents.konflikter}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Section Assessment</CardTitle>
              <CardDescription>Average score per area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.sectionAverages.map((section) => (
                  <div key={section.section} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getScoreEmoji(section.average)}</span>
                        <span className="font-medium">{section.section}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {section.trend !== undefined && (
                          <div className="flex items-center gap-1">
                            {getTrendIcon(section.trend)}
                            <span className="text-sm text-muted-foreground">
                              {section.trend > 0 ? "+" : ""}
                              {section.trend.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <span className={`text-lg font-bold ${getScoreColor(section.average)}`}>
                          {section.average.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          section.average >= 3.5
                            ? "bg-green-600"
                            : section.average >= 2.5
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${(section.average / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main concerns */}
          {report.topConcerns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Main Concerns</CardTitle>
                <CardDescription>Areas with the lowest scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {report.topConcerns.map((concern, idx) => (
                    <li key={idx} className="text-sm">
                      {concern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions and follow-up */}
          <Card>
            <CardHeader>
              <CardTitle>Actions and Follow-up</CardTitle>
              <CardDescription>Initiated and completed actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Risk assessments created</span>
                  <span className="text-2xl font-bold text-blue-600">{report.generatedRisks}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Actions implemented</span>
                  <span className="text-2xl font-bold text-green-600">
                    {report.implementedMeasures}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

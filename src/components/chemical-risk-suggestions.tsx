"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Lightbulb, Plus, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestRiskForChemical } from "@/server/actions/risk-chemical.actions";

interface ChemicalRiskSuggestionsProps {
  chemicalId: string;
  chemicalName: string;
  isCMR?: boolean;
  isSVHC?: boolean;
  containsIsocyanates?: boolean;
  hazardLevel?: number | null;
}

export function ChemicalRiskSuggestions({
  chemicalId,
  chemicalName,
  isCMR,
  isSVHC,
  containsIsocyanates,
  hazardLevel,
}: ChemicalRiskSuggestionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [chemicalId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const result = await suggestRiskForChemical(chemicalId);

      if (result.success && result.data) {
        setSuggestions(result.data);
      }
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async (suggestion: any, index: number) => {
    setCreating(index);

    try {
      const response = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          context: suggestion.context,
          category: suggestion.category,
          likelihood: suggestion.likelihood,
          consequence: suggestion.consequence,
          score: suggestion.likelihood * suggestion.consequence,
          chemicalId,
          exposure: suggestion.exposure,
          suggestedControls: suggestion.suggestedControls,
          trainingRequired: suggestion.trainingRequired,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create risk");
      }

      const { risk } = await response.json();

      toast({
        title: "✅ Risk assessment created",
        description: `"${suggestion.title}" has been registered`,
        className: "bg-green-50 border-green-200",
      });

      // Remove suggestion from list
      setSuggestions((prev) => prev.filter((_, i) => i !== index));

      // Navigate to the new risk
      router.push(`/dashboard/risks/${risk.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not create risk assessment",
      });
    } finally {
      setCreating(null);
    }
  };

  // Don't show component if there are no hazardous properties
  if (!isCMR && !isSVHC && !containsIsocyanates && (!hazardLevel || hazardLevel < 4)) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-3 text-blue-800">Analyzing risk...</span>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const suggestionsContent = (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.context}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="bg-gray-50">
                        {suggestion.category}
                      </Badge>
                      <Badge
                        className={
                          suggestion.exposure === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : suggestion.exposure === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        Exposure: {suggestion.exposure}
                      </Badge>
                      <Badge variant="outline">
                        Risk: {suggestion.likelihood} × {suggestion.consequence} ={" "}
                        {suggestion.likelihood * suggestion.consequence}
                      </Badge>
                    </div>

                    {suggestion.suggestedControls && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-blue-900 mb-2">
                          Suggested controls:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {suggestion.suggestedControls.map(
                            (control: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{control}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {suggestion.trainingRequired &&
                      suggestion.trainingRequired.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg mt-2">
                          <p className="font-medium text-sm text-purple-900 mb-2">
                            Required training:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.trainingRequired.map(
                              (course: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800"
                                >
                                  {course}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleCreateRisk(suggestion, index)}
                disabled={creating !== null}
                className="flex-shrink-0"
              >
                {creating === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create risk
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-xs text-amber-700 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          <strong>ISO requirement:</strong> Hazardous chemicals must be risk assessed (ISO
          45001: 6.1.2, ISO 14001: 6.1.2). CMR substances and diisocyanates require
          mandatory training and special safety measures.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100">
          <Lightbulb className="mr-2 h-4 w-4 text-amber-600" />
          Tip: Suggested risk assessments ({suggestions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-900">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Suggested risk assessments
          </DialogTitle>
          <DialogDescription>
            Automatically generated based on chemical data and ISO standards. Create a risk to add it to the risk register.
          </DialogDescription>
        </DialogHeader>
        {suggestionsContent}
      </DialogContent>
    </Dialog>
  );
}

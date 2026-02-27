"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createChemical, updateChemical } from "@/server/actions/chemical.actions";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import type { Chemical } from "@prisma/client";
import { HazardPictogramSelector } from "./hazard-pictogram-selector";
import { PPESelector } from "./ppe-selector";

interface ChemicalFormProps {
  chemical?: Chemical;
  mode?: "create" | "edit";
}

export function ChemicalForm({ chemical, mode = "create" }: ChemicalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sdsFile, setSdsFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  const handleSDSUpload = async (file: File) => {
    setSdsFile(file);
    setParsing(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/chemicals/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload failed");
      }

      const { key } = await uploadRes.json();

      toast({
        title: "🤖 AI analyzing safety data sheet",
        description: "Extracting text and analyzing content...",
      });

      const parseRes = await fetch("/api/chemicals/parse-sds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdsKey: key }),
      });

      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || "AI parsing failed");
      }

      const { data } = await parseRes.json();
      setAiData(data);

      toast({
        title: "✅ AI analysis complete",
        description: "Fields have been filled in automatically - review and adjust as needed",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "AI parsing error",
        description: error.message || "Could not analyze the safety data sheet. Please fill in manually.",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      let sdsKey: string | undefined;
      if (sdsFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", sdsFile);

        const uploadRes = await fetch("/api/chemicals/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "File upload failed");
        }

        const uploadData = await uploadRes.json();
        sdsKey = uploadData.key;
      }

      const data = {
        productName: formData.get("productName") as string,
        supplier: formData.get("supplier") as string || undefined,
        casNumber: formData.get("casNumber") as string || undefined,
        hazardClass: formData.get("hazardClass") as string || undefined,
        hazardStatements: formData.get("hazardStatements") as string || undefined,
        warningPictograms: formData.get("warningPictograms") as string || undefined,
        requiredPPE: formData.get("requiredPPE") as string || undefined,
        containsIsocyanates: formData.get("containsIsocyanates") === "on",
        sdsKey: sdsKey || undefined,
        sdsVersion: formData.get("sdsVersion") as string || undefined,
        sdsDate: formData.get("sdsDate") as string || undefined,
        nextReviewDate: formData.get("nextReviewDate") as string || undefined,
        location: formData.get("location") as string || undefined,
        quantity: formData.get("quantity") as string || undefined,
        unit: formData.get("unit") as string || undefined,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string || undefined,
      };

      const result =
        mode === "edit" && chemical
          ? await updateChemical(chemical.id, data)
          : await createChemical(data);

      if (result.success) {
        toast({
          title: mode === "edit" ? "✅ Chemical updated" : "✅ Chemical registered",
          description: mode === "edit" ? "Changes have been saved" : "The product has been added to the chemical registry",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/chemicals");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not save chemical",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Safety Data Sheet */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 1: Upload Safety Data Sheet
          </CardTitle>
          <CardDescription>
            Upload PDF – AI will analyze and fill in the fields below automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sdsFile" className="flex items-center gap-2">
              Safety Data Sheet (PDF) {mode === "create" && "*"}
              {parsing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="sdsFile"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleSDSUpload(file);
                  }
                }}
                disabled={loading || parsing}
              />
              {chemical?.sdsKey && !sdsFile && (
                <Button variant="outline" size="sm" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Existing
                </Button>
              )}
            </div>
            {parsing && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-900">
                  AI analyzing safety data sheet... This takes approximately 30-60 seconds
                </p>
              </div>
            )}
            {!chemical?.sdsKey && mode === "create" && !parsing && (
              <p className="text-xs text-blue-600">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI will automatically fill in fields when you upload the safety data sheet
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sdsVersion">Version</Label>
              <Input
                id="sdsVersion"
                name="sdsVersion"
                placeholder="e.g. 3.2"
                disabled={loading}
                defaultValue={chemical?.sdsVersion || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sdsDate">SDS Date</Label>
              <Input
                id="sdsDate"
                name="sdsDate"
                type="date"
                disabled={loading}
                defaultValue={
                  chemical?.sdsDate
                    ? new Date(chemical.sdsDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextReviewDate">Next Review</Label>
              <Input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                disabled={loading}
                defaultValue={
                  chemical?.nextReviewDate
                    ? new Date(chemical.nextReviewDate).toISOString().split("T")[0]
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                }
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Annual review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Product Information
          </CardTitle>
          <CardDescription>Basic information about the chemical</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">AI has filled in fields automatically</p>
                <p className="text-xs text-green-700">
                  Review and adjust information if necessary
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productName">
              Product Name * {aiData?.productName && <Badge variant="secondary" className="ml-2 text-xs">AI-filled</Badge>}
            </Label>
            <Input
              id="productName"
              name="productName"
              placeholder="e.g. Cleaning Agent XYZ"
              required
              disabled={loading}
              key={aiData?.productName || "default"}
              defaultValue={aiData?.productName || chemical?.productName || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier {aiData?.supplier && <Badge variant="secondary" className="ml-2 text-xs">AI-filled</Badge>}
              </Label>
              <Input
                id="supplier"
                name="supplier"
                placeholder="Supplier name"
                disabled={loading}
                key={aiData?.supplier || "default"}
                defaultValue={aiData?.supplier || chemical?.supplier || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="casNumber">
                CAS Number {aiData?.casNumber && <Badge variant="secondary" className="ml-2 text-xs">AI-filled</Badge>}
              </Label>
              <Input
                id="casNumber"
                name="casNumber"
                placeholder="000-00-0"
                disabled={loading}
                key={aiData?.casNumber || "default"}
                defaultValue={aiData?.casNumber || chemical?.casNumber || ""}
              />
              <p className="text-xs text-muted-foreground">
                Unique identification number for the chemical substance
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Warehouse A, shelf 3"
                disabled={loading}
                defaultValue={chemical?.location || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" required disabled={loading} defaultValue={chemical?.status || "ACTIVE"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">In Use</SelectItem>
                  <SelectItem value="PHASED_OUT">Being Phased Out</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                placeholder="10"
                disabled={loading}
                defaultValue={chemical?.quantity || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" disabled={loading} defaultValue={chemical?.unit || "liter"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="stk">Piece</SelectItem>
                  <SelectItem value="m3">Cubic Meter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Hazard Pictograms and Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Hazard Labeling (GHS/HazCom)</CardTitle>
          <CardDescription>H-statements and warning pictograms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hazardStatements">
              H-Statements {aiData?.hazardStatements && <Badge variant="secondary" className="ml-2 text-xs">AI-filled</Badge>}
            </Label>
            <Textarea
              id="hazardStatements"
              name="hazardStatements"
              rows={3}
              placeholder="e.g. H226 (Flammable liquid and vapor), H315 (Causes skin irritation)"
              disabled={loading}
              key={aiData?.hazardStatements || "default"}
              defaultValue={aiData?.hazardStatements || chemical?.hazardStatements || ""}
            />
            <p className="text-xs text-muted-foreground">
              Hazard statements
            </p>
          </div>

          <div>
            {aiData?.warningPictograms && <Badge variant="secondary" className="mb-2 text-xs">AI-filled</Badge>}
            <HazardPictogramSelector 
              key={aiData?.warningPictograms || "default"}
              defaultValue={aiData?.warningPictograms || chemical?.warningPictograms || ""} 
            />
          </div>

          {/* Diisocyanates warning */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center h-5">
              <Checkbox 
                id="containsIsocyanates" 
                name="containsIsocyanates"
                disabled={loading}
                key={aiData?.containsIsocyanates?.toString() || "default"}
                defaultChecked={aiData?.containsIsocyanates || chemical?.containsIsocyanates || false}
              />
            </div>
            <div className="flex-1">
              <Label 
                htmlFor="containsIsocyanates" 
                className="text-sm font-medium text-orange-900 flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4" />
                Contains Diisocyanates
                {aiData?.containsIsocyanates && <Badge variant="secondary" className="ml-2 text-xs">AI-detected</Badge>}
              </Label>
              <p className="text-xs text-orange-800 mt-1">
                Products with diisocyanates require mandatory training (EU Regulation 2020/1149). 
                AI detects this automatically during SDS analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Personal Protective Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Personal Protective Equipment (PPE)</CardTitle>
          <CardDescription>Required protective equipment when handling (ISO 7010 / OSHA 29 CFR 1910.132)</CardDescription>
        </CardHeader>
        <CardContent>
          {aiData?.requiredPPE && <Badge variant="secondary" className="mb-2 text-xs">AI-suggested</Badge>}
          <PPESelector 
            key={aiData?.requiredPPE || "default"}
            defaultValue={aiData?.requiredPPE || chemical?.requiredPPE || ""} 
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes and comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Special handling instructions, restrictions, etc..."
              disabled={loading}
              defaultValue={chemical?.notes || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-blue-900 mb-2">
            📋 EHS Requirements and Best Practices
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>All chemicals must have an updated Safety Data Sheet (OSHA HazCom 2012 / GHS)</li>
            <li>Review safety data sheets at minimum annually</li>
            <li>Ensure employees have access to relevant safety data sheets</li>
            <li>Document training on safe handling procedures</li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || (mode === "create" && !sdsFile)}>
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Register Chemical"}
        </Button>
      </div>
    </form>
  );
}

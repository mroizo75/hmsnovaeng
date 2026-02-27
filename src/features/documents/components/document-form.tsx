"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createDocument } from "@/server/actions/document.actions";
import { useToast } from "@/hooks/use-toast";

interface DocumentFormProps {
  tenantId: string;
  userId: string;
  owners: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
    defaultReviewIntervalMonths: number;
    isGlobal: boolean;
    pdcaGuidance?: Record<string, string> | null;
  }>;
}

const documentKinds = [
  { value: "LAW", label: "Laws and regulations" },
  { value: "PLAN", label: "HSE manual / Plan" },
  { value: "PROCEDURE", label: "Procedure (ISO 9001)" },
  { value: "CHECKLIST", label: "Checklist" },
  { value: "FORM", label: "Form" },
  { value: "SDS", label: "Safety Data Sheet (SDS)" },
  { value: "OTHER", label: "Other" },
];

const userRoles = [
  { value: "ADMIN", label: "Admin" },
  { value: "HMS", label: "HSE Manager" },
  { value: "LEDER", label: "Manager" },
  { value: "VERNEOMBUD", label: "Safety Representative" },
  { value: "ANSATT", label: "Employee" },
  { value: "BHT", label: "OHS" },
  { value: "REVISOR", label: "Auditor" },
];

const NO_OWNER_VALUE = "__none_owner__";
const NO_TEMPLATE_VALUE = "__none_template__";

export function DocumentForm({ tenantId, userId, owners, templates }: DocumentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(NO_TEMPLATE_VALUE);
  const [selectedOwner, setSelectedOwner] = useState(userId);
  const [reviewInterval, setReviewInterval] = useState("12");
  const [reviewIntervalTouched, setReviewIntervalTouched] = useState(false);
  const [pdca, setPdca] = useState({ plan: "", do: "", check: "", act: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateMap = useMemo(() => {
    const map = new Map<string, (typeof templates)[number]>();
    templates.forEach((template) => map.set(template.id, template));
    return map;
  }, [templates]);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value === NO_TEMPLATE_VALUE) return;

    const template = templateMap.get(value);
    if (!template) return;

    if (!reviewIntervalTouched && template.defaultReviewIntervalMonths) {
      setReviewInterval(String(template.defaultReviewIntervalMonths));
    }

    const guidance = template.pdcaGuidance || {};
    setPdca((prev) => ({
      plan: prev.plan || guidance.plan || "",
      do: prev.do || guidance.do || "",
      check: prev.check || guidance.check || "",
      act: prev.act || guidance.act || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("tenantId", tenantId);
    formData.set("uploadedBy", userId);
    formData.set("visibleToRoles", JSON.stringify(selectedRoles));
    formData.set("ownerId", selectedOwner === NO_OWNER_VALUE ? "" : selectedOwner);
    formData.set("templateId", selectedTemplate === NO_TEMPLATE_VALUE ? "" : selectedTemplate);
    formData.set("reviewIntervalMonths", reviewInterval);
    formData.set("planSummary", pdca.plan);
    formData.set("doSummary", pdca.do);
    formData.set("checkSummary", pdca.check);
    formData.set("actSummary", pdca.act);

    try {
      const result = await createDocument(formData);

      if (result.success) {
        toast({
          title: "✅ Document uploaded",
          description: "The document has been created",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/documents");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: result.error || "Could not upload document",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document information</CardTitle>
          <CardDescription>ISO 9001: Create a new document or procedure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="E.g. HSE Manual 2025"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kind">Document type *</Label>
              <Select name="kind" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentKinds.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                name="version"
                placeholder="v1.0"
                defaultValue="v1.0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Process owner</Label>
              <Select
                value={selectedOwner}
                onValueChange={setSelectedOwner}
                disabled={loading || owners.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={owners.length ? "Select responsible" : "No users available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER_VALUE}>None</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name || owner.email} ({owner.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">Document template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={loading || templates.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={templates.length ? "Select template (optional)" : "No templates available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TEMPLATE_VALUE}>None</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.isGlobal ? "• Global" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate !== NO_TEMPLATE_VALUE && (
                <p className="text-xs text-muted-foreground">
                  {templateMap.get(selectedTemplate)?.description ?? "Template selected"}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reviewIntervalMonths">Review interval (months)</Label>
              <Input
                id="reviewIntervalMonths"
                name="reviewIntervalMonths"
                type="number"
                min={1}
                max={36}
                value={reviewInterval}
                onChange={(event) => {
                  setReviewIntervalTouched(true);
                  setReviewInterval(event.target.value);
                }}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective from</Label>
              <Input
                id="effectiveFrom"
                name="effectiveFrom"
                type="date"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveTo">Effective to</Label>
              <Input
                id="effectiveTo"
                name="effectiveTo"
                type="date"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDCA cycle</CardTitle>
          <CardDescription>ISO 9001: Plan, Do, Check, Act (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planSummary">Plan</Label>
              <Textarea
                id="planSummary"
                name="planSummary"
                value={pdca.plan}
                onChange={(event) => setPdca((prev) => ({ ...prev, plan: event.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doSummary">Do</Label>
              <Textarea
                id="doSummary"
                name="doSummary"
                value={pdca.do}
                onChange={(event) => setPdca((prev) => ({ ...prev, do: event.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkSummary">Check</Label>
              <Textarea
                id="checkSummary"
                name="checkSummary"
                value={pdca.check}
                onChange={(event) => setPdca((prev) => ({ ...prev, check: event.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actSummary">Act</Label>
              <Textarea
                id="actSummary"
                name="actSummary"
                value={pdca.act}
                onChange={(event) => setPdca((prev) => ({ ...prev, act: event.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access control</CardTitle>
          <CardDescription>
            Select which roles should have access to the document (leave blank = visible to all)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userRoles.map((role) => (
              <div key={role.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.value}`}
                  checked={selectedRoles.includes(role.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRoles([...selectedRoles, role.value]);
                    } else {
                      setSelectedRoles(selectedRoles.filter((r) => r !== role.value));
                    }
                  }}
                  disabled={loading}
                />
                <Label
                  htmlFor={`role-${role.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
          {selectedRoles.length > 0 ? (
            <p className="text-sm text-blue-600 mt-4">
              ✓ Selected: {selectedRoles.map((role) => userRoles.find((r) => r.value === role)?.label).join(", ")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">📢 Visible to all roles</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File</CardTitle>
          <CardDescription>Upload PDF, Word document, or other document type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              required
              disabled={loading}
              ref={fileInputRef}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, Word, Excel, PowerPoint, TXT, CSV (max 10 MB)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload document"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

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
import { createIncident } from "@/server/actions/incident.actions";
import { useToast } from "@/hooks/use-toast";
import type { IncidentType } from "@prisma/client";

interface IncidentFormProps {
  tenantId: string;
  userId: string;
  risks: Array<{ id: string; title: string; category: string; score: number }>;
  defaultType?: IncidentType;
}

const incidentTypes: Array<{ value: IncidentType; label: string; desc: string }> = [
  { value: "AVVIK", label: "Incident", desc: "Deviation from procedures or requirements" },
  { value: "NESTEN", label: "Near Miss", desc: "Incident that could have caused harm" },
  { value: "SKADE", label: "Personal Injury", desc: "Injury to a person" },
  { value: "MILJO", label: "Environmental Incident", desc: "Spill, release, or environmental damage" },
  { value: "KVALITET", label: "Quality Incident", desc: "Product/service quality" },
  { value: "CUSTOMER", label: "Customer Complaint", desc: "ISO 10002: Customer and user feedback" },
];

const severityLevels = [
  { value: 1, label: "1 - Insignificant", desc: "No consequences" },
  { value: 2, label: "2 - Minor", desc: "Minor consequences" },
  { value: 3, label: "3 - Moderate", desc: "Noticeable consequences" },
  { value: 4, label: "4 - Serious", desc: "Major consequences" },
  { value: 5, label: "5 - Critical", desc: "Very serious consequences" },
];

const NO_RISK_REFERENCE_VALUE = "__none_risk_reference__";

export function IncidentForm({ tenantId, userId, risks = [], defaultType }: IncidentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | "">(defaultType || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawRiskReferenceId = formData.get("riskReferenceId") as string | null;
    const data = {
      tenantId,
      type: formData.get("type") as IncidentType,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      severity: parseInt(formData.get("severity") as string),
      occurredAt: formData.get("occurredAt") as string,
      reportedBy: userId,
      location: formData.get("location") as string || undefined,
      witnessName: formData.get("witnessName") as string || undefined,
      immediateAction: formData.get("immediateAction") as string || undefined,
      injuryType: formData.get("injuryType") as string || undefined,
      medicalAttentionRequired: formData.get("medicalAttentionRequired") === "yes",
      lostTimeMinutes: formData.get("lostTimeMinutes")
        ? parseInt(formData.get("lostTimeMinutes") as string, 10)
        : undefined,
      riskReferenceId:
        rawRiskReferenceId && rawRiskReferenceId !== NO_RISK_REFERENCE_VALUE
          ? rawRiskReferenceId
          : undefined,
      customerName: formData.get("customerName") as string || undefined,
      customerEmail: formData.get("customerEmail") as string || undefined,
      customerPhone: formData.get("customerPhone") as string || undefined,
      customerTicketId: formData.get("customerTicketId") as string || undefined,
      responseDeadline: formData.get("responseDeadline") as string || undefined,
      customerSatisfaction: formData.get("customerSatisfaction")
        ? parseInt(formData.get("customerSatisfaction") as string, 10)
        : undefined,
    };

    try {
      const result = await createIncident(data);

      if (result.success) {
        const redirectRoute = result.data?.type === "CUSTOMER" ? "/dashboard/complaints" : "/dashboard/incidents";
        toast({
          title: "✅ Incident reported",
          description: "The incident has been recorded and will be followed up",
          className: "bg-green-50 border-green-200",
        });
        router.push(redirectRoute);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not report incident",
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
          <CardTitle>Basic information</CardTitle>
          <CardDescription>ISO 9001: Report what happened</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Incident type *</Label>
              <Select
                name="type"
                required
                disabled={loading}
                value={selectedType || undefined}
                onValueChange={(value) => setSelectedType(value as IncidentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  {incidentTypes.find(t => t.value === selectedType)?.desc}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select name="severity" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="E.g. Fall from ladder during warehouse work"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe in detail what happened, when, where and who was involved"
              required
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occurredAt">When did it happen? *</Label>
              <Input
                id="occurredAt"
                name="occurredAt"
                type="datetime-local"
                required
                disabled={loading}
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Where did it happen?</Label>
              <Input
                id="location"
                name="location"
                placeholder="E.g. Warehouse 2, Production Hall A"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="witnessName">Witnesses (name)</Label>
            <Input
              id="witnessName"
              name="witnessName"
              placeholder="Names of witnesses to the incident"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {selectedType === "CUSTOMER" && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Complaint</CardTitle>
            <CardDescription>ISO 10002: Record who is complaining and how the case should be handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Name of customer/company"
                  disabled={loading}
                  required={selectedType === "CUSTOMER"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer email</Label>
                <Input id="customerEmail" name="customerEmail" type="email" placeholder="customer@company.com" disabled={loading} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input id="customerPhone" name="customerPhone" placeholder="+1 555 000 0000" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerTicketId">Reference / case no.</Label>
                <Input
                  id="customerTicketId"
                  name="customerTicketId"
                  placeholder="E.g. Zendesk #124"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="responseDeadline">Promised response deadline</Label>
                <Input id="responseDeadline" name="responseDeadline" type="date" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSatisfaction">Satisfaction (1-5)</Label>
                <Select name="customerSatisfaction" disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Injury and follow-up</CardTitle>
          <CardDescription>ISO 45001: Document personal injury and link to risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="injuryType">Injury type</Label>
              <Input
                id="injuryType"
                name="injuryType"
                placeholder="E.g. Cut, fall injury, chemical exposure"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalAttentionRequired">Medical attention</Label>
              <Select
                name="medicalAttentionRequired"
                defaultValue="no"
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Was a doctor involved?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes, medical attention required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lostTimeMinutes">Lost time (minutes)</Label>
              <Input
                id="lostTimeMinutes"
              name="lostTimeMinutes"
                type="number"
                min={0}
                placeholder="Number of minutes/hours absent"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskReferenceId">Link to risk assessment</Label>
              <Select
                name="riskReferenceId"
                disabled={loading || risks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={risks.length ? "Select risk (optional)" : "No risks available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_RISK_REFERENCE_VALUE}>None</SelectItem>
                  {risks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id}>
                      {risk.title} · Score {risk.score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Immediate actions</CardTitle>
          <CardDescription>
            ISO 9001: What was done immediately to control the situation?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="immediateAction">Immediate actions</Label>
            <Textarea
              id="immediateAction"
              name="immediateAction"
              placeholder="E.g. Stopped work, cleared the area, secured witnesses, notified manager..."
              disabled={loading}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Describe what was done to handle the situation immediately
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 ISO 9001 - Incident Management</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>After reporting:</strong></p>
          <ul className="space-y-1 list-disc list-inside ml-4">
            <li>Manager will investigate the cause (root cause analysis)</li>
            <li>Corrective actions will be planned</li>
            <li>The effectiveness of actions will be evaluated</li>
            <li>Lessons learned will be documented</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Reporting..." : "Report incident"}
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

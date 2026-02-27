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
import { Card, CardContent } from "@/components/ui/card";
import { createAudit, updateAudit } from "@/server/actions/audit.actions";
import { useToast } from "@/hooks/use-toast";
import type { Audit } from "@prisma/client";

interface AuditFormProps {
  tenantId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
  audit?: Audit;
  mode?: "create" | "edit";
}

export function AuditForm({ tenantId, users, audit, mode = "create" }: AuditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    audit?.teamMemberIds ? JSON.parse(audit.teamMemberIds) : []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as string;

    const data = {
      tenantId,
      title: formData.get("title") as string,
      auditType: formData.get("auditType") as string,
      scope: formData.get("scope") as string,
      criteria: formData.get("criteria") as string,
      leadAuditorId: formData.get("leadAuditorId") as string,
      teamMemberIds: selectedTeamMembers,
      scheduledDate: formData.get("scheduledDate") as string,
      area: formData.get("area") as string,
      department: formData.get("department") as string || undefined,
      status,
      ...(status === "COMPLETED" && !audit?.completedAt ? { completedAt: new Date() } : {}),
      summary: formData.get("summary") as string || undefined,
      conclusion: formData.get("conclusion") as string || undefined,
    };

    try {
      const result =
        mode === "edit" && audit
          ? await updateAudit({ id: audit.id, ...data })
          : await createAudit(data);

      if (result.success) {
        toast({
          title: mode === "edit" ? "✅ Audit updated" : "✅ Audit created",
          description: mode === "edit" ? "Changes have been saved" : "The audit has been planned",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/audits");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not save audit",
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
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="E.g. Q1 2025 Internal HSE Audit"
              required
              disabled={loading}
              defaultValue={audit?.title}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="auditType">Audit type *</Label>
              <Select
                name="auditType"
                required
                disabled={loading}
                defaultValue={audit?.auditType || "INTERNAL"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal Audit</SelectItem>
                  <SelectItem value="EXTERNAL">External Audit</SelectItem>
                  <SelectItem value="SUPPLIER">Supplier Audit</SelectItem>
                  <SelectItem value="CERTIFICATION">Certification Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                required
                disabled={loading}
                defaultValue={audit?.status || "PLANNED"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope (ISO 9001) *</Label>
            <Textarea
              id="scope"
              name="scope"
              rows={3}
              placeholder="Describe what is to be audited. E.g. 'HSE system and procedures for departments A and B, with focus on risk assessments and training'"
              required
              disabled={loading}
              minLength={20}
              defaultValue={audit?.scope}
            />
            <p className="text-sm text-muted-foreground">
              ISO 9001: Clearly define what will be covered by the audit
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteria">Audit criteria (ISO 9001) *</Label>
            <Textarea
              id="criteria"
              name="criteria"
              rows={3}
              placeholder="What requirements and standards will the audit be assessed against? E.g. 'ISO 9001:2015 clause 7.2 (Competence), 8.5 (Production), internal HSE procedures'"
              required
              disabled={loading}
              minLength={20}
              defaultValue={audit?.criteria}
            />
            <p className="text-sm text-muted-foreground">
              ISO 9001: Specify which requirements and standards will be used
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                name="area"
                placeholder="E.g. HSE, Quality, Environment"
                required
                disabled={loading}
                defaultValue={audit?.area}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department (optional)</Label>
              <Input
                id="department"
                name="department"
                placeholder="E.g. Production, Warehouse"
                disabled={loading}
                defaultValue={audit?.department || ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leadAuditorId">Lead Auditor (ISO 9001) *</Label>
              <Select
                name="leadAuditorId"
                required
                disabled={loading}
                defaultValue={audit?.leadAuditorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead auditor" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                ISO 9001: Ensure objectivity and impartiality
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled date *</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                required
                disabled={loading}
                defaultValue={
                  audit?.scheduledDate
                    ? new Date(audit.scheduledDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audit team (optional)</Label>
            <div className="border rounded-lg p-4 space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`team-${user.id}`}
                    checked={selectedTeamMembers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeamMembers([...selectedTeamMembers, user.id]);
                      } else {
                        setSelectedTeamMembers(
                          selectedTeamMembers.filter((id) => id !== user.id)
                        );
                      }
                    }}
                    className="h-4 w-4"
                    disabled={loading}
                  />
                  <Label htmlFor={`team-${user.id}`} className="font-normal">
                    {user.name || user.email}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Select multiple people to participate in the audit
            </p>
          </div>

          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (optional)</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  rows={4}
                  placeholder="Summarize the audit when it is completed..."
                  disabled={loading}
                  defaultValue={audit?.summary || ""}
                />
                <p className="text-sm text-muted-foreground">
                  Can also be added using the "Complete audit" button
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conclusion">Conclusion (optional)</Label>
                <Textarea
                  id="conclusion"
                  name="conclusion"
                  rows={4}
                  placeholder="Conclusion and recommendations..."
                  disabled={loading}
                  defaultValue={audit?.conclusion || ""}
                />
                <p className="text-sm text-muted-foreground">
                  Can also be added using the "Complete audit" button
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            📋 ISO 9001 - 9.2 Internal Audit
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Clearly define scope and criteria</li>
            <li>Select objective and impartial auditors</li>
            <li>Schedule audits at regular intervals</li>
            <li>Document all findings and observations</li>
            <li>Report results to relevant management</li>
            <li>Take corrective actions without undue delay</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Create audit"}
        </Button>
      </div>
    </form>
  );
}

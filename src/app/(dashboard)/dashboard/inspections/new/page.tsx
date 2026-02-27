"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface TenantUser {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}


const riskCategoryOptions = [
  { value: "SAFETY", label: "Safety" },
  { value: "HEALTH", label: "Health" },
  { value: "ENVIRONMENTAL", label: "Environment" },
  { value: "OPERATIONAL", label: "Operational" },
  { value: "LEGAL", label: "Legal" },
  { value: "INFORMATION_SECURITY", label: "Information Security" },
];

const NO_TEMPLATE_VALUE = "__none_template__";
const NO_RISK_CATEGORY_VALUE = "__none_risk__";
const NO_FOLLOWUP_VALUE = "__none_followup__";

export default function NewInspectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formTemplates, setFormTemplates] = useState<any[]>([]);
  const [loadingFormTemplates, setLoadingFormTemplates] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "VERNERUNDE",
    scheduledDate: "",
    location: "",
    conductedBy: "",
    formTemplateId: NO_TEMPLATE_VALUE,
    riskCategory: NO_RISK_CATEGORY_VALUE,
    area: "",
    durationMinutes: "",
    followUpById: NO_FOLLOWUP_VALUE,
    nextInspection: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.tenantId) return;

      try {
        const response = await fetch(`/api/tenants/${session.user.tenantId}/users`);
        const data = await response.json();

        if (response.ok && data.users) {
          setUsers(data.users);
          if (session.user.id) {
            setFormData((prev) => ({ ...prev, conductedBy: session.user.id || "" }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session?.user?.tenantId, session?.user?.id]);

  useEffect(() => {
    const fetchFormTemplates = async () => {
      try {
        const response = await fetch("/api/forms?category=INSPECTION");
        const data = await response.json();
        if (response.ok && data.forms) {
          setFormTemplates(data.forms);
        }
      } catch (error) {
        console.error("Failed to fetch form templates:", error);
      } finally {
        setLoadingFormTemplates(false);
      }
    };

    fetchFormTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        formTemplateId: formData.formTemplateId === NO_TEMPLATE_VALUE ? undefined : formData.formTemplateId,
        riskCategory: formData.riskCategory === NO_RISK_CATEGORY_VALUE ? undefined : formData.riskCategory,
        followUpById: formData.followUpById === NO_FOLLOWUP_VALUE ? undefined : formData.followUpById,
        durationMinutes: formData.durationMinutes
          ? Number(formData.durationMinutes)
          : undefined,
      };

      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create inspection");
      }

      toast({
        title: "Inspection created",
        description: "The inspection has been created and is ready for execution",
      });

      router.push(`/dashboard/inspections/${data.data.inspection.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inspections">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Inspection</h1>
          <p className="text-muted-foreground">
            Create a new safety inspection or H&S inspection
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
          <CardDescription>
            Fill in the information below to plan the inspection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="E.g. Quarterly Safety Inspection - Production"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERNERUNDE">Safety Inspection</SelectItem>
                    <SelectItem value="HMS_INSPEKSJON">H&S Inspection</SelectItem>
                    <SelectItem value="BRANNØVELSE">Fire Drill</SelectItem>
                    <SelectItem value="SHA_PLAN">SHA Plan</SelectItem>
                    <SelectItem value="SIKKERHETSVANDRING">Safety Walk</SelectItem>
                    <SelectItem value="ANDRE">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formTemplateId">📋 Inspection Form</Label>
                <Select
                  value={formData.formTemplateId}
                  onValueChange={(value) => {
                    if (value === NO_TEMPLATE_VALUE) {
                      setFormData((prev) => ({
                        ...prev,
                        formTemplateId: NO_TEMPLATE_VALUE,
                      }));
                      return;
                    }

                    const selected = formTemplates.find((template) => template.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      formTemplateId: value,
                      title: prev.title || selected?.title || prev.title,
                      description: prev.description || selected?.description || prev.description,
                    }));
                  }}
                  disabled={loadingFormTemplates}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingFormTemplates ? "Loading forms..." : "Select form (recommended)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEMPLATE_VALUE}>No form</SelectItem>
                    {formTemplates.length === 0 && !loadingFormTemplates && (
                      <div className="px-2 py-6 text-sm text-muted-foreground text-center">
                        <p className="font-semibold">No inspection forms found</p>
                        <p className="text-xs mt-2">Create a form first:</p>
                        <ol className="text-xs mt-2 text-left space-y-1">
                          <li>1. Go to Forms → New Form</li>
                          <li>2. Select category "Inspection / Safety Inspection"</li>
                          <li>3. Build the form and save</li>
                          <li>4. Come back here and select the form</li>
                        </ol>
                      </div>
                    )}
                    {formTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        📋 {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formTemplates.length === 0 && !loadingFormTemplates && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-900 font-medium">
                      💡 Create your own inspection form
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Go to <strong>Forms</strong> → <strong>New Form</strong> and select category <strong>"Inspection / Safety Inspection"</strong>
                    </p>
                  </div>
                )}
                {formTemplates.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {formTemplates.length} inspection form{formTemplates.length !== 1 ? "s" : ""} available
                  </p>
                )}
              </div>

<div className="space-y-2">
                <Label htmlFor="riskCategory">Risk Category</Label>
                <Select
                  value={formData.riskCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, riskCategory: value })
                }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_RISK_CATEGORY_VALUE}>No category</SelectItem>
                    {riskCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conductedBy">
                  Conducted by <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.conductedBy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, conductedBy: value })
                  }
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user.id} value={u.user.id}>
                        {u.user.name || u.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpById">Follow-up Responsible</Label>
                <Select
                  value={formData.followUpById}
                  onValueChange={(value) => setFormData({ ...formData, followUpById: value })}
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FOLLOWUP_VALUE}>None selected</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.user.id} value={u.user.id}>
                        {u.user.name || u.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Scheduled Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="E.g. Production Hall A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Process</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="E.g. Warehouse, Workshop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Estimated Duration (min)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  placeholder="E.g. 90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextInspection">Next Inspection</Label>
                <Input
                  id="nextInspection"
                  type="date"
                  value={formData.nextInspection}
                  onChange={(e) => setFormData({ ...formData, nextInspection: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what will be inspected..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/inspections">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Creating..." : "Create Inspection"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

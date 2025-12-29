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
  { value: "SAFETY", label: "Sikkerhet" },
  { value: "HEALTH", label: "Helse" },
  { value: "ENVIRONMENTAL", label: "Miljø" },
  { value: "OPERATIONAL", label: "Operasjonell" },
  { value: "LEGAL", label: "Juridisk" },
  { value: "INFORMATION_SECURITY", label: "Informasjonssikkerhet" },
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
          // Sett current user som default
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
        throw new Error(data.message || "Kunne ikke opprette inspeksjon");
      }

      toast({
        title: "Inspeksjon opprettet",
        description: "Inspeksjonen er nå opprettet og klar for gjennomføring",
      });

      router.push(`/dashboard/inspections/${data.data.inspection.id}`);
    } catch (error: any) {
      toast({
        title: "Feil",
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
          <h1 className="text-3xl font-bold tracking-tight">Ny inspeksjon</h1>
          <p className="text-muted-foreground">
            Opprett en ny vernerunde eller HMS-inspeksjon
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspeksjonsdetaljer</CardTitle>
          <CardDescription>
            Fyll ut informasjonen nedenfor for å planlegge inspeksjonen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tittel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="F.eks. Kvartalsvis vernerunde - Produksjon"
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
                    <SelectItem value="VERNERUNDE">Vernerunde</SelectItem>
                    <SelectItem value="HMS_INSPEKSJON">HMS-inspeksjon</SelectItem>
                    <SelectItem value="BRANNØVELSE">Brannøvelse</SelectItem>
                    <SelectItem value="SHA_PLAN">SHA-plan</SelectItem>
                    <SelectItem value="SIKKERHETSVANDRING">Sikkerhetsvandring</SelectItem>
                    <SelectItem value="ANDRE">Annet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formTemplateId">📋 Vernerunde-skjema</Label>
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
                    <SelectValue placeholder={loadingFormTemplates ? "Laster skjemaer..." : "Velg skjema (anbefalt)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEMPLATE_VALUE}>Ingen skjema</SelectItem>
                    {formTemplates.length === 0 && !loadingFormTemplates && (
                      <div className="px-2 py-6 text-sm text-muted-foreground text-center">
                        <p className="font-semibold">Ingen vernerunde-skjemaer funnet</p>
                        <p className="text-xs mt-2">Opprett først et skjema:</p>
                        <ol className="text-xs mt-2 text-left space-y-1">
                          <li>1. Gå til Skjemaer → Nytt skjema</li>
                          <li>2. Velg kategori "Inspeksjon / Vernerunde"</li>
                          <li>3. Bygg skjemaet og lagre</li>
                          <li>4. Kom tilbake hit og velg skjemaet</li>
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
                      💡 Opprett ditt eget vernerunde-skjema
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Gå til <strong>Skjemaer</strong> → <strong>Nytt skjema</strong> og velg kategori <strong>"Inspeksjon / Vernerunde"</strong>
                    </p>
                  </div>
                )}
                {formTemplates.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {formTemplates.length} vernerunde-skjema tilgjengelig
                  </p>
                )}
              </div>

<div className="space-y-2">
                <Label htmlFor="riskCategory">Risiko-kategori</Label>
                <Select
                  value={formData.riskCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, riskCategory: value })
                }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori (valgfritt)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_RISK_CATEGORY_VALUE}>Ingen kategori</SelectItem>
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
                  Gjennomført av <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.conductedBy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, conductedBy: value })
                  }
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Laster brukere..." : "Velg bruker"} />
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
                <Label htmlFor="followUpById">Oppfølging ansvarlig</Label>
                <Select
                  value={formData.followUpById}
                  onValueChange={(value) => setFormData({ ...formData, followUpById: value })}
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg ansvarlig (valgfritt)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FOLLOWUP_VALUE}>Ingen valgt</SelectItem>
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
                  Planlagt dato <span className="text-destructive">*</span>
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
                <Label htmlFor="location">Lokasjon</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="F.eks. Produksjonshall A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Område / prosess</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="F.eks. Lager, Verksted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Estimert varighet (min)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  placeholder="F.eks. 90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextInspection">Neste inspeksjon</Label>
                <Input
                  id="nextInspection"
                  type="date"
                  value={formData.nextInspection}
                  onChange={(e) => setFormData({ ...formData, nextInspection: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Beskriv hva som skal inspiseres..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/inspections">
                <Button type="button" variant="outline">
                  Avbryt
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Oppretter..." : "Opprett inspeksjon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { createSecurityControl } from "@/server/actions/security.actions";
import { useToast } from "@/hooks/use-toast";
import type {
  SecurityControlCategory,
  SecurityControlMaturity,
  SecurityControlStatus,
} from "@prisma/client";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecurityControlFormProps {
  users: Array<{ id: string; name?: string | null; email?: string | null }>;
  assets: Array<{ id: string; name: string }>;
  risks: Array<{ id: string; title: string }>;
  documents: Array<{ id: string; title: string }>;
}

const statusOptions: Array<{ value: SecurityControlStatus; label: string }> = [
  { value: "PLANNED", label: "Planlagt" },
  { value: "IN_PROGRESS", label: "Under implementering" },
  { value: "IMPLEMENTED", label: "Implementert" },
  { value: "LIVE", label: "I drift" },
];

const maturityOptions: Array<{ value: SecurityControlMaturity; label: string }> = [
  { value: "INITIAL", label: "Initial" },
  { value: "MANAGED", label: "Styrt" },
  { value: "DEFINED", label: "Definert" },
  { value: "OPTIMIZED", label: "Optimalisert" },
];

const categoryOptions: Array<{ value: SecurityControlCategory; label: string }> = [
  { value: "ORGANIZATIONAL", label: "Organisatorisk" },
  { value: "PEOPLE", label: "Mennesker" },
  { value: "PHYSICAL", label: "Fysisk" },
  { value: "TECHNICAL", label: "Teknisk" },
];

const NO_CONTROL_OWNER_VALUE = "__none_security_control_owner__";
const NO_CONTROL_DOCUMENT_VALUE = "__none_security_control_document__";
const NO_CONTROL_ASSET_VALUE = "__none_security_control_asset__";
const NO_CONTROL_RISK_VALUE = "__none_security_control_risk__";

export function SecurityControlForm({ users, assets, risks, documents }: SecurityControlFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const normalizeOptionalId = (value: FormDataEntryValue | null, sentinel: string) => {
    if (!value || value === sentinel) {
      return undefined;
    }
    return String(value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const ownerId = normalizeOptionalId(formData.get("ownerId"), NO_CONTROL_OWNER_VALUE);
      const documentId = normalizeOptionalId(formData.get("documentId"), NO_CONTROL_DOCUMENT_VALUE);
      const linkedAssetId = normalizeOptionalId(formData.get("linkedAssetId"), NO_CONTROL_ASSET_VALUE);
      const linkedRiskId = normalizeOptionalId(formData.get("linkedRiskId"), NO_CONTROL_RISK_VALUE);

      const result = await createSecurityControl({
        code: formData.get("code"),
        title: formData.get("title"),
        annexReference: formData.get("annexReference"),
        requirement: formData.get("requirement"),
        category: formData.get("category"),
        status: formData.get("status"),
        maturity: formData.get("maturity"),
        ownerId,
        linkedAssetId,
        linkedRiskId,
        implementationNote: formData.get("implementationNote"),
        monitoring: formData.get("monitoring"),
        nextReviewDate: formData.get("nextReviewDate"),
        lastTestDate: formData.get("lastTestDate"),
        documentId,
      });

      if (result.success) {
        toast({ title: "Kontroll registrert" });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Feil",
          description: result.error || "Kunne ikke registrere kontroll",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ny kontroll
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader>
          <DialogTitle className="px-6 pt-6">Registrer sikkerhetskontroll</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ScrollArea className="max-h-[65vh] px-6">
            <div className="space-y-6 pb-4">
              <section className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode (Annex A)</Label>
                    <Input id="code" name="code" placeholder="F.eks. A.5.7" required disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annexReference">Referanse</Label>
                    <Input id="annexReference" name="annexReference" placeholder="Annex A 5.7" disabled={isPending} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Tittel *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    disabled={isPending}
                    placeholder="F.eks. Informasjonssikkerhet i prosjekter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement">Krav / beskrivelse</Label>
                  <Textarea id="requirement" name="requirement" rows={3} disabled={isPending} />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select name="category" defaultValue="ORGANIZATIONAL" disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="PLANNED" disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modenhet</Label>
                  <Select name="maturity" defaultValue="INITIAL" disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {maturityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kontrolleier</Label>
                  <Select name="ownerId" disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg ansvarlig (valgfritt)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CONTROL_OWNER_VALUE}>Ingen</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dokumentasjon</Label>
                  <Select name="documentId" disabled={isPending || documents.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={documents.length ? "Velg dokument (valgfritt)" : "Ingen dokumenter"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CONTROL_DOCUMENT_VALUE}>Ingen</SelectItem>
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Koblet sikkerhetsobjekt</Label>
                  <Select name="linkedAssetId" disabled={isPending || assets.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={assets.length ? "Velg objekt" : "Ingen objekt"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CONTROL_ASSET_VALUE}>Ingen</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Koblet risiko</Label>
                  <Select name="linkedRiskId" disabled={isPending || risks.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={risks.length ? "Velg risiko" : "Ingen risiko"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CONTROL_RISK_VALUE}>Ingen</SelectItem>
                      {risks.map((risk) => (
                        <SelectItem key={risk.id} value={risk.id}>
                          {risk.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nextReviewDate">Neste gjennomgang</Label>
                  <Input id="nextReviewDate" name="nextReviewDate" type="date" disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastTestDate">Sist testet</Label>
                  <Input id="lastTestDate" name="lastTestDate" type="date" disabled={isPending} />
                </div>
              </section>

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="implementationNote">Implementering</Label>
                  <Textarea id="implementationNote" name="implementationNote" rows={3} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitoring">Overvåking/Test</Label>
                  <Textarea id="monitoring" name="monitoring" rows={3} disabled={isPending} />
                </div>
              </section>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 border-t px-6 pb-6 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Lagrer..." : "Lagre kontroll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


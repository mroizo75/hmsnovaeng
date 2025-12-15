"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSecurityEvidence } from "@/server/actions/security.actions";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface SecurityEvidenceFormProps {
  controls: Array<{ id: string; code: string; title: string }>;
}

export function SecurityEvidenceForm({ controls }: SecurityEvidenceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createSecurityEvidence({
        controlId: formData.get("controlId"),
        title: formData.get("title"),
        description: formData.get("description"),
        attachmentKey: formData.get("attachmentKey"),
        reviewResult: formData.get("reviewResult"),
      });

      if (result.success) {
        toast({ title: "Evidens registrert" });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Feil",
          description: result.error || "Kunne ikke registrere evidens",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Registrer evidens
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Legg til kontroll-evidens</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kontroll *</Label>
            <Select name="controlId" disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Velg kontroll" />
              </SelectTrigger>
              <SelectContent>
                {controls.map((control) => (
                  <SelectItem key={control.id} value={control.id}>
                    {control.code} · {control.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input id="title" name="title" required disabled={isPending} placeholder="F.eks. Rapport fra logg-gjennomgang" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea id="description" name="description" rows={3} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewResult">Revisjonsnotat</Label>
            <Textarea id="reviewResult" name="reviewResult" rows={2} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachmentKey">Vedlegg (R2-key/URL)</Label>
            <Input id="attachmentKey" name="attachmentKey" disabled={isPending} placeholder="f.eks. r2://evidens/logg.pdf" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Lagrer..." : "Lagre evidens"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { createFinding } from "@/server/actions/audit.actions";
import { ISO_9001_CLAUSES } from "@/features/audits/schemas/audit.schema";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface FindingFormProps {
  auditId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
  trigger?: React.ReactNode;
}

export function FindingForm({ auditId, users, trigger }: FindingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      auditId,
      findingType: formData.get("findingType") as string,
      clause: formData.get("clause") as string,
      description: formData.get("description") as string,
      evidence: formData.get("evidence") as string,
      requirement: formData.get("requirement") as string,
      responsibleId: formData.get("responsibleId") as string,
      dueDate: formData.get("dueDate") as string || undefined,
    };

    const result = await createFinding(data);

    if (result.success) {
      toast({
        title: "✅ Finding registered",
        description: "The audit finding has been documented",
        className: "bg-green-50 border-green-200",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not register finding",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register finding
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register audit finding</DialogTitle>
          <DialogDescription>
            ISO 9001: Document findings, nonconformities and observations from the audit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="findingType">Finding type *</Label>
              <Select name="findingType" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAJOR_NC">Major Nonconformity (Major NC)</SelectItem>
                  <SelectItem value="MINOR_NC">Minor Nonconformity (Minor NC)</SelectItem>
                  <SelectItem value="OBSERVATION">Observation</SelectItem>
                  <SelectItem value="STRENGTH">Strength (good practice)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clause">ISO 9001 Clause *</Label>
              <Select name="clause" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clause" />
                </SelectTrigger>
                <SelectContent>
                  {ISO_9001_CLAUSES.map((c) => (
                    <SelectItem key={c.clause} value={c.clause}>
                      {c.clause} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Finding description *</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe what was observed..."
              required
              disabled={loading}
              minLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence/Observation (ISO 9001) *</Label>
            <Textarea
              id="evidence"
              name="evidence"
              rows={3}
              placeholder="Concrete evidence for the finding. E.g. 'Review of the training records showed that 3 of 8 employees lack mandatory HSE training'"
              required
              disabled={loading}
              minLength={10}
            />
            <p className="text-sm text-muted-foreground">
              ISO 9001: Document objective evidence
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirement">Requirement not fulfilled *</Label>
            <Textarea
              id="requirement"
              name="requirement"
              rows={2}
              placeholder="Which requirement in ISO 9001 or internal procedures is not fulfilled?"
              required
              disabled={loading}
              minLength={10}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responsibleId">Responsible for closure *</Label>
              <Select name="responsibleId" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Closure deadline</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                disabled={loading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-900 mb-2">
                💡 Types of findings:
              </p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li><strong>Major NC:</strong> Critical nonconformity with ISO 9001 requirements</li>
                <li><strong>Minor NC:</strong> Less serious nonconformity that must be closed</li>
                <li><strong>Observation:</strong> Potential issue that should be followed up</li>
                <li><strong>Strength:</strong> Good practice that should be shared</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register finding"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

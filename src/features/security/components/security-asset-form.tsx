"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CIAValue, SecurityAssetType } from "@prisma/client";
import { createSecurityAsset } from "@/server/actions/security.actions";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface SecurityAssetFormProps {
  users: Array<{ id: string; name?: string | null; email?: string | null }>;
}

const ciaOptions: Array<{ value: CIAValue; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const typeOptions: Array<{ value: SecurityAssetType; label: string }> = [
  { value: "INFORMATION_SYSTEM", label: "Information System" },
  { value: "APPLICATION", label: "Application" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "DOCUMENT", label: "Documentation" },
  { value: "PEOPLE", label: "Personnel" },
  { value: "FACILITY", label: "Facility" },
  { value: "OTHER", label: "Other" },
];

const NO_OWNER_VALUE = "__none_security_asset_owner__";

export function SecurityAssetForm({ users }: SecurityAssetFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const ownerIdRaw = formData.get("ownerId");
    const ownerId =
      ownerIdRaw && ownerIdRaw !== NO_OWNER_VALUE ? String(ownerIdRaw) : undefined;

    startTransition(async () => {
      const result = await createSecurityAsset({
        name: formData.get("name"),
        description: formData.get("description"),
        type: formData.get("type"),
        ownerId,
        confidentiality: formData.get("confidentiality"),
        integrity: formData.get("integrity"),
        availability: formData.get("availability"),
        businessCriticality: formData.get("businessCriticality"),
      });

      if (result.success) {
        toast({ title: "Security asset registered" });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not register asset",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Register Security Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required disabled={isPending} placeholder="e.g. HR System" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} disabled={isPending} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue="INFORMATION_SYSTEM" disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select name="ownerId" disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER_VALUE}>None</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {["confidentiality", "integrity", "availability"].map((field) => (
              <div key={field} className="space-y-2">
                <Label>{field === "confidentiality" ? "Confidentiality" : field === "integrity" ? "Integrity" : "Availability"}</Label>
                <Select name={field} defaultValue="MEDIUM" disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ciaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCriticality">Business Criticality (1-5)</Label>
            <Input
              id="businessCriticality"
              name="businessCriticality"
              type="number"
              min={1}
              max={5}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

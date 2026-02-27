"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTenant } from "@/server/actions/tenant.actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditTenantFormProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    orgNumber: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    employeeCount: number | null;
    industry: string | null;
    notes: string | null;
  };
}

export function EditTenantForm({ tenant }: EditTenantFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId: tenant.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      orgNumber: formData.get("orgNumber") as string || undefined,
      address: formData.get("address") as string || undefined,
      postalCode: formData.get("postalCode") as string || undefined,
      city: formData.get("city") as string || undefined,
      contactPerson: formData.get("contactPerson") as string || undefined,
      contactEmail: formData.get("contactEmail") as string || undefined,
      contactPhone: formData.get("contactPhone") as string || undefined,
      employeeCount: formData.get("employeeCount") 
        ? parseInt(formData.get("employeeCount") as string) 
        : undefined,
      industry: formData.get("industry") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    const result = await updateTenant(data);

    if (result.success) {
      toast({
        title: "✅ Company information updated",
        description: "Changes have been saved",
      });
      setIsEditing(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: result.error || "Something went wrong",
      });
    }

    setIsLoading(false);
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Company name</Label>
            <p className="font-medium mt-1">{tenant.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Slug</Label>
            <p className="font-medium mt-1">{tenant.slug}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Org. number</Label>
            <p className="font-medium mt-1">{tenant.orgNumber || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Number of employees</Label>
            <p className="font-medium mt-1">{tenant.employeeCount || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Industry</Label>
            <p className="font-medium mt-1">{tenant.industry || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Contact person</Label>
            <p className="font-medium mt-1">{tenant.contactPerson || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium mt-1">{tenant.contactEmail || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            <p className="font-medium mt-1">{tenant.contactPhone || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-muted-foreground">Address</Label>
            <p className="font-medium mt-1">
              {tenant.address ? (
                <>
                  {tenant.address}
                  {tenant.postalCode && tenant.city && (
                    <>, {tenant.postalCode} {tenant.city}</>
                  )}
                </>
              ) : "-"}
            </p>
          </div>
          {tenant.notes && (
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Notes</Label>
              <p className="font-medium mt-1 whitespace-pre-wrap">{tenant.notes}</p>
            </div>
          )}
        </div>
        <Button onClick={() => setIsEditing(true)} className="w-full">
          Edit information
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={tenant.name}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={tenant.slug}
            required
            pattern="[a-z0-9-]+"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="orgNumber">Org. number</Label>
          <Input
            id="orgNumber"
            name="orgNumber"
            defaultValue={tenant.orgNumber || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="employeeCount">Antall ansatte</Label>
          <Input
            id="employeeCount"
            name="employeeCount"
            type="number"
            min="1"
            defaultValue={tenant.employeeCount || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="industry">Bransje</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={tenant.industry || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="contactPerson">Kontaktperson</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            defaultValue={tenant.contactPerson || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="contactEmail">E-post</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={tenant.contactEmail || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Telefon</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            defaultValue={tenant.contactPhone || ""}
            disabled={isLoading}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            defaultValue={tenant.address || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={tenant.postalCode || ""}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={tenant.city || ""}
            disabled={isLoading}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Merknader</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={tenant.notes || ""}
            rows={3}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}


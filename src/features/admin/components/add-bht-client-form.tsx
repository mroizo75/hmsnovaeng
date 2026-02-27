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
import { useToast } from "@/hooks/use-toast";
import { addBhtClient } from "@/server/actions/bht.actions";
import { Loader2 } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  orgNumber: string | null;
  industry: string | null;
  employeeCount: number | null;
  contactEmail: string | null;
  contactPerson: string | null;
}

interface AddBhtClientFormProps {
  tenants: Tenant[];
}

export function AddBhtClientForm({ tenants }: AddBhtClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [packageType, setPackageType] = useState<"BASIC" | "EXTENDED">("BASIC");
  const [contractStartDate, setContractStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [contractEndDate, setContractEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTenantId) {
      toast({
        variant: "destructive",
        title: "Select customer",
        description: "You must select a customer",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await addBhtClient({
        tenantId: selectedTenantId,
        packageType,
        contractStartDate: new Date(contractStartDate),
        contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast({
        title: "✅ BHT client created",
        description: `${selectedTenant?.name} is now registered as BHT client`,
        });
        router.push(`/admin/bht/${result.clientId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "System error",
        description: "Could not create BHT client",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tenant">Customer *</Label>
        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer..." />
          </SelectTrigger>
          <SelectContent>
            {tenants.length === 0 ? (
              <SelectItem value="none" disabled>
                No available customers
              </SelectItem>
            ) : (
              tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                  {tenant.orgNumber && ` (${tenant.orgNumber})`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedTenant && (
          <div className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
            <p><strong>Industry:</strong> {selectedTenant.industry || "Not specified"}</p>
            <p><strong>Employees:</strong> {selectedTenant.employeeCount || "Not specified"}</p>
            <p><strong>Contact:</strong> {selectedTenant.contactPerson || "Not specified"}</p>
            <p><strong>Email:</strong> {selectedTenant.contactEmail || "Not specified"}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="packageType">Package type *</Label>
        <Select
          value={packageType}
          onValueChange={(v) => setPackageType(v as "BASIC" | "EXTENDED")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BASIC">
              Basic OHS package
            </SelectItem>
            <SelectItem value="EXTENDED">
              Extended OHS package
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {packageType === "BASIC"
            ? "Includes: Mapping, consultancy, occupational health rounds, exposure assessment, annual report"
            : "Includes everything in basic package + individual follow-up, health checks, etc."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Contract start *</Label>
          <Input
            id="startDate"
            type="date"
            value={contractStartDate}
            onChange={(e) => setContractStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Contract end (optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={contractEndDate}
            onChange={(e) => setContractEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about the agreement..."
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !selectedTenantId}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create BHT client
        </Button>
      </div>
    </form>
  );
}


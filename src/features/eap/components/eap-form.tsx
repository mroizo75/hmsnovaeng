"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEmergencyActionPlan } from "@/server/actions/eap.actions";
import { FileAttachment, type UploadedFile } from "@/components/ui/file-attachment";
import { Plus, Trash2 } from "lucide-react";

type Contact = { name: string; role: string; phone: string; agency?: string };
type Route = { assembly: string; route: string };

export function EapForm({ tenantId, createdBy }: { tenantId: string; createdBy: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([{ name: "", role: "", phone: "" }]);
  const [routes, setRoutes] = useState<Route[]>([{ assembly: "", route: "" }]);
  const [procedures, setProcedures] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  function addContact() {
    setContacts([...contacts, { name: "", role: "", phone: "" }]);
  }
  function removeContact(i: number) {
    setContacts(contacts.filter((_, idx) => idx !== i));
  }
  function updateContact(i: number, field: keyof Contact, value: string) {
    setContacts(contacts.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  function addRoute() {
    setRoutes([...routes, { assembly: "", route: "" }]);
  }
  function removeRoute(i: number) {
    setRoutes(routes.filter((_, idx) => idx !== i));
  }
  function updateRoute(i: number, field: keyof Route, value: string) {
    setRoutes(routes.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  async function handleSubmit() {
    if (!title) return;
    setSaving(true);
    try {
      await createEmergencyActionPlan({
        tenantId,
        locationName: title || facilityAddress || "Facility",
        effectiveDate: new Date(),
        emergencyContacts: contacts.filter((c) => c.name && c.role && c.phone).map((c) => ({ name: c.name, role: c.role, phone: c.phone, agency: c.agency })),
        evacuationRoutes: routes.filter((r) => r.assembly).map((r) => ({ route: r.route || r.assembly, mapKey: r.assembly })),
        assemblyPoints: routes.filter((r) => r.assembly).map((r) => ({ name: r.assembly, description: r.route || r.assembly })),
        roles: [{ role: "Emergency Coordinator", name: createdBy, responsibilities: "Overall emergency coordination" }],
        equipment: [],
        notes: procedures || undefined,
      });
      router.push("/dashboard/eap");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Plan Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Main Facility Emergency Action Plan" />
          </div>
          <div className="space-y-1">
            <Label>Facility Address</Label>
            <Input value={facilityAddress} onChange={(e) => setFacilityAddress(e.target.value)} placeholder="123 Main St, City, State ZIP" />
          </div>
          <div className="space-y-1">
            <Label>Special Procedures / Notes</Label>
            <Textarea value={procedures} onChange={(e) => setProcedures(e.target.value)} placeholder="Emergency procedures, special hazard locations, disabled employee assistance…" rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Attachments (Floor plans, Evacuation maps)</Label>
            <FileAttachment
              folder="eap"
              label="Attach Document"
              onUpload={(f) => setAttachments((prev) => [...prev, f])}
              onRemove={(key) => setAttachments((prev) => prev.filter((f) => f.key !== key))}
              existingFiles={attachments}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Emergency Contacts</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addContact}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border rounded p-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input value={c.name} onChange={(e) => updateContact(i, "name", e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role / Title *</Label>
                <Input value={c.role} onChange={(e) => updateContact(i, "role", e.target.value)} placeholder="e.g. Safety Manager" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone *</Label>
                <Input value={c.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} placeholder="e.g. 911 or (555) 123-4567" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Agency</Label>
                <Input value={c.agency ?? ""} onChange={(e) => updateContact(i, "agency", e.target.value)} placeholder="e.g. Fire Dept, Hospital" />
              </div>
              {contacts.length > 1 && (
                <div className="col-span-2 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeContact(i)}>
                    <Trash2 className="h-3 w-3 mr-1 text-red-500" /> Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evacuation Routes</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addRoute}>
            <Plus className="h-3 w-3 mr-1" /> Add Route
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {routes.map((r, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 border rounded p-3">
              <div className="space-y-1">
                <Label className="text-xs">Assembly Point *</Label>
                <Input value={r.assembly} onChange={(e) => updateRoute(i, "assembly", e.target.value)} placeholder="e.g. Parking Lot A, North Side" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Route Description</Label>
                <Textarea value={r.route} onChange={(e) => updateRoute(i, "route", e.target.value)} placeholder="Exit through north stairwell, turn left, proceed to parking lot" rows={2} />
              </div>
              {routes.length > 1 && (
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeRoute(i)}>
                    <Trash2 className="h-3 w-3 mr-1 text-red-500" /> Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving || !title}>
          {saving ? "Creating…" : "Create Emergency Action Plan"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/eap")}>Cancel</Button>
      </div>
    </div>
  );
}

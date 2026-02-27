"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addToolboxAttendee } from "@/server/actions/toolbox-talk.actions";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function AttendanceSignForm({ talkId }: { talkId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!guestName) return;
    setSaving(true);
    try {
      await addToolboxAttendee({ talkId, guestName });
      router.refresh();
      setGuestName(""); setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-3 w-3" /> Add Attendee
      </Button>
    );
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Add Attendee</h4>
      <div className="space-y-1">
        <Label className="text-xs">Name *</Label>
        <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd} disabled={saving || !guestName}>{saving ? "Adding…" : "Add"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

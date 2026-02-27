"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createToolboxTalk } from "@/server/actions/toolbox-talk.actions";
import { Plus, Trash2 } from "lucide-react";

const SUGGESTED_TOPICS = [
  "Slips, Trips & Falls Prevention",
  "Lockout / Tagout (LOTO)",
  "PPE Proper Use & Maintenance",
  "Fire Prevention & Evacuation",
  "Ergonomics & Lifting Safely",
  "Hazard Communication (HazCom)",
  "Heat Illness Prevention",
  "Ladder Safety",
  "Electrical Safety",
  "Forklift / Powered Industrial Truck Safety",
  "Confined Space Awareness",
  "Bloodborne Pathogen Awareness",
  "Near Miss Reporting",
  "Hand & Power Tool Safety",
  "Eye & Face Protection",
];

export function ToolboxTalkForm({ tenantId, conductedBy }: { tenantId: string; conductedBy: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [content, setContent] = useState("");
  const [conductedAt, setConductedAt] = useState(new Date().toISOString().slice(0, 10));
  const [attendees, setAttendees] = useState<{ guestName: string }[]>([{ guestName: "" }]);

  function addAttendee() {
    setAttendees([...attendees, { guestName: "" }]);
  }
  function removeAttendee(i: number) {
    setAttendees(attendees.filter((_, idx) => idx !== i));
  }
  function updateAttendee(i: number, value: string) {
    setAttendees(attendees.map((a, idx) => idx === i ? { guestName: value } : a));
  }

  async function handleSubmit() {
    if (!topic || !content) return;
    setSaving(true);
    try {
      const talk = await createToolboxTalk({
        tenantId,
        title: topic,
        topic,
        content,
        conductedBy,
        conductedAt: new Date(conductedAt),
        attendees: attendees.filter((a) => a.guestName.trim()).map((a) => ({ guestName: a.guestName })),
      });
      if (talk?.id) {
        router.push(`/dashboard/toolbox-talks/${talk.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Talk Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Safety Topic *</Label>
            <div className="relative">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g. Ladder Safety, LOTO, PPE…"
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover shadow-md">
                  {SUGGESTED_TOPICS.filter((t) => t.toLowerCase().includes(topic.toLowerCase())).slice(0, 8).map((t) => (
                    <button key={t} className="w-full px-3 py-2 text-left text-sm hover:bg-accent" onMouseDown={() => setTopic(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Date *</Label>
            <Input type="date" value={conductedAt} onChange={(e) => setConductedAt(e.target.value)} className="max-w-xs" />
          </div>
          <div className="space-y-1">
            <Label>Content / Discussion Points *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Key points covered, hazards discussed, corrective actions noted… (minimum 20 characters)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendees</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Add attendees here — they can sign digitally on the next page</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addAttendee}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {attendees.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={a.guestName}
                onChange={(e) => updateAttendee(i, e.target.value)}
                placeholder="Full name"
                className="flex-1"
              />
              {attendees.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAttendee(i)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving || !topic || !content}>
          {saving ? "Saving…" : "Save Toolbox Talk"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/toolbox-talks")}>Cancel</Button>
      </div>
    </div>
  );
}

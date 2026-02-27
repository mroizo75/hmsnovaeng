"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateBhtAmoMeeting } from "@/server/actions/bht.actions";
import { Loader2, CheckCircle2, Calendar, FileText } from "lucide-react";

interface BhtAmoActionsProps {
  meetingId: string;
  bhtClientId: string;
  currentStatus: string;
  currentAgenda: string;
  currentMinutes: string;
}

export function BhtAmoActions({
  meetingId,
  bhtClientId,
  currentStatus,
  currentAgenda,
  currentMinutes,
}: BhtAmoActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [agenda, setAgenda] = useState(currentAgenda);
  const [minutes, setMinutes] = useState(currentMinutes);

  async function handleSchedule() {
    if (!meetingDate) {
      toast({ variant: "destructive", title: "Velg dato" });
      return;
    }

    setLoading(true);
    try {
      const result = await updateBhtAmoMeeting({
        meetingId,
        meetingDate: new Date(meetingDate),
        status: "PREPARED",
      });

      if (result.success) {
        toast({ title: "✅ Meeting scheduled" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAgenda() {
    setLoading(true);
    try {
      const result = await updateBhtAmoMeeting({
        meetingId,
        agenda,
      });

      if (result.success) {
        toast({ title: "✅ Agenda saved" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMinutes() {
    setLoading(true);
    try {
      const result = await updateBhtAmoMeeting({
        meetingId,
        minutes,
        status: "MINUTES_DONE",
      });

      if (result.success) {
        toast({ title: "✅ Minutes saved" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const result = await updateBhtAmoMeeting({
        meetingId,
        status: "COMPLETED",
      });

      if (result.success) {
        toast({ title: "✅ EHS committee meeting completed" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span>EHS committee meeting is completed and documented</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule meeting */}
      {currentStatus === "PLANNED" && (
        <div className="space-y-3">
          <Label htmlFor="meetingDate">Schedule meeting date</Label>
          <div className="flex gap-4">
            <Input
              id="meetingDate"
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleSchedule} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Set date
            </Button>
          </div>
        </div>
      )}

      {/* Agenda */}
      {(currentStatus === "PREPARED" || currentStatus === "PLANNED") && (
        <div className="space-y-3">
          <Label htmlFor="agenda">Final agenda</Label>
          <Textarea
            id="agenda"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Enter final agenda for the meeting..."
            rows={6}
          />
          <Button onClick={handleSaveAgenda} disabled={loading} variant="outline">
            Save agenda
          </Button>
        </div>
      )}

      {/* Minutes */}
      {(currentStatus === "PREPARED" || currentStatus === "CONDUCTED") && (
        <div className="space-y-3">
          <Label htmlFor="minutes">Meeting minutes</Label>
          <Textarea
            id="minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Write meeting minutes..."
            rows={8}
          />
          <Button onClick={handleSaveMinutes} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Save minutes
          </Button>
        </div>
      )}

      {/* Complete */}
      {currentStatus === "MINUTES_DONE" && (
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark as completed
        </Button>
      )}
    </div>
  );
}


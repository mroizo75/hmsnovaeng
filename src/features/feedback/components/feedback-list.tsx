"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCustomerFeedbackStatus } from "@/server/actions/feedback.actions";
import { useToast } from "@/hooks/use-toast";
import type {
  CustomerFeedback,
  FeedbackStatus,
  FeedbackSentiment,
} from "@prisma/client";

interface FeedbackListProps {
  feedbacks: (CustomerFeedback & {
    recordedBy: { name: string | null; email: string } | null;
    followUpOwner: { name: string | null; email: string } | null;
  })[];
  users: Array<{ id: string; name?: string | null; email: string }>;
}

const statusLabels: Record<FeedbackStatus, string> = {
  NEW: "New",
  ACKNOWLEDGED: "Shared with Team",
  SHARED: "Published",
  FOLLOW_UP: "Under Follow-up",
  CLOSED: "Closed",
};

const statusColors: Record<FeedbackStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  ACKNOWLEDGED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SHARED: "bg-green-100 text-green-800 border-green-200",
  FOLLOW_UP: "bg-amber-100 text-amber-800 border-amber-200",
  CLOSED: "bg-slate-100 text-slate-800 border-slate-200",
};

const sentimentColors: Record<FeedbackSentiment, string> = {
  POSITIVE: "bg-green-100 text-green-800 border-green-200",
  NEUTRAL: "bg-slate-100 text-slate-800 border-slate-200",
  NEGATIVE: "bg-red-100 text-red-800 border-red-200",
};

const NO_OWNER = "__none__";

export function FeedbackList({ feedbacks, users }: FeedbackListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>("NEW");
  const [owner, setOwner] = useState<string>(NO_OWNER);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await updateCustomerFeedbackStatus({
        id: selectedId,
        followUpStatus: status,
        followUpOwnerId: owner,
        followUpNotes: notes,
      });

      if (result.success) {
        toast({
          title: "✅ Updated",
          description: "Feedback status has been updated.",
        });
        setSelectedId(null);
        setNotes("");
      } else {
        toast({
          variant: "destructive",
          title: "Could not update",
          description: result.error || "Please try again later",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead className="text-right">Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="space-y-1">
                      <p className="font-medium">
                        {feedback.customerName || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feedback.customerCompany || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.recordedAt).toLocaleDateString("en-US")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{feedback.summary}</p>
                      {feedback.rating && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Rating: {feedback.rating}/5
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={sentimentColors[feedback.sentiment]}>
                        {feedback.sentiment === "POSITIVE"
                          ? "Positive"
                          : feedback.sentiment === "NEUTRAL"
                          ? "Neutral"
                          : "Negative"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[feedback.followUpStatus]}>
                        {statusLabels[feedback.followUpStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {feedback.followUpOwner?.name ||
                          feedback.followUpOwner?.email ||
                          "Not set"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recorded by{" "}
                        {feedback.recordedBy?.name ||
                          feedback.recordedBy?.email ||
                          "Unknown"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedId(feedback.id);
                          setStatus(feedback.followUpStatus);
                          setOwner(
                            feedback.followUpOwnerId ?? NO_OWNER
                          );
                          setNotes(feedback.followUpNotes || "");
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3 p-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className="border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {feedback.customerName || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feedback.customerCompany || "—"}
                      </p>
                    </div>
                    <Badge className={sentimentColors[feedback.sentiment]}>
                      {feedback.sentiment === "POSITIVE"
                        ? "Positive"
                        : feedback.sentiment === "NEUTRAL"
                        ? "Neutral"
                        : "Negative"}
                    </Badge>
                  </div>
                  <p className="text-sm">{feedback.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusColors[feedback.followUpStatus]}>
                      {statusLabels[feedback.followUpStatus]}
                    </Badge>
                    {feedback.rating && (
                      <Badge variant="outline">{feedback.rating}/5</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Recorded {new Date(feedback.recordedAt).toLocaleDateString("en-US")} by{" "}
                    {feedback.recordedBy?.name || feedback.recordedBy?.email || "Unknown"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedId(feedback.id);
                      setStatus(feedback.followUpStatus);
                      setOwner(feedback.followUpOwnerId ?? NO_OWNER);
                      setNotes(feedback.followUpNotes || "");
                    }}
                  >
                    Update Status
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Update Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Follow-up Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as FeedbackStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsible</Label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_OWNER}>None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Notes</Label>
              <Textarea
                id="followUpNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save Update"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

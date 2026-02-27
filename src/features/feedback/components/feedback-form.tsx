"use client";

import { useState, useTransition } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FeedbackSource, FeedbackSentiment } from "@prisma/client";
import { createCustomerFeedback } from "@/server/actions/feedback.actions";

interface FeedbackFormProps {
  users: Array<{ id: string; name?: string | null; email: string }>;
  goals: Array<{ id: string; title: string }>;
}

const NO_OWNER = "__none__";
const NO_GOAL = "__none_goal__";
const NO_RATING = "__no_rating__";

const sourceOptions: Array<{ value: FeedbackSource; label: string }> = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "MEETING", label: "Meeting" },
  { value: "SURVEY", label: "Survey" },
  { value: "SOCIAL", label: "Social Media" },
  { value: "OTHER", label: "Other" },
];

const sentimentOptions: Array<{ value: FeedbackSentiment; label: string }> = [
  { value: "POSITIVE", label: "Positive" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "NEGATIVE", label: "Negative" },
];

export function FeedbackForm({ users, goals }: FeedbackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("POSITIVE");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createCustomerFeedback(formData);
      if (result.success) {
        toast({
          title: "✅ Feedback registered",
          description: "Customer feedback has been saved and can be followed up.",
          className: "bg-green-50 border-green-200",
        });
        router.push("/dashboard/feedback");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Could not save",
          description: result.error || "Please try again later",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
          <CardDescription>Register customer feedback (ISO 9001: 9.1.2)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Contact Person</Label>
              <Input id="customerName" name="customerName" placeholder="Customer name" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerCompany">Customer / Organization</Label>
              <Input id="customerCompany" name="customerCompany" placeholder="Company or project" disabled={isPending} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" placeholder="customer@company.com" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" name="contactPhone" placeholder="+1 ..." disabled={isPending} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Channel / Source</Label>
              <Select name="source" defaultValue="EMAIL" disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select
                name="sentiment"
                value={sentiment}
                onValueChange={(value) => setSentiment(value as FeedbackSentiment)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sentiment" />
                </SelectTrigger>
                <SelectContent>
                  {sentimentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Select name="rating" defaultValue={NO_RATING} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_RATING}>No rating</SelectItem>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Input
              id="summary"
              name="summary"
              required
              disabled={isPending}
              placeholder="e.g. 'Customer praises response time and follow-up'"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              name="details"
              rows={4}
              disabled={isPending}
              placeholder="Describe the feedback in your own words"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">What should be shared internally?</Label>
            <Textarea
              id="highlights"
              name="highlights"
              rows={3}
              disabled={isPending}
              placeholder="Key points to highlight in management reviews, newsletters, etc."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Responsible for follow-up</Label>
              <Select name="followUpOwnerId" defaultValue={NO_OWNER} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person (optional)" />
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
            <div className="space-y-2">
              <Label>Link to goal (optional)</Label>
              <Select name="linkedGoalId" defaultValue={NO_GOAL} disabled={isPending || goals.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={goals.length ? "Select goal" : "No goals available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GOAL}>None</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Feedback"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

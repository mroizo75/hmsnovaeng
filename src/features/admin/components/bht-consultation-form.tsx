"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addBhtConsultation } from "@/server/actions/bht.actions";
import { Loader2, Plus } from "lucide-react";

interface BhtConsultationFormProps {
  bhtClientId: string;
}

export function BhtConsultationForm({ bhtClientId }: BhtConsultationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [consultationType, setConsultationType] = useState<
    "ON_REQUEST" | "ASSESSMENT_RELATED" | "OPERATIONAL_CHANGE" | "FOLLOW_UP"
  >("ON_REQUEST");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [method, setMethod] = useState<
    "DIGITAL_MEETING" | "PHONE" | "WRITTEN" | "IN_PERSON"
  >("DIGITAL_MEETING");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isWithinScope, setIsWithinScope] = useState(true);
  const [outOfScopeNotes, setOutOfScopeNotes] = useState("");

  function resetForm() {
    setTopic("");
    setDescription("");
    setRecommendation("");
    setMethod("DIGITAL_MEETING");
    setDurationMinutes("");
    setIsWithinScope(true);
    setOutOfScopeNotes("");
    setExpanded(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!topic || !description || !recommendation) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Fill in all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await addBhtConsultation({
        bhtClientId,
        consultationType,
        topic,
        description,
        recommendation,
        method,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        isWithinScope,
        outOfScopeNotes: !isWithinScope ? outOfScopeNotes : undefined,
      });

      if (result.success) {
        toast({
          title: "✅ Consultation registered",
          description: "The consultation has been saved to the OHS log",
        });
        resetForm();
        router.refresh();
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
        description: "Could not register consultation",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <Button onClick={() => setExpanded(true)} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Register new consultation
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Consultation type *</Label>
          <Select
            value={consultationType}
            onValueChange={(v) =>
              setConsultationType(v as typeof consultationType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ON_REQUEST">On request</SelectItem>
              <SelectItem value="ASSESSMENT_RELATED">In connection with assessment</SelectItem>
              <SelectItem value="OPERATIONAL_CHANGE">Due to operational changes</SelectItem>
              <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Method *</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIGITAL_MEETING">Digital meeting</SelectItem>
              <SelectItem value="PHONE">Phone</SelectItem>
              <SelectItem value="WRITTEN">Written in HMS Nova</SelectItem>
              <SelectItem value="IN_PERSON">In-person meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What was asked about?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description of the inquiry *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what the customer asked about..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendation">Recommendation/advice given *</Label>
        <Textarea
          id="recommendation"
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="What was recommended?"
          rows={3}
          required
        />
      </div>

      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isWithinScope"
            checked={isWithinScope}
            onCheckedChange={(c) => setIsWithinScope(c as boolean)}
          />
          <Label htmlFor="isWithinScope" className="font-normal">
            Within base package scope
          </Label>
        </div>

        {!isWithinScope && (
          <>
            <p className="text-sm text-muted-foreground">
              <strong>Scope limitation (important):</strong> ❌ No individual follow-up, ❌ No treatment, ❌ No NAV cases
            </p>
            <div className="space-y-2">
              <Label htmlFor="outOfScope">What was the referral to?</Label>
              <Textarea
                id="outOfScope"
                value={outOfScopeNotes}
                onChange={(e) => setOutOfScopeNotes(e.target.value)}
                placeholder="Describe what the customer was referred to (e.g. extended OHS package, external specialist)"
                rows={2}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setExpanded(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Register consultation
        </Button>
      </div>
    </form>
  );
}


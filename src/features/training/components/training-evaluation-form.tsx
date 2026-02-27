"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { evaluateTraining } from "@/server/actions/training.actions";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck } from "lucide-react";

interface TrainingEvaluationFormProps {
  trainingId: string;
  trainingTitle: string;
  userId: string;
  trigger?: React.ReactNode;
}

export function TrainingEvaluationForm({
  trainingId,
  trainingTitle,
  userId,
  trigger,
}: TrainingEvaluationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const effectiveness = formData.get("effectiveness") as string;

    const result = await evaluateTraining({
      id: trainingId,
      effectiveness,
      evaluatedBy: userId,
    });

    if (result.success) {
      toast({
        title: "✅ Evaluation registered",
        description: "The effectiveness assessment has been documented",
        className: "bg-green-50 border-green-200",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not register evaluation",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Evaluate effectiveness
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Evaluate training effectiveness</DialogTitle>
          <DialogDescription>
            ISO 9001 - 7.2: Evaluate whether the training has resulted in the desired competence and effect
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📚 Course: {trainingTitle}
              </p>
              <p className="text-sm text-blue-800">
                Assess whether the training has had the desired effect. Has the employee acquired
                the necessary competence? Is the knowledge applied in practice?
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="effectiveness">Effectiveness assessment *</Label>
            <Textarea
              id="effectiveness"
              name="effectiveness"
              rows={6}
              placeholder="Describe how the training has affected the employee's competence and job performance. Example: 'The employee shows good understanding of HSE procedures and actively applies the knowledge in daily work. The training is assessed as effective.'"
              required
              disabled={loading}
              minLength={20}
            />
            <p className="text-sm text-muted-foreground">
              Minimum 20 characters. Be specific and descriptive.
            </p>
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-amber-900 mb-2">
                💡 Evaluation guidance:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Has the employee demonstrated increased competence?</li>
                <li>Is the knowledge applied in practical work?</li>
                <li>Has the training contributed to fewer incidents?</li>
                <li>Is further training needed?</li>
                <li>Is the course recommended for other employees?</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Register evaluation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

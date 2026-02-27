"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAccessReview } from "@/server/actions/security.actions";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function SecurityAccessReviewForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createAccessReview({
        title: formData.get("title"),
        systemName: formData.get("systemName"),
        scope: formData.get("scope"),
        dueDate: formData.get("dueDate"),
      });

      if (result.success) {
        toast({ title: "Access review created" });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not create access review",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Access Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Access Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required disabled={isPending} placeholder="e.g. Q1 Azure AD Review" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemName">System</Label>
            <Input id="systemName" name="systemName" disabled={isPending} placeholder="e.g. Azure AD" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Textarea id="scope" name="scope" rows={3} disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" disabled={isPending} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccessReviewEntry, completeAccessReview } from "@/server/actions/security.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import type { AccessDecision, AccessReviewStatus } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface AccessReviewListProps {
  reviews: Array<{
    id: string;
    title: string;
    systemName?: string | null;
    status: AccessReviewStatus;
    dueDate?: Date | null;
    owner?: { name?: string | null; email?: string | null } | null;
    entries: Array<{
      id: string;
      userName: string;
      userEmail: string;
      role?: string | null;
      decision: AccessDecision;
    }>;
  }>;
}

const decisionLabels: Record<AccessDecision, string> = {
  REVIEW: "Til vurdering",
  APPROVED: "Ok",
  REVOKED: "Fjernes",
};

const statusVariant: Record<AccessReviewStatus, string> = {
  PLANNED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export function SecurityAccessReviewList({ reviews }: AccessReviewListProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleEntrySubmit = (reviewId: string, formData: FormData) => {
    startTransition(async () => {
      const result = await createAccessReviewEntry({
        reviewId,
        userName: formData.get("userName"),
        userEmail: formData.get("userEmail"),
        role: formData.get("role"),
        decision: formData.get("decision"),
        comment: formData.get("comment"),
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Feil",
          description: result.error || "Kunne ikke lagre vurdering",
        });
      } else {
        toast({ title: "Vurdering lagret" });
      }
    });
  };

  const handleComplete = (reviewId: string) => {
    startTransition(async () => {
      const result = await completeAccessReview(reviewId);
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Feil",
          description: result.error || "Kunne ikke fullføre gjennomgangen",
        });
      } else {
        toast({ title: "Tilgangsgjennomgang fullført" });
      }
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Ingen tilgangsgjennomganger opprettet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border">
          <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{review.title}</p>
              <p className="text-sm text-muted-foreground">
                {review.systemName} • Eier: {review.owner?.name || review.owner?.email || "Ikke satt"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {review.dueDate && (
                <p className="text-sm text-muted-foreground">
                  Frist {format(review.dueDate, "dd. MMM yyyy", { locale: nb })}
                </p>
              )}
              <Badge className={statusVariant[review.status]}>{review.status}</Badge>
              {review.status !== "COMPLETED" && (
                <Button variant="outline" size="sm" onClick={() => handleComplete(review.id)} disabled={isPending}>
                  Marker som fullført
                </Button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bruker</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Beslutning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {review.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">{entry.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{entry.role || "—"}</TableCell>
                  <TableCell className="text-sm">{decisionLabels[entry.decision]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {review.status !== "COMPLETED" && (
            <form
              className="grid gap-4 border-t p-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleEntrySubmit(review.id, new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`userName-${review.id}`}>Navn *</Label>
                <Input id={`userName-${review.id}`} name="userName" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`userEmail-${review.id}`}>E-post *</Label>
                <Input
                  id={`userEmail-${review.id}`}
                  name="userEmail"
                  type="email"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`role-${review.id}`}>Rolle</Label>
                <Input id={`role-${review.id}`} name="role" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label>Beslutning</Label>
                <Select name="decision" defaultValue="REVIEW" disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REVIEW">Til vurdering</SelectItem>
                    <SelectItem value="APPROVED">Godkjent</SelectItem>
                    <SelectItem value="REVOKED">Fjernes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={`comment-${review.id}`}>Kommentar</Label>
                <Textarea id={`comment-${review.id}`} name="comment" rows={2} disabled={isPending} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Lagrer..." : "Legg til vurdering"}
                </Button>
              </div>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Calendar, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: number;
  location: string | null;
  status: string;
  dueDate: Date | null;
  resolvedAt: Date | null;
  resolutionNotes: string | null;
  imageKeys: string | null;
}

interface InspectionFindingListProps {
  findings: Finding[];
}

function getSeverityBadge(severity: number) {
  const config: Record<number, { className: string; label: string }> = {
    1: { className: "bg-blue-100 text-blue-900 border-blue-200", label: "Low" },
    2: { className: "bg-green-100 text-green-900 border-green-200", label: "Moderate" },
    3: { className: "bg-yellow-100 text-yellow-900 border-yellow-200", label: "Significant" },
    4: { className: "bg-orange-100 text-orange-900 border-orange-200", label: "High" },
    5: { className: "bg-red-100 text-red-900 border-red-200", label: "Critical" },
  };
  const severityConfig = config[severity] || config[1];
  return <Badge className={severityConfig.className}>{severityConfig.label}</Badge>;
}

function getStatusBadge(status: string) {
  const config: Record<string, { className: string; label: string }> = {
    OPEN: { className: "bg-red-100 text-red-900 border-red-200", label: "Open" },
    IN_PROGRESS: { className: "bg-yellow-100 text-yellow-900 border-yellow-200", label: "In Progress" },
    RESOLVED: { className: "bg-green-100 text-green-900 border-green-200", label: "Resolved" },
    CLOSED: { className: "bg-gray-100 text-gray-900 border-gray-200", label: "Closed" },
  };
  return <Badge className={config[status]?.className || config.OPEN.className}>
    {config[status]?.label || status}
  </Badge>;
}

function UpdateFindingStatusDialog({ finding }: { finding: Finding }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      status: formData.get("status") as string,
      resolutionNotes: formData.get("resolutionNotes") as string,
    };

    try {
      const response = await fetch(`/api/inspections/findings/${finding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update finding");
      }

      toast({
        title: "Finding updated",
        description: "Status has been changed",
      });

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Finding</DialogTitle>
          <DialogDescription>Change status and add resolution notes</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={finding.status} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolutionNotes">Resolution Notes</Label>
            <Textarea
              id="resolutionNotes"
              name="resolutionNotes"
              defaultValue={finding.resolutionNotes || ""}
              placeholder="Describe how the finding was handled..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InspectionFindingList({ findings }: InspectionFindingListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/inspections/findings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete finding");
      }

      toast({
        title: "Finding deleted",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (findings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const images = finding.imageKeys ? JSON.parse(finding.imageKeys) : [];
        
        return (
          <Card key={finding.id} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{finding.title}</CardTitle>
                  {finding.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {finding.location}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getSeverityBadge(finding.severity)}
                  {getStatusBadge(finding.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                <p className="text-sm whitespace-pre-wrap">{finding.description}</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((imageKey: string, idx: number) => (
                    <img
                      key={idx}
                      src={`/api/inspections/images/${imageKey}`}
                      alt="Finding image"
                      className="w-full h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}

              {finding.resolutionNotes && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Resolution:</p>
                  <p className="text-sm whitespace-pre-wrap text-green-800">
                    {finding.resolutionNotes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {finding.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(finding.dueDate), "MMM d, yyyy", { locale: enUS })}</span>
                    </div>
                  )}

                  {finding.resolvedAt && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Resolved: {format(new Date(finding.resolvedAt), "MMM d, yyyy", { locale: enUS })}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <UpdateFindingStatusDialog finding={finding} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(finding.id, finding.title)}
                    disabled={deletingId === finding.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

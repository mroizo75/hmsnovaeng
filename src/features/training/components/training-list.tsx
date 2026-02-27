"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Trash2, FileText, Search, Filter } from "lucide-react";
import { deleteTraining } from "@/server/actions/training.actions";
import { useToast } from "@/hooks/use-toast";
import {
  getTrainingStatus,
  getTrainingStatusLabel,
  getTrainingStatusColor,
} from "@/features/training/schemas/training.schema";
import type { Training } from "@prisma/client";

interface TrainingListProps {
  trainings: (Training & { user?: { name: string | null; email: string } })[];
}

export function TrainingList({ trainings }: TrainingListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis cannot be undone.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteTraining(id);
    if (result.success) {
      toast({
        title: "🗑️ Training deleted",
        description: `"${title}" has been permanently removed`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error || "Could not delete training",
      });
    }
    setLoading(null);
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      training.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;

    const status = getTrainingStatus(training);
    return status === statusFilter;
  });

  if (trainings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">No training registered</h3>
        <p className="mb-4 text-muted-foreground">
          Start by registering competence for your employees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by course, provider or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="NOT_STARTED">Not started</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="VALID">Valid</SelectItem>
              <SelectItem value="EXPIRING_SOON">Expiring soon</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTrainings.length} of {trainings.length} training records
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No training records found
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainings.map((training) => {
                const status = getTrainingStatus(training);
                const statusLabel = getTrainingStatusLabel(status);
                const statusColor = getTrainingStatusColor(status);

                return (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {training.title}
                          {training.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {training.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {training.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {training.user?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {training.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{training.provider}</TableCell>
                    <TableCell>
                      {training.completedAt
                        ? new Date(training.completedAt).toLocaleDateString("en-US")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {training.validUntil ? (
                        <div>
                          {new Date(training.validUntil).toLocaleDateString("en-US")}
                          {status === "EXPIRING_SOON" && (
                            <div className="text-xs text-yellow-600 font-medium mt-1">
                              {Math.ceil(
                                (new Date(training.validUntil).getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days remaining
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Does not expire</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {training.proofDocKey && (
                          <Button variant="ghost" size="sm" title="View certificate">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(training.id, training.title)}
                          disabled={loading === training.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

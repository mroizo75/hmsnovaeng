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
import { Progress } from "@/components/ui/progress";
import { Target, Trash2, Eye, Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { deleteGoal } from "@/server/actions/goal.actions";
import { useToast } from "@/hooks/use-toast";
import {
  getCategoryLabel,
  getCategoryColor,
  getStatusLabel,
  getStatusColor,
  calculateProgress,
  getProgressColor,
} from "@/features/goals/schemas/goal.schema";
import type { Goal } from "@prisma/client";

interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the goal "${title}"?\n\nThis cannot be undone.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteGoal(id);
    if (result.success) {
      toast({
        title: "🗑️ Goal deleted",
        description: `"${title}" has been permanently removed`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error || "Could not delete goal",
      });
    }
    setLoading(null);
  };

  // Filtering
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && goal.status !== statusFilter) return false;
    if (categoryFilter !== "all" && goal.category !== categoryFilter) return false;
    return true;
  });

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Target className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">No goals found</h3>
        <p className="mb-4 text-muted-foreground">
          Start by creating your first quality goal.
        </p>
        <Link href="/dashboard/goals/new">
          <Button>
            <Target className="mr-2 h-4 w-4" />
            Create goal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ACHIEVED">Achieved</SelectItem>
              <SelectItem value="AT_RISK">At risk</SelectItem>
              <SelectItem value="FAILED">Not achieved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="QUALITY">Quality</SelectItem>
              <SelectItem value="HMS">EHS</SelectItem>
              <SelectItem value="ENVIRONMENT">Environment</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="EFFICIENCY">Efficiency</SelectItem>
              <SelectItem value="FINANCE">Finance</SelectItem>
              <SelectItem value="COMPETENCE">Competence</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredGoals.length} of {goals.length} goals
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGoals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No goals found
                </TableCell>
              </TableRow>
            ) : (
              filteredGoals.map((goal) => {
                const categoryLabel = getCategoryLabel(goal.category);
                const categoryColor = getCategoryColor(goal.category);
                const statusLabel = getStatusLabel(goal.status);
                const statusColor = getStatusColor(goal.status);
                const progress = calculateProgress(goal.currentValue, goal.targetValue, goal.baseline);
                const progressColor = getProgressColor(progress);

                return (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{goal.title}</div>
                        {goal.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {goal.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColor}>{categoryLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[150px]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{progress}%</span>
                          <span className="text-muted-foreground">
                            {goal.currentValue?.toFixed(1) || 0} / {goal.targetValue?.toFixed(1) || 0} {goal.unit || ""}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {goal.year}
                      {goal.quarter && ` Q${goal.quarter}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/goals/${goal.id}`}>
                        <Button variant="ghost" size="sm" className="mr-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(goal.id, goal.title)}
                        disabled={loading === goal.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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


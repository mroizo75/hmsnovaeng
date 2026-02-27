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
import { ClipboardCheck, Trash2, Eye, Search, Filter } from "lucide-react";
import Link from "next/link";
import { deleteAudit } from "@/server/actions/audit.actions";
import { useToast } from "@/hooks/use-toast";
import {
  getAuditTypeLabel,
  getAuditTypeColor,
  getAuditStatusLabel,
  getAuditStatusColor,
} from "@/features/audits/schemas/audit.schema";
import type { Audit, AuditFinding } from "@prisma/client";

interface AuditListProps {
  audits: (Audit & { findings: AuditFinding[] })[];
}

export function AuditList({ audits }: AuditListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis cannot be undone.`)) {
      return;
    }

    setLoading(id);
    const result = await deleteAudit(id);
    if (result.success) {
      toast({
        title: "🗑️ Audit deleted",
        description: `"${title}" has been permanently removed`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error || "Could not delete audit",
      });
    }
    setLoading(null);
  };

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (audit.department?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    if (!matchesSearch) return false;

    if (statusFilter !== "all" && audit.status !== statusFilter) return false;
    if (typeFilter !== "all" && audit.auditType !== typeFilter) return false;

    return true;
  });

  if (audits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <ClipboardCheck className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">No audits found</h3>
        <p className="mb-4 text-muted-foreground">
          Start by planning your first internal audit.
        </p>
        <Link href="/dashboard/audits/new">
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Plan audit
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, area or department..."
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
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="INTERNAL">Internal Audit</SelectItem>
              <SelectItem value="EXTERNAL">External Audit</SelectItem>
              <SelectItem value="SUPPLIER">Supplier Audit</SelectItem>
              <SelectItem value="CERTIFICATION">Certification Audit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAudits.length} of {audits.length} audits
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Findings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAudits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No audits found
                </TableCell>
              </TableRow>
            ) : (
              filteredAudits.map((audit) => {
                const typeLabel = getAuditTypeLabel(audit.auditType);
                const typeColor = getAuditTypeColor(audit.auditType);
                const statusLabel = getAuditStatusLabel(audit.status);
                const statusColor = getAuditStatusColor(audit.status);

                const majorNCs = audit.findings.filter((f) => f.findingType === "MAJOR_NC").length;
                const minorNCs = audit.findings.filter((f) => f.findingType === "MINOR_NC").length;
                const totalFindings = audit.findings.length;

                return (
                  <TableRow key={audit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{audit.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {audit.area}
                          {audit.department && ` · ${audit.department}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColor}>{typeLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(audit.scheduledDate).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {totalFindings > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">{totalFindings}</span>
                          {(majorNCs > 0 || minorNCs > 0) && (
                            <div className="flex gap-1 text-xs">
                              {majorNCs > 0 && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  {majorNCs} major
                                </Badge>
                              )}
                              {minorNCs > 0 && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs px-1 py-0">
                                  {minorNCs} minor
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/audits/${audit.id}`}>
                        <Button variant="ghost" size="sm" className="mr-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(audit.id, audit.title)}
                        disabled={loading === audit.id}
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

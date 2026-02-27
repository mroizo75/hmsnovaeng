import { z } from "zod";
import { WorkersCompStatus } from "@prisma/client";

export const createWorkersCompClaimSchema = z.object({
  tenantId: z.string().cuid(),
  incidentId: z.string().cuid().optional(),
  claimNumber: z.string().min(2),
  carrierName: z.string().min(2),
  claimantName: z.string().min(2),
  injuryDate: z.date(),
  reportedDate: z.date(),
  reserveAmount: z.number().min(0).optional(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateWorkersCompClaimSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(WorkersCompStatus).optional(),
  reserveAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  lostWorkDays: z.number().int().min(0).optional(),
  returnToWorkDate: z.date().optional(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const closeWorkersCompClaimSchema = z.object({
  id: z.string().cuid(),
  paidAmount: z.number().min(0).optional(),
  lostWorkDays: z.number().int().min(0).optional(),
  returnToWorkDate: z.date().optional(),
  notes: z.string().optional(),
});

export const recordEmrSchema = z.object({
  tenantId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  emrValue: z.number().min(0).max(10),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateWorkersCompClaimInput = z.infer<typeof createWorkersCompClaimSchema>;
export type UpdateWorkersCompClaimInput = z.infer<typeof updateWorkersCompClaimSchema>;
export type CloseWorkersCompClaimInput = z.infer<typeof closeWorkersCompClaimSchema>;
export type RecordEmrInput = z.infer<typeof recordEmrSchema>;

export function getWorkersCompStatusLabel(s: WorkersCompStatus): string {
  const labels: Record<WorkersCompStatus, string> = {
    OPEN: "Open",
    CLOSED: "Closed",
    DISPUTED: "Disputed",
    SETTLED: "Settled",
  };
  return labels[s];
}

export function getWorkersCompStatusColor(s: WorkersCompStatus): string {
  const colors: Record<WorkersCompStatus, string> = {
    OPEN: "bg-blue-100 text-blue-800",
    CLOSED: "bg-gray-100 text-gray-800",
    DISPUTED: "bg-red-100 text-red-800",
    SETTLED: "bg-green-100 text-green-800",
  };
  return colors[s];
}

export function getEmrRating(emr: number): { label: string; color: string } {
  if (emr < 0.85) return { label: "Below Average (Favorable)", color: "text-green-700" };
  if (emr < 1.0) return { label: "Average", color: "text-blue-700" };
  if (emr < 1.25) return { label: "Above Average", color: "text-yellow-700" };
  return { label: "High Risk", color: "text-red-700" };
}

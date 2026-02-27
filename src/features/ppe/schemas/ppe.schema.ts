import { z } from "zod";
import { PpeItemCondition } from "@prisma/client";

const hazardItemSchema = z.object({
  hazard: z.string().min(2),
  type: z.enum(["PHYSICAL", "CHEMICAL", "BIOLOGICAL", "RADIOLOGICAL", "ELECTRICAL", "OTHER"]),
});

const ppeRequiredItemSchema = z.object({
  type: z.string().min(2),
  spec: z.string().optional(),
});

export const createPpeAssessmentSchema = z.object({
  tenantId: z.string().cuid(),
  workArea: z.string().min(2),
  jobTitle: z.string().optional(),
  hazardsFound: z.array(hazardItemSchema).min(1, "At least one hazard must be identified"),
  ppeRequired: z.array(ppeRequiredItemSchema).min(1, "At least one PPE item must be specified"),
  assessedBy: z.string().min(2),
  assessedAt: z.date(),
  reviewDue: z.date().optional(),
  notes: z.string().optional(),
});

export const createPpeAssignmentSchema = z.object({
  tenantId: z.string().cuid(),
  assessmentId: z.string().cuid().optional(),
  userId: z.string().min(2),
  ppeType: z.string().min(2),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  size: z.string().optional(),
  issuedDate: z.date(),
  issuedBy: z.string().min(2),
  notes: z.string().optional(),
});

export const inspectPpeAssignmentSchema = z.object({
  id: z.string().cuid(),
  lastInspected: z.date(),
  inspectedBy: z.string().min(2),
  condition: z.nativeEnum(PpeItemCondition),
  notes: z.string().optional(),
});

export const signPpeAssignmentSchema = z.object({
  id: z.string().cuid(),
  signature: z.string().min(10),
});

export const removePpeAssignmentSchema = z.object({
  id: z.string().cuid(),
  removedDate: z.date(),
  removedReason: z.string().min(5),
});

export type CreatePpeAssessmentInput = z.infer<typeof createPpeAssessmentSchema>;
export type CreatePpeAssignmentInput = z.infer<typeof createPpeAssignmentSchema>;
export type InspectPpeAssignmentInput = z.infer<typeof inspectPpeAssignmentSchema>;
export type SignPpeAssignmentInput = z.infer<typeof signPpeAssignmentSchema>;
export type RemovePpeAssignmentInput = z.infer<typeof removePpeAssignmentSchema>;

export function getPpeConditionLabel(c: PpeItemCondition): string {
  const labels: Record<PpeItemCondition, string> = {
    GOOD: "Good",
    NEEDS_SERVICE: "Needs Service",
    REMOVED_FROM_SERVICE: "Removed from Service",
  };
  return labels[c];
}

export function getPpeConditionColor(c: PpeItemCondition): string {
  const colors: Record<PpeItemCondition, string> = {
    GOOD: "bg-green-100 text-green-800",
    NEEDS_SERVICE: "bg-yellow-100 text-yellow-800",
    REMOVED_FROM_SERVICE: "bg-red-100 text-red-800",
  };
  return colors[c];
}

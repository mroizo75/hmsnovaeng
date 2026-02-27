import { z } from "zod";

const energySourceSchema = z.object({
  type: z.enum(["ELECTRICAL", "HYDRAULIC", "PNEUMATIC", "MECHANICAL", "THERMAL", "CHEMICAL", "GRAVITY", "OTHER"]),
  magnitude: z.string().min(1),
  location: z.string().min(2),
});

const lotoStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  action: z.string().min(5),
  responsible: z.string().min(2),
});

export const createLotoProgramSchema = z.object({
  tenantId: z.string().cuid(),
  programName: z.string().min(3),
  effectiveDate: z.date(),
  scope: z.string().min(10),
  notes: z.string().optional(),
});

export const updateLotoProgramSchema = createLotoProgramSchema.partial().extend({
  id: z.string().cuid(),
  reviewedBy: z.string().optional(),
  reviewedTitle: z.string().optional(),
});

export const createLotoProcedureSchema = z.object({
  programId: z.string().cuid(),
  equipmentName: z.string().min(2),
  equipmentId: z.string().optional(),
  location: z.string().optional(),
  energySources: z.array(energySourceSchema).min(1, "At least one energy source is required"),
  steps: z.array(lotoStepSchema).min(3, "LOTO procedure must have at least 3 steps"),
  authorizedUsers: z.array(z.string()).min(1, "At least one authorized user is required"),
  notes: z.string().optional(),
});

export const updateLotoProcedureSchema = createLotoProcedureSchema.partial().extend({
  id: z.string().cuid(),
});

export const annualReviewLotoProcedureSchema = z.object({
  id: z.string().cuid(),
  annualReviewedBy: z.string().min(2),
});

export type CreateLotoProgramInput = z.infer<typeof createLotoProgramSchema>;
export type UpdateLotoProgramInput = z.infer<typeof updateLotoProgramSchema>;
export type CreateLotoProcedureInput = z.infer<typeof createLotoProcedureSchema>;
export type UpdateLotoProcedureInput = z.infer<typeof updateLotoProcedureSchema>;
export type AnnualReviewLotoProcedureInput = z.infer<typeof annualReviewLotoProcedureSchema>;

export const LOTO_ENERGY_TYPES = [
  "ELECTRICAL",
  "HYDRAULIC",
  "PNEUMATIC",
  "MECHANICAL",
  "THERMAL",
  "CHEMICAL",
  "GRAVITY",
  "OTHER",
] as const;

export function getLotoEnergyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ELECTRICAL: "Electrical",
    HYDRAULIC: "Hydraulic",
    PNEUMATIC: "Pneumatic",
    MECHANICAL: "Mechanical",
    THERMAL: "Thermal / Heat",
    CHEMICAL: "Chemical",
    GRAVITY: "Gravity",
    OTHER: "Other",
  };
  return labels[type] ?? type;
}

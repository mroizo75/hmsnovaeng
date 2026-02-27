import { z } from "zod";
import { PpeItemCondition } from "@prisma/client";

const fallHazardSchema = z.object({
  hazard: z.string().min(2),
  location: z.string().min(2),
  height: z.string().min(1),
});

const fallControlSchema = z.object({
  type: z.enum(["ELIMINATION", "GUARDRAIL", "SAFETY_NET", "PERSONAL_FALL_ARREST", "WARNING_LINE", "MONITOR", "OTHER"]),
  description: z.string().min(5),
});

export const createFallProtectionProgramSchema = z.object({
  tenantId: z.string().cuid(),
  effectiveDate: z.date(),
  hazards: z.array(fallHazardSchema).min(1, "At least one fall hazard must be identified"),
  controls: z.array(fallControlSchema).min(1, "At least one control must be specified"),
  rescuePlan: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFallProtectionProgramSchema = createFallProtectionProgramSchema.partial().extend({
  id: z.string().cuid(),
  reviewedBy: z.string().optional(),
});

export const logFallEquipmentSchema = z.object({
  programId: z.string().cuid(),
  equipmentType: z.string().min(2),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  lastInspected: z.date(),
  inspectedBy: z.string().min(2),
  condition: z.nativeEnum(PpeItemCondition),
  notes: z.string().optional(),
});

export const removeFallEquipmentSchema = z.object({
  id: z.string().cuid(),
  removalDate: z.date(),
  notes: z.string().min(5),
});

export type CreateFallProtectionProgramInput = z.infer<typeof createFallProtectionProgramSchema>;
export type UpdateFallProtectionProgramInput = z.infer<typeof updateFallProtectionProgramSchema>;
export type LogFallEquipmentInput = z.infer<typeof logFallEquipmentSchema>;
export type RemoveFallEquipmentInput = z.infer<typeof removeFallEquipmentSchema>;

export const FALL_CONTROL_TYPES = [
  { value: "ELIMINATION", label: "Elimination (avoid working at height)" },
  { value: "GUARDRAIL", label: "Guardrail System" },
  { value: "SAFETY_NET", label: "Safety Net" },
  { value: "PERSONAL_FALL_ARREST", label: "Personal Fall Arrest System (PFAS)" },
  { value: "WARNING_LINE", label: "Warning Line System" },
  { value: "MONITOR", label: "Safety Monitoring System" },
  { value: "OTHER", label: "Other" },
] as const;

export const FALL_EQUIPMENT_TYPES = [
  "Full Body Harness",
  "Shock-Absorbing Lanyard",
  "Self-Retracting Lifeline (SRL)",
  "Rope Grab",
  "Anchor Point / Anchorage Connector",
  "Horizontal Lifeline",
  "Vertical Lifeline",
  "Safety Net",
  "Rescue Device",
] as const;

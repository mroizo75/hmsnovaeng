import { z } from "zod";

const evacuationRouteSchema = z.object({
  route: z.string().min(2),
  mapKey: z.string().optional(),
});

const assemblyPointSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  phone: z.string().min(7),
  agency: z.string().optional(),
});

const eapRoleSchema = z.object({
  role: z.string().min(2),
  userId: z.string().optional(),
  name: z.string().min(2),
  responsibilities: z.string().min(5),
});

const equipmentItemSchema = z.object({
  type: z.string().min(2),
  location: z.string().min(2),
  lastInspected: z.string().optional(),
});

export const createEapSchema = z.object({
  tenantId: z.string().cuid(),
  locationName: z.string().min(2),
  effectiveDate: z.date(),
  alarmSystem: z.string().optional(),
  evacuationRoutes: z.array(evacuationRouteSchema).min(1, "At least one evacuation route is required"),
  assemblyPoints: z.array(assemblyPointSchema).min(1, "At least one assembly point is required"),
  emergencyContacts: z.array(emergencyContactSchema).min(1, "At least one emergency contact is required"),
  roles: z.array(eapRoleSchema).min(1, "At least one role assignment is required"),
  equipment: z.array(equipmentItemSchema),
  medicalFacility: z.string().optional(),
  notes: z.string().optional(),
});

export const updateEapSchema = createEapSchema.partial().extend({
  id: z.string().cuid(),
});

export const logDrillSchema = z.object({
  planId: z.string().cuid(),
  drillType: z.string().min(2),
  conductedAt: z.date(),
  durationMin: z.number().int().min(1).optional(),
  participantCount: z.number().int().min(1).optional(),
  conductedBy: z.string().min(2),
  findings: z.string().optional(),
  correctiveActions: z.string().optional(),
});

export type CreateEapInput = z.infer<typeof createEapSchema>;
export type UpdateEapInput = z.infer<typeof updateEapSchema>;
export type LogDrillInput = z.infer<typeof logDrillSchema>;

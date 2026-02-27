import { z } from "zod";
import { PermitStatus } from "@prisma/client";

const spaceHazardSchema = z.object({
  type: z.string().min(2),
  description: z.string().min(5),
});

export const createConfinedSpaceSchema = z.object({
  tenantId: z.string().cuid(),
  spaceName: z.string().min(2),
  location: z.string().min(2),
  permitRequired: z.boolean(),
  hazards: z.array(spaceHazardSchema),
  dimensions: z.string().optional(),
  entryPoints: z.string().optional(),
  notes: z.string().optional(),
});

const entrantSchema = z.object({
  name: z.string().min(2),
  userId: z.string().optional(),
});

const atmosphericTestSchema = z.object({
  gas: z.string().min(2),
  reading: z.string().min(1),
  acceptable: z.string().min(1),
  testedAt: z.string(),
  testedBy: z.string().min(2),
});

const equipmentCheckSchema = z.object({
  item: z.string().min(2),
  checked: z.boolean(),
});

const hazardControlSchema = z.object({
  hazard: z.string().min(2),
  control: z.string().min(5),
});

export const createConfinedSpacePermitSchema = z.object({
  spaceId: z.string().cuid(),
  permitNumber: z.string().min(2),
  issuedAt: z.date(),
  expiresAt: z.date(),
  authorizedEntrants: z.array(entrantSchema).min(1, "At least one authorized entrant is required"),
  attendants: z.array(entrantSchema).min(1, "At least one attendant is required"),
  supervisors: z.array(entrantSchema).min(1, "At least one entry supervisor is required"),
  hazardsIdentified: z.array(hazardControlSchema),
  atmosphericTests: z.array(atmosphericTestSchema).min(1, "Atmospheric testing is required"),
  equipmentRequired: z.array(equipmentCheckSchema),
  rescueProcedures: z.string().optional(),
  notes: z.string().optional(),
});

export const closeConfinedSpacePermitSchema = z.object({
  id: z.string().cuid(),
  notes: z.string().optional(),
});

export const cancelConfinedSpacePermitSchema = z.object({
  id: z.string().cuid(),
  cancelledReason: z.string().min(5),
});

export type CreateConfinedSpaceInput = z.infer<typeof createConfinedSpaceSchema>;
export type CreateConfinedSpacePermitInput = z.infer<typeof createConfinedSpacePermitSchema>;
export type CloseConfinedSpacePermitInput = z.infer<typeof closeConfinedSpacePermitSchema>;
export type CancelConfinedSpacePermitInput = z.infer<typeof cancelConfinedSpacePermitSchema>;

export function getPermitStatusLabel(s: PermitStatus): string {
  const labels: Record<PermitStatus, string> = {
    OPEN: "Open / Active",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
  };
  return labels[s];
}

export function getPermitStatusColor(s: PermitStatus): string {
  const colors: Record<PermitStatus, string> = {
    OPEN: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[s];
}

// OSHA-required atmospheric testing thresholds
export const ATMOSPHERIC_TEST_LIMITS = [
  { gas: "Oxygen (O₂)", acceptable: "19.5% – 23.5%", unit: "%" },
  { gas: "Flammable Gas/Vapor", acceptable: "< 10% LEL", unit: "% LEL" },
  { gas: "Carbon Monoxide (CO)", acceptable: "< 25 ppm TWA", unit: "ppm" },
  { gas: "Hydrogen Sulfide (H₂S)", acceptable: "< 1 ppm ceiling", unit: "ppm" },
] as const;

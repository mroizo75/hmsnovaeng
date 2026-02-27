import { z } from "zod";
import { HepBVaccineStatus } from "@prisma/client";

const exposedPositionSchema = z.object({
  jobTitle: z.string().min(2),
  tasks: z.array(z.string().min(3)).min(1),
});

const engineeringControlSchema = z.object({
  control: z.string().min(3),
  location: z.string().min(2),
});

const ppeItemSchema = z.object({
  item: z.string().min(2),
  when: z.string().min(5),
});

export const createBbpProgramSchema = z.object({
  tenantId: z.string().cuid(),
  effectiveDate: z.date(),
  exposedPositions: z.array(exposedPositionSchema).min(1, "At least one exposed position is required"),
  engineeringControls: z.array(engineeringControlSchema).min(1, "At least one engineering control is required"),
  workPracticeControls: z.array(z.string().min(5)).min(1, "At least one work practice control is required"),
  ppe: z.array(ppeItemSchema),
  decontaminationPlan: z.string().optional(),
  wasteDisposalPlan: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBbpProgramSchema = createBbpProgramSchema.partial().extend({
  id: z.string().cuid(),
  reviewedBy: z.string().optional(),
});

export const recordVaccinationSchema = z.object({
  programId: z.string().cuid(),
  userId: z.string().min(2),
  status: z.nativeEnum(HepBVaccineStatus),
  offeredAt: z.date(),
  respondedAt: z.date().optional(),
  notes: z.string().optional(),
});

export const updateVaccinationStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(HepBVaccineStatus),
  respondedAt: z.date().optional(),
  notes: z.string().optional(),
});

export type CreateBbpProgramInput = z.infer<typeof createBbpProgramSchema>;
export type UpdateBbpProgramInput = z.infer<typeof updateBbpProgramSchema>;
export type RecordVaccinationInput = z.infer<typeof recordVaccinationSchema>;
export type UpdateVaccinationStatusInput = z.infer<typeof updateVaccinationStatusSchema>;

export function getHepBStatusLabel(s: HepBVaccineStatus): string {
  const labels: Record<HepBVaccineStatus, string> = {
    OFFERED: "Offered",
    ACCEPTED: "Accepted",
    DECLINED: "Declined (Declination Form Signed)",
    COMPLETED: "Vaccination Completed",
  };
  return labels[s];
}

export function getHepBStatusColor(s: HepBVaccineStatus): string {
  const colors: Record<HepBVaccineStatus, string> = {
    OFFERED: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-yellow-100 text-yellow-800",
    DECLINED: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colors[s];
}

import { z } from "zod";

const qualificationSchema = z.object({
  type: z.string().min(2),
  description: z.string().min(5),
  dateObtained: z.string().optional(),
});

export const createCompetentPersonSchema = z.object({
  tenantId: z.string().cuid(),
  userId: z.string().min(2),
  designation: z.string().min(3),
  oshaStandard: z.string().min(5),
  qualifications: z.array(qualificationSchema).min(1, "At least one qualification is required"),
  effectiveDate: z.date(),
  expiresAt: z.date().optional(),
  designatedBy: z.string().min(2),
  notes: z.string().optional(),
});

export const updateCompetentPersonSchema = createCompetentPersonSchema.partial().extend({
  id: z.string().cuid(),
});

export const deactivateCompetentPersonSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().min(5),
});

export type CreateCompetentPersonInput = z.infer<typeof createCompetentPersonSchema>;
export type UpdateCompetentPersonInput = z.infer<typeof updateCompetentPersonSchema>;
export type DeactivateCompetentPersonInput = z.infer<typeof deactivateCompetentPersonSchema>;

// Common OSHA competent person designations
export const COMPETENT_PERSON_DESIGNATIONS = [
  { designation: "Excavation Competent Person", standard: "29 CFR 1926.650" },
  { designation: "Scaffold Competent Person", standard: "29 CFR 1926.451" },
  { designation: "Fall Protection Competent Person", standard: "29 CFR 1926.502" },
  { designation: "Aerial Lift Competent Person", standard: "29 CFR 1926.453" },
  { designation: "Confined Space Entry Supervisor", standard: "29 CFR 1910.146" },
  { designation: "LOTO Authorized Employee", standard: "29 CFR 1910.147" },
  { designation: "Crane / Rigging Competent Person", standard: "29 CFR 1926.1400" },
  { designation: "Asbestos Competent Person", standard: "29 CFR 1926.1101" },
  { designation: "Lead Competent Person", standard: "29 CFR 1926.62" },
  { designation: "Silica Competent Person", standard: "29 CFR 1926.1153" },
  { designation: "Electrical Safety Competent Person", standard: "29 CFR 1910.333" },
  { designation: "Hazmat Competent Person", standard: "29 CFR 1910.120" },
] as const;

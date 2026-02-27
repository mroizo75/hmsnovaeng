import { z } from "zod";
import { OshaClassification, OshaEventType, OshaIllnessType } from "@prisma/client";

export const markOshaRecordableSchema = z.object({
  incidentId: z.string().cuid(),
  oshaRecordable: z.boolean(),
  oshaClassification: z.nativeEnum(OshaClassification).optional(),
  daysAwayFromWork: z.number().int().min(0).optional(),
  daysOnRestriction: z.number().int().min(0).optional(),
  daysOnTransfer: z.number().int().min(0).optional(),
  bodyPartAffected: z.string().max(191).optional(),
  natureOfInjury: z.string().max(191).optional(),
  eventType: z.nativeEnum(OshaEventType).optional(),
  illnessType: z.nativeEnum(OshaIllnessType).optional(),
  privacyCaseFlag: z.boolean().optional(),
  osha300LogYear: z.number().int().min(2000).max(2100).optional(),
});

export const upsertOshaLogSchema = z.object({
  tenantId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  totalHoursWorked: z.number().positive(),
  avgEmployeeCount: z.number().positive(),
});

export const certifyOshaLogSchema = z.object({
  tenantId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  certifiedBy: z.string().min(2),
  certifiedTitle: z.string().min(2),
});

export const postOsha300ASchema = z.object({
  tenantId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  postedBy: z.string().min(2),
});

export type MarkOshaRecordableInput = z.infer<typeof markOshaRecordableSchema>;
export type UpsertOshaLogInput = z.infer<typeof upsertOshaLogSchema>;
export type CertifyOshaLogInput = z.infer<typeof certifyOshaLogSchema>;
export type PostOsha300AInput = z.infer<typeof postOsha300ASchema>;

export function getOshaClassificationLabel(c: OshaClassification): string {
  const labels: Record<OshaClassification, string> = {
    FATALITY: "Fatality",
    DAYS_AWAY: "Days Away from Work",
    RESTRICTED_WORK: "Restricted Work Activity",
    JOB_TRANSFER: "Job Transfer",
    OTHER_RECORDABLE: "Other Recordable",
    FIRST_AID_ONLY: "First Aid Only (Non-Recordable)",
  };
  return labels[c];
}

export function getOshaEventTypeLabel(t: OshaEventType): string {
  return t === "INJURY" ? "Injury" : "Illness";
}

export function getOshaIllnessTypeLabel(t: OshaIllnessType): string {
  const labels: Record<OshaIllnessType, string> = {
    SKIN_DISORDER: "Skin Disorder",
    RESPIRATORY_CONDITION: "Respiratory Condition",
    POISONING: "Poisoning",
    HEARING_LOSS: "Hearing Loss",
    ALL_OTHER_ILLNESSES: "All Other Illnesses",
  };
  return labels[t];
}

export function isOshaRecordable(classification: OshaClassification | null | undefined): boolean {
  if (!classification) return false;
  return classification !== "FIRST_AID_ONLY";
}

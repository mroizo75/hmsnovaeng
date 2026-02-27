import { z } from "zod";
import { ActionEffectiveness, IncidentStage, IncidentType, IncidentStatus } from "@prisma/client";

/**
 * ISO 9001 - 10.2 Avvik og korrigerende tiltak
 * 
 * Krav:
 * a) Reagere på avvik, og om aktuelt:
 *    1) iverksette tiltak for å kontrollere og rette opp i avviket
 *    2) håndtere konsekvensene
 * b) Vurdere behovet for tiltak for å eliminere årsakene til avviket
 * c) Implementere nødvendige tiltak
 * d) Gjennomgå effektiviteten av korrigerende tiltak som er iverksatt
 * e) Oppdatere risikoer og muligheter bestemt under planlegging, om nødvendig
 * f) Foreta endringer i kvalitetsstyringssystemet, om nødvendig
 * 
 * Avvik skal dokumenteres og bevares som dokumentert informasjon.
 */

export const createIncidentSchema = z.object({
  tenantId: z.string().cuid(),
  type: z.nativeEnum(IncidentType),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  severity: z.number().int().min(1).max(5, "Severity must be 1-5"),
  occurredAt: z.date(),
  reportedBy: z.string().cuid(),
  location: z.string().optional(),
  witnessName: z.string().optional(),
  immediateAction: z.string().optional(), // ISO 9001: Umiddelbare tiltak
  injuryType: z.string().max(120).optional(),
  medicalAttentionRequired: z.boolean().optional(),
  lostTimeMinutes: z.number().int().min(0).optional(),
  riskReferenceId: z.string().cuid().optional(),
  customerName: z.string().max(140).optional().or(z.literal("")),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional(),
  customerPhone: z.string().max(60).optional().or(z.literal("")),
  customerTicketId: z.string().max(120).optional().or(z.literal("")),
  responseDeadline: z.date().optional(),
  customerSatisfaction: z.number().int().min(1).max(5).optional(),
});

export const updateIncidentSchema = z.object({
  id: z.string().cuid(),
  type: z.nativeEnum(IncidentType).optional(),
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  severity: z.number().int().min(1).max(5).optional(),
  occurredAt: z.date().optional(),
  location: z.string().optional(),
  witnessName: z.string().optional(),
  immediateAction: z.string().optional(),
  rootCause: z.string().optional(), // ISO 9001: Årsaksanalyse
  contributingFactors: z.string().optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  injuryType: z.string().max(120).optional(),
  medicalAttentionRequired: z.boolean().optional(),
  lostTimeMinutes: z.number().int().min(0).optional(),
  riskReferenceId: z.string().cuid().optional().nullable(),
  measureEffectiveness: z.nativeEnum(ActionEffectiveness).optional(),
  stage: z.nativeEnum(IncidentStage).optional(),
  customerName: z.string().max(140).optional().or(z.literal("")),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  customerPhone: z.string().max(60).optional().or(z.literal("")),
  customerTicketId: z.string().max(120).optional().or(z.literal("")),
  responseDeadline: z.date().optional().nullable(),
  customerSatisfaction: z.number().int().min(1).max(5).optional().nullable(),
});

export const investigateIncidentSchema = z.object({
  id: z.string().cuid(),
  rootCause: z.string().min(20, "Root cause analysis must be at least 20 characters"),
  contributingFactors: z.string().optional(),
  investigatedBy: z.string().cuid(),
});

export const closeIncidentSchema = z.object({
  id: z.string().cuid(),
  closedBy: z.string().cuid(),
  effectivenessReview: z.string().min(20, "Effectiveness review must be at least 20 characters"),
  lessonsLearned: z.string().optional(),
  measureEffectiveness: z.nativeEnum(ActionEffectiveness).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type InvestigateIncidentInput = z.infer<typeof investigateIncidentSchema>;
export type CloseIncidentInput = z.infer<typeof closeIncidentSchema>;

/**
 * Get incident type label
 */
export function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    AVVIK: "Deviation",
    NESTEN: "Near Miss",
    SKADE: "Personal Injury",
    MILJO: "Environmental Incident",
    KVALITET: "Quality Deviation",
    HMS: "H&S",
    CUSTOMER: "Customer Complaint",
  };
  return labels[type];
}

/**
 * Get incident type color
 */
export function getIncidentTypeColor(type: IncidentType): string {
  const colors: Record<IncidentType, string> = {
    AVVIK: "bg-orange-100 text-orange-800 border-orange-300",
    NESTEN: "bg-yellow-100 text-yellow-800 border-yellow-300",
    SKADE: "bg-red-100 text-red-800 border-red-300",
    MILJO: "bg-green-100 text-green-800 border-green-300",
    KVALITET: "bg-blue-100 text-blue-800 border-blue-300",
    HMS: "bg-teal-100 text-teal-800 border-teal-300",
    CUSTOMER: "bg-purple-100 text-purple-800 border-purple-300",
  };
  return colors[type];
}

/**
 * Get severity label and color
 */
export function getSeverityInfo(severity: number): { label: string; color: string; bgColor: string; textColor: string } {
  if (severity >= 5) {
    return {
      label: "Critical",
      color: "text-red-900",
      bgColor: "bg-red-100 border-red-300",
      textColor: "text-red-900",
    };
  } else if (severity >= 4) {
    return {
      label: "Serious",
      color: "text-orange-900",
      bgColor: "bg-orange-100 border-orange-300",
      textColor: "text-orange-900",
    };
  } else if (severity >= 3) {
    return {
      label: "Moderate",
      color: "text-yellow-900",
      bgColor: "bg-yellow-100 border-yellow-300",
      textColor: "text-yellow-900",
    };
  } else if (severity >= 2) {
    return {
      label: "Minor",
      color: "text-blue-900",
      bgColor: "bg-blue-100 border-blue-300",
      textColor: "text-blue-900",
    };
  } else {
    return {
      label: "Negligible",
      color: "text-gray-900",
      bgColor: "bg-gray-100 border-gray-300",
      textColor: "text-gray-900",
    };
  }
}

/**
 * Get status label
 */
// ISO 9001/45001 kap. 10.2 – avvik skal følges opp til lukket
export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Registered",
    INVESTIGATING: "Under Investigation",
    ACTION_TAKEN: "Action Taken",
    CLOSED: "Closed",
  };
  return labels[status] || status;
}

/**
 * Get status color
 */
export function getIncidentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "bg-red-100 text-red-800 border-red-300",
    INVESTIGATING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ACTION_TAKEN: "bg-blue-100 text-blue-800 border-blue-300",
    CLOSED: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

export function getIncidentStageLabel(stage: IncidentStage): string {
  const labels: Record<IncidentStage, string> = {
    REPORTED: "Reported",
    UNDER_REVIEW: "Under Review",
    ROOT_CAUSE: "Root Cause Identified",
    ACTIONS_DEFINED: "Actions Planned",
    ACTIONS_COMPLETE: "Actions Completed",
    VERIFIED: "Verified",
  };
  return labels[stage];
}


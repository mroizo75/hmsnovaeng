import { z } from "zod";

/**
 * ISO 9001 - 9.2 Internrevisjon
 * 
 * Organisasjonen skal gjennomføre interne revisjoner med planlagte intervaller for å gi
 * informasjon om ledelsessystemet er:
 * a) I samsvar med organisasjonens egne krav for sitt ledelsessystem
 * b) I samsvar med kravene i denne internasjonale standarden
 * c) Effektivt implementert og vedlikeholdt
 * 
 * Organisasjonen skal:
 * - Planlegge, etablere, implementere og vedlikeholde et revisjonsprogram
 * - Definere revisjonskriterier og omfang for hver revisjon
 * - Velge revisorer og gjennomføre revisjoner for å sikre objektivitet og upartiskhet
 * - Sikre at resultatene rapporteres til relevant ledelse
 * - Ta korrigerende tiltak uten unødig forsinkelse
 * - Beholde dokumentert informasjon som bevis
 */

export const createAuditSchema = z.object({
  tenantId: z.string().cuid(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  auditType: z.enum(["INTERNAL", "EXTERNAL", "SUPPLIER", "CERTIFICATION"]),
  scope: z.string().min(20, "Scope must be at least 20 characters"),
  criteria: z.string().min(20, "Audit criteria must be at least 20 characters"),
  leadAuditorId: z.string().cuid(),
  teamMemberIds: z.array(z.string().cuid()).optional(),
  scheduledDate: z.date(),
  area: z.string().min(2, "Area must be at least 2 characters"),
  department: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PLANNED"),
});

export const updateAuditSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(5).optional(),
  auditType: z.enum(["INTERNAL", "EXTERNAL", "SUPPLIER", "CERTIFICATION"]).optional(),
  scope: z.string().min(20).optional(),
  criteria: z.string().min(20).optional(),
  leadAuditorId: z.string().cuid().optional(),
  teamMemberIds: z.array(z.string().cuid()).optional(),
  scheduledDate: z.date().optional(),
  completedAt: z.date().optional(),
  area: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  summary: z.string().optional(),
  conclusion: z.string().optional(),
});

export const createFindingSchema = z.object({
  auditId: z.string().cuid(),
  findingType: z.enum(["MAJOR_NC", "MINOR_NC", "OBSERVATION", "STRENGTH"]),
  clause: z.string().min(1, "ISO 9001 clause must be specified"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  evidence: z.string().min(10, "Evidence must be at least 10 characters"),
  requirement: z.string().min(10, "Requirement must be at least 10 characters"),
  responsibleId: z.string().cuid(),
  dueDate: z.date().optional(),
});

export const updateFindingSchema = z.object({
  id: z.string().cuid(),
  findingType: z.enum(["MAJOR_NC", "MINOR_NC", "OBSERVATION", "STRENGTH"]).optional(),
  clause: z.string().optional(),
  description: z.string().optional(),
  evidence: z.string().optional(),
  requirement: z.string().optional(),
  responsibleId: z.string().cuid().optional(),
  dueDate: z.date().optional(),
  correctiveAction: z.string().optional(),
  rootCause: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"]).optional(),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;
export type CreateFindingInput = z.infer<typeof createFindingSchema>;
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;

/**
 * Audit Type Labels (Norsk)
 */
export function getAuditTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INTERNAL: "Internal Audit",
    EXTERNAL: "External Audit",
    SUPPLIER: "Supplier Audit",
    CERTIFICATION: "Certification Audit",
  };
  return labels[type] || type;
}

/**
 * Audit Type Colors
 */
export function getAuditTypeColor(type: string): string {
  const colors: Record<string, string> = {
    INTERNAL: "bg-blue-100 text-blue-800 border-blue-300",
    EXTERNAL: "bg-purple-100 text-purple-800 border-purple-300",
    SUPPLIER: "bg-orange-100 text-orange-800 border-orange-300",
    CERTIFICATION: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Audit Status Labels
 */
export function getAuditStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNED: "Planned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}

/**
 * Audit Status Colors
 */
export function getAuditStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNED: "bg-gray-100 text-gray-800 border-gray-300",
    IN_PROGRESS: "bg-yellow-100 text-black border-yellow-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Finding Type Labels
 */
export function getFindingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MAJOR_NC: "Major Non-Conformance",
    MINOR_NC: "Minor Non-Conformance",
    OBSERVATION: "Observation",
    STRENGTH: "Strength",
  };
  return labels[type] || type;
}

/**
 * Finding Type Colors
 */
export function getFindingTypeColor(type: string): string {
  const colors: Record<string, string> = {
    MAJOR_NC: "bg-red-100 text-red-800 border-red-300",
    MINOR_NC: "bg-orange-100 text-orange-800 border-orange-300",
    OBSERVATION: "bg-yellow-100 text-black border-yellow-300",
    STRENGTH: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Finding Status Labels
 */
export function getFindingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    VERIFIED: "Verified",
  };
  return labels[status] || status;
}

/**
 * Finding Status Colors
 */
export function getFindingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "bg-red-100 text-red-800 border-red-300",
    IN_PROGRESS: "bg-yellow-100 text-black border-yellow-300",
    RESOLVED: "bg-blue-100 text-blue-800 border-blue-300",
    VERIFIED: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * ISO 9001 Standard Clauses (for checklist)
 */
export const ISO_9001_CLAUSES = [
  { clause: "4.1", title: "Understanding the organization and its context" },
  { clause: "4.2", title: "Understanding the needs and expectations of interested parties" },
  { clause: "4.3", title: "Determining the scope of the quality management system" },
  { clause: "4.4", title: "Quality management system and its processes" },
  { clause: "5.1", title: "Leadership and commitment" },
  { clause: "5.2", title: "Policy" },
  { clause: "5.3", title: "Organizational roles, responsibilities and authorities" },
  { clause: "6.1", title: "Actions to address risks and opportunities" },
  { clause: "6.2", title: "Quality objectives and planning to achieve them" },
  { clause: "6.3", title: "Planning of changes" },
  { clause: "7.1", title: "Resources" },
  { clause: "7.2", title: "Competence" },
  { clause: "7.3", title: "Awareness" },
  { clause: "7.4", title: "Communication" },
  { clause: "7.5", title: "Documented information" },
  { clause: "8.1", title: "Operational planning and control" },
  { clause: "8.2", title: "Requirements for products and services" },
  { clause: "8.3", title: "Design and development of products and services" },
  { clause: "8.4", title: "Control of externally provided products and services" },
  { clause: "8.5", title: "Production and service provision" },
  { clause: "8.6", title: "Release of products and services" },
  { clause: "8.7", title: "Control of nonconforming outputs" },
  { clause: "9.1", title: "Monitoring, measurement, analysis and evaluation" },
  { clause: "9.2", title: "Internal audit" },
  { clause: "9.3", title: "Management review" },
  { clause: "10.1", title: "General - Improvement" },
  { clause: "10.2", title: "Nonconformity and corrective action" },
  { clause: "10.3", title: "Continual improvement" },
];


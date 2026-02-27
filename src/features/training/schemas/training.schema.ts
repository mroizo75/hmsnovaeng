import { z } from "zod";

/**
 * ISO 9001 - 7.2 Kompetanse
 * 
 * Organisasjonen skal:
 * a) Bestemme nødvendig kompetanse for personer som gjør arbeid som påvirker ytelse og effektivitet
 * b) Sikre at disse personene er kompetente basert på utdanning, opplæring eller erfaring
 * c) Der det er aktuelt, ta tiltak for å anskaffe nødvendig kompetanse og evaluere effektiviteten
 * d) Beholde aktuell dokumentert informasjon som bevis på kompetanse
 */

export const createTrainingSchema = z.object({
  tenantId: z.string().cuid(),
  userId: z.string().cuid(),
  courseKey: z.string().min(2, "Course ID must be at least 2 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  provider: z.string().min(2, "Provider must be at least 2 characters"),
  completedAt: z.date().optional(),
  validUntil: z.date().optional(), // For kurs med utløpsdato (f.eks. førstehjelpskurs)
  proofDocKey: z.string().optional(), // ISO 9001: Dokumentert bevis (sertifikat)
  isRequired: z.boolean().default(false), // Obligatorisk kurs for alle/visse roller
  effectiveness: z.string().optional(), // ISO 9001: Evaluering av effektivitet
});

export const updateTrainingSchema = z.object({
  id: z.string().cuid(),
  completedAt: z.date().optional(),
  validUntil: z.date().optional(),
  proofDocKey: z.string().optional(),
  effectiveness: z.string().optional(),
});

export const evaluateTrainingSchema = z.object({
  id: z.string().cuid(),
  effectiveness: z.string().min(20, "The evaluation must be at least 20 characters"),
  evaluatedBy: z.string().cuid(),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type EvaluateTrainingInput = z.infer<typeof evaluateTrainingSchema>;

/**
 * Get training status
 */
export function getTrainingStatus(training: {
  completedAt: Date | null;
  validUntil: Date | null;
}): "NOT_STARTED" | "COMPLETED" | "VALID" | "EXPIRING_SOON" | "EXPIRED" {
  if (!training.completedAt) {
    return "NOT_STARTED";
  }

  if (!training.validUntil) {
    return "COMPLETED";
  }

  const now = new Date();
  const validUntil = new Date(training.validUntil);
  const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return "EXPIRED";
  } else if (daysUntilExpiry <= 30) {
    return "EXPIRING_SOON";
  } else {
    return "VALID";
  }
}

/**
 * Get status label
 */
export function getTrainingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOT_STARTED: "Not Started",
    COMPLETED: "Completed",
    VALID: "Valid",
    EXPIRING_SOON: "Expiring Soon",
    EXPIRED: "Expired",
  };
  return labels[status] || status;
}

/**
 * Get status color
 */
export function getTrainingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOT_STARTED: "bg-gray-100 text-gray-800 border-gray-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
    VALID: "bg-green-100 text-green-800 border-green-300",
    EXPIRING_SOON: "bg-yellow-100 text-black border-yellow-300", // Sort tekst på gul
    EXPIRED: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Standard HMS kurs som bør være i systemet
 */
export const STANDARD_COURSES = [
  {
    key: "hms-intro",
    title: "H&S Introduction",
    description: "Basic H&S training for all employees",
    isRequired: true,
    validityYears: null,
  },
  {
    key: "working-at-height",
    title: "Working at Height",
    description: "Safe use of ladders, scaffolding, and fall protection",
    isRequired: false,
    validityYears: 3,
  },
  {
    key: "first-aid",
    title: "First Aid",
    description: "Basic first aid and CPR",
    isRequired: false,
    validityYears: 2,
  },
  {
    key: "fire-safety",
    title: "Fire Safety",
    description: "Fire prevention training and use of fire-fighting equipment",
    isRequired: true,
    validityYears: 1,
  },
  {
    key: "chemical-handling",
    title: "Chemical Handling",
    description: "Safe handling and storage of chemicals",
    isRequired: false,
    validityYears: 3,
  },
  {
    key: "forklift",
    title: "Forklift Operator Certificate",
    description: "Certified forklift operator training",
    isRequired: false,
    validityYears: 5,
  },
  {
    key: "hot-work",
    title: "Hot Work",
    description: "Certificate for hot work (welding, cutting)",
    isRequired: false,
    validityYears: 3,
  },
  {
    key: "confined-space",
    title: "Confined Space Work",
    description: "Safety when working in confined/enclosed spaces",
    isRequired: false,
    validityYears: 3,
  },
];


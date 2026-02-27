import { z } from "zod";

export const createToolboxTalkSchema = z.object({
  tenantId: z.string().cuid(),
  title: z.string().min(3),
  topic: z.string().min(3),
  content: z.string().min(20),
  conductedAt: z.date(),
  conductedBy: z.string().min(2),
  location: z.string().optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  attendees: z
    .array(
      z.object({
        userId: z.string().optional(),
        guestName: z.string().optional(),
      })
    )
    .optional(),
});

export const addAttendanceSchema = z.object({
  talkId: z.string().cuid(),
  userId: z.string().optional(),
  guestName: z.string().optional(),
  signature: z.string().optional(),
});

export const signAttendanceSchema = z.object({
  attendanceId: z.string().cuid(),
  signature: z.string().min(10),
});

export type CreateToolboxTalkInput = z.infer<typeof createToolboxTalkSchema>;
export type AddAttendanceInput = z.infer<typeof addAttendanceSchema>;
export type SignAttendanceInput = z.infer<typeof signAttendanceSchema>;

export const TOOLBOX_TALK_TOPICS = [
  "Fall Protection",
  "Hazard Communication (HazCom)",
  "Lockout / Tagout (LOTO)",
  "PPE Selection & Use",
  "Electrical Safety",
  "Fire Prevention & Emergency Evacuation",
  "Hand & Power Tool Safety",
  "Ladder Safety",
  "Struck-By Hazards",
  "Caught-In / Between Hazards",
  "Heat Illness Prevention",
  "Cold Stress & Weather Safety",
  "Hearing Conservation",
  "Eye & Face Protection",
  "Respirator Use",
  "Confined Space Awareness",
  "Ergonomics & Manual Handling",
  "Housekeeping & Slip/Trip/Fall Prevention",
  "Forklift & Material Handling Safety",
  "Near Miss Reporting",
  "Incident Reporting Procedures",
  "First Aid & Emergency Response",
  "Bloodborne Pathogens",
  "Chemical Safety & SDS",
  "Silica Dust Exposure",
  "Lead Safety",
  "Asbestos Awareness",
  "Driving Safety",
  "Distracted Work & Focus",
  "Drug & Alcohol Policy",
] as const;

export type ToolboxTalkTopic = (typeof TOOLBOX_TALK_TOPICS)[number];

/**
 * Sentralisert tilgangskontroll for HMS Nova 2.0
 * 
 * Dette definerer hva hver rolle kan gjøre i systemet
 */

import { Role } from "@prisma/client";

export interface RolePermissions {
  // Dashboard & Navigasjon
  canAccessDashboard: boolean;
  canViewAnalytics: boolean;
  
  // Dokumenter
  canReadDocuments: boolean;
  canCreateDocuments: boolean;
  canApproveDocuments: boolean;
  canDeleteDocuments: boolean;
  
  // Avvik & Hendelser
  canReadIncidents: boolean;
  canCreateIncidents: boolean;
  canInvestigateIncidents: boolean;
  canCloseIncidents: boolean;
  
  // Risikovurderinger
  canReadRisks: boolean;
  canCreateRisks: boolean;
  canApproveRisks: boolean;
  canDeleteRisks: boolean;
  
  // Tiltak/Actions
  canReadActions: boolean;
  canCreateActions: boolean;
  canUpdateActions: boolean;
  canDeleteActions: boolean;
  
  // Skjemaer
  canReadForms: boolean;
  canFillForms: boolean;
  canCreateForms: boolean;
  canManageForms: boolean;
  
  // Stoffkartotek
  canReadChemicals: boolean;
  canCreateChemicals: boolean;
  canUpdateChemicals: boolean;
  canDeleteChemicals: boolean;
  
  // Opplæring
  canReadOwnTraining: boolean;
  canReadAllTraining: boolean;
  canCreateTraining: boolean;
  canAssignTraining: boolean;
  canEvaluateTraining: boolean;
  
  // Revisjoner/Audits
  canReadAudits: boolean;
  canCreateAudits: boolean;
  canConductAudits: boolean;
  canCloseAudits: boolean;
  
  // Inspeksjoner/Vernerunde
  canReadInspections: boolean;
  canCreateInspections: boolean;
  canConductInspections: boolean;
  canCloseInspections: boolean;

  // Miljøstyring (ISO 14001)
  canReadEnvironment: boolean;
  canCreateEnvironment: boolean;
  canUpdateEnvironment: boolean;
  canRecordEnvironmentalMeasurements: boolean;

  // Informasjonssikkerhet (ISO 27001)
  canReadSecurity: boolean;
  canCreateSecurity: boolean;
  canUpdateSecurity: boolean;
  
  // Mål & KPIer
  canReadGoals: boolean;
  canCreateGoals: boolean;
  canUpdateGoals: boolean;
  canMeasureGoals: boolean;
  
  // Kundetilbakemelding
  canReadOwnFeedback: boolean;
  canReadAllFeedback: boolean;
  canCreateFeedback: boolean;
  canManageFeedback: boolean;
  
  // Ledelsens gjennomgang (Management Review)
  canReadManagementReviews: boolean;
  canCreateManagementReviews: boolean;
  canApproveManagementReviews: boolean;
  
  // AMU/VO Møter
  canReadMeetings: boolean;
  canCreateMeetings: boolean;
  canOrganizeMeetings: boolean;
  canViewAllMeetings: boolean;
  
  // Varsling (Whistleblowing)
  canSubmitWhistleblowing: boolean; // Alle kan sende inn
  canViewWhistleblowing: boolean; // Kun Admin/HMS
  canHandleWhistleblowing: boolean; // Kun Admin/HMS
  
  // Brukeradministrasjon (tenant)
  canReadUsers: boolean;
  canInviteUsers: boolean;
  canManageUsers: boolean;
  canDeleteUsers: boolean;
  
  // Innstillinger (tenant)
  canReadSettings: boolean;
  canUpdateSettings: boolean;
  
  // Rapporter & Eksport
  canExportReports: boolean;
  canViewAllReports: boolean;

  // Timeregistrering (prosjekter, timer, kjøring)
  canAccessTimeRegistration: boolean;

  // Juridisk register – lover og forskrifter per bransje (alle roller)
  canReadLegalRegister: boolean;
}

/**
 * Definer tilganger for hver rolle
 */
export const rolePermissions: Record<Role, RolePermissions> = {
  // ADMIN - Full tilgang til alt
  ADMIN: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: true,
    canApproveDocuments: true,
    canDeleteDocuments: true,
    canReadIncidents: true,
    canCreateIncidents: true,
    canInvestigateIncidents: true,
    canCloseIncidents: true,
    canReadRisks: true,
    canCreateRisks: true,
    canApproveRisks: true,
    canDeleteRisks: true,
    canReadActions: true,
    canCreateActions: true,
    canUpdateActions: true,
    canDeleteActions: true,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: true,
    canManageForms: true,
    canReadChemicals: true,
    canCreateChemicals: true,
    canUpdateChemicals: true,
    canDeleteChemicals: true,
    canReadOwnTraining: true,
    canReadAllTraining: true,
    canCreateTraining: true,
    canAssignTraining: true,
    canEvaluateTraining: true,
    canReadAudits: true,
    canCreateAudits: true,
    canConductAudits: true,
    canCloseAudits: true,
    canReadInspections: true,
    canCreateInspections: true,
    canConductInspections: true,
    canCloseInspections: true,
    canReadGoals: true,
    canCreateGoals: true,
    canUpdateGoals: true,
    canMeasureGoals: true,
    canReadOwnFeedback: true,
    canReadAllFeedback: true,
    canCreateFeedback: true,
    canManageFeedback: true,
    canReadEnvironment: true,
    canCreateEnvironment: true,
    canUpdateEnvironment: true,
    canRecordEnvironmentalMeasurements: true,
    canReadSecurity: true,
    canCreateSecurity: true,
    canUpdateSecurity: true,
    canReadManagementReviews: true,
    canCreateManagementReviews: true,
    canApproveManagementReviews: true,
    canReadMeetings: true,
    canCreateMeetings: true,
    canOrganizeMeetings: true,
    canViewAllMeetings: true,
    canSubmitWhistleblowing: true,
    canViewWhistleblowing: true,
    canHandleWhistleblowing: true,
    canReadUsers: true,
    canInviteUsers: true,
    canManageUsers: true,
    canDeleteUsers: true,
    canReadSettings: true,
    canUpdateSettings: true,
    canExportReports: true,
    canViewAllReports: true,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // HMS - HMS-ansvarlig, nesten full tilgang
  HMS: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: true,
    canApproveDocuments: true,
    canDeleteDocuments: false, // Kan ikke slette
    canReadIncidents: true,
    canCreateIncidents: true,
    canInvestigateIncidents: true,
    canCloseIncidents: true,
    canReadRisks: true,
    canCreateRisks: true,
    canApproveRisks: true,
    canDeleteRisks: false,
    canReadActions: true,
    canCreateActions: true,
    canUpdateActions: true,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: true,
    canManageForms: true,
    canReadChemicals: true,
    canCreateChemicals: true,
    canUpdateChemicals: true,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: true,
    canCreateTraining: true,
    canAssignTraining: true,
    canEvaluateTraining: true,
    canReadAudits: true,
    canCreateAudits: true,
    canConductAudits: true,
    canCloseAudits: true,
    canReadInspections: true,
    canCreateInspections: true,
    canConductInspections: true,
    canCloseInspections: true,
    canReadGoals: true,
    canCreateGoals: true,
    canUpdateGoals: true,
    canMeasureGoals: true,
    canReadOwnFeedback: true,
    canReadAllFeedback: true,
    canCreateFeedback: true,
    canManageFeedback: true,
    canReadEnvironment: true,
    canCreateEnvironment: true,
    canUpdateEnvironment: true,
    canRecordEnvironmentalMeasurements: true,
    canReadSecurity: true,
    canCreateSecurity: true,
    canUpdateSecurity: true,
    canReadManagementReviews: true,
    canCreateManagementReviews: true,
    canApproveManagementReviews: false, // Kun Admin
    canReadMeetings: true,
    canCreateMeetings: true,
    canOrganizeMeetings: true,
    canViewAllMeetings: true,
    canSubmitWhistleblowing: true,
    canViewWhistleblowing: true,
    canHandleWhistleblowing: true,
    canReadUsers: true,
    canInviteUsers: true,
    canManageUsers: true,
    canDeleteUsers: false,
    canReadSettings: true,
    canUpdateSettings: false,
    canExportReports: true,
    canViewAllReports: true,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // LEDER - Leder, kan administrere i sin avdeling
  LEDER: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: true,
    canApproveDocuments: false,
    canDeleteDocuments: false,
    canReadIncidents: true,
    canCreateIncidents: true,
    canInvestigateIncidents: true,
    canCloseIncidents: true,
    canReadRisks: true,
    canCreateRisks: true,
    canApproveRisks: false,
    canDeleteRisks: true,
    canReadActions: true,
    canCreateActions: true,
    canUpdateActions: true,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: true,
    canManageForms: true,
    canReadChemicals: true,
    canCreateChemicals: true,
    canUpdateChemicals: true,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: true,
    canCreateTraining: false,
    canAssignTraining: true,
    canEvaluateTraining: false,
    canReadAudits: true,
    canCreateAudits: false,
    canConductAudits: false,
    canCloseAudits: false,
    canReadInspections: true,
    canCreateInspections: true,
    canConductInspections: true,
    canCloseInspections: false,
    canReadGoals: true,
    canCreateGoals: true,
    canUpdateGoals: true,
    canMeasureGoals: true,
    canReadOwnFeedback: true,
    canReadAllFeedback: true,
    canCreateFeedback: true,
    canManageFeedback: true,
    canReadEnvironment: true,
    canCreateEnvironment: true,
    canUpdateEnvironment: true,
    canRecordEnvironmentalMeasurements: true,
    canReadSecurity: true,
    canCreateSecurity: false,
    canUpdateSecurity: false,
    canReadManagementReviews: true,
    canCreateManagementReviews: false,
    canApproveManagementReviews: false,
    canReadMeetings: true,
    canCreateMeetings: true,
    canOrganizeMeetings: true,
    canViewAllMeetings: false, // Kun egne møter
    canSubmitWhistleblowing: true,
    canViewWhistleblowing: false,
    canHandleWhistleblowing: false,
    canReadUsers: true,
    canInviteUsers: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canReadSettings: true,
    canUpdateSettings: false,
    canExportReports: true,
    canViewAllReports: true,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // VERNEOMBUD - Verneombud, fokus på HMS
  VERNEOMBUD: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: false,
    canApproveDocuments: false,
    canDeleteDocuments: false,
    canReadIncidents: true,
    canCreateIncidents: true,
    canInvestigateIncidents: false,
    canCloseIncidents: false,
    canReadRisks: true,
    canCreateRisks: true,
    canApproveRisks: false,
    canDeleteRisks: false,
    canReadActions: true,
    canCreateActions: true,
    canUpdateActions: false,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: false,
    canManageForms: false,
    canReadChemicals: true,
    canCreateChemicals: false,
    canUpdateChemicals: false,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: false,
    canCreateTraining: false,
    canAssignTraining: false,
    canEvaluateTraining: false,
    canReadAudits: true,
    canCreateAudits: false,
    canConductAudits: false,
    canCloseAudits: false,
    canReadInspections: true,
    canCreateInspections: true,
    canConductInspections: true,
    canCloseInspections: false,
    canReadGoals: true,
    canCreateGoals: false,
    canUpdateGoals: false,
    canMeasureGoals: false,
    canReadOwnFeedback: true,
    canReadAllFeedback: false,
    canCreateFeedback: true,
    canManageFeedback: false,
    canReadEnvironment: true,
    canCreateEnvironment: true,
    canUpdateEnvironment: false,
    canRecordEnvironmentalMeasurements: true,
    canReadSecurity: false,
    canCreateSecurity: false,
    canUpdateSecurity: false,
    canReadManagementReviews: false,
    canCreateManagementReviews: false,
    canApproveManagementReviews: false,
    canReadMeetings: true,
    canCreateMeetings: false,
    canOrganizeMeetings: false,
    canViewAllMeetings: false,
    canSubmitWhistleblowing: true,
    canViewWhistleblowing: false,
    canHandleWhistleblowing: false,
    canReadUsers: false,
    canInviteUsers: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canReadSettings: false,
    canUpdateSettings: false,
    canExportReports: false,
    canViewAllReports: false,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // ANSATT - Ansatt, begrenset tilgang
  ANSATT: {
    canAccessDashboard: true,
    canViewAnalytics: false,
    canReadDocuments: true,
    canCreateDocuments: false,
    canApproveDocuments: false,
    canDeleteDocuments: false,
    canReadIncidents: false, // Kun egne
    canCreateIncidents: true, // Kan rapportere avvik og kundeklager
    canInvestigateIncidents: false,
    canCloseIncidents: false,
    canReadRisks: false,
    canCreateRisks: false,
    canApproveRisks: false,
    canDeleteRisks: false,
    canReadActions: false, // Kun egne
    canCreateActions: false,
    canUpdateActions: false,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: false,
    canManageForms: false,
    canReadChemicals: true,
    canCreateChemicals: false,
    canUpdateChemicals: false,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: false,
    canCreateTraining: true, // Kan registrere egen kompetanse (krever godkjenning)
    canAssignTraining: false,
    canEvaluateTraining: false,
    canReadAudits: false,
    canCreateAudits: false,
    canConductAudits: false,
    canCloseAudits: false,
    canReadInspections: false,
    canCreateInspections: false,
    canConductInspections: false,
    canCloseInspections: false,
    canReadGoals: false,
    canCreateGoals: false,
    canUpdateGoals: false,
    canMeasureGoals: false,
    canReadOwnFeedback: true, // Kan se egen tilbakemelding
    canReadAllFeedback: false,
    canCreateFeedback: true, // Kan legge inn kundetilbakemelding/ros
    canManageFeedback: false,
    canReadEnvironment: false,
    canCreateEnvironment: false,
    canUpdateEnvironment: false,
    canRecordEnvironmentalMeasurements: false,
    canReadSecurity: false,
    canCreateSecurity: false,
    canUpdateSecurity: false,
    canReadManagementReviews: false,
    canCreateManagementReviews: false,
    canApproveManagementReviews: false,
    canReadMeetings: false,
    canCreateMeetings: false,
    canOrganizeMeetings: false,
    canViewAllMeetings: false,
    canSubmitWhistleblowing: true, // Alle ansatte kan varsle
    canViewWhistleblowing: false,
    canHandleWhistleblowing: false,
    canReadUsers: false,
    canInviteUsers: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canReadSettings: false,
    canUpdateSettings: false,
    canExportReports: false,
    canViewAllReports: false,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // BHT - Bedriftshelsetjeneste, lesetilgang + rapportering
  BHT: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: false,
    canApproveDocuments: false,
    canDeleteDocuments: false,
    canReadIncidents: true,
    canCreateIncidents: true,
    canInvestigateIncidents: false,
    canCloseIncidents: false,
    canReadRisks: true,
    canCreateRisks: true,
    canApproveRisks: false,
    canDeleteRisks: false,
    canReadActions: true,
    canCreateActions: false,
    canUpdateActions: false,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: true,
    canCreateForms: false,
    canManageForms: false,
    canReadChemicals: true,
    canCreateChemicals: false,
    canUpdateChemicals: false,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: true,
    canCreateTraining: false,
    canAssignTraining: false,
    canEvaluateTraining: false,
    canReadAudits: true,
    canCreateAudits: false,
    canConductAudits: false,
    canCloseAudits: false,
    canReadInspections: true,
    canCreateInspections: false,
    canConductInspections: false,
    canCloseInspections: false,
    canReadGoals: true,
    canCreateGoals: false,
    canUpdateGoals: false,
    canMeasureGoals: false,
    canReadOwnFeedback: true,
    canReadAllFeedback: true,
    canCreateFeedback: true,
    canManageFeedback: false,
    canReadEnvironment: true,
    canCreateEnvironment: false,
    canUpdateEnvironment: false,
    canRecordEnvironmentalMeasurements: true,
    canReadSecurity: true,
    canCreateSecurity: false,
    canUpdateSecurity: false,
    canReadManagementReviews: true,
    canCreateManagementReviews: false,
    canApproveManagementReviews: false,
    canReadMeetings: true,
    canCreateMeetings: false,
    canOrganizeMeetings: false,
    canViewAllMeetings: true,
    canSubmitWhistleblowing: true,
    canViewWhistleblowing: false,
    canHandleWhistleblowing: false,
    canReadUsers: false,
    canInviteUsers: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canReadSettings: false,
    canUpdateSettings: false,
    canExportReports: true,
    canViewAllReports: true,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },

  // REVISOR - Revisor, kun lesetilgang
  REVISOR: {
    canAccessDashboard: true,
    canViewAnalytics: true,
    canReadDocuments: true,
    canCreateDocuments: false,
    canApproveDocuments: false,
    canDeleteDocuments: false,
    canReadIncidents: true,
    canCreateIncidents: false,
    canInvestigateIncidents: false,
    canCloseIncidents: false,
    canReadRisks: true,
    canCreateRisks: false,
    canApproveRisks: false,
    canDeleteRisks: false,
    canReadActions: true,
    canCreateActions: false,
    canUpdateActions: false,
    canDeleteActions: false,
    canReadForms: true,
    canFillForms: false,
    canCreateForms: false,
    canManageForms: false,
    canReadChemicals: true,
    canCreateChemicals: false,
    canUpdateChemicals: false,
    canDeleteChemicals: false,
    canReadOwnTraining: true,
    canReadAllTraining: true,
    canCreateTraining: false,
    canAssignTraining: false,
    canEvaluateTraining: false,
    canReadAudits: true,
    canCreateAudits: false,
    canConductAudits: false,
    canCloseAudits: false,
    canReadInspections: true,
    canCreateInspections: false,
    canConductInspections: false,
    canCloseInspections: false,
    canReadGoals: true,
    canCreateGoals: false,
    canUpdateGoals: false,
    canMeasureGoals: false,
    canReadOwnFeedback: true,
    canReadAllFeedback: true,
    canCreateFeedback: false,
    canManageFeedback: false,
    canReadEnvironment: true,
    canCreateEnvironment: false,
    canUpdateEnvironment: false,
    canRecordEnvironmentalMeasurements: false,
    canReadSecurity: true,
    canCreateSecurity: false,
    canUpdateSecurity: false,
    canReadManagementReviews: true,
    canCreateManagementReviews: false,
    canApproveManagementReviews: false,
    canReadMeetings: true,
    canCreateMeetings: false,
    canOrganizeMeetings: false,
    canViewAllMeetings: true,
    canSubmitWhistleblowing: false,
    canViewWhistleblowing: false,
    canHandleWhistleblowing: false,
    canReadUsers: true,
    canInviteUsers: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canReadSettings: true,
    canUpdateSettings: false,
    canExportReports: true,
    canViewAllReports: true,
    canAccessTimeRegistration: true,
    canReadLegalRegister: true,
  },
};

/**
 * Hent tilganger for en rolle
 */
export function getPermissions(role: Role): RolePermissions {
  return rolePermissions[role];
}

/**
 * Sjekk om en rolle har en spesifikk tilgang
 */
export function hasPermission(
  role: Role,
  permission: keyof RolePermissions
): boolean {
  return rolePermissions[role][permission];
}

/**
 * Hent synlig navigasjon for en rolle
 */
export function getVisibleNavItems(role: Role) {
  const perms = getPermissions(role);

  return {
    dashboard: perms.canAccessDashboard,
    documents: perms.canReadDocuments,
    forms: perms.canReadForms,
    risks: perms.canReadRisks,
    riskRegister: perms.canReadRisks,
    incidents: perms.canReadIncidents || perms.canCreateIncidents,
    inspections: perms.canReadInspections,
    chemicals: perms.canReadChemicals,
    training: perms.canReadOwnTraining || perms.canReadAllTraining,
    audits: perms.canReadAudits,
    managementReviews: perms.canReadManagementReviews,
    annualHmsPlan: perms.canReadManagementReviews,
    meetings: perms.canReadMeetings,
    whistleblowing: perms.canViewWhistleblowing || perms.canSubmitWhistleblowing,
    actions: perms.canReadActions,
    goals: perms.canReadGoals,
    environment: perms.canReadEnvironment,
    security: perms.canReadSecurity,
    feedback: perms.canReadOwnFeedback || perms.canReadAllFeedback || perms.canCreateFeedback,
    complaints: perms.canCreateIncidents,
    settings: perms.canReadSettings,
    timeRegistration: perms.canAccessTimeRegistration,
    legalRegister: perms.canReadLegalRegister,
  };
}

/**
 * Hent rolle-navn på norsk
 */
export function getRoleDisplayName(role: Role): string {
  const roleNames: Record<Role, string> = {
    ADMIN: "Administrator",
    HMS: "H&S Manager",
    LEDER: "Manager",
    VERNEOMBUD: "Safety Representative",
    ANSATT: "Employee",
    BHT: "Occupational Health Service",
    REVISOR: "Auditor",
  };
  return roleNames[role];
}

/**
 * Hent rolle-beskrivelse
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    ADMIN: "Full access to all features in the organization",
    HMS: "Manages the H&S system with full access to all H&S-related features",
    LEDER: "Can manage their department and handle H&S tasks",
    VERNEOMBUD: "Can report incidents, risk assessments, and participate in H&S work",
    ANSATT: "Can report incidents, fill out forms, and read documents",
    BHT: "Read access to everything and can report incidents and risk assessments",
    REVISOR: "Read-only access to all H&S data for audit purposes",
  };
  return descriptions[role];
}


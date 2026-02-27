-- USA EHS Phase 1: OSHA Compliance, PPE, Emergency Action Plan, Toolbox Talks
-- Adds market support to Tenant, OSHA fields to Incident/Chemical/Training,
-- and creates new USA-specific compliance models.

-- ============================================
-- Enums (MySQL ENUM modifications)
-- ============================================

-- AlterTable: Tenant — add USA market fields
ALTER TABLE `Tenant`
  ADD COLUMN `market` ENUM('NO', 'US') NOT NULL DEFAULT 'NO',
  ADD COLUMN `usState` VARCHAR(191) NULL,
  ADD COLUMN `naicsCode` VARCHAR(191) NULL,
  ADD COLUMN `osha300Enabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `totalHoursWorkedYtd` DOUBLE NULL,
  ADD COLUMN `avgEmployeeCount` DOUBLE NULL;

CREATE INDEX `Tenant_market_idx` ON `Tenant`(`market`);

-- AlterTable: Incident — add OSHA recordkeeping fields
ALTER TABLE `Incident`
  ADD COLUMN `oshaRecordable` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `oshaClassification` ENUM('FATALITY', 'DAYS_AWAY', 'RESTRICTED_WORK', 'JOB_TRANSFER', 'OTHER_RECORDABLE', 'FIRST_AID_ONLY') NULL,
  ADD COLUMN `daysAwayFromWork` INTEGER NULL,
  ADD COLUMN `daysOnRestriction` INTEGER NULL,
  ADD COLUMN `daysOnTransfer` INTEGER NULL,
  ADD COLUMN `bodyPartAffected` VARCHAR(191) NULL,
  ADD COLUMN `natureOfInjury` VARCHAR(191) NULL,
  ADD COLUMN `eventType` ENUM('INJURY', 'ILLNESS') NULL,
  ADD COLUMN `illnessType` ENUM('SKIN_DISORDER', 'RESPIRATORY_CONDITION', 'POISONING', 'HEARING_LOSS', 'ALL_OTHER_ILLNESSES') NULL,
  ADD COLUMN `privacyCaseFlag` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `osha300LogYear` INTEGER NULL,
  ADD COLUMN `osha301CompletedAt` DATETIME(3) NULL;

CREATE INDEX `Incident_oshaRecordable_idx` ON `Incident`(`oshaRecordable`);
CREATE INDEX `Incident_osha300LogYear_idx` ON `Incident`(`osha300LogYear`);

-- AlterTable: Chemical — add HazCom 2012 fields
ALTER TABLE `Chemical`
  ADD COLUMN `ghsSignalWord` ENUM('DANGER', 'WARNING') NULL,
  ADD COLUMN `sdsAccessLocation` VARCHAR(191) NULL,
  ADD COLUMN `employeeExposureDocumented` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `hazcomTrainingRequired` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Training — add OSHA training fields
ALTER TABLE `Training`
  ADD COLUMN `certificationBody` VARCHAR(191) NULL,
  ADD COLUMN `oshaStandard` VARCHAR(191) NULL,
  ADD COLUMN `instructorName` VARCHAR(191) NULL,
  ADD COLUMN `instructorCredential` VARCHAR(191) NULL,
  ADD COLUMN `digitalSignature` TEXT NULL;

-- ============================================
-- CreateTable: OshaLog
-- ============================================
CREATE TABLE `OshaLog` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `totalHoursWorked` DOUBLE NOT NULL,
    `avgEmployeeCount` DOUBLE NOT NULL,
    `totalDeaths` INTEGER NOT NULL DEFAULT 0,
    `totalDaysAway` INTEGER NOT NULL DEFAULT 0,
    `totalRestricted` INTEGER NOT NULL DEFAULT 0,
    `totalTransfer` INTEGER NOT NULL DEFAULT 0,
    `totalOtherRecordable` INTEGER NOT NULL DEFAULT 0,
    `totalInjuries` INTEGER NOT NULL DEFAULT 0,
    `totalSkinDisorders` INTEGER NOT NULL DEFAULT 0,
    `totalRespiratoryConditions` INTEGER NOT NULL DEFAULT 0,
    `totalPoisonings` INTEGER NOT NULL DEFAULT 0,
    `totalHearingLoss` INTEGER NOT NULL DEFAULT 0,
    `totalOtherIllnesses` INTEGER NOT NULL DEFAULT 0,
    `trir` DOUBLE NULL,
    `dartRate` DOUBLE NULL,
    `ltir` DOUBLE NULL,
    `severityRate` DOUBLE NULL,
    `postedAt` DATETIME(3) NULL,
    `postedBy` VARCHAR(191) NULL,
    `certifiedAt` DATETIME(3) NULL,
    `certifiedBy` VARCHAR(191) NULL,
    `certifiedTitle` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OshaLog_tenantId_year_key`(`tenantId`, `year`),
    INDEX `OshaLog_tenantId_idx`(`tenantId`),
    INDEX `OshaLog_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: PpeAssessment
-- ============================================
CREATE TABLE `PpeAssessment` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `workArea` VARCHAR(191) NOT NULL,
    `jobTitle` VARCHAR(191) NULL,
    `hazardsFound` JSON NOT NULL,
    `ppeRequired` JSON NOT NULL,
    `assessedBy` VARCHAR(191) NOT NULL,
    `assessedAt` DATETIME(3) NOT NULL,
    `reviewDue` DATETIME(3) NULL,
    `signature` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PpeAssessment_tenantId_idx`(`tenantId`),
    INDEX `PpeAssessment_assessedAt_idx`(`assessedAt`),
    INDEX `PpeAssessment_reviewDue_idx`(`reviewDue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: PpeAssignment
-- ============================================
CREATE TABLE `PpeAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ppeType` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `issuedDate` DATETIME(3) NOT NULL,
    `issuedBy` VARCHAR(191) NOT NULL,
    `lastInspected` DATETIME(3) NULL,
    `inspectedBy` VARCHAR(191) NULL,
    `condition` ENUM('GOOD', 'NEEDS_SERVICE', 'REMOVED_FROM_SERVICE') NOT NULL DEFAULT 'GOOD',
    `removedDate` DATETIME(3) NULL,
    `removedReason` VARCHAR(191) NULL,
    `signedAt` DATETIME(3) NULL,
    `signature` TEXT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PpeAssignment_tenantId_idx`(`tenantId`),
    INDEX `PpeAssignment_userId_idx`(`userId`),
    INDEX `PpeAssignment_assessmentId_idx`(`assessmentId`),
    INDEX `PpeAssignment_condition_idx`(`condition`),
    INDEX `PpeAssignment_lastInspected_idx`(`lastInspected`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: EmergencyActionPlan
-- ============================================
CREATE TABLE `EmergencyActionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `locationName` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `alarmSystem` VARCHAR(191) NULL,
    `evacuationRoutes` JSON NOT NULL,
    `assemblyPoints` JSON NOT NULL,
    `emergencyContacts` JSON NOT NULL,
    `roles` JSON NOT NULL,
    `equipment` JSON NOT NULL,
    `medicalFacility` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmergencyActionPlan_tenantId_idx`(`tenantId`),
    INDEX `EmergencyActionPlan_effectiveDate_idx`(`effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: EmergencyDrill
-- ============================================
CREATE TABLE `EmergencyDrill` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `drillType` VARCHAR(191) NOT NULL,
    `conductedAt` DATETIME(3) NOT NULL,
    `durationMin` INTEGER NULL,
    `participantCount` INTEGER NULL,
    `conductedBy` VARCHAR(191) NOT NULL,
    `findings` TEXT NULL,
    `correctiveActions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmergencyDrill_planId_idx`(`planId`),
    INDEX `EmergencyDrill_conductedAt_idx`(`conductedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: ToolboxTalk
-- ============================================
CREATE TABLE `ToolboxTalk` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `conductedAt` DATETIME(3) NOT NULL,
    `conductedBy` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ToolboxTalk_tenantId_idx`(`tenantId`),
    INDEX `ToolboxTalk_conductedAt_idx`(`conductedAt`),
    INDEX `ToolboxTalk_conductedBy_idx`(`conductedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: ToolboxAttendance
-- ============================================
CREATE TABLE `ToolboxAttendance` (
    `id` VARCHAR(191) NOT NULL,
    `talkId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `guestName` VARCHAR(191) NULL,
    `signedAt` DATETIME(3) NULL,
    `signature` TEXT NULL,

    INDEX `ToolboxAttendance_talkId_idx`(`talkId`),
    INDEX `ToolboxAttendance_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- AddForeignKey constraints
-- ============================================

ALTER TABLE `OshaLog`
  ADD CONSTRAINT `OshaLog_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PpeAssessment`
  ADD CONSTRAINT `PpeAssessment_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PpeAssignment`
  ADD CONSTRAINT `PpeAssignment_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PpeAssignment_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `PpeAssessment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `EmergencyActionPlan`
  ADD CONSTRAINT `EmergencyActionPlan_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmergencyDrill`
  ADD CONSTRAINT `EmergencyDrill_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `EmergencyActionPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ToolboxTalk`
  ADD CONSTRAINT `ToolboxTalk_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ToolboxAttendance`
  ADD CONSTRAINT `ToolboxAttendance_talkId_fkey` FOREIGN KEY (`talkId`) REFERENCES `ToolboxTalk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

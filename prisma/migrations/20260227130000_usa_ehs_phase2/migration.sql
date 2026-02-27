-- USA EHS Phase 2: LOTO, Fall Protection, Competent Person, Confined Space,
-- Bloodborne Pathogen Program, Workers' Compensation tracking.

-- ============================================
-- Tenant: add Phase 2 relations (no schema columns, only FK side is on child tables)
-- ============================================

-- ============================================
-- CreateTable: LotoProgram
-- ============================================
CREATE TABLE `LotoProgram` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `programName` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `scope` TEXT NOT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedTitle` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LotoProgram_tenantId_idx`(`tenantId`),
    INDEX `LotoProgram_effectiveDate_idx`(`effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: LotoProcedure
-- ============================================
CREATE TABLE `LotoProcedure` (
    `id` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `equipmentName` VARCHAR(191) NOT NULL,
    `equipmentId` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `energySources` JSON NOT NULL,
    `steps` JSON NOT NULL,
    `authorizedUsers` JSON NOT NULL,
    `annualReviewAt` DATETIME(3) NULL,
    `annualReviewedBy` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LotoProcedure_programId_idx`(`programId`),
    INDEX `LotoProcedure_equipmentName_idx`(`equipmentName`),
    INDEX `LotoProcedure_annualReviewAt_idx`(`annualReviewAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: FallProtectionProgram
-- ============================================
CREATE TABLE `FallProtectionProgram` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `hazards` JSON NOT NULL,
    `controls` JSON NOT NULL,
    `rescuePlan` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FallProtectionProgram_tenantId_idx`(`tenantId`),
    INDEX `FallProtectionProgram_effectiveDate_idx`(`effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: FallEquipmentLog
-- ============================================
CREATE TABLE `FallEquipmentLog` (
    `id` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `equipmentType` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `lastInspected` DATETIME(3) NOT NULL,
    `inspectedBy` VARCHAR(191) NOT NULL,
    `condition` ENUM('GOOD', 'NEEDS_SERVICE', 'REMOVED_FROM_SERVICE') NOT NULL DEFAULT 'GOOD',
    `removalDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FallEquipmentLog_programId_idx`(`programId`),
    INDEX `FallEquipmentLog_lastInspected_idx`(`lastInspected`),
    INDEX `FallEquipmentLog_condition_idx`(`condition`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: CompetentPerson
-- ============================================
CREATE TABLE `CompetentPerson` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `oshaStandard` VARCHAR(191) NOT NULL,
    `qualifications` JSON NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `designatedBy` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CompetentPerson_tenantId_idx`(`tenantId`),
    INDEX `CompetentPerson_userId_idx`(`userId`),
    INDEX `CompetentPerson_isActive_idx`(`isActive`),
    INDEX `CompetentPerson_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: ConfinedSpace
-- ============================================
CREATE TABLE `ConfinedSpace` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `spaceName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `permitRequired` BOOLEAN NOT NULL DEFAULT true,
    `hazards` JSON NOT NULL,
    `dimensions` VARCHAR(191) NULL,
    `entryPoints` VARCHAR(191) NULL,
    `lastEvaluated` DATETIME(3) NULL,
    `evaluatedBy` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ConfinedSpace_tenantId_idx`(`tenantId`),
    INDEX `ConfinedSpace_permitRequired_idx`(`permitRequired`),
    INDEX `ConfinedSpace_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: ConfinedSpacePermit
-- ============================================
CREATE TABLE `ConfinedSpacePermit` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `permitNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `issuedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `closedAt` DATETIME(3) NULL,
    `cancelledReason` VARCHAR(191) NULL,
    `authorizedEntrants` JSON NOT NULL,
    `attendants` JSON NOT NULL,
    `supervisors` JSON NOT NULL,
    `hazardsIdentified` JSON NOT NULL,
    `atmosphericTests` JSON NOT NULL,
    `equipmentRequired` JSON NOT NULL,
    `rescueProcedures` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ConfinedSpacePermit_spaceId_idx`(`spaceId`),
    INDEX `ConfinedSpacePermit_status_idx`(`status`),
    INDEX `ConfinedSpacePermit_issuedAt_idx`(`issuedAt`),
    INDEX `ConfinedSpacePermit_permitNumber_idx`(`permitNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: BloodbornePathogenProgram
-- ============================================
CREATE TABLE `BloodbornePathogenProgram` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `exposedPositions` JSON NOT NULL,
    `engineeringControls` JSON NOT NULL,
    `workPracticeControls` JSON NOT NULL,
    `ppe` JSON NOT NULL,
    `decontaminationPlan` TEXT NULL,
    `wasteDisposalPlan` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BloodbornePathogenProgram_tenantId_idx`(`tenantId`),
    INDEX `BloodbornePathogenProgram_effectiveDate_idx`(`effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: BbpVaccinationRecord
-- ============================================
CREATE TABLE `BbpVaccinationRecord` (
    `id` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('OFFERED', 'ACCEPTED', 'DECLINED', 'COMPLETED') NOT NULL,
    `offeredAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BbpVaccinationRecord_programId_idx`(`programId`),
    INDEX `BbpVaccinationRecord_userId_idx`(`userId`),
    INDEX `BbpVaccinationRecord_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: WorkersCompClaim
-- ============================================
CREATE TABLE `WorkersCompClaim` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `incidentId` VARCHAR(191) NULL,
    `claimNumber` VARCHAR(191) NOT NULL,
    `carrierName` VARCHAR(191) NOT NULL,
    `claimantName` VARCHAR(191) NOT NULL,
    `injuryDate` DATETIME(3) NOT NULL,
    `reportedDate` DATETIME(3) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'DISPUTED', 'SETTLED') NOT NULL DEFAULT 'OPEN',
    `reserveAmount` DOUBLE NULL,
    `paidAmount` DOUBLE NULL,
    `lostWorkDays` INTEGER NULL,
    `returnToWorkDate` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `adjusterName` VARCHAR(191) NULL,
    `adjusterPhone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkersCompClaim_tenantId_idx`(`tenantId`),
    INDEX `WorkersCompClaim_status_idx`(`status`),
    INDEX `WorkersCompClaim_injuryDate_idx`(`injuryDate`),
    INDEX `WorkersCompClaim_claimNumber_idx`(`claimNumber`),
    INDEX `WorkersCompClaim_incidentId_idx`(`incidentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- CreateTable: EmrHistory
-- ============================================
CREATE TABLE `EmrHistory` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `emrValue` DOUBLE NOT NULL,
    `carrier` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmrHistory_tenantId_year_key`(`tenantId`, `year`),
    INDEX `EmrHistory_tenantId_idx`(`tenantId`),
    INDEX `EmrHistory_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- AddForeignKey constraints
-- ============================================

ALTER TABLE `LotoProgram`
  ADD CONSTRAINT `LotoProgram_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `LotoProcedure`
  ADD CONSTRAINT `LotoProcedure_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `LotoProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FallProtectionProgram`
  ADD CONSTRAINT `FallProtectionProgram_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FallEquipmentLog`
  ADD CONSTRAINT `FallEquipmentLog_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `FallProtectionProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CompetentPerson`
  ADD CONSTRAINT `CompetentPerson_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ConfinedSpace`
  ADD CONSTRAINT `ConfinedSpace_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ConfinedSpacePermit`
  ADD CONSTRAINT `ConfinedSpacePermit_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `ConfinedSpace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BloodbornePathogenProgram`
  ADD CONSTRAINT `BloodbornePathogenProgram_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BbpVaccinationRecord`
  ADD CONSTRAINT `BbpVaccinationRecord_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `BloodbornePathogenProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `WorkersCompClaim`
  ADD CONSTRAINT `WorkersCompClaim_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmrHistory`
  ADD CONSTRAINT `EmrHistory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

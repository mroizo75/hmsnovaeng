-- Phase 3: Enterprise & Industry — DOT Compliance, Industrial Hygiene, Insurance

-- Enums
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `dotEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `ihEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `dotCarrierNumber` VARCHAR(191) NULL;

-- DOT Driver (49 CFR 391)
CREATE TABLE IF NOT EXISTS `DotDriver` (
  `id`                  VARCHAR(191) NOT NULL,
  `tenantId`            VARCHAR(191) NOT NULL,
  `employeeName`        VARCHAR(191) NOT NULL,
  `employeeId`          VARCHAR(191) NULL,
  `cdlNumber`           VARCHAR(191) NULL,
  `cdlClass`            VARCHAR(10)  NULL,
  `cdlState`            VARCHAR(10)  NULL,
  `cdlExpires`          DATETIME(3)  NULL,
  `medicalCertExpires`  DATETIME(3)  NULL,
  `hireDate`            DATETIME(3)  NULL,
  `terminatedAt`        DATETIME(3)  NULL,
  `isActive`            BOOLEAN      NOT NULL DEFAULT true,
  `drugTestingEnrolled` BOOLEAN      NOT NULL DEFAULT true,
  `hazmatEndorsement`   BOOLEAN      NOT NULL DEFAULT false,
  `notes`               LONGTEXT     NULL,
  `createdAt`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`           DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `DotDriver_tenantId_idx` (`tenantId`),
  INDEX `DotDriver_cdlExpires_idx` (`cdlExpires`),
  INDEX `DotDriver_medicalCertExpires_idx` (`medicalCertExpires`),
  INDEX `DotDriver_isActive_idx` (`isActive`),
  CONSTRAINT `DotDriver_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DOT Vehicle Inspection (49 CFR 396)
CREATE TABLE IF NOT EXISTS `DotVehicleInspection` (
  `id`          VARCHAR(191) NOT NULL,
  `tenantId`    VARCHAR(191) NOT NULL,
  `vehicleUnit` VARCHAR(191) NOT NULL,
  `vin`         VARCHAR(191) NULL,
  `inspType`    ENUM('PRE_TRIP','POST_TRIP','ANNUAL','ROADSIDE','MAINTENANCE') NOT NULL,
  `inspectedAt` DATETIME(3)  NOT NULL,
  `inspectedBy` VARCHAR(191) NOT NULL,
  `passed`      BOOLEAN      NOT NULL,
  `defects`     JSON         NULL,
  `odometer`    INT          NULL,
  `nextDue`     DATETIME(3)  NULL,
  `notes`       LONGTEXT     NULL,
  `documentKey` VARCHAR(191) NULL,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `DotVehicleInspection_tenantId_idx` (`tenantId`),
  INDEX `DotVehicleInspection_vehicleUnit_idx` (`vehicleUnit`),
  INDEX `DotVehicleInspection_nextDue_idx` (`nextDue`),
  CONSTRAINT `DotVehicleInspection_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DOT Drug & Alcohol Test (49 CFR 382)
CREATE TABLE IF NOT EXISTS `DotDrugTest` (
  `id`              VARCHAR(191) NOT NULL,
  `tenantId`        VARCHAR(191) NOT NULL,
  `driverId`        VARCHAR(191) NOT NULL,
  `testType`        ENUM('PRE_EMPLOYMENT','RANDOM','POST_ACCIDENT','REASONABLE_SUSPICION','RETURN_TO_DUTY','FOLLOW_UP') NOT NULL,
  `testedAt`        DATETIME(3)  NOT NULL,
  `result`          ENUM('NEGATIVE','POSITIVE','REFUSED','CANCELLED','INVALID') NOT NULL,
  `substanceTested` VARCHAR(191) NULL,
  `specimenId`      VARCHAR(191) NULL,
  `mroName`         VARCHAR(191) NULL,
  `collectionSite`  VARCHAR(191) NULL,
  `notes`           LONGTEXT     NULL,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `DotDrugTest_tenantId_idx` (`tenantId`),
  INDEX `DotDrugTest_driverId_idx` (`driverId`),
  INDEX `DotDrugTest_testType_idx` (`testType`),
  INDEX `DotDrugTest_testedAt_idx` (`testedAt`),
  CONSTRAINT `DotDrugTest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DotDrugTest_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DotDriver`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DOT Violation
CREATE TABLE IF NOT EXISTS `DotViolation` (
  `id`              VARCHAR(191) NOT NULL,
  `tenantId`        VARCHAR(191) NOT NULL,
  `driverId`        VARCHAR(191) NULL,
  `vehicleUnit`     VARCHAR(191) NULL,
  `violationDate`   DATETIME(3)  NOT NULL,
  `violationType`   VARCHAR(191) NOT NULL,
  `regulationCited` VARCHAR(191) NULL,
  `severity`        VARCHAR(191) NULL,
  `fineAmount`      DECIMAL(10,2) NULL,
  `resolvedAt`      DATETIME(3)  NULL,
  `notes`           LONGTEXT     NULL,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `DotViolation_tenantId_idx` (`tenantId`),
  INDEX `DotViolation_driverId_idx` (`driverId`),
  CONSTRAINT `DotViolation_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Industrial Hygiene Monitoring Program
CREATE TABLE IF NOT EXISTS `IhMonitoringProgram` (
  `id`           VARCHAR(191) NOT NULL,
  `tenantId`     VARCHAR(191) NOT NULL,
  `programName`  VARCHAR(191) NOT NULL,
  `hazardType`   ENUM('CHEMICAL','NOISE','HEAT','RADIATION','BIOLOGICAL','ERGONOMIC','DUST','VIBRATION') NOT NULL,
  `agentName`    VARCHAR(191) NOT NULL,
  `oshaStandard` VARCHAR(191) NULL,
  `pel`          DOUBLE       NULL,
  `al`           DOUBLE       NULL,
  `stel`         DOUBLE       NULL,
  `unit`         VARCHAR(50)  NULL,
  `frequency`    VARCHAR(100) NULL,
  `isActive`     BOOLEAN      NOT NULL DEFAULT true,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `IhMonitoringProgram_tenantId_idx` (`tenantId`),
  INDEX `IhMonitoringProgram_hazardType_idx` (`hazardType`),
  CONSTRAINT `IhMonitoringProgram_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Industrial Hygiene Exposure Sample
CREATE TABLE IF NOT EXISTS `IhExposureSample` (
  `id`           VARCHAR(191) NOT NULL,
  `programId`    VARCHAR(191) NOT NULL,
  `sampledAt`    DATETIME(3)  NOT NULL,
  `sampledBy`    VARCHAR(191) NOT NULL,
  `employeeName` VARCHAR(191) NULL,
  `jobTitle`     VARCHAR(191) NULL,
  `workArea`     VARCHAR(191) NOT NULL,
  `sampleType`   VARCHAR(50)  NOT NULL,
  `result`       DOUBLE       NOT NULL,
  `exceedsPel`   BOOLEAN      NOT NULL DEFAULT false,
  `exceedsAl`    BOOLEAN      NOT NULL DEFAULT false,
  `labName`      VARCHAR(191) NULL,
  `labSampleId`  VARCHAR(191) NULL,
  `reportKey`    VARCHAR(191) NULL,
  `notes`        LONGTEXT     NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `IhExposureSample_programId_idx` (`programId`),
  INDEX `IhExposureSample_sampledAt_idx` (`sampledAt`),
  INDEX `IhExposureSample_exceedsPel_idx` (`exceedsPel`),
  CONSTRAINT `IhExposureSample_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `IhMonitoringProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insurance Policy
CREATE TABLE IF NOT EXISTS `InsurancePolicy` (
  `id`             VARCHAR(191) NOT NULL,
  `tenantId`       VARCHAR(191) NOT NULL,
  `carrier`        VARCHAR(191) NOT NULL,
  `policyNumber`   VARCHAR(191) NOT NULL,
  `policyType`     VARCHAR(100) NOT NULL,
  `effectiveDate`  DATETIME(3)  NOT NULL,
  `expirationDate` DATETIME(3)  NOT NULL,
  `premiumAmount`  DECIMAL(12,2) NULL,
  `deductible`     DECIMAL(12,2) NULL,
  `coverageLimit`  DECIMAL(15,2) NULL,
  `agentName`      VARCHAR(191) NULL,
  `agentPhone`     VARCHAR(50)  NULL,
  `agentEmail`     VARCHAR(191) NULL,
  `isActive`       BOOLEAN      NOT NULL DEFAULT true,
  `documentKey`    VARCHAR(191) NULL,
  `notes`          LONGTEXT     NULL,
  `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `InsurancePolicy_tenantId_idx` (`tenantId`),
  INDEX `InsurancePolicy_expirationDate_idx` (`expirationDate`),
  INDEX `InsurancePolicy_policyType_idx` (`policyType`),
  CONSTRAINT `InsurancePolicy_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

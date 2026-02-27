import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const shouldSeedPrivilegedUsers =
    process.env.NODE_ENV !== "production" || process.env.SEED_DEMO_PRIVILEGED_USERS === "true";

  if (shouldSeedPrivilegedUsers) {
    const superAdminPassword = await bcrypt.hash("superadmin123", 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: "superadmin@ehsnova.com" },
      update: {},
      create: {
        email: "superadmin@ehsnova.com",
        name: "Superadmin",
        password: superAdminPassword,
        isSuperAdmin: true,
        emailVerified: new Date(),
      },
    });

    console.log("✅ Superadmin created:", superAdmin.email);

    const supportPassword = await bcrypt.hash("support123", 10);

    const supportUser = await prisma.user.upsert({
      where: { email: "support@ehsnova.com" },
      update: {},
      create: {
        email: "support@ehsnova.com",
        name: "Support Team",
        password: supportPassword,
        isSupport: true,
        emailVerified: new Date(),
      },
    });

    console.log("✅ Support user created:", supportUser.email);
  } else {
    console.log(
      "⚠️  Skipping privileged user creation. Set SEED_DEMO_PRIVILEGED_USERS=true if needed."
    );
  }

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      name: "Apex Industrial Solutions Inc.",
      orgNumber: "47-1234567",
      slug: "demo-company",
      status: "ACTIVE",
      industry: "construction",
      contactEmail: "info@apexindustrial.com",
      contactPhone: "720-555-0192",
      address: "1500 Industrial Boulevard",
      city: "Denver",
      postalCode: "80211",
      subscription: {
        create: {
          plan: "PROFESSIONAL",
          price: 2900,
          billingInterval: "MONTHLY",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("✅ Tenant created:", tenant.name);

  // Legal references (US OSHA / EPA)
  const legalRefCount = await prisma.legalReference.count();
  if (legalRefCount === 0) {
    const baseLaws = [
      {
        title: "OSHA 29 CFR 1910 – General Industry Standards",
        paragraphRef: "29 CFR 1910",
        description:
          "OSHA's primary standard for general industry workplaces. Covers hazard communication, PPE, machine guarding, electrical safety, and emergency procedures.",
        sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910",
        industries: ["all"],
        sortOrder: 1,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA 29 CFR 1926 – Construction Industry Standards",
        paragraphRef: "29 CFR 1926",
        description:
          "OSHA standards specific to construction activities including scaffolding, fall protection, excavations, and crane safety.",
        sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926",
        industries: ["construction"],
        sortOrder: 2,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Hazard Communication Standard (HazCom 2012)",
        paragraphRef: "29 CFR 1910.1200",
        description:
          "Requires chemical manufacturers to label hazardous chemicals and provide Safety Data Sheets (SDS). Applies to all industries handling hazardous chemicals.",
        sourceUrl: "https://www.osha.gov/hazcom",
        industries: ["all"],
        sortOrder: 3,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Injury and Illness Recordkeeping (29 CFR 1904)",
        paragraphRef: "29 CFR 1904",
        description:
          "Requirements for recording and reporting occupational injuries and illnesses, including the OSHA 300 Log and 300A Summary.",
        sourceUrl: "https://www.osha.gov/recordkeeping",
        industries: ["all"],
        sortOrder: 4,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Fall Protection Standard",
        paragraphRef: "29 CFR 1910.28 / 1926.502",
        description:
          "Requirements for fall protection systems when working at heights of 4 feet (general industry) or 6 feet (construction) above lower levels.",
        sourceUrl: "https://www.osha.gov/fall-protection",
        industries: ["construction", "manufacturing"],
        sortOrder: 5,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Noise Exposure Standard",
        paragraphRef: "29 CFR 1910.95",
        description:
          "Permissible noise exposure limits, hearing conservation programs, audiometric testing, and hearing protection requirements.",
        sourceUrl: "https://www.osha.gov/noise",
        industries: ["construction", "manufacturing"],
        sortOrder: 6,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Lockout/Tagout (LOTO)",
        paragraphRef: "29 CFR 1910.147",
        description:
          "Control of hazardous energy during servicing and maintenance of machines and equipment to prevent unexpected energization.",
        sourceUrl: "https://www.osha.gov/control-hazardous-energy",
        industries: ["all"],
        sortOrder: 7,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Personal Protective Equipment",
        paragraphRef: "29 CFR 1910.132–138",
        description:
          "Requirements for employer-provided PPE including eye, face, head, foot, hand, and respiratory protection based on workplace hazard assessments.",
        sourceUrl: "https://www.osha.gov/personal-protective-equipment",
        industries: ["all"],
        sortOrder: 8,
        lastVerifiedAt: new Date(),
      },
      {
        title: "OSHA Emergency Action Plans",
        paragraphRef: "29 CFR 1910.38",
        description:
          "Requirements for written emergency action plans covering fire and other emergencies, evacuation procedures, and employee responsibilities.",
        sourceUrl: "https://www.osha.gov/emergency-preparedness",
        industries: ["all"],
        sortOrder: 9,
        lastVerifiedAt: new Date(),
      },
      {
        title: "EPA Emergency Planning and Community Right-to-Know Act (EPCRA)",
        paragraphRef: "40 CFR Part 355",
        description:
          "Reporting requirements for facilities that store or release hazardous chemicals above threshold quantities. Includes Tier I and Tier II reporting.",
        sourceUrl: "https://www.epa.gov/epcra",
        industries: ["all"],
        sortOrder: 10,
        lastVerifiedAt: new Date(),
      },
    ];
    await prisma.legalReference.createMany({ data: baseLaws });
    console.log("✅ Legal references created:", baseLaws.length, "records");
  } else {
    console.log("ℹ️  Legal references already exist — skipping");
  }

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "admin@demo.com",
      name: "Sarah Mitchell",
      password: hashedPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "ADMIN",
        },
      },
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // EHS Manager
  const ehsPassword = await bcrypt.hash("ehs123", 10);

  const ehs = await prisma.user.upsert({
    where: { email: "ehs@demo.com" },
    update: {
      password: ehsPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "ehs@demo.com",
      name: "Michael Torres",
      password: ehsPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "HMS",
        },
      },
    },
  });

  console.log("✅ EHS Manager created:", ehs.email);

  // Operations Manager
  const managerPassword = await bcrypt.hash("manager123", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {
      password: managerPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "manager@demo.com",
      name: "Jennifer Walker",
      password: managerPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "LEDER",
        },
      },
    },
  });

  console.log("✅ Operations Manager created:", manager.email);

  // Safety Representative
  const safetyPassword = await bcrypt.hash("safety123", 10);

  const safety = await prisma.user.upsert({
    where: { email: "safety@demo.com" },
    update: {
      password: safetyPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "safety@demo.com",
      name: "David Chen",
      password: safetyPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "VERNEOMBUD",
        },
      },
    },
  });

  console.log("✅ Safety Representative created:", safety.email);

  // Employee
  const employeePassword = await bcrypt.hash("employee123", 10);

  const employee = await prisma.user.upsert({
    where: { email: "employee@demo.com" },
    update: {
      password: employeePassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "employee@demo.com",
      name: "Thomas Brown",
      password: employeePassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "ANSATT",
        },
      },
    },
  });

  console.log("✅ Employee created:", employee.email);

  // OHS Provider
  const ohsPassword = await bcrypt.hash("ohs123", 10);

  const ohs = await prisma.user.upsert({
    where: { email: "ohs@demo.com" },
    update: {
      password: ohsPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "ohs@demo.com",
      name: "Carol Davis",
      password: ohsPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "BHT",
        },
      },
    },
  });

  console.log("✅ OHS Provider created:", ohs.email);

  // Auditor
  const auditorPassword = await bcrypt.hash("auditor123", 10);

  const auditor = await prisma.user.upsert({
    where: { email: "auditor@demo.com" },
    update: {
      password: auditorPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "auditor@demo.com",
      name: "Robert White",
      password: auditorPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "REVISOR",
        },
      },
    },
  });

  console.log("✅ Auditor created:", auditor.email);

  const ensureGlobalTemplate = async (
    name: string,
    description: string,
    pdcaGuidance: Record<string, string>,
    defaultReviewIntervalMonths = 12,
    category?: string
  ) => {
    const existing = await prisma.documentTemplate.findFirst({
      where: { name, tenantId: null },
    });

    if (!existing) {
      await prisma.documentTemplate.create({
        data: {
          name,
          description,
          pdcaGuidance,
          defaultReviewIntervalMonths,
          category,
          isGlobal: true,
        },
      });
    }
  };

  await ensureGlobalTemplate(
    "Standard Procedure",
    "Template for ISO 9001 procedures with PDCA structure",
    {
      plan: "Define purpose, scope, responsible roles, and referenced documents.",
      do: "List the main process steps in sequential order.",
      check: "Explain how the process is monitored and measured.",
      act: "Describe how improvements and corrective actions are handled.",
    }
  );

  await ensureGlobalTemplate(
    "Work Instruction",
    "Work instruction template for ISO 45001 with focus on safe execution.",
    {
      plan: "Which work area does this instruction apply to? Required qualifications and PPE.",
      do: "Step-by-step instructions for safe execution, including all PPE requirements.",
      check: "How is compliance with this instruction verified?",
      act: "How is this instruction updated and how are deviations handled?",
    },
    6
  );

  await ensureGlobalTemplate(
    "BCM Plan",
    "Template for business continuity plans (ISO 22301) with critical process focus.",
    {
      plan: "Define critical services, dependencies, and contact lists.",
      do: "Describe crisis team activation, escalation path, and communication.",
      check: "Plan for exercises, redundancy testing, and lessons learned.",
      act: "How improvements are documented and integrated into the management system.",
    },
    12,
    "BCM"
  );

  // Global EHS course templates
  const standardCourses = [
    {
      courseKey: "ehs-induction",
      title: "EHS Induction",
      description: "Mandatory onboarding safety training covering company EHS policies, hazard reporting, and emergency procedures",
      provider: null as string | null,
      isRequired: true,
      validityYears: null as number | null,
    },
    {
      courseKey: "working-at-height",
      title: "Working at Heights",
      description: "Safe use of ladders, scaffolding, and personal fall arrest systems. OSHA 29 CFR 1910.28 compliant.",
      provider: null,
      isRequired: false,
      validityYears: 3,
    },
    {
      courseKey: "first-aid",
      title: "First Aid / CPR",
      description: "Basic first aid, CPR, and AED operation. American Red Cross certified.",
      provider: "American Red Cross",
      isRequired: false,
      validityYears: 2,
    },
    {
      courseKey: "fire-safety",
      title: "Fire Safety & Prevention",
      description: "Fire prevention, extinguisher operation, and emergency evacuation procedures",
      provider: null,
      isRequired: true,
      validityYears: 1,
    },
    {
      courseKey: "chemical-handling",
      title: "Hazardous Chemical Handling (HazCom)",
      description: "GHS labeling, Safety Data Sheets, secondary container labeling, and PPE selection for chemical hazards",
      provider: null,
      isRequired: false,
      validityYears: 3,
    },
    {
      courseKey: "forklift",
      title: "Powered Industrial Truck (Forklift) Certification",
      description: "OSHA-compliant forklift operator certification per 29 CFR 1910.178",
      provider: null,
      isRequired: false,
      validityYears: 3,
    },
    {
      courseKey: "lockout-tagout",
      title: "Lockout/Tagout (LOTO)",
      description: "Control of hazardous energy during equipment servicing and maintenance — 29 CFR 1910.147",
      provider: null,
      isRequired: false,
      validityYears: 3,
    },
    {
      courseKey: "confined-space",
      title: "Permit-Required Confined Space Entry",
      description: "Safe entry procedures for permit-required confined spaces per OSHA 29 CFR 1910.146",
      provider: null,
      isRequired: false,
      validityYears: 3,
    },
    {
      courseKey: "osha-10",
      title: "OSHA 10-Hour General Industry",
      description: "OSHA 10-hour general industry outreach training covering common hazards and workers' rights",
      provider: "OSHA",
      isRequired: false,
      validityYears: null,
    },
    {
      courseKey: "osha-30",
      title: "OSHA 30-Hour General Industry",
      description: "Advanced OSHA 30-hour training for supervisors and EHS professionals",
      provider: "OSHA",
      isRequired: false,
      validityYears: null,
    },
  ];

  for (const c of standardCourses) {
    const existing = await prisma.courseTemplate.findFirst({
      where: { tenantId: null, courseKey: c.courseKey },
    });
    if (!existing) {
      await prisma.courseTemplate.create({
        data: {
          tenantId: null,
          courseKey: c.courseKey,
          title: c.title,
          description: c.description,
          provider: c.provider,
          isRequired: c.isRequired,
          validityYears: c.validityYears,
          isGlobal: true,
          isActive: true,
        },
      });
      console.log("✅ Course template created:", c.title);
    }
  }

  // EHS Goals (ISO 9001 clause 6.2)
  const goal1 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Reduce recordable injuries by 50%",
      description: "Reduce OSHA recordable injuries from 8 to 4 per year through targeted prevention programs",
      category: "HMS",
      targetValue: 4,
      currentValue: 8,
      unit: "incidents",
      baseline: 8,
      year: new Date().getFullYear(),
      startDate: new Date(`${new Date().getFullYear()}-01-01`),
      deadline: new Date(`${new Date().getFullYear()}-12-31`),
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  const measurement1 = await prisma.kpiMeasurement.create({
    data: {
      goalId: goal1.id,
      tenantId: tenant.id,
      value: 6,
      measurementDate: new Date(`${new Date().getFullYear()}-03-31`),
      measurementType: "MANUAL",
      comment: "Q1 result: 2 fewer incidents vs. prior year. Toolbox talks and PPE audit contributed to improvement.",
      measuredById: adminUser.id,
    },
  });

  const measurement2 = await prisma.kpiMeasurement.create({
    data: {
      goalId: goal1.id,
      tenantId: tenant.id,
      value: 5,
      measurementDate: new Date(`${new Date().getFullYear()}-06-30`),
      measurementType: "MANUAL",
      comment: "Q2 result: on track. New LOTO procedure reduced machine-related incidents.",
      measuredById: adminUser.id,
    },
  });

  console.log("✅ KPI measurements created:", measurement1.id, measurement2.id);

  await prisma.goal.update({
    where: { id: goal1.id },
    data: { currentValue: 5 },
  });

  const goal2 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Achieve customer satisfaction score ≥ 90%",
      description: "Improve NPS and customer satisfaction ratings through service quality improvements",
      category: "CUSTOMER",
      targetValue: 90,
      currentValue: 78,
      unit: "%",
      baseline: 72,
      year: new Date().getFullYear(),
      quarter: 2,
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Reduce hazardous waste generation by 25%",
      description: "Environmental goal to reduce total hazardous waste output through process optimization and substitution",
      category: "ENVIRONMENT",
      targetValue: 75,
      currentValue: 98,
      unit: "kg/month",
      baseline: 100,
      year: new Date().getFullYear(),
      deadline: new Date(`${new Date().getFullYear()}-12-31`),
      ownerId: employee.id,
      status: "AT_RISK",
    },
  });

  const goal4 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Complete ISO 45001 certification",
      description: "Achieve ISO 45001:2018 Occupational Health & Safety certification",
      category: "QUALITY",
      targetValue: 100,
      currentValue: 100,
      unit: "%",
      baseline: 0,
      year: new Date().getFullYear() - 1,
      ownerId: adminUser.id,
      status: "ACHIEVED",
    },
  });

  console.log("✅ Goals created:", goal2.title, goal3.title, goal4.title);

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      amount: 2900,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "SENT",
      period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      description: "EHS Nova Professional — Monthly subscription",
    },
  });

  console.log("✅ Invoice created:", invoice.id);

  console.log("ℹ️  Seed script preserves existing data. Demo records are skipped if they already exist...");

  const existingDataCount = await prisma.document.count({ where: { tenantId: tenant.id } });

  if (existingDataCount === 0) {
    console.log("📦 Creating demo data — database is empty...");

    // Documents
    const doc1 = await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "EHS Handbook 2025",
        slug: "ehs-handbook-2025",
        fileKey: "demo/ehs-handbook.pdf",
        mime: "application/pdf",
        kind: "OTHER",
        version: "1.0",
        status: "APPROVED",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const doc2 = await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Emergency Response Plan",
        slug: "emergency-response-plan",
        fileKey: "demo/emergency-response.pdf",
        mime: "application/pdf",
        kind: "PLAN",
        version: "0.5",
        status: "DRAFT",
      },
    });

    console.log("✅ Documents created:", doc1.title, doc2.title);

    const bcmTemplate = await prisma.documentTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Business Continuity Plan",
        category: "BCM",
        description: "Business continuity plan template for critical operations (ISO 22301).",
        pdcaGuidance: {
          plan: "Map critical processes, dependencies, and key contacts.",
          do: "Define crisis team activation, escalation triggers, and response actions.",
          check: "Schedule exercises, review lessons learned and report outcomes.",
          act: "Update plan after every exercise or real event.",
        },
        isGlobal: false,
      },
    });

    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Business Continuity Plan 2025",
        slug: "bcp-2025",
        kind: "PLAN",
        version: "1.0",
        status: "APPROVED",
        fileKey: "demo/bcp-2025.pdf",
        mime: "application/pdf",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        ownerId: manager.id,
        templateId: bcmTemplate.id,
        reviewIntervalMonths: 12,
        nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        planSummary: "Plan to maintain critical operations during major disruptions.",
        doSummary: "Crisis team mobilizes within 2 hours and activates alternate suppliers.",
        checkSummary: "Annual tabletop exercises and technology failover tests.",
        actSummary: "Lessons learned are documented and incorporated in the next revision.",
      },
    });

    const timesheetTemplate = await prisma.formTemplate.create({
      data: {
        tenantId: tenant.id,
        title: "Timesheet",
        description:
          "Log hours against projects and tasks. Export to Excel by week, month, or year — ready for payroll.",
        category: "TIMESHEET",
        requiresSignature: true,
        requiresApproval: false,
        accessType: "ALL",
        createdBy: adminUser.id,
        fields: {
          create: [
            { label: "Date", fieldType: "DATE", order: 1, isRequired: true },
            { label: "Hours", fieldType: "NUMBER", order: 2, isRequired: true, placeholder: "7.5" },
            { label: "Project / Task", fieldType: "TEXT", order: 3, isRequired: true },
            { label: "Comments", fieldType: "TEXTAREA", order: 4, isRequired: false },
          ],
        },
      },
      include: { fields: true },
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { timeRegistrationEnabled: true },
    });

    const existingProject = await prisma.project.findFirst({
      where: { tenantId: tenant.id, code: "INT-001" },
    });
    if (!existingProject) {
      await prisma.project.create({
        data: {
          tenantId: tenant.id,
          name: "Internal Project",
          code: "INT-001",
          description: "Default project for internal time tracking",
          createdById: adminUser.id,
          status: "ACTIVE",
        },
      });
    }

    const wellbeingTemplate = await prisma.formTemplate.create({
      data: {
        tenantId: tenant.id,
        title: "Wellbeing Pulse Survey",
        description: "Monthly psychosocial pulse on wellbeing, workload, and team support (ISO 45003).",
        category: "WELLBEING",
        requiresSignature: false,
        requiresApproval: false,
        allowAnonymousResponses: true,
        createdBy: adminUser.id,
        fields: {
          create: [
            {
              label: "How are you feeling today? (1–5)",
              fieldType: "RADIO",
              order: 1,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "How is your current workload? (1–5)",
              fieldType: "RADIO",
              order: 2,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "Do you feel supported by your manager and colleagues? (1–5)",
              fieldType: "RADIO",
              order: 3,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "What would you like to share with the EHS team?",
              fieldType: "TEXTAREA",
              order: 4,
              placeholder: "Open feedback",
            },
          ],
        },
      },
      include: {
        fields: true,
      },
    });

    const wellbeingFieldMap = Object.fromEntries(
      wellbeingTemplate.fields.map((field) => [field.label, field.id])
    );

    const pulseEntries = [
      {
        userId: employee.id,
        mood: "4",
        workload: "3",
        support: "5",
        comment: "Good support from my manager during a busy stretch.",
        daysAgo: 3,
      },
      {
        userId: ehs.id,
        mood: "3",
        workload: "4",
        support: "3",
        comment: "Would benefit from better task prioritization during audit season.",
        daysAgo: 7,
      },
      {
        userId: safety.id,
        mood: "5",
        workload: "2",
        support: "5",
        comment: "The team is working really well together right now.",
        daysAgo: 14,
      },
    ];

    for (const entry of pulseEntries) {
      await prisma.formSubmission.create({
        data: {
          tenantId: tenant.id,
          formTemplateId: wellbeingTemplate.id,
          submittedById: entry.userId,
          status: "SUBMITTED",
          signedAt: new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000),
          fieldValues: {
            create: [
              { fieldId: wellbeingFieldMap["How are you feeling today? (1–5)"], value: entry.mood },
              { fieldId: wellbeingFieldMap["How is your current workload? (1–5)"], value: entry.workload },
              { fieldId: wellbeingFieldMap["Do you feel supported by your manager and colleagues? (1–5)"], value: entry.support },
              { fieldId: wellbeingFieldMap["What would you like to share with the EHS team?"], value: entry.comment },
            ],
          },
        },
      });
    }

    const safetyWalkTemplate = await prisma.inspectionTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Monthly Safety Walk",
        description: "Standard checklist for monthly physical safety walkthrough",
        category: "EHS",
        riskCategory: "SAFETY",
        checklist: {
          items: [
            { title: "Housekeeping and general order", type: "checkbox" },
            { title: "PPE use compliance", type: "checkbox" },
            { title: "Fall protection in place", type: "checkbox" },
          ],
        },
        isGlobal: false,
      },
    });

    const chemicalTemplate = await prisma.inspectionTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Chemical Storage Inspection",
        description: "Verify chemicals are properly labeled, stored, and segregated",
        category: "CHEMICALS",
        riskCategory: "ENVIRONMENTAL",
        checklist: {
          items: [
            { title: "All containers properly labeled (GHS)", type: "checkbox" },
            { title: "PPE available and in good condition", type: "checkbox" },
            { title: "SDS current and accessible", type: "checkbox" },
          ],
        },
        isGlobal: false,
      },
    });

    console.log("✅ Inspection templates created");

    // Risk assessments
    const risk1 = await prisma.risk.create({
      data: {
        tenantId: tenant.id,
        title: "Falls from Elevated Work Platforms",
        context: "Employees working at heights during racking and maintenance operations. Warehouse shelving reaches 18 ft.",
        description: "Work at elevation occurs multiple times per week. Inadequate fall protection can result in severe injury or fatality.",
        existingControls: "Daily equipment inspection, mandatory fall arrest harness, OSHA-compliant scaffolding.",
        location: "Warehouse — Racking Section A",
        area: "Operations",
        linkedProcess: "Warehouse Operations",
        category: "SAFETY",
        likelihood: 3,
        consequence: 4,
        score: 12,
        ownerId: ehs.id,
        status: "OPEN",
        controlFrequency: "MONTHLY",
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        riskStatement: "A fall from height can cause life-altering injury or fatality.",
        residualLikelihood: 2,
        residualConsequence: 3,
        residualScore: 6,
        kpiId: goal1.id,
        inspectionTemplateId: safetyWalkTemplate.id,
      },
    });

    const risk2 = await prisma.risk.create({
      data: {
        tenantId: tenant.id,
        title: "Chemical Exposure — Cleaning Agents",
        context: "Exposure to concentrated cleaning chemicals in the maintenance room. Daily handling without adequate ventilation.",
        description: "Strong alkalis and solvents are used daily. Lack of secondary container labeling and insufficient ventilation.",
        existingControls: "SDS readily available, nitrile gloves and safety glasses required.",
        location: "Maintenance Room",
        area: "Facilities",
        linkedProcess: "Facility Maintenance",
        category: "ENVIRONMENTAL",
        likelihood: 2,
        consequence: 2,
        score: 4,
        ownerId: ehs.id,
        status: "MITIGATING",
        controlFrequency: "QUARTERLY",
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        riskStatement: "Skin and respiratory harm from spill or improper handling.",
        residualLikelihood: 1,
        residualConsequence: 2,
        residualScore: 2,
        inspectionTemplateId: chemicalTemplate.id,
      },
    });

    console.log("✅ Risks created:", risk1.title, risk2.title);

    const securityAsset = await prisma.securityAsset.create({
      data: {
        tenantId: tenant.id,
        name: "Azure Active Directory",
        description: "Identity platform for the entire organization",
        type: "INFORMATION_SYSTEM",
        ownerId: adminUser.id,
        confidentiality: "HIGH",
        integrity: "HIGH",
        availability: "HIGH",
        businessCriticality: 5,
      },
    });

    const securityControl = await prisma.securityControl.create({
      data: {
        tenantId: tenant.id,
        code: "A.5.7",
        title: "Information Security in Projects",
        annexReference: "Annex A 5.7",
        requirement: "Projects shall plan and implement appropriate information security measures.",
        category: "ORGANIZATIONAL",
        status: "IMPLEMENTED",
        maturity: "MANAGED",
        ownerId: ehs.id,
        linkedAssetId: securityAsset.id,
        linkedRiskId: risk1.id,
        implementationNote: "Control implemented through project templates and standardized checklists.",
        monitoring: "Reviewed in quarterly project reviews.",
        lastTestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.securityControlDocument.create({
      data: {
        tenantId: tenant.id,
        controlId: securityControl.id,
        documentId: doc1.id,
        note: "Reference to EHS Handbook Chapter 4",
      },
    });

    await prisma.securityEvidence.create({
      data: {
        tenantId: tenant.id,
        controlId: securityControl.id,
        title: "Q1 Project Review",
        description: "Sample of project plans confirmed security controls are integrated across all active projects.",
        collectedById: ehs.id,
        reviewResult: "No findings",
      },
    });

    const accessReview = await prisma.accessReview.create({
      data: {
        tenantId: tenant.id,
        title: "Quarterly Administrator Access Review",
        systemName: "Azure AD",
        scope: "All global administrators",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        ownerId: ehs.id,
      },
    });

    await prisma.accessReviewEntry.createMany({
      data: [
        {
          tenantId: tenant.id,
          reviewId: accessReview.id,
          userName: "Sarah Mitchell",
          userEmail: adminUser.email,
          role: "Global Admin",
          decision: "APPROVED",
          comment: "Required for daily operations",
          decidedById: ehs.id,
          decidedAt: new Date(),
        },
        {
          tenantId: tenant.id,
          reviewId: accessReview.id,
          userName: "External Consultant",
          userEmail: "consultant@partner.com",
          role: "Privileged Role",
          decision: "REVOKED",
          comment: "Project has ended",
          decidedById: ehs.id,
          decidedAt: new Date(),
        },
      ],
    });

    await prisma.riskControl.createMany({
      data: [
        {
          tenantId: tenant.id,
          riskId: risk1.id,
          title: "Daily visual platform inspection",
          description: "Foreman verifies all elevated platforms are secure and properly guarded before work begins.",
          controlType: "PREVENTIVE",
          ownerId: ehs.id,
          status: "ACTIVE",
          effectiveness: "EFFECTIVE",
          frequency: "WEEKLY",
          monitoringMethod: "Signed checklist in field app",
          evidenceDocumentId: doc1.id,
          nextTestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          lastTestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          tenantId: tenant.id,
          riskId: risk1.id,
          title: "Annual fall protection equipment certification",
          controlType: "DETECTIVE",
          ownerId: ohs.id,
          status: "NEEDS_IMPROVEMENT",
          effectiveness: "PARTIAL",
          frequency: "ANNUAL",
          monitoringMethod: "External vendor reports to EHS",
        },
        {
          tenantId: tenant.id,
          riskId: risk2.id,
          title: "Chemical inventory check upon receipt",
          controlType: "PREVENTIVE",
          ownerId: manager.id,
          status: "ACTIVE",
          effectiveness: "EFFECTIVE",
          frequency: "MONTHLY",
        },
      ],
    });

    await prisma.riskDocumentLink.createMany({
      data: [
        {
          tenantId: tenant.id,
          riskId: risk1.id,
          documentId: doc1.id,
          relation: "PROCEDURE",
          note: "Working at heights procedure — EHS Handbook Chapter 4",
        },
        {
          tenantId: tenant.id,
          riskId: risk2.id,
          documentId: doc2.id,
          relation: "SUPPORTING",
          note: "Emergency response plan for chemical spill scenarios",
        },
      ],
    });

    // Incidents
    const incident1 = await prisma.incident.create({
      data: {
        tenantId: tenant.id,
        type: "SKADE",
        title: "Laceration to Right Hand — Press Machine #3",
        description:
          "Employee sustained a laceration to the right index finger while changing tooling on Press Machine #3 during scheduled maintenance. Employee was not wearing cut-resistant gloves at the time.",
        severity: 2,
        occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reportedBy: employee.id,
        responsibleId: ehs.id,
        location: "Production Floor — Machine 3",
        immediateAction:
          "First aid applied on-site. Employee transported to occupational health clinic. Wound required 2 stitches. Machine tagged out pending investigation.",
        rootCause:
          "5-Why Analysis: (1) Employee cut finger → (2) Sharp tooling contacted bare skin → (3) Cut-resistant gloves not worn → (4) JSA did not mandate gloves for tooling changes → (5) JSA had not been reviewed since equipment upgrade 18 months ago.",
        lessonsLearned:
          "Updated JSA to mandate cut-resistant gloves for all tooling changes. Issued new ergonomic cut-resistant gloves to production team. Conducted toolbox talk for all production employees. Added tooling change procedure to annual EHS review cycle.",
        status: "CLOSED",
        stage: "VERIFIED",
        injuryType: "Laceration — right index finger",
        medicalAttentionRequired: true,
        lostTimeMinutes: 90,
        riskReferenceId: risk1.id,
        closedBy: ehs.id,
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    const incident2 = await prisma.incident.create({
      data: {
        tenantId: tenant.id,
        type: "NESTEN",
        title: "Near-Miss: Glass Containers Found in Warehouse Aisle 4",
        description:
          "During routine walkthrough, warehouse team lead discovered two glass bottles on the floor of Aisle 4. Bottles created an immediate slip and trip hazard. No injuries occurred, but the situation had high injury potential.",
        severity: 3,
        occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reportedBy: employee.id,
        responsibleId: ehs.id,
        location: "Warehouse — Aisle 4",
        immediateAction: "Glass containers removed immediately. Area cordoned off for inspection.",
        rootCause:
          "Incoming shipment included glass containers that were not properly sorted into the designated hazmat receiving area. The receiving checklist did not include a segregation verification step.",
        lessonsLearned:
          "Updated receiving checklist to include hazardous material segregation. Added clearly marked hazmat receiving zone. Refresher training provided to receiving team.",
        status: "ACTION_TAKEN",
        stage: "ACTIONS_DEFINED",
        medicalAttentionRequired: false,
        riskReferenceId: risk1.id,
      },
    });

    const complaintIncident = await prisma.incident.create({
      data: {
        tenantId: tenant.id,
        type: "CUSTOMER",
        title: "Customer Complaint: Delayed Service Visit",
        description:
          "Customer reported a two-week delay on a critical scheduled service visit. Delay caused production downtime at customer site.",
        severity: 3,
        occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        reportedBy: manager.id,
        responsibleId: ehs.id,
        customerName: "Rocky Mountain Energy Corp.",
        customerEmail: "procurement@rmenergy.com",
        customerPhone: "303-555-0144",
        customerTicketId: "CRM-2025-104",
        responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        customerSatisfaction: 2,
        status: "OPEN",
        stage: "REPORTED",
      },
    });

    console.log("✅ Incidents created:", incident1.title, incident2.title, complaintIncident.title);

    // Corrective Measures
    const measure1 = await prisma.measure.create({
      data: {
        tenantId: tenant.id,
        riskId: risk1.id,
        title: "Install safety guardrails on all elevated racking",
        description: "Install OSHA-compliant guardrails at all racking levels above 4 feet to prevent falls",
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        responsibleId: manager.id,
        status: "IN_PROGRESS",
        category: "MITIGATION",
        followUpFrequency: "MONTHLY",
        costEstimate: 8500,
        benefitEstimate: 40,
      },
    });

    const measure2 = await prisma.measure.create({
      data: {
        tenantId: tenant.id,
        title: "Conduct mandatory EHS induction for all new hires",
        description: "Standardize onboarding EHS training — mandatory for all employees before independent work",
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        responsibleId: ehs.id,
        status: "PENDING",
        category: "PREVENTIVE",
        followUpFrequency: "ANNUAL",
        costEstimate: 4000,
        benefitEstimate: 30,
      },
    });

    console.log("✅ Measures created:", measure1.title, measure2.title);

    // Training records
    const training1 = await prisma.training.create({
      data: {
        tenantId: tenant.id,
        userId: employee.id,
        title: "EHS Induction",
        description: "Company EHS policies, hazard reporting, emergency procedures, and OSHA rights",
        courseKey: "ehs-induction",
        provider: "EHS Nova",
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        isRequired: true,
      },
    });

    const training2 = await prisma.training.create({
      data: {
        tenantId: tenant.id,
        userId: employee.id,
        title: "Working at Heights Certification",
        description: "Safe use of ladders, scaffolding, and personal fall arrest systems",
        courseKey: "working-at-height",
        provider: "EHS Nova",
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isRequired: true,
      },
    });

    console.log("✅ Training records created:", training1.title, training2.title);

    // Chemicals
    const chemical1 = await prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "Acetone",
        supplier: "ChemSource Industrial",
        casNumber: "67-64-1",
        hazardClass: "Flammable Liquid (GHS02), Health Hazard (GHS07)",
        hazardStatements: "H225: Highly flammable liquid and vapor\nH319: Causes serious eye irritation\nH336: May cause drowsiness or dizziness",
        warningPictograms: JSON.stringify(["brannfarlig.webp", "helserisiko.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M002.svg.png", "ISO_7010_M007.svg.png"]),
        sdsVersion: "2.1",
        sdsDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
        location: "Chemical Cabinet A",
        quantity: 5,
        unit: "liters",
        status: "ACTIVE",
        lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehs.id,
      },
    });

    const chemical2 = await prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "Hydrochloric Acid 10%",
        supplier: "Lab Supply Co.",
        casNumber: "7647-01-0",
        hazardClass: "Corrosive (GHS05), Health Hazard (GHS07)",
        hazardStatements: "H290: May be corrosive to metals\nH314: Causes severe skin burns and eye damage\nH335: May cause respiratory irritation",
        warningPictograms: JSON.stringify(["etsende.webp", "helserisiko.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M002.svg.png", "ISO_7010_M007.svg.png", "ISO_7010_M005.svg.png"]),
        sdsVersion: "3.0",
        sdsDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        location: "Acid Cabinet B",
        quantity: 2,
        unit: "liters",
        status: "ACTIVE",
        notes: "Store away from flammable materials. Inspect secondary containment monthly.",
        lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehs.id,
      },
    });

    console.log("✅ Chemicals created:", chemical1.productName, chemical2.productName);

    // Environmental aspects
    const energyAspect = await prisma.environmentalAspect.create({
      data: {
        tenantId: tenant.id,
        title: "Energy Consumption — Production Facility",
        description: "Electrical consumption from HVAC, compressed air, and production machinery.",
        process: "Production",
        location: "Production Hall",
        category: "ENERGY",
        impactType: "NEGATIVE",
        severity: 4,
        likelihood: 4,
        significanceScore: 16,
        legalRequirement: "EPA Energy Star / DOE Building Energy Efficiency",
        controlMeasures: "Monitor consumption by shift, auto-shutdown of non-critical equipment after hours.",
        monitoringMethod: "Smart energy meter",
        monitoringFrequency: "MONTHLY",
        ownerId: ehs.id,
        goalId: goal1.id,
        status: "ACTIVE",
        nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        lastMeasurementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    const wasteAspect = await prisma.environmentalAspect.create({
      data: {
        tenantId: tenant.id,
        title: "Hazardous Waste from Maintenance",
        description: "Spent oil and solvent waste generated from machine maintenance.",
        process: "Maintenance",
        location: "Maintenance Shop B",
        category: "WASTE",
        impactType: "NEGATIVE",
        severity: 5,
        likelihood: 3,
        significanceScore: 15,
        legalRequirement: "RCRA — 40 CFR Part 262 (Generator Standards)",
        controlMeasures: "Closed drums, labeled containers, and permitted waste disposal vendor.",
        monitoringMethod: "Inventory log and disposal manifest",
        monitoringFrequency: "QUARTERLY",
        ownerId: ehs.id,
        goalId: goal2.id,
        status: "MONITORED",
        nextReviewDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.environmentalMeasurement.create({
      data: {
        tenantId: tenant.id,
        aspectId: energyAspect.id,
        parameter: "kWh per month",
        unit: "kWh",
        method: "Automated meter",
        limitValue: 45000,
        targetValue: 40000,
        measuredValue: 42050,
        measurementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "WARNING",
        notes: "Elevated due to extended overtime shift for priority order",
        responsibleId: manager.id,
      },
    });

    await prisma.environmentalMeasurement.create({
      data: {
        tenantId: tenant.id,
        aspectId: wasteAspect.id,
        parameter: "Hazardous waste volume",
        unit: "kg",
        method: "Manifest / weight at disposal",
        limitValue: 800,
        targetValue: 600,
        measuredValue: 520,
        measurementDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        status: "COMPLIANT",
        notes: "Under limit — disposal completed via licensed vendor",
        responsibleId: ehs.id,
      },
    });

    // Safety inspection (vernerunde)
    const inspection1 = await prisma.inspection.create({
      data: {
        tenantId: tenant.id,
        title: "Monthly Safety Walk — December",
        description: "Routine safety walkthrough of all work areas",
        type: "VERNERUNDE",
        status: "COMPLETED",
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: "All areas",
        conductedBy: safety.id,
        participants: JSON.stringify([safety.id, ehs.id]),
        templateId: safetyWalkTemplate.id,
        riskCategory: "SAFETY",
        area: "Production",
        durationMinutes: 90,
        followUpById: ehs.id,
        nextInspection: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Emergency exit signage missing in Storage Room C",
        description: "No illuminated exit sign above the secondary emergency exit door in Storage Room C",
        severity: 3,
        location: "Storage Room C",
        status: "OPEN",
        responsibleId: ehs.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        linkedRiskId: risk1.id,
      },
    });

    await prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Scratched safety goggles in Workshop area",
        description: "Three pairs of safety goggles with significant lens scratches reducing visibility — need replacement",
        severity: 2,
        location: "Workshop",
        status: "RESOLVED",
        responsibleId: ehs.id,
        resolvedAt: new Date(),
        resolutionNotes: "New safety goggles ordered and distributed",
        linkedRiskId: risk1.id,
      },
    });

    console.log("✅ Safety walk created:", inspection1.title, "with 2 findings");

    // Internal audit
    const audit1 = await prisma.audit.create({
      data: {
        tenantId: tenant.id,
        title: "ISO 45001 Internal Audit 2024",
        auditType: "INTERNAL",
        scope: "All processes in the occupational health and safety management system",
        criteria: "ISO 45001:2018 clauses 4–10",
        area: "EHS",
        department: "All departments",
        leadAuditorId: auditor.id,
        teamMemberIds: JSON.stringify([ehs.id]),
        scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: "COMPLETED",
        summary: "Annual internal audit of the EHS management system completed",
        conclusion: "System is functioning satisfactorily with 2 minor nonconformities requiring closure",
      },
    });

    await prisma.riskAuditLink.create({
      data: {
        tenantId: tenant.id,
        riskId: risk1.id,
        auditId: audit1.id,
        relation: "FOLLOW_UP",
        summary: "Audit follows up on corrective actions for working at heights risk",
      },
    });

    await prisma.auditFinding.create({
      data: {
        auditId: audit1.id,
        findingType: "MINOR_NC",
        clause: "7.1.5",
        description: "Calibration logs for measuring equipment in the lab are not current",
        evidence:
          "3 of 5 measuring instruments in the quality lab were missing 2024 calibration documentation",
        requirement:
          "ISO 45001:2018 requires measuring equipment to be calibrated and documented at defined intervals",
        responsibleId: manager.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "OPEN",
      },
    });

    await prisma.auditFinding.create({
      data: {
        auditId: audit1.id,
        findingType: "OBSERVATION",
        clause: "7.4",
        description: "Opportunity to improve EHS information flow between departments",
        evidence: "EHS notices were not consistently reaching all employees in time",
        requirement: "Effective EHS communication shall be ensured per ISO 45001:2018",
        responsibleId: ehs.id,
        status: "RESOLVED",
        correctiveAction: "Implemented weekly EHS newsletters via email and digital notice boards",
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verifiedById: auditor.id,
        verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Audit created:", audit1.title);

    await prisma.audit.create({
      data: {
        tenantId: tenant.id,
        title: "BCM Tabletop Exercise 2025",
        auditType: "INTERNAL",
        scope: "Logistics and supply chain continuity",
        criteria: "ISO 22301",
        area: "Business Continuity",
        department: "Logistics",
        leadAuditorId: auditor.id,
        scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: "PLANNED",
      },
    });

    // Management review
    const mgmtReview1 = await prisma.managementReview.create({
      data: {
        tenantId: tenant.id,
        title: "Management Review — Q4",
        period: `Q4 ${new Date().getFullYear()}`,
        reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        conductedBy: adminUser.id,
        nextReviewDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
        participants: JSON.stringify([
          { name: adminUser.name, role: "CEO", email: adminUser.email },
          { name: ehs.name, role: "EHS Manager", email: ehs.email },
          { name: manager.name, role: "Operations Manager", email: manager.email },
        ]),
        conclusions:
          "EHS management system is operating effectively. Positive trend in recordable injury rate. Several improvement opportunities identified.",
        decisions:
          "1. Approved budget for new PPE inventory ($12,000)\n2. Agreed to schedule additional EHS training for supervisors\n3. All open corrective actions to be resolved within 30 days",
        actionPlan: JSON.stringify([
          { title: "Order new PPE stock", responsible: "EHS Manager", deadline: `${new Date().getFullYear()}-12-31` },
          { title: "Schedule supervisor EHS training", responsible: "HR", deadline: `${new Date().getFullYear()}-12-15` },
        ]),
        status: "COMPLETED",
        approvedBy: adminUser.id,
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Management review created:", mgmtReview1.title);

    // Safety Committee Meeting (AMU)
    const meeting1 = await prisma.meeting.create({
      data: {
        tenantId: tenant.id,
        title: "Safety Committee Meeting — December",
        type: "AMU",
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: "Conference Room A",
        organizer: manager.id,
        agenda:
          "1. Q4 absenteeism and injury statistics\n2. Status of open EHS incidents\n3. Upcoming safety walks\n4. Any other business",
        summary:
          "Meeting held with full attendance. Recordable injury rate down 15% compared to same period last year.",
        notes: "All open EHS incidents have been followed up. Fire drill completed successfully.",
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
      },
    });

    await prisma.meetingParticipant.createMany({
      data: [
        { meetingId: meeting1.id, userId: adminUser.id, role: "CHAIR", attended: true },
        { meetingId: meeting1.id, userId: ehs.id, role: "SECRETARY", attended: true },
        { meetingId: meeting1.id, userId: safety.id, role: "MEMBER", attended: true },
        { meetingId: meeting1.id, userId: employee.id, role: "MEMBER", attended: false },
      ],
    });

    await prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-12-01",
        title: "Procure ergonomic workstation chairs",
        description: "Decision: Purchase 10 ergonomic chairs for the office area to reduce musculoskeletal risk",
        responsibleId: adminUser.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    });

    await prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-12-02",
        title: "Schedule January safety walk",
        description: "Plan next safety walk for week 3 of January covering the maintenance shop",
        responsibleId: safety.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "IN_PROGRESS",
      },
    });

    console.log("✅ Safety Committee meeting created:", meeting1.title);

    // Whistleblowing
    const whistleblow1 = await prisma.whistleblowing.create({
      data: {
        tenantId: tenant.id,
        caseNumber: "WB-2024-001",
        accessCode: "ABC123DEF456GHIJ",
        category: "WORK_ENVIRONMENT",
        title: "PPE Non-Compliance on Evening Shift",
        description:
          "I have observed that safety procedures are not being followed consistently on the evening shift, particularly during shift changeover. Several employees have been seen operating machinery without the required PPE (safety glasses and hearing protection). This happens mainly during the evening shift.",
        occurredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        location: "Production Hall B — Machine Area",
        involvedPersons: "Unknown — 3–4 persons observed",
        isAnonymous: true,
        status: "UNDER_INVESTIGATION",
        severity: "MEDIUM",
        handledBy: ehs.id,
        assignedTo: ehs.id,
        acknowledgedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        investigatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.whistleblowMessage.createMany({
      data: [
        {
          whistleblowingId: whistleblow1.id,
          sender: "SYSTEM",
          message: `Report received with case number ${whistleblow1.caseNumber}. Use your access code to track updates.`,
        },
        {
          whistleblowingId: whistleblow1.id,
          sender: "HANDLER",
          message:
            "Thank you for your report. We take this seriously and have begun an investigation. You will receive updates here.",
        },
        {
          whistleblowingId: whistleblow1.id,
          sender: "REPORTER",
          message: "Has anything changed? The situation seems the same as before.",
        },
        {
          whistleblowingId: whistleblow1.id,
          sender: "HANDLER",
          message:
            "We have completed observations and confirmed your findings. EHS training is scheduled for all evening shift employees next week. Additional safety signage will also be installed.",
        },
      ],
    });

    console.log("✅ Whistleblowing report created:", whistleblow1.caseNumber);

    // Customer feedback
    await prisma.customerFeedback.create({
      data: {
        tenantId: tenant.id,
        recordedById: adminUser.id,
        customerName: "Mark Johnson",
        customerCompany: "Summit Construction LLC",
        contactEmail: "mark.j@summitconstruction.com",
        source: "EMAIL",
        sentiment: "POSITIVE",
        rating: 5,
        summary: "Very satisfied with service delivery and follow-through",
        details:
          "Fast response time and clear communication throughout the project. Highly recommend.",
        feedbackDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        followUpStatus: "CLOSED",
        followUpOwnerId: ehs.id,
        followUpNotes: "Logged in KPI report. Thank-you note sent.",
        linkedGoalId: goal2.id,
      },
    });

    await prisma.customerFeedback.create({
      data: {
        tenantId: tenant.id,
        recordedById: manager.id,
        customerName: "Lisa Nguyen",
        customerCompany: "Glacier Peak Industries",
        contactEmail: "l.nguyen@glacierpeak.com",
        contactPhone: "303-555-0177",
        source: "PHONE",
        sentiment: "NEUTRAL",
        rating: 3,
        summary: "Requests better delivery documentation",
        details:
          "Product quality is good but delivery paperwork needs improvement. Would like clearer packing lists.",
        feedbackDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        followUpStatus: "FOLLOW_UP",
        followUpOwnerId: ehs.id,
        followUpNotes: "Improved documentation template being developed for next delivery.",
      },
    });

    await prisma.customerFeedback.create({
      data: {
        tenantId: tenant.id,
        recordedById: ehs.id,
        customerName: "Ryan Pearce",
        customerCompany: "Redstone Manufacturing",
        source: "MEETING",
        sentiment: "NEGATIVE",
        rating: 2,
        summary: "Complaint — late delivery caused production stoppage",
        details:
          "Delivery arrived 3 days late, resulting in a 6-hour production stoppage. Requesting credit and root cause analysis.",
        feedbackDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        followUpStatus: "NEW",
        linkedIncidentId: complaintIncident.id,
      },
    });

    console.log("✅ Customer feedback records created");
  } else {
    console.log("ℹ️  Database already has data — demo records skipped to protect existing data");
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📊 DEMO DATA SUMMARY:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄 Documents:                2");
  console.log("⚠️  Risks:                   2");
  console.log("🚨 Incidents:                3");
  console.log("✅ Measures:                 2");
  console.log("🎯 Goals:                    4");
  console.log("📚 Training:                 2");
  console.log("🧪 Chemicals:                2");
  console.log("🌿 Environmental Aspects:    2");
  console.log("🔍 Safety Walks:             1 (with 2 findings)");
  console.log("📋 Audits:                   2 (with 2 findings)");
  console.log("📊 Management Reviews:       1");
  console.log("🤝 Safety Committee Mtg:     1 (with 4 participants)");
  console.log("🔒 Whistleblowing:           1 (with 4 messages)");
  console.log("💬 Customer Feedback:        3");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📝 Test login credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🛡️  Superadmin:      superadmin@ehsnova.com / superadmin123");
  console.log("🎧 Support:         support@ehsnova.com / support123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Admin:           admin@demo.com / admin123");
  console.log("⚡ EHS Manager:     ehs@demo.com / ehs123");
  console.log("👔 Ops Manager:     manager@demo.com / manager123");
  console.log("🛡️  Safety Rep:     safety@demo.com / safety123");
  console.log("👷 Employee:        employee@demo.com / employee123");
  console.log("🏥 OHS:             ohs@demo.com / ohs123");
  console.log("📋 Auditor:         auditor@demo.com / auditor123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔗 Whistleblowing portal for Apex Industrial Solutions:");
  console.log("   https://ehsnova.com/whistleblowing/demo-company");
  console.log("   Tracking code: ABC123DEF456GHIJ");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

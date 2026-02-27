/**
 * DEMO SEED — Full data for Apex Industrial Solutions Inc.
 * Comprehensive English demo data for customer-facing demonstrations
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Seeding DEMO data for Apex Industrial Solutions Inc...\n");

  // 1. Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "demo-company" },
  });

  if (!tenant) {
    console.error("❌ demo-company tenant not found! Run first: npx prisma db seed");
    process.exit(1);
  }

  console.log(`✅ Tenant: ${tenant.name}\n`);

  // 2. Clear existing demo data
  console.log("🗑️  Clearing existing demo data...\n");

  await prisma.kpiMeasurement.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.goal.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.inspectionFinding.deleteMany({ where: { inspection: { tenantId: tenant.id } } });
  await prisma.inspection.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.auditFinding.deleteMany({ where: { audit: { tenantId: tenant.id } } });
  await prisma.audit.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.training.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.chemical.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.measure.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.incident.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.risk.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.documentVersion.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.document.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.whistleblowMessage.deleteMany({ where: { whistleblowing: { tenantId: tenant.id } } });
  await prisma.whistleblowing.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.meetingDecision.deleteMany({ where: { meeting: { tenantId: tenant.id } } });
  await prisma.meetingParticipant.deleteMany({ where: { meeting: { tenantId: tenant.id } } });
  await prisma.meeting.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.managementReview.deleteMany({ where: { tenantId: tenant.id } });

  console.log("✅ Existing data cleared\n");

  // 3. Look up users
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@demo.com" } });
  const ehsUser = await prisma.user.findUnique({ where: { email: "ehs@demo.com" } });
  const managerUser = await prisma.user.findUnique({ where: { email: "manager@demo.com" } });
  const safetyUser = await prisma.user.findUnique({ where: { email: "safety@demo.com" } });
  const employeeUser = await prisma.user.findUnique({ where: { email: "employee@demo.com" } });
  const auditorUser = await prisma.user.findUnique({ where: { email: "auditor@demo.com" } });
  const ohsUser = await prisma.user.findUnique({ where: { email: "ohs@demo.com" } });

  if (!adminUser || !ehsUser || !managerUser || !safetyUser || !employeeUser || !auditorUser) {
    console.error("❌ Users not found! Run seed.ts first.");
    process.exit(1);
  }

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
    "Template for ISO 9001 quality procedures with PDCA structure.",
    {
      plan: "Define purpose, scope, and responsible roles.",
      do: "Describe execution steps and required documentation.",
      check: "Explain controls, measurements, and reporting.",
      act: "Describe how corrective actions and improvements are managed.",
    }
  );

  await ensureGlobalTemplate(
    "Work Instruction",
    "Work instruction template for ISO 45001 — focus on safe execution.",
    {
      plan: "Work area, risk assessment, and preparation requirements.",
      do: "Step-by-step instructions with safety and PPE focus.",
      check: "How observations and compliance checks are performed.",
      act: "Process for updating and improving the instruction.",
    },
    6
  );

  await ensureGlobalTemplate(
    "BCM Plan",
    "Template for business continuity plans (ISO 22301) with clear roles.",
    {
      plan: "Identify critical services, dependencies, and recovery objectives.",
      do: "Define activation criteria and responsible team members.",
      check: "Plan for exercises, backup tests, and lessons learned.",
      act: "Process for improving and updating the plan.",
    },
    12,
    "BCM"
  );

  // =====================================================================
  // 4. DOCUMENTS
  // =====================================================================
  console.log("📄 Creating documents...");

  const bcmTemplate = await prisma.documentTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Business Continuity Plan",
      category: "BCM",
      description: "Tenant-specific continuity plan template for critical operations.",
      pdcaGuidance: {
        plan: "Map critical processes, dependencies, and key contacts.",
        do: "Define crisis team, communication plan, and response actions.",
        check: "Scheduled exercises and outcome tracking.",
        act: "Update plan after every exercise or real incident.",
      },
      isGlobal: false,
    },
  });

  const documents = await Promise.all([
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "EHS Handbook 2025",
        slug: "ehs-handbook-2025-demo",
        kind: "OTHER",
        version: "2.0",
        fileKey: "demo/ehs-handbook.pdf",
        mime: "application/pdf",
        status: "APPROVED",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Incident Investigation Procedure",
        slug: "incident-investigation-procedure",
        kind: "PROCEDURE",
        version: "3.1",
        fileKey: "demo/incident-procedure.pdf",
        mime: "application/pdf",
        status: "APPROVED",
        approvedBy: ehsUser.id,
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Fire Emergency Plan",
        slug: "fire-emergency-plan",
        kind: "PLAN",
        version: "2.1",
        fileKey: "demo/fire-plan.pdf",
        mime: "application/pdf",
        status: "APPROVED",
        approvedBy: adminUser.id,
        approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Working at Heights — Safe Work Procedure",
        slug: "working-at-heights-swp",
        kind: "PROCEDURE",
        version: "1.4",
        fileKey: "demo/wah-procedure.pdf",
        mime: "application/pdf",
        status: "APPROVED",
        approvedBy: ehsUser.id,
        approvedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Workplace Safety Survey — Q3 Results",
        slug: "workplace-safety-survey-q3",
        kind: "OTHER",
        version: "1.0",
        fileKey: "demo/safety-survey-q3.pdf",
        mime: "application/pdf",
        status: "DRAFT",
      },
    }),
    prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Business Continuity Plan 2025",
        slug: "bcp-2025-demo",
        kind: "PLAN",
        version: "1.2",
        fileKey: "demo/bcp-2025.pdf",
        mime: "application/pdf",
        status: "APPROVED",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        ownerId: managerUser.id,
        templateId: bcmTemplate.id,
        reviewIntervalMonths: 12,
        nextReviewDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        planSummary: "Plan to maintain critical warehouse and logistics operations during major disruptions.",
        doSummary: "Crisis team mobilizes within 30 min and activates alternate suppliers.",
        checkSummary: "Semi-annual tabletop exercises and IT failover tests.",
        actSummary: "Improvement actions are recorded as documented deviations.",
      },
    }),
  ]);

  console.log(`   ✅ ${documents.length} documents created`);

  // Wellbeing Pulse Survey (ISO 45003)
  const wellbeingTemplate = await prisma.formTemplate.create({
    data: {
      tenantId: tenant.id,
      title: "Wellbeing Pulse Survey",
      description: "Quarterly psychosocial pulse survey for workplace wellbeing (ISO 45003).",
      category: "WELLBEING",
      requiresSignature: false,
      requiresApproval: false,
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
            label: "Do you feel supported by your manager and team? (1–5)",
            fieldType: "RADIO",
            order: 3,
            isRequired: true,
            options: JSON.stringify(["1", "2", "3", "4", "5"]),
          },
          {
            label: "What would you like to share?",
            fieldType: "TEXTAREA",
            order: 4,
          },
        ],
      },
    },
    include: {
      fields: true,
    },
  });

  await prisma.formTemplate.create({
    data: {
      tenantId: tenant.id,
      title: "Emergency Exercise — Scenario Report",
      description: "Checklist for documenting business continuity exercise outcomes.",
      category: "BCM",
      requiresSignature: true,
      requiresApproval: true,
      createdBy: adminUser.id,
      fields: {
        create: [
          { label: "Scenario / Event", fieldType: "TEXT", order: 1, isRequired: true },
          { label: "Affected processes", fieldType: "TEXTAREA", order: 2, isRequired: true },
          { label: "Participating teams", fieldType: "TEXTAREA", order: 3 },
          { label: "What worked well?", fieldType: "TEXTAREA", order: 4 },
          { label: "What needs improvement?", fieldType: "TEXTAREA", order: 5 },
        ],
      },
    },
  });

  const wellbeingFieldMap = Object.fromEntries(
    wellbeingTemplate.fields.map((field) => [field.label, field.id])
  );

  const wellbeingResponses = [
    {
      userId: employeeUser.id,
      mood: "4",
      workload: "3",
      support: "4",
      comment: "Good work-life balance this week. Support from the team has been great.",
      daysAgo: 5,
    },
    {
      userId: ehsUser.id,
      mood: "3",
      workload: "4",
      support: "3",
      comment: "High pressure during audit preparation. Would benefit from an extra resource.",
      daysAgo: 12,
    },
    {
      userId: safetyUser.id,
      mood: "5",
      workload: "2",
      support: "5",
      comment: "Motivating to see the improvements we have made this quarter.",
      daysAgo: 20,
    },
    {
      userId: managerUser.id,
      mood: "4",
      workload: "3",
      support: "4",
      comment: "Operations running smoothly. New safety procedures are being followed well.",
      daysAgo: 8,
    },
  ];

  for (const response of wellbeingResponses) {
    await prisma.formSubmission.create({
      data: {
        tenantId: tenant.id,
        formTemplateId: wellbeingTemplate.id,
        submittedById: response.userId,
        status: "SUBMITTED",
        signedAt: new Date(Date.now() - response.daysAgo * 24 * 60 * 60 * 1000),
        fieldValues: {
          create: [
            { fieldId: wellbeingFieldMap["How are you feeling today? (1–5)"], value: response.mood },
            { fieldId: wellbeingFieldMap["How is your current workload? (1–5)"], value: response.workload },
            { fieldId: wellbeingFieldMap["Do you feel supported by your manager and team? (1–5)"], value: response.support },
            { fieldId: wellbeingFieldMap["What would you like to share?"], value: response.comment },
          ],
        },
      },
    });
  }

  // =====================================================================
  // 5. RISK ASSESSMENTS
  // =====================================================================
  console.log("⚠️  Creating risk assessments...");

  const warehouseInspectionTemplate = await prisma.inspectionTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Quarterly Warehouse Safety Walk",
      description: "Inspect fall hazards, housekeeping, and PPE compliance in warehouse",
      category: "EHS",
      riskCategory: "SAFETY",
      checklist: {
        items: [
          { title: "Safe access to elevated areas confirmed", type: "checkbox" },
          { title: "Guardrails and fall harnesses in place", type: "checkbox" },
          { title: "Walkways and aisles clear of obstructions", type: "checkbox" },
          { title: "Forklift pedestrian separation maintained", type: "checkbox" },
          { title: "Emergency exits unobstructed and marked", type: "checkbox" },
        ],
      },
      isGlobal: false,
    },
  });

  const chemicalInspectionTemplate = await prisma.inspectionTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Chemical Storage Inspection",
      description: "Monthly inspection of chemical storage and handling areas",
      category: "CHEMICALS",
      riskCategory: "ENVIRONMENTAL",
      checklist: {
        items: [
          { title: "All containers properly labeled (GHS)", type: "checkbox" },
          { title: "PPE available and in good condition", type: "checkbox" },
          { title: "SDS current and accessible for all chemicals", type: "checkbox" },
          { title: "Secondary containment intact and empty", type: "checkbox" },
          { title: "Incompatible chemicals properly segregated", type: "checkbox" },
        ],
      },
      isGlobal: false,
    },
  });

  const noiseInspectionTemplate = await prisma.inspectionTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Noise Monitoring — Production Floor",
      description: "Quarterly noise level spot checks in production areas",
      category: "OCCUPATIONAL_HEALTH",
      riskCategory: "HEALTH",
      checklist: {
        items: [
          { title: "Hearing protection available at all entry points", type: "checkbox" },
          { title: "All employees wearing hearing protection in noise zones", type: "checkbox" },
          { title: "Noise monitoring records updated", type: "checkbox" },
        ],
      },
      isGlobal: false,
    },
  });

  // Risk 1: Falls from height
  const risk1 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Falls from Elevated Work Platforms — Warehouse Racking",
      context:
        "Employees work at heights up to 18 ft during order picking and stock replenishment. Location: Warehouse — Racking Section A and B.",
      description:
        "Work at elevation occurs multiple times daily using forklifts and order-picker equipment. Inadequate fall protection or equipment failure can result in severe injury or fatality.",
      existingControls:
        "Mandatory fall arrest harness, annual equipment inspection, OSHA fall protection training for all operators.",
      riskStatement: "A fall from height can cause life-altering injury or fatality.",
      location: "Warehouse — Racking Sections A & B",
      area: "Operations",
      linkedProcess: "Warehouse & Logistics",
      category: "SAFETY",
      likelihood: 3,
      consequence: 4,
      score: 12,
      ownerId: managerUser.id,
      status: "MITIGATING",
      controlFrequency: "QUARTERLY",
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      residualLikelihood: 2,
      residualConsequence: 3,
      residualScore: 6,
      inspectionTemplateId: warehouseInspectionTemplate.id,
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk1.id,
      title: "Install OSHA-compliant guardrails on all racking above 4 ft",
      description:
        "Design and install guardrail systems at all racking levels above 4 feet. Include self-closing gates at access points. Contractor appointed. Installation scheduled in 3 weeks.",
      status: "IN_PROGRESS",
      responsibleId: managerUser.id,
      dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      category: "MITIGATION",
      followUpFrequency: "MONTHLY",
      costEstimate: 12500,
      benefitEstimate: 45,
      effectiveness: "NOT_EVALUATED",
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk1.id,
      title: "Conduct annual fall protection competency re-evaluation",
      description:
        "All operators working at elevation to complete annual hands-on fall protection competency check including harness inspection, anchor point identification, and emergency descent.",
      status: "DONE",
      responsibleId: ehsUser.id,
      dueAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      category: "PREVENTIVE",
      followUpFrequency: "ANNUAL",
      costEstimate: 3200,
      benefitEstimate: 25,
      effectiveness: "EFFECTIVE",
      effectivenessNote: "All 12 operators passed competency check. Near-miss frequency reduced by 60%.",
    },
  });

  // Risk 2: Chemical exposure
  const risk2 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Chemical Exposure — Concentrated Cleaning Agents",
      context:
        "Exposure to concentrated alkaline cleaners and solvents during daily facility maintenance. Location: Maintenance Room and Cleaning Stations.",
      description:
        "Strong alkalis (pH >12) and chlorinated solvents are used daily without adequate local exhaust ventilation. Secondary container labeling non-compliant with HazCom 2012.",
      existingControls:
        "Nitrile gloves and safety glasses required. SDS binder in maintenance room. Basic HazCom training completed.",
      riskStatement: "Skin burns, eye damage, or respiratory injury from spill or vapor inhalation.",
      location: "Maintenance Room / Cleaning Stations",
      area: "Facilities",
      linkedProcess: "Facility Maintenance & Housekeeping",
      category: "ENVIRONMENTAL",
      likelihood: 2,
      consequence: 3,
      score: 6,
      ownerId: ehsUser.id,
      status: "MITIGATING",
      controlFrequency: "MONTHLY",
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      residualLikelihood: 1,
      residualConsequence: 2,
      residualScore: 2,
      inspectionTemplateId: chemicalInspectionTemplate.id,
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk2.id,
      title: "Install local exhaust ventilation in maintenance room",
      description:
        "Engage HVAC contractor to install local exhaust ventilation (LEV) at chemical mixing station. Minimum 10 air changes per hour required. Quotations received.",
      status: "PENDING",
      responsibleId: managerUser.id,
      dueAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      category: "MITIGATION",
      followUpFrequency: "MONTHLY",
      costEstimate: 9800,
      benefitEstimate: 35,
      effectiveness: "NOT_EVALUATED",
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk2.id,
      title: "Update HazCom training to cover secondary container labeling",
      description:
        "Revise annual HazCom training curriculum to specifically address GHS secondary container labeling requirements. Provide pre-labeled spray bottles to eliminate unlabeled transfers.",
      status: "DONE",
      responsibleId: ehsUser.id,
      dueAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      category: "PREVENTIVE",
      followUpFrequency: "ANNUAL",
      costEstimate: 1500,
      benefitEstimate: 20,
      effectiveness: "EFFECTIVE",
      effectivenessNote: "No unlabeled containers found during last two monthly inspections.",
    },
  });

  // Risk 3: Ergonomic strain
  const risk3 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Musculoskeletal Disorders — Prolonged Computer Work",
      context:
        "Office employees are seated for over 7 hours daily. Several employees have reported neck and lower back discomfort. Location: Office Wing, 2nd floor.",
      description:
        "Static posture, inadequate monitor positioning, and lack of structured micro-breaks contribute to musculoskeletal strain. 3 injury reports linked to ergonomic issues in past 12 months.",
      existingControls: "Height-adjustable desks provided. Break reminder app available but not enforced.",
      riskStatement: "Musculoskeletal disorders leading to sick leave and reduced productivity.",
      location: "Office Wing — 2nd Floor",
      area: "Administration",
      linkedProcess: "Office & Administrative Work",
      category: "HEALTH",
      likelihood: 3,
      consequence: 2,
      score: 6,
      ownerId: managerUser.id,
      status: "MITIGATING",
      controlFrequency: "ANNUAL",
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      residualLikelihood: 2,
      residualConsequence: 2,
      residualScore: 4,
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk3.id,
      title: "Conduct individual ergonomic workstation assessments",
      description:
        "Certified ergonomist to assess all 18 office workstations. Implement recommendations including monitor arms, ergonomic chairs, footrests, and keyboard trays as needed.",
      status: "IN_PROGRESS",
      responsibleId: ehsUser.id,
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: "IMPROVEMENT",
      followUpFrequency: "ANNUAL",
      costEstimate: 7500,
      benefitEstimate: 30,
      effectiveness: "NOT_EVALUATED",
    },
  });

  // Risk 4: Electrical fire
  const risk4 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Electrical Fire — Aging Switchgear in Production Hall B",
      context:
        "Switchgear and distribution panels in Production Hall B are original 1987 installation. Several panels lack thermal monitoring. Location: Production Hall B, electrical room.",
      description:
        "Aging electrical infrastructure without thermal imaging protection. One panel shows intermittent fault indication. Insurance requires upgrade by end of year.",
      existingControls: "Annual electrical inspection, thermographic survey, automatic fire suppression in electrical room.",
      riskStatement: "Electrical fault causing fire and extended production shutdown.",
      location: "Production Hall B — Electrical Room",
      area: "Production",
      linkedProcess: "Production & Manufacturing",
      category: "SAFETY",
      likelihood: 2,
      consequence: 5,
      score: 10,
      ownerId: ehsUser.id,
      status: "OPEN",
      controlFrequency: "ANNUAL",
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      residualLikelihood: 1,
      residualConsequence: 3,
      residualScore: 3,
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk4.id,
      title: "Replace aging switchgear — Production Hall B",
      description:
        "Engage licensed electrical contractor to replace all panels built before 1995 in Production Hall B. Include arc flash labeling and permanent thermal monitoring sensors. Capital project approved.",
      status: "PENDING",
      responsibleId: adminUser.id,
      dueAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      category: "MITIGATION",
      followUpFrequency: "MONTHLY",
      costEstimate: 85000,
      benefitEstimate: 60,
      effectiveness: "NOT_EVALUATED",
    },
  });

  // Risk 5: Noise exposure
  const risk5 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Noise-Induced Hearing Loss — Production Floor",
      context:
        "Compressors, stamping machines, and conveyor systems generate sustained noise levels above OSHA PEL. Location: Production Floor — all areas.",
      description:
        "Noise dosimetry shows average TWA of 88 dB(A) in stamping area, exceeding OSHA 85 dB(A) action level. Hearing conservation program enrollment at 70%.",
      existingControls:
        "Hearing protection available at all entry points. Annual audiometric testing. Posted noise zone signage.",
      riskStatement: "Permanent hearing loss from chronic noise exposure exceeding OSHA PEL.",
      location: "Production Floor — Stamping & Compressor Areas",
      area: "Production",
      linkedProcess: "Manufacturing Operations",
      category: "HEALTH",
      likelihood: 3,
      consequence: 3,
      score: 9,
      ownerId: ehsUser.id,
      status: "MITIGATING",
      controlFrequency: "QUARTERLY",
      nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      residualLikelihood: 2,
      residualConsequence: 2,
      residualScore: 4,
      inspectionTemplateId: noiseInspectionTemplate.id,
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk5.id,
      title: "Install acoustic enclosures around compressors",
      description:
        "Engineer acoustic enclosures for the 3 main compressors to reduce noise at source. Target reduction of 8 dB(A) at operator positions. Engineering design in progress.",
      status: "IN_PROGRESS",
      responsibleId: managerUser.id,
      dueAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      category: "MITIGATION",
      followUpFrequency: "MONTHLY",
      costEstimate: 28000,
      benefitEstimate: 40,
      effectiveness: "NOT_EVALUATED",
    },
  });

  await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk5.id,
      title: "Achieve 100% hearing conservation program enrollment",
      description:
        "Enroll all employees with TWA > 85 dB(A) in the hearing conservation program. Include audiometric baseline tests for all new hires in noise-exposed roles.",
      status: "IN_PROGRESS",
      responsibleId: ehsUser.id,
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: "PREVENTIVE",
      followUpFrequency: "QUARTERLY",
      costEstimate: 4200,
      benefitEstimate: 35,
      effectiveness: "PARTIALLY_EFFECTIVE",
      effectivenessNote: "Enrollment now at 85%, up from 70% last quarter.",
    },
  });

  console.log(`   ✅ 5 risk assessments created with corrective measures`);

  const prodNetworkAsset = await prisma.securityAsset.create({
    data: {
      tenantId: tenant.id,
      name: "Production Network (OT/IT)",
      description: "Firewall and switching infrastructure protecting the production environment",
      type: "INFRASTRUCTURE",
      ownerId: ehsUser.id,
      confidentiality: "HIGH",
      integrity: "HIGH",
      availability: "HIGH",
      businessCriticality: 5,
    },
  });

  const siemControl = await prisma.securityControl.create({
    data: {
      tenantId: tenant.id,
      code: "A.8.24",
      title: "Security Event Logging and Monitoring",
      annexReference: "Annex A 8.24",
      requirement: "Security event logs shall be established and reviewed regularly.",
      category: "TECHNICAL",
      status: "LIVE",
      maturity: "DEFINED",
      ownerId: ehsUser.id,
      linkedAssetId: prodNetworkAsset.id,
      linkedRiskId: risk4.id,
      implementationNote: "SIEM correlates events from firewall, AD, and production systems. Alerts route to on-call engineer.",
      monitoring: "Operations team reviews alerts daily. Weekly summary report to EHS.",
      lastTestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.securityControlDocument.create({
    data: {
      tenantId: tenant.id,
      controlId: siemControl.id,
      documentId: documents[2].id,
      note: "Reference to Fire Emergency Plan and electrical procedures",
    },
  });

  await prisma.securityEvidence.create({
    data: {
      tenantId: tenant.id,
      controlId: siemControl.id,
      title: "SIEM Monthly Summary — March",
      description: "Review shows all incident responses completed within SLA. No open security deviations.",
      collectedById: ehsUser.id,
      reviewResult: "Compliant",
    },
  });

  const endpointAsset = await prisma.securityAsset.create({
    data: {
      tenantId: tenant.id,
      name: "Company Laptops (Fleet of 140)",
      description: "Employee laptop fleet containing sensitive customer and operational data.",
      type: "PEOPLE",
      ownerId: managerUser.id,
      confidentiality: "HIGH",
      integrity: "MEDIUM",
      availability: "MEDIUM",
      businessCriticality: 4,
    },
  });

  const mfaControl = await prisma.securityControl.create({
    data: {
      tenantId: tenant.id,
      code: "A.6.7",
      title: "MFA for All Privileged Users",
      annexReference: "Annex A 6.7",
      requirement: "Administrator access shall be secured with multi-factor authentication.",
      category: "ORGANIZATIONAL",
      status: "IMPLEMENTED",
      maturity: "MANAGED",
      ownerId: ehsUser.id,
      linkedAssetId: endpointAsset.id,
      implementationNote: "All admin access via Azure AD Conditional Access with PIM just-in-time activation.",
      monitoring: "Azure sign-in reports reviewed monthly for anomalies.",
      lastTestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.securityEvidence.create({
    data: {
      tenantId: tenant.id,
      controlId: mfaControl.id,
      title: "PIM Access Log — Q2",
      description: "Review shows 0 unauthorized activations. All privileged roles have MFA enforced.",
      collectedById: ehsUser.id,
      reviewResult: "No findings",
    },
  });

  const sapAccessReview = await prisma.accessReview.create({
    data: {
      tenantId: tenant.id,
      title: "Semi-Annual SAP Access Review",
      systemName: "SAP ERP",
      scope: "Operations and Finance roles",
      status: "PLANNED",
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      ownerId: managerUser.id,
    },
  });

  await prisma.accessReviewEntry.createMany({
    data: [
      {
        tenantId: tenant.id,
        reviewId: sapAccessReview.id,
        userName: managerUser.name ?? "Operations Manager",
        userEmail: managerUser.email,
        role: "Finance Approver",
        decision: "REVIEW",
      },
      {
        tenantId: tenant.id,
        reviewId: sapAccessReview.id,
        userName: "Former Employee",
        userEmail: "former.employee@apexindustrial.com",
        role: "SAP Power User",
        decision: "REVOKED",
        comment: "Employee departed last quarter",
        decidedById: managerUser.id,
        decidedAt: new Date(),
      },
    ],
  });

  const adReview = await prisma.accessReview.create({
    data: {
      tenantId: tenant.id,
      title: "Quarterly Active Directory Access Review",
      systemName: "Active Directory",
      scope: "Domain Admins and Helpdesk roles",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      ownerId: ehsUser.id,
    },
  });

  await prisma.accessReviewEntry.createMany({
    data: [
      {
        tenantId: tenant.id,
        reviewId: adReview.id,
        userName: "External Consultant",
        userEmail: "consulting@techpartner.com",
        role: "Domain Admin",
        decision: "REVOKED",
        comment: "Project ended — access no longer required",
        decidedById: ehsUser.id,
        decidedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        reviewId: adReview.id,
        userName: "Production Supervisor",
        userEmail: "prod.supervisor@apexindustrial.com",
        role: "Helpdesk Admin",
        decision: "APPROVED",
        comment: "Access confirmed by department head",
        decidedById: managerUser.id,
        decidedAt: new Date(),
      },
    ],
  });

  await prisma.riskControl.createMany({
    data: [
      {
        tenantId: tenant.id,
        riskId: risk1.id,
        title: "Pre-shift elevated platform inspection",
        description: "Warehouse supervisor verifies all racking, lifts, and walkways are safe before each shift start.",
        controlType: "PREVENTIVE",
        ownerId: managerUser.id,
        status: "ACTIVE",
        effectiveness: "EFFECTIVE",
        frequency: "WEEKLY",
        monitoringMethod: "Signed checklist in EHS Nova field app",
        evidenceDocumentId: documents[3]?.id,
      },
      {
        tenantId: tenant.id,
        riskId: risk2.id,
        title: "Monthly chemical storage inspection",
        controlType: "PREVENTIVE",
        ownerId: ehsUser.id,
        status: "ACTIVE",
        effectiveness: "PARTIAL",
        frequency: "MONTHLY",
        monitoringMethod: "Chemical inspection checklist — 15 point",
      },
      {
        tenantId: tenant.id,
        riskId: risk4.id,
        title: "Annual thermographic survey of electrical panels",
        controlType: "DETECTIVE",
        ownerId: ehsUser.id,
        status: "NEEDS_IMPROVEMENT",
        effectiveness: "NOT_TESTED",
        frequency: "ANNUAL",
        monitoringMethod: "Licensed thermography contractor",
      },
      {
        tenantId: tenant.id,
        riskId: risk5.id,
        title: "Quarterly noise level spot checks",
        controlType: "DETECTIVE",
        ownerId: ehsUser.id,
        status: "ACTIVE",
        effectiveness: "EFFECTIVE",
        frequency: "QUARTERLY",
        monitoringMethod: "Calibrated sound level meter — 10 fixed measurement points",
      },
    ],
  });

  await prisma.riskDocumentLink.createMany({
    data: [
      {
        tenantId: tenant.id,
        riskId: risk1.id,
        documentId: documents[0].id,
        relation: "PROCEDURE",
        note: "See EHS Handbook Chapter 4 — Working at Heights",
      },
      {
        tenantId: tenant.id,
        riskId: risk1.id,
        documentId: documents[3].id,
        relation: "PROCEDURE",
        note: "Working at Heights Safe Work Procedure — primary reference",
      },
      {
        tenantId: tenant.id,
        riskId: risk4.id,
        documentId: documents[2].id,
        relation: "SUPPORTING",
        note: "Fire Emergency Plan covers response to electrical fire scenarios",
      },
    ],
  });

  // =====================================================================
  // 6. INCIDENTS & DEVIATIONS
  // =====================================================================
  console.log("🚨 Creating incidents and deviations...");

  const incidents = await Promise.all([
    // Incident 1: Recordable injury with complete 5-Why
    prisma.incident.create({
      data: {
        tenantId: tenant.id,
        title: "Recordable Injury: Laceration — Press Machine #3 Tooling Change",
        type: "SKADE",
        severity: 3,
        description:
          "Employee sustained a 3-cm laceration to the right index finger while performing a scheduled tooling change on Press Machine #3. Employee was not wearing cut-resistant gloves at the time of injury. Wound required 2 sutures at occupational health clinic.",
        location: "Production Floor — Press Machine #3",
        reportedBy: employeeUser.id,
        responsibleId: ehsUser.id,
        investigatedBy: ehsUser.id,
        immediateAction:
          "First aid applied immediately. Employee transported to occupational health clinic. Machine #3 tagged out of service pending investigation. Area secured and witnesses identified.",
        rootCause:
          "5-Why Root Cause Analysis:\n" +
          "WHY 1: Employee cut finger → Sharp tooling edge contacted bare right hand.\n" +
          "WHY 2: Bare hand exposed → Employee not wearing cut-resistant gloves.\n" +
          "WHY 3: Gloves not worn → Employee perceived cut-resistant gloves reduced dexterity for fine tooling work.\n" +
          "WHY 4: No enforcement → The JSA (Job Safety Analysis) for tooling changes did not specify mandatory cut-resistant gloves.\n" +
          "WHY 5: JSA not updated → JSA revision cycle did not trigger after press equipment upgrade 18 months ago.\n\n" +
          "Root cause: Inadequate JSA maintenance process — JSA not reviewed following equipment change.",
        lessonsLearned:
          "1. JSA for all tooling changes updated to mandate Level A4 cut-resistant gloves.\n" +
          "2. New ergonomic cut-resistant gloves (ANSI A4) issued to all production employees — reduces dexterity concern.\n" +
          "3. Toolbox talk conducted for all 22 production employees.\n" +
          "4. JSA review triggered automatically on equipment change (new procedure implemented).\n" +
          "5. PPE compliance added to weekly supervisor safety observation checklist.",
        effectivenessReview:
          "Follow-up inspection after 30 days confirmed 100% glove compliance during tooling changes. No repeat incidents in 45 days.",
        status: "CLOSED",
        stage: "VERIFIED",
        closedBy: ehsUser.id,
        closedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        occurredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        investigatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        injuryType: "Laceration — right index finger, 3 cm",
        medicalAttentionRequired: true,
        lostTimeMinutes: 120,
        riskReferenceId: risk1.id,
      },
    }),

    // Incident 2: Near-miss with forklift
    prisma.incident.create({
      data: {
        tenantId: tenant.id,
        title: "Near-Miss: Forklift–Pedestrian Conflict — Warehouse Bay 3",
        type: "NESTEN",
        severity: 4,
        description:
          "Forklift operator traveling at normal operating speed rounded the blind corner at Bay 3 intersection and narrowly avoided striking a maintenance employee who stepped into the travel lane without looking. No contact was made. The pedestrian had to jump backward to avoid being struck. Incident had high injury potential.",
        location: "Warehouse — Bay 3 Intersection",
        reportedBy: managerUser.id,
        responsibleId: ehsUser.id,
        investigatedBy: ehsUser.id,
        immediateAction:
          "Work stopped in Bay 3. Area cordoned off. All forklift operators briefed on pedestrian separation requirements. Temporary speed limit signs installed at blind corners.",
        rootCause:
          "5-Why Root Cause Analysis:\n" +
          "WHY 1: Near-collision → Forklift and pedestrian shared same intersection simultaneously.\n" +
          "WHY 2: Sharing path → No physical barrier or designated pedestrian walkway at Bay 3 intersection.\n" +
          "WHY 3: No barrier → Warehouse layout changed during expansion but traffic management plan not updated.\n" +
          "WHY 4: Plan not updated → No change management process requiring traffic plan review for layout modifications.\n" +
          "WHY 5: No process → Traffic management plan maintenance not assigned to a responsible owner.\n\n" +
          "Root cause: Missing ownership and review process for warehouse traffic management plan.",
        lessonsLearned:
          "1. Physical pedestrian barriers (Armco barriers) installed at all blind corners — completed within 5 days.\n" +
          "2. Yellow-painted pedestrian walkways marked throughout warehouse.\n" +
          "3. Forklift speed limit reduced to 3 mph in shared zones.\n" +
          "4. Traffic management plan assigned to EHS Manager for annual review.\n" +
          "5. All forklift operators and warehouse employees retrained on pedestrian separation protocol.",
        status: "CLOSED",
        stage: "VERIFIED",
        closedBy: ehsUser.id,
        closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        occurredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        investigatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        medicalAttentionRequired: false,
        riskReferenceId: risk1.id,
      },
    }),

    // Incident 3: Chemical deviation — GHS labeling
    prisma.incident.create({
      data: {
        tenantId: tenant.id,
        title: "Deviation: Unlabeled Chemical Container — Maintenance Room",
        type: "AVVIK",
        severity: 3,
        description:
          "Safety representative discovered an unlabeled 1-liter spray bottle containing concentrated cleaning solution in the maintenance room. Container had no GHS label, product name, or hazard information. HazCom 2012 violation.",
        location: "Maintenance Room — Chemical Station",
        reportedBy: safetyUser.id,
        responsibleId: ehsUser.id,
        investigatedBy: ehsUser.id,
        immediateAction:
          "Unlabeled container immediately removed from use and quarantined. Chemical identified via SDS binder. Correctly labeled container issued as replacement. All maintenance staff verbally briefed.",
        rootCause:
          "5-Why Root Cause Analysis:\n" +
          "WHY 1: Unlabeled container in active use → Cleaning concentrate transferred to spray bottle without GHS label.\n" +
          "WHY 2: No label applied → Maintenance technician was unaware of secondary container labeling requirement.\n" +
          "WHY 3: Unaware of requirement → HazCom training curriculum did not specifically cover secondary container labeling.\n" +
          "WHY 4: Not in curriculum → Training material was developed pre-HazCom 2012 and not fully updated.\n" +
          "WHY 5: Curriculum outdated → No annual review process for EHS training content.\n\n" +
          "Root cause: HazCom training curriculum not maintained to current regulatory requirements.",
        lessonsLearned:
          "1. HazCom training revised to include specific module on secondary container labeling with hands-on exercise.\n" +
          "2. Pre-labeled spray bottles (GHS compliant) placed at all chemical stations — eliminates unlabeled transfers.\n" +
          "3. HazCom secondary container labeling added to monthly chemical storage inspection checklist.\n" +
          "4. Annual training content review process established — assigned to EHS Manager.",
        effectivenessReview:
          "Two subsequent monthly inspections found zero unlabeled containers. Training revision completed and all maintenance staff retested.",
        status: "CLOSED",
        stage: "VERIFIED",
        closedBy: ehsUser.id,
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        occurredAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        investigatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        medicalAttentionRequired: false,
        riskReferenceId: risk2.id,
      },
    }),

    // Incident 4: Near-miss still under investigation
    prisma.incident.create({
      data: {
        tenantId: tenant.id,
        title: "Near-Miss: Employee Slip on Wet Floor — Production Entry",
        type: "NESTEN",
        severity: 2,
        description:
          "Employee slipped on wet floor at the production hall entry during a rain event. Managed to recover without falling. Wet floor sign was present but floor drain was blocked.",
        location: "Production Hall Entry — Main Door",
        reportedBy: employeeUser.id,
        responsibleId: ehsUser.id,
        immediateAction:
          "Area cleaned immediately. Blocked drain cleared. Additional anti-slip mats placed at entry. Investigation initiated.",
        status: "INVESTIGATING",
        stage: "UNDER_REVIEW",
        occurredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        medicalAttentionRequired: false,
        riskReferenceId: risk1.id,
      },
    }),

    // Incident 5: Customer complaint
    prisma.incident.create({
      data: {
        tenantId: tenant.id,
        title: "Customer Complaint: Delayed Service Visit — Rocky Mountain Energy",
        type: "CUSTOMER",
        severity: 3,
        description:
          "Customer Rocky Mountain Energy Corp. reported a 2-week delay on a scheduled preventive maintenance service visit. Delay caused an unplanned production stoppage of 4 hours at the customer's facility. Customer is requesting root cause analysis and compensation.",
        location: "Customer Site — Rocky Mountain Energy Corp., Denver CO",
        reportedBy: managerUser.id,
        responsibleId: ehsUser.id,
        occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        stage: "REPORTED",
        customerName: "Rocky Mountain Energy Corp.",
        customerEmail: "procurement@rmenergy.com",
        customerPhone: "303-555-0144",
        customerTicketId: "CRM-2025-218",
        responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        customerSatisfaction: 1,
      },
    }),
  ]);

  console.log(`   ✅ ${incidents.length} incidents and deviations created`);

  await prisma.customerFeedback.createMany({
    data: [
      {
        tenantId: tenant.id,
        recordedById: ehsUser.id,
        customerName: "Amanda Clarke",
        customerCompany: "Summit Construction LLC",
        contactEmail: "a.clarke@summitconstruction.com",
        source: "MEETING",
        sentiment: "POSITIVE",
        rating: 5,
        summary: "Praises EHS team response time and follow-through on corrective actions",
        details:
          "Summit Construction highlighted that EHS Nova provided immediate response during a critical safety incident and ensured all corrective actions were completed and verified on schedule. They specifically called out the digital tracking as a differentiator.",
        highlights: "Requested to be included as a customer reference. Suitable for case study.",
        followUpStatus: "SHARED",
        followUpOwnerId: managerUser.id,
        feedbackDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant.id,
        recordedById: managerUser.id,
        customerName: "Brian Olsen",
        customerCompany: "Glacier Peak Industries",
        contactPhone: "720-555-0177",
        source: "SURVEY",
        sentiment: "POSITIVE",
        rating: 4,
        summary: "Satisfied with safety inspection process and documentation",
        details:
          "Customer noted that photo documentation and action item list were shared the same day as the safety inspection. Requests closer coordination before next scheduled inspection in June.",
        highlights: "Suggested publishing results in shared portal and including in safety briefing.",
        followUpStatus: "FOLLOW_UP",
        followUpOwnerId: ehsUser.id,
        feedbackDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant.id,
        recordedById: adminUser.id,
        customerName: "Patricia Webb",
        customerCompany: "Colorado Fabrication Co.",
        contactEmail: "p.webb@cofab.com",
        source: "EMAIL",
        sentiment: "NEUTRAL",
        rating: 3,
        summary: "Satisfied overall but wants faster incident report turnaround",
        details:
          "Service and product quality good. Would like incident investigation reports delivered within 5 business days instead of current average of 8 days.",
        followUpStatus: "FOLLOW_UP",
        followUpOwnerId: ehsUser.id,
        feedbackDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Customer feedback records created");

  // =====================================================================
  // 7. TRAINING & COMPETENCE MATRIX
  // =====================================================================
  console.log("🎓 Creating training and competence records...");

  // Sarah Mitchell (Admin/CEO)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: adminUser.id,
      courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
      provider: "Denver Fire Department", description: "Annual fire safety training including practical extinguisher exercise.",
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000), isRequired: true,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: adminUser.id,
      courseKey: "ehs-induction", title: "EHS Induction",
      provider: "EHS Nova", description: "Company EHS policies, hazard reporting, emergency procedures, and OSHA rights.",
      completedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  // Michael Torres (EHS Manager)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: ehsUser.id,
      courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
      provider: "Denver Fire Department", description: "Annual fire safety training including practical extinguisher exercise.",
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000), isRequired: true,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: ehsUser.id,
      courseKey: "osha-30", title: "OSHA 30-Hour General Industry",
      provider: "OSHA", description: "Advanced 30-hour training for EHS professionals covering all major OSHA standards.",
      completedAt: new Date(Date.now() - 550 * 24 * 60 * 60 * 1000),
      isRequired: false,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: ehsUser.id,
      courseKey: "working-at-height", title: "Working at Heights Certification",
      provider: "Fall Protection Training Institute", description: "Competent person training for working at heights including fall arrest, scaffolding inspection.",
      completedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 895 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: ehsUser.id,
      courseKey: "chemical-handling", title: "HazCom 2012 — Hazardous Chemical Handling",
      provider: "EHS Nova", description: "GHS labeling system, SDS interpretation, secondary container requirements, chemical PPE selection.",
      completedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 915 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  // Jennifer Walker (Operations Manager)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: managerUser.id,
      courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
      provider: "Denver Fire Department", description: "Annual fire safety training including practical extinguisher exercise.",
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000), isRequired: true,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: managerUser.id,
      courseKey: "first-aid", title: "First Aid / CPR / AED",
      provider: "American Red Cross", description: "Basic first aid, CPR, and AED operation. 2-year certification.",
      completedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 430 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: managerUser.id,
      courseKey: "osha-10", title: "OSHA 10-Hour General Industry",
      provider: "OSHA", description: "OSHA 10-hour general industry outreach training covering common workplace hazards.",
      completedAt: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000),
      isRequired: false,
    },
  });

  // David Chen (Safety Representative)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: safetyUser.id,
      courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
      provider: "Denver Fire Department", description: "Annual fire safety training including practical extinguisher exercise.",
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000), isRequired: true,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: safetyUser.id,
      courseKey: "ehs-induction", title: "EHS Induction",
      provider: "EHS Nova", description: "Company EHS policies, hazard reporting, emergency procedures, and OSHA rights.",
      completedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  // First aid EXPIRED — important for showing competence gaps
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: safetyUser.id,
      courseKey: "first-aid", title: "First Aid / CPR / AED",
      provider: "American Red Cross", description: "Basic first aid and CPR. EXPIRED — renewal required.",
      completedAt: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // EXPIRED
      isRequired: false,
    },
  });

  // Thomas Brown (Employee)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: employeeUser.id,
      courseKey: "ehs-induction", title: "EHS Induction",
      provider: "EHS Nova", description: "Company EHS policies, hazard reporting, emergency procedures, and OSHA rights.",
      completedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: employeeUser.id,
      courseKey: "working-at-height", title: "Working at Heights Certification",
      provider: "Fall Protection Training Institute", description: "Hands-on fall arrest, harness inspection, and rescue procedures.",
      completedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 995 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: employeeUser.id,
      courseKey: "forklift", title: "Powered Industrial Truck (Forklift) Operator Certification",
      provider: "OSHA-Authorized Trainer", description: "OSHA 29 CFR 1910.178 compliant forklift certification — sit-down counterbalance.",
      completedAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 845 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: employeeUser.id,
      courseKey: "lockout-tagout", title: "Lockout/Tagout (LOTO) — Authorized Employee",
      provider: "EHS Nova", description: "Control of hazardous energy — 29 CFR 1910.147. Hands-on demonstration required.",
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 1005 * 24 * 60 * 60 * 1000), isRequired: false,
    },
  });

  // Fire safety NOT completed yet — shows upcoming requirement
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: employeeUser.id,
      courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
      provider: "Denver Fire Department", description: "Annual fire safety training — SCHEDULED but not yet completed.",
      isRequired: true, // Required but no completedAt = overdue
    },
  });

  // Carol Davis (OHS Provider)
  if (ohsUser) {
    await prisma.training.create({
      data: {
        tenantId: tenant.id, userId: ohsUser.id,
        courseKey: "fire-safety", title: "Fire Safety & Prevention Training 2025",
        provider: "Denver Fire Department", description: "Annual fire safety training including practical extinguisher exercise.",
        completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000), isRequired: true,
      },
    });

    await prisma.training.create({
      data: {
        tenantId: tenant.id, userId: ohsUser.id,
        courseKey: "first-aid", title: "First Aid / CPR / AED",
        provider: "American Red Cross", description: "Basic first aid, CPR, and AED operation.",
        completedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 680 * 24 * 60 * 60 * 1000), isRequired: false,
      },
    });
  }

  // Robert White (Auditor)
  await prisma.training.create({
    data: {
      tenantId: tenant.id, userId: auditorUser.id,
      courseKey: "ehs-induction", title: "EHS Induction",
      provider: "EHS Nova", description: "Company EHS policies and auditor-specific orientation.",
      completedAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  console.log(`   ✅ Comprehensive training and competence matrix created`);


  // =====================================================================
  // 8. EHS GOALS & KPIs
  // =====================================================================
  console.log("🎯 Creating EHS goals and KPIs...");

  const goals = await Promise.all([
    prisma.goal.create({
      data: {
        tenantId: tenant.id,
        title: "Complete 100% of scheduled safety walks on time",
        description: "All planned quarterly safety walks shall be completed within the scheduled week.",
        category: "HMS",
        targetValue: 100,
        currentValue: 75,
        unit: "%",
        year: new Date().getFullYear(),
        ownerId: ehsUser.id,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    }),
    prisma.goal.create({
      data: {
        tenantId: tenant.id,
        title: "Reduce absenteeism rate to below 3.5%",
        description: "Reduce workplace absenteeism through targeted preventive health and ergonomic programs.",
        category: "HMS",
        targetValue: 3.5,
        currentValue: 5.1,
        unit: "%",
        year: new Date().getFullYear(),
        ownerId: managerUser.id,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    }),
    prisma.goal.create({
      data: {
        tenantId: tenant.id,
        title: "Achieve zero recordable injuries in Q1",
        description: "Target zero OSHA recordable injuries in Q1 through PPE compliance and JSA improvements.",
        category: "HMS",
        targetValue: 0,
        currentValue: 1,
        unit: "incidents",
        year: new Date().getFullYear(),
        quarter: 1,
        ownerId: ehsUser.id,
        deadline: new Date(`${new Date().getFullYear()}-03-31`),
        status: "AT_RISK",
      },
    }),
    prisma.goal.create({
      data: {
        tenantId: tenant.id,
        title: "Complete EHS training matrix to 95% compliance",
        description: "Ensure 95% of employees have all required EHS training current and valid.",
        category: "HMS",
        targetValue: 95,
        currentValue: 81,
        unit: "%",
        year: new Date().getFullYear(),
        ownerId: ehsUser.id,
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    }),
  ]);

  // Add KPI measurements to goals
  await prisma.kpiMeasurement.create({
    data: {
      goalId: goals[0].id, tenantId: tenant.id, value: 75,
      measurementDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      measurementType: "MANUAL", measuredById: ehsUser.id,
      comment: "Q4: 3 of 4 scheduled safety walks completed. One postponed due to staffing shortage.",
    },
  });

  await prisma.kpiMeasurement.create({
    data: {
      goalId: goals[1].id, tenantId: tenant.id, value: 5.1,
      measurementDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      measurementType: "MANUAL", measuredById: managerUser.id,
      comment: "Q4 absenteeism: 5.1% — ergonomic workstation assessments expected to contribute to reduction.",
    },
  });

  await prisma.kpiMeasurement.create({
    data: {
      goalId: goals[3].id, tenantId: tenant.id, value: 81,
      measurementDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      measurementType: "MANUAL", measuredById: ehsUser.id,
      comment: "Current training compliance: 81%. Main gaps: Thomas Brown (fire safety), David Chen (first aid renewal).",
    },
  });

  console.log(`   ✅ ${goals.length} EHS goals created with KPI measurements`);

  // =====================================================================
  // 9b. ENVIRONMENTAL ASPECTS & MEASUREMENTS
  // =====================================================================
  console.log("🌿 Creating environmental aspects...");

  const demoEnergyAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "Energy Consumption — Office Wing",
      description: "Electricity consumption from HVAC, lighting, and server room in the office wing.",
      process: "Office Operations",
      location: "Office Building",
      category: "ENERGY",
      impactType: "NEGATIVE",
      severity: 3,
      likelihood: 4,
      significanceScore: 12,
      legalRequirement: "EPA Energy Star Program / DOE EERE Building Standards",
      controlMeasures: "Motion sensors, night-mode HVAC scheduling, LED lighting retrofit.",
      monitoringMethod: "Automated smart meter",
      monitoringFrequency: "MONTHLY",
      ownerId: ehsUser.id,
      goalId: goals[0]?.id,
      status: "ACTIVE",
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lastMeasurementDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  });

  const demoWasteAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "Hazardous Waste Segregation — Maintenance Shop",
      description: "Spent solvents, aerosols, and oil-saturated absorbents generated during equipment maintenance.",
      process: "Maintenance",
      location: "Maintenance Shop",
      category: "WASTE",
      impactType: "NEGATIVE",
      severity: 5,
      likelihood: 3,
      significanceScore: 15,
      legalRequirement: "RCRA — 40 CFR Part 262 (Small Quantity Generator Requirements)",
      controlMeasures: "Labeled drums per EPA requirements, locked storage, licensed disposal vendor (Clean Harbors).",
      monitoringMethod: "Monthly inventory log and disposal manifest",
      monitoringFrequency: "MONTHLY",
      ownerId: managerUser.id,
      goalId: goals[1]?.id,
      status: "MONITORED",
      nextReviewDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    },
  });

  const demoEmissionAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "NOx Emissions — Backup Generator",
      description: "NOx and particulate emissions from diesel backup generator during test runs and grid outages.",
      process: "Facilities / IT Operations",
      location: "Data Center — Generator Room",
      category: "EMISSIONS",
      impactType: "NEGATIVE",
      severity: 4,
      likelihood: 2,
      significanceScore: 8,
      legalRequirement: "EPA 40 CFR Part 63 Subpart ZZZZ — Stationary Reciprocating Internal Combustion Engines",
      controlMeasures: "Controlled test-run schedule, diesel oxidation catalyst, service contract with OEM.",
      monitoringMethod: "Emissions sensor + generator run log",
      monitoringFrequency: "QUARTERLY",
      ownerId: ehsUser.id,
      status: "ACTIVE",
      nextReviewDate: addMonths(new Date(), 6),
    },
  });

  const demoWaterAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "Stormwater Runoff — Parking and Loading Dock",
      description: "Risk of petroleum hydrocarbons and suspended solids in stormwater runoff from parking area and loading dock.",
      process: "Facilities Management",
      location: "Exterior — Parking & Loading Dock",
      category: "WATER",
      impactType: "NEGATIVE",
      severity: 3,
      likelihood: 2,
      significanceScore: 6,
      legalRequirement: "EPA NPDES General Permit for Stormwater (Multi-Sector General Permit)",
      controlMeasures: "Oil/water separator, spill kit at loading dock, annual stormwater inspection.",
      monitoringMethod: "Annual visual inspection + quarterly spill response drill",
      monitoringFrequency: "QUARTERLY",
      ownerId: ehsUser.id,
      status: "ACTIVE",
      nextReviewDate: addMonths(new Date(), 9),
    },
  });

  await prisma.environmentalMeasurement.create({
    data: {
      tenantId: tenant.id, aspectId: demoEnergyAspect.id,
      parameter: "kWh per month", unit: "kWh", method: "Smart meter (AMI)",
      limitValue: 25000, targetValue: 22000, measuredValue: 23500,
      measurementDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: "WARNING", responsibleId: ehsUser.id,
      notes: "Elevated due to cold snap — additional heating load. Below limit but above target.",
    },
  });

  await prisma.environmentalMeasurement.create({
    data: {
      tenantId: tenant.id, aspectId: demoEmissionAspect.id,
      parameter: "NOx (mg/Nm3)", unit: "mg/Nm3", method: "Continuous emissions sensor",
      limitValue: 980, targetValue: 750, measuredValue: 720,
      measurementDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "COMPLIANT", responsibleId: managerUser.id,
      notes: "Within limit after catalytic converter service.",
    },
  });

  await prisma.environmentalMeasurement.create({
    data: {
      tenantId: tenant.id, aspectId: demoWasteAspect.id,
      parameter: "Hazardous waste generated", unit: "kg", method: "Weight at disposal / manifest",
      limitValue: 400, targetValue: 300, measuredValue: 275,
      measurementDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "COMPLIANT", responsibleId: managerUser.id,
      notes: "Disposal completed via Clean Harbors. Manifest #CH-2024-8821 on file.",
    },
  });

  // =====================================================================
  // 9. AUDITS & REVIEWS
  // =====================================================================
  console.log("📋 Creating audits and findings...");

  const audit1 = await prisma.audit.create({
    data: {
      tenantId: tenant.id,
      title: "Q4 Internal Audit — ISO 45001 EHS",
      auditType: "INTERNAL",
      scope: "Full review of the occupational health and safety management system including risk assessments, incident management, training records, and document control.",
      criteria: "ISO 45001:2018 — Clauses 4 through 10",
      scheduledDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      area: "EHS",
      department: "All departments",
      status: "COMPLETED",
      leadAuditorId: ehsUser.id,
      teamMemberIds: JSON.stringify([adminUser.id, auditorUser.id]),
      summary: "EHS management system is functioning adequately. Several improvement opportunities identified. Audit team reviewed 12 procedures, 5 risk assessments, and 8 training records.",
      conclusion: "System approved with 2 minor nonconformities and 1 observation. Corrective actions assigned and tracked.",
    },
  });

  await prisma.riskAuditLink.create({
    data: {
      tenantId: tenant.id, riskId: risk1.id, auditId: audit1.id,
      relation: "CONTROL_TEST",
      summary: "Audit verified that risk assessments for working at heights are current and controls are active",
    },
  });

  await prisma.riskAuditLink.create({
    data: {
      tenantId: tenant.id, riskId: risk2.id, auditId: audit1.id,
      relation: "FOLLOW_UP",
      summary: "Chemical exposure controls verified — partial effectiveness noted for ventilation gap",
    },
  });

  const auditFindings = await Promise.all([
    prisma.auditFinding.create({
      data: {
        auditId: audit1.id,
        findingType: "MINOR_NC",
        clause: "8.1.2",
        description: "4 of 15 risk assessments were missing a defined next review date.",
        evidence: "During document review, auditors identified 4 risk assessments without a populated 'next review date' field. Risk assessments ranged from 8 to 14 months old.",
        requirement: "ISO 45001:2018 Clause 8.1.2 requires that risk assessments are reviewed at planned intervals and when significant changes occur.",
        responsibleId: ehsUser.id,
        rootCause: "No automated reminder or workflow to trigger risk assessment reviews. EHS Manager relied on manual calendar reminders.",
        dueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        correctiveAction: "All 15 risk assessments updated with next review dates. EHS Nova automated review reminders activated for all risk records. EHS Manager review cycle now monthly.",
        status: "VERIFIED",
        closedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        verifiedById: auditorUser.id,
        verifiedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.auditFinding.create({
      data: {
        auditId: audit1.id,
        findingType: "MINOR_NC",
        clause: "7.2",
        description: "Training records for 3 employees in noise-exposed roles lacked documented audiometric test results.",
        evidence: "Auditors reviewed training records for 8 employees in the production area. 3 employees had no audiometric baseline test on file despite working in areas with TWA > 85 dB(A).",
        requirement: "OSHA 29 CFR 1910.95 requires audiometric testing for all employees enrolled in the hearing conservation program.",
        responsibleId: ehsUser.id,
        rootCause: "Hearing conservation program enrollment was incomplete — 3 employees assigned to noise areas after last audiometric testing cycle.",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        correctiveAction: "3 employees scheduled for audiometric baseline testing within 2 weeks. Hearing conservation enrollment process updated to include trigger at role change.",
        status: "OPEN",
      },
    }),
    prisma.auditFinding.create({
      data: {
        auditId: audit1.id,
        findingType: "OBSERVATION",
        clause: "7.4",
        description: "Opportunity to improve EHS communication to remote and field employees.",
        evidence: "Field employees reported they do not consistently receive EHS bulletins. Toolbox talks are only documented for production, not field crews.",
        requirement: "ISO 45001:2018 Clause 7.4 — effective EHS communication shall be ensured for all workers.",
        responsibleId: ehsUser.id,
        correctiveAction: "EHS Nova mobile app rolled out to all field employees. Weekly EHS bulletin now distributed via app notification. Toolbox talk template added for field supervisors.",
        status: "RESOLVED",
        closedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        verifiedById: auditorUser.id,
        verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  await prisma.audit.create({
    data: {
      tenantId: tenant.id,
      title: "Q1 Internal Audit — ISO 9001 Quality",
      auditType: "INTERNAL",
      scope: "Product quality controls, customer complaint handling, nonconforming product management, and corrective action effectiveness.",
      criteria: "ISO 9001:2015 — Clauses 8 through 10",
      scheduledDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      area: "Quality",
      department: "Production & Customer Service",
      status: "PLANNED",
      leadAuditorId: adminUser.id,
    },
  });

  await prisma.audit.create({
    data: {
      tenantId: tenant.id,
      title: "BCM Tabletop Exercise 2025 — Supply Chain Disruption",
      auditType: "INTERNAL",
      scope: "Test response to major supply chain disruption scenario affecting logistics and production scheduling.",
      criteria: "ISO 22301:2019 — Business Continuity Management",
      scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      area: "Business Continuity",
      department: "Logistics & Operations",
      status: "PLANNED",
      leadAuditorId: auditorUser.id,
    },
  });

  console.log(`   ✅ 3 audits created with ${auditFindings.length} findings`);

  // =====================================================================
  // 10. SAFETY WALKS & INSPECTIONS
  // =====================================================================
  console.log("🔍 Creating safety walks and inspections...");

  const inspection1 = await prisma.inspection.create({
    data: {
      tenantId: tenant.id,
      title: "Q4 Quarterly Safety Walk — Production Halls A & B",
      type: "VERNERUNDE",
      description: "Systematic safety walkthrough of all production areas, warehouses, and office wing.",
      scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      location: "Production Halls A & B + Warehouse",
      conductedBy: ehsUser.id,
      participants: JSON.stringify([managerUser.id, safetyUser.id]),
      status: "COMPLETED",
      templateId: warehouseInspectionTemplate.id,
      riskCategory: "SAFETY",
      area: "Production & Warehouse",
      durationMinutes: 150,
      followUpById: ehsUser.id,
      nextInspection: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  const inspectionFindings = await Promise.all([
    prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Arc flash label missing on electrical panel — Machine Row 3",
        description: "Electrical panel serving Machine Row 3 is missing an arc flash hazard warning label. NFPA 70E requires incident energy labeling on all equipment likely to require examination while energized.",
        severity: 4,
        location: "Production Hall A — Machine Row 3 Panel",
        status: "RESOLVED",
        responsibleId: managerUser.id,
        dueDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        resolutionNotes: "NFPA 70E arc flash label (8.4 cal/cm²) applied by licensed electrician. Photo evidence on file.",
        linkedRiskId: risk4.id,
      },
    }),
    prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Fire extinguisher missing annual inspection tag — Hall B Main Entry",
        description: "Fire extinguisher at the main entry of Production Hall B does not have a current annual inspection tag. Last recorded service date unknown.",
        severity: 3,
        location: "Production Hall B — Main Entry",
        status: "IN_PROGRESS",
        responsibleId: ehsUser.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        linkedRiskId: risk4.id,
      },
    }),
    prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Outdated evacuation map posted in break room",
        description: "Evacuation diagram in the break room shows the pre-renovation floor plan from 2021. Emergency exits and assembly point locations have changed.",
        severity: 4,
        location: "Break Room — 1st Floor",
        status: "OPEN",
        responsibleId: adminUser.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        linkedRiskId: risk1.id,
      },
    }),
    prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Forklift pedestrian crossing not clearly marked at Bay 3",
        description: "The forklift/pedestrian crossing at Bay 3 lacks floor markings and signage. This intersection contributed to the recent near-miss incident.",
        severity: 5,
        location: "Warehouse — Bay 3 Intersection",
        status: "RESOLVED",
        responsibleId: managerUser.id,
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        resolutionNotes: "Yellow pedestrian walkway painted. 'Yield to Forklift' signage installed. Physical barriers added at corner.",
        linkedRiskId: risk1.id,
      },
    }),
    prisma.inspectionFinding.create({
      data: {
        inspectionId: inspection1.id,
        title: "Hearing protection dispenser empty in compressor room",
        description: "Hearing protection dispenser at the entrance to the compressor room was completely empty. Employees entering this area (TWA >92 dB) must have hearing protection.",
        severity: 3,
        location: "Production Floor — Compressor Room Entry",
        status: "RESOLVED",
        responsibleId: ehsUser.id,
        dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        resolutionNotes: "Dispenser restocked. Inventory check added to weekly EHS walkthrough checklist.",
        linkedRiskId: risk5.id,
      },
    }),
  ]);

  await prisma.inspection.create({
    data: {
      tenantId: tenant.id,
      title: "Spring Fire Drill 2025",
      type: "BRANNØVELSE",
      description: "Annual full-facility fire evacuation drill including all employees, visitors, and contractors. Assembly point verification and headcount procedures.",
      scheduledDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      location: "Entire Facility",
      conductedBy: ehsUser.id,
      status: "PLANNED",
      riskCategory: "SAFETY",
      durationMinutes: 45,
      followUpById: adminUser.id,
    },
  });

  await prisma.inspection.create({
    data: {
      tenantId: tenant.id,
      title: "Q1 Chemical Storage Inspection",
      type: "VERNERUNDE",
      description: "Quarterly chemical storage and secondary containment inspection. Focus on GHS labeling compliance and SDS currency.",
      scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: "Maintenance Room, Chemical Storage Areas",
      conductedBy: ehsUser.id,
      status: "PLANNED",
      templateId: chemicalInspectionTemplate.id,
      riskCategory: "ENVIRONMENTAL",
      area: "Facilities",
      durationMinutes: 60,
      followUpById: ehsUser.id,
    },
  });

  console.log(`   ✅ 3 inspections created with ${inspectionFindings.length} findings`);

  // =====================================================================
  // 11. CHEMICAL REGISTRY (SDS / HazCom)
  // =====================================================================
  console.log("⚗️  Creating chemical registry...");

  const chemicals = await Promise.all([
    prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "Simple Green Industrial Cleaner",
        supplier: "Sunshine Makers Inc.",
        casNumber: "68603-25-8",
        hazardClass: "Mild Irritant (GHS07)",
        hazardStatements: "H315: Causes skin irritation\nH319: Causes serious eye irritation",
        warningPictograms: JSON.stringify(["helserisiko.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M009.svg.png", "ISO_7010_M004.svg.png"]),
        sdsVersion: "3.2",
        sdsDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
        location: "Maintenance Room — Chemical Station",
        quantity: 5,
        unit: "gallons",
        status: "ACTIVE",
        lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehsUser.id,
      },
    }),
    prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "Sodium Hypochlorite Solution (10%)",
        supplier: "Hillyard Inc.",
        casNumber: "7681-52-9",
        hazardClass: "Oxidizer (GHS03), Corrosive (GHS05), Environmental Hazard (GHS09)",
        hazardStatements:
          "H272: May intensify fire — oxidizer\nH314: Causes severe skin burns and eye damage\nH400: Very toxic to aquatic life\nH410: Very toxic to aquatic life with long lasting effects",
        warningPictograms: JSON.stringify(["oksiderende.webp", "etsende.webp", "miljofare.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M009.svg.png", "ISO_7010_M004.svg.png", "ISO_7010_M017.svg.png"]),
        sdsVersion: "4.1",
        sdsDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        location: "Chemical Cabinet — Storage Room",
        quantity: 4,
        unit: "gallons",
        status: "ACTIVE",
        notes: "Store segregated from flammables and acids. Do not mix with ammonia — toxic chlorine gas. Dispose via approved hazardous waste vendor.",
        lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehsUser.id,
      },
    }),
    prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "WD-40 Multi-Use Product",
        supplier: "WD-40 Company",
        casNumber: "8052-41-3",
        hazardClass: "Flammable Aerosol (GHS02), Gas under Pressure (GHS04)",
        hazardStatements: "H222: Extremely flammable aerosol\nH229: Pressurized container — may burst if heated",
        warningPictograms: JSON.stringify(["brannfarlig.webp", "gass_under_trykk.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M009.svg.png"]),
        sdsVersion: "6.0",
        sdsDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000),
        location: "Maintenance Shop — Tool Cabinet",
        quantity: 18,
        unit: "cans (11 oz)",
        status: "ACTIVE",
        lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehsUser.id,
      },
    }),
    prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "Loctite 243 Threadlocker",
        supplier: "Henkel Corporation",
        casNumber: "25852-47-5",
        hazardClass: "Skin Sensitizer (GHS07), Chronic Health Hazard (GHS08)",
        hazardStatements: "H317: May cause an allergic skin reaction\nH334: May cause allergy or asthma symptoms or breathing difficulties if inhaled",
        warningPictograms: JSON.stringify(["helserisiko.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M004.svg.png", "ISO_7010_M009.svg.png"]),
        sdsVersion: "2.3",
        sdsDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 215 * 24 * 60 * 60 * 1000),
        location: "Maintenance Shop — Assembly Station",
        quantity: 12,
        unit: "tubes (50ml)",
        status: "ACTIVE",
        notes: "Note potential for skin sensitization — nitrile gloves required for all applications. Employees with known sensitivity to acrylates must be reassigned.",
        lastVerifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehsUser.id,
      },
    }),
    prisma.chemical.create({
      data: {
        tenantId: tenant.id,
        productName: "CRC Brake Parts Cleaner",
        supplier: "CRC Industries",
        casNumber: "79-20-9",
        hazardClass: "Highly Flammable Liquid (GHS02), Aspiration Hazard (GHS08), Health Hazard (GHS07)",
        hazardStatements: "H225: Highly flammable liquid and vapor\nH304: May be fatal if swallowed and enters airways\nH336: May cause drowsiness or dizziness",
        warningPictograms: JSON.stringify(["brannfarlig.webp", "helserisiko.webp"]),
        requiredPPE: JSON.stringify(["ISO_7010_M009.svg.png", "ISO_7010_M004.svg.png", "ISO_7010_M017.svg.png"]),
        sdsVersion: "3.1",
        sdsDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // OVERDUE for review
        location: "Maintenance Shop — Brake Service Area",
        quantity: 24,
        unit: "cans (14 oz)",
        status: "ACTIVE",
        notes: "SDS REVIEW OVERDUE — schedule review immediately. Use only in well-ventilated area. No ignition sources.",
        lastVerifiedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        lastVerifiedBy: ehsUser.id,
      },
    }),
  ]);

  console.log(`   ✅ ${chemicals.length} chemicals created in registry`);

  // =====================================================================
  // 12. ADDITIONAL CORRECTIVE & PREVENTIVE MEASURES
  // =====================================================================
  console.log("✅ Creating additional corrective and preventive measures...");

  const additionalMeasures = await Promise.all([
    prisma.measure.create({
      data: {
        tenantId: tenant.id,
        title: "Update and repost evacuation floor plans",
        description:
          "Engage facility architect to produce updated evacuation diagrams reflecting current floor plan. Post laminated A3 diagrams at all required locations per OSHA 29 CFR 1910.38.",
        status: "IN_PROGRESS",
        responsibleId: adminUser.id,
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        category: "IMPROVEMENT",
        followUpFrequency: "ANNUAL",
        costEstimate: 1800,
        benefitEstimate: 15,
      },
    }),
    prisma.measure.create({
      data: {
        tenantId: tenant.id,
        title: "Replenish and upgrade PPE inventory",
        description:
          "Order 30 replacement safety glasses (ANSI Z87.1), 20 pairs cut-resistant gloves (ANSI A4), and 10 pairs chemical-resistant gauntlets for production and maintenance areas.",
        status: "PENDING",
        responsibleId: managerUser.id,
        dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        category: "PREVENTIVE",
        followUpFrequency: "MONTHLY",
        costEstimate: 3200,
        benefitEstimate: 20,
      },
    }),
    prisma.measure.create({
      data: {
        tenantId: tenant.id,
        title: "Conduct annual workplace climate and wellbeing survey",
        description:
          "Administer ISO 45003 aligned wellbeing survey to all employees in Q1. Analyze results and present action plan to safety committee within 30 days of survey close.",
        status: "PENDING",
        responsibleId: ehsUser.id,
        dueAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        category: "IMPROVEMENT",
        followUpFrequency: "ANNUAL",
        costEstimate: 2000,
        benefitEstimate: 30,
      },
    }),
    prisma.measure.create({
      data: {
        tenantId: tenant.id,
        title: "Overdue SDS review — CRC Brake Parts Cleaner",
        description:
          "Review and update Safety Data Sheet for CRC Brake Parts Cleaner with manufacturer. Confirm current version and update chemical registry. Verify PPE requirements unchanged.",
        status: "PENDING",
        responsibleId: ehsUser.id,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: "PREVENTIVE",
        followUpFrequency: "ANNUAL",
        costEstimate: 0,
        benefitEstimate: 10,
      },
    }),
  ]);

  console.log(`   ✅ ${additionalMeasures.length} additional measures created`);

  // =====================================================================
  // 13. MANAGEMENT REVIEWS
  // =====================================================================
  console.log("📊 Creating management reviews...");

  const mgmtReview1 = await prisma.managementReview.create({
    data: {
      tenantId: tenant.id,
      title: "Management Review — Q4",
      period: `Q4 ${new Date().getFullYear()}`,
      reviewDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
      conductedBy: adminUser.id,
      participants: JSON.stringify([
        { name: adminUser.name, role: "CEO", email: adminUser.email },
        { name: ehsUser.name, role: "EHS Manager", email: ehsUser.email },
        { name: managerUser.name, role: "Operations Manager", email: managerUser.email },
      ]),
      hmsGoalsReview:
        "3 of 4 EHS goals are on track. Safety walk completion at 75% — one postponed due to staffing. Absenteeism at 5.1%, above target of 3.5%. Training compliance at 81%.",
      incidentStatistics:
        "Q4: 5 incidents recorded (1 recordable injury, 2 near-misses, 1 deviation, 1 customer complaint). All closed or in active investigation. Recordable rate: 2.4 per 100 FTEs vs. industry benchmark 3.8.",
      riskReview:
        "All 5 risk assessments current. 2 new risks identified (noise-induced hearing loss, stormwater runoff). 8 corrective measures tracked — 4 completed, 4 in progress.",
      auditResults:
        "Q4 ISO 45001 internal audit completed with 2 minor nonconformities (risk review dates, audiometric records) and 1 observation (field EHS communication). One NC closed, one in progress.",
      trainingStatus:
        "Training compliance: 81%. Gaps: Thomas Brown — fire safety overdue; David Chen — first aid renewal expired. EHS Manager to close gaps by end of month.",
      resourcesReview:
        "EHS budget 2025 approved at $95,000. Capital allocation for switchgear replacement ($85,000) and acoustic enclosures ($28,000) approved. EHS Nova subscription renewed.",
      externalChanges:
        "OSHA Heat Illness Prevention final rule effective Q2 2025 — action plan underway. Colorado CDPHE stormwater permit renewal due April 30.",
      conclusions:
        "EHS management system is operating effectively. Positive trend in injury rate (down 37% year-over-year). Strong near-miss reporting culture — 18 near-misses reported this year vs. 6 last year. Key areas for improvement: training compliance and hearing conservation enrollment. Noise risk requires capital investment.",
      decisions:
        "1. Approve $12,000 PPE refresh budget — immediate.\n2. EHS Manager to close all training gaps within 30 days.\n3. Schedule audiometric testing for 3 identified employees — within 2 weeks.\n4. Initiate switchgear replacement capital project — Q1.\n5. All open corrective actions to be resolved by January 31.",
      actionPlan: JSON.stringify([
        { title: "Close training compliance gaps", responsible: "EHS Manager", deadline: `${new Date().getFullYear() + 1}-01-31` },
        { title: "Audiometric testing for 3 employees", responsible: "EHS Manager", deadline: `${new Date().getFullYear() + 1}-01-15` },
        { title: "Initiate switchgear capital project", responsible: "CEO", deadline: `${new Date().getFullYear() + 1}-02-28` },
        { title: "OSHA heat illness prevention plan", responsible: "EHS Manager", deadline: `${new Date().getFullYear() + 1}-03-31` },
      ]),
      notes:
        "Next review scheduled in Q1. Agenda to include: action plan follow-up, Q1 injury statistics, wellbeing survey results, audit findings closure, and 2025 risk register review.",
      status: "COMPLETED",
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  });

  const mgmtReview2 = await prisma.managementReview.create({
    data: {
      tenantId: tenant.id,
      title: "Management Review — Q1 (Planned)",
      period: `Q1 ${new Date().getFullYear() + 1}`,
      reviewDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 166 * 24 * 60 * 60 * 1000),
      conductedBy: adminUser.id,
      participants: JSON.stringify([
        { name: adminUser.name, role: "CEO", email: adminUser.email },
        { name: ehsUser.name, role: "EHS Manager", email: ehsUser.email },
        { name: managerUser.name, role: "Operations Manager", email: managerUser.email },
      ]),
      notes:
        "Planned quarterly management review. Agenda: Follow-up on Q4 action plan, Q1 injury and near-miss statistics, wellbeing survey results and action plan, OSHA heat illness prevention readiness, audit findings status, 2025 EHS goal mid-point review.",
      status: "PLANNED",
    },
  });

  console.log(`   ✅ 2 management reviews created`);

  // =====================================================================
  // 14. SAFETY COMMITTEE & SAFETY REP MEETINGS
  // =====================================================================
  console.log("🤝 Creating meetings...");

  const meeting1 = await prisma.meeting.create({
    data: {
      tenantId: tenant.id,
      title: "Safety Committee Meeting — November",
      type: "AMU",
      scheduledDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      location: "Conference Room A — Main Office",
      organizer: adminUser.id,
      agenda:
        "1. Review of October absenteeism and injury statistics\n" +
        "2. Status of all open EHS incidents and corrective actions\n" +
        "3. Planning of Q4 quarterly safety walk\n" +
        "4. Evaluation of recent fire drill — lessons learned\n" +
        "5. PPE inventory and budget approval\n" +
        "6. Forklift pedestrian safety update\n" +
        "7. Any other business",
      summary:
        "Meeting held with full attendance (5 of 5 members present). Absenteeism down 12% compared to same period last year. Injury rate trending favorably. Strong near-miss reporting noted positively.",
      notes:
        "All open EHS incidents have active corrective actions. Fire drill result: 97% participation, 4 min 20 sec to full evacuation — 45 seconds improvement from last year. Assembly point headcount confirmed. " +
        "Bay 3 forklift barriers installed — unanimous positive feedback from floor supervisors. PPE order approved. " +
        "Q4 safety walk scheduled for week of December 9. Next meeting scheduled January 21.",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 95 * 60 * 1000),
      minuteTaker: ehsUser.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meeting1.id, userId: adminUser.id, role: "CHAIR", attended: true },
      { meetingId: meeting1.id, userId: ehsUser.id, role: "SECRETARY", attended: true },
      { meetingId: meeting1.id, userId: safetyUser.id, role: "MEMBER", attended: true },
      { meetingId: meeting1.id, userId: managerUser.id, role: "MEMBER", attended: true },
      { meetingId: meeting1.id, userId: employeeUser.id, role: "MEMBER", attended: false, notes: "Apologies submitted — family emergency" },
    ],
  });

  const meeting1Decisions = await Promise.all([
    prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-11-01",
        title: "Approve ergonomic workstation upgrade for office wing",
        description: "Decision: Purchase 12 ergonomic task chairs and 6 monitor arms for the office wing to address musculoskeletal risk. Budget: $8,400. Procurement by Operations Manager.",
        responsibleId: adminUser.id,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    }),
    prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-11-02",
        title: "Conduct Q4 safety walk in week of December 9",
        description: "Decision: EHS Manager and Safety Representative to conduct Q4 quarterly safety walk covering Production Halls A & B and Warehouse. Document all findings in EHS Nova. Report to be presented at next meeting.",
        responsibleId: safetyUser.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "IN_PROGRESS",
      },
    }),
    prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-11-03",
        title: "Update ergonomic risk assessment for all office workstations",
        description: "Decision: EHS Manager to update the ergonomic risk assessment using new NIOSH lifting equation data. Include sit-stand desk usage data and micro-break compliance. Due by end of Q4.",
        responsibleId: ehsUser.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    }),
    prisma.meetingDecision.create({
      data: {
        meetingId: meeting1.id,
        decisionNumber: "SC-2024-11-04",
        title: "Schedule audiometric testing for 3 production employees",
        description: "Decision: EHS Manager to arrange audiometric baseline testing for Thomas Brown, Alex Rivera, and Maria Santos — identified as noise-exposed without baseline on file. Complete within 2 weeks.",
        responsibleId: ehsUser.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "IN_PROGRESS",
      },
    }),
  ]);

  const meeting2 = await prisma.meeting.create({
    data: {
      tenantId: tenant.id,
      title: "Safety Representative Meeting — December (Planned)",
      type: "VO",
      scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: "Conference Room B",
      organizer: managerUser.id,
      agenda:
        "1. Follow-up on actions from November Safety Committee Meeting\n" +
        "2. Review of new EHS concerns submitted since last meeting\n" +
        "3. PPE inventory status\n" +
        "4. January safety walk planning and focus areas\n" +
        "5. Hearing conservation program update",
      notes: "Monthly meeting with Safety Representative to review open EHS items and employee concerns.",
      status: "PLANNED",
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meeting2.id, userId: managerUser.id, role: "CHAIR", attended: false },
      { meetingId: meeting2.id, userId: ehsUser.id, role: "MEMBER", attended: false },
      { meetingId: meeting2.id, userId: safetyUser.id, role: "MEMBER", attended: false },
    ],
  });

  const meeting3 = await prisma.meeting.create({
    data: {
      tenantId: tenant.id,
      title: "Safety Committee Meeting — January (Planned)",
      type: "AMU",
      scheduledDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      location: "Conference Room A — Main Office",
      organizer: adminUser.id,
      agenda:
        "1. Q4 EHS performance review and year-end summary\n" +
        "2. Q4 safety walk findings review\n" +
        "3. Open corrective action status\n" +
        "4. EHS training compliance report\n" +
        "5. 2025 EHS goals and targets setting\n" +
        "6. Any other business",
      status: "PLANNED",
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meeting3.id, userId: adminUser.id, role: "CHAIR", attended: false },
      { meetingId: meeting3.id, userId: ehsUser.id, role: "SECRETARY", attended: false },
      { meetingId: meeting3.id, userId: safetyUser.id, role: "MEMBER", attended: false },
      { meetingId: meeting3.id, userId: managerUser.id, role: "MEMBER", attended: false },
      { meetingId: meeting3.id, userId: employeeUser.id, role: "MEMBER", attended: false },
    ],
  });

  console.log(`   ✅ 3 meetings created with ${meeting1Decisions.length} decisions`);

  // =====================================================================
  // 15. WHISTLEBLOWING / ANONYMOUS REPORTING
  // =====================================================================
  console.log("🔒 Creating whistleblowing reports...");

  const whistleblow1 = await prisma.whistleblowing.create({
    data: {
      tenantId: tenant.id,
      caseNumber: "WB-2024-001",
      accessCode: "ABC123DEF456GHIJ",
      category: "WORK_ENVIRONMENT",
      title: "PPE Non-Compliance on Evening Shift — Production Hall B",
      description:
        "I have observed that safety procedures are not being consistently followed during the evening shift, especially at shift changeover. Several employees have been operating machinery without required PPE (safety glasses and hearing protection). This occurs mainly between 5:00 PM and 7:00 PM when supervisor presence is lower.",
      occurredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      location: "Production Hall B — Machine Area",
      involvedPersons: "Approximately 3–4 people observed, identities unknown",
      witnesses: "Other evening shift employees have observed the same behavior",
      isAnonymous: true,
      status: "CLOSED",
      severity: "MEDIUM",
      handledBy: ehsUser.id,
      assignedTo: ehsUser.id,
      investigatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      outcome:
        "Observations confirmed by EHS Manager on two unannounced evening shift visits. EHS training conducted for all 9 evening shift employees. PPE compliance signage installed at all machine entry points. Supervisor accountability added to shift handover checklist. Follow-up observation shows 100% compliance.",
      closedReason: "RESOLVED",
    },
  });

  await prisma.whistleblowMessage.createMany({
    data: [
      {
        whistleblowingId: whistleblow1.id,
        sender: "SYSTEM",
        message: `Your report has been received with case number ${whistleblow1.caseNumber}. Use your access code to track updates and communicate securely.`,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message:
          "Thank you for reporting this concern. We take PPE compliance very seriously as it directly affects employee safety. We have begun an unannounced observation program. You will receive updates within 7 business days. Your identity is fully protected.",
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "REPORTER",
        message:
          "Thank you for the quick response. The situation has not changed much. Last Tuesday evening I saw the same thing again around 6 PM.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message:
          "We have completed two unannounced observations and confirmed your findings. EHS training for all evening shift employees is scheduled for this Thursday. New PPE compliance signs will be installed at all machine entry points before the weekend.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message:
          "Update: Training completed — all 9 evening shift employees attended and signed acknowledgment. Signage installed. Supervisor PPE check added to shift handover. We will conduct follow-up observations for 4 weeks.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "REPORTER",
        message:
          "I can see the difference — everyone is now wearing their PPE on the evening shift. Thank you for taking this seriously and acting so quickly.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message:
          "We are very glad the situation has improved. We are closing this case as resolved. Please do not hesitate to submit a new report if you observe safety concerns in the future. Thank you for caring about your colleagues' safety.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const whistleblow2 = await prisma.whistleblowing.create({
    data: {
      tenantId: tenant.id,
      caseNumber: "WB-2024-002",
      accessCode: "XYZ789KLM012NOPQ",
      category: "HARASSMENT",
      title: "Repeated Inappropriate Comments from Colleague",
      description:
        "I have been experiencing inappropriate comments of a sexual nature from a male colleague over an extended period. This happens most often in the break room when fewer people are around. I feel uncomfortable and unsafe at work. I am reporting this anonymously as I am concerned about retaliation.",
      occurredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      location: "Break Room — 2nd Floor",
      involvedPersons: "1 male colleague, approximately 40–45 years old",
      reporterName: "Prefers to remain anonymous",
      isAnonymous: true,
      status: "UNDER_INVESTIGATION",
      severity: "HIGH",
      handledBy: adminUser.id,
      assignedTo: adminUser.id,
      acknowledgedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      investigatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.whistleblowMessage.createMany({
    data: [
      {
        whistleblowingId: whistleblow2.id,
        sender: "SYSTEM",
        message: `Your report has been received with case number ${whistleblow2.caseNumber}. Use your access code to track updates and communicate securely.`,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow2.id,
        sender: "HANDLER",
        message:
          "Thank you for trusting us with this concern. We take reports of harassment extremely seriously. An independent investigator will conduct a discreet review. You will receive a response within 5 business days. You are fully protected from retaliation under company policy and applicable law.",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow2.id,
        sender: "HANDLER",
        message:
          "Update: We have begun the investigation. To help us proceed effectively, could you tell us approximately when this behavior started, and how frequently it occurs? You do not need to provide names at this stage.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow2.id,
        sender: "REPORTER",
        message:
          "This has been happening for about 3 months. It occurs approximately 2–3 times per week, most often on Tuesdays and Thursdays when the floor is less busy.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow2.id,
        sender: "HANDLER",
        message:
          "Thank you for sharing that — it is very helpful. The investigation is continuing. We will update you within the next 5 business days.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const whistleblow3 = await prisma.whistleblowing.create({
    data: {
      tenantId: tenant.id,
      caseNumber: "WB-2024-003",
      accessCode: "PQR456STU789VWXY",
      category: "SAFETY",
      title: "Emergency Stop Button Failure — Press Machine #7",
      description:
        "The emergency stop (E-stop) button on Press Machine #7 is not functioning. I tested it three times and it does not respond. This is a serious safety hazard — the machine cannot be stopped quickly in an emergency. Machine is still in operation.",
      occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: "Production Hall A — Press Machine #7",
      reporterName: "James Patterson",
      reporterEmail: "j.patterson.home@gmail.com",
      reporterPhone: "720-555-0188",
      isAnonymous: false,
      status: "RECEIVED",
      severity: "HIGH",
      handledBy: managerUser.id,
      assignedTo: managerUser.id,
      acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.whistleblowMessage.createMany({
    data: [
      {
        whistleblowingId: whistleblow3.id,
        sender: "SYSTEM",
        message: `Your report has been received with case number ${whistleblow3.caseNumber}. Use your access code to track updates.`,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow3.id,
        sender: "HANDLER",
        message:
          "Thank you James. We have immediately taken Press Machine #7 out of service and tagged it out per LOTO procedures. The maintenance team is inspecting the E-stop circuit today. No one will operate this machine until it is repaired and tested. Thank you for reporting this — this is exactly the type of hazard our reporting system is designed for.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        whistleblowingId: whistleblow3.id,
        sender: "REPORTER",
        message:
          "Thank you for the fast response. I saw the machine has been tagged out. Good to know it is being handled.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`   ✅ 3 whistleblowing reports created with 15 messages`);

  // =====================================================================
  // SUMMARY
  // =====================================================================
  console.log("\n" + "=".repeat(80));
  console.log("🎉 DEMO SEED COMPLETE!\n");
  console.log("📊 Created:");
  console.log(`   📄 ${documents.length} documents (handbook, procedures, plans)`);
  console.log(`   ⚠️  5 risk assessments with corrective measures & controls`);
  console.log(`   🚨 ${incidents.length} incidents & deviations (with 5-Why root cause analysis)`);
  console.log(`   🎓 Comprehensive training matrix — 7 users × multiple courses`);
  console.log(`   🎯 ${goals.length} EHS goals with KPI measurements`);
  console.log(`   📋 3 audits with ${auditFindings.length} findings`);
  console.log(`   🔍 3 inspections with ${inspectionFindings.length} findings`);
  console.log(`   ⚗️  ${chemicals.length} chemicals in registry (including overdue SDS)`);
  console.log(`   ✅ ${additionalMeasures.length} additional corrective/preventive measures`);
  console.log(`   📊 2 management reviews`);
  console.log(`   🤝 3 safety meetings with ${meeting1Decisions.length} decisions`);
  console.log(`   🔒 3 whistleblowing reports with 15 messages`);
  console.log(`   🌿 4 environmental aspects with measurements`);
  console.log("\n" + "=".repeat(80));
  console.log("\n✨ Apex Industrial Solutions Inc. is ready for demo! ✨");
  console.log("\n🔑 Login credentials:");
  console.log("   admin@demo.com       / admin123       (CEO / Admin)");
  console.log("   ehs@demo.com         / ehs123         (EHS Manager)");
  console.log("   manager@demo.com     / manager123     (Operations Manager)");
  console.log("   safety@demo.com      / safety123      (Safety Representative)");
  console.log("   employee@demo.com    / employee123    (Employee)");
  console.log("   ohs@demo.com         / ohs123         (OHS Provider)");
  console.log("   auditor@demo.com     / auditor123     (Auditor)");
  console.log("\n🔗 Whistleblowing portal:");
  console.log(`   URL: https://ehsnova.com/whistleblowing/demo-company`);
  console.log(`   Tracking codes:`);
  console.log(`   - WB-2024-001: ABC123DEF456GHIJ  (Closed — PPE compliance resolved)`);
  console.log(`   - WB-2024-002: XYZ789KLM012NOPQ  (Under investigation — harassment)`);
  console.log(`   - WB-2024-003: PQR456STU789VWXY  (Received — E-stop failure)`);
  console.log("\n" + "=".repeat(80) + "\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


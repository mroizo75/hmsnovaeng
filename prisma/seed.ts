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
      where: { email: "superadmin@hmsnova.com" },
      update: {},
      create: {
        email: "superadmin@hmsnova.com",
        name: "Superadmin",
        password: superAdminPassword,
        isSuperAdmin: true,
        emailVerified: new Date(),
      },
    });

    console.log("✅ Superadmin opprettet:", superAdmin.email);

    const supportPassword = await bcrypt.hash("support123", 10);

    const supportUser = await prisma.user.upsert({
      where: { email: "support@hmsnova.com" },
      update: {},
      create: {
        email: "support@hmsnova.com",
        name: "Support Team",
        password: supportPassword,
        isSupport: true,
        emailVerified: new Date(),
      },
    });

    console.log("✅ Support-bruker opprettet:", supportUser.email);
  } else {
    console.log(
      "⚠️ Hopper over opprettelse av demo superadmin/support. Sett SEED_DEMO_PRIVILEGED_USERS=true ved behov."
    );
  }

  // Opprett test tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "test-bedrift" },
    update: {},
    create: {
      name: "Test Bedrift AS",
      orgNumber: "123456789",
      slug: "test-bedrift",
      status: "ACTIVE",
      contactEmail: "post@testbedrift.no",
      contactPhone: "12345678",
      address: "Testveien 1",
      city: "Oslo",
      postalCode: "0123",
      subscription: {
        create: {
          plan: "PROFESSIONAL",
          price: 1990,
          billingInterval: "MONTHLY",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("✅ Tenant opprettet:", tenant.name);

  // Opprett admin bruker for tenant
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.no" },
    update: {
      emailVerified: new Date(), // FIX: Ensure verification even on update
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "admin@test.no",
      name: "Admin Testesen",
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

  console.log("✅ Admin bruker opprettet:", adminUser.email);

  // Opprett HMS-ansvarlig
  const hmsPassword = await bcrypt.hash("hms123", 10);

  const hms = await prisma.user.upsert({
    where: { email: "hms@test.no" },
    update: {
      password: hmsPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "hms@test.no",
      name: "HMS-ansvarlig Hansen",
      password: hmsPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "HMS",
        },
      },
    },
  });

  console.log("✅ HMS-bruker opprettet:", hms.email);

  // Opprett Leder
  const leaderPassword = await bcrypt.hash("leder123", 10);

  const leader = await prisma.user.upsert({
    where: { email: "leder@test.no" },
    update: {
      password: leaderPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "leder@test.no",
      name: "Leder Larsen",
      password: leaderPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "LEDER",
        },
      },
    },
  });

  console.log("✅ Leder-bruker opprettet:", leader.email);

  // Opprett Verneombud
  const vernPassword = await bcrypt.hash("vern123", 10);

  const vern = await prisma.user.upsert({
    where: { email: "vern@test.no" },
    update: {
      password: vernPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "vern@test.no",
      name: "Verneombud Viken",
      password: vernPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "VERNEOMBUD",
        },
      },
    },
  });

  console.log("✅ Verneombud-bruker opprettet:", vern.email);

  // Opprett en vanlig ansatt
  const employeePassword = await bcrypt.hash("ansatt123", 10);

  const employee = await prisma.user.upsert({
    where: { email: "ansatt@test.no" },
    update: {
      password: employeePassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "ansatt@test.no",
      name: "Ansatt Olsen",
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

  console.log("✅ Ansatt-bruker opprettet:", employee.email);

  // Opprett BHT bruker
  const bhtPassword = await bcrypt.hash("bht123", 10);

  const bht = await prisma.user.upsert({
    where: { email: "bht@test.no" },
    update: {
      password: bhtPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "bht@test.no",
      name: "BHT Bruker",
      password: bhtPassword,
      emailVerified: new Date(),
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "BHT",
        },
      },
    },
  });

  console.log("✅ BHT-bruker opprettet:", bht.email);

  // Opprett Revisor bruker
  const auditorPassword = await bcrypt.hash("revisor123", 10);

  const auditor = await prisma.user.upsert({
    where: { email: "revisor@test.no" },
    update: {
      password: auditorPassword,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: "revisor@test.no",
      name: "Revisor Revidersen",
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

  console.log("✅ Revisor-bruker opprettet:", auditor.email);

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
    "Standard prosedyre",
    "Mal for ISO 9001-prosedyrer med PDCA-støtte",
    {
      plan: "Beskriv formål, omfang, roller og refererte dokumenter.",
      do: "List opp hovedaktivitetene steg for steg.",
      check: "Forklar hvordan prosessen overvåkes og måles.",
      act: "Beskriv hvordan forbedringer og korrigerende tiltak håndteres.",
    }
  );

  await ensureGlobalTemplate(
    "Arbeidsinstruks",
    "Arbeidsinstruks-mal for ISO 45001 med fokus på sikker utførelse.",
    {
      plan: "Hvilket arbeidsområde gjelder instruksen for?",
      do: "Detaljerte instrukser for sikker utførelse, inkludert PPE.",
      check: "Hvordan kontrolleres at instruksen følges?",
      act: "Hvordan oppdateres instruksen og hvordan håndteres avvik?",
    },
    6
  );

  await ensureGlobalTemplate(
    "BCM-plan",
    "Mal for kontinuitetsplaner (ISO 22301) med fokus på kritiske prosesser.",
    {
      plan: "Definer kritiske tjenester, avhengigheter og kontaktlister.",
      do: "Beskriv responsteam, aktivering og kommunikasjon ved hendelse.",
      check: "Plan for øvelser, testing av redundans og læringspunkter.",
      act: "Hvordan forbedringer dokumenteres og integreres i styringssystemet.",
    },
    12,
    "BCM"
  );

  // Opprett eksempel mål (ISO 9001 - 6.2)
  const goal1 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Redusere arbeidsskader med 50%",
      description: "Mål om å redusere antall arbeidsskader fra 10 til 5 i løpet av året",
      category: "HMS",
      targetValue: 5,
      currentValue: 10,
      unit: "antall",
      baseline: 10,
      year: new Date().getFullYear(),
      startDate: new Date(`${new Date().getFullYear()}-01-01`),
      deadline: new Date(`${new Date().getFullYear()}-12-31`),
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Mål opprettet:", goal1.title);

  // Opprett målinger for mål 1
  const measurement1 = await prisma.kpiMeasurement.create({
    data: {
      goalId: goal1.id,
      tenantId: tenant.id,
      value: 8,
      measurementDate: new Date(`${new Date().getFullYear()}-03-31`),
      measurementType: "MANUAL",
      comment: "Q1-måling: Reduksjon på 2 skader",
      measuredById: adminUser.id,
    },
  });

  const measurement2 = await prisma.kpiMeasurement.create({
    data: {
      goalId: goal1.id,
      tenantId: tenant.id,
      value: 6,
      measurementDate: new Date(`${new Date().getFullYear()}-06-30`),
      measurementType: "MANUAL",
      comment: "Q2-måling: Fortsatt fremgang",
      measuredById: adminUser.id,
    },
  });

  console.log("✅ Målinger opprettet:", measurement1.id, measurement2.id);

  // Oppdater goal1 currentValue til siste måling
  await prisma.goal.update({
    where: { id: goal1.id },
    data: { currentValue: 6 },
  });

  // Opprett flere eksempel mål
  const goal2 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Øke kundetilfredshet til 90%",
      description: "Måle kundetilfredshet gjennom NPS-score",
      category: "CUSTOMER",
      targetValue: 90,
      currentValue: 75,
      unit: "%",
      baseline: 70,
      year: new Date().getFullYear(),
      quarter: 2,
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      tenantId: tenant.id,
      title: "Redusere avfall med 30%",
      description: "Miljømål for reduksjon av avfall",
      category: "ENVIRONMENT",
      targetValue: 70,
      currentValue: 95,
      unit: "kg",
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
      title: "Oppnå ISO 9001 sertifisering",
      description: "Fullføre alle krav for ISO 9001:2015 sertifisering",
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

  console.log("✅ Flere mål opprettet:", goal2.title, goal3.title, goal4.title);

  // Opprett eksempel faktura
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      amount: 1990,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "SENT",
      period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      description: "HMS Nova Professional - Månedlig abonnement",
    },
  });

  console.log("✅ Faktura opprettet:", invoice.id);

  // VIKTIG: Seed-filen sletter IKKE eksisterende data!
  // Dette er for å beskytte ekte produksjonsdata fra å bli slettet ved kjøring av seed.
  // Hvis du vil starte på nytt med kun demo-data, må du manuelt tømme databasen først.
  console.log("ℹ️  Seed-scriptet beholder eksisterende data. Demo-data hoppes over hvis de allerede finnes...");

  // Opprett demo-data (kun hvis databasen er tom)
  const existingDataCount = await prisma.document.count({ where: { tenantId: tenant.id } });
  
  if (existingDataCount === 0) {
    console.log("📦 Oppretter demo-data siden databasen er tom...");
    
    // Opprett eksempel dokumenter
    const doc1 = await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "HMS-håndbok 2024",
        slug: "hms-handbok-2024",
        fileKey: "demo/hms-handbok.pdf",
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
      title: "Beredskapsplan",
      slug: "beredskapsplan",
      fileKey: "demo/beredskapsplan.pdf",
      mime: "application/pdf",
      kind: "PLAN",
      version: "0.5",
      status: "DRAFT",
    },
  });

  console.log("✅ Dokumenter opprettet:", doc1.title, doc2.title);

    const bcmTemplate = await prisma.documentTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Kontinuitetsplan",
        category: "BCM",
        description: "Planmal for forretningskontinuitet og krisehåndtering (ISO 22301).",
        pdcaGuidance: {
          plan: "Definer kritiske prosesser, avhengigheter og kontaktpunkter.",
          do: "Beskriv aktivering av kriseledelse og tiltak for ulike scenarier.",
          check: "Plan for øvelser, læringspunkter og rapportering.",
          act: "Hvordan forbedringer implementeres og plan revideres.",
        },
        isGlobal: false,
      },
    });

    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Kontinuitetsplan 2025",
        slug: "kontinuitetsplan-2025",
        kind: "PLAN",
        version: "1.0",
        status: "APPROVED",
        fileKey: "demo/bcm-plan-2025.pdf",
        mime: "application/pdf",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        ownerId: leader.id,
        templateId: bcmTemplate.id,
        reviewIntervalMonths: 12,
        nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        planSummary: "Plan for å sikre drift av kritiske tjenester ved større hendelser.",
        doSummary: "Etablering av kriseteam og alternative lokasjoner innen 4 timer.",
        checkSummary: "Årlige skrivebordsøvelser og tekniske failover-tester.",
        actSummary: "Læringspunkter dokumenteres i forbedringsloggen.",
      },
    });

    const wellbeingTemplate = await prisma.formTemplate.create({
      data: {
        tenantId: tenant.id,
        title: "Psykososial puls",
        description: "Månedlig puls på trivsel, arbeidsbelastning og støtte (ISO 45003).",
        category: "WELLBEING",
        requiresSignature: false,
        requiresApproval: false,
        createdBy: adminUser.id,
        fields: {
          create: [
            {
              label: "Hvordan har du det i dag? (1-5)",
              fieldType: "RADIO",
              order: 1,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "Hvordan oppleves arbeidsbelastningen? (1-5)",
              fieldType: "RADIO",
              order: 2,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "Føler du deg ivaretatt av leder/kollegaer? (1-5)",
              fieldType: "RADIO",
              order: 3,
              isRequired: true,
              options: JSON.stringify(["1", "2", "3", "4", "5"]),
            },
            {
              label: "Hva vil du dele med HMS-teamet?",
              fieldType: "TEXTAREA",
              order: 4,
              placeholder: "Åpen tilbakemelding",
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
        comment: "God støtte fra leder i hektisk periode.",
        daysAgo: 3,
      },
      {
        userId: hms.id,
        mood: "3",
        workload: "4",
        support: "3",
        comment: "Ønsker bedre prioritering av oppgaver.",
        daysAgo: 7,
      },
      {
        userId: vern.id,
        mood: "5",
        workload: "2",
        support: "5",
        comment: "Teamet fungerer svært godt.",
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
              { fieldId: wellbeingFieldMap["Hvordan har du det i dag? (1-5)"], value: entry.mood },
              {
                fieldId: wellbeingFieldMap["Hvordan oppleves arbeidsbelastningen? (1-5)"],
                value: entry.workload,
              },
              {
                fieldId: wellbeingFieldMap["Føler du deg ivaretatt av leder/kollegaer? (1-5)"],
                value: entry.support,
              },
              {
                fieldId: wellbeingFieldMap["Hva vil du dele med HMS-teamet?"],
                value: entry.comment,
              },
            ],
          },
        },
      });
    }

    const vernerundeTemplate = await prisma.inspectionTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Månedlig vernerunde",
        description: "Standard sjekkliste for fysisk HMS-runde",
        category: "HMS",
        riskCategory: "SAFETY",
        checklist: {
          items: [
            { title: "Orden og ryddighet", type: "checkbox" },
            { title: "Bruk av verneutstyr", type: "checkbox" },
            { title: "Sikring av høyder", type: "checkbox" },
          ],
        },
        isGlobal: false,
      },
    });

    const chemicalTemplate = await prisma.inspectionTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Kjemikalekontroll",
        description: "Kontroller at kjemikalier er merket og lagret korrekt",
        category: "KJEMIKALIER",
        riskCategory: "ENVIRONMENTAL",
        checklist: {
          items: [
            { title: "Merkelapper på plass", type: "checkbox" },
            { title: "Verneutstyr tilgjengelig", type: "checkbox" },
            { title: "SDS oppdatert", type: "checkbox" },
          ],
        },
        isGlobal: false,
      },
    });

    console.log("✅ Inspeksjonsmaler opprettet");

    // Opprett eksempel risikoer
  const risk1 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Fallulykke fra stillas",
      context: "Risiko for fall fra høyde ved arbeid på stillas. Byggeplass har stillas opp til 15 meter høyde.",
        description: "Arbeid i høyden pågår flere ganger per uke. Manglende sikring kan føre til alvorlig skade.",
        existingControls: "Daglig sjekk av stillas, påbud om fallsikringsutstyr.",
        location: "Byggeplass A",
        area: "Produksjon",
        linkedProcess: "Montasje",
        category: "SAFETY",
      likelihood: 3,
      consequence: 4,
      score: 12,
      ownerId: hms.id,
      status: "OPEN",
        controlFrequency: "MONTHLY",
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        riskStatement: "Fall fra høyde kan gi alvorlig personskade eller død.",
        residualLikelihood: 2,
        residualConsequence: 3,
        residualScore: 6,
        kpiId: goal1.id,
        inspectionTemplateId: vernerundeTemplate.id,
    },
  });

  const risk2 = await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      title: "Eksponering for kjemikalier",
      context: "Risiko ved håndtering av farlige kjemikalier uten verneutstyr i lagerområdet.",
        description: "Løsemidler og syrer håndteres daglig. Manglende rutiner kan gi helseskade.",
        existingControls: "SDS lett tilgjengelig, påbudt hansker og briller.",
        location: "Lager B",
        area: "Logistikk",
        linkedProcess: "Kjemikaliehåndtering",
        category: "ENVIRONMENTAL",
      likelihood: 2,
      consequence: 2,
      score: 4,
      ownerId: hms.id,
      status: "MITIGATING",
        controlFrequency: "QUARTERLY",
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        riskStatement: "Hud- og luftveisskader ved søl eller feil bruk.",
        residualLikelihood: 1,
        residualConsequence: 2,
        residualScore: 2,
        inspectionTemplateId: chemicalTemplate.id,
    },
  });

  console.log("✅ Risikoer opprettet:", risk1.title, risk2.title);

  const securityAsset = await prisma.securityAsset.create({
    data: {
      tenantId: tenant.id,
      name: "Azure AD",
      description: "Identitetsplattform for hele virksomheten",
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
      title: "Informasjonssikkerhet i prosjekter",
      annexReference: "Annex A 5.7",
      requirement: "Prosjekter skal planlegge og implementere sikkerhetstiltak.",
      category: "ORGANIZATIONAL",
      status: "IMPLEMENTED",
      maturity: "MANAGED",
      ownerId: hms.id,
      linkedAssetId: securityAsset.id,
      linkedRiskId: risk1.id,
      implementationNote: "Kontroll implementert via prosjektmaler og sjekklister.",
      monitoring: "Gjennomgås i kvartalsvise prosjektrevisjoner.",
      lastTestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.securityControlDocument.create({
    data: {
      tenantId: tenant.id,
      controlId: securityControl.id,
      documentId: doc1.id,
      note: "Referanse til HMS-håndbok kapittel 4",
    },
  });

  await prisma.securityEvidence.create({
    data: {
      tenantId: tenant.id,
      controlId: securityControl.id,
      title: "Prosjektgjennomgang Q1",
      description: "Stikkprøve av prosjektplaner viste at sikkerhet er integrert.",
      collectedById: hms.id,
      reviewResult: "Ingen avvik funnet",
    },
  });

  const accessReview = await prisma.accessReview.create({
    data: {
      tenantId: tenant.id,
      title: "Kvartalsvis administrator-tilgang",
      systemName: "Azure AD",
      scope: "Alle globale administratorer",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      ownerId: hms.id,
    },
  });

  await prisma.accessReviewEntry.createMany({
    data: [
      {
        tenantId: tenant.id,
        reviewId: accessReview.id,
        userName: "Admin Testesen",
        userEmail: adminUser.email,
        role: "Global Admin",
        decision: "APPROVED",
        comment: "Behov for daglig drift",
        decidedById: hms.id,
        decidedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        reviewId: accessReview.id,
        userName: "Ekstern Konsulent",
        userEmail: "consultant@test.no",
        role: "Privileged Role",
        decision: "REVOKED",
        comment: "Prosjekt avsluttet",
        decidedById: hms.id,
        decidedAt: new Date(),
      },
    ],
  });

  // ISO 31000 - kontroller og koblinger
  await prisma.riskControl.createMany({
    data: [
      {
        tenantId: tenant.id,
        riskId: risk1.id,
        title: "Daglig visuell stillaskontroll",
        description: "Formann verifiserer at stillas er komplett og låst før arbeid starter.",
        controlType: "PREVENTIVE",
        ownerId: hms.id,
        status: "ACTIVE",
        effectiveness: "EFFECTIVE",
        frequency: "WEEKLY",
        monitoringMethod: "Sjekkliste signert i feltapp",
        evidenceDocumentId: doc1.id,
        nextTestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lastTestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant.id,
        riskId: risk1.id,
        title: "Årlig sertifisering av fallsikringsutstyr",
        controlType: "DETECTIVE",
        ownerId: bht.id,
        status: "NEEDS_IMPROVEMENT",
        effectiveness: "PARTIAL",
        frequency: "ANNUAL",
        monitoringMethod: "Ekstern leverandør rapporterer til HMS",
      },
      {
        tenantId: tenant.id,
        riskId: risk2.id,
        title: "Kjemikaliesjekk ved mottak",
        controlType: "PREVENTIVE",
        ownerId: leader.id,
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
        note: "Prosedyre for arbeid i høyden",
      },
      {
        tenantId: tenant.id,
        riskId: risk2.id,
        documentId: doc2.id,
        relation: "SUPPORTING",
        note: "Beredskapsplan ved kjemikaliehendelser",
      },
    ],
  });

  // Opprett eksempel hendelser
  const incident1 = await prisma.incident.create({
    data: {
      tenantId: tenant.id,
      type: "SKADE",
      title: "Mindre kuttskade",
      description: "Ansatt fikk kuttskade i finger ved bruk av verktøy",
      severity: 2,
      occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reportedBy: employee.id,
      responsibleId: hms.id,
      location: "Verksted",
      immediateAction: "Førstehjelpsutstyr brukt",
      status: "CLOSED",
      stage: "VERIFIED",
      injuryType: "Kuttskade finger",
      medicalAttentionRequired: true,
      lostTimeMinutes: 60,
      riskReferenceId: risk1.id,
      closedBy: hms.id,
      closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const incident2 = await prisma.incident.create({
    data: {
      tenantId: tenant.id,
      type: "NESTEN",
      title: "Nesten-ulykke: Fallende gjenstand",
      description: "Verktøy falt ned fra høyde, ingen personer skadet",
      severity: 3,
      occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reportedBy: employee.id,
      responsibleId: hms.id,
      location: "Byggeplass",
      status: "INVESTIGATING",
      stage: "UNDER_REVIEW",
      medicalAttentionRequired: false,
      riskReferenceId: risk1.id,
    },
  });

  const complaintIncident = await prisma.incident.create({
    data: {
      tenantId: tenant.id,
      type: "CUSTOMER",
      title: "Kundeklage: Forsinket leveranse",
      description: "Kunde rapporterte om forsinkelse på kritisk leveranse til byggeplass.",
      severity: 3,
      occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reportedBy: leader.id,
      responsibleId: hms.id,
      customerName: "Nordic Retail AS",
      customerEmail: "innkjop@nordicretail.no",
      customerPhone: "+47 900 00 000",
      customerTicketId: "CRM-2025-104",
      responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      customerSatisfaction: 2,
      status: "OPEN",
      stage: "REPORTED",
    },
  });

  console.log("✅ Hendelser opprettet:", incident1.title, incident2.title, complaintIncident.title);

  // Opprett eksempel tiltak
  const measure1 = await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      riskId: risk1.id,
      title: "Installere rekkverk på stillas",
      description: "Montere sikkerhetsutstyr for å forhindre fall",
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      responsibleId: leader.id,
      status: "IN_PROGRESS",
      category: "MITIGATION",
      followUpFrequency: "MONTHLY",
      costEstimate: 25000,
      benefitEstimate: 40,
    },
  });

  const measure2 = await prisma.measure.create({
    data: {
      tenantId: tenant.id,
      title: "Gjennomføre HMS-opplæring",
      description: "Obligatorisk HMS-kurs for alle nye ansatte",
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      responsibleId: hms.id,
      status: "PENDING",
      category: "PREVENTIVE",
      followUpFrequency: "ANNUAL",
      costEstimate: 12000,
      benefitEstimate: 30,
    },
  });

  console.log("✅ Tiltak opprettet:", measure1.title, measure2.title);

  // Opprett eksempel opplæring
  const training1 = await prisma.training.create({
    data: {
      tenantId: tenant.id,
      userId: employee.id,
      title: "Grunnleggende HMS-kurs",
      description: "Innføring i HMS-rutiner og sikkerhetsprosedyrer",
      courseKey: "hms-grunnkurs",
      provider: "KKS AS",
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  const training2 = await prisma.training.create({
    data: {
      tenantId: tenant.id,
      userId: employee.id,
      title: "Arbeid i høyden",
      description: "Sertifisering for arbeid på stillas og lift",
      courseKey: "hoyde-sertifikat",
      provider: "KKS AS",
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isRequired: true,
    },
  });

  console.log("✅ Opplæring opprettet:", training1.title, training2.title);

  // Opprett eksempel stoffkartotek (med korrekte ISO 7010 PPE-filnavn)
  const chemical1 = await prisma.chemical.create({
    data: {
      tenantId: tenant.id,
      productName: "Aceton",
      supplier: "Kjemikalier AS",
      casNumber: "67-64-1",
      hazardClass: "Brannfarlig væske (GHS02), Helsefare (GHS07)",
      hazardStatements: "H225: Meget brannfarlig væske og damp\nH319: Gir alvorlig øyeirritasjon\nH336: Kan forårsake døsighet eller svimmelhet",
      warningPictograms: JSON.stringify(["brannfarlig.webp", "helserisiko.webp"]),
      requiredPPE: JSON.stringify(["ISO_7010_M002.svg.png", "ISO_7010_M007.svg.png"]), // Vernebriller, Arbeidshansker
      sdsVersion: "2.1",
      sdsDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
      location: "Kjemikalieskap A",
      quantity: 5,
      unit: "liter",
      status: "ACTIVE",
      lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastVerifiedBy: hms.id,
    },
  });

  const chemical2 = await prisma.chemical.create({
    data: {
      tenantId: tenant.id,
      productName: "Saltsyre 10%",
      supplier: "Lab Supply",
      casNumber: "7647-01-0",
      hazardClass: "Etsende (GHS05), Helsefare (GHS07)",
      hazardStatements: "H290: Kan være etsende for metaller\nH314: Gir alvorlige etseskader på hud og øyne\nH335: Kan forårsake irritasjon av luftveiene",
      warningPictograms: JSON.stringify(["etsende.webp", "helserisiko.webp"]),
      requiredPPE: JSON.stringify(["ISO_7010_M002.svg.png", "ISO_7010_M007.svg.png", "ISO_7010_M005.svg.png"]), // Vernebriller, Hansker, Åndedrettsvern
      sdsVersion: "3.0",
      sdsDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      location: "Syre-skap B",
      quantity: 2,
      unit: "liter",
      status: "ACTIVE",
      notes: "Oppbevares atskilt fra brennbare materialer",
      lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastVerifiedBy: hms.id,
    },
  });

  console.log("✅ Kjemikalier opprettet:", chemical1.productName, chemical2.productName);

  // Opprett miljøaspekter og målinger
  console.log("🌿 Oppretter miljøaspekter...");
  const energyAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "Energiforbruk i produksjon",
      description: "Elektrisk forbruk ved nattdrift og varmebehov om vinteren.",
      process: "Produksjon",
      location: "Produksjonshall",
      category: "ENERGY",
      impactType: "NEGATIVE",
      severity: 4,
      likelihood: 4,
      significanceScore: 16,
      legalRequirement: "Energiloven §8 / EU EcoDesign",
      controlMeasures: "Overvåke forbruk per skift, automatisk nedstenging av maskiner.",
      monitoringMethod: "Smart energimåler",
      monitoringFrequency: "MONTHLY",
      ownerId: hms.id,
      goalId: goal1.id,
      status: "ACTIVE",
      nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      lastMeasurementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const wasteAspect = await prisma.environmentalAspect.create({
    data: {
      tenantId: tenant.id,
      title: "Farlig avfall fra vedlikehold",
      description: "Spillolje og løsemiddelavfall fra service av maskinpark.",
      process: "Vedlikehold",
      location: "Verksted B",
      category: "WASTE",
      impactType: "NEGATIVE",
      severity: 5,
      likelihood: 3,
      significanceScore: 15,
      legalRequirement: "Forurensningsloven §32",
      controlMeasures: "Lukkede kar, merkede beholdere og avtale med godkjent mottak.",
      monitoringMethod: "Journalføring og beholdning",
      monitoringFrequency: "QUARTERLY",
      ownerId: hms.id,
      goalId: goal2.id,
      status: "MONITORED",
      nextReviewDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.environmentalMeasurement.create({
    data: {
      tenantId: tenant.id,
      aspectId: energyAspect.id,
      parameter: "kWh pr. måned",
      unit: "kWh",
      method: "Automatisk måler",
      limitValue: 45000,
      targetValue: 40000,
      measuredValue: 42050,
      measurementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "WARNING",
      notes: "Ekstra skift på grunn av hasteordre",
      responsibleId: leader.id,
    },
  });

  await prisma.environmentalMeasurement.create({
    data: {
      tenantId: tenant.id,
      aspectId: wasteAspect.id,
      parameter: "Mengde farlig avfall",
      unit: "kg",
      method: "Beholdning/leveringsseddel",
      limitValue: 800,
      targetValue: 600,
      measuredValue: 520,
      measurementDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: "COMPLIANT",
      notes: "Under grense, levering gjennomført via BIR",
      responsibleId: hms.id,
    },
  });

  // Opprett eksempel vernerunder (Inspections)
  const inspection1 = await prisma.inspection.create({
    data: {
      tenantId: tenant.id,
      title: "Månedlig vernerunde - Desember",
      description: "Rutinemessig vernerunde av alle arbeidsområder",
      type: "VERNERUNDE",
      status: "COMPLETED",
      scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: "Alle områder",
      conductedBy: vern.id,
      participants: JSON.stringify([vern.id, hms.id]),
      templateId: vernerundeTemplate.id,
      riskCategory: "SAFETY",
      area: "Produksjon",
      durationMinutes: 90,
      followUpById: hms.id,
      nextInspection: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  });

  const finding1 = await prisma.inspectionFinding.create({
    data: {
      inspectionId: inspection1.id,
      title: "Manglende merking av nødutgang",
      description: "Nødutgang i lagerområdet mangler tydelig skilting",
      severity: 3,
      location: "Lager - Sektor C",
      status: "OPEN",
      responsibleId: hms.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      linkedRiskId: risk1.id,
    },
  });

  const finding2 = await prisma.inspectionFinding.create({
    data: {
      inspectionId: inspection1.id,
      title: "Slitt verneutstyr",
      description: "Flere vernebriller har riper og bør skiftes ut",
      severity: 2,
      location: "Verksted",
      status: "RESOLVED",
      responsibleId: hms.id,
      resolvedAt: new Date(),
      resolutionNotes: "Nye vernebriller bestilt og utlevert",
      linkedRiskId: risk1.id,
    },
  });

  console.log("✅ Vernerunde opprettet:", inspection1.title, "med", 2, "funn");

  // Opprett eksempel revisjon (Audit)
  const audit1 = await prisma.audit.create({
    data: {
      tenantId: tenant.id,
      title: "ISO 9001 Internrevisjon 2024",
      auditType: "INTERNAL",
      scope: "Alle prosesser i kvalitetsstyringssystemet",
      criteria: "ISO 9001:2015 krav 4-10",
      area: "Kvalitet",
      department: "Alle avdelinger",
      leadAuditorId: auditor.id,
      teamMemberIds: JSON.stringify([hms.id]),
      scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      summary: "Årlig internrevisjon av kvalitetsstyringssystemet gjennomført",
      conclusion: "Systemet fungerer tilfredsstillende med 2 mindre avvik som må lukkes",
    },
  });

  await prisma.riskAuditLink.create({
    data: {
      tenantId: tenant.id,
      riskId: risk1.id,
      auditId: audit1.id,
      relation: "FOLLOW_UP",
      summary: "Audit følger opp tiltak for arbeid i høyden",
    },
  });

  const auditFinding1 = await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingType: "MINOR_NC",
      clause: "7.1.5",
      description: "Måleutstyr i lab mangler oppdatert kalibreringslogg",
      evidence: "Observert under inspeksjon av laboratoriet at 3 av 5 måleinstrumenter manglet kalibreringsdokumentasjon for 2024",
      requirement: "ISO 9001:2015 krever at måleutstyr skal kalibreres og dokumenteres regelmessig",
      responsibleId: leader.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "OPEN",
    },
  });

  const auditFinding2 = await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingType: "OBSERVATION",
      clause: "7.4",
      description: "Mulighet for bedre informasjonsflyt mellom avdelinger",
      evidence: "Observert at HMS-informasjon ikke alltid når alle ansatte i tide",
      requirement: "Effektiv kommunikasjon bør sikres i henhold til ISO 9001:2015",
      responsibleId: hms.id,
      status: "RESOLVED",
      correctiveAction: "Implementert ukentlige HMS-nyhetsbrev via e-post",
      closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      verifiedById: auditor.id,
      verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Revisjon opprettet:", audit1.title, "med", 2, "funn");

  await prisma.audit.create({
    data: {
      tenantId: tenant.id,
      title: "BCM skrivebordsøvelse",
      auditType: "INTERNAL",
      scope: "Test av kontinuitetsplan for logistikk",
      criteria: "ISO 22301",
      area: "Kontinuitet",
      department: "Logistikk",
      leadAuditorId: auditor.id,
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "PLANNED",
    },
  });

  // Opprett eksempel Ledelsens gjennomgang
  const mgmtReview1 = await prisma.managementReview.create({
    data: {
      tenantId: tenant.id,
      title: "Ledelsens gjennomgang Q4 2024",
      period: "Q4 2024",
      reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      conductedBy: adminUser.id,
      nextReviewDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
      participants: JSON.stringify([
        { name: adminUser.name, role: "Admin", email: adminUser.email },
        { name: hms.name, role: "HMS-ansvarlig", email: hms.email },
        { name: leader.name, role: "Avdelingsleder", email: leader.email },
      ]),
      conclusions: "Systemet fungerer tilfredsstillende. Noen mindre forbedringer identifisert.",
      decisions: "1. Godkjent budsjett for nytt verneutstyr\n2. Besluttet å gjennomføre ekstra HMS-opplæring\n3. Oppfølging av åpne avvik innen 30 dager",
      actionPlan: JSON.stringify([
        { title: "Bestille nytt verneutstyr", responsible: "HMS", deadline: "2024-12-31" },
        { title: "Planlegge HMS-kurs", responsible: "HR", deadline: "2024-12-15" },
      ]),
      status: "COMPLETED",
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Ledelsens gjennomgang opprettet:", mgmtReview1.title);

  // Opprett eksempel AMU/VO-møte
  const meeting1 = await prisma.meeting.create({
    data: {
      tenantId: tenant.id,
      title: "AMU-møte desember 2024",
      type: "AMU",
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: "Møterom A",
      organizer: leader.id,
      agenda: "1. Sykefravær Q4\n2. HMS-hendelser\n3. Kommende vernerunder\n4. Eventuelt",
      summary: "Møtet ble avholdt med alle tilstede. Sykefraværet har gått ned med 15%.",
      notes: "Alle HMS-hendelser er fulgt opp.",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      {
        meetingId: meeting1.id,
        userId: adminUser.id,
        role: "CHAIR",
        attended: true,
      },
      {
        meetingId: meeting1.id,
        userId: hms.id,
        role: "SECRETARY",
        attended: true,
      },
      {
        meetingId: meeting1.id,
        userId: vern.id,
        role: "MEMBER",
        attended: true,
      },
      {
        meetingId: meeting1.id,
        userId: employee.id,
        role: "MEMBER",
        attended: false,
      },
    ],
  });

  const decision1 = await prisma.meetingDecision.create({
    data: {
      meetingId: meeting1.id,
      decisionNumber: "AMU-2024-12-01",
      title: "Anskaffe nye ergonomiske stoler",
      description: "Vedtak om å anskaffe nye ergonomiske stoler til kontoret",
      responsibleId: adminUser.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    },
  });

  const decision2 = await prisma.meetingDecision.create({
    data: {
      meetingId: meeting1.id,
      decisionNumber: "AMU-2024-12-02",
      title: "Planlegge ny vernerunde",
      description: "Planlegge ny vernerunde i uke 3",
      responsibleId: vern.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
    },
  });

  console.log("✅ AMU-møte opprettet:", meeting1.title, "med", 4, "deltakere og", 2, "beslutninger");

  // Opprett eksempel anonym varsling
  const whistleblow1 = await prisma.whistleblowing.create({
    data: {
      tenantId: tenant.id,
      caseNumber: "VAR-2024-001",
      accessCode: "ABC123DEF456GHIJ",
      category: "WORK_ENVIRONMENT",
      title: "Bekymring for arbeidsmiljø i Sektor B",
      description: "Det er observert at sikkerhetsprosedyrer ikke alltid følges i produksjonsområdet. Flere ansatte jobber uten påkrevd verneutstyr.",
      occurredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      location: "Produksjon - Sektor B",
      involvedPersons: "Ukjent - flere personer observert",
      isAnonymous: true,
      status: "UNDER_INVESTIGATION",
      severity: "MEDIUM",
      handledBy: hms.id,
      assignedTo: hms.id,
      acknowledgedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      investigatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.whistleblowMessage.createMany({
    data: [
      {
        whistleblowingId: whistleblow1.id,
        sender: "SYSTEM",
        message: `Varsling mottatt med saksnummer ${whistleblow1.caseNumber}. Bruk tilgangskoden din for å følge opp saken.`,
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message: "Takk for din varsling. Vi tar dette på alvor og har startet undersøkelse. Du vil få oppdateringer her.",
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "REPORTER",
        message: "Har dere fått gjort noe med dette? Situasjonen er fortsatt uendret.",
      },
      {
        whistleblowingId: whistleblow1.id,
        sender: "HANDLER",
        message: "Vi har gjennomført observasjoner og vil holde sikkerhetsmøte med alle i neste uke. Verneutstyr vil bli kontrollert.",
      },
    ],
  });

  console.log("✅ Varsling opprettet:", whistleblow1.caseNumber, "med", 4, "meldinger");

  // Opprett eksempel kundetilbakemeldinger (CustomerFeedback - ISO 10002)
  const feedback1 = await prisma.customerFeedback.create({
    data: {
      tenantId: tenant.id,
      recordedById: adminUser.id,
      customerName: "Ole Hansen",
      customerCompany: "Hansen Bygg AS",
      contactEmail: "ole@hansenbygg.no",
      source: "EMAIL",
      sentiment: "POSITIVE",
      rating: 5,
      summary: "Veldig fornøyd med leveransen og oppfølgingen",
      details: "Rask responstid og god kommunikasjon gjennom hele prosjektet. Anbefales!",
      feedbackDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      followUpStatus: "CLOSED",
      followUpOwnerId: hms.id,
      followUpNotes: "Takket for tilbakemeldingen og registrert i KPI-rapporten.",
      linkedGoalId: goal2.id, // Kundetilfredshet-målet
    },
  });

  const feedback2 = await prisma.customerFeedback.create({
    data: {
      tenantId: tenant.id,
      recordedById: leader.id,
      customerName: "Kari Nordmann",
      customerCompany: "Nordmann Industri",
      contactEmail: "kari@nordmann-industri.no",
      contactPhone: "+47 987 65 432",
      source: "PHONE",
      sentiment: "NEUTRAL",
      rating: 3,
      summary: "Ønsker bedre dokumentasjon på leveranser",
      details: "Produktet er bra, men dokumentasjonen kunne vært bedre. Spesielt ønskes tydeligere brukerveiledning.",
      feedbackDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      followUpStatus: "FOLLOW_UP",
      followUpOwnerId: hms.id,
      followUpNotes: "Skal utarbeide forbedret dokumentasjon innen neste leveranse.",
    },
  });

  const feedback3 = await prisma.customerFeedback.create({
    data: {
      tenantId: tenant.id,
      recordedById: hms.id,
      customerName: "Per Olsen",
      customerCompany: "Olsen Transport",
      source: "MEETING",
      sentiment: "NEGATIVE",
      rating: 2,
      summary: "Klage på forsinket leveranse",
      details: "Leveransen kom 3 dager for sent, noe som skapte problemer for vår produksjon. Ønsker kompensasjon.",
      feedbackDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      followUpStatus: "NEW",
      linkedIncidentId: complaintIncident.id, // Koblet til kundeklage-hendelsen
    },
  });

  const feedback4 = await prisma.customerFeedback.create({
    data: {
      tenantId: tenant.id,
      recordedById: employee.id,
      customerCompany: "Anonym bedrift",
      source: "SURVEY",
      sentiment: "POSITIVE",
      rating: 4,
      summary: "God kvalitet på HMS-opplæringen",
      details: "Ansatte satte pris på den grundige HMS-opplæringen som ble gjennomført. Godt forberedt og engasjerende instruktør.",
      feedbackDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      followUpStatus: "CLOSED",
    },
  });

  console.log("✅ Kundetilbakemeldinger opprettet:", 4, "stk");
  } else {
    console.log("ℹ️  Databasen har allerede data - demo-data hoppes over for å beskytte eksisterende data");
  }

  console.log("\n🎉 Seeding fullført!");
  console.log("\n📊 DEMO DATA OPPSUMMERING:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄 Dokumenter:               2");
  console.log("⚠️  Risikoer:                 2");
  console.log("🚨 Hendelser:                3");
  console.log("✅ Tiltak:                   2");
  console.log("🎯 Mål:                      4");
  console.log("📚 Opplæring:                2");
  console.log("🧪 Kjemikalier:              2");
  console.log("🌿 Miljøaspekter:            2");
  console.log("🔍 Vernerunder:              1 (med 2 funn)");
  console.log("📋 Revisjoner:               2 (med 2 funn)");
  console.log("📊 Ledelsens gjennomgang:    1");
  console.log("🤝 AMU-møter:                1 (med 4 deltakere)");
  console.log("🔒 Varslinger:               1 (med 4 meldinger)");
  console.log("💬 Tilbakemeldinger:         4");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📝 Test pålogginger:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🛡️  Superadmin:     superadmin@hmsnova.com / superadmin123");
  console.log("🎧 Support:        support@hmsnova.com / support123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Admin:          admin@test.no / admin123");
  console.log("⚡ HMS-ansvarlig:  hms@test.no / hms123");
  console.log("👔 Leder:          leder@test.no / leder123");
  console.log("🛡️  Verneombud:    vern@test.no / vern123");
  console.log("👷 Ansatt:         ansatt@test.no / ansatt123");
  console.log("🏥 BHT:            bht@test.no / bht123");
  console.log("📋 Revisor:        revisor@test.no / revisor123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔗 Varslingssiden for Test Bedrift AS:");
  console.log("   https://hmsnova.com/varsling/test-bedrift");
  console.log("   Tilgangskode for sporing: ABC123DEF456GHIJ");
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

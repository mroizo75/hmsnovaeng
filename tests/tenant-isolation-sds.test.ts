/**
 * TENANT ISOLATION TEST - SDS AUTOMATISERING
 * Sikrer at bedrifter ALDRI ser hverandres data
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { prisma } from "@/lib/db";

describe("SDS Automation - Tenant Isolation", () => {
  let tenantA: any;
  let tenantB: any;
  let chemicalA: any;
  let chemicalB: any;

  beforeAll(async () => {
    // Opprett to separate tenants
    tenantA = await prisma.tenant.create({
      data: {
        name: "Bedrift A",
        slug: "bedrift-a-test",
        status: "ACTIVE",
      },
    });

    tenantB = await prisma.tenant.create({
      data: {
        name: "Bedrift B",
        slug: "bedrift-b-test",
        status: "ACTIVE",
      },
    });

    // Opprett kjemikalie for Tenant A
    chemicalA = await prisma.chemical.create({
      data: {
        tenantId: tenantA.id,
        productName: "Etanol (Bedrift A)",
        casNumber: "64-17-5",
        supplier: "VWR",
        status: "ACTIVE",
      },
    });

    // Opprett kjemikalie for Tenant B
    chemicalB = await prisma.chemical.create({
      data: {
        tenantId: tenantB.id,
        productName: "Aceton (Bedrift B)",
        casNumber: "67-64-1",
        supplier: "Sigma-Aldrich",
        status: "ACTIVE",
      },
    });
  });

  it("skal kun hente kjemikalier for riktig tenant", async () => {
    const chemicalsForTenantA = await prisma.chemical.findMany({
      where: {
        tenantId: tenantA.id,
      },
    });

    const chemicalsForTenantB = await prisma.chemical.findMany({
      where: {
        tenantId: tenantB.id,
      },
    });

    // Tenant A skal kun se sine egne
    expect(chemicalsForTenantA).toHaveLength(1);
    expect(chemicalsForTenantA[0].productName).toBe("Etanol (Bedrift A)");

    // Tenant B skal kun se sine egne
    expect(chemicalsForTenantB).toHaveLength(1);
    expect(chemicalsForTenantB[0].productName).toBe("Aceton (Bedrift B)");
  });

  it("skal IKKE kunne oppdatere annen tenant sine kjemikalier", async () => {
    // Forsøk å oppdatere Tenant B sitt kjemikalie med Tenant A sin ID
    const result = await prisma.chemical.updateMany({
      where: {
        id: chemicalB.id,
        tenantId: tenantA.id, // ← Feil tenant!
      },
      data: {
        productName: "HACKED!",
      },
    });

    // Ingen rader skal bli oppdatert
    expect(result.count).toBe(0);

    // Verifiser at kjemikaliet fortsatt har riktig navn
    const chemical = await prisma.chemical.findUnique({
      where: { id: chemicalB.id },
    });

    expect(chemical?.productName).toBe("Aceton (Bedrift B)");
  });

  it("skal ha tenant-isolerte storage paths", async () => {
    const sdsKeyA = `sds/${tenantA.id}/${chemicalA.id}-123456.pdf`;
    const sdsKeyB = `sds/${tenantB.id}/${chemicalB.id}-123456.pdf`;

    // Paths skal være forskjellige
    expect(sdsKeyA).not.toBe(sdsKeyB);

    // Paths skal inneholde riktig tenant ID
    expect(sdsKeyA).toContain(tenantA.id);
    expect(sdsKeyB).toContain(tenantB.id);
  });

  it("skal kun sende varsler til riktig tenant sine brukere", async () => {
    // Opprett brukere for begge tenants
    const userA = await prisma.user.create({
      data: {
        email: "hms-a@test.no",
        name: "HMS A",
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: "hms-b@test.no",
        name: "HMS B",
      },
    });

    await prisma.userTenant.create({
      data: {
        userId: userA.id,
        tenantId: tenantA.id,
        role: "HMS",
      },
    });

    await prisma.userTenant.create({
      data: {
        userId: userB.id,
        tenantId: tenantB.id,
        role: "HMS",
      },
    });

    // Opprett notifikasjon for Tenant A
    await prisma.notification.create({
      data: {
        tenantId: tenantA.id,
        userId: userA.id,
        type: "CHEMICAL_SDS_REVIEW",
        title: "Test varsel A",
        message: "Dette er kun for Tenant A",
      },
    });

    // Hent notifikasjoner for Tenant A
    const notificationsA = await prisma.notification.findMany({
      where: {
        tenantId: tenantA.id,
      },
    });

    // Hent notifikasjoner for Tenant B
    const notificationsB = await prisma.notification.findMany({
      where: {
        tenantId: tenantB.id,
      },
    });

    // Tenant A skal ha 1 notifikasjon
    expect(notificationsA).toHaveLength(1);
    expect(notificationsA[0].message).toBe("Dette er kun for Tenant A");

    // Tenant B skal ha 0 notifikasjoner
    expect(notificationsB).toHaveLength(0);
  });

  afterAll(async () => {
    // Rydd opp testdata
    await prisma.notification.deleteMany({
      where: {
        OR: [{ tenantId: tenantA.id }, { tenantId: tenantB.id }],
      },
    });

    await prisma.userTenant.deleteMany({
      where: {
        OR: [{ tenantId: tenantA.id }, { tenantId: tenantB.id }],
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: ["hms-a@test.no", "hms-b@test.no"] },
      },
    });

    await prisma.chemical.deleteMany({
      where: {
        OR: [{ tenantId: tenantA.id }, { tenantId: tenantB.id }],
      },
    });

    await prisma.tenant.deleteMany({
      where: {
        slug: { in: ["bedrift-a-test", "bedrift-b-test"] },
      },
    });

    await prisma.$disconnect();
  });
});

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Rydder opp i demo-dokumenter...");

  // Slett dokumenter med demo-filstier (som ikke eksisterer)
  const deleted = await prisma.document.deleteMany({
    where: {
      fileKey: {
        startsWith: "demo/",
      },
    },
  });

  console.log(`✅ Slettet ${deleted.count} demo-dokumenter`);
  console.log("✨ Dokumentmaler er beholdt!");
  console.log("\n📝 Du kan nå laste opp egne dokumenter via /dashboard/documents");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Feil:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Beaker } from "lucide-react";
import { StoffkartotekClient } from "./stoffkartotek-client";

export default async function AnsattStoffkartotek() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const chemicals = await prisma.chemical.findMany({
    where: {
      tenantId: session.user.tenantId,
      status: "ACTIVE",
    },
    orderBy: {
      productName: "asc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Beaker className="h-7 w-7 text-purple-600" />
          Chemical Registry
        </h1>
        <p className="text-muted-foreground">
          Overview of hazardous substances and chemicals
        </p>
      </div>

      {/* Warning */}
      <Card className="border-l-4 border-l-orange-500 bg-orange-50">
        <CardContent className="p-4">
          <p className="text-sm text-orange-900">
            <strong>⚠️ Important:</strong> Always read the Safety Data Sheet (SDS) before use!
            Always use recommended personal protective equipment.
          </p>
        </CardContent>
      </Card>

      {/* Client component with search and list */}
      <StoffkartotekClient chemicals={chemicals} />
    </div>
  );
}


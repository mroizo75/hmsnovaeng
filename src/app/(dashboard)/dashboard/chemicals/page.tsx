import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, AlertTriangle, CheckCircle, Clock, Archive, Search } from "lucide-react";
import Link from "next/link";
import { ChemicalList } from "@/features/chemicals/components/chemical-list";
import { PageHelpDialog } from "@/components/dashboard/page-help-dialog";
import { helpContent } from "@/lib/help-content";

export default async function ChemicalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!user || user.tenants.length === 0) {
    return <div>Du er ikke tilknyttet en tenant.</div>;
  }

  const tenantId = user.tenants[0].tenantId;

  // Hent alle kjemikalier
  const chemicals = await prisma.chemical.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  // Statistikk
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: chemicals.length,
    active: chemicals.filter((c) => c.status === "ACTIVE").length,
    missingSDS: chemicals.filter((c) => !c.sdsKey).length,
    needsReview: chemicals.filter(
      (c) => c.nextReviewDate && new Date(c.nextReviewDate) <= thirtyDaysFromNow
    ).length,
    overdue: chemicals.filter(
      (c) => c.nextReviewDate && new Date(c.nextReviewDate) < now
    ).length,
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Stoffkartotek</h1>
            <p className="text-sm text-muted-foreground">
              HMS - Oversikt over kjemikalier og sikkerhetsdatablad
            </p>
          </div>
          <PageHelpDialog content={helpContent.chemicals} />
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/dashboard/chemicals/isocyanate-scan">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Skann for isocyanater</span>
              <span className="sm:hidden">Skann</span>
            </Button>
          </Link>
          <Link href="/dashboard/chemicals/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Registrer
            </Button>
          </Link>
        </div>
      </div>

      {/* HMS Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-2">
                HMS-krav til stoffkartotek
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Alle farlige kjemikalier skal være registrert i stoffkartoteket</li>
                <li>Oppdaterte sikkerhetsdatablad må være tilgjengelige for ansatte</li>
                <li>Databladene skal gjennomgås minimum årlig</li>
                <li>Ansatte skal ha opplæring i sikker håndtering</li>
                <li>Stoffkartoteket skal kontrolleres ved interne revisjoner</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">kjemikalier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">I bruk</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">aktive produkter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mangler datablad</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.missingSDS}</div>
            <p className="text-xs text-muted-foreground">må lastes opp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trenger revisjon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">neste 30 dager</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forfalt revisjon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">krever handling</p>
          </CardContent>
        </Card>
      </div>

      {/* Chemicals List */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Alle kjemikalier</CardTitle>
          <CardDescription>Oversikt over registrerte produkter i stoffkartoteket</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ChemicalList chemicals={chemicals} />
        </CardContent>
      </Card>
    </div>
  );
}


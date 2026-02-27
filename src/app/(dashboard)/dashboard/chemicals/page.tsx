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

export default async function ChemicalsPage({
  searchParams,
}: {
  searchParams: Promise<{ isocyanates?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const initialIsocyanateFilter = params?.isocyanates === "1" ? "only" : undefined;
  const initialQuickFilter =
    params?.filter === "missingSds"
      ? "missingSds"
      : params?.filter === "needsReview"
        ? "needsReview"
        : params?.filter === "overdue"
          ? "overdue"
          : undefined;
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
    return <div>You are not associated with a tenant.</div>;
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

  const withIsocyanates = chemicals.filter((c) => c.containsIsocyanates).length;

  const stats = {
    total: chemicals.length,
    active: chemicals.filter((c) => c.status === "ACTIVE").length,
    withIsocyanates,
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
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Chemical Registry</h1>
            <p className="text-sm text-muted-foreground">
              H&S - Overview of chemicals and safety data sheets
            </p>
          </div>
          <PageHelpDialog content={helpContent.chemicals} />
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/dashboard/chemicals/isocyanate-scan">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Scan for isocyanates</span>
              <span className="sm:hidden">Scan</span>
            </Button>
          </Link>
          <Link href="/dashboard/chemicals/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Register
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
                H&S requirements for chemical registry
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>All hazardous chemicals must be registered in the chemical registry</li>
                <li>Updated safety data sheets must be available to employees</li>
                <li>Data sheets must be reviewed at least annually</li>
                <li>Employees must receive training in safe handling</li>
                <li>The chemical registry must be checked during internal audits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">chemicals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">active products</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/chemicals?isocyanates=1">
          <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diisocyanates</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withIsocyanates}</div>
              <p className="text-xs text-muted-foreground">require special training</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/dashboard/chemicals?filter=missingSds"
          className={stats.missingSDS === 0 ? "pointer-events-none" : ""}
        >
          <Card
            className={`h-full transition-colors ${
              stats.missingSDS > 0 ? "hover:bg-accent/50 cursor-pointer" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing SDS</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.missingSDS}</div>
              <p className="text-xs text-muted-foreground">need to be uploaded</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/dashboard/chemicals?filter=needsReview"
          className={stats.needsReview === 0 ? "pointer-events-none" : ""}
        >
          <Card
            className={`h-full transition-colors ${
              stats.needsReview > 0 ? "hover:bg-accent/50 cursor-pointer" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
              <p className="text-xs text-muted-foreground">next 30 days</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/dashboard/chemicals?filter=overdue"
          className={stats.overdue === 0 ? "pointer-events-none" : ""}
        >
          <Card
            className={`h-full transition-colors ${
              stats.overdue > 0 ? "hover:bg-accent/50 cursor-pointer" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">requires action</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Chemicals List */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>All Chemicals</CardTitle>
          <CardDescription>Overview of registered products in the chemical registry</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ChemicalList
            chemicals={chemicals}
            initialIsocyanateFilter={initialIsocyanateFilter}
            initialQuickFilter={initialQuickFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}


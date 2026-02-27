import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "OHS Administration | EHS Nova",
  description: "Manage occupational health service clients",
};

export default async function BhtAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.isSuperAdmin && !user?.isSupport) {
    redirect("/dashboard");
  }

  // Fetch all OHS clients with related data
  const bhtClients = await prisma.bhtClient.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          industry: true,
          employeeCount: true,
          contactPerson: true,
          contactEmail: true,
        },
      },
      assessments: {
        where: { year: new Date().getFullYear() },
        take: 1,
      },
      consultations: {
        where: {
          conductedAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      amoMeetings: {
        where: { year: new Date().getFullYear() },
        take: 1,
      },
      inspections: {
        where: { year: new Date().getFullYear() },
        take: 1,
      },
      exposureAssessments: {
        where: { year: new Date().getFullYear() },
        take: 1,
      },
      annualReports: {
        where: { year: new Date().getFullYear() },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Statistics
  const currentYear = new Date().getFullYear();
  const activeClients = bhtClients.filter((c) => c.status === "ACTIVE").length;
  const completedAssessments = bhtClients.filter(
    (c) => c.assessments[0]?.status === "COMPLETED"
  ).length;
  const completedReports = bhtClients.filter(
    (c) => c.annualReports[0]?.status === "COMPLETED"
  ).length;

  // Clients missing deliverables this year
  const clientsNeedingAction = bhtClients.filter((c) => {
    if (c.status !== "ACTIVE") return false;
    const hasAssessment = c.assessments[0]?.status === "COMPLETED";
    const hasAmoOrInspection =
      c.amoMeetings[0]?.status === "COMPLETED" ||
      c.inspections[0]?.status === "COMPLETED";
    const hasExposure = c.exposureAssessments[0]?.status === "COMPLETED";
    const hasReport = c.annualReports[0]?.status === "COMPLETED";
    return !hasAssessment || !hasAmoOrInspection || !hasExposure || !hasReport;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "PAUSED":
        return <Badge variant="secondary">Paused</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function getDeliveryStatus(client: (typeof bhtClients)[0]) {
    const items = [
      { name: "Assessment", done: client.assessments[0]?.status === "COMPLETED" },
      {
        name: "EHS Committee/Inspection",
        done:
          client.amoMeetings[0]?.status === "COMPLETED" ||
          client.inspections[0]?.status === "COMPLETED",
      },
      { name: "Exposure", done: client.exposureAssessments[0]?.status === "COMPLETED" },
      { name: "Annual report", done: client.annualReports[0]?.status === "COMPLETED" },
    ];
    const completed = items.filter((i) => i.done).length;
    return { items, completed, total: items.length };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            OHS Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage occupational health service clients and deliverables
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/bht/new">
            <Plus className="h-4 w-4 mr-2" />
            New OHS client
          </Link>
        </Button>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              of {bhtClients.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments {currentYear}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments}</div>
            <p className="text-xs text-muted-foreground">
              of {activeClients} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual reports {currentYear}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReports}</div>
            <p className="text-xs text-muted-foreground">
              of {activeClients} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs follow-up</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {clientsNeedingAction.length}
            </div>
            <p className="text-xs text-muted-foreground">
              clients missing deliverables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Internal disclaimer */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 italic">
            <strong>Standard internal disclaimer:</strong> AI is used as decision support.
            Final assessments and recommendations have been professionally reviewed and approved by the occupational health service.
          </p>
        </CardContent>
      </Card>

      {/* Clients needing follow-up */}
      {clientsNeedingAction.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Calendar className="h-5 w-5" />
              Clients needing follow-up in {currentYear}
            </CardTitle>
            <CardDescription>
              These clients have not completed all deliverables for the base package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientsNeedingAction.slice(0, 5).map((client) => {
                const delivery = getDeliveryStatus(client);
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{client.tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.tenant.industry || "Unknown industry"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {delivery.items.map((item, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              item.done ? "bg-green-500" : "bg-gray-300"
                            }`}
                            title={`${item.name}: ${item.done ? "Completed" : "Missing"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {delivery.completed}/{delivery.total}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/bht/${client.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All OHS clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All OHS clients
          </CardTitle>
          <CardDescription>
            Overview of all clients with OHS agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bhtClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No OHS clients registered yet</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/bht/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add first client
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bhtClients.map((client) => {
                const delivery = getDeliveryStatus(client);
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{client.tenant.name}</p>
                          {getStatusBadge(client.status)}
                          <Badge variant="outline">
                            {client.packageType === "BASIC" ? "Base package" : "Extended"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{client.tenant.industry || "Unknown industry"}</span>
                          {client.tenant.employeeCount && (
                            <span>{client.tenant.employeeCount} employees</span>
                          )}
                          <span>Contract: {new Date(client.contractStartDate).toLocaleDateString("en-US")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Delivery status */}
                      <div className="hidden md:flex items-center gap-2">
                        {delivery.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1" title={item.name}>
                            {item.done ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Consultations this year */}
                      <div className="text-center">
                        <p className="text-lg font-bold">{client.consultations.length}</p>
                        <p className="text-xs text-muted-foreground">consultations</p>
                      </div>

                      <Button variant="outline" asChild>
                        <Link href={`/admin/bht/${client.id}`}>Manage</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

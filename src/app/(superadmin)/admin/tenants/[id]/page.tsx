import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTenantDetails, toggleTenantStatus } from "@/server/actions/tenant.actions";
import { EditTenantForm } from "@/features/admin/components/edit-tenant-form";
import { UpdateAdminEmailForm } from "@/features/admin/components/update-admin-email-form";
import { ResendActivationForm } from "@/features/admin/components/resend-activation-form";
import { DeleteTenantDialog } from "@/features/admin/components/delete-tenant-dialog";
import { TenantActivityTimeline } from "@/features/admin/components/tenant-activity-timeline";
import { TenantOfferCard } from "@/features/admin/components/tenant-offer-card";
import { 
  ArrowLeft,
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Users, 
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Bedriftsdetaljer | HMS Nova Admin",
};

async function TenantDetails({ id }: { id: string }) {
  const result = await getTenantDetails(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const tenant = result.data;
  const adminUser = tenant.users.find((ut) => ut.role === "ADMIN")?.user;
  const hasSubscription = !!tenant.subscription;
  const lastManagementReview = tenant.managementReviews?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/tenants">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{tenant.name}</h1>
          <p className="text-muted-foreground">
            {tenant.slug} • Org.nr: {tenant.orgNumber || "Ikke oppgitt"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              tenant.status === "ACTIVE"
                ? "default"
                : tenant.status === "TRIAL"
                ? "secondary"
                : "destructive"
            }
          >
            {tenant.status === "ACTIVE" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {tenant.status === "SUSPENDED" && <AlertCircle className="h-3 w-3 mr-1" />}
            {tenant.status === "CANCELLED" && <AlertCircle className="h-3 w-3 mr-1" />}
            {tenant.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{tenant._count.users}</p>
                    <p className="text-xs text-muted-foreground">Brukere</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{tenant._count.documents}</p>
                    <p className="text-xs text-muted-foreground">Dokumenter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{tenant._count.incidents}</p>
                    <p className="text-xs text-muted-foreground">Avvik</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{tenant._count.risks}</p>
                    <p className="text-xs text-muted-foreground">Risikoer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bedriftsinformasjon</CardTitle>
              <CardDescription>
                Basic information about the company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditTenantForm tenant={tenant} />
            </CardContent>
          </Card>

          {/* Annual EHS plan / Management review */}
          <Card>
            <CardHeader>
              <CardTitle>Annual EHS plan</CardTitle>
              <CardDescription>
                Configuration for annual EHS plan and management review for this company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Annual EHS plan
                  </p>
                  <p className="mt-1 font-medium">
                    {tenant.hmsAnnualPlanEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Management review frequency
                  </p>
                  <p className="mt-1 font-medium">
                    Every {tenant.managementReviewFrequencyMonths} month
                    {tenant.managementReviewFrequencyMonths !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Last review
                  </p>
                  <p className="mt-1 font-medium">
                    {lastManagementReview
                      ? format(new Date(lastManagementReview.reviewDate), "MMM d, yyyy", { locale: enUS })
                      : "None registered"}
                  </p>
                </div>
              </div>
              {lastManagementReview && (
                <p className="text-xs text-muted-foreground">
                  The next recommended management review is automatically calculated based on the selected frequency
                  and used in the notification engine for this tenant.
                </p>
              )}
            </CardContent>
          </Card>

          <TenantActivityTimeline tenantId={tenant.id} activities={tenant.activities || []} />
          <TenantOfferCard tenant={tenant} />

          {/* Subscription Info */}
          {hasSubscription && (
            <Card>
              <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Subscription information and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Plan
                    </label>
                    <p className="font-medium mt-1">{tenant.subscription.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Price
                    </label>
                    <p className="font-medium mt-1 text-primary">
                      ${tenant.subscription.price.toLocaleString("en-US")}
                      <span className="text-sm text-muted-foreground">
                        /{tenant.subscription.billingInterval === "YEARLY" ? "yr" : "mo"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="font-medium mt-1">
                      <Badge variant={tenant.subscription.status === "ACTIVE" ? "default" : "secondary"}>
                        {tenant.subscription.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {tenant.subscription.currentPeriodEnd && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">
                        Period expires
                      </label>
                    </div>
                    <p className="font-medium mt-1">
                      {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Invoices */}
          {tenant.invoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Siste fakturaer</CardTitle>
                <CardDescription>
                  De {tenant.invoices.length} siste fakturaene
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {invoice.amount.toLocaleString("nb-NO")} kr
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.createdAt).toLocaleDateString("nb-NO")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "PAID"
                            ? "default"
                            : invoice.status === "OVERDUE"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle>Brukere ({tenant.users.length})</CardTitle>
              <CardDescription>
                Alle brukere tilknyttet denne bedriften
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenant.users.map((userTenant) => (
                  <div
                    key={userTenant.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{userTenant.user.name || "Ukjent"}</p>
                      <p className="text-sm text-muted-foreground">
                        {userTenant.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Opprettet: {new Date(userTenant.user.createdAt).toLocaleDateString("nb-NO")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {userTenant.user.emailVerified && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verifisert
                        </Badge>
                      )}
                      <Badge variant="secondary">{userTenant.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tidslinje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Registered</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {tenant.onboardingCompletedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Activated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tenant.onboardingCompletedAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {tenant.trialEndsAt && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Trial period expires</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tenant.trialEndsAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Admin Email */}
          {adminUser && (
            <Card>
              <CardHeader>
                <CardTitle>Change admin email</CardTitle>
                <CardDescription>
                  Update the email address of the admin user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateAdminEmailForm
                  tenantId={tenant.id}
                  currentEmail={adminUser.email}
                />
              </CardContent>
            </Card>
          )}

          {/* Resend Activation */}
          <Card>
            <CardHeader>
              <CardTitle>Resend activation</CardTitle>
              <CardDescription>
                Send new activation email with login information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResendActivationForm
                tenantId={tenant.id}
                defaultEmail={adminUser?.email || tenant.contactEmail || ""}
              />
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Manage status</CardTitle>
              <CardDescription>
                Change company status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tenant.status !== "ACTIVE" && (
                <form action={async () => {
                  "use server";
                  await toggleTenantStatus(tenant.id, "ACTIVE");
                }}>
                  <Button type="submit" variant="default" className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate company
                  </Button>
                </form>
              )}
              {tenant.status !== "SUSPENDED" && (
                <form action={async () => {
                  "use server";
                  await toggleTenantStatus(tenant.id, "SUSPENDED");
                }}>
                  <Button type="submit" variant="outline" className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Suspend company
                  </Button>
                </form>
              )}
              {tenant.status !== "CANCELLED" && (
                <form action={async () => {
                  "use server";
                  await toggleTenantStatus(tenant.id, "CANCELLED");
                }}>
                  <Button type="submit" variant="destructive" className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Cancel company
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Delete Tenant */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Delete company and all associated data permanently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteTenantDialog
                tenantId={tenant.id}
                tenantName={tenant.name}
                tenantStatus={tenant.status}
                counts={{
                  users: tenant._count.users,
                  documents: tenant._count.documents,
                  incidents: tenant._count.incidents,
                  risks: tenant._count.risks,
                }}
              />
              {(tenant.status === "ACTIVE" || tenant.status === "TRIAL") && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Change status to SUSPENDED or CANCELLED before deleting
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function TenantDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading details...</p>
          </CardContent>
        </Card>
      }
    >
      <TenantDetails id={id} />
    </Suspense>
  );
}


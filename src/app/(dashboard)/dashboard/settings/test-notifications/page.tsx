import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmailTestPanel } from "@/features/settings/components/email-test-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Mail, TestTube, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TestNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.tenants.length === 0) {
    return <div>No access to tenant</div>;
  }

  const tenantId = user.tenants[0].tenantId;
  const tenant = user.tenants[0].tenant;

  // Hent alle brukere i tenant for testing
  const tenantUsers = await prisma.user.findMany({
    where: {
      tenants: {
        some: { tenantId },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      notifyByEmail: true,
      notifyBySms: true,
      phone: true,
    },
  });

  // Sjekk om Resend er konfigurert
  const isResendConfigured = !!process.env.RESEND_API_KEY;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/settings">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <TestTube className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Test Email Notifications</h1>
          <p className="text-muted-foreground">
            Send test emails to verify that the notification system is working
          </p>
        </div>
      </div>

      {!isResendConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Resend not configured</AlertTitle>
          <AlertDescription>
            RESEND_API_KEY is not set in the environment variables. Emails will not be sent.
            <br />
            Add <code className="bg-muted px-1 py-0.5 rounded">RESEND_API_KEY=your_api_key</code> to your .env file.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Current email setup for {tenant.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">From Address</p>
              <p className="text-sm font-mono">
                {process.env.RESEND_FROM_EMAIL ?? "noreply@hmsnova.no"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-sm">
                {isResendConfigured ? (
                  <span className="text-green-600 font-medium">✓ Configured</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Not configured</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Number of Users</p>
              <p className="text-sm">{tenantUsers.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Email Notifications</p>
              <p className="text-sm">
                {tenantUsers.filter((u) => u.notifyByEmail).length} of {tenantUsers.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailTestPanel
        currentUser={user}
        tenantUsers={tenantUsers}
        tenantId={tenantId}
        tenantName={tenant.name}
      />
    </div>
  );
}

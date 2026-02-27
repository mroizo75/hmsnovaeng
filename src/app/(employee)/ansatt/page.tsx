import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, AlertCircle, Beaker, GraduationCap, Shield, Bell, ClipboardList, ShieldAlert, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export default async function AnsattDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  // Fetch tenant settings for EHS contact and time registration
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      hmsContactName: true,
      hmsContactPhone: true,
      hmsContactEmail: true,
      timeRegistrationEnabled: true,
    },
  });

  // Get tenant name from session
  const tenantName = session.user.tenantName;

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {session.user.name?.split(" ")[0]}! 👋
        </h2>
        <p className="text-gray-600">
          Here you find everything you need for safe work
        </p>
        {tenantName && (
          <div className="mt-3 pt-3 border-t border-gray-200 lg:hidden">
            <p className="text-sm text-gray-500">
              <span className="font-medium">{tenantName}</span>
            </p>
          </div>
        )}
      </div>

      {/* Important notices */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">Important message</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Remember to review the EHS handbook before starting your workday.
          </p>
        </CardContent>
      </Card>

      {/* Main features – large, touch-friendly buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Documents */}
        <Link href="/ansatt/dokumenter">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Documents</h3>
              <p className="text-xs text-muted-foreground">
                EHS handbook and procedures
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Report incident */}
        <Link href="/ansatt/avvik/ny">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-destructive">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Report</h3>
              <p className="text-xs text-muted-foreground">
                Report an incident or deviation
              </p>
              <Badge variant="destructive" className="mt-2 text-xs">
                Important!
              </Badge>
            </CardContent>
          </Card>
        </Link>

        {/* Chemical registry */}
        <Link href="/ansatt/stoffkartotek">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <Beaker className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Chemicals</h3>
              <p className="text-xs text-muted-foreground">
                Hazardous substances and SDS
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Training */}
        <Link href="/ansatt/opplaering">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Training</h3>
              <p className="text-xs text-muted-foreground">
                Register completed courses
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Forms */}
        <Link href="/ansatt/skjemaer">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Forms</h3>
              <p className="text-xs text-muted-foreground">
                Fill out forms
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Whistleblowing */}
        <Link href="/ansatt/varsling">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <ShieldAlert className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Whistleblowing</h3>
              <p className="text-xs text-muted-foreground">
                Anonymous reporting channel
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Time tracking – only when enabled for the company */}
        {tenant?.timeRegistrationEnabled && (
          <Link href="/ansatt/timeregistrering">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Time Tracking</h3>
                <p className="text-xs text-muted-foreground">
                  Hours and mileage reimbursement
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* My tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="font-medium text-sm">Annual EHS training</p>
                  <p className="text-xs text-muted-foreground">Due: Dec 15</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white">
                Pending
              </Badge>
            </div>

            <div className="text-center py-4 text-sm text-muted-foreground">
              You have no other pending tasks 👍
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency contacts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-red-600">🚨 Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Emergency (Fire/Police/Ambulance):</span>
            <a href="tel:911" className="text-red-600 font-bold text-lg">
              911
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Poison Control:</span>
            <a href="tel:18002221222" className="text-red-600 font-bold text-lg">
              1-800-222-1222
            </a>
          </div>
          {tenant?.hmsContactName && (
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">EHS Coordinator:</span>
                <span className="text-primary font-medium">
                  {tenant.hmsContactName}
                </span>
              </div>
              {tenant.hmsContactPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <a href={`tel:${tenant.hmsContactPhone}`} className="text-primary font-bold">
                    {tenant.hmsContactPhone}
                  </a>
                </div>
              )}
              {tenant.hmsContactEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <a href={`mailto:${tenant.hmsContactEmail}`} className="text-primary text-sm">
                    {tenant.hmsContactEmail}
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

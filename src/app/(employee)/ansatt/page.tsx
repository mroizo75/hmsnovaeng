import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  AlertCircle,
  Beaker,
  GraduationCap,
  Shield,
  Bell,
  ClipboardList,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ChevronRight,
  HardHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export default async function AnsattDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      hmsContactName: true,
      hmsContactPhone: true,
      hmsContactEmail: true,
      timeRegistrationEnabled: true,
    },
  });

  const tenantName = session.user.tenantName;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Welcome header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wide mb-1">
              Employee Portal
            </p>
            <h2 className="text-2xl font-bold">
              Hi, {firstName}! 👋
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Stay safe. Report fast. Work smart.
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-2.5">
            <HardHat className="h-7 w-7 text-white" />
          </div>
        </div>
        {tenantName && (
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-white/70" />
            <p className="text-sm text-white/80 font-medium">{tenantName}</p>
          </div>
        )}
      </div>

      {/* OSHA Compliance badge */}
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-green-800">OSHA 29 CFR 1904 Compliant</p>
          <p className="text-xs text-green-600 truncate">Recordkeeping &amp; Incident Reporting Active</p>
        </div>
        <Badge className="ml-auto bg-green-600 text-white text-[10px] flex-shrink-0">ACTIVE</Badge>
      </div>

      {/* Quick action – Report incident (prominent) */}
      <Link href="/ansatt/avvik/ny">
        <div className="flex items-center gap-4 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors rounded-2xl p-4 shadow-sm cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base">Report Incident / Near Miss</p>
            <p className="text-red-100 text-xs">OSHA 300/301 recordable — tap to report now</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/70 flex-shrink-0" />
        </div>
      </Link>

      {/* Main feature grid */}
      <div className="grid grid-cols-2 gap-3">

        <Link href="/ansatt/dokumenter">
          <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Documents</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  EHS handbook &amp; policies
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ansatt/stoffkartotek">
          <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Beaker className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">HazCom / SDS</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Chemical registry &amp; SDS
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ansatt/opplaering">
          <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Training</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Courses &amp; certifications
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ansatt/skjemaer">
          <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Forms</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Safety checklists
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ansatt/varsling">
          <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Whistleblowing</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Anonymous channel
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {tenant?.timeRegistrationEnabled && (
          <Link href="/ansatt/timeregistrering">
            <Card className="h-full hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-5 text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Time Tracking</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Hours &amp; mileage
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* My tasks */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            My Open Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">Annual EHS Training</p>
                <p className="text-xs text-muted-foreground">Due: Dec 15</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white ml-2 flex-shrink-0 text-xs">
              Pending
            </Badge>
          </div>
          <p className="text-center text-xs text-muted-foreground py-2">
            No other pending tasks 
          </p>
        </CardContent>
      </Card>

      {/* Safety notice */}
      <Card className="border-l-4 border-l-amber-400 bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>Reminder:</strong> Review the EHS handbook before starting your workday.
          </p>
        </CardContent>
      </Card>

      {/* Emergency contacts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Fire / Police / Ambulance</span>
            <a href="tel:911" className="text-red-600 font-bold text-xl tracking-wide">
              911
            </a>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Poison Control</span>
            <a href="tel:18002221222" className="text-red-600 font-semibold text-sm">
              1-800-222-1222
            </a>
          </div>
          {tenant?.hmsContactName && (
            <div className="pt-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">EHS Coordinator</span>
                <span className="text-primary font-semibold text-sm">{tenant.hmsContactName}</span>
              </div>
              {tenant.hmsContactPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Direct phone</span>
                  <a href={`tel:${tenant.hmsContactPhone}`} className="text-primary font-bold text-sm">
                    {tenant.hmsContactPhone}
                  </a>
                </div>
              )}
              {tenant.hmsContactEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <a href={`mailto:${tenant.hmsContactEmail}`} className="text-primary text-xs underline">
                    {tenant.hmsContactEmail}
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom spacer for safe area */}
      <div className="h-2" />
    </div>
  );
}

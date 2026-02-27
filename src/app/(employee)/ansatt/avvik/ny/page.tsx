import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ReportIncidentForm } from "@/components/ansatt/report-incident-form";

export default async function NyttAvvik() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="h-7 w-7 text-red-600" />
          Report Incident
        </h1>
        <p className="text-muted-foreground">
          Report dangerous situations, accidents, or near misses
        </p>
      </div>

      {/* Important message */}
      <Card className="border-l-4 border-l-red-500 bg-red-50">
        <CardContent className="p-4">
          <p className="text-sm text-red-900">
            <strong>🚨 In case of immediate danger:</strong> Call 911 (fire, police, or ambulance) FIRST!
            Then report the incident here.
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Report Form</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportIncidentForm 
            tenantId={session.user.tenantId}
            reportedBy={session.user.name || session.user.email || "Employee"}
          />
        </CardContent>
      </Card>

      {/* OSHA compliance notice */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 border-blue-200">
        <CardContent className="p-4 space-y-3 text-sm">
          <p className="font-semibold text-blue-900">What must be reported? (OSHA 29 CFR 1904)</p>
          <ul className="space-y-1.5 text-blue-800">
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Work-related injuries requiring medical treatment beyond first aid</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Near misses — could have caused injury</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Dangerous conditions or equipment failures</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Chemical spills or HazCom exposures</li>
            <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Missing or defective PPE</li>
          </ul>
          <p className="text-xs text-blue-700">
            All injury reports are logged to OSHA 300 Log and OSHA 301 Incident Report. Reports are handled confidentially.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

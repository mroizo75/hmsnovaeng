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

      {/* Help */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">💡 What should I report?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>✅ Always report:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground ml-2">
              <li>Accidents and personal injuries</li>
              <li>Near misses (could have resulted in injury)</li>
              <li>Dangerous situations</li>
              <li>Defective equipment or tools</li>
              <li>Missing safety equipment</li>
              <li>Pollution or spills</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <strong>📝 Remember:</strong>
            <p className="text-muted-foreground mt-1">
              The more details you provide, the better we can prevent similar incidents.
              All reports are handled confidentially.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

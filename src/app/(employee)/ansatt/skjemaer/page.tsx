import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AnsattSkjemaer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  // Fetch user role
  const userTenant = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    },
    select: {
      role: true,
    },
  });

  const userRole = userTenant?.role || "ANSATT";
  const userId = session.user.id;

  // Fetch all active forms (including global ones)
  const allForms = await prisma.formTemplate.findMany({
    where: {
      OR: [
        { tenantId: session.user.tenantId },
        { isGlobal: true },
      ],
      isActive: true,
    },
    include: {
      _count: {
        select: {
          fields: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter based on access control
  const forms = allForms.filter((form) => {
    if (form.accessType === "ALL") {
      return true;
    }

    if (form.accessType === "ROLES" && form.allowedRoles) {
      try {
        const roles = JSON.parse(form.allowedRoles);
        return roles.includes(userRole);
      } catch {
        return false;
      }
    }

    if (form.accessType === "USERS" && form.allowedUsers) {
      try {
        const users = JSON.parse(form.allowedUsers);
        return users.includes(userId);
      } catch {
        return false;
      }
    }

    if (form.accessType === "ROLES_AND_USERS") {
      try {
        const roles = form.allowedRoles ? JSON.parse(form.allowedRoles) : [];
        const users = form.allowedUsers ? JSON.parse(form.allowedUsers) : [];
        return roles.includes(userRole) || users.includes(userId);
      } catch {
        return false;
      }
    }

    return false;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-green-600" />
          Digital Forms
        </h1>
        <p className="text-muted-foreground">
          Fill out and sign forms digitally
        </p>
      </div>

      {/* Form list */}
      <div className="space-y-3">
        {forms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No forms available at this time
              </p>
            </CardContent>
          </Card>
        ) : (
          forms.map((form) => (
            <Link key={form.id} href={`/ansatt/skjemaer/${form.id}/fill`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-6 w-6 text-green-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{form.title}</h3>
                      
                      {form.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {form.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(form.category)}
                        </Badge>
                        
                        <span className="flex items-center gap-1">
                          {form._count.fields} fields
                        </span>

                        {form.requiresSignature && (
                          <Badge variant="secondary" className="text-xs">
                            ✍️ Requires signature
                          </Badge>
                        )}

                        {form.requiresApproval && (
                          <Badge variant="secondary" className="text-xs">
                            ✅ Requires approval
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Info box */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardContent className="p-4">
          <p className="text-sm text-green-900">
            <strong>💡 Tips:</strong> Tap a form to fill it out.
            If the form requires a signature, you will be able to sign digitally at the end.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    CUSTOM: "Custom",
    MEETING: "Meeting minutes",
    INSPECTION: "Inspection",
    INCIDENT: "Incident report",
    RISK: "Risk assessment",
    TRAINING: "Training",
    CHECKLIST: "Checklist",
    TIMESHEET: "Timesheet",
    WELLBEING: "Psychosocial work environment",
  };
  return labels[category] || category;
}

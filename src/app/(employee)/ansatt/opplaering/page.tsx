import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AnsattOpplaering() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  // Fetch all required courses for this tenant
  // (Show unique courses based on courseKey)
  const allTrainings = await prisma.training.findMany({
    where: {
      tenantId: session.user.tenantId,
      isRequired: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  // Find unique courses based on courseKey
  const availableTrainings = allTrainings.filter(
    (training, index, self) =>
      index === self.findIndex((t) => t.courseKey === training.courseKey)
  );

  // Fetch employee's own training records
  const myTrainings = await prisma.training.findMany({
    where: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            My Training
          </h1>
          <p className="text-muted-foreground">
            Overview of required and completed training
          </p>
        </div>
        <Link href="/ansatt/opplaering/ny">
          <Button>
            <GraduationCap className="h-4 w-4 mr-2" />
            Add own competence
          </Button>
        </Link>
      </div>

      {/* Approval info */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Important:</strong> When you register completed training, it must be approved
            by your manager before it becomes active in the system.
          </p>
        </CardContent>
      </Card>

      {/* Required training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Required Training</span>
            <Badge variant="destructive">{availableTrainings.length} courses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableTrainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No required training at this time
            </div>
          ) : (
            <div className="space-y-3">
              {availableTrainings.map((training) => {
                const hasCompleted = myTrainings.some(
                  (mt) => mt.title === training.title && mt.completedAt
                );
                
                return (
                  <div
                    key={training.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{training.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {training.description}
                        </p>
                      </div>
                    </div>
                    
                    {hasCompleted ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ✓ Completed
                      </Badge>
                    ) : (
                      <Link href={`/ansatt/opplaering/registrer/${training.id}`}>
                        <Button size="sm" variant="outline">
                          Register
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My registered training */}
      <Card>
        <CardHeader>
          <CardTitle>My Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {myTrainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You have not registered any training yet
            </div>
          ) : (
            <div className="space-y-3">
              {myTrainings.map((training) => (
                <Link key={training.id} href={`/ansatt/opplaering/${training.id}`}>
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{training.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                        {training.completedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Completed: {new Date(training.completedAt).toLocaleDateString("en-US")}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      {training.effectiveness === null ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Awaiting approval
                        </Badge>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                          {training.evaluatedBy && (
                            <span className="text-xs text-muted-foreground">
                              Approved by: {training.evaluatedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📚 How does it work?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <p>
            <strong>1. Complete training:</strong> Attend a course or review the material.
          </p>
          <p>
            <strong>2. Register:</strong> Click &quot;Register&quot; and upload proof (certificate, signed list, etc.).
          </p>
          <p>
            <strong>3. Awaiting approval:</strong> Your manager will review and approve the training.
          </p>
          <p>
            <strong>4. Approved:</strong> The training is now registered in your EHS profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

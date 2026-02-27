import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertCircle, ExternalLink, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AnsattVarslingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch tenant info to show unique whistleblowing link
  const userTenant = await prisma.userTenant.findFirst({
    where: { userId: session.user.id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const tenantSlug = userTenant?.tenant?.slug || "";
  const tenantName = userTenant?.tenant?.name || "your company";
  const whistleblowUrl = tenantSlug 
    ? `${process.env.NEXT_PUBLIC_URL || "https://hmsnova.com"}/varsling/${tenantSlug}`
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Anonymous Reporting</h1>
        <p className="text-gray-600">
          A safe and confidential channel for reporting serious concerns
        </p>
      </div>

      {/* Important info */}
      <Alert className="border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>100% confidential and secure</AlertTitle>
        <AlertDescription>
          All reports are handled confidentially. You can choose to remain completely anonymous or provide
          contact information if you wish to receive feedback.
        </AlertDescription>
      </Alert>

      {/* What can be reported */}
      <Card>
        <CardHeader>
          <CardTitle>What can I report?</CardTitle>
          <CardDescription>
            The reporting channel can be used to report serious concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Harassment &amp; discrimination</h3>
                <p className="text-sm text-muted-foreground">
                  Bullying, sexual harassment, discrimination
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">EHS &amp; safety</h3>
                <p className="text-sm text-muted-foreground">
                  Dangerous working conditions, lack of safety
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <Lock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Corruption &amp; fraud</h3>
                <p className="text-sm text-muted-foreground">
                  Financial crime, conflicts of interest
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Ethics &amp; legal violations</h3>
                <p className="text-sm text-muted-foreground">
                  Violations of laws and ethical guidelines
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </span>
              <div className="pt-1">
                <h4 className="font-medium">Fill out the reporting form</h4>
                <p className="text-sm text-muted-foreground">
                  Describe the situation in as much detail as possible. You can choose to remain anonymous.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </span>
              <div className="pt-1">
                <h4 className="font-medium">Receive case number and access code</h4>
                <p className="text-sm text-muted-foreground">
                  You will receive a unique case number and access code to follow up on the case.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </span>
              <div className="pt-1">
                <h4 className="font-medium">The case is handled confidentially</h4>
                <p className="text-sm text-muted-foreground">
                  The EHS coordinator or another case handler will process the report.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                4
              </span>
              <div className="pt-1">
                <h4 className="font-medium">Communicate anonymously</h4>
                <p className="text-sm text-muted-foreground">
                  You can send and receive messages via the tracking page without revealing your identity.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Company whistleblowing link */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {tenantName}&apos;s unique reporting channel
          </CardTitle>
          <CardDescription className="text-green-700">
            This is your company&apos;s own private reporting channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-white border-green-300">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">✅ Reports go directly to {tenantName}</AlertTitle>
            <AlertDescription className="text-green-800">
              All reports submitted via this link go <strong>only</strong> to your company&apos;s EHS coordinator or management.
              No other companies or EHS Nova can see these reports.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg bg-white p-4 border border-green-200">
            <p className="text-sm text-muted-foreground mb-2">Your company&apos;s reporting link:</p>
            <p className="text-lg font-mono font-bold text-green-900 break-all">{whistleblowUrl}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-xs font-medium text-green-900 mb-2">💡 How it works:</p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Reports are stored <strong>only</strong> in {tenantName}&apos;s database</li>
              <li>• Only authorized persons at {tenantName} can read the reports</li>
              <li>• Reports can be 100% anonymous with communication via case number</li>
              <li>• The link can safely be shared with employees and external parties</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Submit new report</CardTitle>
            <CardDescription>
              Create a new anonymous report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {whistleblowUrl ? (
              <Button asChild className="w-full" size="lg">
                <Link href={whistleblowUrl} target="_blank">
                  Submit report
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Reporting link not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Track existing case</CardTitle>
            <CardDescription>
              Follow up on a previous report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/varsling/spor" target="_blank">
                Track my case
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Legal protection */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Legal protection</AlertTitle>
        <AlertDescription>
          As a whistleblower, you are protected under federal and state whistleblower protection laws. You have the right to
          report serious concerns without risk of retaliation. Learn more about your rights at{" "}
          <a
            href="https://www.osha.gov/whistleblower-protection-programs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            OSHA.gov
          </a>
        </AlertDescription>
      </Alert>
    </div>
  );
}

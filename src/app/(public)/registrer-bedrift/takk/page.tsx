import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Mail, Phone } from "lucide-react";

export default function TakkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Thank you for your application!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We have received your application and will process it as quickly as possible. 
            You will receive an email from us within 24 hours with login credentials and further instructions.
          </p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4">What happens next?</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">We process your application</p>
                    <p className="text-sm text-muted-foreground">
                      We set up your company in the system with all necessary modules
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">You receive login credentials</p>
                    <p className="text-sm text-muted-foreground">
                      We send you an email with a link to set your password and log in
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Personal onboarding call</p>
                    <p className="text-sm text-muted-foreground">
                      We reach out to help you get started (15–30 min)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">You&apos;re all set!</p>
                    <p className="text-sm text-muted-foreground">
                      Your 14-day free trial starts when you log in for the first time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button size="lg" variant="outline">
                Back to home
              </Button>
            </Link>
            <Link href="/priser">
              <Button size="lg">
                View pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card className="bg-muted/50 border-0">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Have questions in the meantime?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a
                  href="mailto:support@ehsnova.com"
                  className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  support@ehsnova.com
                </a>
                <a
                  href="tel:+4799112916"
                  className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  +47 99 11 29 16
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import { RingMegDialog } from "@/components/ring-meg-dialog";
import { PRICING_SCHEMA } from "@/lib/seo-schemas";
import { getBreadcrumbSchema } from "@/lib/seo-config";
import { 
  CheckCircle2, 
  ArrowRight,
  Download,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
  BarChart2,
  FlaskConical,
  Bell,
  Smartphone,
  HardDrive,
  Plug,
  HeartHandshake,
  Phone,
  GraduationCap,
  Award,
  Settings,
  RefreshCw,
  Package
} from "lucide-react";

export default function PriserPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/priser" },
  ]);

  const bindingPlans = [
    {
      name: "12 mo commitment",
      description: "Full access to EHS Nova",
      priceMonthly: 29,
      priceYearly: 349,
      features: [
        "12-month subscription",
        "Predictable cost",
        "All inclusive",
      ],
    },
  ];

  const allFeatures = [
    "Unlimited users",
    "Document management with version control",
    "Risk assessment (5x5 matrix)",
    "Incident reporting & 5-Whys analysis",
    "Digital signatures (login-based)",
    "Ready-made EHS handbook",
    "Training module & competence matrix",
    "Audits & Audits (ISO 9001)",
    "Goals & KPI tracking",
    "Chemical registry with safety data sheets",
    "Automatic reminders & notifications",
    "Mobile-optimized solution",
    "Email and phone support",
    "Unlimited storage",
    "API access for integrations",
  ];

  return (
    <>
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(PRICING_SCHEMA),
        }}
        strategy="beforeInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
        strategy="beforeInteractive"
      />
      <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          No hidden costs
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Transparent pricing.<br />No surprises.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Choose the plan that fits your company. All plans include a 14-day free trial period, 
          full access and US support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/registrer-bedrift">
            <Button size="lg" variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Register company
            </Button>
          </Link>
          <Link href="#priser">
            <Button size="lg">
              View pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Value pillars */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Everything in one — nothing extra</h2>
            <p className="text-muted-foreground">One subscription gives you the complete EHS system. All modules. All users. Always up to date.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">All modules included</h3>
                  <p className="text-sm text-muted-foreground">
                    Risk, incidents, audits, documents, training, chemicals — everything in one system from day one
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Actively developed</h3>
                  <p className="text-sm text-muted-foreground">
                    New features and improvements are released regularly — included in your subscription at no extra cost
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Unlimited users</h3>
                  <p className="text-sm text-muted-foreground">
                    Add as many employees as you need. One flat price — no per-user fees, no hidden costs
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="default" className="mb-4">
            EHS Nova is different
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            One price. All inclusive. No surprises.
          </h2>
          <p className="text-muted-foreground">
            We believe in transparent pricing that&apos;s easy to understand
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">All inclusive</h3>
              <p className="text-xs text-muted-foreground mt-1">All features included in the price</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Free support</h3>
              <p className="text-xs text-muted-foreground mt-1">US support included</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="priser" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One package – all inclusive</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Full access to EHS Nova. $29/mo, 12-month subscription.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {bindingPlans.map((plan, index) => (
              <Card key={index} className="relative border-primary shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div>
                      <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                      <span className="text-2xl text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total {"$"}{plan.priceYearly.toLocaleString("en-US")}/yr
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <RegisterDialog>
                    <Button className="w-full" size="lg">
                      Get started
                    </Button>
                  </RegisterDialog>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want us to set up the EHS system for you? We offer setup at a competitive rate – contact sales.
            </p>
            <RingMegDialog
              trigger={
                <Button variant="link" className="text-primary font-medium p-0 h-auto">
                  Contact sales
                </Button>
              }
            />
          </div>

          {/* Required EHS handbook for your company – competitive fixed price */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-base text-foreground">
                    We handle the complete OSHA-compliant EHS handbook for your company
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    We deliver the complete, legally required EHS handbook and setup in EHS Nova for your company at a highly competitive fixed price. You get a complete, legally compliant digital EHS system – simple and affordable – without having to learn templates and requirements yourself. Just reach out.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <RingMegDialog
                    trigger={
                      <Button variant="outline" className="border-primary">
                        <Phone className="mr-2 h-4 w-4" />
                        Call me
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Features Section */}
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-center mb-6">
                  All of this is included:
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Note */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              All prices exclude tax. Invoiced monthly or annually as requested.
            </p>
            <p className="text-sm text-muted-foreground">
              We handle the complete legally required EHS handbook for your company at a highly competitive fixed price – <Link href="/" className="text-primary font-medium hover:underline">contact us</Link> for a quote.
            </p>
          </div>
        </div>
      </section>

      {/* Member benefits */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">🎁 Extra member benefits included!</h2>
              <p className="text-lg text-muted-foreground">
                As an EHS Nova member you get more than a complete EHS system – you also get <strong className="text-green-600">exclusive discounts</strong> on important services:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white border-green-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <GraduationCap className="h-12 w-12 text-green-600" />
                    <h3 className="font-bold text-lg">20% discount on all EHS courses</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ OSHA-required EHS courses (safety reps, management, etc.)</li>
                      <li>✅ First aid for children and adults</li>
                      <li>✅ Specialized courses from EHS Nova (incl. diisocyanates)</li>
                      <li>✅ In-person, digital or hybrid format</li>
                    </ul>
                    <Link href="/hms-kurs">
                      <Button size="sm" variant="outline" className="mt-4">
                        View all courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <HeartHandshake className="h-12 w-12 text-green-600" />
                    <h3 className="font-bold text-lg">OHS from EHS Nova (coming soon)</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ We will become an approved OHS provider within the year</li>
                      <li>✅ Minimum requirements + additional services + courses</li>
                      <li>✅ Diisocyanates and specialized courses via certified partner</li>
                      <li>✅ One place for EHS and OHS</li>
                    </ul>
                    <Link href="/bedriftshelsetjeneste">
                      <Button size="sm" variant="outline" className="mt-4">
                        Learn more about OHS
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-green-200">
              <h4 className="font-bold text-center mb-3">💰 Total value of member benefits:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-700">EHS courses (annual)</p>
                  <p className="text-2xl font-bold text-green-600">~ $200–500</p>
                  <p className="text-xs text-muted-foreground">Depending on number of courses</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-700">OHS from EHS Nova</p>
                  <p className="text-2xl font-bold text-green-600">Coming soon</p>
                  <p className="text-xs text-muted-foreground">One vendor for EHS + OHS + courses</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                <strong>Total:</strong> Save from $200 annually on courses in addition to your EHS Nova subscription!<br />
                <span className="text-xs">(Based on minimum 2 EHS courses per year with 20% member discount)</span>
              </p>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>How to activate?</strong> Course discount activates automatically when you register as an EHS Nova member.<br />
                Provide your EIN/tax ID or member number when ordering courses. For OHS: register interest on the OHS page.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I switch plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade at any time. When upgrading, you get 
                  full access immediately. When downgrading, the change takes effect from the next billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after the free trial period?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After 14 days you will be automatically invoiced for the plan you have chosen. You can 
                  cancel anytime before the trial period expires without being charged.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a user limit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No! EHS Nova includes unlimited users in all plans. 
                  You pay the same price regardless of how many employees you have.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is implementation and training included?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  During the 14-day free trial period you can upload your own documents and set up EHS Nova. 
                  We also offer free onboarding calls to help you get started.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a demo before I decide?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Absolutely! We offer both:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• 14-day free trial with full access</li>
                  <li>• Personal demo via video call (30 min)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data safe?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes. We use bank-level encryption (AES-256), have ISO 27001 certified 
                  servers in the US, and take daily backups. You own 100% of your data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What does the 12 mo commitment mean?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The subscription runs for 12 months at $29/mo ($349/yr). 
                  Full access to all features is included. After 12 months the subscription 
                  renews with 1 month notice period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All modules showcase */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">One subscription — everything included</Badge>
            <h2 className="text-3xl font-bold mb-4">A complete EHS system — live and always growing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              EHS Nova is an actively developed platform. Every module below is included in your subscription — 
              no add-ons, no upgrade tiers, no per-module fees. Ever.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: "Document management", desc: "Version control, digital signatures and approval flows included" },
              { icon: AlertTriangle, title: "Risk assessment", desc: "Full 5×5 matrix with action tracking and follow-up" },
              { icon: ClipboardList, title: "Incident reporting", desc: "Register, investigate with 5-Whys and close out deviations" },
              { icon: Shield, title: "Audits & inspections", desc: "ISO 9001-ready checklists and digital audit reports" },
              { icon: BarChart2, title: "Goals & KPIs", desc: "Set EHS goals, track progress and report to management" },
              { icon: GraduationCap, title: "Training & competence", desc: "Training module with competence matrix and course tracking" },
              { icon: FlaskConical, title: "Chemical registry", desc: "Safety data sheets, exposure assessments and SDS library" },
              { icon: Bell, title: "Automatic reminders", desc: "Smart notifications ensure nothing slips through the cracks" },
              { icon: Smartphone, title: "Mobile-optimized", desc: "Full functionality on any device — in the field or at the desk" },
              { icon: Users, title: "Unlimited users", desc: "Every employee included — no per-user pricing" },
              { icon: HardDrive, title: "Unlimited storage", desc: "Store all your documents and records without limits" },
              { icon: Plug, title: "API access", desc: "Connect EHS Nova to your existing systems and workflows" },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <Card key={idx} className="border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-snug">{title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              New features are released continuously — and always included in your subscription.
            </p>
            <RegisterDialog>
              <Button size="lg">
                Start your 14-day free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </RegisterDialog>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Try EHS Nova free for 14 days. No credit card. No commitments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RegisterDialog>
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white">
                  Get started now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </RegisterDialog>
              <Link href="/registrer-bedrift">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Download className="mr-2 h-5 w-5" />
                  Register company
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-6 text-primary-foreground/70">
              Have questions? Contact us.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
    </>
  );
}

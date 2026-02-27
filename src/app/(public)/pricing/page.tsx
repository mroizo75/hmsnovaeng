"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import { RingMegDialog } from "@/components/ring-meg-dialog";
import {
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Users,
  Zap,
  Phone,
  Award,
  HelpCircle,
} from "lucide-react";

const allFeatures = [
  "Unlimited users — no per-seat charges",
  "Document management with version control",
  "Risk assessment (5×5 probability-severity matrix)",
  "Incident reporting & 5-Whys root cause analysis",
  "OSHA 300 / 300A / 301 log automation",
  "Digital e-signatures (legally binding)",
  "Pre-built EHS handbook & policy templates",
  "Training management & competency matrix",
  "Internal audits & ISO 45001 CAP tracking",
  "Goals, KPIs & performance dashboards",
  "SDS / chemical hazard register (HazCom 2012)",
  "Automated reminders & deadline alerts",
  "Mobile app — works offline in the field",
  "Unlimited secure cloud storage",
  "API access for integrations",
  "Email & phone support included",
];

const comparisonRows = [
  { feature: "Setup / implementation fee", nova: "None", competitor1: "$5,000–$25,000", competitor2: "$10,000+" },

  { feature: "Pre-built EHS handbook", nova: true, competitor1: true, competitor2: false },
  { feature: "OSHA 300 log automation", nova: true, competitor1: false, competitor2: "Add-on" },
  { feature: "ISO 45001 audit module", nova: true, competitor1: true, competitor2: "Varies" },
  { feature: "Digital e-signatures", nova: true, competitor1: false, competitor2: "Extra cost" },
  { feature: "Unlimited users included", nova: true, competitor1: false, competitor2: false },
  { feature: "Offline mobile app", nova: true, competitor1: false, competitor2: "Varies" },
  { feature: "US-based EHS support", nova: true, competitor1: true, competitor2: "Varies" },
  { feature: "Contract length", nova: "12 months", competitor1: "12 months", competitor2: "12–36 months" },
];

const faqs = [
  {
    q: "Can I switch plans or cancel?",
    a: "You can upgrade or modify your subscription at any time. Changes take effect at the start of your next billing cycle. After the 12-month commitment, the subscription renews monthly with 30-day notice to cancel.",
  },
  {
    q: "What happens after the 14-day free trial?",
    a: "After 14 days you are automatically billed for your chosen plan. You can cancel at any time before the trial ends without any charge.",
  },
  {
    q: "Is there truly no per-user fee?",
    a: "Correct. HMS Nova is priced per company — unlimited employees, unlimited user accounts, and all facilities. The price never changes based on headcount.",
  },
  {
    q: "Is implementation and onboarding included?",
    a: "Yes. We provide guided onboarding, EHS handbook templates pre-loaded for your industry, and a complimentary setup call. Most teams are live within one week.",
  },
  {
    q: "Can we get a personalized demo before committing?",
    a: "Absolutely — a 30-minute live product demo is available on request. You can also explore the full platform during the 14-day free trial without any sales pressure.",
  },
  {
    q: "How secure is our data?",
    a: "HMS Nova uses AES-256 encryption at rest and in transit, ISO 27001-certified infrastructure, daily automated backups with geographic redundancy, and SOC 2-aligned security controls. Your data is exclusively yours.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          Transparent pricing — no hidden fees
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          $30/month.<br />Complete EHS coverage.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          One flat subscription covers your entire company — unlimited users, all features, and
          full OSHA compliance tooling. Less than a dollar a day. No modules. No surprises.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RegisterDialog>
            <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              Start Free 14-Day Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </RegisterDialog>
          <RingMegDialog />
        </div>
      </section>

      {/* Why others are expensive */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Why do other EHS systems cost so much?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "High setup fees",
                desc: "$5,000–$25,000 in implementation and consulting costs before you get started.",
              },
              {
                title: "Per-seat pricing",
                desc: "Costs balloon as your workforce grows. More employees = dramatically higher monthly bills.",
              },
              {
                title: "Module upsells",
                desc: "Core features locked behind add-on modules — OSHA recordkeeping, ISO audits, and API access all cost extra.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-destructive/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <X className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="default" className="mb-4">
            HMS Nova is different
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            One price. Everything included. No surprises.
          </h2>
          <p className="text-muted-foreground">We believe enterprise-grade EHS software should be affordable for every business.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            { icon: Shield, title: "All features included", desc: "Every module, every integration" },
            { icon: Users, title: "Unlimited users", desc: "No per-seat charges, ever" },
            { icon: Zap, title: "Free support", desc: "EHS experts available by email & phone" },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6 text-center">
                <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One plan — everything included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Full access to the entire HMS Nova platform. $30/month, 12-month subscription.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Pricing card */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-700 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Professional Plan</CardTitle>
                <CardDescription>Complete EHS management for your entire company</CardDescription>
                <div className="mt-4">
                  <div>
                    <span className="text-5xl font-bold">$30</span>
                    <span className="text-2xl text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed annually — $360/year
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All prices exclude applicable taxes.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2 text-sm">
                  {[
                    "12-month subscription",
                    "Unlimited users & facilities",
                    "All modules included",
                    "Guided onboarding included",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <RegisterDialog>
                  <Button className="w-full bg-green-700 hover:bg-green-800 text-white" size="lg">
                    Start Free 14-Day Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </RegisterDialog>
                <p className="text-xs text-center text-muted-foreground">
                  No credit card required to start
                </p>
              </CardContent>
            </Card>

            {/* Enterprise card */}
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For large organizations with custom requirements</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Custom</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Volume pricing available for multi-site deployments
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2 text-sm">
                  {[
                    "Everything in Professional",
                    "Dedicated account manager",
                    "Custom integrations (ERP, HRIS)",
                    "SSO / SAML authentication",
                    "Custom SLA agreement",
                    "On-site training available",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <RingMegDialog
                  trigger={
                    <Button variant="outline" className="w-full border-primary" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Sales
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Setup offer */}
          <div className="mt-10 max-w-2xl mx-auto">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-base">
                    We&apos;ll build your complete EHS handbook for you
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Our EHS specialists will create your company-specific safety manual, OSHA-required
                    programs, and configure HMS Nova for your industry — so you start fully compliant
                    from day one. Fixed-fee service, contact us for a quote.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <RingMegDialog
                    trigger={
                      <Button variant="outline" className="border-primary">
                        <Phone className="mr-2 h-4 w-4" />
                        Get a Quote
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All features */}
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-center mb-6">
                  Everything included in your subscription:
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How HMS Nova compares</h2>
            <p className="text-muted-foreground">
              See how HMS Nova stacks up against other EHS platforms in the US market
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 text-sm font-medium"></th>
                  <th className="text-center p-4">
                    <div className="font-bold text-primary">HMS Nova</div>
                    <div className="text-sm text-muted-foreground">$30/month</div>
                  </th>
                  <th className="text-center p-4">
                    <div className="font-semibold text-muted-foreground">Mid-tier EHS</div>
                    <div className="text-sm text-muted-foreground">$500–$1,000/month</div>
                  </th>
                  <th className="text-center p-4">
                    <div className="font-semibold text-muted-foreground">Enterprise EHS</div>
                    <div className="text-sm text-muted-foreground">$2,000+/month</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 1 ? "border-b bg-muted/20" : "border-b"}>
                    <td className="p-4 text-sm font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.nova === "boolean" ? (
                        row.nova ? (
                          <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">{row.nova}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.competitor1 === "boolean" ? (
                        row.competitor1 ? (
                          <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.competitor1}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.competitor2 === "boolean" ? (
                        row.competitor2 ? (
                          <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.competitor2}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Pricing FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardHeader>
                  <CardTitle className="text-base flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Try HMS Nova free for 14 days. No credit card. No commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RegisterDialog>
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </RegisterDialog>
              <RingMegDialog
                trigger={
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8">
                    <Phone className="mr-2 h-5 w-5" />
                    Request a Demo
                  </Button>
                }
              />
            </div>
            <p className="text-sm mt-6 text-primary-foreground/70">
              Questions? Email us at us@hmsnova.com
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

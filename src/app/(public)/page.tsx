import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RegisterDialog } from "@/components/register-dialog";
import { RingMegDialog } from "@/components/ring-meg-dialog";
import {
  CheckCircle2,
  Shield,
  Users,
  FileText,
  TrendingUp,
  Lock,
  Zap,
  Globe,
  HeartHandshake,
  ArrowRight,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  BookOpen,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HMS Nova — Enterprise EHS Management Software for US Businesses",
  description:
    "The most powerful EHS management platform built for OSHA compliance, ISO 45001 certification, and workplace safety. Unlimited users. $30/month flat. Built for American businesses.",
  keywords: [
    "EHS software USA",
    "OSHA compliance software",
    "ISO 45001 management system",
    "workplace safety platform",
    "EHS management system",
    "incident reporting software",
    "safety management software",
  ],
  alternates: { canonical: "https://hmsnova.com/" },
  openGraph: {
    title: "HMS Nova — Enterprise EHS Management Software for US Businesses",
    description:
      "OSHA-ready. ISO 45001-aligned. Unlimited users. One platform for complete environmental, health & safety management.",
    url: "https://hmsnova.com/",
    type: "website",
  },
};

const stats = [
  { value: "500+", label: "Businesses Trust HMS Nova" },
  { value: "99.9%", label: "Platform Uptime SLA" },
  { value: "10 hrs", label: "Saved per Week on Average" },
  { value: "100%", label: "OSHA-Ready Architecture" },
];

const features = [
  {
    icon: FileText,
    title: "Document Management",
    items: [
      "Version control & full audit trail",
      "Approval workflows with e-signatures",
      "Automated archiving & retention",
    ],
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    items: [
      "5×5 probability-severity matrix",
      "OSHA JSA/JHA workflows",
      "Corrective action tracking",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Incident Reporting",
    items: [
      "OSHA 300/300A/301 log management",
      "5-Whys root cause analysis",
      "Mobile field reporting (offline-ready)",
    ],
  },
  {
    icon: BookOpen,
    title: "Training & Competency",
    items: [
      "Skills matrix per role",
      "Certification & renewal tracking",
      "OSHA-required training records",
    ],
  },
  {
    icon: ClipboardList,
    title: "Audits & Inspections",
    items: [
      "Scheduled internal audits",
      "Findings, non-conformances & CAPs",
      "ISO 45001 & VPP audit-ready",
    ],
  },
  {
    icon: Zap,
    title: "Automation & Alerts",
    items: [
      "Automated deadline reminders",
      "OSHA reporting triggers",
      "Custom workflow automation",
    ],
  },
];

const complianceItems = [
  {
    icon: Shield,
    title: "OSHA 29 CFR 1910",
    description: "Full coverage of General Industry safety standards — lockout/tagout, HazCom, PPE, and more.",
  },
  {
    icon: Globe,
    title: "ISO 45001:2018",
    description: "Built to satisfy all ISO 45001 OH&S management system requirements out of the box.",
  },
  {
    icon: HeartHandshake,
    title: "OSHA Recordkeeping",
    description: "Automated OSHA 300 Log, 300A Summary, and 301 Incident Report generation and e-submission.",
  },
  {
    icon: Award,
    title: "ISO 9001:2015",
    description: "Integrated quality management support — document control, CAPA, management review, and KPIs.",
  },
  {
    icon: BarChart3,
    title: "ISO 14001:2015",
    description: "Environmental management workflows including aspects, impacts register, and legal compliance tracking.",
  },
  {
    icon: Lock,
    title: "ANSI/ASSP Z10.0",
    description: "Aligned with the ANSI standard for occupational health and safety management systems.",
  },
];

const problems = [
  {
    emoji: "📋",
    emojiLabel: "Document",
    title: "Compliance documentation chaos",
    description:
      "Your safety procedures are scattered across shared drives, email threads, and binders. No one knows which version is current — and a surprise OSHA inspection terrifies you.",
  },
  {
    emoji: "⚠️",
    emojiLabel: "Warning",
    title: "OSHA audit anxiety",
    description:
      "Every audit is a scramble. You can never be sure whether your OSHA 300 log is complete, your training records are current, or your risk assessments are documented.",
  },
  {
    emoji: "📉",
    emojiLabel: "Declining chart",
    title: "Low employee engagement",
    description:
      "Workers don't report near-misses because the process is too cumbersome. Safety culture suffers — and so does your recordable incident rate.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Save 10+ hours per week",
    description:
      "Automate recurring tasks — OSHA recordkeeping, reminder emails, audit scheduling. Focus your time on actual safety improvements.",
  },
  {
    icon: Shield,
    title: "Pass OSHA inspections with confidence",
    description:
      "Every required document, log, and record is organized, up to date, and instantly accessible. No scrambling when the inspector arrives.",
  },
  {
    icon: Users,
    title: "Build a real safety culture",
    description:
      "When reporting is easy and mobile-friendly, employees actually participate. Incident rates drop. Near-miss reporting climbs. Culture shifts.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
          🛡️ OSHA-Ready · ISO 45001 · Unlimited Users
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
          <span className="text-primary">The EHS Platform</span>
          <br />
          <span className="text-foreground">Built for US Compliance</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          HMS Nova gives your business a complete Environmental, Health &amp; Safety management
          system — OSHA-ready, ISO 45001-aligned, and built to eliminate audit anxiety forever.
          $30/month flat. Unlimited users. No hidden fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <RegisterDialog>
            <Button size="lg" className="text-lg px-8 bg-green-700 hover:bg-green-800 text-white">
              Start Free 14-Day Trial
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </RegisterDialog>
          <RingMegDialog />
          <Link href="/features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Explore Features
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-5">
          ✓ No credit card required &nbsp; ✓ Full access from day one &nbsp; ✓ US-based EHS support
        </p>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Sound familiar?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Most US companies manage EHS the hard way — until they switch to HMS Nova.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, i) => (
              <ScrollReveal key={problem.title} delay={i * 100}>
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                      <span className="text-2xl" role="img" aria-label={problem.emojiLabel}>
                        {problem.emoji}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="fade">
            <Badge variant="default" className="mb-4">
              The Solution
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              One system. Zero stress. Full OSHA compliance.
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              HMS Nova makes EHS management so simple that every employee actually uses it.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "Digital signatures & approvals",
                desc: "Legally binding e-signatures built in. No printing, scanning, or paper trails.",
              },
              {
                title: "Automated OSHA reminders",
                desc: "Get alerts before training certifications expire, inspections are due, or recordkeeping deadlines approach.",
              },
              {
                title: "Mobile app for field workers",
                desc: "Report incidents and complete inspections directly from a phone. Works fully offline on job sites.",
              },
              {
                title: "ISO 45001 & OSHA compliance",
                desc: "Built to satisfy OSHA 29 CFR 1910, OSHA 300 recordkeeping, and full ISO 45001 requirements. Pass audits without scrambling.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={(i + 1) * 100} direction={i % 2 === 0 ? "left" : "right"}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything your EHS program needs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            One platform. Every EHS requirement. No modules to buy separately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" aria-hidden="true" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/features">
            <Button variant="outline" size="lg">
              View All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What happens when EHS actually works?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not just better documentation — a safer workforce, lower incident rates, and a stronger bottom line.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, i) => (
            <ScrollReveal key={benefit.title} delay={(i + 1) * 100}>
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="default" className="mb-4 bg-green-700 text-white border-green-800">
            100% Compliant Architecture
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Built for US regulations and global standards
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            HMS Nova is designed from the ground up to satisfy OSHA requirements, ISO management
            system standards, and ANSI guidelines — so your business is always audit-ready.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {complianceItems.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <item.icon className="h-7 w-7 text-primary mb-2" aria-hidden="true" />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/compliance">
              <Button variant="outline" size="lg">
                View Full Compliance Coverage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What EHS leaders say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "HMS Nova cut our OSHA 300 log preparation time from two days to 20 minutes. Our last VPP audit was the smoothest we've ever had.",
                name: "Michael Torres",
                title: "EHS Director, Manufacturing",
              },
              {
                quote:
                  "We finally have a system our field crews actually use. Near-miss reporting is up 40% and our TRIR has dropped two points in six months.",
                name: "Sarah Chen",
                title: "VP Safety, Construction",
              },
              {
                quote:
                  "Passed our ISO 45001 certification audit on the first attempt. The auditor was impressed by how well-organized our documentation was.",
                name: "James Rivera",
                title: "Quality & Safety Manager",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Does HMS Nova handle OSHA 300 Log recordkeeping automatically?",
                a: "Yes. HMS Nova automatically generates your OSHA 300, 300A, and 301 forms based on incidents logged in the platform. You can export them at any time or configure automatic annual posting.",
              },
              {
                q: "Is it built for ISO 45001 certification?",
                a: "Absolutely. The platform architecture maps directly to ISO 45001:2018 clause requirements — context of the organization, planning, hazard identification, operational controls, internal audits, and management review are all supported.",
              },
              {
                q: "How does pricing work for multiple locations?",
                a: "HMS Nova is priced per company, not per user or location. One flat subscription covers unlimited employees, unlimited users, and all your facilities. No per-seat charges.",
              },
              {
                q: "Can field workers use it without internet access?",
                a: "Yes. The mobile experience works fully offline. Inspection data, incident reports, and checklists sync automatically when connectivity is restored.",
              },
              {
                q: "How long does implementation take?",
                a: "Most companies are fully operational within one week. We provide guided onboarding, pre-built EHS handbook templates, and a dedicated setup call at no additional cost.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <ScrollReveal direction="fade" delay={200}>
          <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to eliminate EHS compliance risk?</h2>
              <p className="text-lg mb-8 text-primary-foreground/90">
                Start your free 14-day trial. No credit card. No commitment. Full access from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RegisterDialog>
                  <Button size="lg" className="text-lg px-8 bg-green-700 hover:bg-green-800 text-white">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Button>
                </RegisterDialog>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-sm mt-6 text-primary-foreground/70">
                Trusted by 500+ businesses across Norway and expanding to the US market
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>
    </div>
  );
}

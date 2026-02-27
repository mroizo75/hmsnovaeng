import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import {
  Shield,
  Globe,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Zap,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About HMS Nova — US EHS Management Platform",
  description:
    "Learn about HMS Nova — the EHS management platform built by safety professionals for American businesses. Our mission: make OSHA compliance and workplace safety effortless.",
};

const values = [
  {
    icon: Shield,
    title: "Safety first, always",
    description:
      "Every product decision starts with a single question: does this make workplaces safer? Technology is a means to an end — the end is zero preventable injuries.",
  },
  {
    icon: Zap,
    title: "Radical simplicity",
    description:
      "The best EHS software is the software people actually use. We obsess over removing friction from every workflow so compliance becomes the path of least resistance.",
  },
  {
    icon: HeartHandshake,
    title: "Customers as partners",
    description:
      "Our product roadmap is driven by EHS professionals in the field. Every feature request is taken seriously. Every support interaction is a learning opportunity.",
  },
  {
    icon: Globe,
    title: "Global standards, local compliance",
    description:
      "We built our platform to international standards (ISO 45001, ISO 9001) and layer on jurisdiction-specific requirements — starting with US OSHA and expanding further.",
  },
];

const milestones = [
  { year: "2020", event: "HMS Nova founded in Norway by a team of EHS professionals and software engineers" },
  { year: "2021", event: "First 100 enterprise customers — manufacturing, construction, and healthcare sectors" },
  { year: "2022", event: "ISO 45001 certification workflow launched; OSHA recordkeeping automation released" },
  { year: "2023", event: "Mobile app launch with offline field capability; SDS library module added" },
  { year: "2024", event: "500+ businesses across Scandinavia; US market expansion initiated" },
  { year: "2025", event: "HMS Nova US launched — full OSHA and ISO coverage for American businesses" },
];

const stats = [
  { value: "500+", label: "Businesses worldwide" },
  { value: "50,000+", label: "Users on the platform" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "< 1 week", label: "Average time to go live" },
];

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            About HMS Nova
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Built by EHS professionals.<br />
            <span className="text-primary">For EHS professionals.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            HMS Nova was created by a team who lived the frustration of managing workplace safety
            with spreadsheets, email threads, and paper binders. We built the platform we wished
            existed — modern, intuitive, and genuinely effective at preventing injuries and
            maintaining compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <RegisterDialog>
              <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </RegisterDialog>
            <Link href="/features">
              <Button size="lg" variant="outline">
                Explore the Platform
              </Button>
            </Link>
          </div>
        </div>
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

      {/* Mission */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="default" className="mb-4">Our Mission</Badge>
            <h2 className="text-3xl font-bold mb-6">
              Make workplace safety effortless — and compliance automatic
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every year, approximately 2.8 million workplace injuries are recorded in the US.
              Thousands of those are preventable. The barrier isn&apos;t awareness — most EHS
              managers know exactly what they need to do. The barrier is time, administrative
              burden, and systems that work against them.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              HMS Nova removes that barrier. When OSHA recordkeeping takes minutes instead of
              hours, when risk assessments are completed on a phone instead of a desk, when
              training compliance is tracked automatically instead of manually — EHS managers can
              focus on what actually makes a difference: engaging workers and preventing incidents.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That&apos;s why we built HMS Nova for the US market — because American workers deserve
              the same level of protection that our Norwegian customers have had access to since 2020.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "2.8 million US workplace injuries annually — most are preventable",
              "OSHA fines exceeded $300M in 2023 — driven largely by recordkeeping and training failures",
              "Companies with strong EHS programs report 20–40% lower injury rates",
              "ISO 45001-certified companies see measurably better safety culture metrics",
            ].map((fact) => (
              <div key={fact} className="flex items-start gap-3 bg-muted/30 rounded-lg p-4">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our journey</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="relative flex items-start gap-6 pl-10">
                  <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{milestone.year}</span>
                    <p className="text-sm mt-1 leading-relaxed">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* US market commitment */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-6">Our commitment to the US market</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            HMS Nova&apos;s expansion into the United States is not just a sales initiative — it&apos;s a
            product commitment. We have mapped our platform to OSHA federal standards, updated our
            workflows for US-specific requirements (OSHA 300 log, HazCom 2012, construction
            safety), and are actively building partnerships with US EHS professionals to ensure
            we meet the real needs of American workplaces.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Shield, title: "OSHA-first design", desc: "Platform workflows built around OSHA 29 CFR requirements, not retrofitted after the fact" },
              { icon: Users, title: "US EHS support team", desc: "Dedicated support staff with OSHA and EHS expertise for US customers" },
              { icon: Award, title: "Investor-ready roadmap", desc: "ISO 45001 Stage 2 audit support, EPA environmental modules, and state-specific regulation layers coming in 2026" },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6 text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
            <h2 className="text-3xl font-bold mb-4">Join us in making workplaces safer</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Start your free 14-day trial. No credit card. No commitment. Full platform access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RegisterDialog>
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </RegisterDialog>
              <Link href="/compliance">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8">
                  View Compliance Coverage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

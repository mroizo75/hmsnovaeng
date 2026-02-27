import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  CheckCircle2,
  Shield,
  Users,
  FileText,
  TrendingUp,
  Lock,
  Zap,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  BookOpen,
  Smartphone,
  Database,
  ArrowRight,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "EHS Platform Features | HMS Nova — OSHA Compliance & Safety Management",
  description:
    "Explore every feature of HMS Nova's EHS platform — OSHA 300 log automation, ISO 45001 audit management, incident reporting, risk assessment, training records, and more.",
};

const featureGroups = [
  {
    id: "document-management",
    icon: FileText,
    title: "Document Management",
    tagline: "One source of truth for every EHS document",
    description:
      "Eliminate document chaos with version-controlled policies, procedures, and records. Every document has a clear owner, approval workflow, and audit trail — meeting both OSHA and ISO requirements.",
    features: [
      "Unlimited document storage with intelligent organization",
      "Version history and rollback — always know what changed",
      "Configurable multi-level approval workflows",
      "Legally binding e-signatures built in — no wet ink required",
      "Automated expiry notifications for procedures and certifications",
      "Full-text search across all documents and records",
      "ISO 9001-compliant document control out of the box",
      "Bulk upload and migration support",
    ],
    compliance: ["OSHA 29 CFR 1910.1200 (HazCom)", "ISO 45001 Clause 7.5", "ISO 9001:2015 Clause 7.5"],
  },
  {
    id: "risk-assessment",
    icon: Shield,
    title: "Risk Assessment & Hazard Analysis",
    tagline: "Identify, evaluate, and control workplace hazards",
    description:
      "Build comprehensive Job Hazard Analyses (JHA), Job Safety Analyses (JSA), and risk registers aligned with OSHA guidelines and ISO 45001 requirements.",
    features: [
      "5×5 probability-severity risk matrix (quantitative scoring)",
      "Pre-built JHA/JSA templates for general industry and construction",
      "Hierarchy of controls workflow (elimination → PPE)",
      "Risk register with owner assignment and due dates",
      "Residual risk tracking after control implementation",
      "Link risks directly to incidents and near-misses",
      "Management of change (MOC) workflows",
      "Periodic review scheduling and reminders",
    ],
    compliance: [
      "OSHA 29 CFR 1910 (General Industry)",
      "OSHA 29 CFR 1926 (Construction)",
      "ISO 45001 Clause 6.1",
      "ANSI/ASSP Z10.0-2019",
    ],
  },
  {
    id: "incident-reporting",
    icon: AlertTriangle,
    title: "Incident Reporting & OSHA Recordkeeping",
    tagline: "From near-miss to OSHA 300 Log in minutes",
    description:
      "Capture incidents and near-misses instantly from any device. HMS Nova automatically determines OSHA recordability, populates the OSHA 300/300A/301 forms, and alerts responsible parties.",
    features: [
      "Mobile-first incident reporting with photo/video attachments",
      "Automatic OSHA recordability determination logic",
      "OSHA 300 Log, 300A Annual Summary, and 301 form generation",
      "Near-miss and unsafe condition reporting (low friction)",
      "5-Whys and fault tree root cause analysis tools",
      "Corrective and Preventive Action (CAPA) tracking",
      "Dashboards: TRIR, DART rate, LTIFR, severity trending",
      "OSHA annual posting reminders (Feb 1 – Apr 30)",
    ],
    compliance: [
      "OSHA 29 CFR 1904 (Recordkeeping)",
      "OSHA 29 CFR 1910.119 (PSM)",
      "ISO 45001 Clause 10.2",
    ],
  },
  {
    id: "training",
    icon: TrendingUp,
    title: "Training Management & Competency",
    tagline: "Ensure every employee has the training OSHA requires",
    description:
      "Track all mandatory training, certifications, and refreshers in one place. HMS Nova alerts supervisors before deadlines are missed — keeping your team always in compliance.",
    features: [
      "Skills and competency matrix per role and department",
      "Training record management with document attachments",
      "Automated renewal reminders (configurable lead time)",
      "OSHA-required training tracking (HazCom, lockout/tagout, forklift, PPE, etc.)",
      "Bulk enrollment and completion tracking",
      "Competency gap analysis reports",
      "Integration with external LMS platforms",
      "Onboarding checklists for new hires",
    ],
    compliance: [
      "OSHA 29 CFR 1910 Training Requirements",
      "OSHA 29 CFR 1926.21 (Construction Training)",
      "ISO 45001 Clause 7.2",
    ],
  },
  {
    id: "audits",
    icon: ClipboardList,
    title: "Audits, Inspections & Compliance Checks",
    tagline: "Be inspection-ready 365 days a year",
    description:
      "Schedule and conduct internal audits, safety walkthroughs, and compliance inspections. Track findings, issue corrective actions, and demonstrate continuous improvement to OSHA and ISO auditors.",
    features: [
      "Customizable audit checklists (OSHA, ISO 45001, VPP-aligned)",
      "Mobile audit execution with offline support",
      "Photo and evidence attachment to findings",
      "Non-conformance and observation classification",
      "Corrective action plan (CAP) assignment and tracking",
      "Audit scheduling calendar with automated reminders",
      "Audit trend reports and repeat finding analysis",
      "Supplier/contractor safety audit workflows",
    ],
    compliance: [
      "ISO 45001 Clause 9.2 (Internal Audit)",
      "OSHA VPP Star/Merit Requirements",
      "ISO 9001 Clause 9.2",
    ],
  },
  {
    id: "goals-kpis",
    icon: BarChart3,
    title: "EHS Goals, KPIs & Management Review",
    tagline: "Measure, manage, and prove safety performance",
    description:
      "Set leading and lagging safety indicators, track progress in real time, and generate management review reports that satisfy ISO 45001 Clause 9.3 requirements.",
    features: [
      "Configurable KPI dashboards (TRIR, DART, near-miss rate, training compliance %)",
      "Leading indicator tracking (safety observations, hazard reports, audits completed)",
      "Annual EHS goals with milestone tracking",
      "Automated management review report generation",
      "Board-ready executive summary exports (PDF/Excel)",
      "Benchmark comparisons across sites and departments",
      "Trend analysis with predictive insights",
      "Custom report builder",
    ],
    compliance: [
      "ISO 45001 Clause 9.1 (Performance Evaluation)",
      "ISO 45001 Clause 9.3 (Management Review)",
      "ISO 9001 Clause 9.3",
    ],
  },
  {
    id: "chemical-sds",
    icon: Database,
    title: "Chemical Management & SDS Library",
    tagline: "OSHA HazCom 2012 compliance, automated",
    description:
      "Maintain a complete Safety Data Sheet library compliant with OSHA HazCom 2012 (GHS). Track chemical inventories, exposure risks, and PPE requirements by location.",
    features: [
      "Central SDS library — unlimited sheets, auto-updated",
      "Chemical inventory by location and storage area",
      "GHS hazard classification and pictogram display",
      "Exposure risk assessment linked to job roles",
      "Required PPE matrix per chemical",
      "Emergency response integration",
      "OSHA HazCom 2012-compliant labeling support",
      "Regulatory reporting for EPA Tier II (EPCRA Section 312)",
    ],
    compliance: [
      "OSHA 29 CFR 1910.1200 (HazCom 2012 / GHS)",
      "EPA EPCRA Section 312 (Tier II)",
      "ISO 45001 Clause 6.1.2",
    ],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile App — Field-Ready EHS",
    tagline: "Full EHS capability on every job site",
    description:
      "The HMS Nova mobile experience gives field workers immediate access to safety procedures, incident reporting, and inspection tools — with or without internet connectivity.",
    features: [
      "Native iOS and Android apps (PWA — no app store download required)",
      "Full offline functionality — sync when back online",
      "Quick incident and near-miss reporting with photo capture",
      "Mobile inspection and audit execution",
      "Digital permit-to-work workflows",
      "Push notifications for assigned actions",
      "QR code scanning for equipment and chemical lookups",
      "Digital toolbox talk delivery and acknowledgment",
    ],
    compliance: [
      "Supports OSHA field documentation requirements",
      "Enables real-time safety culture participation",
    ],
  },
  {
    id: "automation",
    icon: Zap,
    title: "Workflow Automation & Integrations",
    tagline: "Eliminate manual EHS administration",
    description:
      "Automate repetitive tasks and connect HMS Nova to your existing business systems. Reduce administrative overhead so your EHS team can focus on preventing incidents, not managing paperwork.",
    features: [
      "Rule-based workflow automation (triggers, conditions, actions)",
      "Automated email/SMS reminders for any deadline",
      "OSHA annual recordkeeping deadlines pre-configured",
      "REST API with comprehensive documentation",
      "Webhooks for real-time system integration",
      "Native connectors for common HRIS and ERP platforms",
      "Automated PDF report generation and distribution",
      "Bulk data import/export (CSV, Excel)",
    ],
    compliance: [
      "Reduces human error in recordkeeping",
      "Ensures no compliance deadline is missed",
    ],
  },
];

const platformHighlights = [
  { icon: Lock, label: "SOC 2 Type II aligned" },
  { icon: Shield, label: "AES-256 encryption" },
  { icon: Users, label: "Role-based access control" },
  { icon: Layers, label: "SSO / SAML support" },
  { icon: BookOpen, label: "99.9% uptime SLA" },
  { icon: Zap, label: "< 200ms global response time" },
];

export default function FeaturesPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          Complete EHS Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Every EHS capability<br />your business needs
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          HMS Nova is a unified platform for OSHA compliance, ISO 45001 management, incident
          tracking, and safety culture — all in one subscription with no module fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RegisterDialog>
            <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </RegisterDialog>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Platform security/reliability highlights */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {platformHighlights.map((h) => (
              <div key={h.label} className="flex flex-col items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <h.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Groups */}
      <section className="container mx-auto px-4 py-4">
        {featureGroups.map((group, idx) => (
          <ScrollReveal key={group.id} delay={100}>
            <section
              id={group.id}
              className={`py-16 ${idx % 2 === 1 ? "bg-muted/20 rounded-2xl px-8 my-4" : ""}`}
            >
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <group.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {group.compliance[0]}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{group.title}</h2>
                    <p className="text-primary font-medium mb-4">{group.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">{group.description}</p>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Compliance coverage
                      </p>
                      {group.compliance.map((c) => (
                        <div key={c} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">What&apos;s included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2.5">
                        {group.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </ScrollReveal>
        ))}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              See every feature in action
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Start your free 14-day trial and explore the full HMS Nova platform with no limitations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RegisterDialog>
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </RegisterDialog>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

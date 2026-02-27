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
  AlertTriangle,
  Globe,
  BookOpen,
  Award,
  ArrowRight,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OSHA Compliance & EHS Regulatory Coverage | HMS Nova",
  description:
    "HMS Nova is built to satisfy OSHA 29 CFR requirements, ISO 45001:2018, ISO 9001, ISO 14001, and ANSI/ASSP Z10. Complete US EHS regulatory compliance in one platform.",
};

const regulations = [
  {
    id: "osha-1910",
    icon: Shield,
    badge: "OSHA",
    title: "OSHA 29 CFR 1910 — General Industry",
    subtitle: "Occupational Safety and Health Administration",
    description:
      "The primary federal standard governing safety in general industry workplaces. HMS Nova maps directly to the most critical 1910 subparts, ensuring your documentation, training, and program management satisfy OSHA requirements.",
    coverage: [
      "1910.132–138 — Personal Protective Equipment (PPE) assessment, training, and recordkeeping",
      "1910.147 — Control of Hazardous Energy (LOTO) — written program, procedure documentation, periodic inspections",
      "1910.157–165 — Fire Protection — extinguisher inspection logs, training records",
      "1910.178 — Powered Industrial Trucks — operator training and certification tracking",
      "1910.1200 — Hazard Communication (HazCom 2012 / GHS) — SDS library, labeling, employee training records",
      "1910.1030 — Bloodborne Pathogens — exposure control plan, training, and incident documentation",
      "1910.38–39 — Emergency Action Plans — digital plan management and drill records",
    ],
  },
  {
    id: "osha-1926",
    icon: AlertTriangle,
    badge: "OSHA Construction",
    title: "OSHA 29 CFR 1926 — Construction",
    subtitle: "Construction Industry Safety Standards",
    description:
      "Construction sites face unique hazards addressed by OSHA's 1926 standards. HMS Nova supports JHA workflows, subcontractor management, and site safety documentation aligned with construction requirements.",
    coverage: [
      "1926.20–21 — General Safety and Health Provisions — written safety program documentation",
      "1926.501–503 — Fall Protection — written plan, training records, and inspection logs",
      "1926.59 — HazCom for construction — SDS management and training records",
      "1926.652 — Excavations — daily inspection records and competent person designations",
      "1926.1053 — Ladders — inspection records and training documentation",
      "Subcontractor pre-qualification and compliance tracking",
      "Site-specific safety plans and toolbox talk delivery",
    ],
  },
  {
    id: "osha-1904",
    icon: FileText,
    badge: "OSHA Recordkeeping",
    title: "OSHA 29 CFR 1904 — Injury & Illness Recordkeeping",
    subtitle: "Federal Recordkeeping Requirements",
    description:
      "One of the most scrutinized OSHA requirements. HMS Nova automates the entire recordkeeping process — from incident intake to automatic OSHA recordability determination to annual 300A posting.",
    coverage: [
      "Automatic OSHA recordability determination (first aid vs. recordable vs. reportable)",
      "OSHA 300 Log — automatic population and annual maintenance",
      "OSHA 300A Annual Summary — auto-generated, ready for Feb 1 posting",
      "OSHA 301 Incident Report — generated from incident intake form data",
      "Severity tracking: lost workdays, restricted work, medical treatment cases",
      "Fatality and severe injury 8/24-hour reporting alerts",
      "Multi-establishment recordkeeping support",
      "Electronic submission (OSHA ITA) export-ready format",
    ],
  },
  {
    id: "iso-45001",
    icon: Globe,
    badge: "ISO Standard",
    title: "ISO 45001:2018 — Occupational Health & Safety",
    subtitle: "International OH&S Management System Standard",
    description:
      "ISO 45001 is the internationally recognized standard for occupational health and safety management systems, replacing OHSAS 18001. HMS Nova's architecture is directly mapped to every clause of the standard.",
    coverage: [
      "Clause 4 — Context of the organization: interested party register, scope documentation",
      "Clause 5 — Leadership: policy management, roles & responsibilities matrix",
      "Clause 6 — Planning: hazard identification, risk register, legal & other requirements register",
      "Clause 7 — Support: competency matrix, training records, documented information control",
      "Clause 8 — Operation: operational controls, management of change, contractor management",
      "Clause 9 — Performance evaluation: KPI dashboards, internal audit program, management review",
      "Clause 10 — Improvement: incident investigation, CAPA tracking, continual improvement log",
    ],
  },
  {
    id: "iso-9001",
    icon: Award,
    badge: "ISO Standard",
    title: "ISO 9001:2015 — Quality Management",
    subtitle: "International Quality Management System Standard",
    description:
      "Many US businesses integrate quality and safety management. HMS Nova supports full ISO 9001 compliance alongside EHS requirements — document control, CAPA, audits, and management review.",
    coverage: [
      "Clause 7.5 — Documented information control (procedures, work instructions, forms)",
      "Clause 8.7 — Control of nonconforming outputs",
      "Clause 9.2 — Internal audit scheduling and execution",
      "Clause 9.3 — Management review inputs and outputs",
      "Clause 10.2 — Non-conformance and corrective action",
      "Quality KPIs and customer satisfaction metrics",
      "Supplier evaluation and qualification",
    ],
  },
  {
    id: "iso-14001",
    icon: Globe,
    badge: "ISO Standard",
    title: "ISO 14001:2015 — Environmental Management",
    subtitle: "International Environmental Management System Standard",
    description:
      "HMS Nova supports environmental management workflows alongside EHS — helping organizations that pursue integrated ISO 45001 and ISO 14001 management systems.",
    coverage: [
      "Environmental aspects and impacts register",
      "Legal and regulatory compliance obligations tracker",
      "Environmental objectives and targets with KPI tracking",
      "Emergency preparedness and environmental incident reporting",
      "Environmental internal audit checklists",
      "Waste management records and metrics",
    ],
  },
  {
    id: "ansi-z10",
    icon: BookOpen,
    badge: "ANSI Standard",
    title: "ANSI/ASSP Z10.0-2019 — OH&S Management",
    subtitle: "American National Standard for OHS Management Systems",
    description:
      "The primary US national standard for occupational health and safety management systems, developed by the American Society of Safety Professionals. HMS Nova's management system approach aligns with Z10.",
    coverage: [
      "Management leadership and employee participation",
      "Planning — initial review, risk assessment, legal requirements",
      "Implementation and operation — objectives, resources, training",
      "Evaluation and corrective action — monitoring, audits, incident investigation",
      "Management review for continual improvement",
    ],
  },
  {
    id: "vpp",
    icon: TrendingUp,
    badge: "OSHA VPP",
    title: "OSHA Voluntary Protection Programs (VPP)",
    subtitle: "OSHA's Premier Safety Recognition Program",
    description:
      "Companies pursuing OSHA VPP Star or Merit status need to demonstrate exceptional safety management. HMS Nova provides the documentation framework and performance data required for VPP applications and re-approvals.",
    coverage: [
      "Management leadership documentation (policy, commitment, accountability)",
      "Employee involvement records (safety committee, hazard reporting)",
      "Worksite analysis — hazard identification, JSA/JHA library, pre-use surveys",
      "Hazard prevention and control programs",
      "Safety and health training records",
      "Annual performance rate calculations (TRIR, DART)",
      "VPP application report data export",
    ],
  },
];

const complianceMatrix = [
  { regulation: "OSHA 300 Log automation", supported: true },
  { regulation: "OSHA HazCom 2012 / GHS SDS library", supported: true },
  { regulation: "OSHA Lockout/Tagout program management", supported: true },
  { regulation: "OSHA PPE assessment & training records", supported: true },
  { regulation: "OSHA Emergency Action Plan management", supported: true },
  { regulation: "ISO 45001 Hazard identification & risk register", supported: true },
  { regulation: "ISO 45001 Internal audit program", supported: true },
  { regulation: "ISO 45001 Management review reporting", supported: true },
  { regulation: "ISO 9001 Document control (Clause 7.5)", supported: true },
  { regulation: "ISO 9001 Corrective action (Clause 10.2)", supported: true },
  { regulation: "ISO 14001 Environmental aspects register", supported: true },
  { regulation: "ANSI Z10 OH&S management system", supported: true },
  { regulation: "OSHA VPP documentation framework", supported: true },
  { regulation: "EPA EPCRA Tier II chemical reporting", supported: true },
];

export default function CompliancePage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          Full Regulatory Coverage
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Built for US EHS compliance
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          HMS Nova is designed from the ground up to satisfy OSHA federal standards, ISO
          international management system requirements, and ANSI national guidelines — so your
          business is always inspection-ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RegisterDialog>
            <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </RegisterDialog>
          <Link href="/features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Explore Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick compliance matrix */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-8">Compliance Coverage at a Glance</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-3">
            {complianceMatrix.map((item) => (
              <div key={item.regulation} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item.regulation}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed regulation sections */}
      <section className="container mx-auto px-4 py-8">
        {regulations.map((reg, idx) => (
          <ScrollReveal key={reg.id} delay={100}>
            <section
              id={reg.id}
              className={`py-16 ${idx % 2 === 1 ? "bg-muted/20 rounded-2xl px-8 my-4" : ""}`}
            >
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <reg.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant={reg.badge.includes("ISO") ? "default" : "secondary"}
                        className={reg.badge.includes("ISO") ? "bg-primary/80" : ""}
                      >
                        {reg.badge}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{reg.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 font-medium">{reg.subtitle}</p>
                    <p className="text-muted-foreground leading-relaxed">{reg.description}</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        HMS Nova Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {reg.coverage.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{item}</span>
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

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">A note on regulatory compliance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    HMS Nova provides a comprehensive technology platform designed to support your
                    organization&apos;s EHS compliance program. While the platform is built to align with
                    OSHA standards, ISO requirements, and ANSI guidelines, compliance ultimately
                    depends on how your organization configures and uses the system, and the
                    specific facts and circumstances of your operations. We recommend working with
                    qualified EHS professionals to ensure your program fully meets all applicable
                    legal requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay ahead of every compliance requirement
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Start your free 14-day trial and see how HMS Nova handles your OSHA and ISO
              compliance automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RegisterDialog>
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </RegisterDialog>
              <Link href="/us-ehs-laws">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8">
                  View US EHS Laws
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

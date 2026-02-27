import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import {
  Shield,
  Globe,
  BookOpen,
  AlertTriangle,
  FileText,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: "US EHS Laws & Regulations Guide | HMS Nova",
  description:
    "Comprehensive guide to US Environmental, Health & Safety laws: OSHA standards, EPA regulations, ANSI guidelines, and ISO standards every US employer needs to know.",
};

const federalLaws = [
  {
    icon: Shield,
    badge: "Federal Law",
    title: "Occupational Safety and Health Act (OSH Act) — 1970",
    authority: "US Department of Labor / OSHA",
    description:
      "The foundational federal law establishing the right of every worker to a safe workplace. Employers have a General Duty Clause obligation to keep workplaces free from recognized serious hazards. OSHA enforces the Act and issues standards under 29 CFR.",
    keyRequirements: [
      "General Duty Clause — employers must provide a workplace free from recognized hazards",
      "Compliance with applicable OSHA standards (29 CFR 1910, 1926, etc.)",
      "Keep OSHA 300/300A injury and illness records (establishments with 10+ employees)",
      "Report fatalities within 8 hours and in-patient hospitalizations within 24 hours",
      "Post the OSHA 300A Annual Summary February 1 through April 30 each year",
      "Provide required safety training in workers' language",
      "Provide and maintain required PPE at no cost to workers",
    ],
    penalties: "OSHA penalties up to $16,131 per serious violation; up to $161,323 for willful violations (2024 rates, inflation-adjusted annually).",
    link: "https://www.osha.gov/laws-regs/oshact/completeoshact",
  },
  {
    icon: AlertTriangle,
    badge: "OSHA Standard",
    title: "OSHA 29 CFR 1910 — General Industry Standards",
    authority: "Occupational Safety and Health Administration",
    description:
      "The primary set of safety standards for general industry workplaces including manufacturing, warehousing, healthcare, retail, and office environments.",
    keyRequirements: [
      "1910.132 — General PPE requirements and employer hazard assessment",
      "1910.147 — Control of Hazardous Energy (Lockout/Tagout)",
      "1910.157 — Portable Fire Extinguishers — inspection and training",
      "1910.178 — Powered Industrial Trucks (forklift operator certification)",
      "1910.1200 — Hazard Communication Standard (HazCom 2012 / GHS)",
      "1910.38 — Emergency Action Plans",
      "1910.1030 — Bloodborne Pathogens (healthcare and first aid responders)",
      "1910.217 — Mechanical Power Presses",
    ],
    penalties: "Per-violation fines up to $16,131; penalties for repeat or willful violations significantly higher.",
    link: "https://www.osha.gov/general-industry",
  },
  {
    icon: Building,
    badge: "OSHA Standard",
    title: "OSHA 29 CFR 1926 — Construction Standards",
    authority: "Occupational Safety and Health Administration",
    description:
      "Safety standards specifically governing construction worksites — covering fall protection, scaffolding, excavations, cranes, and electrical safety.",
    keyRequirements: [
      "1926.501 — Fall Protection (leading cause of construction fatalities)",
      "1926.1053 — Ladders — load ratings, use, and inspection",
      "1926.652 — Excavations — daily inspections by competent person",
      "1926.451 — Scaffolding — capacity, access, and fall protection",
      "1926.416 — Electrical safety — working near energized parts",
      "1926.59 — Hazard Communication for construction sites",
      "Written site-specific safety and health plans",
      "Competent person designations for specific hazardous operations",
    ],
    penalties: "Same federal OSHA penalty structure as general industry; state plan states may differ.",
    link: "https://www.osha.gov/construction",
  },
  {
    icon: FileText,
    badge: "OSHA Recordkeeping",
    title: "OSHA 29 CFR 1904 — Recordkeeping & Reporting",
    authority: "Occupational Safety and Health Administration",
    description:
      "Federal requirements for employers to record and report work-related injuries, illnesses, and fatalities. Applies to establishments with 10 or more employees in most industries.",
    keyRequirements: [
      "OSHA 300 Log — record all work-related injuries/illnesses throughout the year",
      "OSHA 301 Incident Report — detailed record for each recordable case",
      "OSHA 300A Annual Summary — post February 1–April 30 in a visible location",
      "Electronic submission via OSHA's Injury Tracking Application (ITA) — required for 250+ employee establishments",
      "Retain records for 5 years following the year they were created",
      "First aid cases are generally NOT recordable (defined list in 1904.7)",
      "Report fatalities to OSHA within 8 hours; hospitalizations within 24 hours",
    ],
    penalties: "Failure to maintain records: up to $16,131 per violation. Failure to report fatalities: up to $8,065.",
    link: "https://www.osha.gov/recordkeeping",
  },
  {
    icon: Globe,
    badge: "Federal Law",
    title: "Clean Air Act (CAA) & Clean Water Act (CWA) — EPA",
    authority: "US Environmental Protection Agency",
    description:
      "Key federal environmental laws governing air emissions and water discharges. Many industrial operations require permits and must track pollutant releases.",
    keyRequirements: [
      "CAA Title V permits for major stationary sources of air pollution",
      "Spill Prevention, Control, and Countermeasure (SPCC) plans for oil storage",
      "CWA NPDES permits for discharges to navigable waters",
      "Toxic Release Inventory (TRI) reporting under EPCRA Section 313",
      "EPCRA Tier II chemical inventory reporting (Section 312) for hazardous chemicals above thresholds",
      "Emergency Planning notification under CERCLA Section 103 and EPCRA Section 304",
    ],
    penalties: "EPA civil penalties up to $70,117 per day per violation for Clean Air Act violations (2024).",
    link: "https://www.epa.gov/laws-regulations",
  },
  {
    icon: Globe,
    badge: "Federal Law",
    title: "Resource Conservation & Recovery Act (RCRA) — EPA",
    authority: "US Environmental Protection Agency",
    description:
      "Federal law governing the management of hazardous and solid waste from cradle to grave. Generators, transporters, and treatment/disposal facilities all have distinct obligations.",
    keyRequirements: [
      "Hazardous waste generator categorization (VSQG, SQG, LQG) based on monthly generation",
      "Manifesting hazardous waste shipments",
      "Hazardous waste storage area requirements (labeling, inspections, secondary containment)",
      "Biennial hazardous waste report (LQGs)",
      "Training requirements for personnel handling hazardous waste",
    ],
    penalties: "RCRA civil penalties up to $70,117 per day per violation.",
    link: "https://www.epa.gov/rcra",
  },
];

const isoStandards = [
  {
    title: "ISO 45001:2018",
    subtitle: "Occupational Health & Safety Management Systems",
    description: "The international standard for OH&S management systems, replacing OHSAS 18001. Certification demonstrates systematic management of workplace safety risks and legal compliance.",
    benefit: "Preferred by Fortune 500 companies; required by many enterprise procurement processes",
  },
  {
    title: "ISO 9001:2015",
    subtitle: "Quality Management Systems",
    description: "The world's most widely adopted quality management standard. Many companies integrate ISO 9001 and ISO 45001 into a combined management system.",
    benefit: "Required by many government and enterprise contracts; reduces defects and liability",
  },
  {
    title: "ISO 14001:2015",
    subtitle: "Environmental Management Systems",
    description: "International standard for environmental management — identifying environmental aspects, impacts, and controls within your operations.",
    benefit: "Demonstrates environmental stewardship; required by sustainability-focused customers and investors",
  },
  {
    title: "ISO 45003:2021",
    subtitle: "Psychological Health & Safety at Work",
    description: "The first international standard addressing psychological health in the workplace — covering work-related stress, harassment prevention, and mental health management.",
    benefit: "Addresses the fastest-growing category of worker injury claims in the US",
  },
];

const ansiStandards = [
  {
    title: "ANSI/ASSP Z10.0-2019",
    subtitle: "Occupational Health and Safety Management Systems",
    description: "The primary US national standard for OHSMS — developed by the American Society of Safety Professionals (ASSP). Highly compatible with ISO 45001.",
  },
  {
    title: "ANSI/NFPA 70E-2024",
    subtitle: "Standard for Electrical Safety in the Workplace",
    description: "NFPA 70E establishes the framework for electrical safety programs, arc flash risk assessments, and PPE selection — referenced in OSHA 1910.333 enforcement.",
  },
  {
    title: "ANSI/ISEA Z87.1-2020",
    subtitle: "Occupational and Educational Eye and Face Protection",
    description: "The national standard for eye and face protection performance, marking, and selection — required reference for OSHA 1910.133 PPE compliance.",
  },
];

export default function UsEhsLawsPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          US EHS Regulatory Guide
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          US EHS Laws &amp; Regulations
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          A practical guide to the federal laws, OSHA standards, EPA regulations, and ISO
          standards that govern Environmental, Health &amp; Safety programs for US businesses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/compliance">
            <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
              How HMS Nova Helps
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <RegisterDialog>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Start Free Trial
            </Button>
          </RegisterDialog>
        </div>
      </section>

      {/* Federal laws */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Federal EHS Laws & OSHA Standards</h2>
          <p className="text-muted-foreground mb-10">
            The primary federal requirements applicable to most US employers.
          </p>
          <div className="space-y-8">
            {federalLaws.map((law) => (
              <Card key={law.title} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <law.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{law.badge}</Badge>
                        <span className="text-xs text-muted-foreground">{law.authority}</span>
                      </div>
                      <CardTitle className="text-xl leading-tight">{law.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed mb-6">{law.description}</p>
                  <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                    Key Requirements
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {law.keyRequirements.map((req) => (
                      <li key={req} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start gap-3 bg-muted/30 rounded-lg p-3 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Penalties: </strong>{law.penalties}
                    </p>
                  </div>
                  <a
                    href={law.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Official resource
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Standards */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">ISO Management System Standards</h2>
          <p className="text-muted-foreground mb-10">
            International standards widely adopted by US businesses for EHS management, quality, and environmental performance.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {isoStandards.map((std) => (
              <Card key={std.title}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/80 text-primary-foreground shrink-0">{std.title}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{std.subtitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{std.description}</p>
                  <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{std.benefit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ANSI Standards */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Key ANSI Standards</h2>
          <p className="text-muted-foreground mb-10">
            American National Standards that complement OSHA requirements and set industry best practices.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {ansiStandards.map((std) => (
              <Card key={std.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit text-xs mb-2">{std.title}</Badge>
                  <CardTitle className="text-sm">{std.subtitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{std.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* State regulations note */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Don&apos;t forget: State OSHA Plans</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    29 states and territories operate their own OSHA-approved State Plans, which must
                    be at least as effective as federal OSHA and may impose stricter requirements.
                    States with their own plans include California (Cal/OSHA), Michigan (MIOSHA),
                    Washington (WISHA), New York, North Carolina, and others. Always verify whether
                    your state has a State Plan and review its specific requirements.
                  </p>
                  <a
                    href="https://www.osha.gov/stateplans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
                  >
                    Find your state&apos;s OSHA plan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Legal disclaimer</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This guide is provided for general informational purposes only and does not
                    constitute legal advice. EHS regulations are complex, frequently updated, and
                    vary by industry, company size, and jurisdiction. Always consult qualified legal
                    counsel and certified EHS professionals to determine the specific requirements
                    applicable to your operations. HMS Nova does not guarantee the completeness or
                    accuracy of this information.
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
              Let HMS Nova manage your compliance automatically
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Stop tracking OSHA requirements in spreadsheets. Start your free trial today.
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
                  View Platform Coverage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

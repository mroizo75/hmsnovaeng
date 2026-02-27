import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import { RingMegDialog } from "@/components/ring-meg-dialog";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  CheckCircle2,
  FileText,
  Shield,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Users,
  ClipboardList,
  Lock,
  Zap,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "EHS Handbook Service | OSHA-Compliant Safety Manual Built for You | HMS Nova",
  description:
    "We build a complete, OSHA-compliant EHS handbook for your company — all required written programs included. Fixed-fee service. Contact us to get started.",
};

const handbookChapters = [
  {
    number: "01",
    icon: Shield,
    title: "Safety & Health Policy Statement",
    description: "Management commitment to workplace safety — the foundation every OSHA inspector looks for first.",
    includes: [
      "Executive-signed safety policy",
      "EHS goals and objectives statement",
      "Roles and responsibilities matrix",
      "Employee rights and participation",
    ],
  },
  {
    number: "02",
    icon: AlertTriangle,
    title: "Hazard Communication Program",
    description: "Your written HazCom program under OSHA 29 CFR 1910.1200 — required for any workplace with hazardous chemicals.",
    includes: [
      "SDS management procedures",
      "Container labeling requirements (GHS)",
      "Employee training documentation",
      "Chemical inventory list template",
    ],
  },
  {
    number: "03",
    icon: Lock,
    title: "Control of Hazardous Energy (LOTO)",
    description: "Written Lockout/Tagout program under OSHA 29 CFR 1910.147 — one of OSHA's most-cited standards.",
    includes: [
      "Energy control program scope",
      "Authorized and affected employee roles",
      "Machine-specific procedure templates",
      "Annual inspection requirements",
    ],
  },
  {
    number: "04",
    icon: Zap,
    title: "Emergency Action Plan",
    description: "Required under OSHA 29 CFR 1910.38 for workplaces with 10+ employees — evacuation, fire, and emergency procedures.",
    includes: [
      "Emergency evacuation procedures",
      "Assembly point designations",
      "Accounting for all personnel",
      "Emergency contact list template",
    ],
  },
  {
    number: "05",
    icon: ClipboardList,
    title: "Personal Protective Equipment Program",
    description: "PPE hazard assessment, selection, and training under OSHA 29 CFR 1910.132.",
    includes: [
      "Written hazard assessment certification",
      "PPE selection matrix by task",
      "Employee training records",
      "Inspection and maintenance procedures",
    ],
  },
  {
    number: "06",
    icon: Users,
    title: "Incident Reporting & Investigation",
    description: "Procedures for reporting, investigating, and correcting workplace incidents — including OSHA recordable determination.",
    includes: [
      "Incident report forms (OSHA 301 aligned)",
      "Investigation workflow and root cause tools",
      "Corrective action tracking",
      "OSHA recordability decision guide",
    ],
  },
  {
    number: "07",
    icon: BookOpen,
    title: "Safety Training Program",
    description: "A structured approach to mandatory OSHA training — tracking who was trained, on what, and when renewal is required.",
    includes: [
      "Training needs assessment by job role",
      "Training calendar template",
      "Attendance and completion records",
      "Certification renewal tracking",
    ],
  },
  {
    number: "08",
    icon: FileText,
    title: "Inspections & Audits",
    description: "Scheduled safety walkthroughs, equipment inspections, and internal audit procedures.",
    includes: [
      "Daily, weekly, and monthly inspection checklists",
      "Finding and corrective action log",
      "Audit schedule template",
      "Management review inputs",
    ],
  },
];

const oshaRequiredPrograms = [
  { program: "Hazard Communication (HazCom)", citation: "29 CFR 1910.1200", required: true },
  { program: "Emergency Action Plan", citation: "29 CFR 1910.38", required: true },
  { program: "Fire Prevention Plan", citation: "29 CFR 1910.39", required: true },
  { program: "Control of Hazardous Energy (LOTO)", citation: "29 CFR 1910.147", required: true },
  { program: "Bloodborne Pathogens Exposure Control", citation: "29 CFR 1910.1030", required: true },
  { program: "Personal Protective Equipment", citation: "29 CFR 1910.132", required: true },
  { program: "Respiratory Protection Program", citation: "29 CFR 1910.134", required: true },
  { program: "Hearing Conservation Program", citation: "29 CFR 1910.95", required: true },
  { program: "Electrical Safety Program", citation: "29 CFR 1910.333", required: true },
  { program: "Confined Space Entry Program", citation: "29 CFR 1910.146", required: true },
  { program: "Hot Work Permit Program", citation: "29 CFR 1910.252", required: true },
  { program: "Fall Protection Plan", citation: "29 CFR 1926.502", required: true },
];

export default function EhsHandbookPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="secondary">Professional Service</Badge>
            <Badge variant="outline" className="text-primary border-primary">OSHA-Compliant</Badge>
            <Badge variant="outline" className="text-primary border-primary">Fixed Fee</Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            We build your EHS Handbook<br />
            <span className="text-primary">done-for-you</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Our EHS specialists write your company-specific, OSHA-compliant safety manual —
            covering every required written program. You get a complete, ready-to-use handbook
            configured directly in HMS Nova, at a fixed low price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <RingMegDialog
              trigger={
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  <Phone className="mr-2 h-5 w-5" />
                  Get a Quote — We&apos;ll Call You
                </Button>
              }
            />
            <Link href="/compliance">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Compliance Coverage
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ Written by EHS professionals &nbsp; ✓ Company-specific &nbsp; ✓ Loaded directly into HMS Nova
          </p>
        </div>
      </section>

      {/* Why you need one */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Why every US employer needs a written EHS handbook
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  OSHA requires employers to maintain written programs for more than a dozen
                  specific hazards. During an inspection, an OSHA compliance officer will ask for
                  these documents by name. If you can&apos;t produce them — even if your practices are
                  safe — you face citations and fines.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Beyond OSHA, a well-organized EHS handbook is the foundation of your safety
                  culture. It tells every employee what the rules are, who is responsible, and
                  what to do in an emergency — before an incident happens.
                </p>
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>OSHA citation alert:</strong> &ldquo;No written program&rdquo; violations are among
                    the top 10 most-cited OSHA standards every year. The fix is simple — and free
                    with this template.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  OSHA-required written programs
                </p>
                {oshaRequiredPrograms.map((item) => (
                  <div key={item.program} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{item.program}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{item.citation}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Handbook chapters */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What&apos;s inside the EHS Handbook</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              8 chapters covering every OSHA-required written program for general industry workplaces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {handbookChapters.map((chapter) => (
              <ScrollReveal key={chapter.number} delay={100}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <chapter.icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary mb-1">Chapter {chapter.number}</p>
                        <CardTitle className="text-lg leading-tight">{chapter.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {chapter.description}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Includes
                    </p>
                    <ul className="space-y-1.5">
                      {chapter.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            We handle the entire process — from intake to a fully configured, OSHA-compliant
            EHS handbook live in your HMS Nova account.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { step: "1", title: "Contact us", desc: "Request a quote. We&apos;ll call you back within one business day to discuss your industry, size, and specific requirements." },
              { step: "2", title: "We build it", desc: "Our EHS specialists draft your complete handbook — all required written programs, tailored to your company." },
              { step: "3", title: "Live in HMS Nova", desc: "Your handbook is loaded directly into your account, ready for employees to access from day one." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <RingMegDialog
            trigger={
              <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-10">
                <Phone className="mr-2 h-5 w-5" />
                Request a Quote — We&apos;ll Call You
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            }
          />
          <p className="text-sm text-muted-foreground mt-4">
            Fixed fee. Includes HMS Nova setup. No surprises.
          </p>
        </div>
      </section>

      {/* Related resources */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Related resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: "/risk-assessment-template", title: "Risk Assessment Service", desc: "We create your JHA/JSA library and risk register — done for you" },
              { href: "/osha-300-log-guide", title: "OSHA 300 Log Guide", desc: "Complete recordkeeping reference for 29 CFR 1904" },
              { href: "/iso-45001-checklist", title: "ISO 45001 Gap Assessment", desc: "We assess your readiness against all 10 ISO 45001 clauses" },
            ].map((resource) => (
              <Link key={resource.href} href={resource.href}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <FileText className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground">{resource.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

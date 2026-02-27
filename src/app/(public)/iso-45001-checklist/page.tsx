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
  ArrowRight,
  Shield,
  Award,
  Clock,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ISO 45001:2018 Audit Checklist — Clause-by-Clause | HMS Nova",
  description:
    "Free ISO 45001:2018 audit readiness checklist covering all 10 clauses. Use this to prepare for your Stage 1, Stage 2, or surveillance audit and identify compliance gaps.",
};

type ReadinessLevel = "strong" | "needs-work" | "gap";

interface ChecklistItem {
  ref: string;
  requirement: string;
  auditQuestion: string;
  readiness?: ReadinessLevel;
}

const clauses: { number: string; title: string; items: ChecklistItem[] }[] = [
  {
    number: "4",
    title: "Context of the Organization",
    items: [
      { ref: "4.1", requirement: "Understanding the organization and its context", auditQuestion: "Can you demonstrate a structured analysis of internal and external issues affecting your OH&S objectives?" },
      { ref: "4.2", requirement: "Understanding the needs of workers and interested parties", auditQuestion: "Is there a documented register of interested parties and their relevant requirements?" },
      { ref: "4.3", requirement: "Determining the scope of the OH&S MS", auditQuestion: "Is the scope clearly defined, documented, and available to interested parties?" },
      { ref: "4.4", requirement: "OH&S management system", auditQuestion: "Is there evidence that the OHSMS is established, implemented, maintained, and continually improved?" },
    ],
  },
  {
    number: "5",
    title: "Leadership & Worker Participation",
    items: [
      { ref: "5.1", requirement: "Leadership and commitment", auditQuestion: "Can top management demonstrate active commitment — not just a signed policy, but measurable involvement?" },
      { ref: "5.2", requirement: "OH&S policy", auditQuestion: "Is the policy documented, communicated, available to workers, current, and signed by top management?" },
      { ref: "5.3", requirement: "Organizational roles, responsibilities, and authorities", auditQuestion: "Are EHS roles and responsibilities assigned, documented, and communicated at all levels?" },
      { ref: "5.4", requirement: "Consultation and participation of workers", auditQuestion: "Are there mechanisms for workers at all levels to participate in hazard identification, incident investigation, and system improvement?" },
    ],
  },
  {
    number: "6",
    title: "Planning",
    items: [
      { ref: "6.1.1", requirement: "General planning for risks and opportunities", auditQuestion: "Is there a process to determine risks and opportunities that need to be addressed?" },
      { ref: "6.1.2", requirement: "Hazard identification", auditQuestion: "Is hazard identification systematic, ongoing, and covering routine/non-routine activities and emergencies?" },
      { ref: "6.1.3", requirement: "Assessment of OH&S risks and opportunities", auditQuestion: "Is there a documented risk assessment methodology with risk scoring and residual risk evaluation?" },
      { ref: "6.1.4", requirement: "Determination of legal and other requirements", auditQuestion: "Is there a legal register covering all applicable OSHA standards, EPA requirements, and state regulations?" },
      { ref: "6.2", requirement: "OH&S objectives and planning to achieve them", auditQuestion: "Are objectives measurable, monitored, communicated, and supported by action plans with owners and due dates?" },
    ],
  },
  {
    number: "7",
    title: "Support",
    items: [
      { ref: "7.1", requirement: "Resources", auditQuestion: "Are adequate resources (financial, human, infrastructure) provided for the OH&S management system?" },
      { ref: "7.2", requirement: "Competence", auditQuestion: "Is there a competency matrix? Are training records maintained and verified for all safety-critical roles?" },
      { ref: "7.3", requirement: "Awareness", auditQuestion: "Do workers demonstrate awareness of the OH&S policy, their contribution, the consequences of non-conformance?" },
      { ref: "7.4", requirement: "Communication", auditQuestion: "Are there documented processes for internal and external OH&S communication? Is communication two-way?" },
      { ref: "7.5", requirement: "Documented information", auditQuestion: "Is documented information controlled, protected from unintended alterations, and retrievable? Version control in place?" },
    ],
  },
  {
    number: "8",
    title: "Operation",
    items: [
      { ref: "8.1.1", requirement: "Operational planning and control", auditQuestion: "Are operational controls established for all significant hazards, including documented procedures where absence could lead to deviation?" },
      { ref: "8.1.2", requirement: "Eliminating hazards and reducing risks", auditQuestion: "Is the hierarchy of controls applied systematically, with documented rationale for control selection?" },
      { ref: "8.1.3", requirement: "Management of change", auditQuestion: "Is there a formal MOC process evaluating OH&S implications before changes are implemented?" },
      { ref: "8.1.4", requirement: "Procurement and contractors", auditQuestion: "Are contractor pre-qualification, site induction, and ongoing oversight procedures documented and followed?" },
      { ref: "8.2", requirement: "Emergency preparedness and response", auditQuestion: "Are emergency scenarios identified, procedures documented, personnel trained, and drills conducted and recorded?" },
    ],
  },
  {
    number: "9",
    title: "Performance Evaluation",
    items: [
      { ref: "9.1.1", requirement: "Monitoring, measurement, analysis and evaluation", auditQuestion: "Are leading and lagging indicators defined, measured, and analyzed? Who reviews what, and when?" },
      { ref: "9.1.2", requirement: "Evaluation of compliance", auditQuestion: "Is there a documented process to evaluate compliance with legal and other requirements at planned intervals?" },
      { ref: "9.2", requirement: "Internal audit", auditQuestion: "Is an internal audit program established? Are audits conducted, findings documented, and corrective actions tracked?" },
      { ref: "9.3", requirement: "Management review", auditQuestion: "Does management review occur at planned intervals? Are all required inputs covered? Are outputs documented and acted upon?" },
    ],
  },
  {
    number: "10",
    title: "Improvement",
    items: [
      { ref: "10.1", requirement: "General improvement", auditQuestion: "Is there a systematic approach to identifying improvement opportunities and implementing them?" },
      { ref: "10.2", requirement: "Incident, nonconformity and corrective action", auditQuestion: "Is there a documented process for investigating incidents, determining root cause, and implementing/verifying corrective actions?" },
      { ref: "10.3", requirement: "Continual improvement", auditQuestion: "Is there evidence of ongoing, proactive improvements to OH&S performance — not just reactions to incidents?" },
    ],
  },
];

const certificationStages = [
  {
    stage: "Stage 1",
    title: "Documentation Review",
    icon: FileText,
    duration: "1–2 days on-site or remote",
    focus: "Auditor reviews your documented information — policies, procedures, risk register, legal register, objectives. Verifies scope and readiness for Stage 2.",
    tips: [
      "Ensure all required documented information is complete and current",
      "Have your scope statement clearly defined",
      "Demonstrate your legal and other requirements register is comprehensive",
      "Show evidence of management commitment beyond a signed policy",
    ],
  },
  {
    stage: "Stage 2",
    title: "Certification Audit",
    icon: Award,
    duration: "2–5 days on-site (varies by organization size)",
    focus: "Auditor verifies the OHSMS is effectively implemented throughout the organization. Worker interviews, site observations, and record sampling.",
    tips: [
      "Train workers on the ISO 45001 policy and their responsibilities",
      "Have operational records (training records, inspection logs, incident investigations) organized and accessible",
      "Demonstrate worker participation — not just management talking",
      "Show that risk assessments drive actual operational controls",
    ],
  },
  {
    stage: "Surveillance",
    title: "Surveillance Audits",
    icon: Clock,
    duration: "Annual (Years 1 and 2 of 3-year cycle)",
    focus: "Confirms the system continues to function effectively. Focuses on areas identified in Stage 2 and any significant changes.",
    tips: [
      "Maintain momentum after certification — don't let the system slide",
      "Track and close corrective actions from the previous audit",
      "Document continual improvement activities throughout the year",
      "Keep your legal register updated as OSHA regulations change",
    ],
  },
];

export default function Iso45001ChecklistPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge variant="secondary">Professional Service</Badge>
            <Badge variant="outline" className="text-primary border-primary">ISO 45001:2018</Badge>
            <Badge variant="outline" className="text-primary border-primary">All 10 Clauses</Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            We prepare your ISO 45001<br />
            <span className="text-primary">gap assessment</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Our EHS specialists conduct a full ISO 45001:2018 gap assessment for your
            organization — covering all 10 clauses, identifying compliance gaps, and
            delivering a prioritized action plan to achieve certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <RingMegDialog
              trigger={
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                  <Phone className="mr-2 h-5 w-5" />
                  Request Your Gap Assessment
                </Button>
              }
            />
            <Link href="/compliance#iso-45001">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View ISO 45001 Coverage
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ All 10 clauses assessed &nbsp; ✓ Prioritized action plan &nbsp; ✓ Fixed fee, fast turnaround
          </p>
        </div>
      </section>

      {/* About ISO 45001 */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">What is ISO 45001?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ISO 45001:2018 is the international standard for occupational health and safety
                management systems (OHSMS). It replaced OHSAS 18001 as the global benchmark for
                OH&S management and is used by more than 300,000 organizations worldwide.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Certification to ISO 45001 signals to customers, insurers, and regulators that
                your organization systematically manages workplace safety risks — not just reacts
                to incidents.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For US businesses, ISO 45001 certification complements OSHA compliance — the
                standard&apos;s systematic approach to hazard identification and risk control
                aligns directly with OSHA&apos;s expectations for proactive safety management.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Published", value: "March 2018 (replacing OHSAS 18001)" },
                { label: "Standard body", value: "ISO (International Organization for Standardization)" },
                { label: "Certification body options", value: "BSI, Bureau Veritas, DNV, SGS, TÜV, UL" },
                { label: "Typical certification timeline", value: "3–12 months from gap assessment to Stage 2 audit" },
                { label: "Certification cycle", value: "3 years with annual surveillance audits" },
                { label: "Compatible standards", value: "ISO 9001, ISO 14001 (Annex SL structure)" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start bg-white rounded-lg px-4 py-3 border">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground text-right max-w-[55%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification stages */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The ISO 45001 certification journey</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {certificationStages.map((stage) => (
              <Card key={stage.stage} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stage.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{stage.stage}</p>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{stage.duration}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{stage.focus}</p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preparation tips</p>
                    <ul className="space-y-1.5">
                      {stage.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clause checklist */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Clause-by-clause audit checklist</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              For each clause, the key requirement and the typical audit question your
              certification auditor will be asking.
            </p>
          </div>

          <div className="space-y-6">
            {clauses.map((clause) => (
              <ScrollReveal key={clause.number} delay={100}>
                <Card>
                  <CardHeader className="bg-muted/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {clause.number}
                      </div>
                      <CardTitle className="text-lg">Clause {clause.number}: {clause.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {clause.items.map((item) => (
                        <div key={item.ref} className="grid md:grid-cols-[80px_1fr_1fr] gap-3 items-start py-3 border-b last:border-0">
                          <Badge variant="outline" className="font-mono text-xs w-fit">{item.ref}</Badge>
                          <div>
                            <p className="text-sm font-medium">{item.requirement}</p>
                          </div>
                          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                            <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed italic">&ldquo;{item.auditQuestion}&rdquo;</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HMS Nova connection */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">HMS Nova is built for ISO 45001</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every feature in HMS Nova maps to a specific ISO 45001 clause — so as you use the
            platform, you&apos;re automatically generating the evidence an auditor needs.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left mb-10">
            {[
              { clause: "Clause 6.1.2", feature: "Risk assessment module with hazard register and risk scoring" },
              { clause: "Clause 6.1.4", feature: "Legal and other requirements register with compliance tracking" },
              { clause: "Clause 7.2", feature: "Competency matrix and training records with renewal tracking" },
              { clause: "Clause 7.5", feature: "Document control with version history and approval workflows" },
              { clause: "Clause 9.2", feature: "Internal audit program with scheduling, findings, and CAPAs" },
              { clause: "Clause 9.3", feature: "Management review module with input/output documentation" },
              { clause: "Clause 10.2", feature: "Incident investigation with 5-Whys and corrective action tracking" },
              { clause: "Clause 9.1.1", feature: "KPI dashboards with TRIR, DART, and leading indicators" },
            ].map((item) => (
              <div key={item.clause} className="flex items-start gap-3 bg-white rounded-lg p-4 border">
                <Badge variant="outline" className="font-mono text-xs flex-shrink-0 mt-0.5">{item.clause}</Badge>
                <p className="text-sm">{item.feature}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RingMegDialog
              trigger={
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-10">
                  <Phone className="mr-2 h-5 w-5" />
                  Request Your Gap Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              }
            />
            <RegisterDialog>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Start Free Trial
              </Button>
            </RegisterDialog>
          </div>
        </div>
      </section>
    </div>
  );
}

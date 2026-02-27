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
  ArrowRight,
  AlertTriangle,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Risk Assessment Service | JHA/JSA Built for You | OSHA & ISO 45001 | HMS Nova",
  description:
    "We create your Job Hazard Analyses (JHA/JSA) and risk register — OSHA-aligned, ISO 45001 Clause 6.1 compliant, and configured in HMS Nova. Fixed-fee service.",
};

type RiskLevel = "low" | "medium" | "high" | "critical";

const riskMatrix: { probability: string; severity: string; score: number; level: RiskLevel }[] = [
  { probability: "Almost Certain (5)", severity: "Catastrophic (5)", score: 25, level: "critical" },
  { probability: "Almost Certain (5)", severity: "Major (4)", score: 20, level: "critical" },
  { probability: "Likely (4)", severity: "Catastrophic (5)", score: 20, level: "critical" },
  { probability: "Likely (4)", severity: "Major (4)", score: 16, level: "high" },
  { probability: "Possible (3)", severity: "Major (4)", score: 12, level: "high" },
  { probability: "Possible (3)", severity: "Moderate (3)", score: 9, level: "medium" },
  { probability: "Unlikely (2)", severity: "Moderate (3)", score: 6, level: "medium" },
  { probability: "Unlikely (2)", severity: "Minor (2)", score: 4, level: "low" },
  { probability: "Rare (1)", severity: "Minor (2)", score: 2, level: "low" },
  { probability: "Rare (1)", severity: "Insignificant (1)", score: 1, level: "low" },
];

const levelConfig: Record<RiskLevel, { label: string; bg: string; text: string; action: string }> = {
  critical: { label: "Critical (15–25)", bg: "bg-red-100", text: "text-red-800", action: "Stop work immediately. Implement controls before resuming." },
  high: { label: "High (10–14)", bg: "bg-orange-100", text: "text-orange-800", action: "Senior management attention required. Controls within 24 hours." },
  medium: { label: "Medium (5–9)", bg: "bg-yellow-100", text: "text-yellow-800", action: "Management responsibility specified. Controls within 30 days." },
  low: { label: "Low (1–4)", bg: "bg-green-100", text: "text-green-800", action: "Manage by routine procedures. Monitor and review." },
};

const hierarchySteps = [
  {
    level: 1,
    label: "Elimination",
    desc: "Remove the hazard entirely from the workplace.",
    example: "Discontinue a process that uses a toxic chemical.",
    effectiveness: "Most effective",
    color: "bg-green-600",
  },
  {
    level: 2,
    label: "Substitution",
    desc: "Replace the hazard with a less dangerous alternative.",
    example: "Use a water-based solvent instead of a flammable one.",
    effectiveness: "Very effective",
    color: "bg-green-500",
  },
  {
    level: 3,
    label: "Engineering Controls",
    desc: "Physically modify the work environment or equipment.",
    example: "Install machine guards, ventilation, or interlocks.",
    effectiveness: "Effective",
    color: "bg-yellow-500",
  },
  {
    level: 4,
    label: "Administrative Controls",
    desc: "Change how work is performed — procedures, training, scheduling.",
    example: "Job rotation to limit exposure; permit-to-work systems.",
    effectiveness: "Moderately effective",
    color: "bg-orange-500",
  },
  {
    level: 5,
    label: "Personal Protective Equipment",
    desc: "Last resort — protect the worker from the hazard.",
    example: "Hard hats, gloves, safety glasses, respirators.",
    effectiveness: "Least effective alone",
    color: "bg-red-500",
  },
];

const templateFields = [
  "Job / Task name and location",
  "Job steps — broken into discrete sequential tasks",
  "Hazard identification for each step",
  "Risk score (probability × severity) before controls",
  "Existing controls currently in place",
  "Recommended additional controls (hierarchy-based)",
  "Residual risk score after controls",
  "Responsible person and due date",
  "Required PPE per task step",
  "Date of assessment and next review date",
  "Assessor signature and supervisor approval",
  "OSHA standard reference (if applicable)",
];

export default function RiskAssessmentTemplatePage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge variant="secondary">Professional Service</Badge>
            <Badge variant="outline" className="text-primary border-primary">OSHA JHA/JSA Aligned</Badge>
            <Badge variant="outline" className="text-primary border-primary">ISO 45001 Clause 6.1</Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            We build your Risk Assessments<br />
            <span className="text-primary">done-for-you</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Our EHS specialists create your company-specific Job Hazard Analyses (JHA/JSA)
            and risk register — aligned with OSHA guidelines and ISO 45001 Clause 6.1,
            and configured directly in your HMS Nova account.
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
            <Link href="/features#risk-assessment">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See It in HMS Nova
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ Written by EHS professionals &nbsp; ✓ Job-specific JHAs &nbsp; ✓ Live in HMS Nova on day one
          </p>
        </div>
      </section>

      {/* What is a JHA */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-4">What is a Job Hazard Analysis?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Job Hazard Analysis (JHA) — or Job Safety Analysis (JSA) — is a technique that
              focuses on job tasks as a way to identify hazards before they occur. It breaks a
              job down into individual steps, identifies the hazards associated with each step,
              and determines the best controls to eliminate or reduce those hazards.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              OSHA recommends JHAs for jobs that have caused injuries, jobs with potential for
              severe injuries, jobs involving multiple hazards, and any new job tasks being
              introduced.
            </p>
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong>ISO 45001 Clause 6.1.2</strong> requires organizations to establish,
                implement, and maintain processes to identify hazards on an ongoing basis — and
                document those assessments. A properly completed JHA satisfies this requirement.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Template fields included</h3>
            <ul className="space-y-2">
              {templateFields.map((field) => (
                <li key={field} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{field}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5x5 Risk Matrix */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The 5×5 Risk Matrix</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Risk score = Probability × Severity. Scores determine required response urgency
              and are used throughout ISO 45001 risk management.
            </p>
          </div>

          {/* Risk levels legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {(Object.entries(levelConfig) as [RiskLevel, typeof levelConfig[RiskLevel]][]).map(([key, config]) => (
              <div key={key} className={`rounded-lg p-4 ${config.bg}`}>
                <p className={`font-bold text-sm ${config.text}`}>{config.label}</p>
                <p className={`text-xs mt-1 ${config.text} opacity-80`}>{config.action}</p>
              </div>
            ))}
          </div>

          {/* Visual matrix grid */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs text-muted-foreground font-medium w-32">Probability →<br />Severity ↓</th>
                  {["Rare (1)", "Unlikely (2)", "Possible (3)", "Likely (4)", "Almost Certain (5)"].map((p) => (
                    <th key={p} className="p-2 text-center text-xs font-medium text-muted-foreground">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Catastrophic (5)", scores: [5, 10, 15, 20, 25] },
                  { label: "Major (4)", scores: [4, 8, 12, 16, 20] },
                  { label: "Moderate (3)", scores: [3, 6, 9, 12, 15] },
                  { label: "Minor (2)", scores: [2, 4, 6, 8, 10] },
                  { label: "Insignificant (1)", scores: [1, 2, 3, 4, 5] },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="p-2 text-xs font-medium">{row.label}</td>
                    {row.scores.map((score) => {
                      const level: RiskLevel = score >= 15 ? "critical" : score >= 10 ? "high" : score >= 5 ? "medium" : "low";
                      const bg = level === "critical" ? "bg-red-200" : level === "high" ? "bg-orange-200" : level === "medium" ? "bg-yellow-200" : "bg-green-200";
                      return (
                        <td key={score} className={`p-3 text-center font-bold rounded ${bg}`}>
                          {score}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Hierarchy of controls */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hierarchy of Controls</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              OSHA and ISO 45001 require you to apply controls in order of effectiveness —
              starting with the most protective. PPE alone is never sufficient.
            </p>
          </div>
          <div className="space-y-3">
            {hierarchySteps.map((step) => (
              <div key={step.level} className="flex items-start gap-4 bg-white rounded-xl p-5 border">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold`}>
                  {step.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{step.label}</h3>
                    <Badge variant="outline" className="text-xs">{step.effectiveness}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">Example: {step.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How HMS Nova automates this */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge className="mb-4">How HMS Nova helps</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Skip the spreadsheet. Do JHAs digitally.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The HMS Nova risk assessment module replaces paper JHA forms with a
                  structured digital workflow — accessible from any device, completable in the
                  field, and automatically generating risk scores.
                </p>
                <ul className="space-y-3">
                  {[
                    "Auto-calculates risk scores as you fill in the form",
                    "Suggests controls from a library based on hazard type",
                    "Links JHAs directly to incidents and near-misses",
                    "Tracks corrective action completion with due date alerts",
                    "Generates management-ready PDF reports instantly",
                    "Full audit trail for ISO 45001 documentation requirements",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-primary text-primary-foreground border-0">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-3">Let us handle it for you</h3>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
                    Our EHS team creates your JHAs, loads them into HMS Nova, and links them
                    to your incident and audit workflows — so you start fully documented from
                    day one.
                  </p>
                  <RingMegDialog
                    trigger={
                      <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
                        <Phone className="mr-2 h-4 w-4" />
                        Request a Quote
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Related resources */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Related resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: "/ehs-handbook", title: "EHS Handbook Service", desc: "We build your complete OSHA safety manual — done for you" },
              { href: "/osha-300-log-guide", title: "OSHA 300 Log Guide", desc: "Recordkeeping requirements for 29 CFR 1904" },
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

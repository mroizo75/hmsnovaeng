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
  AlertTriangle,
  ArrowRight,
  X,
  Clock,
  Shield,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OSHA 300 Log Guide — Complete Recordkeeping Reference | HMS Nova",
  description:
    "A complete guide to OSHA 29 CFR 1904 injury and illness recordkeeping. Learn when incidents are OSHA recordable, how to complete the 300 Log, 300A, and 301, and avoid costly citation mistakes.",
};

const recordableDecisionTree = [
  { step: "1", question: "Did the incident result in a fatality?", ifYes: "→ Recordable AND must report to OSHA within 8 hours", ifNo: "Continue ↓" },
  { step: "2", question: "Did it result in days away from work, restricted work, or job transfer?", ifYes: "→ Recordable", ifNo: "Continue ↓" },
  { step: "3", question: "Did it require medical treatment beyond first aid?", ifYes: "→ Recordable", ifNo: "Continue ↓" },
  { step: "4", question: "Did it result in loss of consciousness?", ifYes: "→ Recordable", ifNo: "Continue ↓" },
  { step: "5", question: "Was a significant diagnosis made by a healthcare professional?", ifYes: "→ Recordable", ifNo: "→ NOT Recordable (first aid only)" },
];

const firstAidExamples = [
  "Non-prescription medication at non-prescription strength",
  "Tetanus immunizations",
  "Cleaning, flushing, or soaking a wound on the surface of the skin",
  "Wound closures (butterfly bandages, Steri-Strips)",
  "Hot/cold therapy",
  "Non-rigid means of support (elastic bandages, wraps)",
  "Temporary immobilization device while transporting to medical facility",
  "Drilling of fingernail to relieve pressure",
  "Eye patches",
  "Removing splinters or foreign material from areas other than the eye by irrigation or tweezers",
  "Use of finger guards",
  "Massage",
  "Drinking fluids for heat stress relief",
];

const deadlines = [
  {
    icon: Clock,
    timeframe: "Within 8 hours",
    event: "Work-related fatality",
    action: "Call OSHA at 1-800-321-OSHA or contact the nearest OSHA Area Office",
    citation: "29 CFR 1904.39",
  },
  {
    icon: Clock,
    timeframe: "Within 24 hours",
    event: "In-patient hospitalization, amputation, or loss of an eye",
    action: "Call OSHA at 1-800-321-OSHA or contact the nearest OSHA Area Office",
    citation: "29 CFR 1904.39",
  },
  {
    icon: Clock,
    timeframe: "7 calendar days",
    event: "OSHA recordable incident determination",
    action: "Record the incident on the OSHA 300 Log within 7 days of receiving information",
    citation: "29 CFR 1904.29",
  },
  {
    icon: Clock,
    timeframe: "February 1",
    event: "Annual posting deadline",
    action: "Post the OSHA 300A Annual Summary in a visible location in each establishment",
    citation: "29 CFR 1904.32",
  },
  {
    icon: Clock,
    timeframe: "April 30",
    event: "End of annual posting period",
    action: "OSHA 300A must remain posted from February 1 through April 30",
    citation: "29 CFR 1904.32",
  },
  {
    icon: Clock,
    timeframe: "5 years",
    event: "Record retention requirement",
    action: "Maintain 300, 300A, and 301 records for 5 years following the year they cover",
    citation: "29 CFR 1904.33",
  },
];

const commonMistakes = [
  {
    mistake: "Recording first aid cases",
    fix: "Review OSHA's specific first aid list (29 CFR 1904.7). Only record if treatment went beyond first aid.",
  },
  {
    mistake: "Missing the 7-day recording deadline",
    fix: "Enter incidents within 7 calendar days of learning about them. HMS Nova alerts you automatically.",
  },
  {
    mistake: "Failing to post the 300A",
    fix: "Post between February 1 and April 30, signed by a company executive. HMS Nova generates it ready-to-print.",
  },
  {
    mistake: "Not reporting hospitalization within 24 hours",
    fix: "Any in-patient hospitalization (even overnight observation) must be reported to OSHA within 24 hours.",
  },
  {
    mistake: "Counting employee days incorrectly",
    fix: "Count calendar days (not scheduled work days) for days away from work. Do not count day of injury.",
  },
  {
    mistake: "Omitting privacy cases",
    fix: "For certain sensitive injuries (sexual assault, mental illness), do not enter the employee name — enter 'Privacy Case' instead.",
  },
];

const forms = [
  {
    form: "OSHA 300",
    title: "Log of Work-Related Injuries and Illnesses",
    purpose: "The running log of all recordable incidents throughout the calendar year.",
    completedWhen: "Within 7 days of each recordable incident",
    retainFor: "5 years",
    columns: [
      "Case number",
      "Employee name",
      "Job title",
      "Date of injury/illness",
      "Where the event occurred",
      "Description of injury/illness",
      "Classification (days away, restricted, other)",
      "Number of days away / restricted",
      "Type of illness (if applicable)",
    ],
  },
  {
    form: "OSHA 300A",
    title: "Summary of Work-Related Injuries and Illnesses",
    purpose: "Annual summary of total recordable cases — must be posted each year.",
    completedWhen: "By February 1 each year; posted through April 30",
    retainFor: "5 years",
    columns: [
      "Total number of cases for each classification",
      "Number of days away from work",
      "Number of days of restricted work",
      "Total number of injuries and illnesses",
      "Average number of employees",
      "Total hours worked",
      "Must be signed by a company executive",
    ],
  },
  {
    form: "OSHA 301",
    title: "Injury and Illness Incident Report",
    purpose: "Detailed account of each individual recordable incident.",
    completedWhen: "Within 7 days of each recordable incident",
    retainFor: "5 years",
    columns: [
      "Employee information",
      "Healthcare provider information",
      "Detailed description of the incident",
      "What the employee was doing just before the incident",
      "What happened (how injury occurred)",
      "What object or substance directly harmed the employee",
      "Date and time of injury",
      "Days away / restricted work",
    ],
  },
];

export default function Osha300LogGuidePage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge variant="secondary">Free Guide</Badge>
            <Badge variant="outline" className="text-primary border-primary">29 CFR 1904</Badge>
            <Badge variant="outline" className="text-primary border-primary">OSHA Recordkeeping</Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            OSHA 300 Log<br />
            <span className="text-primary">Complete Guide</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Everything you need to understand OSHA injury and illness recordkeeping under
            29 CFR 1904 — what to record, when to record it, and how to avoid the most
            common citation-generating mistakes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <RegisterDialog>
              <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
                Start Free Trial — Automate OSHA 300 Log
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </RegisterDialog>
            <Link href="/compliance#osha-1904">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Full Compliance Coverage
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ HMS Nova auto-generates 300, 300A &amp; 301 &nbsp; ✓ OSHA recordability logic built in
          </p>
        </div>
      </section>

      {/* Who must keep records */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Who must keep OSHA records?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Must keep records</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Establishments with 11 or more employees",
                  "All high-hazard industries (construction, manufacturing, agriculture, utilities)",
                  "Healthcare, transportation, and warehousing regardless of size",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-base">Partially exempt (still must report fatalities)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Establishments with 10 or fewer employees — partial exemption from routine recordkeeping",
                  "Low-hazard industries (retail, service, finance, insurance, real estate)",
                  "Note: ALL employers must report fatalities and severe injuries to OSHA",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recordability decision tree */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Is the incident OSHA recordable?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Work through these questions in order. If you answer &ldquo;yes&rdquo; at any point,
                the incident is recordable and must be entered on the OSHA 300 Log.
              </p>
            </div>
          </ScrollReveal>
          <div className="space-y-4">
            {recordableDecisionTree.map((item) => (
              <div key={item.step} className="flex items-start gap-4 bg-white rounded-xl p-5 border">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">{item.question}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="flex items-start gap-2 bg-red-50 rounded-lg px-3 py-2">
                      <span className="text-red-600 font-semibold text-xs">YES:</span>
                      <span className="text-xs text-red-700">{item.ifYes}</span>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground font-semibold text-xs">NO:</span>
                      <span className="text-xs text-muted-foreground">{item.ifNo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* First aid list */}
          <div className="mt-10">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">OSHA&apos;s First Aid List — These treatments do NOT make an incident recordable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {firstAidExamples.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Source: OSHA 29 CFR 1904.7(a). Prescription medication use or any treatment not on this list generally triggers recordability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The three forms */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The three OSHA recordkeeping forms</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {forms.map((f) => (
              <Card key={f.form} className="h-full">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-primary/80">{f.form}</Badge>
                  <CardTitle className="text-base leading-tight">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{f.purpose}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Complete within</p>
                    <p className="text-sm font-medium">{f.completedWhen}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key columns/fields</p>
                    <ul className="space-y-1">
                      {f.columns.map((col) => (
                        <li key={col} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{col}</span>
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

      {/* Deadlines */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Critical deadlines — don&apos;t miss these</h2>
          </div>
          <div className="space-y-4">
            {deadlines.map((d) => (
              <div key={d.timeframe + d.event} className="flex items-start gap-4 bg-white rounded-xl p-5 border">
                <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-primary">{d.timeframe}</span>
                    <Badge variant="outline" className="text-xs font-mono">{d.citation}</Badge>
                  </div>
                  <p className="font-medium text-sm">{d.event}</p>
                  <p className="text-sm text-muted-foreground mt-1">{d.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common mistakes */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">6 most common recordkeeping mistakes</h2>
            <p className="text-muted-foreground">These mistakes generate the most OSHA citations during inspections.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {commonMistakes.map((item) => (
              <Card key={item.mistake}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-sm">{item.mistake}</p>
                  </div>
                  <div className="flex items-start gap-3 pl-8">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item.fix}</p>
                  </div>
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
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Never miss an OSHA deadline again</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              HMS Nova automatically determines recordability, generates all three OSHA forms,
              and sends you reminders before every deadline. We can also set up your entire
              recordkeeping system for you — at a fixed low price.
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
                    Get Setup Done for You
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

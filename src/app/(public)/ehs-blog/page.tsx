import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/register-dialog";
import { ArrowRight, Clock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "EHS Blog — OSHA Compliance, ISO 45001 & Workplace Safety | HMS Nova",
  description:
    "Expert guides on OSHA compliance, ISO 45001 certification, incident reporting, and workplace safety management for US businesses. Practical EHS insights from the HMS Nova team.",
};

interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  author: string;
  date: string;
  featured?: boolean;
  tags: string[];
}

const posts: BlogPost[] = [
  {
    slug: "osha-top-10-violations-2024",
    category: "OSHA Compliance",
    title: "OSHA's Top 10 Most-Cited Violations — and How to Fix Them",
    excerpt:
      "Fall protection, HazCom, and respiratory protection top the list again. We break down exactly what OSHA inspectors look for in each standard, the most common citation triggers, and the specific corrective steps to stay clean.",
    readTime: "8 min read",
    author: "HMS Nova EHS Team",
    date: "February 20, 2026",
    featured: true,
    tags: ["OSHA", "Compliance", "Citations"],
  },
  {
    slug: "iso-45001-vs-osha-vpp",
    category: "ISO 45001",
    title: "ISO 45001 vs. OSHA VPP: Which Should Your Company Pursue?",
    excerpt:
      "Both ISO 45001 certification and OSHA VPP Star status signal safety excellence — but they serve different purposes and audiences. Here's a practical comparison to help you decide where to focus your program investments.",
    readTime: "6 min read",
    author: "HMS Nova EHS Team",
    date: "February 14, 2026",
    featured: true,
    tags: ["ISO 45001", "VPP", "Certification"],
  },
  {
    slug: "osha-300-recordable-determination",
    category: "Recordkeeping",
    title: "Is It Recordable? A Step-by-Step OSHA 300 Log Decision Guide",
    excerpt:
      "The single most common recordkeeping mistake is either over-recording first aid cases or under-recording cases that require medical treatment. Walk through OSHA's official decision tree with real-world examples.",
    readTime: "7 min read",
    author: "HMS Nova EHS Team",
    date: "February 6, 2026",
    tags: ["OSHA 300", "Recordkeeping", "Incidents"],
  },
  {
    slug: "building-safety-culture-frontline",
    category: "Safety Culture",
    title: "How to Build a Safety Culture That Front-Line Workers Actually Believe In",
    excerpt:
      "Safety culture isn't posters and toolbox talks. It's the unwritten rules that govern how work actually gets done. We share five evidence-based practices that EHS leaders use to build genuine safety engagement on the front line.",
    readTime: "9 min read",
    author: "HMS Nova EHS Team",
    date: "January 29, 2026",
    tags: ["Culture", "Leadership", "Engagement"],
  },
  {
    slug: "jha-job-hazard-analysis-guide",
    category: "Risk Management",
    title: "How to Write a Job Hazard Analysis (JHA) That Actually Prevents Incidents",
    excerpt:
      "Most JHAs are completed for compliance and then filed away. Here's how to write a JHA that workers actually use in the field — including a template and the five most common JHA mistakes that create false confidence.",
    readTime: "10 min read",
    author: "HMS Nova EHS Team",
    date: "January 22, 2026",
    tags: ["JHA", "JSA", "Risk Assessment"],
  },
  {
    slug: "ehs-software-roi",
    category: "EHS Management",
    title: "The ROI of EHS Software: What the Numbers Actually Show",
    excerpt:
      "EHS software is often seen as a cost center. But companies with digitized safety programs report 20–40% lower recordable rates, significantly reduced OSHA fine exposure, and measurable productivity gains from reduced downtime.",
    readTime: "6 min read",
    author: "HMS Nova EHS Team",
    date: "January 15, 2026",
    tags: ["ROI", "EHS Software", "Business Case"],
  },
  {
    slug: "osha-inspection-what-to-expect",
    category: "OSHA Compliance",
    title: "What to Expect During an OSHA Inspection — A Practical Walkthrough",
    excerpt:
      "OSHA conducts more than 30,000 workplace inspections every year. If a compliance officer arrives at your door, knowing what to expect — and what rights you have — can significantly affect the outcome.",
    readTime: "8 min read",
    author: "HMS Nova EHS Team",
    date: "January 8, 2026",
    tags: ["OSHA", "Inspection", "Compliance"],
  },
  {
    slug: "contractor-safety-management",
    category: "Risk Management",
    title: "Contractor Safety Management: Your OSHA Obligations and Best Practices",
    excerpt:
      "When a contractor is injured on your site, the question of liability is complex. OSHA's multi-employer worksite policy can hold host employers responsible for contractors' exposures. Here's what you need to have in place.",
    readTime: "7 min read",
    author: "HMS Nova EHS Team",
    date: "December 18, 2025",
    tags: ["Contractors", "Multi-employer", "OSHA"],
  },
  {
    slug: "leading-lagging-indicators",
    category: "EHS Management",
    title: "Leading vs. Lagging EHS Indicators: Building a Balanced Scorecard",
    excerpt:
      "TRIR and DART are useful — but they tell you what already went wrong. We explain how to build a balanced set of leading indicators that actually predict and prevent incidents before they happen.",
    readTime: "5 min read",
    author: "HMS Nova EHS Team",
    date: "December 10, 2025",
    tags: ["KPIs", "Metrics", "Performance"],
  },
];

const categories = ["All", "OSHA Compliance", "ISO 45001", "Recordkeeping", "Risk Management", "Safety Culture", "EHS Management"];

export default function EhsBlogPage() {
  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);

  return (
    <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">EHS Resource Center</Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          EHS Insights &amp; Guides
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Practical guidance on OSHA compliance, ISO 45001 certification, and workplace safety
          management — written by EHS professionals for EHS professionals.
        </p>
        <RegisterDialog>
          <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white text-lg px-8">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </RegisterDialog>
      </section>

      {/* Category filters */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={cat === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors px-4 py-1.5 text-sm"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured posts */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured articles</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featured.map((post) => (
              <Link key={post.slug} href={`/ehs-blog/${post.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default" className="text-xs bg-primary/80">{post.category}</Badge>
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    </div>
                    <CardTitle className="text-xl leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted rounded-full px-2.5 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* All posts */}
          <h2 className="text-2xl font-bold mb-8">All articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {regular.map((post) => (
              <Link key={post.slug} href={`/ehs-blog/${post.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="w-fit text-xs mb-2">{post.category}</Badge>
                    <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted rounded-full px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Get EHS insights in your inbox</h2>
          <p className="text-muted-foreground mb-8">
            New OSHA guidance, ISO 45001 updates, and practical safety management tips — delivered
            monthly to EHS professionals across the US.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@company.com"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button className="bg-green-700 hover:bg-green-800 text-white shrink-0">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe at any time.</p>
        </div>
      </section>

      {/* Related resources */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">EHS services &amp; guides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: "/ehs-handbook", title: "EHS Handbook Service", desc: "We build your complete OSHA-required safety manual — done for you" },
              { href: "/risk-assessment-template", title: "Risk Assessment Service", desc: "Our EHS team creates your JHA/JSA library and risk register" },
              { href: "/osha-300-log-guide", title: "OSHA 300 Log Guide", desc: "Complete recordkeeping reference for 29 CFR 1904" },
            ].map((resource) => (
              <Link key={resource.href} href={resource.href}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{resource.desc}</p>
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </span>
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

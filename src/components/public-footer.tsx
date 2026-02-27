import Link from "next/link";
import { Facebook, Linkedin, Mail, Phone, Shield } from "lucide-react";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/logo-eng.png" alt="HMS Nova EHS Platform" width={155} height={150} />
            </div>
            <p className="text-sm text-muted-foreground">
              HMS Nova is developed by <strong>HMS Nova AS</strong> — a modern EHS management platform built for OSHA compliance and ISO 45001 certification.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 w-fit">
              <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>OSHA · ISO 45001 · ISO 9001 · ISO 14001</span>
            </div>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit HMS Nova on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit HMS Nova on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:us@hmsnova.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email HMS Nova"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-muted-foreground hover:text-foreground transition-colors">
                  OSHA Compliance
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About HMS Nova
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-muted-foreground hover:text-foreground transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ehs-blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  EHS Blog
                </Link>
              </li>
              <li>
                <Link href="/ehs-handbook" className="text-muted-foreground hover:text-foreground transition-colors">
                  Free EHS Handbook
                </Link>
              </li>
              <li>
                <Link href="/risk-assessment-template" className="text-muted-foreground hover:text-foreground transition-colors">
                  Risk Assessment Template
                </Link>
              </li>
              <li>
                <Link href="/osha-300-log-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  OSHA 300 Log Guide
                </Link>
              </li>
              <li>
                <Link href="/iso-45001-checklist" className="text-muted-foreground hover:text-foreground transition-colors">
                  ISO 45001 Checklist
                </Link>
              </li>
              <li>
                <Link href="/us-ehs-laws" className="text-muted-foreground hover:text-foreground transition-colors">
                  US EHS Laws & Regulations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <a href="mailto:us@hmsnova.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  us@hmsnova.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <div className="text-muted-foreground">
                  <a href="tel:+4799112916" className="hover:text-foreground transition-colors" aria-label="Call HMS Nova">
                    +47 99 11 29 16
                  </a>
                </div>
              </li>
              <li className="text-muted-foreground">
                <strong>HMS Nova AS</strong>
              </li>
              <li className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
                Serving US businesses with enterprise-grade EHS software — OSHA-ready, ISO 45001-aligned.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}{" "}
            <a href="https://hmsnova.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              HMS Nova AS
            </a>
            . All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


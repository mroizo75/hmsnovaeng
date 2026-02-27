"use client";

import { AlertTriangle, GraduationCap, Mail, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RingMegDialog } from "@/components/ring-meg-dialog";

const SUPPORT_EMAIL = "support@ehsnova.com";
const COURSE_EMAIL_SUBJECT = "Diisocyanate training course – inquiry";

interface IsocyanateWarningProps {
  details?: string;
}

/**
 * Warning that the product contains isocyanates
 * Shows course recommendation; contact EHS Nova for course or Call me for course info
 */
export function IsocyanateWarning({ details }: IsocyanateWarningProps) {
  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 font-semibold">
        ⚠️ Contains diisocyanates - Specialized training required
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-orange-800">
          {details ||
            "This product contains diisocyanates. In accordance with OSHA 29 CFR 1910.119 and industry best practices, working with such substances requires mandatory training."}
        </p>

        <div className="bg-white p-4 rounded-md border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Required training
          </h4>
          <ul className="text-sm text-orange-800 space-y-1 mb-3">
            <li>✅ Basic chemical handling course</li>
            <li>✅ Specialized course in safe use of diisocyanates</li>
            <li>✅ Refresher every 5 years</li>
          </ul>

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="default" className="bg-orange-600 hover:bg-orange-700" asChild>
              <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(COURSE_EMAIL_SUBJECT)}`}>
                <Mail className="mr-2 h-4 w-4" />
                Contact EHS Nova for training
              </a>
            </Button>
            <RingMegDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Call me for course info
                </Button>
              }
            />
            <Link href="/dashboard/training" target="_blank">
              <Button size="sm" variant="outline">
                Check employee training
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-orange-700">
          <strong>Important:</strong> All employees handling this product must have completed
          the required training before use. Document course participation in the training module.
        </p>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Compact badge for chemical lists
 */
export function IsocyanateBadge() {
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300"
      title="Contains diisocyanates - Requires specialized training"
    >
      <AlertTriangle className="h-3 w-3" />
      Diisocyanates
    </span>
  );
}

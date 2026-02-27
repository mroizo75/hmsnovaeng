"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OshaClassification } from "@prisma/client";

type Incident = {
  id: string;
  avviksnummer: string | null;
  title: string;
  occurredAt: Date;
  reportedBy: string;
  location: string | null;
  oshaClassification: OshaClassification | null;
  eventType: string | null;
  illnessType: string | null;
  daysAwayFromWork: number | null;
  daysOnRestriction: number | null;
  daysOnTransfer: number | null;
  bodyPartAffected: string | null;
  natureOfInjury: string | null;
  privacyCaseFlag: boolean;
  osha301CompletedAt: Date | null;
};

const CLASSIFICATION_BADGE: Record<OshaClassification, string> = {
  FATALITY: "bg-red-100 text-red-800 border-red-300",
  DAYS_AWAY: "bg-orange-100 text-orange-800 border-orange-300",
  RESTRICTED_WORK: "bg-yellow-100 text-yellow-800 border-yellow-300",
  JOB_TRANSFER: "bg-blue-100 text-blue-800 border-blue-300",
  OTHER_RECORDABLE: "bg-purple-100 text-purple-800 border-purple-300",
  FIRST_AID_ONLY: "bg-gray-100 text-gray-600 border-gray-300",
};

const CLASSIFICATION_LABEL: Record<OshaClassification, string> = {
  FATALITY: "Death",
  DAYS_AWAY: "Days Away",
  RESTRICTED_WORK: "Restricted",
  JOB_TRANSFER: "Transfer",
  OTHER_RECORDABLE: "Other",
  FIRST_AID_ONLY: "First Aid",
};

export function OshaLog300Table({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-sm">No recordable incidents logged for this year.</p>
        <p className="text-xs mt-1">
          To add a case, report an incident and mark it as OSHA Recordable.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground uppercase">
            <th className="text-left py-2 pr-3 font-medium w-8">#</th>
            <th className="text-left py-2 pr-3 font-medium">Case No.</th>
            <th className="text-left py-2 pr-3 font-medium">Employee / Case</th>
            <th className="text-left py-2 pr-3 font-medium">Date</th>
            <th className="text-left py-2 pr-3 font-medium">Where</th>
            <th className="text-left py-2 pr-3 font-medium">Classification</th>
            <th className="text-right py-2 pr-3 font-medium">Away</th>
            <th className="text-right py-2 pr-3 font-medium">Restr.</th>
            <th className="text-left py-2 font-medium">301</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc, idx) => (
            <tr key={inc.id} className="border-b hover:bg-muted/40 transition-colors">
              <td className="py-2 pr-3 text-muted-foreground">{idx + 1}</td>
              <td className="py-2 pr-3 font-mono text-xs">{inc.avviksnummer ?? "—"}</td>
              <td className="py-2 pr-3">
                <Link href={`/dashboard/incidents/${inc.id}`} className="font-medium hover:underline">
                  {inc.privacyCaseFlag ? (
                    <span className="italic text-muted-foreground">Privacy Case</span>
                  ) : (
                    inc.title
                  )}
                </Link>
                {inc.natureOfInjury && (
                  <p className="text-xs text-muted-foreground">{inc.natureOfInjury}</p>
                )}
              </td>
              <td className="py-2 pr-3 text-xs">
                {new Date(inc.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
              <td className="py-2 pr-3 text-xs text-muted-foreground">{inc.location ?? "—"}</td>
              <td className="py-2 pr-3">
                {inc.oshaClassification ? (
                  <Badge className={`text-xs border ${CLASSIFICATION_BADGE[inc.oshaClassification]}`}>
                    {CLASSIFICATION_LABEL[inc.oshaClassification]}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="py-2 pr-3 text-right text-xs">{inc.daysAwayFromWork ?? 0}</td>
              <td className="py-2 pr-3 text-right text-xs">{(inc.daysOnRestriction ?? 0) + (inc.daysOnTransfer ?? 0)}</td>
              <td className="py-2">
                {inc.osha301CompletedAt ? (
                  <span className="text-green-600 text-xs">✓</span>
                ) : (
                  <Button asChild variant="ghost" size="sm" className="h-6 px-1 text-xs">
                    <Link href={`/dashboard/incidents/${inc.id}`}>Fill</Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold text-xs">
            <td colSpan={6} className="py-2 text-muted-foreground">Totals</td>
            <td className="py-2 text-right">
              {incidents.reduce((s, i) => s + (i.daysAwayFromWork ?? 0), 0)}
            </td>
            <td className="py-2 text-right">
              {incidents.reduce((s, i) => s + (i.daysOnRestriction ?? 0) + (i.daysOnTransfer ?? 0), 0)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

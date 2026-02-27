"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { upsertOshaLog, certifyOshaLog, postOsha300ASummary } from "@/server/actions/osha.actions";
import { OshaClassification } from "@prisma/client";

type Incident = {
  oshaClassification: OshaClassification | null;
  eventType: string | null;
  illnessType: string | null;
  daysAwayFromWork: number | null;
};

type OshaLogData = {
  id: string;
  totalHoursWorked: number;
  avgEmployeeCount: number;
  trir: number | null;
  dartRate: number | null;
  ltir: number | null;
  certifiedAt: Date | null;
  certifiedBy: string | null;
  certifiedTitle: string | null;
  postedAt: Date | null;
  postedBy: string | null;
} | null;

type Props = {
  tenantId: string;
  tenantName: string;
  year: number;
  log: OshaLogData;
  totalHoursDefault: number;
  avgEmployeeDefault: number;
  incidents: Incident[];
};

export function Osha300AForm({ tenantId, tenantName, year, log, totalHoursDefault, avgEmployeeDefault, incidents }: Props) {
  const [hours, setHours] = useState(String(log?.totalHoursWorked ?? totalHoursDefault ?? ""));
  const [employees, setEmployees] = useState(String(log?.avgEmployeeCount ?? avgEmployeeDefault ?? ""));
  const [certName, setCertName] = useState(log?.certifiedBy ?? "");
  const [certTitle, setCertTitle] = useState(log?.certifiedTitle ?? "");
  const [postedBy, setPostedBy] = useState(log?.postedBy ?? "");
  const [saving, setSaving] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const [posting, setPosting] = useState(false);

  const deaths = incidents.filter((i) => i.oshaClassification === "FATALITY").length;
  const daysAway = incidents.filter((i) => i.oshaClassification === "DAYS_AWAY").length;
  const restricted = incidents.filter((i) => i.oshaClassification === "RESTRICTED_WORK").length;
  const transfer = incidents.filter((i) => i.oshaClassification === "JOB_TRANSFER").length;
  const other = incidents.filter((i) => i.oshaClassification === "OTHER_RECORDABLE").length;
  const injuries = incidents.filter((i) => i.eventType === "INJURY").length;
  const illnesses = incidents.filter((i) => i.eventType === "ILLNESS").length;

  async function handleSaveHours() {
    if (!hours || !employees) return;
    setSaving(true);
    await upsertOshaLog({ tenantId, year, totalHoursWorked: parseFloat(hours), avgEmployeeCount: parseFloat(employees) });
    setSaving(false);
  }

  async function handleCertify() {
    if (!certName || !certTitle) return;
    setCertifying(true);
    await certifyOshaLog({ tenantId, year, certifiedBy: certName, certifiedTitle: certTitle });
    setCertifying(false);
  }

  async function handlePost() {
    if (!postedBy) return;
    setPosting(true);
    await postOsha300ASummary({ tenantId, year, postedBy });
    setPosting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          OSHA Form 300A — Annual Summary {year}
          {log?.postedAt && <Badge className="bg-green-100 text-green-800 border-green-300">Posted</Badge>}
          {log?.certifiedAt && !log?.postedAt && <Badge className="bg-blue-100 text-blue-800 border-blue-300">Certified</Badge>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{tenantName}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Counts */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Number of Cases (auto-calculated from OSHA 300 Log)</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "Deaths", value: deaths },
              { label: "Days Away", value: daysAway },
              { label: "Restricted", value: restricted },
              { label: "Job Transfer", value: transfer },
              { label: "Other Recordable", value: other },
              { label: "Total Recordable", value: incidents.length },
            ].map((item) => (
              <div key={item.label} className="rounded border p-2 text-center">
                <div className="text-xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hours & Employees */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Establishment Information</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="hours">Total Hours Worked (all employees)</Label>
              <div className="flex gap-2">
                <Input id="hours" type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 48000" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="employees">Annual Average Number of Employees</Label>
              <Input id="employees" type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="e.g. 25" />
            </div>
          </div>
          <Button className="mt-3" onClick={handleSaveHours} disabled={saving}>
            {saving ? "Saving…" : "Save & Calculate Rates"}
          </Button>
          {log && (
            <div className="mt-3 flex gap-6 text-sm">
              <span>TRIR: <strong>{log.trir?.toFixed(2) ?? "—"}</strong></span>
              <span>DART: <strong>{log.dartRate?.toFixed(2) ?? "—"}</strong></span>
              <span>LTIR: <strong>{log.ltir?.toFixed(2) ?? "—"}</strong></span>
            </div>
          )}
        </div>

        {/* Certification */}
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center gap-2">
            {log?.certifiedAt
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <AlertCircle className="h-5 w-5 text-amber-500" />}
            <h4 className="text-sm font-semibold">
              Certification {log?.certifiedAt ? `— Certified ${new Date(log.certifiedAt).toLocaleDateString("en-US")}` : "(Required)"}
            </h4>
          </div>
          {!log?.certifiedAt && (
            <>
              <p className="text-xs text-muted-foreground">
                A company executive must certify the 300A is accurate and complete (29 CFR 1904.32).
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Name of Certifying Official</Label>
                  <Input value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="e.g. President, Owner" />
                </div>
              </div>
              <Button onClick={handleCertify} disabled={certifying || !certName || !certTitle} variant="outline">
                {certifying ? "Certifying…" : "Certify Summary"}
              </Button>
            </>
          )}
        </div>

        {/* Posting */}
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center gap-2">
            {log?.postedAt
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <AlertCircle className="h-5 w-5 text-amber-500" />}
            <h4 className="text-sm font-semibold">
              Posted Feb 1 – Apr 30 {log?.postedAt ? `— Posted ${new Date(log.postedAt).toLocaleDateString("en-US")}` : "(Required)"}
            </h4>
          </div>
          {!log?.postedAt && (
            <>
              <p className="text-xs text-muted-foreground">
                Post in a visible location accessible to employees. Mark as posted once displayed.
              </p>
              <div className="flex gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <Label>Posted By</Label>
                  <Input value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="Name" />
                </div>
                <Button onClick={handlePost} disabled={posting || !postedBy || !log?.certifiedAt} variant="outline">
                  {posting ? "Saving…" : "Mark as Posted"}
                </Button>
              </div>
              {!log?.certifiedAt && (
                <p className="text-xs text-red-600">Certify the summary before marking as posted.</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { format, getWeek } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateTimeEntry,
  deleteTimeEntry,
  updateMileageEntry,
  deleteMileageEntry,
  getTimeRegistrationOverview,
} from "@/server/actions/time-registration.actions";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { TimeEntryEditDialog } from "./time-entry-edit-dialog";
import { MileageEntryEditDialog } from "./mileage-entry-edit-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIME_TYPE_LABELS: Record<string, string> = {
  NORMAL: "Ordinær",
  OVERTIME_50: "Overtid 50 %",
  OVERTIME_100: "Overtid 100 %",
  WEEKEND: "Helg/helligdag",
  TRAVEL: "Reise/kjøring",
};

type OverviewData = NonNullable<
  Awaited<ReturnType<typeof getTimeRegistrationOverview>>["data"]
>;

interface TimeRegistrationOverviewProps {
  initialData: OverviewData;
  tenantId: string;
  isAdmin: boolean;
  /** Når satt, viser kun denne brukerens registreringer (for ansatt) */
  restrictToUserId?: string;
}

export function TimeRegistrationOverview({
  initialData,
  tenantId,
  isAdmin,
  restrictToUserId,
}: TimeRegistrationOverviewProps) {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const now = new Date();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [week] = useState(() =>
    getWeek(new Date(), { weekStartsOn: 1, locale: nb })
  );
  const ALL_FILTER = "__all__" as const;
  const [projectFilter, setProjectFilter] = useState<string>(ALL_FILTER);
  const [userFilter, setUserFilter] = useState<string>(ALL_FILTER);
  const [deleteId, setDeleteId] = useState<{
    type: "time" | "mileage";
    id: string;
  } | null>(null);
  const [editTimeEntry, setEditTimeEntry] = useState<
    OverviewData["timeEntries"][number] | null
  >(null);
  const [editMileageEntry, setEditMileageEntry] = useState<
    OverviewData["mileageEntries"][number] | null
  >(null);

  const refresh = async () => {
    const nowRef = new Date();
    const effectivePeriod = restrictToUserId ? "month" as const : period;
    const effectiveYear = restrictToUserId ? nowRef.getFullYear() : year;
    const effectiveMonth = restrictToUserId ? nowRef.getMonth() + 1 : month;
    const res = await getTimeRegistrationOverview(tenantId, {
      period: effectivePeriod,
      year: effectiveYear,
      month: effectiveMonth,
      week,
      projectId: projectFilter === ALL_FILTER ? undefined : projectFilter,
      userId: restrictToUserId ?? (userFilter === ALL_FILTER ? undefined : userFilter),
    });
    if (res.success && res.data) setData(res.data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res =
      deleteId.type === "time"
        ? await deleteTimeEntry(deleteId.id)
        : await deleteMileageEntry(deleteId.id);
    if (!res.success) {
      toast({ variant: "destructive", title: res.error });
      return;
    }
    toast({ title: "Slettet" });
    setDeleteId(null);
    refresh();
  };

  const normalHours = data.timeEntries
    .filter((e) => e.timeType === "NORMAL" || e.timeType === "TRAVEL")
    .reduce((s, e) => s + e.hours, 0);
  const overtimeHours = data.timeEntries
    .filter((e) =>
      ["OVERTIME_50", "OVERTIME_100", "WEEKEND"].includes(e.timeType)
    )
    .reduce((s, e) => s + e.hours, 0);
  const totalKm = data.mileageEntries.reduce((s, e) => s + e.kilometers, 0);
  const totalAmount = data.mileageEntries.reduce(
    (s, e) => s + (e.amount ?? e.kilometers * (e.ratePerKm ?? 4.5)),
    0
  );

  const displayName = (userId: string) =>
    data.userDisplayNames[userId] || userId;

  return (
    <div className="space-y-4">
      {restrictToUserId && (
        <p className="text-sm text-muted-foreground">
          Gjeldende måned – oversikt for lønn
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {!restrictToUserId && (
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Uke</SelectItem>
            <SelectItem value="month">Måned</SelectItem>
            <SelectItem value="year">År</SelectItem>
          </SelectContent>
        </Select>
        )}
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle prosjekter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>Alle prosjekter</SelectItem>
            {data.projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle ansatte" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value={ALL_FILTER}>Alle ansatte</SelectItem>
            {data.users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="ghost" size="sm" onClick={refresh}>
          Oppdater
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <div className="rounded-lg border p-3">
          <span className="text-muted-foreground">Ordinære timer</span>
          <p className="text-xl font-bold">{normalHours.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <span className="text-muted-foreground">Overtidstimer</span>
          <p className="text-xl font-bold">{overtimeHours.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <span className="text-muted-foreground">Totalt km</span>
          <p className="text-xl font-bold">{totalKm.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <span className="text-muted-foreground">Km godtgjørelse</span>
          <p className="text-xl font-bold">{totalAmount.toFixed(0)} kr</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Prosjekt</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Timer / Km</TableHead>
              <TableHead>Kommentar</TableHead>
              {isAdmin && <TableHead className="w-20"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.timeEntries.map((e) => (
              <TableRow key={`t-${e.id}`}>
                <TableCell className="font-medium">
                  {displayName(e.user.id)}
                </TableCell>
                <TableCell>
                  {format(new Date(e.date), "dd.MM.yy", { locale: nb })}
                </TableCell>
                <TableCell>
                  {e.project.code ? `${e.project.code} – ` : ""}
                  {e.project.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {TIME_TYPE_LABELS[e.timeType] || e.timeType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{e.hours} t</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {e.comment || "–"}
                </TableCell>
                {isAdmin && (
                  <TableCell className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditTimeEntry(e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteId({ type: "time", id: e.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.mileageEntries.map((e) => (
              <TableRow key={`m-${e.id}`}>
                <TableCell className="font-medium">
                  {displayName(e.user.id)}
                </TableCell>
                <TableCell>
                  {format(new Date(e.date), "dd.MM.yy", { locale: nb })}
                </TableCell>
                <TableCell>
                  {e.project.code ? `${e.project.code} – ` : ""}
                  {e.project.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    Km
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {e.kilometers} km (
                  {(e.amount ?? 0).toFixed(0)} kr)
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {e.comment || "–"}
                </TableCell>
                {isAdmin && (
                  <TableCell className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditMileageEntry(e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setDeleteId({ type: "mileage", id: e.id })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.timeEntries.length === 0 && data.mileageEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  Ingen registreringer i valgt periode
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editTimeEntry && (
        <TimeEntryEditDialog
          open={!!editTimeEntry}
          onOpenChange={(o) => !o && setEditTimeEntry(null)}
          entry={editTimeEntry}
          onSuccess={() => {
            setEditTimeEntry(null);
            refresh();
          }}
        />
      )}
      {editMileageEntry && (
        <MileageEntryEditDialog
          open={!!editMileageEntry}
          onOpenChange={(o) => !o && setEditMileageEntry(null)}
          entry={editMileageEntry}
          onSuccess={() => {
            setEditMileageEntry(null);
            refresh();
          }}
        />
      )}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slette registrering?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

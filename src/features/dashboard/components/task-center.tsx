"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Clipboard,
  GraduationCap,
  Calendar,
  Bell,
  ChevronRight,
  AlertCircle,
  Beaker,
  Target,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { getMyTasks, type TaskSummary } from "@/server/actions/task.actions";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

interface TaskCenterProps {
  tenantId: string;
  userId: string;
}

export function TaskCenter({ tenantId, userId }: TaskCenterProps) {
  const [tasks, setTasks] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      const result = await getMyTasks();
      if (result.success && result.data) {
        setTasks(result.data);
      }
      setLoading(false);
    }
    loadTasks();
  }, []);

  if (loading) {
    return <TaskCenterSkeleton />;
  }

  if (!tasks) {
    return null;
  }

  const criticalCount = tasks.overdueMeasures + tasks.overdueIncidents + tasks.expiredTraining;
  const upcomingCount = tasks.upcomingMeasures.length + tasks.upcomingMeetings.length + 
    tasks.upcomingInspections.length + tasks.upcomingAudits.length;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clipboard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Oppgavesenter</CardTitle>
              <CardDescription>Dine oppgaver og frister</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} kritiske
              </Badge>
            )}
            {upcomingCount > 0 && (
              <Badge variant="secondary">
                {upcomingCount} kommende
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="critical" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="critical" className="relative">
              Kritisk
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {criticalCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">Kommende</TabsTrigger>
            <TabsTrigger value="reviews">Gjennomgang</TabsTrigger>
            <TabsTrigger value="all">Alt</TabsTrigger>
          </TabsList>

          {/* KRITISKE OPPGAVER */}
          <TabsContent value="critical">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {criticalCount === 0 ? (
                  <EmptyState 
                    icon={CheckCircle2} 
                    title="Ingen kritiske oppgaver" 
                    description="Du er ajour! Bra jobbet 🎉"
                  />
                ) : (
                  <>
                    {/* Forfalte tiltak */}
                    {tasks.overdueMeasures > 0 && (
                      <TaskGroup
                        icon={AlertTriangle}
                        iconColor="text-red-600"
                        bgColor="bg-red-50"
                        title={`${tasks.overdueMeasures} forfalte tiltak`}
                        description="Tiltak som har passert frist"
                        link="/dashboard/actions"
                        priority="critical"
                      />
                    )}

                    {/* Forfalte avvik */}
                    {tasks.overdueIncidents > 0 && (
                      <TaskGroup
                        icon={AlertCircle}
                        iconColor="text-red-600"
                        bgColor="bg-red-50"
                        title={`${tasks.overdueIncidents} avvik venter`}
                        description="Avvik som ikke er behandlet"
                        link="/dashboard/incidents"
                        priority="critical"
                      />
                    )}

                    {/* Utløpt opplæring */}
                    {tasks.expiredTraining > 0 && (
                      <TaskGroup
                        icon={GraduationCap}
                        iconColor="text-red-600"
                        bgColor="bg-red-50"
                        title={`${tasks.expiredTraining} utløpt opplæring`}
                        description="Sertifiseringer som må fornyes"
                        link="/dashboard/training"
                        priority="critical"
                      />
                    )}

                    {/* Forfalte vernerunder */}
                    {tasks.overdueInspections > 0 && (
                      <TaskGroup
                        icon={Shield}
                        iconColor="text-red-600"
                        bgColor="bg-red-50"
                        title={`${tasks.overdueInspections} forfalte vernerunder`}
                        description="Vernerunder som ikke er gjennomført"
                        link="/dashboard/inspections"
                        priority="critical"
                      />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* KOMMENDE OPPGAVER */}
          <TabsContent value="upcoming">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {upcomingCount === 0 ? (
                  <EmptyState 
                    icon={Calendar} 
                    title="Ingen kommende oppgaver" 
                    description="Du har ingen planlagte oppgaver de neste 7 dagene"
                  />
                ) : (
                  <>
                    {/* Kommende tiltak */}
                    {tasks.upcomingMeasures.map((measure) => (
                      <TaskItem
                        key={measure.id}
                        icon={CheckCircle2}
                        iconColor="text-amber-600"
                        bgColor="bg-amber-50"
                        title={measure.title}
                        description={`Frist: ${formatDistanceToNow(new Date(measure.dueAt), { addSuffix: true, locale: nb })}`}
                        link="/dashboard/actions"
                        priority="medium"
                      />
                    ))}

                    {/* Kommende møter */}
                    {tasks.upcomingMeetings.map((meeting) => (
                      <TaskItem
                        key={meeting.id}
                        icon={Users}
                        iconColor="text-blue-600"
                        bgColor="bg-blue-50"
                        title={meeting.title}
                        description={`${meeting.type} - ${formatDistanceToNow(new Date(meeting.scheduledDate), { addSuffix: true, locale: nb })}`}
                        link={`/dashboard/meetings/${meeting.id}`}
                        priority="normal"
                      />
                    ))}

                    {/* Kommende inspeksjoner */}
                    {tasks.upcomingInspections.map((inspection) => (
                      <TaskItem
                        key={inspection.id}
                        icon={Clipboard}
                        iconColor="text-green-600"
                        bgColor="bg-green-50"
                        title={inspection.title}
                        description={formatDistanceToNow(new Date(inspection.scheduledDate), { addSuffix: true, locale: nb })}
                        link={`/dashboard/inspections/${inspection.id}`}
                        priority="normal"
                      />
                    ))}

                    {/* Kommende revisjoner */}
                    {tasks.upcomingAudits.map((audit) => (
                      <TaskItem
                        key={audit.id}
                        icon={FileText}
                        iconColor="text-purple-600"
                        bgColor="bg-purple-50"
                        title={audit.title}
                        description={formatDistanceToNow(new Date(audit.scheduledDate), { addSuffix: true, locale: nb })}
                        link={`/dashboard/audits/${audit.id}`}
                        priority="normal"
                      />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* GJENNOMGANG */}
          <TabsContent value="reviews">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {tasks.documentsNeedingReview > 0 && (
                  <TaskGroup
                    icon={FileText}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title={`${tasks.documentsNeedingReview} dokumenter`}
                    description="Trenger revisjon innen 30 dager"
                    link="/dashboard/documents"
                    priority="medium"
                  />
                )}

                {tasks.chemicalsNeedingReview > 0 && (
                  <TaskGroup
                    icon={Beaker}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title={`${tasks.chemicalsNeedingReview} kjemikalier`}
                    description="SDS trenger oppdatering"
                    link="/dashboard/chemicals"
                    priority="medium"
                  />
                )}

                {tasks.risksNeedingReview > 0 && (
                  <TaskGroup
                    icon={AlertTriangle}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title={`${tasks.risksNeedingReview} risikoer`}
                    description="Trenger gjennomgang"
                    link="/dashboard/risks"
                    priority="medium"
                  />
                )}

                {tasks.goalsAtRisk > 0 && (
                  <TaskGroup
                    icon={Target}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title={`${tasks.goalsAtRisk} mål i fare`}
                    description="Krever oppfølging"
                    link="/dashboard/goals"
                    priority="medium"
                  />
                )}

                {tasks.expiringTraining.length > 0 && (
                  <TaskGroup
                    icon={GraduationCap}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title={`${tasks.expiringTraining.length} opplæringer utløper`}
                    description="Innen 30 dager"
                    link="/dashboard/training"
                    priority="medium"
                  />
                )}

                {tasks.documentsNeedingReview === 0 && 
                 tasks.chemicalsNeedingReview === 0 && 
                 tasks.risksNeedingReview === 0 && 
                 tasks.goalsAtRisk === 0 &&
                 tasks.expiringTraining.length === 0 && (
                  <EmptyState 
                    icon={CheckCircle2} 
                    title="Alt er gjennomgått" 
                    description="Ingen elementer trenger gjennomgang akkurat nå"
                  />
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ALLE OPPGAVER */}
          <TabsContent value="all">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={AlertCircle}
                    label="Åpne avvik"
                    value={tasks.openIncidents}
                    link="/dashboard/incidents"
                    color={tasks.openIncidents > 0 ? "text-red-600" : "text-gray-400"}
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Aktive tiltak"
                    value={tasks.activeMeasures}
                    link="/dashboard/actions"
                    color={tasks.activeMeasures > 0 ? "text-amber-600" : "text-gray-400"}
                  />
                  <StatCard
                    icon={Calendar}
                    label="Møter (7d)"
                    value={tasks.upcomingMeetings.length}
                    link="/dashboard/meetings"
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={Bell}
                    label="Uleste varsler"
                    value={tasks.unreadNotifications}
                    link="/dashboard"
                    color={tasks.unreadNotifications > 0 ? "text-blue-600" : "text-gray-400"}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Sammendrag</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Kritiske oppgaver</span>
                      <span className="font-medium text-red-600">{criticalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kommende (7 dager)</span>
                      <span className="font-medium">{upcomingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trenger gjennomgang</span>
                      <span className="font-medium text-amber-600">
                        {tasks.documentsNeedingReview + tasks.chemicalsNeedingReview + tasks.risksNeedingReview}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Hjelpkomponenter
interface TaskGroupProps {
  icon: any;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  link: string;
  priority: "critical" | "medium" | "normal";
}

function TaskGroup({ icon: Icon, iconColor, bgColor, title, description, link, priority }: TaskGroupProps) {
  return (
    <Link href={link}>
      <div className={`flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
        priority === "critical" ? "border-red-200 bg-red-50/50" : 
        priority === "medium" ? "border-amber-200 bg-amber-50/50" : 
        "border-gray-200 hover:border-gray-300"
      }`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}

function TaskItem({ icon: Icon, iconColor, bgColor, title, description, link, priority }: TaskGroupProps) {
  return (
    <Link href={link}>
      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </Link>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  link: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, link, color }: StatCardProps) {
  return (
    <Link href={link}>
      <div className="p-3 rounded-lg border hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </Link>
  );
}

interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TaskCenterSkeleton() {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}


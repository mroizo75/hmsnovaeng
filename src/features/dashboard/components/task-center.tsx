"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
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
import { enUS } from "date-fns/locale";

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

  if (loading) return <TaskCenterSkeleton />;
  if (!tasks) return null;

  const criticalCount =
    tasks.overdueMeasures +
    tasks.overdueIncidents +
    tasks.expiredTraining +
    tasks.overdueInspections;
  const upcomingCount =
    tasks.upcomingMeasures.length +
    tasks.upcomingMeetings.length +
    tasks.upcomingInspections.length +
    tasks.upcomingAudits.length;
  const reviewCount =
    tasks.documentsNeedingReview +
    tasks.chemicalsNeedingReview +
    tasks.risksNeedingReview +
    tasks.goalsAtRisk +
    tasks.expiringTraining.length;

  const hasCritical =
    tasks.overdueMeasures > 0 ||
    tasks.overdueIncidents > 0 ||
    tasks.expiredTraining > 0 ||
    tasks.overdueInspections > 0;
  const hasUpcoming = upcomingCount > 0;
  const hasReview = reviewCount > 0;
  const hasAny = hasCritical || hasUpcoming || hasReview;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Task Center</CardTitle>
            <CardDescription className="text-xs">
              Critical · Upcoming · Review
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} critical
              </Badge>
            )}
            {upcomingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {upcomingCount} upcoming
              </Badge>
            )}
            {reviewCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {reviewCount} review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-3">
          <div className="space-y-4">
            {!hasAny && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p className="font-medium text-foreground">All up to date</p>
                <p>No critical or upcoming tasks</p>
              </div>
            )}

            {/* Critical */}
            {hasCritical && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Critical
                </h3>
                <div className="space-y-1.5">
                  {tasks.overdueMeasures > 0 && (
                    <TaskRow
                      icon={AlertTriangle}
                      iconClass="text-red-600 bg-red-50"
                      title={`${tasks.overdueMeasures} overdue actions`}
                      href="/dashboard/actions"
                    />
                  )}
                  {tasks.overdueIncidents > 0 && (
                    <TaskRow
                      icon={AlertCircle}
                      iconClass="text-red-600 bg-red-50"
                      title={`${tasks.overdueIncidents} incidents pending`}
                      href="/dashboard/incidents"
                    />
                  )}
                  {tasks.expiredTraining > 0 && (
                    <TaskRow
                      icon={GraduationCap}
                      iconClass="text-red-600 bg-red-50"
                      title={`${tasks.expiredTraining} expired training`}
                      href="/dashboard/training"
                    />
                  )}
                  {tasks.overdueInspections > 0 && (
                    <TaskRow
                      icon={Shield}
                      iconClass="text-red-600 bg-red-50"
                      title={`${tasks.overdueInspections} overdue inspections`}
                      href="/dashboard/inspections"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {hasUpcoming && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Upcoming (7 days)
                </h3>
                <div className="space-y-1.5">
                  {tasks.upcomingMeasures.map((m) => (
                    <TaskRow
                      key={m.id}
                      icon={CheckCircle2}
                      iconClass="text-amber-600 bg-amber-50"
                      title={m.title}
                      sub={formatDistanceToNow(new Date(m.dueAt), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                      href="/dashboard/actions"
                    />
                  ))}
                  {tasks.upcomingMeetings.map((m) => (
                    <TaskRow
                      key={m.id}
                      icon={Users}
                      iconClass="text-blue-600 bg-blue-50"
                      title={m.title}
                      sub={formatDistanceToNow(new Date(m.scheduledDate), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                      href={`/dashboard/meetings/${m.id}`}
                    />
                  ))}
                  {tasks.upcomingInspections.map((i) => (
                    <TaskRow
                      key={i.id}
                      icon={Clipboard}
                      iconClass="text-green-600 bg-green-50"
                      title={i.title}
                      sub={formatDistanceToNow(new Date(i.scheduledDate), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                      href={`/dashboard/inspections/${i.id}`}
                    />
                  ))}
                  {tasks.upcomingAudits.map((a) => (
                    <TaskRow
                      key={a.id}
                      icon={FileText}
                      iconClass="text-purple-600 bg-purple-50"
                      title={a.title}
                      sub={formatDistanceToNow(new Date(a.scheduledDate), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                      href={`/dashboard/audits/${a.id}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Needs review */}
            {hasReview && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Needs review
                </h3>
                <div className="space-y-1.5">
                  {tasks.documentsNeedingReview > 0 && (
                    <TaskRow
                      icon={FileText}
                      iconClass="text-amber-600 bg-amber-50"
                      title={`${tasks.documentsNeedingReview} documents`}
                      href="/dashboard/documents"
                    />
                  )}
                  {tasks.chemicalsNeedingReview > 0 && (
                    <TaskRow
                      icon={Beaker}
                      iconClass="text-amber-600 bg-amber-50"
                      title={`${tasks.chemicalsNeedingReview} chemicals`}
                      href="/dashboard/chemicals"
                    />
                  )}
                  {tasks.risksNeedingReview > 0 && (
                    <TaskRow
                      icon={AlertTriangle}
                      iconClass="text-amber-600 bg-amber-50"
                      title={`${tasks.risksNeedingReview} risks`}
                      href="/dashboard/risks"
                    />
                  )}
                  {tasks.goalsAtRisk > 0 && (
                    <TaskRow
                      icon={Target}
                      iconClass="text-amber-600 bg-amber-50"
                      title={`${tasks.goalsAtRisk} goals at risk`}
                      href="/dashboard/goals"
                    />
                  )}
                  {tasks.expiringTraining.length > 0 && (
                    <TaskRow
                      icon={GraduationCap}
                      iconClass="text-amber-600 bg-amber-50"
                      title={`${tasks.expiringTraining.length} training expiring`}
                      href="/dashboard/training"
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        {/* Compact summary at bottom */}
        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t text-sm">
          <Link
            href="/dashboard/incidents"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{tasks.openIncidents} incidents</span>
          </Link>
          <Link
            href="/dashboard/actions"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{tasks.activeMeasures} actions</span>
          </Link>
          <Link
            href="/dashboard/meetings"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
            <span>{tasks.upcomingMeetings.length} meetings</span>
          </Link>
          {tasks.unreadNotifications > 0 && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-blue-600 hover:underline"
            >
              <Bell className="h-4 w-4" />
              <span>{tasks.unreadNotifications} alerts</span>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  sub?: string;
  href: string;
}

function TaskRow({ icon: Icon, iconClass, title, sub, href }: TaskRowProps) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 py-2 px-2.5 rounded-md border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          {sub && (
            <p className="text-xs text-muted-foreground truncate">{sub}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

function TaskCenterSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { HeroStats } from "@/features/dashboard/components/hero-stats";
import { CriticalAlerts } from "@/features/dashboard/components/critical-alerts";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { MyTasks } from "@/features/dashboard/components/my-tasks";
import { HMSScoreChart } from "@/features/dashboard/components/hms-score-chart";
import { TaskCenter } from "@/features/dashboard/components/task-center";
import { getPermissions } from "@/lib/permissions";
import { subMonths, format } from "date-fns";
import { enUS } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!user || user.tenants.length === 0) {
    return <div>You are not linked to a tenant.</div>;
  }

  const tenantId = user.tenants[0].tenantId;
  const userRole = user.tenants[0].role;
  const permissions = getPermissions(userRole);

  // Ensure older incidents have valid status after enum changes
  await prisma.$executeRawUnsafe(`
    UPDATE Incident
    SET status = 'OPEN'
    WHERE status NOT IN ('OPEN','INVESTIGATING','ACTION_TAKEN','CLOSED')
       OR status IS NULL
       OR status = ''
  `);

  // Fetch stats from modules the user has access to
  const [
    documents,
    risks,
    incidents,
    measures,
    audits,
    trainings,
    goals,
  ] = await Promise.all([
    permissions.canReadDocuments
      ? prisma.document.findMany({ where: { tenantId } })
      : [],
    permissions.canReadRisks
      ? prisma.risk.findMany({ where: { tenantId } })
      : [],
    permissions.canReadIncidents
      ? prisma.incident.findMany({
          where: {
            tenantId,
            // Employee sees only their own incidents
            ...(userRole === "ANSATT" && { reportedById: user.id }),
          },
        })
      : [],
    permissions.canReadActions
      ? prisma.measure.findMany({
          where: {
            tenantId,
            // Employee sees only their own actions
            ...(userRole === "ANSATT" && { assignedToId: user.id }),
          },
        })
      : [],
    permissions.canReadAudits
      ? prisma.audit.findMany({ where: { tenantId }, include: { findings: true } })
      : [],
    permissions.canReadOwnTraining || permissions.canReadAllTraining
      ? prisma.training.findMany({
          where: {
            tenantId,
            // Show only own training if no access to all
            ...(!permissions.canReadAllTraining && { userId: user.id }),
          },
        })
      : [],
    permissions.canReadGoals
      ? prisma.goal.findMany({ where: { tenantId } })
      : [],
  ]);

  // Calculate critical statistics
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const criticalRisks = risks.filter((r) => r.score && r.score >= 15);
  const myOverdueTasks = measures.filter(
    (m) => m.status !== "DONE" && m.responsibleId === user.id && new Date(m.dueAt) < now
  );
  const myTasksThisWeek = measures.filter(
    (m) =>
      m.status !== "DONE" &&
      m.responsibleId === user.id &&
      new Date(m.dueAt) >= now &&
      new Date(m.dueAt) <= sevenDaysFromNow
  );
  const openIncidents = incidents.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING");

  // Build critical alerts
  const alerts: Array<{
    id: string;
    title: string;
    type: "overdue" | "upcoming" | "critical";
    link: string;
    date?: Date;
    category: string;
  }> = [];

  // Overdue actions
  measures
    .filter((m) => m.status !== "DONE" && new Date(m.dueAt) < now)
    .slice(0, 3)
    .forEach((m) => {
      alerts.push({
        id: m.id,
        title: m.title,
        type: "overdue" as const,
        link: `/dashboard/actions`,
        date: m.dueAt,
        category: "Action",
      });
    });

  // Critical risks
  criticalRisks.slice(0, 2).forEach((r) => {
    alerts.push({
      id: r.id,
      title: r.title,
      type: "critical" as const,
      link: `/dashboard/risks/${r.id}`,
      category: "Risk",
    });
  });

  // Expired training
  trainings
    .filter((t) => t.validUntil && new Date(t.validUntil) < now && !t.completedAt)
    .slice(0, 2)
    .forEach((t) => {
      alerts.push({
        id: t.id,
        title: t.title,
        type: "overdue" as const,
        link: `/dashboard/training/${t.id}`,
        date: t.validUntil!,
        category: "Training",
      });
    });

  // Upcoming audits (next 7 days)
  audits
    .filter(
      (a) =>
        a.status !== "COMPLETED" &&
        new Date(a.scheduledDate) >= now &&
        new Date(a.scheduledDate) <= sevenDaysFromNow
    )
    .slice(0, 2)
    .forEach((a) => {
      alerts.push({
        id: a.id,
        title: a.title,
        type: "upcoming" as const,
        link: `/dashboard/audits/${a.id}`,
        date: a.scheduledDate,
        category: "Audit",
      });
    });

  // Sort: critical first, then overdue, then upcoming
  const sortedAlerts = alerts.sort((a, b) => {
    const priority = { critical: 0, overdue: 1, upcoming: 2 };
    return priority[a.type] - priority[b.type];
  });

  // Build activity feed (last 5)
  const activities = [
    ...documents.map((d) => ({
      id: d.id,
      type: "document" as const,
      title: d.title,
      timestamp: d.createdAt,
      link: `/dashboard/documents/${d.id}`,
      status: d.status,
    })),
    ...risks.map((r) => ({
      id: r.id,
      type: "risk" as const,
      title: r.title,
      timestamp: r.createdAt,
      link: `/dashboard/risks/${r.id}`,
      status: r.status,
    })),
    ...incidents.map((i) => ({
      id: i.id,
      type: "incident" as const,
      title: i.title,
      timestamp: i.occurredAt,
      link: `/dashboard/incidents/${i.id}`,
      status: i.status,
    })),
    ...measures.map((m) => ({
      id: m.id,
      type: "action" as const,
      title: m.title,
      timestamp: m.createdAt,
      link: `/dashboard/actions`,
      status: m.status,
    })),
    ...audits.map((a) => ({
      id: a.id,
      type: "audit" as const,
      title: a.title,
      timestamp: a.createdAt,
      link: `/dashboard/audits/${a.id}`,
      status: a.status,
    })),
    ...trainings.map((t) => ({
      id: t.id,
      type: "training" as const,
      title: t.title,
      timestamp: t.createdAt,
      link: `/dashboard/training/${t.id}`,
      status: t.completedAt ? "COMPLETED" : "PENDING",
    })),
    ...goals.map((g) => ({
      id: g.id,
      type: "goal" as const,
      title: g.title,
      timestamp: g.createdAt,
      link: `/dashboard/goals/${g.id}`,
      status: g.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);


  // Build my tasks (max 6 most important)
  const myTasks: Array<{
    id: string;
    title: string;
    type: "measure" | "training" | "audit";
    dueDate: Date | undefined;
    priority: "high" | "medium" | "low";
    link: string;
  }> = [];

  // My overdue actions
  myOverdueTasks.forEach((m) => {
    myTasks.push({
      id: m.id,
      title: m.title,
      type: "measure" as const,
      dueDate: m.dueAt,
      priority: "high" as const,
      link: `/dashboard/actions`,
    });
  });

  // My actions this week
  myTasksThisWeek.slice(0, 3).forEach((m) => {
    myTasks.push({
      id: m.id,
      title: m.title,
      type: "measure" as const,
      dueDate: m.dueAt,
      priority: "medium" as const,
      link: `/dashboard/actions`,
    });
  });

  // My pending training
  trainings
    .filter((t) => t.userId === user.id && !t.completedAt)
    .slice(0, 2)
    .forEach((t) => {
      const priority: "high" | "medium" | "low" = t.validUntil && new Date(t.validUntil) < now ? "high" : "low";
      myTasks.push({
        id: t.id,
        title: t.title,
        type: "training",
        dueDate: t.validUntil || undefined,
        priority,
        link: `/dashboard/training/${t.id}`,
      });
    });

  const sortedTasks = myTasks.slice(0, 6);

  // Build Hero Stats
  const heroStats = [];

  // Critical risks (always show if access)
  if (permissions.canReadRisks && criticalRisks.length > 0) {
    heroStats.push({
      title: "Critical Risks",
      value: criticalRisks.length,
      subtitle: `Of ${risks.length} risks total`,
      variant: "danger" as const,
      icon: "risk" as const,
    });
  }

  // My overdue tasks
  if (myOverdueTasks.length > 0) {
    heroStats.push({
      title: "Overdue Tasks",
      value: myOverdueTasks.length,
      subtitle: "Requires immediate action",
      variant: "danger" as const,
      icon: "todo" as const,
    });
  }

  // My tasks this week
  const weekTaskVariant: "danger" | "warning" | "success" | "info" = myTasksThisWeek.length > 5 ? "warning" : "success";
  heroStats.push({
    title: "Tasks This Week",
    value: myTasksThisWeek.length,
    subtitle: "Planned next 7 days",
    variant: weekTaskVariant,
    icon: "check" as const,
  });

  // Open incidents (if access)
  if (permissions.canReadIncidents && openIncidents.length > 0) {
    heroStats.push({
      title: "Open Incidents",
      value: openIncidents.length,
      subtitle: "Pending investigation",
      variant: "warning" as const,
      icon: "trend" as const,
    });
  }

  // If fewer than 3 stats, add EHS compliance or another relevant stat
  if (heroStats.length < 3 && permissions.canViewAnalytics) {
    const completedMeasures = measures.filter((m) => m.status === "DONE").length;
    const totalMeasures = measures.length;
    const complianceRate = totalMeasures > 0 ? Math.round((completedMeasures / totalMeasures) * 100) : 100;
    const complianceVariant: "danger" | "warning" | "success" | "info" = 
      complianceRate >= 80 ? "success" : complianceRate >= 60 ? "warning" : "danger";

    heroStats.push({
      title: "Action Completion",
      value: complianceRate,
      subtitle: `${completedMeasures} of ${totalMeasures} completed`,
      variant: complianceVariant,
      icon: "trend" as const,
    });
  }

  // Generate EHS score data for the last 6 months
  const hmsScoreData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    // Calculate score based on:
    // - Risks closed (30%)
    // - Incidents handled (25%)
    // - Actions completed (25%)
    // - Documents updated (20%)
    
    const monthRisks = risks.filter((r) => 
      r.createdAt <= monthEnd
    );
    const closedRisks = monthRisks.filter((r) => r.status === "CLOSED");
    const riskScore = monthRisks.length > 0 ? (closedRisks.length / monthRisks.length) * 30 : 30;

    const monthIncidents = incidents.filter((i) =>
      i.createdAt <= monthEnd
    );
    const closedIncidents = monthIncidents.filter((i) => i.status === "CLOSED");
    const incidentScore = monthIncidents.length > 0 ? (closedIncidents.length / monthIncidents.length) * 25 : 25;

    const monthMeasures = measures.filter((m) =>
      m.createdAt <= monthEnd
    );
    const completedMeasures = monthMeasures.filter((m) => m.status === "DONE");
    const measureScore = monthMeasures.length > 0 ? (completedMeasures.length / monthMeasures.length) * 25 : 25;

    const monthDocuments = documents.filter((d) =>
      d.updatedAt >= monthStart && d.updatedAt <= monthEnd
    );
    const documentScore = monthDocuments.length > 0 ? Math.min((monthDocuments.length / 5) * 20, 20) : 15;

    const totalScore = Math.round(riskScore + incidentScore + measureScore + documentScore);

    hmsScoreData.push({
      month: format(monthDate, 'MMM', { locale: enUS }),
      score: Math.min(totalScore, 100),
    });
  }

  const tenantName = session.user.tenantName;
  const summaryParts: string[] = [];
  if (criticalRisks.length > 0) summaryParts.push(`${criticalRisks.length} critical risks`);
  if (myOverdueTasks.length > 0) summaryParts.push(`${myOverdueTasks.length} overdue tasks`);
  if (myTasksThisWeek.length > 0) summaryParts.push(`${myTasksThisWeek.length} tasks this week`);
  if (openIncidents.length > 0) summaryParts.push(`${openIncidents.length} open incidents`);
  const summaryLine = summaryParts.length > 0 ? summaryParts.join(" · ") : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user.name || user.email}
        </h1>
        <p className="text-muted-foreground">
          {summaryLine ?? "Your H&S overview for today"}
        </p>
        {tenantName && (
          <div className="mt-2 lg:hidden">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{tenantName}</span>
            </p>
          </div>
        )}
      </div>

      {/* Hero Stats */}
      {heroStats.length > 0 && <HeroStats stats={heroStats.slice(0, 4)} />}

      {/* Critical Alerts */}
      {sortedAlerts.length > 0 && <CriticalAlerts alerts={sortedAlerts} />}

      {/* Quick Actions - compact row */}
      <QuickActions permissions={permissions} userRole={userRole} />

      {/* Task center + main content: tasks and activity side by side with chart */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <TaskCenter tenantId={tenantId} userId={user.id} />
          {sortedTasks.length > 0 && <MyTasks tasks={sortedTasks} />}
          {activities.length > 0 && <ActivityFeed activities={activities} />}
        </div>
        <div className="lg:col-span-2 space-y-6">
          <HMSScoreChart data={hmsScoreData} />
        </div>
      </div>
    </div>
  );
}

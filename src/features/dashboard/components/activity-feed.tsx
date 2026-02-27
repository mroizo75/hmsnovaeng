"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  ListTodo,
  ClipboardCheck,
  GraduationCap,
  Target,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { enUS } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "document" | "risk" | "incident" | "action" | "audit" | "training" | "goal";
  title: string;
  description?: string;
  timestamp: Date;
  link?: string;
  status?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "document":
        return FileText;
      case "risk":
        return AlertTriangle;
      case "incident":
        return AlertCircle;
      case "action":
        return ListTodo;
      case "audit":
        return ClipboardCheck;
      case "training":
        return GraduationCap;
      case "goal":
        return Target;
      default:
        return FileText;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "document":
        return "Document";
      case "risk":
        return "Risk";
      case "incident":
        return "Incident";
      case "action":
        return "Action";
      case "audit":
        return "Audit";
      case "training":
        return "Training";
      case "goal":
        return "Goal";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return null;
    
    const statusMap: Record<string, string> = {
      // Document statuses
      DRAFT: "Draft",
      APPROVED: "Approved",
      ARCHIVED: "Archived",
      
      // Risk statuses
      OPEN: "Open",
      MITIGATED: "Mitigated",
      ACCEPTED: "Accepted",
      CLOSED: "Closed",
      
      // Incident statuses
      REPORTED: "Reported",
      INVESTIGATING: "Under investigation",
      RESOLVED: "Resolved",
      
      // Action/Measure statuses
      PENDING: "Pending",
      IN_PROGRESS: "In progress",
      DONE: "Done",
      CANCELLED: "Cancelled",
      
      // Audit statuses
      PLANNED: "Planned",
      COMPLETED: "Completed",
      
      // Goal statuses
      ACTIVE: "Active",
      ACHIEVED: "Achieved",
      AT_RISK: "At risk",
      FAILED: "Not achieved",
    };
    
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "";
    
    // Green statuses (completed/approved)
    if (["APPROVED", "DONE", "COMPLETED", "RESOLVED", "ACHIEVED", "CLOSED", "MITIGATED"].includes(status)) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    
    // Blue statuses (in progress/active)
    if (["IN_PROGRESS", "INVESTIGATING", "ACTIVE", "PLANNED"].includes(status)) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    
    // Yellow statuses (pending/warning)
    if (["PENDING", "DRAFT", "REPORTED", "OPEN", "AT_RISK"].includes(status)) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    
    // Gray statuses (cancelled/failed)
    if (["CANCELLED", "FAILED", "ARCHIVED"].includes(status)) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
    
    // Orange for accepted risk
    if (status === "ACCEPTED") {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Recent activity in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No activity recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Recent activity in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  <div className="mt-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getLabel(activity.type)}
                      </Badge>
                      {activity.status && (
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </Badge>
                      )}
                    </div>
                    {activity.link ? (
                      <Link
                        href={activity.link}
                        className="text-sm font-medium hover:underline"
                      >
                        {activity.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{activity.title}</p>
                    )}
                    {activity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {mounted
                        ? formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: enUS,
                          })
                        : format(new Date(activity.timestamp), "MMM d, yyyy HH:mm", {
                            locale: enUS,
                          })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  ClipboardCheck,
  AlertCircle,
  ListTodo,
  Mail,
  CheckCircle2,
  Loader2,
  Bell,
  Target,
  FileBarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailTestPanelProps {
  currentUser: {
    id: string;
    email: string;
    name: string | null;
    notifyByEmail: boolean;
  };
  tenantUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    notifyByEmail: boolean;
    notifyBySms: boolean;
    phone: string | null;
  }>;
  tenantId: string;
  tenantName: string;
}

type NotificationType =
  | "meeting"
  | "inspection"
  | "audit"
  | "measure"
  | "incident"
  | "training"
  | "document"
  | "management-review";

const notificationTypes: Array<{
  value: NotificationType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "meeting",
    label: "Meeting notification",
    description: "Reminder about an upcoming meeting (safety committee, management review, etc.)",
    icon: Calendar,
  },
  {
    value: "inspection",
    label: "Inspection notification",
    description: "Reminder about a planned inspection/safety walkthrough",
    icon: ClipboardCheck,
  },
  {
    value: "audit",
    label: "Audit notification",
    description: "Reminder about an upcoming audit or review",
    icon: Target,
  },
  {
    value: "measure",
    label: "Action notification",
    description: "Reminder about actions approaching their due date",
    icon: ListTodo,
  },
  {
    value: "incident",
    label: "Incident report",
    description: "Notification about a new incident or deviation requiring follow-up",
    icon: AlertCircle,
  },
  {
    value: "training",
    label: "Training notification",
    description: "Reminder about a course expiring soon or that is mandatory",
    icon: Target,
  },
  {
    value: "document",
    label: "Document notification",
    description: "Notification about a document that needs review/approval",
    icon: FileBarChart,
  },
  {
    value: "management-review",
    label: "Management review",
    description: "Reminder about a planned management review",
    icon: FileBarChart,
  },
];

export function EmailTestPanel({
  currentUser,
  tenantUsers,
  tenantId,
  tenantName,
}: EmailTestPanelProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<NotificationType>("meeting");
  const [selectedUser, setSelectedUser] = useState<string>(currentUser.id);
  const [loading, setLoading] = useState(false);
  const [lastSent, setLastSent] = useState<{ type: string; email: string; time: Date } | null>(
    null
  );

  const selectedNotification = notificationTypes.find((n) => n.value === selectedType);
  const selectedUserData = tenantUsers.find((u) => u.id === selectedUser);

  const handleSendTest = async () => {
    if (!selectedUserData) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      });
      return;
    }

    if (!selectedUserData.notifyByEmail) {
      toast({
        title: "Warning",
        description: `${selectedUserData.name || selectedUserData.email} has disabled email notifications`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          userId: selectedUser,
          tenantId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Test email sent!",
          description: `${selectedNotification?.label} sent to ${selectedUserData.email}`,
          className: "bg-green-50 border-green-200",
        });
        setLastSent({
          type: selectedNotification?.label || "",
          email: selectedUserData.email,
          time: new Date(),
        });
      } else {
        toast({
          title: "Error sending",
          description: result.error || "Could not send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Test email error:", error);
      toast({
        title: "Error",
        description: "Could not send test email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const Icon = selectedNotification?.icon || Bell;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Send test email</CardTitle>
              <CardDescription>
                Select notification type and recipient to test the email system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>Notification type</Label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as NotificationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedNotification && (
              <p className="text-sm text-muted-foreground">{selectedNotification.description}</p>
            )}
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tenantUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.name || user.email}</span>
                      {user.notifyByEmail && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Email enabled
                        </Badge>
                      )}
                      {!user.notifyByEmail && (
                        <Badge variant="destructive" className="text-xs">
                          Email disabled
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUserData && (
              <p className="text-sm text-muted-foreground">
                Email will be sent to: <code className="bg-muted px-1 py-0.5 rounded">{selectedUserData.email}</code>
              </p>
            )}
          </div>

          {/* Preview */}
          {selectedNotification && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  Email preview
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Subject:</span>{" "}
                  <span className="text-muted-foreground">
                    {getEmailSubject(selectedType, tenantName)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Content:</span>{" "}
                  <span className="text-muted-foreground">
                    {getEmailPreview(selectedType, tenantName)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send button */}
          <Button onClick={handleSendTest} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send test email
              </>
            )}
          </Button>

          {/* Last sent */}
          {lastSent && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Last email sent</p>
                <p className="text-green-700">
                  {lastSent.type} to {lastSent.email}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  {lastSent.time.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User overview */}
      <Card>
        <CardHeader>
          <CardTitle>Users with email notifications</CardTitle>
          <CardDescription>
            Overview of which users have enabled email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tenantUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {user.notifyByEmail && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {user.notifyBySms && user.phone && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      SMS
                    </Badge>
                  )}
                  {!user.notifyByEmail && !user.notifyBySms && (
                    <Badge variant="outline" className="text-muted-foreground">
                      No notifications
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getEmailSubject(type: NotificationType, tenantName: string): string {
  switch (type) {
    case "meeting":
      return `Reminder: Meeting tomorrow - ${tenantName}`;
    case "inspection":
      return `Reminder: Safety inspection scheduled - ${tenantName}`;
    case "audit":
      return `Reminder: Audit scheduled - ${tenantName}`;
    case "measure":
      return `Reminder: Action due soon - ${tenantName}`;
    case "incident":
      return `New incident reported - ${tenantName}`;
    case "training":
      return `Reminder: Course expiring soon - ${tenantName}`;
    case "document":
      return `Document awaiting approval - ${tenantName}`;
    case "management-review":
      return `Reminder: Management review scheduled - ${tenantName}`;
    default:
      return `Notification from ${tenantName}`;
  }
}

function getEmailPreview(type: NotificationType, tenantName: string): string {
  switch (type) {
    case "meeting":
      return "You have a meeting tomorrow at 10:00 AM. Remember to prepare by reviewing the agenda.";
    case "inspection":
      return "A safety inspection is scheduled for tomorrow. Please make sure everything is ready.";
    case "audit":
      return "An audit is scheduled for next week. Make sure all documentation is up to date.";
    case "measure":
      return "You have 3 actions due within the next 7 days. Sign in to see details.";
    case "incident":
      return "A new incident has been reported and requires your follow-up. Sign in to see more.";
    case "training":
      return "Your first aid certification expires in 30 days. Please make sure to renew your certificate.";
    case "document":
      return "One or more documents are awaiting approval. Sign in to review.";
    case "management-review":
      return "It is almost time for the management review. Please prepare your report and data.";
    default:
      return `You have a new notification from EHS Nova.`;
  }
}

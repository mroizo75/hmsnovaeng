"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone, Calendar, ClipboardCheck, AlertCircle, Target, TestTube } from "lucide-react";
import type { User, UserTenant } from "@prisma/client";
import { updateNotificationSettings } from "@/server/actions/notification-settings.actions";
import Link from "next/link";

interface NotificationSettingsProps {
  user: User;
  userTenant: UserTenant;
}

export function NotificationSettings({ user, userTenant }: NotificationSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Use settings from UserTenant (tenant-specific)
  const [notifyByEmail, setNotifyByEmail] = useState(userTenant.notifyByEmail);
  const [notifyBySms, setNotifyBySms] = useState(userTenant.notifyBySms);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(userTenant.reminderDaysBefore);
  const [notifyMeetings, setNotifyMeetings] = useState(userTenant.notifyMeetings);
  const [notifyInspections, setNotifyInspections] = useState(userTenant.notifyInspections);
  const [notifyAudits, setNotifyAudits] = useState(userTenant.notifyAudits);
  const [notifyMeasures, setNotifyMeasures] = useState(userTenant.notifyMeasures);

  // Check phone number from both UserTenant and User (fallback)
  const hasPhoneNumber = !!userTenant.phone || !!user.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (notifyBySms && !hasPhoneNumber) {
      toast({
        variant: "destructive",
        title: "Missing phone number",
        description: "You must add a phone number to your profile to receive SMS notifications",
      });
      setLoading(false);
      return;
    }

    const result = await updateNotificationSettings({
      notifyByEmail,
      notifyBySms,
      reminderDaysBefore,
      notifyMeetings,
      notifyInspections,
      notifyAudits,
      notifyMeasures,
    });

    if (result.success) {
      toast({
        title: "✅ Settings saved",
        description: "Your notification settings have been updated",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not save settings",
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Notification settings</CardTitle>
              <CardDescription>
                Choose how and when you want to receive reminders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notification methods */}
      <Card>
        <CardHeader>
          <CardTitle>Notification methods</CardTitle>
          <CardDescription>
            How do you want to receive notifications?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyByEmail">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders via email ({user.email})
                </p>
              </div>
            </div>
            <Switch
              id="notifyByEmail"
              checked={notifyByEmail}
              onCheckedChange={setNotifyByEmail}
              disabled={loading}
            />
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyBySms">SMS notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {hasPhoneNumber
                    ? `Receive reminders via SMS (${userTenant.phone || user.phone})`
                    : "Add phone number to your profile to enable SMS"}
                </p>
                {notifyBySms && !hasPhoneNumber && (
                  <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    SMS requires phone number
                  </p>
                )}
              </div>
            </div>
            <Switch
              id="notifyBySms"
              checked={notifyBySms}
              onCheckedChange={setNotifyBySms}
              disabled={loading || !hasPhoneNumber}
            />
          </div>

          {/* Reminder time */}
          <div className="space-y-3">
            <Label htmlFor="reminderDaysBefore">When do you want reminders?</Label>
            <Select
              value={reminderDaysBefore.toString()}
              onValueChange={(value) => setReminderDaysBefore(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Same day</SelectItem>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="2">2 days before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="7">1 week before</SelectItem>
                <SelectItem value="14">2 weeks before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You will receive notifications {reminderDaysBefore === 0 ? "on the same day" : `${reminderDaysBefore} day${reminderDaysBefore > 1 ? "s" : ""} before`} scheduled events
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What do you want to be notified about */}
      <Card>
        <CardHeader>
          <CardTitle>What do you want to be notified about?</CardTitle>
          <CardDescription>
            Choose which event types you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meetings */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyMeetings">Meetings</Label>
                <p className="text-sm text-muted-foreground">
                  AMU/VO meetings, OHS meetings, management review
                </p>
              </div>
            </div>
            <Switch
              id="notifyMeetings"
              checked={notifyMeetings}
              onCheckedChange={setNotifyMeetings}
              disabled={loading}
            />
          </div>

          {/* Safety walks/Inspections */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyInspections">Safety Walks & Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Planned safety walks, EHS inspections, security patrols
                </p>
              </div>
            </div>
            <Switch
              id="notifyInspections"
              checked={notifyInspections}
              onCheckedChange={setNotifyInspections}
              disabled={loading}
            />
          </div>

          {/* Audits */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyAudits">Audits</Label>
                <p className="text-sm text-muted-foreground">
                  Internal audits, external audits, certification audits
                </p>
              </div>
            </div>
            <Switch
              id="notifyAudits"
              checked={notifyAudits}
              onCheckedChange={setNotifyAudits}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-red-600" />
              <div className="space-y-0.5">
                <Label htmlFor="notifyMeasures">Actions due</Label>
                <p className="text-sm text-muted-foreground">
                  Corrective actions, action plans, tasks you are responsible for
                </p>
              </div>
            </div>
            <Switch
              id="notifyMeasures"
              checked={notifyMeasures}
              onCheckedChange={setNotifyMeasures}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS info */}
      {notifyBySms && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900">
                  About SMS notifications
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>SMS is sent via Norwegian provider (Link Mobility)</li>
                  <li>You only receive the most important reminders via SMS</li>
                  <li>All notifications are also sent via email</li>
                  <li>You can disable SMS notifications at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/settings/test-notifications">
          <Button type="button" variant="outline">
            <TestTube className="mr-2 h-4 w-4" />
            Test email notifications
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}


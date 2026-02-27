"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WhistleblowStatus =
  | "RECEIVED"
  | "ACKNOWLEDGED"
  | "UNDER_INVESTIGATION"
  | "ACTION_TAKEN"
  | "RESOLVED"
  | "CLOSED"
  | "DISMISSED";

type WhistleblowSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type WhistleblowCategory = "HARASSMENT" | "DISCRIMINATION" | "WORK_ENVIRONMENT" | "SAFETY" | "CORRUPTION" | "ETHICS" | "LEGAL" | "OTHER";
type MessageSender = "REPORTER" | "HANDLER" | "SYSTEM";

interface TenantUser {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface WhistleblowCase {
  id: string;
  caseNumber: string;
  category: WhistleblowCategory;
  title: string;
  description: string;
  occurredAt?: string;
  location?: string;
  involvedPersons?: string;
  witnesses?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  status: WhistleblowStatus;
  severity: WhistleblowSeverity;
  handledBy?: string;
  assignedTo?: string;
  investigationNotes?: string;
  outcome?: string;
  closedReason?: string;
  receivedAt: string;
  acknowledgedAt?: string;
  investigatedAt?: string;
  closedAt?: string;
  messages: Message[];
}

interface Message {
  id: string;
  sender: MessageSender;
  senderUserId?: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

function getStatusBadge(status: WhistleblowStatus) {
  switch (status) {
    case "RECEIVED":
      return <Badge variant="secondary">Received</Badge>;
    case "ACKNOWLEDGED":
      return <Badge className="bg-blue-500 hover:bg-blue-500">Acknowledged</Badge>;
    case "UNDER_INVESTIGATION":
      return <Badge className="bg-purple-500 hover:bg-purple-500">Under Investigation</Badge>;
    case "ACTION_TAKEN":
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Action Taken</Badge>;
    case "RESOLVED":
      return <Badge className="bg-green-600 hover:bg-green-600">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="outline">Closed</Badge>;
    case "DISMISSED":
      return <Badge variant="destructive">Dismissed</Badge>;
  }
}

function getSeverityBadge(severity: WhistleblowSeverity) {
  switch (severity) {
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    case "MEDIUM":
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Medium</Badge>;
    case "HIGH":
      return <Badge className="bg-orange-500 hover:bg-orange-500">High</Badge>;
    case "CRITICAL":
      return <Badge variant="destructive">Critical</Badge>;
  }
}

function getCategoryLabel(category: WhistleblowCategory) {
  const labels: Record<WhistleblowCategory, string> = {
    HARASSMENT: "Harassment",
    DISCRIMINATION: "Discrimination",
    WORK_ENVIRONMENT: "Work Environment",
    SAFETY: "EHS/Safety",
    CORRUPTION: "Corruption",
    ETHICS: "Ethics",
    LEGAL: "Legal Violation",
    OTHER: "Other",
  };
  return labels[category];
}

export default function WhistleblowingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<WhistleblowCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isInternalMessage, setIsInternalMessage] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingSeverity, setUpdatingSeverity] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [params.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.tenantId) return;

      try {
        const response = await fetch(`/api/tenants/${session.user.tenantId}/users`);
        const data = await response.json();

        if (response.ok && data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session?.user?.tenantId]);

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/admin/whistleblowing/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not fetch case");
      }

      setCaseData(data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      router.push("/dashboard/whistleblowing");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/admin/whistleblowing/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          isInternal: isInternalMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not send message");
      }

      toast({
        title: "Message sent",
        description: isInternalMessage
          ? "Internal note added"
          : "Message sent to reporter",
      });

      setMessageText("");
      setIsInternalMessage(false);
      fetchCase();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const updateStatus = async (newStatus: WhistleblowStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/whistleblowing/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update status");
      }

      toast({
        title: "Status updated",
        description: "The case status has been updated",
      });

      fetchCase();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateSeverity = async (newSeverity: WhistleblowSeverity) => {
    setUpdatingSeverity(true);
    try {
      const response = await fetch(`/api/admin/whistleblowing/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ severity: newSeverity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update severity");
      }

      toast({
        title: "Severity updated",
        description: "The case severity has been updated",
      });

      fetchCase();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingSeverity(false);
    }
  };

  const updateAssignedTo = async (userId: string) => {
    try {
      const actualUserId = userId === "NONE" ? null : userId;
      
      const response = await fetch(`/api/admin/whistleblowing/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: actualUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not assign case");
      }

      toast({
        title: actualUserId ? "Case assigned" : "Assignment removed",
        description: actualUserId ? "The case has been assigned to the selected person" : "The case is no longer assigned to anyone",
      });

      fetchCase();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/whistleblowing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground">Case Number: {caseData.caseNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(caseData.severity)}
          {getStatusBadge(caseData.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Case Details */}
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {caseData.description}
                </p>
              </div>

              {(caseData.occurredAt || caseData.location) && (
                <>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    {caseData.occurredAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">When</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(caseData.occurredAt), "MMMM d, yyyy HH:mm", {
                              locale: enUS,
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {caseData.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Where</p>
                          <p className="text-sm text-muted-foreground">{caseData.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {caseData.involvedPersons && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Involved Persons</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {caseData.involvedPersons}
                    </p>
                  </div>
                </>
              )}

              {caseData.witnesses && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Witnesses</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {caseData.witnesses}
                    </p>
                  </div>
                </>
              )}

              {caseData.investigationNotes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Investigation Notes</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {caseData.investigationNotes}
                    </p>
                  </div>
                </>
              )}

              {caseData.outcome && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Outcome</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {caseData.outcome}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication
                </div>
              </CardTitle>
              <CardDescription>Messages with reporter and internal notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseData.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {caseData.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg p-4 ${
                        message.isInternal
                          ? "border-2 border-dashed border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950"
                          : message.sender === "REPORTER"
                          ? "bg-blue-50 dark:bg-blue-950"
                          : "bg-gray-50 dark:bg-gray-900"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {message.sender === "REPORTER"
                              ? "Reporter"
                              : message.sender === "HANDLER"
                              ? "Case Handler"
                              : "System"}
                          </Badge>
                          {message.isInternal && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-500">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "MMM d, yyyy HH:mm", {
                            locale: enUS,
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* New Reply */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">New Message</Label>
                  <Textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write a message to the reporter or an internal note..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isInternal"
                    checked={isInternalMessage}
                    onChange={(e) => setIsInternalMessage(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isInternal" className="font-normal">
                    Internal note (not visible to reporter)
                  </Label>
                </div>

                <Button onClick={sendMessage} disabled={sendingMessage || !messageText.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {sendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle>Reporter</CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.isAnonymous ? (
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Anonymous report</span>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {caseData.reporterName && (
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-muted-foreground">{caseData.reporterName}</p>
                    </div>
                  )}
                  {caseData.reporterEmail && (
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{caseData.reporterEmail}</p>
                    </div>
                  )}
                  {caseData.reporterPhone && (
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{caseData.reporterPhone}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Case Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={caseData.status}
                  onValueChange={(value: WhistleblowStatus) => updateStatus(value)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                    <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                    <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="DISMISSED">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={caseData.severity}
                  onValueChange={(value: WhistleblowSeverity) => updateSeverity(value)}
                  disabled={updatingSeverity}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  value={caseData.assignedTo || "NONE"}
                  onValueChange={(value) => updateAssignedTo(value)}
                  disabled={loadingUsers}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "None selected"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.user.id} value={u.user.id}>
                        {u.user.name || u.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-muted-foreground">{getCategoryLabel(caseData.category)}</p>
                </div>

                <div>
                  <p className="font-medium">Received</p>
                  <p className="text-muted-foreground">
                    {format(new Date(caseData.receivedAt), "MMM d, yyyy HH:mm", {
                      locale: enUS,
                    })}
                  </p>
                </div>

                {caseData.acknowledgedAt && (
                  <div>
                    <p className="font-medium">Acknowledged</p>
                    <p className="text-muted-foreground">
                      {format(new Date(caseData.acknowledgedAt), "MMM d, yyyy HH:mm", {
                        locale: enUS,
                      })}
                    </p>
                  </div>
                )}

                {caseData.investigatedAt && (
                  <div>
                    <p className="font-medium">Investigation Started</p>
                    <p className="text-muted-foreground">
                      {format(new Date(caseData.investigatedAt), "MMM d, yyyy HH:mm", {
                        locale: enUS,
                      })}
                    </p>
                  </div>
                )}

                {caseData.closedAt && (
                  <div>
                    <p className="font-medium">Closed</p>
                    <p className="text-muted-foreground">
                      {format(new Date(caseData.closedAt), "MMM d, yyyy HH:mm", {
                        locale: enUS,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


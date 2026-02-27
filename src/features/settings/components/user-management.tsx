"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2, Shield, User, AlertCircle } from "lucide-react";
import {
  inviteUser,
  updateUserRole,
  removeUserFromTenant,
  importUsersFromFile,
  activateUserInTenant,
  activateAllPendingUsers,
} from "@/server/actions/settings.actions";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Send, HelpCircle } from "lucide-react";

interface UserManagementProps {
  users: Array<{
    userId: string;
    role: string;
    invitationSentAt: Date | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      createdAt: Date;
    };
  }>;
  currentUserId: string;
  isAdmin: boolean;
  pricingTier: string | null;
  maxUsers: number;
}

export function UserManagement({ users, currentUserId, isAdmin, pricingTier, maxUsers }: UserManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const [activatingAll, setActivatingAll] = useState(false);

  const pendingActivationCount = users.filter(
    (u) => !u.invitationSentAt && u.userId !== currentUserId
  ).length;

  const currentUserCount = users.length;
  const remainingSlots = maxUsers - currentUserCount;
  const hasReachedLimit = currentUserCount >= maxUsers;

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check user limit BEFORE sending
    if (hasReachedLimit) {
      toast({
        variant: "destructive",
        title: "❌ User limit reached",
        description: `You have reached the maximum number of users (${maxUsers}) for your plan. Upgrade your subscription to add more.`,
      });
      return;
    }

    setInviteLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
    };

    const result = await inviteUser(data);

    if (result.success) {
      toast({
        title: "✅ User invited",
        description: `${data.email} has been added`,
        className: "bg-green-50 border-green-200",
      });
      setInviteOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Could not invite user",
      });
    }

    setInviteLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId);
    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      toast({
        title: "✅ Role updated",
        description: "User role has been changed",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Could not update role",
      });
    }

    setLoading(null);
  };

  const handleRemove = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the company?`)) {
      return;
    }

    setLoading(userId);
    const result = await removeUserFromTenant(userId);

    if (result.success) {
      toast({
        title: "🗑️ User removed",
        description: `${userName} has been removed from the company`,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Could not remove user",
      });
    }

    setLoading(null);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        variant: "destructive",
        title: "Select file",
        description: "Select a CSV or Excel file first.",
      });
      return;
    }
    if (hasReachedLimit) {
      toast({
        variant: "destructive",
        title: "User limit reached",
        description: `You have reached the maximum number of users (${maxUsers}). Upgrade to import more.`,
      });
      return;
    }
    setImportLoading(true);
    const formData = new FormData();
    formData.set("file", importFile);
    const result = await importUsersFromFile(formData);
    setImportLoading(false);
    setImportFile(null);

    if (!result.success) {
      const errMsg = "error" in result ? result.error : "Could not import";
      toast({
        variant: "destructive",
        title: "Import failed",
        description: errMsg,
      });
      return;
    }

    const msg =
      result.skipped > 0
        ? `${result.imported} imported, ${result.skipped} already members. Activate users under Actions when you want to send invitation.`
        : `${result.imported} users imported. Activate under Actions to send invitation.`;
    toast({
      title: "Import completed",
      description: msg,
      className: "bg-green-50 border-green-200",
    });
    router.refresh();
  };

  const handleActivate = async (userId: string) => {
    setActivatingUserId(userId);
    const result = await activateUserInTenant(userId);
    setActivatingUserId(null);
    if (result.success) {
      toast({
        title: "User activated",
        description: "Invitation with password has been sent via email.",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Could not activate",
        description: "error" in result ? result.error : "Could not activate user",
      });
    }
  };

  const handleActivateAll = async () => {
    if (pendingActivationCount === 0) return;
    if (
      !confirm(
        `Activate ${pendingActivationCount} user${pendingActivationCount === 1 ? "" : "s"}? Invitation with password will be sent to all via email.`
      )
    ) {
      return;
    }
    setActivatingAll(true);
    const result = await activateAllPendingUsers();
    setActivatingAll(false);
    if (result.success) {
      const msg =
        result.failed > 0
          ? `${result.activated} activated, ${result.failed} failed.${result.errors.length > 0 ? ` ${result.errors[0]}` : ""}`
          : `${result.activated} users activated – invitation sent via email.`;
      toast({
        title: "Activation completed",
        description: msg,
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Could not activate",
        description: "error" in result ? result.error : "Could not activate",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">⚙️ Admin</Badge>;
      case "LEDER":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">👔 Manager</Badge>;
      case "HMS":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">🦺 EHS Manager</Badge>;
      case "VERNEOMBUD":
        return <Badge className="bg-green-100 text-green-800 border-green-200">🛡️ Safety Representative</Badge>;
      case "BHT":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">🩺 OHS</Badge>;
      case "REVISOR":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">📋 Auditor</Badge>;
      case "ANSATT":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">👤 Employee</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Get plan name based on pricing tier
  const getPlanName = (tier: string | null) => {
    switch (tier) {
      case "MICRO":
        return "Small companies (1-20 employees)";
      case "SMALL":
        return "Medium companies (21-50 employees)";
      case "MEDIUM":
      case "LARGE":
        return "Large companies (51+ employees)";
      default:
        return "Standard plan";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Users ({currentUserCount} / {maxUsers === 999 ? "∞" : maxUsers})
            </CardTitle>
            <CardDescription>
              Manage users and their access • {getPlanName(pricingTier)}. Import without sending invitation; activate under Actions to send email.
            </CardDescription>
          </div>
        </div>

          {isAdmin && (
            <div className="flex flex-col items-end gap-3">
              {remainingSlots <= 3 && remainingSlots > 0 && maxUsers !== 999 && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{remainingSlots} slot{remainingSlots === 1 ? '' : 's'} remaining</span>
                </div>
              )}
              {maxUsers === 999 && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <span>Unlimited users ✓</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="max-w-[180px] text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    disabled={importLoading || (hasReachedLimit && maxUsers !== 999)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleImport}
                    disabled={importLoading || !importFile || (hasReachedLimit && maxUsers !== 999)}
                  >
                    <Upload className="mr-1.5 h-4 w-4" />
                    {importLoading ? "Importing..." : "Import"}
                  </Button>
                  <a
                    href="/api/users/import-example"
                    download="user-import-example.xlsx"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Download Excel example
                  </a>
                </div>

                <details className="group rounded-md border bg-muted/20 px-3 py-2 text-sm">
                  <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                    <HelpCircle className="h-4 w-4" />
                    How to import users?
                  </summary>
                  <div className="mt-3 space-y-2 border-t pt-3 text-muted-foreground">
                    <p><strong>1. Download example file</strong> – Click "Download Excel example" to get a ready-made template.</p>
                    <p><strong>2. Fill out the Excel file</strong> – Use columns <code className="rounded bg-muted px-1">email</code>, <code className="rounded bg-muted px-1">name</code> and <code className="rounded bg-muted px-1">role</code>. Valid roles: ANSATT, LEDER, HMS, VERNEOMBUD, BHT, REVISOR, ADMIN.</p>
                    <p><strong>3. Import the file</strong> – Select your file and click "Import". Users are added without invitation.</p>
                    <p><strong>4. Activate users</strong> – Click "Activate all" to send invitation with password to all imported users, or activate one by one under Actions.</p>
                    <p className="text-xs pt-1">Supports both .csv and .xlsx (Excel). Max 500 users per import, file size up to 2 MB.</p>
                  </div>
                </details>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button disabled={hasReachedLimit && maxUsers !== 999}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite user
                  </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite new user</DialogTitle>
                  <DialogDescription>
                    Add a new user to the company
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="First Last"
                      required
                      disabled={inviteLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@company.com"
                      required
                      disabled={inviteLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select name="role" required disabled={inviteLoading} defaultValue="ANSATT">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANSATT">👤 Employee</SelectItem>
                        <SelectItem value="LEDER">👔 Manager</SelectItem>
                        <SelectItem value="HMS">🦺 EHS Manager</SelectItem>
                        <SelectItem value="VERNEOMBUD">🛡️ Safety Representative</SelectItem>
                        <SelectItem value="BHT">🩺 Occupational Health Service</SelectItem>
                        <SelectItem value="REVISOR">📋 Auditor</SelectItem>
                        <SelectItem value="ADMIN">⚙️ Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInviteOpen(false)}
                      disabled={inviteLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inviteLoading}>
                      {inviteLoading ? "Inviting..." : "Invite user"}
                    </Button>
                  </div>
                </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          )}
      </CardHeader>
      <CardContent>
        {pendingActivationCount > 0 && isAdmin && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              {pendingActivationCount} user{pendingActivationCount === 1 ? "" : "s"} waiting for activation (invitation with password)
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={handleActivateAll}
              disabled={activatingAll}
            >
              <Send className="mr-2 h-4 w-4" />
              {activatingAll ? "Activating..." : "Activate all"}
            </Button>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No users found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Member since</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userTenant) => {
                  const isCurrentUser = userTenant.userId === currentUserId;

                  return (
                    <TableRow key={userTenant.userId}>
                      <TableCell className="font-medium">
                        {userTenant.user.name || "No name"}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{userTenant.user.email}</TableCell>
                      <TableCell>
                        {isAdmin && !isCurrentUser ? (
                          <Select
                            value={userTenant.role}
                            onValueChange={(value) =>
                              handleRoleChange(userTenant.userId, value)
                            }
                            disabled={loading === userTenant.userId}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ANSATT">👤 Employee</SelectItem>
                              <SelectItem value="LEDER">👔 Manager</SelectItem>
                              <SelectItem value="HMS">🦺 EHS Manager</SelectItem>
                              <SelectItem value="VERNEOMBUD">🛡️ Safety Representative</SelectItem>
                              <SelectItem value="BHT">🩺 Occupational Health Service</SelectItem>
                              <SelectItem value="REVISOR">📋 Auditor</SelectItem>
                              <SelectItem value="ADMIN">⚙️ Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getRoleBadge(userTenant.role)
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(userTenant.user.createdAt).toLocaleDateString("en-US")}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {!isCurrentUser && (
                            <div className="flex items-center justify-end gap-2">
                              {!userTenant.invitationSentAt && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleActivate(userTenant.userId)}
                                  disabled={activatingUserId === userTenant.userId || loading === userTenant.userId}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {activatingUserId === userTenant.userId ? "Activating..." : "Activate"}
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleRemove(
                                    userTenant.userId,
                                    userTenant.user.name || userTenant.user.email
                                  )
                                }
                                disabled={loading === userTenant.userId}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!isAdmin && (
          <Card className="bg-amber-50 border-amber-200 mt-4">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-800">
                ℹ️ Only administrators can manage users
              </p>
            </CardContent>
          </Card>
        )}

        {isAdmin && hasReachedLimit && (
          <Card className="bg-red-50 border-red-200 mt-4">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    User limit reached
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    You have reached the maximum number of users ({maxUsers}) for your subscription plan. 
                    Contact support to upgrade to a larger plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateUserProfile, updateUserPassword } from "@/server/actions/settings.actions";
import { useToast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";
import type { User as PrismaUser } from "@prisma/client";

interface UserProfileFormProps {
  user: PrismaUser;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingProfile(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string || undefined,
      email: formData.get("email") as string || undefined,
    };

    const result = await updateUserProfile(data);

    if (result.success) {
      toast({
        title: "✅ Profile updated",
        description: "Your changes have been saved",
        className: "bg-green-50 border-green-200",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Could not update profile",
      });
    }

    setLoadingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingPassword(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "New passwords do not match",
      });
      setLoadingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Password must be at least 8 characters",
      });
      setLoadingPassword(false);
      return;
    }

    const result = await updateUserPassword({ currentPassword, newPassword });

    if (result.success) {
      toast({
        title: "✅ Password changed",
        description: "Your password has been updated",
        className: "bg-green-50 border-green-200",
      });
      (e.target as HTMLFormElement).reset();
    } else {
      toast({
        variant: "destructive",
        title: "Feil",
        description: result.error || "Could not change password",
      });
    }

    setLoadingPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <form onSubmit={handleProfileSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                disabled={loadingProfile}
                defaultValue={user.name || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (login)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                required
                disabled={loadingProfile}
                defaultValue={user.email}
              />
              <p className="text-sm text-amber-600">
                ⚠️ Note: Email is used for login and is shared across all companies you belong to. Changing email will affect ALL your companies.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loadingProfile}>
                {loadingProfile ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Separator />

      {/* Password */}
      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change password
            </CardTitle>
            <CardDescription>
              Update your password for increased security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={loadingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                disabled={loadingPassword}
                minLength={8}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={loadingPassword}
                minLength={8}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loadingPassword}>
                {loadingPassword ? "Changing..." : "Change password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}


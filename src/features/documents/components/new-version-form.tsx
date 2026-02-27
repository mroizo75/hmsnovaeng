"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadNewVersion } from "@/server/actions/document.actions";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface NewVersionFormProps {
  documentId: string;
  currentVersion: string;
  userId: string;
}

export function NewVersionForm({ documentId, currentVersion, userId }: NewVersionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("documentId", documentId);
    formData.set("uploadedBy", userId);

    try {
      const result = await uploadNewVersion(formData);

      if (result.success) {
        toast({
          title: "✅ New version uploaded",
          description: "The document has been updated with a new version",
          className: "bg-green-50 border-green-200",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: result.error || "Could not upload new version",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload new version
        </CardTitle>
        <CardDescription>
          Current version: {currentVersion} — The previous version will be archived
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="version">New version number</Label>
            <Input
              id="version"
              name="version"
              placeholder="E.g. v2.0"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeNote">Description of changes</Label>
            <Textarea
              id="changeNote"
              name="changeNote"
              placeholder="What has been changed in this version?"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, Word, Excel, PowerPoint, TXT, CSV
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">⚠️ Note</p>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>The previous version will be archived</li>
              <li>The new version will need to be re-approved</li>
              <li>Version history is retained</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload new version"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

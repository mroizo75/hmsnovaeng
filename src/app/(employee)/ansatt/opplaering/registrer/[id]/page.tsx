"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, GraduationCap, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createTraining } from "@/server/actions/training.actions";
import { useToast } from "@/hooks/use-toast";

export default function RegistrerOpplaeringPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [completedAt, setCompletedAt] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [provider, setProvider] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTraining(params.id as string);
    }
  }, [params.id]);

  const fetchTraining = async (id: string) => {
    try {
      const response = await fetch(`/api/training/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTraining(data);
        setProvider(data.provider || "");
      }
    } catch (error) {
      console.error("Error fetching training:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedKey(null); // Reset uploaded key if new file is selected
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/training/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { key } = await response.json();
      setUploadedKey(key);

      toast({
        title: "✅ File uploaded",
        description: "The proof has been uploaded",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast({
        title: "Not signed in",
        description: "You must be signed in to register training",
        variant: "destructive",
      });
      return;
    }

    if (!completedAt) {
      toast({
        title: "Missing date",
        description: "Please fill in when the course was completed",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedKey) {
      toast({
        title: "Missing proof",
        description: "Please upload proof/diploma before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTraining({
        userId: session.user.id,
        courseKey: training.courseKey || `course-${Date.now()}`,
        title: training.title,
        provider: provider || training.provider,
        description: training.description,
        completedAt: new Date(completedAt).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        proofDocKey: uploadedKey,
        isRequired: training.isRequired,
      });

      if (result.success) {
        toast({
          title: "✅ Training registered",
          description: "The training has been submitted for approval by your manager",
        });
        router.push("/ansatt/opplaering");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Training not found</h1>
        <Button asChild>
          <Link href="/ansatt/opplaering">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/ansatt/opplaering">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Register Training</h1>
            <p className="text-muted-foreground">{training.title}</p>
          </div>
        </div>
        {training.isRequired && (
          <Badge variant="destructive" className="mt-2">
            Required course
          </Badge>
        )}
      </div>

      {/* Info */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Important:</strong> Upload proof (certificate, diploma, signed participant list)
            to document that you have completed the training. Your manager will review and approve the registration.
          </p>
        </CardContent>
      </Card>

      {/* Registration form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Fill in information about completed training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Course Provider / Organizer</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="E.g. American Red Cross, OSHA, Internal"
                required
              />
            </div>

            {/* Completion date */}
            <div className="space-y-2">
              <Label htmlFor="completedAt">
                Completion date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                id="completedAt"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                required
              />
            </div>

            {/* Validity */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid until (if applicable)</Label>
              <Input
                type="date"
                id="validUntil"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Some courses have an expiration date and must be renewed (e.g. first aid courses)
              </p>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                Upload proof (PDF or image) <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-3">
                <Input
                  type="file"
                  id="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                
                {file && !uploadedKey && (
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload file
                      </>
                    )}
                  </Button>
                )}

                {uploadedKey && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>File uploaded and ready for submission</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload certificate, diploma, or other documentation. Max 10MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            disabled={submitting || !uploadedKey}
            className="flex-1 sm:flex-none"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for approval
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/ansatt/opplaering">
              Cancel
            </Link>
          </Button>
        </div>
      </form>

      {/* Help */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">❓ Need help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>What happens after submission?</strong>
          </p>
          <p>
            Your manager will receive a notification and review your documentation.
            They will approve the training if everything is in order, or contact you if anything is missing.
          </p>
          <p className="pt-2">
            <strong>Having trouble uploading?</strong>
          </p>
          <p>
            Contact your manager or EHS coordinator if you have technical problems or questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

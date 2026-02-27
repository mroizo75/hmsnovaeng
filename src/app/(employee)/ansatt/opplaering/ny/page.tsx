"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NyKompetansePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "",
    completedAt: "",
    certificateFile: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max 10MB.");
        return;
      }
      setFormData({ ...formData, certificateFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.completedAt) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // If there is a file, upload it first
      let proofDocKey = null;
      if (formData.certificateFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.certificateFile);
        uploadFormData.append("folder", "training");

        const uploadRes = await fetch("/api/training/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Error uploading file");
        }

        const uploadData = await uploadRes.json();
        proofDocKey = uploadData.fileKey;
      }

      // Create training
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        provider: formData.provider || undefined,
        completedAt: new Date(formData.completedAt).toISOString(),
        proofDocKey: proofDocKey || undefined,
        isRequired: false,
        effectiveness: null, // Awaiting approval
      };

      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error during registration");
      }

      toast.success("Competence registered! Awaiting approval from manager.");
      router.push("/ansatt/opplaering");
      router.refresh();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/ansatt/opplaering">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to my training
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue-600" />
          Add own competence
        </h1>
        <p className="text-muted-foreground">
          Register courses, certificates, or other competence you have achieved
        </p>
      </div>

      {/* Info */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Important:</strong> The competence must be approved by your manager before it
            becomes active in the EHS system. You will receive a confirmation when it is approved.
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Register competence</CardTitle>
          <CardDescription>
            Fill in information about the course or certificate you have completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Course title / Certificate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                required
                placeholder="E.g. First Aid, EHS Course, Safety Representative, etc."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what the course covered..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Course provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Course Provider / Organizer</Label>
              <Input
                id="provider"
                placeholder="E.g. American Red Cross, OSHA, Internal"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            {/* Completion date */}
            <div className="space-y-2">
              <Label htmlFor="completedAt">
                Completion date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completedAt"
                type="date"
                required
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
              />
            </div>

            {/* Upload certificate */}
            <div className="space-y-2">
              <Label htmlFor="certificate">Upload proof (certificate, diploma, etc.)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="certificate" className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:underline">
                    {formData.certificateFile
                      ? formData.certificateFile.name
                      : "Click to upload file"}
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, or PNG (max 10MB)
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Register competence
                  </>
                )}
              </Button>
              <Link href="/ansatt/opplaering" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📚 What can be registered?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-green-900">
          <p>✅ EHS-related courses (first aid, fire safety, etc.)</p>
          <p>✅ Professional certifications and competence certificates</p>
          <p>✅ Safety courses and training</p>
          <p>✅ Safety representative training</p>
          <p>✅ Other relevant competence for your position</p>
        </CardContent>
      </Card>
    </div>
  );
}

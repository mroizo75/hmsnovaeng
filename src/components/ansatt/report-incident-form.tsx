"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, X } from "lucide-react";
import Image from "next/image";

export function ReportIncidentForm({
  tenantId,
  reportedBy,
  successRedirectPath = "/ansatt/avvik/takk",
}: {
  tenantId: string;
  reportedBy: string;
  successRedirectPath?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageFiles = [...imageFiles, ...files].slice(0, 5); // Max 5 images
      setImageFiles(newImageFiles);

      // Generate previews
      const previews = newImageFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  }

  function removeImage(index: number) {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Add images to FormData
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Add metadata
    formData.append("tenantId", tenantId);
    formData.append("reportedBy", reportedBy);
    formData.append("date", new Date().toISOString());

    try {
      const response = await fetch("/api/incidents/report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Could not submit report");
      }

      toast({
        title: "✅ Incident reported",
        description: "Thank you for your report! The EHS coordinator has been notified.",
      });

      router.push(successRedirectPath);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Could not submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-base">
          Type of incident *
        </Label>
        <Select name="type" required>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AVVIK">⚠️ Deviation</SelectItem>
            <SelectItem value="NESTEN">🟡 Near miss</SelectItem>
            <SelectItem value="SKADE">🔴 Injury/Accident</SelectItem>
            <SelectItem value="MILJO">🌍 Environmental incident</SelectItem>
            <SelectItem value="KVALITET">📋 Quality deviation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label htmlFor="severity" className="text-base">
          How serious? *
        </Label>
        <Select name="severity" required>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">🔴 Critical (5) - Immediate danger</SelectItem>
            <SelectItem value="4">🟠 High (4) - Serious</SelectItem>
            <SelectItem value="3">🟡 Medium (3)</SelectItem>
            <SelectItem value="2">🟢 Low (2)</SelectItem>
            <SelectItem value="1">⚪ Very low (1)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Brief description *
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="E.g.: Wet floor without warning sign"
          required
          className="h-12 text-base"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base">
          Where did it happen? *
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="E.g.: Workshop, Building A"
          required
          className="h-12 text-base"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">
          Detailed description *
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe what happened, who was involved, what was the cause..."
          required
          rows={6}
          className="text-base resize-none"
        />
        <p className="text-xs text-muted-foreground">
          The more details, the better we can prevent similar incidents
        </p>
      </div>

      {/* Image upload */}
      <div className="space-y-3">
        <Label htmlFor="images" className="text-base">
          📸 Photos (optional, max 5)
        </Label>
        <div className="space-y-3">
          {/* Upload button */}
          <div className="relative">
            <Input
              id="images"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageChange}
              disabled={imageFiles.length >= 5}
              className="sr-only"
            />
            <Label
              htmlFor="images"
              className={`
                flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-lg cursor-pointer
                transition-colors hover:bg-gray-50
                ${imageFiles.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <Camera className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {imageFiles.length >= 5 ? "Max 5 photos" : "Take photo or choose from album"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {imageFiles.length > 0 ? `${imageFiles.length}/5 photos added` : "Optional"}
                </p>
              </div>
            </Label>
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Photos help us better understand the situation and can be used to prevent similar incidents
        </p>
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full h-14 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "📤 Submit report"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          size="lg"
          className="w-full h-12"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

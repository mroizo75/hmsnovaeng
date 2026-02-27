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
import {
  Loader2,
  Camera,
  X,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState("");

  const isInjury = incidentType === "SKADE";
  const totalSteps = isInjury ? 3 : 2;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const combined = [...imageFiles, ...files].slice(0, 5);
      setImageFiles(combined);
      setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    }
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    imageFiles.forEach((file) => formData.append("images", file));
    formData.append("tenantId", tenantId);
    formData.append("reportedBy", reportedBy);
    formData.append("date", new Date().toISOString());

    try {
      const response = await fetch("/api/incidents/report", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Could not submit report");
      toast({
        title: "Incident reported",
        description: "The EHS coordinator has been notified.",
      });
      router.push(successRedirectPath);
    } catch {
      toast({
        title: "Error",
        description: "Could not submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-all flex-shrink-0",
                  done
                    ? "bg-primary border-primary text-white"
                    : active
                    ? "border-primary text-primary bg-primary/10"
                    : "border-gray-300 text-gray-400 bg-white"
                )}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  active ? "text-primary" : "text-gray-400"
                )}
              >
                {n === 1 ? "Basics & Photo" : n === 2 ? (isInjury ? "OSHA Details" : "Description") : "Description"}
              </span>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    done ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <form id="incident-form" onSubmit={handleSubmit} noValidate>
        {/* ───────── STEP 1: Basic info + photo ───────── */}
        <div className={cn("space-y-4", step !== 1 && "hidden")}>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Incident Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" onValueChange={(v) => setIncidentType(v)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SKADE">🔴 Injury / Accident</SelectItem>
                <SelectItem value="NESTEN">🟡 Near Miss</SelectItem>
                <SelectItem value="AVVIK">⚠️ Safety Deviation</SelectItem>
                <SelectItem value="MILJO">🌍 Environmental Incident</SelectItem>
                <SelectItem value="KVALITET">📋 Quality Deviation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Severity Level <span className="text-red-500">*</span>
            </Label>
            <Select name="severity">
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select severity…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">🔴 Critical (5) — Imminent danger</SelectItem>
                <SelectItem value="4">🟠 High (4) — Serious harm</SelectItem>
                <SelectItem value="3">🟡 Medium (3) — Moderate risk</SelectItem>
                <SelectItem value="2">🟢 Low (2) — Minor risk</SelectItem>
                <SelectItem value="1">⚪ Very Low (1) — Minimal risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Brief Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="E.g.: Wet floor without warning sign"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="E.g.: Workshop – Building A"
              className="h-12 text-base"
            />
          </div>

          {/* ── PHOTO UPLOAD (always on step 1) ── */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-muted-foreground" />
              Photos
              <span className="text-muted-foreground font-normal text-xs">(optional, max 5)</span>
            </Label>

            <input
              id="incident-images"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageChange}
              disabled={imageFiles.length >= 5}
              className="sr-only"
            />
            <label
              htmlFor="incident-images"
              className={cn(
                "flex items-center justify-center gap-3 h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                imageFiles.length >= 5
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : "border-gray-300 hover:border-primary hover:bg-primary/5 active:bg-primary/10"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {imageFiles.length >= 5
                    ? "Maximum 5 photos reached"
                    : "Take photo or choose from gallery"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {imageFiles.length > 0
                    ? `${imageFiles.length}/5 photo${imageFiles.length > 1 ? "s" : ""} added`
                    : "Tap to open camera"}
                </p>
              </div>
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            className="w-full h-12 text-base mt-2"
            onClick={() => {
              const form = document.getElementById("incident-form") as HTMLFormElement;
              const title = (form?.querySelector('[name="title"]') as HTMLInputElement)?.value;
              const location = (form?.querySelector('[name="location"]') as HTMLInputElement)?.value;
              if (!incidentType || !title?.trim() || !location?.trim()) {
                toast({
                  title: "Please fill in all required fields",
                  variant: "destructive",
                });
                return;
              }
              setStep(2);
            }}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* ───────── STEP 2: OSHA details (injury) OR description (other) ───────── */}
        {isInjury ? (
          <div className={cn("space-y-4", step !== 2 && "hidden")}>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-800">OSHA 300/301 Required (29 CFR 1904)</p>
                <p className="text-xs text-blue-600 mt-0.5">Complete these fields to create an OSHA-compliant injury record.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Body Part Affected</Label>
              <Select name="bodyPartAffected">
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select body part…" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Head / Skull", "Face", "Eye(s)", "Neck",
                    "Shoulder(s)", "Arm(s)", "Elbow(s)", "Wrist(s)",
                    "Hand(s) / Fingers", "Back / Spine", "Chest / Torso",
                    "Hip(s)", "Leg(s)", "Knee(s)", "Ankle(s)",
                    "Foot / Feet / Toes", "Multiple body parts", "Other",
                  ].map((part) => (
                    <SelectItem key={part} value={part}>{part}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nature of Injury / Illness</Label>
              <Select name="injuryType">
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select injury type…" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Amputation", "Burn / Scald", "Contusion / Bruise",
                    "Cut / Laceration", "Fracture", "Hearing Loss",
                    "Puncture", "Sprain / Strain", "Chemical Exposure",
                    "Heat Illness", "Respiratory Condition", "Other",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Medical Treatment Level</Label>
              <Select name="medicalAttentionRequired">
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select treatment level…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">First Aid Only (non-recordable)</SelectItem>
                  <SelectItem value="true">Medical Treatment Beyond First Aid (OSHA recordable)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnessName" className="text-sm font-semibold">
                Witness Name <span className="text-muted-foreground font-normal text-xs">(if any)</span>
              </Label>
              <Input
                id="witnessName"
                name="witnessName"
                placeholder="Full name of witness"
                className="h-12 text-base"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button type="button" className="flex-1 h-12" onClick={() => setStep(3)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Non-injury: step 2 = description only */
          <div className={cn("space-y-4", step !== 2 && "hidden")}>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what happened, who was involved, and the likely cause…"
                rows={6}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                More detail = better prevention. All reports are confidential.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                form="incident-form"
                disabled={isSubmitting}
                className="flex-1 h-12 text-base"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Report"}
              </Button>
            </div>
          </div>
        )}

        {/* ───────── STEP 3: Description (injury only) ───────── */}
        {isInjury && (
          <div className={cn("space-y-4", step !== 3 && "hidden")}>
            <div className="space-y-2">
              <Label htmlFor="injury-description" className="text-sm font-semibold">
                Incident Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="injury-description"
                name="description"
                placeholder="What was the employee doing at the time of injury? What object or substance caused the injury? Describe in detail…"
                rows={6}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Required for OSHA 301 Incident Report — be specific.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                form="incident-form"
                disabled={isSubmitting}
                className="flex-1 h-12 text-base"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit OSHA Report"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

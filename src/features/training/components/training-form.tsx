"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { createTraining } from "@/server/actions/training.actions";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { CourseTemplate } from "@prisma/client";

interface TrainingFormProps {
  tenantId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
  courseTemplates: CourseTemplate[];
  trigger?: React.ReactNode;
}

export function TrainingForm({ tenantId, users, courseTemplates, trigger }: TrainingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId,
      userId: formData.get("userId") as string,
      courseKey: formData.get("courseKey") as string,
      title: formData.get("title") as string,
      provider: formData.get("provider") as string,
      completedAt: formData.get("completedAt") as string || undefined,
      validUntil: formData.get("validUntil") as string || undefined,
      isRequired: formData.get("isRequired") === "true",
    };

    try {
      const result = await createTraining(data);

      if (result.success) {
        toast({
          title: "✅ Training registered",
          description: "The competence has been documented in the system",
          className: "bg-green-50 border-green-200",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not register training",
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

  const selectedCourseInfo = courseTemplates.find(c => c.courseKey === selectedCourse);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register training
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register training</DialogTitle>
          <DialogDescription>
            ISO 9001: Document competence based on education, training or experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userId">Employee *</Label>
              <Select name="userId" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseKey">Course *</Label>
              <Select
                name="courseKey"
                required
                disabled={loading}
                value={selectedCourse}
                onValueChange={(value) => {
                  setSelectedCourse(value);
                  const course = courseTemplates.find(c => c.courseKey === value);
                  if (course) {
                    const form = document.querySelector("form") as HTMLFormElement;
                    const titleInput = form?.querySelector('[name="title"]') as HTMLInputElement;
                    if (titleInput) titleInput.value = course.title;
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courseTemplates.map((course) => (
                    <SelectItem key={course.id} value={course.courseKey}>
                      {course.title}
                      {course.isGlobal && " (Standard HSE)"}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom course</SelectItem>
                </SelectContent>
              </Select>
              {selectedCourseInfo && (
                <p className="text-xs text-muted-foreground">{selectedCourseInfo.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Course title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="E.g. First Aid Basic Course"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Course provider *</Label>
            <Input
              id="provider"
              name="provider"
              placeholder="E.g. Red Cross, OHS, Internal"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="completedAt">Completion date</Label>
              <Input
                id="completedAt"
                name="completedAt"
                type="date"
                disabled={loading}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                disabled={loading}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if the course does not expire
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofDoc">Certificate / proof of completion</Label>
            <Input
              id="proofDoc"
              name="proofDoc"
              type="file"
              disabled={loading}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload certificate, course diploma or other documented proof
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRequired"
              name="isRequired"
              value="true"
              disabled={loading}
              className="h-4 w-4"
            />
            <Label htmlFor="isRequired" className="font-normal">
              Mandatory course for all employees
            </Label>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">📋 ISO 9001 - 7.2 Competence</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Document competence based on training</li>
                <li>Upload certificate as proof</li>
                <li>Set expiry date for courses that must be renewed</li>
                <li>System alerts when courses are due for renewal</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register training"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Upload, Loader2, AlertCircle } from "lucide-react";

export type UploadedFile = {
  key: string;
  fileName: string;
  url?: string;
};

type Props = {
  folder: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onUpload: (file: UploadedFile) => void;
  onRemove?: (key: string) => void;
  existingFiles?: UploadedFile[];
  disabled?: boolean;
};

export function FileAttachment({
  folder,
  label = "Attach File",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSizeMB = 25,
  onUpload,
  onRemove,
  existingFiles = [],
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      onUpload({ key: data.key, fileName: file.name });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Paperclip className="h-3 w-3 mr-1" />
          )}
          {uploading ? "Uploading…" : label}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {existingFiles.length > 0 && (
        <div className="space-y-1">
          {existingFiles.map((f) => (
            <div key={f.key} className="flex items-center gap-2 text-sm border rounded px-2 py-1.5 bg-muted/30">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-xs">{f.fileName}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(f.key)}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

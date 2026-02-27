"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { HAZARD_PICTOGRAMS } from "@/lib/pictograms";

interface HazardPictogramSelectorProps {
  defaultValue?: string;
  onChange?: (selected: string[]) => void;
}

export function HazardPictogramSelector({ defaultValue, onChange }: HazardPictogramSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (defaultValue) {
      try {
        const parsed = JSON.parse(defaultValue);
        setSelected(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSelected([]);
      }
    }
  }, [defaultValue]);

  const togglePictogram = (file: string) => {
    const newSelected = selected.includes(file)
      ? selected.filter((f) => f !== file)
      : [...selected, file];
    
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className="space-y-4">
      <Label>Hazard Pictograms (GHS/CLP)</Label>
      <input type="hidden" name="warningPictograms" value={JSON.stringify(selected)} />
      
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {HAZARD_PICTOGRAMS.map((pictogram) => (
          <button
            key={pictogram.id}
            type="button"
            onClick={() => togglePictogram(pictogram.file)}
            className={cn(
              "relative aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105",
              selected.includes(pictogram.file)
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "border-gray-200 hover:border-gray-300"
            )}
            title={pictogram.name}
          >
            <Image
              src={`/faremerker/${pictogram.file}`}
              alt={pictogram.name}
              fill
              className="object-contain p-2"
            />
            {selected.includes(pictogram.file) && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Selected: {selected.length} hazard pictogram{selected.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}


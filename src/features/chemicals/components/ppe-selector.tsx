"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PPE_PICTOGRAMS } from "@/lib/pictograms";

interface PPESelectorProps {
  defaultValue?: string;
  onChange?: (selected: string[]) => void;
}

export function PPESelector({ defaultValue, onChange }: PPESelectorProps) {
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

  const togglePPE = (file: string) => {
    const newSelected = selected.includes(file)
      ? selected.filter((f) => f !== file)
      : [...selected, file];
    
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className="space-y-4">
      <Label>Påkrevd personlig verneutstyr (PPE)</Label>
      <input type="hidden" name="requiredPPE" value={JSON.stringify(selected)} />
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {PPE_PICTOGRAMS.map((ppe) => (
            <button
              key={ppe.id}
              type="button"
              onClick={() => togglePPE(ppe.file)}
              className={cn(
                "relative aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105",
                selected.includes(ppe.file)
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              )}
              title={ppe.name}
            >
              <Image
                src={`/ppe/${ppe.file}`}
                alt={ppe.name}
                fill
                className="object-contain p-1"
              />
              {selected.includes(ppe.file) && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      {selected.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Valgte: {selected.length} PPE-krav
        </div>
      )}
    </div>
  );
}


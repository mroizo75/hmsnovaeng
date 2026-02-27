"use client";

import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, AlignLeft, Hash, Calendar, Clock, CheckSquare, Circle, ChevronDown, FileUp, PenTool, BarChart3, Heading2 } from "lucide-react";

const FIELD_TYPES = [
  { id: "TEXT", label: "Short text", icon: Type, description: "Single text line" },
  { id: "TEXTAREA", label: "Long text", icon: AlignLeft, description: "Multi-line text area" },
  { id: "NUMBER", label: "Number", icon: Hash, description: "Numeric value" },
  { id: "DATE", label: "Date", icon: Calendar, description: "Date picker" },
  { id: "DATETIME", label: "Date and time", icon: Clock, description: "Date with time" },
  { id: "CHECKBOX", label: "Checkbox", icon: CheckSquare, description: "Yes/No checkbox" },
  { id: "RADIO", label: "Radio buttons", icon: Circle, description: "Select one option" },
  { id: "SELECT", label: "Dropdown", icon: ChevronDown, description: "Dropdown menu" },
  { id: "LIKERT_SCALE", label: "Likert scale", icon: BarChart3, description: "1-5 scale (Agree/Disagree)" },
  { id: "FILE", label: "File upload", icon: FileUp, description: "Upload file/image" },
  { id: "SIGNATURE", label: "Signature", icon: PenTool, description: "Digital signature" },
  { id: "SECTION_HEADER", label: "Section header", icon: Heading2, description: "Header for grouping" },
];

function DraggableField({ field }: { field: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${field.id}`,
  });

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 rounded-lg border-2 border-dashed bg-white cursor-grab active:cursor-grabbing
        hover:border-primary hover:bg-primary/5 transition-all
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded flex items-center justify-center bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{field.label}</p>
          <p className="text-xs text-muted-foreground truncate">{field.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FieldLibrary() {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Field library</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag fields to the form
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {FIELD_TYPES.map((field) => (
          <DraggableField key={field.id} field={field} />
        ))}
      </CardContent>
    </Card>
  );
}


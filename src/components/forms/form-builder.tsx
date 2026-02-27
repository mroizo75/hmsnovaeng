"use client";

import { useState } from "react";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Eye, 
  Settings,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Circle,
  ChevronDown,
  FileUp,
  PenTool,
  AlignLeft,
  X
} from "lucide-react";
import { FieldLibrary } from "./field-library";
import { FormCanvas } from "./form-canvas";
import { PropertiesPanel } from "./properties-panel";
import { AccessControl } from "./access-control";

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  order: number;
  options?: string[];
  validation?: any;
}

interface FormBuilderProps {
  tenantId: string;
    initialData?: {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    numberPrefix?: string;
    requiresSignature?: boolean;
    requiresApproval?: boolean;
    allowAnonymousResponses?: boolean;
    accessType?: string;
    allowedRoles?: string[];
    allowedUsers?: string[];
    fields?: FormField[];
  };
}

export function FormBuilder({ tenantId, initialData }: FormBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form metadata
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "CUSTOM");
  const [numberPrefix, setNumberPrefix] = useState(initialData?.numberPrefix || "");
  const [requiresSignature, setRequiresSignature] = useState(initialData?.requiresSignature ?? true);
  const [requiresApproval, setRequiresApproval] = useState(initialData?.requiresApproval ?? false);
  const [allowAnonymousResponses, setAllowAnonymousResponses] = useState(
    initialData?.allowAnonymousResponses ?? initialData?.category === "WELLBEING"
  );

  // Access control
  const [accessType, setAccessType] = useState(initialData?.accessType || "ALL");
  const [allowedRoles, setAllowedRoles] = useState<string[]>(initialData?.allowedRoles || []);
  const [allowedUsers, setAllowedUsers] = useState<string[]>(initialData?.allowedUsers || []);

  // Form fields
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"builder" | "settings" | "access">("builder");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    // If dropping a new field from library
    if (active.id.startsWith("library-")) {
      const fieldType = active.id.replace("library-", "");
      addField(fieldType);
      return;
    }

    // If reordering existing fields
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  }

  function addField(type: string) {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: getDefaultLabel(type),
      placeholder: "",
      helpText: "",
      isRequired: false,
      order: fields.length,
      options: type === "SELECT" || type === "RADIO" || type === "CHECKBOX" ? ["Alternativ 1", "Alternativ 2"] : undefined,
    };

    setFields([...fields, newField]);
    setSelectedField(newField.id);
  }

  function getDefaultLabel(type: string): string {
    const labels: Record<string, string> = {
      TEXT: "Short text",
      TEXTAREA: "Long text",
      NUMBER: "Number",
      DATE: "Date",
      DATETIME: "Date and time",
      CHECKBOX: "Checkbox",
      RADIO: "Multiple choice",
      SELECT: "Dropdown",
      FILE: "File",
      SIGNATURE: "Signature",
      LIKERT_SCALE: "Rating question",
      SECTION_HEADER: "Section header",
    };
    return labels[type] || "New field";
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  }

  function deleteField(fieldId: string) {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  }

  async function saveForm() {
    if (!title.trim()) {
      toast({
        title: "❌ Error",
        description: "The form must have a title",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "❌ Error",
        description: "The form must have at least one field",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/forms", {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          tenantId,
          title,
          description,
          category,
          numberPrefix: numberPrefix.trim() || null,
          requiresSignature,
          requiresApproval,
          allowAnonymousResponses: category === "WELLBEING" ? allowAnonymousResponses : false,
          accessType,
          allowedRoles: accessType === "ROLES" || accessType === "ROLES_AND_USERS" ? allowedRoles : null,
          allowedUsers: accessType === "USERS" || accessType === "ROLES_AND_USERS" ? allowedUsers : null,
          fields,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save form");
      }

      const data = await response.json();

      toast({
        title: "✅ Saved",
        description: "The form has been saved",
      });

      router.push("/dashboard/forms");
      router.refresh();
    } catch (error) {
      toast({
        title: "❌ Feil",
        description: "Could not save form",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Basic information */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Form name *
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g.: EHS Morning Meeting, Safety Round, Inspection..."
                className="text-lg h-12"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Description (optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of the form..."
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setActiveTab("settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={saveForm} disabled={isSaving} size="lg">
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save form
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2 font-medium ${
            activeTab === "builder"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Builder
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 font-medium ${
            activeTab === "settings"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab("access")}
          className={`px-4 py-2 font-medium ${
            activeTab === "access"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Access control
        </button>
      </div>

      {/* Content */}
      {activeTab === "builder" && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Field Library */}
            <div className="col-span-3">
              <FieldLibrary />
            </div>

            {/* Center: Canvas */}
            <div className="col-span-6">
              <FormCanvas
                fields={fields}
                selectedField={selectedField}
                onSelectField={setSelectedField}
                onDeleteField={deleteField}
              />
            </div>

            {/* Right: Properties */}
            <div className="col-span-3">
              <PropertiesPanel
                selectedField={fields.find((f) => f.id === selectedField) || null}
                onUpdateField={updateField}
              />
            </div>
          </div>
        </DndContext>
      )}

      {activeTab === "settings" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="numberPrefix">Reference number prefix</Label>
              <Input
                id="numberPrefix"
                value={numberPrefix}
                onChange={(e) => setNumberPrefix(e.target.value)}
                placeholder="E.g. INC for Incident Report"
                className="mt-2 max-w-xs"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Submitted forms get an auto-generated number (e.g. INC-2025-001). Empty = FRM.
              </p>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                  <SelectItem value="MEETING">Meeting minutes</SelectItem>
                  <SelectItem value="INSPECTION">🔍 Inspection / Safety round</SelectItem>
                  <SelectItem value="INCIDENT">Incident report</SelectItem>
                  <SelectItem value="RISK">Risk assessment</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="CHECKLIST">Checklist</SelectItem>
                  <SelectItem value="TIMESHEET">Timesheet (payroll)</SelectItem>
                  <SelectItem value="WELLBEING">Psychosocial pulse (ISO 45003)</SelectItem>
                  <SelectItem value="BCM">Business continuity (ISO 22301)</SelectItem>
                  <SelectItem value="COMPLAINT">Customer complaint (ISO 10002)</SelectItem>
                </SelectContent>
              </Select>
              {category === "INSPECTION" && (
                <p className="text-sm text-muted-foreground mt-2">
                  💡 This form can be used as a template for safety rounds. When creating a safety round, you can select this form as a template.
                </p>
              )}
            </div>

            {category === "WELLBEING" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowAnonymousResponses"
                  checked={allowAnonymousResponses}
                  onCheckedChange={(checked) => setAllowAnonymousResponses(!!checked)}
                />
                <div>
                  <Label htmlFor="allowAnonymousResponses">Anonymous responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Responses are stored anonymously. Recommended for psychosocial assessments (ISO 45003, OSHA Act).
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresSignature"
                checked={requiresSignature}
                onCheckedChange={(checked) => setRequiresSignature(!!checked)}
              />
              <Label htmlFor="requiresSignature">Requires digital signature</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresApproval"
                checked={requiresApproval}
                onCheckedChange={(checked) => setRequiresApproval(!!checked)}
              />
              <Label htmlFor="requiresApproval">Requires approval from manager</Label>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "access" && (
        <AccessControl
          tenantId={tenantId}
          accessType={accessType}
          allowedRoles={allowedRoles}
          allowedUsers={allowedUsers}
          onAccessTypeChange={setAccessType}
          onAllowedRolesChange={setAllowedRoles}
          onAllowedUsersChange={setAllowedUsers}
        />
      )}
    </div>
  );
}


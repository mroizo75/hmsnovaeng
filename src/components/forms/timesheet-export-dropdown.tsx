"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { getYear, getMonth, getWeek } from "date-fns";
import { nb } from "date-fns/locale";

interface TimesheetExportDropdownProps {
  formId: string;
  formTitle: string;
}

export function TimesheetExportDropdown({ formId, formTitle }: TimesheetExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonth = getMonth(now) + 1;
  const currentWeek = getWeek(now, { weekStartsOn: 1, locale: nb });

  const buildUrl = (params: Record<string, string>) => {
    const search = new URLSearchParams(params).toString();
    return `/api/forms/${formId}/submissions/export${search ? `?${search}` : ""}`;
  };

  const handleDownload = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle.replace(/[^a-z0-9]/gi, "_")}_responses.xlsx`;
    a.click();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select period</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleDownload(buildUrl({}));
          }}
        >
          All submissions
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleDownload(
              buildUrl({ period: "week", year: String(currentYear), week: String(currentWeek) })
            );
          }}
        >
          This week (week {currentWeek})
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleDownload(
              buildUrl({
                period: "month",
                year: String(currentYear),
                month: String(currentMonth),
              })
            );
          }}
        >
          This month
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleDownload(buildUrl({ period: "year", year: String(currentYear) }));
          }}
        >
          {currentYear}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

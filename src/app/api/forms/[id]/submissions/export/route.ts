import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getWeek,
} from "date-fns";
import { nb } from "date-fns/locale";

function getDisplayName(
  user: { name: string | null; email: string },
  userTenant: { displayName: string | null } | null
): string {
  const displayName = userTenant?.displayName?.trim() || user.name?.trim();
  return displayName || user.email;
}

function getDateFilter(
  period: string | null,
  year: string | null,
  month: string | null,
  week: string | null
): { from: Date; to: Date } | null {
  const now = new Date();

  if (period === "week" || week) {
    const w = week ? parseInt(week, 10) : getWeek(now, { weekStartsOn: 1, locale: nb });
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const from = startOfWeek(new Date(y, 0, (w - 1) * 7 + 1), {
      weekStartsOn: 1,
      locale: nb,
    });
    const to = endOfWeek(from, { weekStartsOn: 1, locale: nb });
    return { from, to };
  }

  if (period === "month" || month) {
    const m = month ? parseInt(month, 10) - 1 : now.getMonth();
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const from = startOfMonth(new Date(y, m, 1));
    const to = endOfMonth(from);
    return { from, to };
  }

  if (period === "year" || year) {
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const from = startOfYear(new Date(y, 0, 1));
    const to = endOfYear(from);
    return { from, to };
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const week = searchParams.get("week");

    const form = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Skjema ikke funnet" }, { status: 404 });
    }

    const canAccess =
      form.tenantId === session.user.tenantId || form.isGlobal === true;
    if (!canAccess) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    const dateFilter = getDateFilter(period, year, month, week);

    const submissions = await prisma.formSubmission.findMany({
      where: {
        formTemplateId: id,
        tenantId: session.user.tenantId,
        ...(dateFilter && {
          createdAt: {
            gte: dateFilter.from,
            lte: dateFilter.to,
          },
        }),
      },
      include: {
        fieldValues: true,
        submittedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const submittedByIds = [
      ...new Set(
        submissions
          .map((s) => s.submittedById)
          .filter((id): id is string => id != null)
      ),
    ];
    const userTenants = await prisma.userTenant.findMany({
      where: {
        userId: { in: submittedByIds },
        tenantId: session.user.tenantId,
      },
      select: { userId: true, displayName: true },
    });
    const displayNameMap = new Map(
      userTenants.map((ut) => [ut.userId, ut.displayName])
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Svar");

    const baseHeaders = ["Referanse", "Navn", "Dato", "Status"];
    const headers = [...baseHeaders, ...form.fields.map((f) => f.label)];

    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    worksheet.columns = headers.map((header) => ({
      header,
      key: header.replace(/\s/g, "_"),
      width: Math.max(header.length + 2, 15),
    }));

    for (const submission of submissions) {
      const displayName =
        submission.submittedById == null
          ? "Anonym"
          : getDisplayName(submission.submittedBy!, {
              displayName: displayNameMap.get(submission.submittedById) ?? null,
            });

      const row: (string | number)[] = [
        submission.submissionNumber || "",
        displayName,
        new Date(submission.createdAt).toLocaleString("nb-NO"),
        getStatusLabel(submission.status),
      ];

      for (const field of form.fields) {
        const fieldValue = submission.fieldValues.find((fv) => fv.fieldId === field.id);
        if (fieldValue) {
          if (fieldValue.fileKey) {
            row.push(`[Fil: ${fieldValue.fileKey}]`);
          } else {
            row.push(fieldValue.value || "");
          }
        } else {
          row.push("");
        }
      }

      worksheet.addRow(row);
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();

    let filename = form.title.replace(/[^a-z0-9æøå]/gi, "_") + "_svar";
    if (dateFilter) {
      const fromStr = dateFilter.from.toISOString().slice(0, 10);
      const toStr = dateFilter.to.toISOString().slice(0, 10);
      filename += `_${fromStr}_${toStr}`;
    }
    filename += ".xlsx";

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Intern serverfeil" },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Kladd",
    SUBMITTED: "Innsendt",
    APPROVED: "Godkjent",
    REJECTED: "Avvist",
  };
  return labels[status] || status;
}
